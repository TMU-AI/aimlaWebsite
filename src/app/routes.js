import { getDestinationContent } from "../content";

const NAV_DESTINATION_IDS = ["about", "events", "members", "join"];

export const NAV_ITEMS = NAV_DESTINATION_IDS.map(destinationId => {
  const destination = getDestinationContent(destinationId);

  return {
    id: destination.id,
    label: destination.label,
    title: destination.title
  };
});

export const QUICK_PROMPTS = [
  { label: "What is AIMLA?", destinationId: "about" },
  { label: "What events are upcoming?", destinationId: "events" },
  { label: "What kind of projects can I build?", destinationId: "projects" },
  { label: "How do I join AIMLA?", destinationId: "join" }
];
