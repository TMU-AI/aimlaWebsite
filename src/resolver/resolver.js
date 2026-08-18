/**
 * Experimental ML-backed resolver prototype.
 * Kept separate from the deterministic MVP resolver used by the app.
 */
import { pipeline } from "@xenova/transformers";

const pages = {
    about: "What is AIMLA. Our mission, vision, purpose, what we do, what the club does, our activities and goals as an AI and machine learning club at TMU. What do you guys do. Tell me about yourselves. Tell me about the club. What is this about.",
    events: "Scheduled events calendar. Upcoming and past workshops, hackathons, speaker sessions, and meetup dates.",
    members: "Meet the team. Who runs the club. Current members, executives, directors, leads, contributors, and people who are part of TMU AIMLA.",
    projects: "What we build. Ongoing and past AI and machine learning projects by AIMLA members.",
    contact: "Get in touch. Reach out to TMU AIMLA with questions or collaboration opportunities.",
    join: "Become a member. Sign up and join TMU AIMLA. Membership, registration, joining the club, getting involved.",
};

const KNOWN_KEYWORDS = [
    "about", "events", "members", "projects", "contact", "join",
    "event", "member", "project", "team", "club"
];

const CONFIDENCE_THRESHOLD = 0.20;

// levenshtein distance — counts how many letter changes needed to turn one word into another
function levenshtein(a, b) {
    const matrix = Array.from({ length: b.length + 1 }, (_, i) => [i]);
    matrix[0] = Array.from({ length: a.length + 1 }, (_, i) => i);

    for (let i = 1; i <= b.length; i++) {
        for (let j = 1; j <= a.length; j++) {
            if (b[i - 1] === a[j - 1]) {
                matrix[i][j] = matrix[i - 1][j - 1];
            } else {
                matrix[i][j] = Math.min(
                    matrix[i - 1][j - 1] + 1,
                    matrix[i][j - 1] + 1,
                    matrix[i - 1][j] + 1
                );
            }
        }
    }
    return matrix[b.length][a.length];
}

// corrects typos in user input before passing to the model
function correctTypos(text) {
    const words = text.split(" ");
    const corrected = words.map(word => {
        const clean = word.replace(/[?.,!]/g, "").toLowerCase();
        const match = KNOWN_KEYWORDS.find(keyword => {
            const longer = Math.max(clean.length, keyword.length);
            const distance = levenshtein(clean, keyword);
            return distance / longer <= 0.25;
        });
        return match || word;
    });
    return corrected.join(" ");
}

// cosine similarity between two vectors
function cosineSimilarity(a, b) {
    const dot = a.reduce((sum, val, i) => sum + val * b[i], 0);
    const magA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
    const magB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));
    return dot / (magA * magB);
}

// load model and pre-compute page embeddings once on startup
let extractor;
let pageEmbeddings;
const pageNames = Object.keys(pages);
const pageDescriptions = Object.values(pages);

async function initialize() {
    extractor = await pipeline("feature-extraction", "Xenova/all-MiniLM-L6-v2");
    const output = await extractor(pageDescriptions, { pooling: "mean", normalize: true });
    pageEmbeddings = output.tolist();
}

// finds the best matching page for a given input
async function findBestMatch(userInput) {
    const corrected = correctTypos(userInput);
    const output = await extractor([corrected], { pooling: "mean", normalize: true });
    const inputEmbedding = output.tolist()[0];

    let bestScore = -1;
    let bestPage = null;

    pageNames.forEach((name, i) => {
        const score = cosineSimilarity(inputEmbedding, pageEmbeddings[i]);
        console.log(`  ${name}: ${score.toFixed(2)}`);
        if (score > bestScore) {
            bestScore = score;
            bestPage = name;
        }
    });

    return { page: bestPage, score: bestScore };
}

// main resolver — returns match or fallback
export async function resolve(userInput) {
    const { page, score } = await findBestMatch(userInput);

    if (score >= CONFIDENCE_THRESHOLD) {
        return {
            match: page,
            confidence: "high",
            reason: "keyword_match"
        };
    } else {
        return {
            match: null,
            confidence: "low",
            reason: "unsupported_request",
            suggestions: ["about", "events", "join"]
        };
    }
}

// initialize on startup
await initialize();
