import React from "react";

import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";

import { TextDecoder } from "util";

import {
  tokenizeForStreaming,
  useResolvedDestination,
} from "./useResolvedDestination";

/**
 * Jest's browser environment may not provide TextDecoder.
 * The streaming hook needs it to decode backend chunks.
 */
if (!global.TextDecoder) {
  global.TextDecoder = TextDecoder;
}

/**
 * Small component used to expose the hook values
 * during testing.
 */
function HookTestComponent() {
  const {
    activeDestinationId,
    fullMessage,
    isStreaming,
    pushDestination,
    sources,
    streamError,
    visibleMessage,
  } = useResolvedDestination();

  return (
    <div>
      <div data-testid="active-destination">
        {activeDestinationId}
      </div>

      <div data-testid="full-message">
        {fullMessage}
      </div>

      <div data-testid="visible-message">
        {visibleMessage}
      </div>

      <div data-testid="is-streaming">
        {String(isStreaming)}
      </div>

      <div data-testid="source-count">
        {sources.length}
      </div>

      <div data-testid="stream-error">
        {streamError}
      </div>

      <button
        type="button"
        onClick={() => {
          pushDestination("events");
        }}
      >
        Events
      </button>
    </div>
  );
}

/**
 * Creates a fake fetch response containing SSE events.
 *
 * Each event is returned as a separate byte chunk,
 * similar to the real backend stream.
 */
function createSseResponse(events) {
  const chunks = events.map((event) => {
    const eventText =
      `data: ${JSON.stringify(event)}\n\n`;

    return Buffer.from(eventText, "utf8");
  });

  let currentChunk = 0;

  return {
    ok: true,
    status: 200,

    body: {
      getReader() {
        return {
          async read() {
            if (currentChunk < chunks.length) {
              const value =
                chunks[currentChunk];

              currentChunk += 1;

              return {
                value,
                done: false,
              };
            }

            return {
              value: undefined,
              done: true,
            };
          },
        };
      },
    },
  };
}

describe(
  "tokenizeForStreaming",
  () => {
    test(
      "preserves spaces, punctuation and line breaks",
      () => {
        expect(
          tokenizeForStreaming(
            "Hello, world!\nNext line."
          )
        ).toEqual([
          "Hello",
          ",",
          " ",
          "world",
          "!",
          "\n",
          "Next",
          " ",
          "line",
          ".",
        ]);
      }
    );

    test(
      "returns an empty array for empty text",
      () => {
        expect(
          tokenizeForStreaming("")
        ).toEqual([]);

        expect(
          tokenizeForStreaming(null)
        ).toEqual([]);
      }
    );
  }
);

describe(
  "useResolvedDestination streaming",
  () => {
    beforeEach(() => {
      global.fetch = jest.fn();
    });

    afterEach(() => {
      jest.clearAllMocks();

      delete global.fetch;
    });

    test(
      "streams the default destination response in order",
      async () => {
        global.fetch.mockResolvedValueOnce(
          createSseResponse([
            {
              type: "sources",

              sources: [
                {
                  id: "about-aimla",

                  title:
                    "About TMU AIMLA",

                  contentType:
                    "about",

                  score: 0.95,
                },
              ],
            },
            {
              type: "text",
              text: "TMU AIMLA ",
            },
            {
              type: "text",
              text:
                "is a student-led association.",
            },
            {
              type: "done",
            },
          ])
        );

        render(
          <HookTestComponent />
        );

        await waitFor(() => {
          expect(
            screen
              .getByTestId(
                "visible-message"
              )
              .textContent
          ).toBe(
            "TMU AIMLA is a student-led association."
          );
        });

        expect(
          screen
            .getByTestId(
              "source-count"
            )
            .textContent
        ).toBe("1");

        expect(
          screen
            .getByTestId(
              "is-streaming"
            )
            .textContent
        ).toBe("false");

        expect(
          screen
            .getByTestId(
              "stream-error"
            )
            .textContent
        ).toBe("");

        expect(
          global.fetch
        ).toHaveBeenCalledTimes(1);

        expect(
          global.fetch
        ).toHaveBeenCalledWith(
          "http://localhost:3001/api/rewrite-message",

          expect.objectContaining({
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            signal:
              expect.any(Object),
          })
        );

        const requestOptions =
          global.fetch.mock.calls[0][1];

        const requestBody =
          JSON.parse(
            requestOptions.body
          );

        expect(
          requestBody.message
        ).toEqual(
          expect.any(String)
        );

        expect(
          requestBody.message.length
        ).toBeGreaterThan(0);

        expect(
          requestBody.fallbackText
        ).toEqual(
          expect.any(String)
        );
      }
    );

    test(
      "resets and streams again when destination changes",
      async () => {
        global.fetch
          .mockResolvedValueOnce(
            createSseResponse([
              {
                type: "sources",
                sources: [],
              },
              {
                type: "text",
                text:
                  "Default AIMLA response.",
              },
              {
                type: "done",
              },
            ])
          )
          .mockResolvedValueOnce(
            createSseResponse([
              {
                type: "sources",

                sources: [
                  {
                    id:
                      "event-workshop",

                    title:
                      "AIMLA Events",

                    contentType:
                      "event",

                    score:
                      0.91,
                  },
                ],
              },
              {
                type: "text",
                text:
                  "AIMLA hosts technical ",
              },
              {
                type: "text",
                text:
                  "workshops and events.",
              },
              {
                type: "done",
              },
            ])
          );

        render(
          <HookTestComponent />
        );

        await waitFor(() => {
          expect(
            screen
              .getByTestId(
                "visible-message"
              )
              .textContent
          ).toBe(
            "Default AIMLA response."
          );
        });

        await act(async () => {
          fireEvent.click(
            screen.getByRole(
              "button",
              {
                name: "Events",
              }
            )
          );
        });

        await waitFor(() => {
          expect(
            screen
              .getByTestId(
                "active-destination"
              )
              .textContent
          ).toBe("events");
        });

        await waitFor(() => {
          expect(
            screen
              .getByTestId(
                "visible-message"
              )
              .textContent
          ).toBe(
            "AIMLA hosts technical workshops and events."
          );
        });

        expect(
          screen
            .getByTestId(
              "source-count"
            )
            .textContent
        ).toBe("1");

        expect(
          global.fetch
        ).toHaveBeenCalledTimes(2);

        const secondRequestOptions =
          global.fetch.mock.calls[1][1];

        const secondRequestBody =
          JSON.parse(
            secondRequestOptions.body
          );

        expect(
          secondRequestBody.message
        ).toEqual(
          expect.any(String)
        );

        expect(
          secondRequestBody.message.length
        ).toBeGreaterThan(0);

        expect(
          secondRequestBody.fallbackText
        ).toContain(
          "AIMLA"
        );
      }
    );

    test(
      "shows fallback content when the backend request fails",
      async () => {
        global.fetch.mockResolvedValueOnce({
          ok: false,
          status: 500,

          async json() {
            return {
              error:
                "Backend request failed.",
            };
          },
        });

        render(
          <HookTestComponent />
        );

        await waitFor(() => {
          expect(
            screen
              .getByTestId(
                "stream-error"
              )
              .textContent
          ).toBe(
            "Backend request failed."
          );
        });

        expect(
          screen
            .getByTestId(
              "visible-message"
            )
            .textContent.length
        ).toBeGreaterThan(0);

        expect(
          screen
            .getByTestId(
              "is-streaming"
            )
            .textContent
        ).toBe("false");
      }
    );
  }
);