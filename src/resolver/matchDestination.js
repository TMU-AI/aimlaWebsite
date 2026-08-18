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

function tokenize(text) {
  return text.split(" ").filter(Boolean);
}

// Checks whether `needleTokens` appears as a contiguous run of whole words inside
// `haystackTokens`, so short aliases (e.g. "team", "join") only match whole words
// instead of substrings buried inside unrelated words (e.g. "steam", "joint").
function containsTokenSequence(haystackTokens, needleTokens) {
  if (needleTokens.length === 0 || needleTokens.length > haystackTokens.length) {
    return false;
  }

  for (let start = 0; start <= haystackTokens.length - needleTokens.length; start += 1) {
    let matched = true;

    for (let offset = 0; offset < needleTokens.length; offset += 1) {
      if (haystackTokens[start + offset] !== needleTokens[offset]) {
        matched = false;
        break;
      }
    }

    if (matched) {
      return true;
    }
  }

  return false;
}

export function matchDestination(cleanedText) {
  const normalizedQuestion = normalizeInput(cleanedText);

  if (!normalizedQuestion) {
    return buildMatchResult(null, 0, "empty-input", DEFAULT_SUGGESTIONS);
  }

  const questionTokens = tokenize(normalizedQuestion);

  let best = null;

  for (const destinationId of DESTINATION_IDS) {
    const aliases = DESTINATION_ALIASES[destinationId] || [];

    for (const alias of aliases) {
      const normalizedAlias = normalizeInput(alias);

      if (!normalizedAlias) {
        continue;
      }

      const aliasTokens = tokenize(normalizedAlias);

      let confidence;
      let reason;

      if (normalizedQuestion === normalizedAlias) {
        confidence = 1;
        reason = "exact-alias";
      } else if (containsTokenSequence(questionTokens, aliasTokens)) {
        confidence = 0.9;
        reason = "question-includes-alias";
      } else if (containsTokenSequence(aliasTokens, questionTokens)) {
        confidence = 0.7;
        reason = "alias-includes-question";
      } else {
        continue;
      }

      if (!best || confidence > best.confidence) {
        best = { destinationId, confidence, reason };
      }

      if (best.confidence === 1) {
        break;
      }
    }

    if (best && best.confidence === 1) {
      break;
    }
  }

  if (!best) {
    return buildMatchResult(null, 0, "no-match", DEFAULT_SUGGESTIONS);
  }

  return buildMatchResult(best.destinationId, best.confidence, best.reason, [best.destinationId]);
}
