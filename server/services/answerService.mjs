import { openai } from "./openaiClient.mjs";

const OPENAI_MODEL =
  process.env.OPENAI_MODEL ||
  "gpt-5.4-nano";

/**
 * Instructions for the AIMLA website assistant.
 *
 * Retrieved database records are treated as the source
 * of truth for AIMLA-related answers.
 */
const SYSTEM_INSTRUCTIONS = `
You are the official TMU AIMLA website assistant.

Answer the user's question using only the retrieved AIMLA context provided to you.

Important retrieval rules:
- The backend retrieval system has already selected records that are relevant to the user's question.
- Treat retrieved records marked "current" as valid current AIMLA information.
- When the user asks for a list and matching records are present, use those records to answer.
- Do not say that information could not be found when the retrieved context clearly contains records that answer the question.
- Only say that information could not be found when the retrieved context genuinely does not contain the requested information.

Answering rules:
- Answer the exact question being asked.
- Do not return every retrieved record unless the user asks for a list.
- If the user asks for a list, return every relevant matching record provided in the context.
- If multiple people share the requested role or category, include every matching person.
- Do not invent names, positions, usernames, dates, events, teams, or links.
- Do not include social media usernames in answers unless the user specifically asks for social media or contact information.
- If a social media username is specifically requested, preserve it exactly, including the @ symbol.
- Do not include LinkedIn links unless the user specifically asks for LinkedIn or contact information.
- Preserve names exactly as provided.
- Preserve LinkedIn links exactly as provided when they are specifically requested.
- Treat records marked "current" as current information.
- Do not describe records marked "former" as current.
- Keep simple answers concise.
- Use natural, readable language.
- Respond using plain text only.
- Do not use Markdown formatting, bold markers, headings, asterisks, or code formatting.
`.trim();

/**
 * Creates the complete input sent to the model.
 */
function createModelInput({
  userMessage,
  context,
  isListRequest = false,
}) {
  const responseStyle =
    isListRequest
      ? `
RETRIEVAL RESULT:
Matching records were successfully found for this list request.

LIST INSTRUCTIONS:
- Use all relevant records from the retrieved AIMLA context below.
- Do not claim that the information is unavailable if matching records are present.
- Put each result on its own line.
- For people, use exactly this format:

Name — Role (Team)

- Do not include usernames in member lists.
- Do not include social media handles in member lists.
- Do not include LinkedIn links in member lists.
- Do not include other contact information unless the user specifically asks for it.
- Do not omit a matching person simply because several records were retrieved.
`
      : `
RETRIEVAL RESULT:
Relevant AIMLA context was retrieved for this question.

ANSWER INSTRUCTIONS:
- Give a focused answer to the user's question.
- Use only information directly supported by the retrieved context.
- Do not summarize unrelated retrieved records.
- Do not include usernames, social media handles, LinkedIn links, or other contact information unless the user specifically asks for them.
`;

  return `
${responseStyle.trim()}

USER QUESTION:
${userMessage}

RETRIEVED AIMLA CONTEXT:
${context}

Answer the user's question now using the retrieved AIMLA context.
  `.trim();
}

/**
 * Creates a streamed OpenAI response.
 *
 * The backend route reads the returned stream and forwards
 * each text delta to the React frontend using SSE.
 */
export async function createAnswerStream({
  userMessage,
  context,
  isListRequest = false,
  signal,
}) {
  const cleanedMessage =
    String(
      userMessage ?? ""
    ).trim();

  const cleanedContext =
    String(
      context ?? ""
    ).trim();

  if (!cleanedMessage) {
    throw new Error(
      "A user message is required."
    );
  }

  if (!cleanedContext) {
    throw new Error(
      "Retrieved AIMLA context is required."
    );
  }

  const stream =
    await openai.responses.create(
      {
        model:
          OPENAI_MODEL,

        instructions:
          SYSTEM_INSTRUCTIONS,

        input:
          createModelInput({
            userMessage:
              cleanedMessage,

            context:
              cleanedContext,

            isListRequest,
          }),

        /**
         * This RAG task mostly requires extracting and
         * formatting information already retrieved from
         * the AIMLA database.
         */
        reasoning: {
          effort: "none",
        },

        /**
         * Provides enough room for larger member lists
         * and other multi-record answers.
         */
        max_output_tokens: 750,

        stream: true,
      },
      {
        signal,
      }
    );

  return stream;
}