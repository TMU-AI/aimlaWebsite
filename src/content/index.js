/**
 * Canonical destination registry.
 * Owns destination modules, validation, and lookup helpers for page content.
 */
import { validateDestinationContent } from "./schema";
import about from "./destinations/about";
import events from "./destinations/events";
import projects from "./destinations/projects";
import members from "./destinations/members";
import join from "./destinations/join";
import contact from "./destinations/contact";

const destinationList = [about, events, projects, members, join, contact].map(validateDestinationContent);

export const DESTINATION_ORDER = Object.freeze(destinationList.map(destination => destination.id));
export const DESTINATIONS = Object.freeze(
  destinationList.reduce((registry, destination) => {
    registry[destination.id] = destination;
    return registry;
  }, {})
);

export const DEFAULT_DESTINATION_ID = about.id;
export const FALLBACK_MESSAGE =
  "I can help with AIMLA, events, projects, members, or joining. Try a topic button or ask a shorter question.";

export function getDestinationContent(destinationId) {
  return DESTINATIONS[destinationId] || null;
}
