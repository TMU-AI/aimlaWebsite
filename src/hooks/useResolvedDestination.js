/**
 * Destination resolution and streaming state hook.
 * Coordinates input handling, resolver output, and typewriter-style message playback.
 */
import { useEffect, useMemo, useState } from "react";

import { DEFAULT_DESTINATION_ID, FALLBACK_MESSAGE, getDestinationContent } from "../content";
import { resolveDestination } from "../resolver";

const DEFAULT_DESTINATION = getDestinationContent(DEFAULT_DESTINATION_ID);

export function useResolvedDestination() {
  const [activeDestinationId, setActiveDestinationId] = useState(DEFAULT_DESTINATION_ID);
  const [inputValue, setInputValue] = useState("");
  const [suggestedQuery, setSuggestedQuery] = useState(DEFAULT_DESTINATION.suggestedQuery);
  const [fullMessage, setFullMessage] = useState(DEFAULT_DESTINATION.body);
  const [visibleMessage, setVisibleMessage] = useState("");
  const [isStreaming, setIsStreaming] = useState(true);
  const [streamKey, setStreamKey] = useState(0);

  const activeDestination = useMemo(
    () => getDestinationContent(activeDestinationId) || DEFAULT_DESTINATION,
    [activeDestinationId]
  );

  useEffect(() => {
    let index = 0;
    const message = fullMessage;

    setVisibleMessage("");
    setIsStreaming(true);

    const timer = window.setInterval(() => {
      index += 1;

      if (index <= message.length) {
        setVisibleMessage(message.slice(0, index));
        return;
      }

      window.clearInterval(timer);
      setIsStreaming(false);
    }, 18);

    return () => window.clearInterval(timer);
  }, [fullMessage, streamKey]);

  const pushDestination = destinationId => {
    const destination = getDestinationContent(destinationId) || DEFAULT_DESTINATION;

    setActiveDestinationId(destination.id);
    setSuggestedQuery(destination.suggestedQuery);
    setFullMessage(destination.body);
    setStreamKey(value => value + 1);
  };

  const handleSubmit = event => {
    event.preventDefault();

    const { match } = resolveDestination(inputValue);

    if (match) {
      pushDestination(match);
    } else {
      setActiveDestinationId(DEFAULT_DESTINATION_ID);
      setSuggestedQuery(DEFAULT_DESTINATION.suggestedQuery);
      setFullMessage(FALLBACK_MESSAGE);
      setStreamKey(value => value + 1);
    }

    setInputValue("");
  };

  return {
    activeDestination,
    inputValue,
    isStreaming,
    pushDestination,
    handleSubmit,
    setInputValue,
    suggestedQuery,
    visibleMessage
  };
}
