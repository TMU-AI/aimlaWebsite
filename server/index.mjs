import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import OpenAI from "openai";

// Load variables from the root .env file.
dotenv.config();

const app = express();

const PORT = Number(process.env.SERVER_PORT) || 3001;
const CLIENT_ORIGIN =
  process.env.CLIENT_ORIGIN || "http://localhost:3000";
const MODEL = process.env.OPENAI_MODEL || "gpt-5.4-nano";

// Only create the OpenAI client when an API key exists.
// This allows the backend health route to work even if the key is missing.
const openai = process.env.OPENAI_API_KEY
  ? new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    })
  : null;

// Allow the React frontend on port 3000 to call this backend.
app.use(
  cors({
    origin: CLIENT_ORIGIN,
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type"],
  })
);

app.use(
  express.json({
    limit: "20kb",
  })
);

/**
 * Health-check route.
 *
 * Open this in your browser:
 * http://localhost:3001/api/health
 */
app.get("/api/health", (req, res) => {
  res.status(200).json({
    status: "Backend is running",
    port: PORT,
    model: MODEL,
    hasApiKey: Boolean(process.env.OPENAI_API_KEY),
    clientOrigin: CLIENT_ORIGIN,
  });
});

/**
 * Receives the original destination text, asks the LLM to rewrite
 * or summarize it, and returns the completed text as JSON.
 *
 * This endpoint does not stream the OpenAI response.
 * Your existing frontend token streamer will stream the completed text.
 */
app.post("/api/rewrite-message", async (req, res) => {
  try {
    const { text, mode = "rewrite" } = req.body;

    if (!openai) {
      return res.status(500).json({
        error: "OPENAI_API_KEY was not found.",
        details:
          "Add OPENAI_API_KEY to the .env file in the main project folder, then restart the server.",
      });
    }

    if (typeof text !== "string" || text.trim().length === 0) {
      return res.status(400).json({
        error: "A non-empty text message is required.",
      });
    }

    if (!["rewrite", "summarize"].includes(mode)) {
      return res.status(400).json({
        error: 'Mode must be either "rewrite" or "summarize".',
      });
    }

    console.log("\n--- Rewrite request received ---");
    console.log("Mode:", mode);
    console.log("Model:", MODEL);
    console.log("Original text:", text);

    const instructions =
      mode === "summarize"
        ? [
            "Summarize the supplied TMU AIMLA website message.",
            "Keep the central meaning and important details.",
            "Use one or two clear, natural sentences.",
            "Do not add information that is not in the original message.",
            "Return only the finished summary.",
          ].join(" ")
        : [
            "Rewrite the supplied TMU AIMLA website message.",
            "Use noticeably different wording and sentence structure.",
            "Keep the original meaning, friendly tone, and approximate length.",
            "Do not add unrelated or invented information.",
            "Return only the finished rewritten message.",
          ].join(" ");

    const response = await openai.responses.create({
      model: MODEL,
      reasoning: {
        effort: "none",
      },
      instructions,
      input: text.trim(),
      max_output_tokens: 250,
    });

    const rewrittenText = response.output_text?.trim();

    if (!rewrittenText) {
      console.error("The OpenAI response did not contain output text.");

      return res.status(502).json({
        error: "The model returned an empty message.",
      });
    }

    console.log("Rewritten text:", rewrittenText);
    console.log("--- Rewrite completed ---\n");

    return res.status(200).json({
      rewrittenText,
      model: MODEL,
      mode,
    });
  } catch (error) {
    console.error("\n--- OpenAI request failed ---");
    console.error("Status:", error?.status);
    console.error("Message:", error?.message);
    console.error(error);
    console.error("-----------------------------\n");

    return res.status(error?.status || 500).json({
      error: "The message could not be rewritten.",
      details: error?.message || "An unknown backend error occurred.",
    });
  }
});

// Handle requests to routes that do not exist.
app.use((req, res) => {
  res.status(404).json({
    error: "Route not found.",
  });
});

app.listen(PORT, () => {
  console.log("--------------------------------------");
  console.log(`Backend running at http://localhost:${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/api/health`);
  console.log(`Model: ${MODEL}`);
  console.log(
    `API key loaded: ${Boolean(process.env.OPENAI_API_KEY)}`
  );
  console.log("--------------------------------------");
});