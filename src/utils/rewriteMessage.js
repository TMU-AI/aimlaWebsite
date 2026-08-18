const API_BASE_URL = "http://localhost:3001";

export async function rewriteMessageWithLLM(text, mode = "rewrite") {
  try {
    console.log("Sending original message to backend:", text);

    const response = await fetch(`${API_BASE_URL}/api/rewrite-message`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ text, mode }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(
        errorData?.details ||
          errorData?.error ||
          `Failed with status ${response.status}`
      );
    }

    const data = await response.json();

    console.log("Received rewritten message:", data.rewrittenText);

    if (!data.rewrittenText) {
      throw new Error("No rewritten text returned.");
    }

    return data.rewrittenText;
  } catch (error) {
    console.warn("LLM rewrite failed. Using original message.", error);

    return text;
  }
}