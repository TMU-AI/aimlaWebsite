import "dotenv/config";

import { pool } from "../db/pool.mjs";

import {
  retrieveKnowledge,
} from "../services/retrievalService.mjs";

/**
 * Reads the question supplied after the npm command.
 *
 * Example:
 * npm run test:retrieval -- "Who is the VP of Marketing?"
 */
const question =
  process.argv
    .slice(2)
    .join(" ")
    .trim() ||
  "Who is the VP of Marketing?";

/**
 * Displays one retrieved record.
 */
function printRecord(
  record,
  index
) {
  console.log(
    `\nResult ${index + 1}`
  );

  console.log(
    "--------------------------------------"
  );

  console.log(
    "ID:",
    record.id
  );

  console.log(
    "Title:",
    record.title
  );

  console.log(
    "Content type:",
    record.content_type
  );

  console.log(
    "Status:",
    record.status
  );

  console.log(
    "Content:",
    record.content
  );

  console.log(
    "Metadata:",
    record.metadata
  );

  console.log(
    "Match type:",
    record.match_type
  );

  if (
    record.match_type === "hybrid"
  ) {
    console.log(
      "Semantic score:",
      record.semantic_score
    );

    console.log(
      "Keyword score:",
      record.keyword_score
    );

    console.log(
      "Team score:",
      record.team_score
    );

    console.log(
      "Final score:",
      record.score
    );
  } else {
    console.log(
      "Structured metadata match: yes"
    );
  }
}

/**
 * Runs one retrieval test.
 */
async function testRetrieval() {
  try {
    console.log(
      "\n======================================"
    );

    console.log(
      "AIMLA RETRIEVAL TEST"
    );

    console.log(
      "======================================"
    );

    console.log(
      "\nQuestion:"
    );

    console.log(
      question
    );

    const {
      analysis,
      results,
    } = await retrieveKnowledge(
      question
    );

    console.log(
      "\nDetected query information:"
    );

    console.dir(
      analysis,
      {
        depth: null,
      }
    );

    if (
      results.length === 0
    ) {
      console.log(
        "\nNo relevant AIMLA records were found."
      );

      return;
    }

    console.log(
      `\nRetrieved ${results.length} record(s).`
    );

    results.forEach(
      printRecord
    );

    if (
      analysis.isListRequest
    ) {
      console.log(
        "\n======================================"
      );

      console.log(
        "ALL MATCHING RECORDS"
      );

      console.log(
        "======================================"
      );

      results.forEach(
        (record) => {
          const name =
            record.metadata?.name ||
            record.title;

          const role =
            record.metadata?.role ||
            "Member";

          console.log(
            `- ${name} — ${role}`
          );
        }
      );
    } else {
      console.log(
        "\n======================================"
      );

      console.log(
        "TOP RESULT"
      );

      console.log(
        "======================================"
      );

      console.log(
        results[0].content
      );
    }
  } catch (error) {
    console.error(
      "\nRetrieval test failed."
    );

    console.error(
      "Code:",
      error?.code
    );

    console.error(
      "Message:",
      error?.message
    );

    console.error(error);

    process.exitCode = 1;
  } finally {
    await pool.end();
  }
}

testRetrieval();