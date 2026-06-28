import { DESTINATION_ALIASES, matchDestination, normalizeInput } from "../resolver";
import { NAV_ITEMS, QUICK_PROMPTS } from "../app/routes";
import {
  DESTINATIONS,
  DESTINATION_ORDER,
  DEFAULT_DESTINATION_ID,
  FALLBACK_MESSAGE,
  getDestinationContent
} from "./index";

export const TOPICS = DESTINATION_ORDER.map(destinationId => ({
  ...getDestinationContent(destinationId),
  aliases: DESTINATION_ALIASES[destinationId] || []
}));

export { NAV_ITEMS, QUICK_PROMPTS, FALLBACK_MESSAGE, DEFAULT_DESTINATION_ID as DEFAULT_TOPIC_ID };

export function normalizeText(value) {
  return normalizeInput(value);
}

export function getTopic(topicId) {
  return getDestinationContent(topicId) || getDestinationContent(DEFAULT_DESTINATION_ID);
}

export function resolveTopic(question) {
  const { match } = matchDestination(question);

  return match ? getTopic(match) : null;
}

export { DESTINATIONS as CONTENT_REGISTRY };
