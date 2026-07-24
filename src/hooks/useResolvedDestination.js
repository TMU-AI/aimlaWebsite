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
import { resolveDestination } from "../resolver";
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
    (event) => {
      event.preventDefault();

      const { match } = resolveDestination(inputValue);

      if (match) {
        pushDestination(match);
      } else {
        pushFallbackMessage();
      }

      setInputValue("");
    },
    [inputValue, pushDestination, pushFallbackMessage]
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