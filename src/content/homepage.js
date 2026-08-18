import { NAV_ITEMS, QUICK_PROMPTS } from "../app/routes";
import {
  DESTINATIONS,
  DESTINATION_ORDER,
  DEFAULT_DESTINATION_ID,
  FALLBACK_MESSAGE,
  getDestinationContent,
  getDestinationContentOrDefault,
  normalizeDestinationId,
} from "./index";

/**
 * Topic list used by the homepage UI.
 * This reads only from the content registry.
 * It does not import resolver aliases or matching logic.
 */
export const TOPICS = DESTINATION_ORDER.map((destinationId) => {
  const destination = getDestinationContent(destinationId);

  return {
    ...destination,
    aliases: destination?.aliases || [],
  };
});

export {
  NAV_ITEMS,
  QUICK_PROMPTS,
  FALLBACK_MESSAGE,
  DEFAULT_DESTINATION_ID as DEFAULT_TOPIC_ID,
};

/**
 * Lightweight text normalization for content IDs only.
 * This should not be used for intent matching or resolver logic.
 */
export function normalizeText(value) {
  return normalizeDestinationId(value);
}

/**
 * Extracts a page/topic id from resolver output.
 * The resolver can pass a string or an object.
 *
 * Supported examples:
 * - "events"
 * - { id: "events" }
 * - { pageId: "events" }
 * - { topicId: "events" }
 * - { destinationId: "events" }
 * - { match: "events" }
 */
export function getResolvedTopicId(resolvedDestination) {
  if (!resolvedDestination) {
    return DEFAULT_DESTINATION_ID;
  }

  if (typeof resolvedDestination === "string") {
    return normalizeDestinationId(resolvedDestination);
  }

  return normalizeDestinationId(
    resolvedDestination.pageId ||
      resolvedDestination.topicId ||
      resolvedDestination.destinationId ||
      resolvedDestination.id ||
      resolvedDestination.match ||
      DEFAULT_DESTINATION_ID
  );
}

/**
 * Returns a topic by page/topic id.
 * Falls back safely to the default topic.
 */
export function getTopic(topicId) {
  return getDestinationContentOrDefault(topicId);
}

/**
 * Converts already-resolved destination output into displayable topic content.
 *
 * Important:
 * This does not decide which topic the user meant.
 * It only receives the resolved topic/page id and returns content.
 */
export function resolveTopic(resolvedDestination) {
  const topicId = getResolvedTopicId(resolvedDestination);
  return getTopic(topicId);
}

/**
 * Returns content in a shape that is easy for the streaming hook to consume.
 */
export function getStreamableTopic(resolvedDestination) {
  const topic = resolveTopic(resolvedDestination);

  return {
    id: topic.id,
    title: topic.title,
    subtitle: topic.subtitle || "",
    content: topic.content || "",
  };
}

export { DESTINATIONS as CONTENT_REGISTRY };