/**
 * Experimental Chroma vector database resolver.
 * Stores AIMLA destination content as vectors and retrieves by similarity.
 * Run on experiment/ branch only — not for release.
 */
import { ChromaClient } from "chromadb";
import { pipeline } from "@xenova/transformers";
import { getAllDestinationContent } from "../content/index.js";

const COLLECTION_NAME = "aimla_destinations";
const CONFIDENCE_THRESHOLD = 0.20;

let client;
let collection;
let extractor;

async function initialize() {
  client = new ChromaClient({ path: "http://localhost:8000" });
  extractor = await pipeline("feature-extraction", "Xenova/all-MiniLM-L6-v2");

  collection = await client.getOrCreateCollection({
    name: COLLECTION_NAME,
  });

  const count = await collection.count();
  if (count > 0) {
    console.log("Collection already populated, skipping seed.");
    return;
  }

  const destinations = getAllDestinationContent();
  const ids = destinations.map(d => d.id);
  const documents = destinations.map(d => d.body);

  const output = await extractor(documents, { pooling: "mean", normalize: true });
  const embeddings = output.tolist();

  await collection.add({ ids, documents, embeddings });
  console.log(`Seeded ${ids.length} destinations into Chroma.`);
}

async function findBestMatch(userInput) {
  const output = await extractor([userInput], { pooling: "mean", normalize: true });
  const queryEmbedding = output.tolist()[0];

  const results = await collection.query({
    queryEmbeddings: [queryEmbedding],
    nResults: 1,
  });

  const id = results.ids[0][0];
  const distance = results.distances[0][0];
  const score = 1 - distance;

  return { id, score };
}

export async function resolve(userInput) {
  const { id, score } = await findBestMatch(userInput);

  if (score >= CONFIDENCE_THRESHOLD) {
    return {
      match: id,
      confidence: "high",
      reason: "vector_match",
    };
  } else {
    return {
      match: null,
      confidence: "low",
      reason: "unsupported_request",
      suggestions: ["about", "events", "join"],
    };
  }
}

await initialize();