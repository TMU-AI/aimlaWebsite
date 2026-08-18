import { getDestinationContent } from "../content";
import { matchDestination, normalizeInput } from "./index";


// normalizeInput Tests

test("normalizeInput trims and collapses text", () => {
  expect(normalizeInput("  What   events are upcoming? ")).toBe("what events are upcoming");
});

test("normalizeInput lowercases text", () => {
  expect(normalizeInput("WHAT IS AIMLA")).toBe("what is aimla");
});

test("normalizeInput strips punctuation", () => {
  expect(normalizeInput("events??")).toBe("events");
});

test("normalizeInput handles empty string", () => {
  expect(normalizeInput("")).toBe("");
});

test("normalizeInput handles null", () => {
  expect(normalizeInput(null)).toBe("");
});

// matchDestination Tests

test("matchDestination preserves legacy alias priority", () => {
  const result = matchDestination("What events are upcoming?");
  expect(result.match).toBe("events");
  expect(result.confidence).toBeGreaterThan(0);
  expect(result.reason).toBe("question-includes-alias");
  expect(result.suggestions).toEqual(["events"]);
});

test("matchDestination matches about", () => {
  const result = matchDestination("what is aimla");
  expect(result.match).toBe("about");
  expect(result.confidence).toBeGreaterThan(0);
});

test("matchDestination matches events", () => {
  const result = matchDestination("any upcoming workshops?");
  expect(result.match).toBe("events");
  expect(result.confidence).toBeGreaterThan(0);
});

test("matchDestination matches members", () => {
  const result = matchDestination("who is on the team?");
  expect(result.match).toBe("members");
  expect(result.confidence).toBeGreaterThan(0);
});

test("matchDestination matches projects", () => {
  const result = matchDestination("show me your portfolio");
  expect(result.match).toBe("projects");
  expect(result.confidence).toBeGreaterThan(0);
});

test("matchDestination matches join", () => {
  const result = matchDestination("how do i join?");
  expect(result.match).toBe("join");
  expect(result.confidence).toBeGreaterThan(0);
});

test("matchDestination matches contact", () => {
  const result = matchDestination("how do i contact you?");
  expect(result.match).toBe("contact");
  expect(result.confidence).toBeGreaterThan(0);
});

test("matchDestination returns null for unknown input", () => {
  const result = matchDestination("what is the weather today");
  expect(result.match).toBeNull();
  expect(result.confidence).toBe(0);
  expect(result.reason).toBe("no-match");
  expect(result.suggestions.length).toBeGreaterThan(0);
});

test("matchDestination returns null for empty input", () => {
  const result = matchDestination("");
  expect(result.match).toBeNull();
  expect(result.confidence).toBe(0);
  expect(result.reason).toBe("empty-input");
});

test("matchDestination exact alias returns confidence 1", () => {
  const result = matchDestination("events");
  expect(result.match).toBe("events");
  expect(result.confidence).toBe(1);
  expect(result.reason).toBe("exact-alias");
});

test("matchDestination all caps still matches", () => {
  expect(matchDestination("EVENTS").match).toBe("events");
});

test("matchDestination extra punctuation still matches", () => {
  expect(matchDestination("events???").match).toBe("events");
});

// content Tests

test("getDestinationContent returns registered destination data", () => {
  expect(getDestinationContent("join").title).toBe("Join AIMLA");
  expect(getDestinationContent("missing")).toBeNull();
});
