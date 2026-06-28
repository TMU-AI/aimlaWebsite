/**
 * Destination matcher.
 * Compares normalized user text against the allowlisted alias sets.
 */
import { DESTINATION_ALIASES, DESTINATION_IDS } from "./aliases.js";
import { normalizeInput } from "./normalizeInput.js";

const DEFAULT_SUGGESTIONS = DESTINATION_IDS.slice();

function buildMatchResult(match, confidence, reason, suggestions) {
  return {
    match,
    confidence,
    reason,
    suggestions
  };
}

export function matchDestination(cleanedText) {
  const normalizedQuestion = normalizeInput(cleanedText);

  if (!normalizedQuestion) {
    return buildMatchResult(null, 0, "empty-input", DEFAULT_SUGGESTIONS);
  }

  for (const destinationId of DESTINATION_IDS) {
    const aliases = DESTINATION_ALIASES[destinationId] || [];

    for (const alias of aliases) {
      const normalizedAlias = normalizeInput(alias);

      if (!normalizedAlias) {
        continue;
      }

      if (normalizedQuestion === normalizedAlias) {
        return buildMatchResult(destinationId, 1, "exact-alias", [destinationId]);
      }

      if (normalizedQuestion.includes(normalizedAlias)) {
        return buildMatchResult(destinationId, 0.9, "question-includes-alias", [destinationId]);
      }

      if (normalizedAlias.includes(normalizedQuestion)) {
        return buildMatchResult(destinationId, 0.7, "alias-includes-question", [destinationId]);
      }
    }
  }

  return buildMatchResult(null, 0, "no-match", DEFAULT_SUGGESTIONS);
}
