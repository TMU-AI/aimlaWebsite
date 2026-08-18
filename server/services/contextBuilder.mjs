/**
 * Converts retrieved database records into a clean text
 * block that can be passed to the LLM.
 */
export function buildContext(records) {
  if (!Array.isArray(records) || records.length === 0) {
    return "";
  }

  return records
    .map((record, index) => {
      const metadata = record.metadata || {};

      const metadataLines = [
        metadata.name
          ? `Name: ${metadata.name}`
          : null,

        metadata.role
          ? `Role: ${metadata.role}`
          : null,

        metadata.team
          ? `Team: ${metadata.team}`
          : null,

        metadata.username
          ? `Username: ${metadata.username}`
          : null,

        metadata.linkedin
          ? `LinkedIn: ${metadata.linkedin}`
          : null,

        metadata.url
          ? `URL: ${metadata.url}`
          : null,

        metadata.date
          ? `Date: ${metadata.date}`
          : null,

        metadata.location
          ? `Location: ${metadata.location}`
          : null,
      ].filter(Boolean);

      return [
        `[AIMLA source ${index + 1}]`,
        `Title: ${record.title}`,
        `Content type: ${record.content_type}`,
        `Status: ${record.status}`,
        ...metadataLines,
        `Information: ${record.content}`,
      ].join("\n");
    })
    .join("\n\n");
}

/**
 * Creates a smaller version of the retrieved records.
 *
 * This can be sent to the frontend for debugging or
 * displayed later as answer sources.
 *
 * The full embedding is never sent to the frontend.
 */
export function createSourceSummary(records) {
  if (!Array.isArray(records)) {
    return [];
  }

  return records.map((record) => {
    return {
      id: record.id,

      title: record.title,

      contentType:
        record.content_type,

      status:
        record.status,

      score:
        typeof record.score === "number"
          ? Number(record.score.toFixed(4))
          : null,

      metadata:
        record.metadata || {},
    };
  });
}