/**
 * App navigation and quick prompt config.
 * Converts canonical destination content into UI-facing nav items.
 *
 * This file should only convert existing destination IDs into UI config.
 * Do not add resolver or matching logic here.
 */
import { getDestinationContent } from "../content";

const NAV_DESTINATION_IDS = ["about", "events", "members", "join"];

export const NAV_ITEMS = NAV_DESTINATION_IDS.map((destinationId) => {
  const destination = getDestinationContent(destinationId);

  if (!destination) {
    throw new Error(`Missing navigation destination content for: ${destinationId}`);
  }

  return {
    id: destination.id,
    label: destination.label,
    title: destination.title,
  };
});

export const QUICK_PROMPTS = [
  {
    label: "What is AIMLA?",
    destinationId: "about",
  },
  {
    label: "What events are upcoming?",
    destinationId: "events",
  },
  {
    label: "What kind of projects can I build?",
    destinationId: "projects",
  },
  {
    label: "Who are the AIMLA members?",
    destinationId: "members",
  },
  {
    label: "How do I join AIMLA?",
    destinationId: "join",
  },
  {
    label: "How can I contact AIMLA?",
    destinationId: "contact",
  },
];