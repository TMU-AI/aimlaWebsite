/**
 * Destination content validation helpers.
 * Ensures every destination has the fields the UI expects.
 *
 * This file should only define the content shape.
 * Do not add resolver, matching, or route-selection logic here.
 */

export const REQUIRED_DESTINATION_FIELDS = Object.freeze([
  "id",
  "label",
  "title",
  "body",
  "suggestedQuery",
]);

export function normalizeDestinationContent(destination) {
  return {
    ...destination,

    // Keep the original body field because your existing UI may already use it.
    body: destination.body,

    // Add content as a streaming-friendly alias.
    // This allows the streaming hook to safely read topic.content.
    content: destination.content || destination.body,

    // Optional fields with safe defaults.
    subtitle: destination.subtitle || "",
    aliases: Array.isArray(destination.aliases) ? destination.aliases : [],
  };
}

export function validateDestinationContent(destination) {
  if (!destination || typeof destination !== "object") {
    throw new Error("Destination content must be an object.");
  }

  REQUIRED_DESTINATION_FIELDS.forEach((field) => {
    if (
      typeof destination[field] !== "string" ||
      destination[field].trim() === ""
    ) {
      throw new Error(`Destination content is missing required field: ${field}`);
    }
  });

  return normalizeDestinationContent(destination);
}