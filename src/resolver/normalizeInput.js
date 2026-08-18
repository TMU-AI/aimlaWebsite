/**
 * Normalizes user input for matching.
 * Lowercases, strips punctuation, collapses whitespace,
 * and corrects common typos using Levenshtein distance.
 */

const KNOWN_KEYWORDS = [
  "about", "events", "members", "projects", "contact", "join",
  "event", "member", "project", "team", "club", "workshop",
  "hackathon", "mission", "portfolio", "register", "email"
];

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

function correctTypos(text) {
  return text
    .split(" ")
    .map(word => {
      if (word.length < 3) return word;
      const match = KNOWN_KEYWORDS.find(keyword => {
        const longer = Math.max(word.length, keyword.length);
        return levenshtein(word, keyword) / longer <= 0.25;
      });
      return match || word;
    })
    .join(" ");
}

export function normalizeInput(value) {
  const base = String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  return correctTypos(base);
}