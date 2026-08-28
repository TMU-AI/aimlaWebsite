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
// Members merged from this branch's original 6-person list and Derrick's
// server/knowledge/members.json (release/2.1.0). Reconciled per team decision:
//   - Oliver Manuel's title is "VP of Infrastructure" (Derrick's per-department
//     VP structure), not the club-wide "Vice President" this branch used before.
//   - Infrastructure team members (you, Derrick, Jeyden, Skye, Walker) use the
//     title "Infrastructure Member", matching Derrick's naming convention.
//   - Former members (e.g. Jermain Antillon, ex-VP of Marketing) are excluded —
//     only current members should surface when someone asks "who are the members".
// Each members fact carries a `team` tag (matching Derrick's members.json
// department field). This lets a query that names a team explicitly (e.g.
// "who are the infrastructure members") filter by that exact tag instead of
// relying only on vector-score clustering — see MEMBER_TEAM_BY_ID and
// detectMentionedTeam() below for why that matters.
const SPECIFIC_FACTS = {
  members: [
    // Executive
    { id: "members_antonio", team: "Executive", text: "Antonio Souza is the President of TMU AIMLA, responsible for leading the club and overseeing all operations." },
    // Events
    { id: "members_areej", team: "Events", text: "Areej Ubaid is a VP of Events for TMU AIMLA and helps lead the Events department." },
    { id: "members_jarin", team: "Events", text: "Jarin Yasmin Mim is a VP of Events for TMU AIMLA and helps lead the Events department." },
    // Finances
    { id: "members_seif", team: "Finances", text: "Seif Eltamboly is the VP of Finance for TMU AIMLA and leads the Finances department." },
    // Marketing
    { id: "members_maryam", team: "Marketing", text: "Maryam Mehdi is the VP of Marketing for TMU AIMLA and leads the Marketing department." },
    { id: "members_joel", team: "Marketing", text: "Joel Oguachuba is a member of the TMU AIMLA Marketing department." },
    { id: "members_shriya", team: "Marketing", text: "Shriya Gill is a member of the TMU AIMLA Marketing department." },
    { id: "members_lana", team: "Marketing", text: "Lana Duong is a member of the TMU AIMLA Marketing department." },
    // Infrastructure
    { id: "members_oliver", team: "Infrastructure", text: "Oliver Manuel is the VP of Infrastructure for TMU AIMLA and leads the Infrastructure department." },
    { id: "members_gab", team: "Infrastructure", text: "Gab Talavera is an Infrastructure Member at TMU AIMLA, responsible for the intent resolver and backend services." },
    { id: "members_derrick", team: "Infrastructure", text: "Derrick Lam is an Infrastructure Member at TMU AIMLA, responsible for frontend implementation and text streaming on the AIMLA website." },
    { id: "members_jeyden", team: "Infrastructure", text: "Jeyden Ramesh is an Infrastructure Member at TMU AIMLA, responsible for website integration, deployment, and DevOps." },
    { id: "members_skye", team: "Infrastructure", text: "Skye is a member of the TMU AIMLA Infrastructure department." },
    { id: "members_walker", team: "Infrastructure", text: "Walker Egsgard is a member of the TMU AIMLA Infrastructure department." },
    // Outreach
    { id: "members_jenison", team: "Outreach", text: "Jenison Joseph is the VP of Outreach for TMU AIMLA and leads the Outreach department." },
    { id: "members_ronald", team: "Outreach", text: "Ronald Bessada is a member of the TMU AIMLA Outreach department." },
    // Social Media
    { id: "members_christina", team: "Social Media", text: "Christina Vanni is a VP of Social Media for TMU AIMLA and helps lead the Social Media department." },
    { id: "members_zulaikha", team: "Social Media", text: "Zulaikha Khoram is a VP of Social Media for TMU AIMLA and helps lead the Social Media department." },
    // Education
    { id: "members_belal", team: "Education", text: "Belal Armanazi is the VP of Education for TMU AIMLA and leads the Education department." },
    { id: "members_nousha", team: "Education", text: "Nousha Borhani is a member of the TMU AIMLA Education department." },
    // General Members
    { id: "members_malaika", team: "General Members", text: "Malaika Ali is a general member of TMU AIMLA." },
  ],
  projects: [
    { id: "projects_website", text: "The AIMLA AI-native website uses vector embeddings and semantic intent resolution to navigate users to the right content." },
    { id: "projects_study_planner", text: "AIMLA is building an AI Study Planner using LangChain and LangGraph to automate personalized study planning for students." },
  ],
};

// id -> team lookup, built once from SPECIFIC_FACTS.members, so /api/resolve can filter
// Chroma's results (which only carry {id, text, score}) by exact department membership.
const MEMBER_TEAM_BY_ID = new Map(
  SPECIFIC_FACTS.members.map((fact) => [fact.id, fact.team])
);

// Deterministic team-name detection. Vector similarity alone isn't reliable for "does
// this person belong to team X" — e.g. "Gab ... responsible for the intent resolver and
// backend services" scored notably lower than "Jeyden ... website integration,
// deployment, and DevOps" even though both are Infrastructure, just because of word
// choice. When the query explicitly names a team, prefer that exact tag over score
// clustering so real teammates never get dropped due to embedding noise.
const TEAM_KEYWORDS = [
  { team: "Infrastructure", pattern: /\binfrastructure\b/i },
  { team: "Marketing", pattern: /\bmarketing\b/i },
  { team: "Events", pattern: /\bevents?\b/i },
  { team: "Finances", pattern: /\bfinance(s)?\b/i },
  { team: "Outreach", pattern: /\boutreach\b/i },
  { team: "Social Media", pattern: /\bsocial media\b/i },
  { team: "Education", pattern: /\beducation\b/i },
  { team: "Executive", pattern: /\bexecutive\b/i },
  { team: "General Members", pattern: /\bgeneral members?\b/i },
];

function detectMentionedTeam(query) {
  const found = TEAM_KEYWORDS.find(({ pattern }) => pattern.test(query));
  return found ? found.team : null;
}

const CONFIDENCE_THRESHOLD = 0.10;

// How close (in cosine-similarity units) a specific fact's score needs to be to the
// best-scoring fact in its destination before we treat it as "also relevant" and fold
// it into a combined, multi-fact response instead of returning just the single top hit.
// Broad phrasing ("who are the members") widens this margin so more facts qualify;
// narrow phrasing ("who is gab") keeps it tight so only the true match comes back.
const MULTI_MATCH_MARGIN = 0.08;
const BROAD_MULTI_MATCH_MARGIN = 0.14;

// Loose "asking about a group" phrasing. This only widens the margin above — it never
// decides by itself whether to combine results. The actual decision is driven by how
// tightly the vector scores for that destination's facts cluster near the top score.
const BROAD_QUERY_PATTERN =
  /\b(who are|which (people|members|projects|associates)|list|show (me|all)|all (the|of)|everyone|every one|full list|entire team)\b/i;

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

    // Ask Chroma for scores against the whole corpus (it's still small — under 40 entries)
    // so we can see every specific fact under the winning destination, not just the top 3.
    // This must cover the FULL corpus (no arbitrary cap): capping below corpusSize risks
    // silently dropping some of a destination's facts from a broad query's results — e.g.
    // members alone is now 20+ entries, so a low cap could cut off legitimate matches.
    // Chroma returns distance (lower = closer), not similarity (higher = closer).
    const corpusSize = await collection.count();
    const results = await collection.query({
      queryEmbeddings: [queryEmbedding],
      nResults: Math.max(1, corpusSize),
    });

    const scored = results.ids[0].map((id, i) => ({
      id,
      text: results.documents[0][i],
      score: 1 - results.distances[0][i], // convert distance to similarity
    }));

    // log every candidate's similarity score
    console.log("Candidate matches:");
    scored.forEach(({ id, score }) => console.log(`  ${id}: ${score.toFixed(2)}`));

    const best = scored[0];
    console.log(`→ top match: ${best.id} (${best.score.toFixed(2)})\n`);

    if (best.score < CONFIDENCE_THRESHOLD) {
      return res.status(200).json({
        match: null,
        confidence: "low",
        reason: "unsupported_request",
        suggestions: ["about", "events", "join"],
      });
    }

    const destinationId = best.id.split("_")[0];

    // If the query names a specific team (e.g. "who are the infrastructure members"),
    // trust that exact tag over vector-score clustering. This is what saves teammates
    // like Gab from getting dropped just because their fact's wording happens to sit a
    // little further from the score cluster in embedding space — team membership here
    // is a known fact (from SPECIFIC_FACTS), not something we need to infer from scores.
    if (destinationId === "members") {
      const mentionedTeam = detectMentionedTeam(input);

      if (mentionedTeam) {
        const teamFacts = scored.filter(
          (r) => MEMBER_TEAM_BY_ID.get(r.id) === mentionedTeam && r.score >= CONFIDENCE_THRESHOLD
        );

        if (teamFacts.length > 0) {
          console.log(
            `→ team keyword "${mentionedTeam}" matched ${teamFacts.length} fact(s): ${teamFacts
              .map((f) => f.id)
              .join(", ")}\n`
          );

          return res.status(200).json({
            match: destinationId,
            confidence: "high",
            reason: teamFacts.length > 1 ? "vector_match_multi" : "vector_match",
            sourceId: teamFacts.map((f) => f.id).join(","),
            matchedText: teamFacts[0].text,
            matches: teamFacts.map((f) => ({
              sourceId: f.id,
              text: f.text,
              score: Number(f.score.toFixed(3)),
            })),
          });
        }
      }
    }

    // Gather every specific fact filed under the winning destination (e.g. "members_*")
    // and see how tightly their scores cluster near the best one of that group. A tight
    // cluster means the query is asking about several of them at once (e.g. "who are the
    // members" or "who are the infrastructure associates"); a lone standout means the
    // query is about one specific thing (e.g. "who is gab").
    const destinationFacts = scored.filter((r) => r.id.startsWith(`${destinationId}_`));
    const topFactScore = destinationFacts[0]?.score ?? best.score;
    const isBroadPhrasing = BROAD_QUERY_PATTERN.test(input);
    const margin = isBroadPhrasing ? BROAD_MULTI_MATCH_MARGIN : MULTI_MATCH_MARGIN;

    const clusteredFacts = destinationFacts.filter(
      (r) => r.score >= CONFIDENCE_THRESHOLD && r.score >= topFactScore - margin
    );

    if (clusteredFacts.length >= 2) {
      console.log(
        `→ combining ${clusteredFacts.length} facts for "${destinationId}": ${clusteredFacts
          .map((f) => f.id)
          .join(", ")}\n`
      );

      return res.status(200).json({
        match: destinationId,
        confidence: "high",
        reason: "vector_match_multi",
        sourceId: clusteredFacts.map((f) => f.id).join(","),
        matchedText: clusteredFacts[0].text,
        matches: clusteredFacts.map((f) => ({
          sourceId: f.id,
          text: f.text,
          score: Number(f.score.toFixed(3)),
        })),
      });
    }

    return res.status(200).json({
      match: destinationId,
      confidence: "high",
      reason: "vector_match",
      sourceId: best.id,
      matchedText: best.text,
      matches: [{ sourceId: best.id, text: best.text, score: Number(best.score.toFixed(3)) }],
    });
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