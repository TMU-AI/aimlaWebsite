import { openai } from "./openaiClient.mjs";

const EMBEDDING_MODEL =
  process.env.EMBEDDING_MODEL || "text-embedding-3-small";

const EMBEDDING_DIMENSIONS = Number(
  process.env.EMBEDDING_DIMENSIONS || 1536
);

/**
 * Cleans text before sending it to the embedding model.
 */
function cleanText(text) {
  return String(text ?? "")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Creates one embedding for a user query.
 */
export async function createEmbedding(text) {
  const cleanedText = cleanText(text);

  if (!cleanedText) {
    throw new Error("Cannot create an embedding from empty text.");
  }

  const response = await openai.embeddings.create({
    model: EMBEDDING_MODEL,
    input: cleanedText,
    dimensions: EMBEDDING_DIMENSIONS,
    encoding_format: "float",
  });

  const embedding = response.data[0]?.embedding;

  if (!embedding) {
    throw new Error("OpenAI did not return an embedding.");
  }

  return embedding;
}

/**
 * Creates embeddings for multiple knowledge records at once.
 *
 * This is used when indexing members, events, projects,
 * workshops and other AIMLA information.
 */
export async function createEmbeddings(texts) {
  if (!Array.isArray(texts) || texts.length === 0) {
    throw new Error(
      "createEmbeddings requires a non-empty array of text."
    );
  }

  const cleanedTexts = texts.map(cleanText);

  if (cleanedTexts.some((text) => !text)) {
    throw new Error(
      "Every item must contain text before creating embeddings."
    );
  }

  const response = await openai.embeddings.create({
    model: EMBEDDING_MODEL,
    input: cleanedTexts,
    dimensions: EMBEDDING_DIMENSIONS,
    encoding_format: "float",
  });

  const embeddings = response.data
    .sort((left, right) => left.index - right.index)
    .map((item) => item.embedding);

  if (embeddings.length !== cleanedTexts.length) {
    throw new Error(
      "The number of returned embeddings does not match the input."
    );
  }

  return embeddings;
}