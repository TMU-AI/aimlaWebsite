import React from "react";
import { act, fireEvent, render, screen } from "@testing-library/react";

import {
  tokenizeForStreaming,
  useResolvedDestination,
} from "./useResolvedDestination";

function HookTestComponent() {
  const {
    activeDestination,
    fullMessage,
    isStreaming,
    pushDestination,
    visibleMessage,
  } = useResolvedDestination();

  return (
    <div>
      <p data-testid="active-destination">{activeDestination.id}</p>
      <p data-testid="full-message">{fullMessage}</p>
      <p data-testid="visible-message">{visibleMessage}</p>
      <p data-testid="is-streaming">{String(isStreaming)}</p>

      <button type="button" onClick={() => pushDestination("events")}>
        Go to Events
      </button>
    </div>
  );
}

describe("tokenizeForStreaming", () => {
  test("preserves spaces between words", () => {
    const text = "Hello AIMLA team";
    const tokens = tokenizeForStreaming(text);

    expect(tokens.join("")).toBe(text);
  });

  test("preserves punctuation", () => {
    const text = "Hello, AIMLA!";
    const tokens = tokenizeForStreaming(text);

    expect(tokens.join("")).toBe(text);
  });

  test("preserves line breaks", () => {
    const text = "Line one\nLine two";
    const tokens = tokenizeForStreaming(text);

    expect(tokens.join("")).toBe(text);
  });

  test("returns an empty array for empty text", () => {
    expect(tokenizeForStreaming("")).toEqual([]);
    expect(tokenizeForStreaming(null)).toEqual([]);
    expect(tokenizeForStreaming(undefined)).toEqual([]);
  });
});

describe("useResolvedDestination streaming", () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.clearAllTimers();
    jest.useRealTimers();
  });

  test("streams the default destination message in order", () => {
    render(<HookTestComponent />);

    expect(screen.getByTestId("visible-message").textContent).toBe("");
    expect(screen.getByTestId("is-streaming").textContent).toBe("true");

    act(() => {
      jest.runAllTimers();
    });

    expect(screen.getByTestId("visible-message").textContent).toBe(
      screen.getByTestId("full-message").textContent
    );

    expect(screen.getByTestId("is-streaming").textContent).toBe("false");
  });

  test("resets and streams again when destination changes", () => {
    render(<HookTestComponent />);

    act(() => {
      jest.runAllTimers();
    });

    const firstMessage = screen.getByTestId("visible-message").textContent;

    act(() => {
      fireEvent.click(screen.getByText("Go to Events"));
    });

    expect(screen.getByTestId("active-destination").textContent).toBe("events");
    expect(screen.getByTestId("visible-message").textContent).toBe("");

    act(() => {
      jest.runAllTimers();
    });

    expect(screen.getByTestId("visible-message").textContent).toBe(
      screen.getByTestId("full-message").textContent
    );

    expect(screen.getByTestId("visible-message").textContent).not.toBe(
      firstMessage
    );

    expect(screen.getByTestId("is-streaming").textContent).toBe("false");
  });
});