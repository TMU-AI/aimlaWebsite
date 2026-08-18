/**
 * Destination resolution and streamed RAG response hook.
 *
 * Responsibilities:
 * - Handles the chatbot input.
 * - Resolves static destinations for fallback content.
 * - Sends the user's real question to the backend.
 * - Reads streamed Server-Sent Events from the backend.
 * - Displays OpenAI text as it arrives.
 * - Removes Markdown formatting from displayed responses.
 */

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  DEFAULT_DESTINATION_ID,
  FALLBACK_MESSAGE,
  getDestinationContent,
  getDestinationContentOrDefault,
} from "../content";

import {
  resolveDestination,
} from "../resolver";

const DEFAULT_DESTINATION =
  getDestinationContentOrDefault(
    DEFAULT_DESTINATION_ID
  );

const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL ||
  "http://localhost:3001";

/**
 * Controls how quickly streamed text is revealed in the UI.
 *
 * The backend/OpenAI stream is still read at full speed.
 * Only the visual display is slowed down.
 */
const DISPLAY_INTERVAL_MS = 18;
const CHARS_PER_TICK = 1;

/**
 * Removes Markdown formatting that should not appear
 * as visible text inside the chatbot.
 */
function removeMarkdownFormatting(text) {
  return String(text ?? "")
    .replace(/\*\*/g, "")
    .replace(/__/g, "");
}

/**
 * Kept for compatibility with existing tests.
 */
export function tokenizeForStreaming(text) {
  if (!text) {
    return [];
  }

  return (
    String(text).match(
      /\n+|[^\S\n]+|[\w'-]+|[^\s]/g
    ) || []
  );
}

/**
 * Returns the main static message stored in a destination.
 */
function getDestinationMessage(destination) {
  return (
    destination?.content ||
    destination?.body ||
    ""
  );
}

/**
 * Converts one Server-Sent Events block into JSON.
 */
function parseSseEvent(rawEvent) {
  const data = rawEvent
    .split(/\r?\n/)
    .filter((line) => {
      return line.startsWith("data:");
    })
    .map((line) => {
      return line
        .slice(5)
        .trimStart();
    })
    .join("\n");

  if (!data) {
    return null;
  }

  try {
    return JSON.parse(data);
  } catch (error) {
    console.error(
      "Could not parse streamed backend event:",
      data,
      error
    );

    return null;
  }
}

/**
 * Reads the backend response stream.
 */
async function readResponseStream({
  response,
  onText,
  onSources,
  onDone,
}) {
  if (!response.body) {
    throw new Error(
      "The browser did not provide a readable response stream."
    );
  }

  const reader =
    response.body.getReader();

  const decoder =
    new TextDecoder("utf-8");

  let buffer = "";

  const processBuffer = (
    includeFinalBlock = false
  ) => {
    const eventBlocks =
      buffer.split(/\r?\n\r?\n/);

    if (!includeFinalBlock) {
      buffer =
        eventBlocks.pop() || "";
    } else {
      buffer = "";
    }

    for (
      const rawEvent of eventBlocks
    ) {
      if (!rawEvent.trim()) {
        continue;
      }

      const event =
        parseSseEvent(rawEvent);

      if (!event) {
        continue;
      }

      if (
        event.type === "text"
      ) {
        onText?.(
          String(event.text || "")
        );
      }

      if (
        event.type === "sources"
      ) {
        onSources?.(
          Array.isArray(event.sources)
            ? event.sources
            : []
        );
      }

      if (
        event.type === "done"
      ) {
        onDone?.();
      }

      if (
        event.type === "error"
      ) {
        throw new Error(
          event.message ||
          "The streamed response failed."
        );
      }
    }
  };

  while (true) {
    const {
      value,
      done,
    } = await reader.read();

    if (value) {
      buffer += decoder.decode(
        value,
        {
          stream: !done,
        }
      );
    }

    processBuffer(false);

    if (done) {
      break;
    }
  }

  buffer += decoder.decode();

  if (buffer.trim()) {
    buffer += "\n\n";
    processBuffer(true);
  }
}

export function useResolvedDestination() {
  const [
    activeDestinationId,
    setActiveDestinationId,
  ] = useState(
    DEFAULT_DESTINATION_ID
  );

  const [
    inputValue,
    setInputValue,
  ] = useState("");

  const [
    suggestedQuery,
    setSuggestedQuery,
  ] = useState(
    DEFAULT_DESTINATION.suggestedQuery
  );

  const [
    fullMessage,
    setFullMessage,
  ] = useState(
    getDestinationMessage(
      DEFAULT_DESTINATION
    )
  );

  const [
    requestMessage,
    setRequestMessage,
  ] = useState(
    DEFAULT_DESTINATION.suggestedQuery ||
    "Tell me about TMU AIMLA."
  );

  const [
    visibleMessage,
    setVisibleMessage,
  ] = useState("");

  const [
    isStreaming,
    setIsStreaming,
  ] = useState(true);

  const [
    sources,
    setSources,
  ] = useState([]);

  const [
    streamError,
    setStreamError,
  ] = useState("");

  const [
    streamKey,
    setStreamKey,
  ] = useState(0);

  const requestControllerRef =
    useRef(null);

  /**
   * Stores the complete raw OpenAI response.
   */
  const streamedRawTextRef =
    useRef("");

  /**
   * Tracks how many characters are currently shown.
   */
  const displayedCharacterCountRef =
    useRef(0);

  /**
   * Timer used to reveal characters gradually.
   */
  const displayTimerRef =
    useRef(null);

  /**
   * Tracks when the backend SSE response is finished.
   */
  const backendStreamDoneRef =
    useRef(false);

  const activeDestination =
    useMemo(
      () => {
        return (
          getDestinationContent(
            activeDestinationId
          ) ||
          DEFAULT_DESTINATION
        );
      },
      [activeDestinationId]
    );

  useEffect(() => {
    const controller =
      new AbortController();

    requestControllerRef.current?.abort();
    requestControllerRef.current =
      controller;

    if (displayTimerRef.current) {
      clearInterval(
        displayTimerRef.current
      );

      displayTimerRef.current =
        null;
    }

    let cancelled = false;
    let receivedText = false;

    streamedRawTextRef.current = "";
    displayedCharacterCountRef.current = 0;
    backendStreamDoneRef.current = false;

    /**
     * Reveals buffered text gradually.
     */
    const startDisplayTimer = () => {
      if (displayTimerRef.current) {
        return;
      }

      displayTimerRef.current =
        setInterval(() => {
          if (cancelled) {
            return;
          }

          const cleanedText =
            removeMarkdownFormatting(
              streamedRawTextRef.current
            );

          const currentCount =
            displayedCharacterCountRef.current;

          if (
            currentCount <
            cleanedText.length
          ) {
            const nextCount =
              Math.min(
                currentCount +
                  CHARS_PER_TICK,
                cleanedText.length
              );

            displayedCharacterCountRef.current =
              nextCount;

            setVisibleMessage(
              cleanedText.slice(
                0,
                nextCount
              )
            );
          }

          /**
           * Only stop "streaming" once both:
           * 1. Backend is finished
           * 2. All buffered text has appeared
           */
          if (
            backendStreamDoneRef.current &&
            displayedCharacterCountRef.current >=
              cleanedText.length
          ) {
            clearInterval(
              displayTimerRef.current
            );

            displayTimerRef.current =
              null;

            setIsStreaming(false);
          }
        }, DISPLAY_INTERVAL_MS);
    };

    async function streamMessage() {
      setVisibleMessage("");
      setSources([]);
      setStreamError("");
      setIsStreaming(true);

      startDisplayTimer();

      try {
        const response =
          await fetch(
            `${API_BASE_URL}/api/rewrite-message`,
            {
              method: "POST",

              headers: {
                "Content-Type":
                  "application/json",
              },

              body: JSON.stringify({
                message:
                  requestMessage,

                fallbackText:
                  fullMessage,
              }),

              signal:
                controller.signal,
            }
          );

        if (!response.ok) {
          const errorBody =
            await response
              .json()
              .catch(() => ({}));

          throw new Error(
            errorBody.error ||
            errorBody.details ||
            `Backend request failed with status ${response.status}.`
          );
        }

        await readResponseStream({
          response,

          onText: (text) => {
            if (
              cancelled ||
              !text
            ) {
              return;
            }

            receivedText = true;

            /**
             * Buffer text instead of showing it instantly.
             */
            streamedRawTextRef.current +=
              text;
          },

          onSources: (
            retrievedSources
          ) => {
            if (!cancelled) {
              setSources(
                retrievedSources
              );
            }
          },

          onDone: () => {
            if (!cancelled) {
              backendStreamDoneRef.current =
                true;
            }
          },
        });

        if (cancelled) {
          return;
        }

        backendStreamDoneRef.current =
          true;

        /**
         * If backend returns no text, show fallback.
         */
        if (!receivedText) {
          if (displayTimerRef.current) {
            clearInterval(
              displayTimerRef.current
            );

            displayTimerRef.current =
              null;
          }

          setVisibleMessage(
            removeMarkdownFormatting(
              fullMessage ||
              FALLBACK_MESSAGE
            )
          );

          setIsStreaming(false);
        }
      } catch (error) {
        if (
          error.name ===
          "AbortError"
        ) {
          return;
        }

        console.error(
          "AIMLA streaming request failed:",
          error
        );

        if (!cancelled) {
          if (displayTimerRef.current) {
            clearInterval(
              displayTimerRef.current
            );

            displayTimerRef.current =
              null;
          }

          backendStreamDoneRef.current =
            true;

          setStreamError(
            error.message
          );

          setVisibleMessage(
            removeMarkdownFormatting(
              fullMessage ||
              FALLBACK_MESSAGE
            )
          );

          setIsStreaming(false);
        }
      }
    }

    streamMessage();

    return () => {
      cancelled = true;
      controller.abort();

      if (displayTimerRef.current) {
        clearInterval(
          displayTimerRef.current
        );

        displayTimerRef.current =
          null;
      }

      if (
        requestControllerRef.current ===
        controller
      ) {
        requestControllerRef.current =
          null;
      }
    };
  }, [
    fullMessage,
    requestMessage,
    streamKey,
  ]);

  const pushDestination =
    useCallback(
      (
        destinationId,
        customQuery = ""
      ) => {
        const destination =
          getDestinationContentOrDefault(
            destinationId
          );

        const nextQuery =
          String(
            customQuery ||
            destination.suggestedQuery ||
            destination.label ||
            destination.title ||
            "Tell me about TMU AIMLA."
          ).trim();

        setActiveDestinationId(
          destination.id
        );

        setSuggestedQuery(
          destination.suggestedQuery
        );

        setFullMessage(
          getDestinationMessage(
            destination
          )
        );

        setRequestMessage(
          nextQuery
        );

        setStreamKey(
          (value) => value + 1
        );
      },
      []
    );

  const pushFallbackMessage =
    useCallback(
      (customQuery) => {
        setActiveDestinationId(
          DEFAULT_DESTINATION_ID
        );

        setSuggestedQuery(
          DEFAULT_DESTINATION.suggestedQuery
        );

        setFullMessage(
          FALLBACK_MESSAGE
        );

        setRequestMessage(
          String(
            customQuery ||
            "Tell me about TMU AIMLA."
          ).trim()
        );

        setStreamKey(
          (value) => value + 1
        );
      },
      []
    );

  const handleSubmit =
    useCallback(
      (event) => {
        event.preventDefault();

        const submittedQuery =
          inputValue.trim();

        if (!submittedQuery) {
          return;
        }

        const {
          match,
        } = resolveDestination(
          submittedQuery
        );

        if (match) {
          pushDestination(
            match,
            submittedQuery
          );
        } else {
          pushFallbackMessage(
            submittedQuery
          );
        }

        setInputValue("");
      },
      [
        inputValue,
        pushDestination,
        pushFallbackMessage,
      ]
    );

  const stopStreaming =
    useCallback(() => {
      requestControllerRef.current?.abort();
      requestControllerRef.current =
        null;

      if (displayTimerRef.current) {
        clearInterval(
          displayTimerRef.current
        );

        displayTimerRef.current =
          null;
      }

      backendStreamDoneRef.current =
        true;

      setIsStreaming(false);
    }, []);

  return {
    activeDestination,
    activeDestinationId,
    fullMessage,
    inputValue,
    isStreaming,
    pushDestination,
    handleSubmit,
    setInputValue,
    suggestedQuery,
    visibleMessage,

    requestMessage,
    sources,
    streamError,
    stopStreaming,
  };
}