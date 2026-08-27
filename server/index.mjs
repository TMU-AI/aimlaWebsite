import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import OpenAI from "openai";
import { pipeline } from "@xenova/transformers";
import { ChromaClient } from "chromadb";

dotenv.config();

const app = express();

const PORT = Number(process.env.SERVER_PORT) || 3001;
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || "http://localhost:3000";
const MODEL = process.env.OPENAI_MODEL || "gpt-5.4-nano";

const openai = process.env.OPENAI_API_KEY
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null;

app.use(cors({
  origin: CLIENT_ORIGIN,
  methods: ["GET", "POST"],
  allowedHeaders: ["Content-Type"],
}));

app.use(express.json({ limit: "20kb" }));

// ===== VECTOR RESOLVER =====

const DESTINATIONS = {
  about: "TMU AIMLA is a student-led association focused on artificial intelligence, machine learning, and hands-on technical learning. The club helps students explore AI tools, build real projects, attend workshops, and gain confidence with modern technology.",
  events: "AIMLA hosts technical workshops, project sessions, networking events, and beginner-friendly learning opportunities. These events are meant to help students understand AI, machine learning, APIs, coding tools, and real-world development workflows.",
  members: "Meet the people behind AIMLA. The club is run by a team of student executives, project leads, and contributors who organize events, lead projects, and grow the community at TMU.",
  projects: "AIMLA encourages students to build portfolio-ready AI and machine learning applications. Members gain practical experience with software development, automation, and web technologies to prepare for internships and technical interviews.",
  join: "Students can join AIMLA by attending events, participating in workshops, joining project teams, and connecting with the club community. No advanced AI experience is required, so beginners are welcome.",
  contact: "Get in touch with AIMLA. Find our social media channels, email address, and other ways to send us a message or ask questions.",
};

// ===== SPECIFIC FACTS =====
const SPECIFIC_FACTS = {
  members: [
    { id: "members_oliver", text: "Oliver Manuel is the Vice President of TMU AIMLA and Project Lead of the AIMLA website rebuild." },
    { id: "members_antonio", text: "Antonio Souza is the President of TMU AIMLA, responsible for leading the club and overseeing all operations." },
    { id: "members_gab", text: "Gab Talavera is the Infrastructure Associate at AIMLA, responsible for the intent resolver and backend services." },
    { id: "members_derrick", text: "Derrick Lam is an Infrastructure Associate at AIMLA, responsible for frontend implementation and text streaming on the AIMLA website." },
    { id: "members_jeyden", text: "Jeyden Ramesh is an Infrastructure Associate at AIMLA, responsible for website integration, deployment, and DevOps." },
    { id: "members_maryam", text: "Maryam Mehdi is the VP of Marketing at TMU AIMLA, responsible for branding and outreach." },
  ],
  projects: [
    { id: "projects_website", text: "The AIMLA AI-native website uses vector embeddings and semantic intent resolution to navigate users to the right content." },
    { id: "projects_study_planner", text: "AIMLA is building an AI Study Planner using LangChain and LangGraph to automate personalized study planning for students." },
  ],
};

const CONFIDENCE_THRESHOLD = 0.10;

const chromaClient = new ChromaClient({ path: "http://localhost:8000" });
let collection;
let extractor;

async function initializeResolver() {
  extractor = await pipeline("feature-extraction", "Xenova/all-MiniLM-L6-v2");
  collection = await chromaClient.getOrCreateCollection({ 
    name: "aimla_destinations",
    metadata: { "hnsw:space": "cosine" }
  });

  const count = await collection.count();
  if (count > 0) {
    console.log(`Chroma already has ${count} entries, skipping seed.`);
    return;
  }
  const allEntries = [
    ...Object.entries(DESTINATIONS).map(([id, text]) => ({ id, text })),
    ...Object.values(SPECIFIC_FACTS).flat(),
  ];
  const ids = allEntries.map(e => e.id);
  const documents = allEntries.map(e => e.text);
  const output = await extractor(documents, { pooling: "mean", normalize: true });
  const embeddings = output.tolist();
  await collection.add({ ids, documents, embeddings });
  console.log(`Seeded ${ids.length} entries into Chroma.`);
}

initializeResolver().catch(console.error);

// ===== ROUTES =====
app.get("/api/health", (req, res) => {
  res.status(200).json({
    status: "Backend is running",
    port: PORT,
    model: MODEL,
    hasApiKey: Boolean(process.env.OPENAI_API_KEY),
    clientOrigin: CLIENT_ORIGIN,
  });
});

app.post("/api/resolve", async (req, res) => {
  try {
    const { input } = req.body;

    console.log(`\nQuery: "${input}"`);

    if (!input || typeof input !== "string") {
      return res.status(400).json({ error: "A non-empty input string is required." });
    }

    if (!extractor || !collection) {
      return res.status(503).json({ error: "Resolver not ready yet. Try again in a moment." });
    }

    // convert user input to a vector
    const output = await extractor([input], { pooling: "mean", normalize: true });
    const queryEmbedding = output.tolist()[0];

    // ask Chroma for the 3 closest matches
    // Chroma returns distance (lower = closer), not similarity (higher = closer)
    const results = await collection.query({
      queryEmbeddings: [queryEmbedding],
      nResults: 3,
    });

    // log top 3 matches with their similarity scores
    console.log("Top matches:");
    results.ids[0].forEach((id, i) => {
      const similarity = 1 - results.distances[0][i]; // convert distance to similarity
      console.log(`  ${id}: ${similarity.toFixed(2)}`);
    });

    const bestId = results.ids[0][0];
    const bestScore = 1 - results.distances[0][0];

    console.log(`→ matched: ${bestId} (${bestScore.toFixed(2)})\n`);
    const destinationId = bestId.split("_")[0];

    if (bestScore >= CONFIDENCE_THRESHOLD) {
    const matchedDocument = results.documents[0][0];
    return res.status(200).json({
      match: destinationId,
      confidence: "high",
      reason: "vector_match",
      sourceId: bestId,
      matchedText: matchedDocument,
    });
  } else {
    return res.status(200).json({
      match: null,
      confidence: "low",
      reason: "unsupported_request",
      suggestions: ["about", "events", "join"],
    });
  }
  
  } catch (error) {
    console.error("Resolver error:", error);
    return res.status(500).json({ error: "Resolver failed.", details: error.message });
  }
});

app.post("/api/rewrite-message", async (req, res) => {
  try {
    const { text, mode = "rewrite" } = req.body;

    if (!openai) {
      return res.status(500).json({
        error: "OPENAI_API_KEY was not found.",
        details: "Add OPENAI_API_KEY to the .env file in the main project folder, then restart the server.",
      });
    }

    if (typeof text !== "string" || text.trim().length === 0) {
      return res.status(400).json({ error: "A non-empty text message is required." });
    }

    if (!["rewrite", "summarize"].includes(mode)) {
      return res.status(400).json({ error: 'Mode must be either "rewrite" or "summarize".' });
    }

    console.log("\n--- Rewrite request received ---");
    console.log("Mode:", mode);
    console.log("Model:", MODEL);
    console.log("Original text:", text);

    const instructions = mode === "summarize"
      ? ["Summarize the supplied TMU AIMLA website message.", "Keep the central meaning and important details.", "Use one or two clear, natural sentences.", "Do not add information that is not in the original message.", "Return only the finished summary."].join(" ")
      : ["Rewrite the supplied TMU AIMLA website message.", "Use noticeably different wording and sentence structure.", "Keep the original meaning, friendly tone, and approximate length.", "Do not add unrelated or invented information.", "Return only the finished rewritten message."].join(" ");

    const response = await openai.responses.create({
      model: MODEL,
      reasoning: { effort: "none" },
      instructions,
      input: text.trim(),
      max_output_tokens: 250,
    });

    const rewrittenText = response.output_text?.trim();

    if (!rewrittenText) {
      return res.status(502).json({ error: "The model returned an empty message." });
    }

    console.log("Rewritten text:", rewrittenText);
    console.log("--- Rewrite completed ---\n");

    return res.status(200).json({ rewrittenText, model: MODEL, mode });
  } catch (error) {
    console.error("\n--- OpenAI request failed ---");
    console.error("Status:", error?.status);
    console.error("Message:", error?.message);
    console.error("-----------------------------\n");

    return res.status(error?.status || 500).json({
      error: "The message could not be rewritten.",
      details: error?.message || "An unknown backend error occurred.",
    });
  }
});

app.use((req, res) => {
  res.status(404).json({ error: "Route not found." });
});

app.listen(PORT, () => {
  console.log("--------------------------------------");
  console.log(`Backend running at http://localhost:${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/api/health`);
  console.log(`Model: ${MODEL}`);
  console.log(`API key loaded: ${Boolean(process.env.OPENAI_API_KEY)}`);
  console.log("--------------------------------------");
});