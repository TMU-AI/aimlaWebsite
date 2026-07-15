/**
 * Canonical destination registry.
 * Owns destination modules, validation, and lookup helpers for page content.
 *
 * This file should only handle content lookup.
 * Do not add resolver, matching, or intent-selection logic here.
 */
import { validateDestinationContent } from "./schema";
import about from "./destinations/about";
import events from "./destinations/events";
import projects from "./destinations/projects";
import members from "./destinations/members";
import join from "./destinations/join";
import contact from "./destinations/contact";

const destinationList = [
  about,
  events,
  projects,
  members,
  join,
  contact,
].map(validateDestinationContent);

export const DESTINATION_ORDER = Object.freeze(
  destinationList.map((destination) => destination.id)
);

export const DESTINATIONS = Object.freeze(
  destinationList.reduce((registry, destination) => {
    registry[destination.id] = destination;
    return registry;
  }, {})
);

export const DEFAULT_DESTINATION_ID = about.id;

export const FALLBACK_MESSAGE =
  "I can help with AIMLA, events, projects, members, joining, or contact information. Try a topic button or ask a shorter question.";

/**
 * Normalizes a resolved destination/page id before lookup.
 * This is safe here because it only cleans the already-resolved id.
 * It does not decide intent or match user input.
 */
export function normalizeDestinationId(destinationId) {
  return String(destinationId || "")
    .trim()
    .toLowerCase();
}

/**
 * Returns true when the destination id exists in the content registry.
 */
export function hasDestinationContent(destinationId) {
  const normalizedId = normalizeDestinationId(destinationId);
  return Boolean(DESTINATIONS[normalizedId]);
}

/**
 * Returns destination content by resolved destination id.
 * Returns null if the id does not exist.
 */
export function getDestinationContent(destinationId) {
  const normalizedId = normalizeDestinationId(destinationId);
  return DESTINATIONS[normalizedId] || null;
}

/**
 * Returns destination content by resolved destination id.
 * Falls back to the default destination when the id does not exist.
 */
export function getDestinationContentOrDefault(destinationId) {
  return getDestinationContent(destinationId) || DESTINATIONS[DEFAULT_DESTINATION_ID];
}

/**
 * Returns every destination as an array.
 * Useful for rendering topic buttons or debugging content coverage.
 */
export function getAllDestinationContent() {
  return destinationList;
}

/**
 * Returns only the destination ids.
 * Useful for tests and UI button mapping.
 */
export function getDestinationIds() {
  return DESTINATION_ORDER;
}