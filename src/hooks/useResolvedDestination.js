/**
 * Destination resolution and streaming state hook.
 * Coordinates input handling, resolved destination IDs, and typewriter-style message playback.
 */
import { useCallback, useEffect, useMemo, useState } from "react";

import {
  DEFAULT_DESTINATION_ID,
  FALLBACK_MESSAGE,
  getDestinationContent,
  getDestinationContentOrDefault,
} from "../content";
import { rewriteMessageWithLLM } from "../utils/rewriteMessage";

const DEFAULT_DESTINATION = getDestinationContentOrDefault(DEFAULT_DESTINATION_ID);

const STREAM_SPEED_MS = 24;

/**
 * Splits text into streamable tokens while preserving:
 * - spaces
 * - line breaks
 * - punctuation
 *
 * This prevents streamed text from looking cramped.
 */
export function tokenizeForStreaming(text) {
  if (!text) {
    return [];
  }

  return String(text).match(/\n+|[^\S\n]+|[\w'-]+|[^\s]/g) || [];
}

function getDestinationMessage(destination) {
  return destination.content || destination.body || "";
}

/**
 * Turns the resolver's `matches` array into the text that gets streamed to the user.
 * A single match streams as plain prose (unchanged behavior). Multiple matches
 * (a "broad" query like "who are the members") render as a bulleted list, one
 * fact per line, so the reader can tell the facts apart instead of getting one
 * run-on paragraph.
 */
export function formatMatchedText(matches, fallbackText) {
  if (!Array.isArray(matches) || matches.length === 0) {
    return fallbackText || "";
  }

  if (matches.length === 1) {
    return matches[0].text || fallbackText || "";
  }

  return matches.map((entry) => `- ${entry.text}`).join("\n");
}

export function useResolvedDestination() {
  const [activeDestinationId, setActiveDestinationId] = useState(
    DEFAULT_DESTINATION_ID
  );
  const [inputValue, setInputValue] = useState("");
  const [suggestedQuery, setSuggestedQuery] = useState(
    DEFAULT_DESTINATION.suggestedQuery
  );
  const [fullMessage, setFullMessage] = useState(
    getDestinationMessage(DEFAULT_DESTINATION)
  );
  const [visibleMessage, setVisibleMessage] = useState("");
  const [isStreaming, setIsStreaming] = useState(true);
  const [streamKey, setStreamKey] = useState(0);

  const activeDestination = useMemo(
    () => getDestinationContent(activeDestinationId) || DEFAULT_DESTINATION,
    [activeDestinationId]
  );

  useEffect(() => {
    let tokenIndex = 0;
    let timeoutId;
    let cancelled = false;

    const streamMessage = async () => {
      setVisibleMessage("");
      setIsStreaming(true);

      const messageToStream = await rewriteMessageWithLLM(fullMessage, "rewrite");

      if (cancelled) {
        return;
      }

      const tokens = tokenizeForStreaming(messageToStream);

      if (tokens.length === 0) {
        setIsStreaming(false);
        return;
      }

      const streamNextToken = () => {
        if (cancelled) {
          return;
        }

        tokenIndex += 1;

        setVisibleMessage(tokens.slice(0, tokenIndex).join(""));

        if (tokenIndex >= tokens.length) {
          setIsStreaming(false);
          return;
        }

        timeoutId = window.setTimeout(streamNextToken, STREAM_SPEED_MS);
      };

      timeoutId = window.setTimeout(streamNextToken, STREAM_SPEED_MS);
    };

    streamMessage();

    return () => {
      cancelled = true;
      window.clearTimeout(timeoutId);
    };
  }, [fullMessage, streamKey]);

  const pushDestination = useCallback((destinationId) => {
    const destination = getDestinationContentOrDefault(destinationId);

    setActiveDestinationId(destination.id);
    setSuggestedQuery(destination.suggestedQuery);
    setFullMessage(getDestinationMessage(destination));
    setStreamKey((value) => value + 1);
  }, []);

  const pushFallbackMessage = useCallback(() => {
    setActiveDestinationId(DEFAULT_DESTINATION_ID);
    setSuggestedQuery(DEFAULT_DESTINATION.suggestedQuery);
    setFullMessage(FALLBACK_MESSAGE);
    setStreamKey((value) => value + 1);
  }, []);

  const handleSubmit = useCallback(
    async (event) => {
      event.preventDefault();

      try {
        const response = await fetch("http://localhost:3001/api/resolve", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ input: inputValue }),
        });
        const { match, sourceId, matchedText, matches } = await response.json();

        if (match) {
          pushDestination(match);

          if (sourceId && sourceId.includes("_") && (matchedText || matches)) {
            setFullMessage(formatMatchedText(matches, matchedText));
          }
        } else {
          pushFallbackMessage();
        }
      } catch {
        pushFallbackMessage();
      }

      setInputValue("");
    },
    [inputValue, pushDestination, pushFallbackMessage, setFullMessage]
  );  

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
  };
}