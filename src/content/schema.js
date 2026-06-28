/**
 * Destination content validation helpers.
 * Ensures every destination has the fields the UI expects.
 */
const REQUIRED_FIELDS = ["id", "label", "title", "body", "suggestedQuery"];

export function validateDestinationContent(destination) {
  if (!destination || typeof destination !== "object") {
    throw new Error("Destination content must be an object.");
  }

  REQUIRED_FIELDS.forEach(field => {
    if (typeof destination[field] !== "string" || destination[field].trim() === "") {
      throw new Error(`Destination content is missing required field: ${field}`);
    }
  });

  return destination;
}
