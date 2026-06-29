import { getDestinationContent } from "../content";
import { matchDestination, normalizeInput } from "./index";

test("normalizeInput trims and collapses text", () => {
  expect(normalizeInput("  What   events are upcoming? ")).toBe("what events are upcoming");
});

test("matchDestination preserves legacy alias priority", () => {
  const result = matchDestination("What events are upcoming?");
  expect(result.match).toBe("events");
  expect(result.confidence).toBeGreaterThan(0);
  expect(result.reason).toBe("question-includes-alias");
  expect(result.suggestions).toEqual(["events"]);
});

test("getDestinationContent returns registered destination data", () => {
  expect(getDestinationContent("join").title).toBe("Join AIMLA");
  expect(getDestinationContent("missing")).toBeNull();
});
