import {
  DEFAULT_DESTINATION_ID,
  getDestinationContent,
  getDestinationContentOrDefault,
  hasDestinationContent,
  normalizeDestinationId,
} from "./index";

describe("destination content lookup", () => {
  test("normalizes destination ids", () => {
    expect(normalizeDestinationId("  ABOUT  ")).toBe("about");
  });

  test("returns expected content for a valid page id", () => {
    const about = getDestinationContent("about");

    expect(about).not.toBeNull();
    expect(about.id).toBe("about");
    expect(about.title).toBe("About TMU AIMLA");
  });

  test("returns null for unknown page id with getDestinationContent", () => {
    expect(getDestinationContent("fake-page")).toBeNull();
  });

  test("falls back to default content with getDestinationContentOrDefault", () => {
    const fallback = getDestinationContentOrDefault("fake-page");

    expect(fallback).not.toBeNull();
    expect(fallback.id).toBe(DEFAULT_DESTINATION_ID);
  });

  test("checks whether destination content exists", () => {
    expect(hasDestinationContent("events")).toBe(true);
    expect(hasDestinationContent("fake-page")).toBe(false);
  });
});