import "dotenv/config";

import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import pgvector from "pgvector/pg";

import { pool } from "../db/pool.mjs";
import {
  createEmbeddings,
} from "../services/embeddingService.mjs";

/**
 * Finds the absolute path of the knowledge folder.
 */
const currentFile = fileURLToPath(import.meta.url);
const currentDirectory = path.dirname(currentFile);

const knowledgeDirectory = path.resolve(
  currentDirectory,
  "../knowledge"
);

/**
 * Checks that every knowledge record contains the required fields.
 */
function validateRecord(record, filename) {
  const requiredFields = [
    "id",
    "contentType",
    "title",
    "content",
  ];

  for (const field of requiredFields) {
    if (
      typeof record[field] !== "string" ||
      !record[field].trim()
    ) {
      throw new Error(
        `${filename}: record is missing the required "${field}" field.`
      );
    }
  }

  const metadata =
    record.metadata &&
    typeof record.metadata === "object" &&
    !Array.isArray(record.metadata)
      ? record.metadata
      : {};

  return {
    id: record.id.trim(),
    contentType: record.contentType.trim(),
    title: record.title.trim(),
    content: record.content.trim(),
    status: String(
      record.status || "current"
    ).trim(),
    metadata,
  };
}

/**
 * Reads every JSON file inside server/knowledge.
 *
 * This allows us to later add:
 * members.json
 * events.json
 * projects.json
 * faqs.json
 * join.json
 */
async function loadKnowledgeRecords() {
  const filenames = await fs.readdir(
    knowledgeDirectory
  );

  const jsonFiles = filenames.filter((filename) =>
    filename.toLowerCase().endsWith(".json")
  );

  if (jsonFiles.length === 0) {
    throw new Error(
      "No JSON files were found inside server/knowledge."
    );
  }

  const allRecords = [];

  for (const filename of jsonFiles) {
    const filePath = path.join(
      knowledgeDirectory,
      filename
    );

    const rawFile = await fs.readFile(
      filePath,
      "utf8"
    );

    const parsedFile = JSON.parse(rawFile);

    if (!Array.isArray(parsedFile)) {
      throw new Error(
        `${filename} must contain a JSON array.`
      );
    }

    for (const record of parsedFile) {
      const validatedRecord = validateRecord(
        record,
        filename
      );

      allRecords.push(validatedRecord);
    }
  }

  return allRecords;
}

/**
 * Combines the important record fields into one string.
 *
 * This complete string is sent to the embedding model.
 * Metadata is included so searches can understand names,
 * roles, teams, usernames and other structured details.
 */
function createEmbeddingText(record) {
  const metadataText = Object.entries(
    record.metadata
  )
    .filter(([, value]) => {
      return value !== null && value !== undefined;
    })
    .map(([key, value]) => {
      return `${key}: ${String(value)}`;
    })
    .join(". ");

  return [
    record.title,
    record.content,
    metadataText,
    `content type: ${record.contentType}`,
    `status: ${record.status}`,
  ]
    .filter(Boolean)
    .join("\n");
}

/**
 * Inserts a new record or updates an existing record.
 *
 * Because the record ID is the primary key, running this
 * script again updates changed members instead of creating
 * duplicate copies.
 */
async function upsertRecord(
  client,
  record,
  embedding
) {
  const embeddingSql = pgvector.toSql(
    embedding
  );

  await client.query(
    `
      INSERT INTO knowledge_records (
        id,
        content_type,
        title,
        content,
        metadata,
        status,
        embedding,
        updated_at
      )
      VALUES (
        $1,
        $2,
        $3,
        $4,
        $5::jsonb,
        $6,
        $7::vector,
        NOW()
      )
      ON CONFLICT (id)
      DO UPDATE SET
        content_type = EXCLUDED.content_type,
        title = EXCLUDED.title,
        content = EXCLUDED.content,
        metadata = EXCLUDED.metadata,
        status = EXCLUDED.status,
        embedding = EXCLUDED.embedding,
        updated_at = NOW()
    `,
    [
      record.id,
      record.contentType,
      record.title,
      record.content,
      JSON.stringify(record.metadata),
      record.status,
      embeddingSql,
    ]
  );
}

/**
 * Main indexing process.
 */
async function indexKnowledge() {
  console.log(
    "Reading AIMLA knowledge files..."
  );

  const records =
    await loadKnowledgeRecords();

  if (records.length === 0) {
    throw new Error(
      "No AIMLA knowledge records were found."
    );
  }

  console.log(
    `Found ${records.length} knowledge records.`
  );

  const embeddingTexts = records.map(
    createEmbeddingText
  );

  console.log(
    "Creating embeddings with OpenAI..."
  );

  const embeddings =
    await createEmbeddings(embeddingTexts);

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    for (
      let index = 0;
      index < records.length;
      index += 1
    ) {
      const record = records[index];
      const embedding = embeddings[index];

      await upsertRecord(
        client,
        record,
        embedding
      );

      console.log(
        `Indexed ${index + 1}/${records.length}: ${record.id}`
      );
    }

    await client.query("COMMIT");

    console.log(
      "AIMLA knowledge indexing completed successfully."
    );
  } catch (error) {
    await client.query("ROLLBACK");

    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

indexKnowledge().catch((error) => {
  console.error(
    "Knowledge indexing failed:",
    error
  );

  process.exitCode = 1;
});