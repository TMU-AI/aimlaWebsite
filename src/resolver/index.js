/**
 * Resolver public API.
 * Re-exports the matching helpers and exposes the top-level destination resolver.
 */
import { normalizeInput } from "./normalizeInput.js";
import { matchDestination } from "./matchDestination.js";

export { DESTINATION_ALIASES, DESTINATION_IDS } from "./aliases.js";
export { normalizeInput } from "./normalizeInput.js";
export { matchDestination } from "./matchDestination.js";

export function resolveDestination(rawText) {
  return matchDestination(normalizeInput(rawText));
}
