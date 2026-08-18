import "dotenv/config";

import express from "express";
import cors from "cors";
import rateLimit from "express-rate-limit";

import {
  checkDatabaseConnection,
  pool,
} from "./db/pool.mjs";

import {
  buildContext,
  createSourceSummary,
} from "./services/contextBuilder.mjs";

import {
  createAnswerStream,
} from "./services/answerService.mjs";

import {
  retrieveKnowledge,
} from "./services/retrievalService.mjs";

const app = express();

const PORT =
  Number(process.env.SERVER_PORT) || 3001;

const CLIENT_ORIGIN =
  process.env.CLIENT_ORIGIN ||
  "http://localhost:3000";

const MODEL =
  process.env.OPENAI_MODEL ||
  "gpt-5.4-nano";

const EMBEDDING_MODEL =
  process.env.EMBEDDING_MODEL ||
  "text-embedding-3-small";

const MAX_USER_MESSAGE_LENGTH =
  Number(
    process.env.MAX_USER_MESSAGE_LENGTH
  ) || 500;

/**
 * Allows the React frontend on port 3000
 * to call the backend on port 3001.
 */
app.use(
  cors({
    origin: CLIENT_ORIGIN,
    methods: ["GET", "POST"],
    allowedHeaders: [
      "Content-Type",
    ],
  })
);

/**
 * Allows Express to read JSON request bodies.
 */
app.use(
  express.json({
    limit: "20kb",
  })
);

/**
 * Limits repeated API requests.
 *
 * Current setting:
 * 30 requests per minute per IP address.
 */
app.use(
  "/api/",
  rateLimit({
    windowMs: 60 * 1000,
    limit: 30,
    standardHeaders: true,
    legacyHeaders: false,

    message: {
      error:
        "Too many requests. Please try again shortly.",
    },
  })
);

/**
 * Configures the response as a Server-Sent Events stream.
 */
function startSse(response) {
  response.status(200);

  response.setHeader(
    "Content-Type",
    "text/event-stream; charset=utf-8"
  );

  response.setHeader(
    "Cache-Control",
    "no-cache, no-transform"
  );

  response.setHeader(
    "Connection",
    "keep-alive"
  );

  response.setHeader(
    "X-Accel-Buffering",
    "no"
  );

  response.flushHeaders?.();
}

/**
 * Sends one JSON event through the SSE stream.
 */
function sendSseEvent(
  response,
  payload
) {
  response.write(
    `data: ${JSON.stringify(payload)}\n\n`
  );
}

/**
 * Health-check route.
 *
 * Open:
 * http://localhost:3001/api/health
 */
app.get(
  "/api/health",
  async (_request, response) => {
    try {
      const database =
        await checkDatabaseConnection();

      return response
        .status(200)
        .json({
          status:
            "Backend is running",

          port: PORT,

          model: MODEL,

          embeddingModel:
            EMBEDDING_MODEL,

          hasApiKey:
            Boolean(
              process.env.OPENAI_API_KEY
            ),

          clientOrigin:
            CLIENT_ORIGIN,

          database:
            "connected",

          databaseName:
            database.database_name,

          databaseTime:
            database.current_time,
        });
    } catch (error) {
      console.error(
        "Database health check failed:",
        error
      );

      return response
        .status(500)
        .json({
          status:
            "Backend is running",

          database:
            "disconnected",

          error:
            error.message,
        });
    }
  }
);

/**
 * Main RAG and streaming route.
 *
 * Expected body:
 *
 * {
 *   "message": "Who is the VP of Marketing?",
 *   "fallbackText": "Optional static destination text"
 * }
 */
app.post(
  "/api/rewrite-message",
  async (request, response) => {
    const rawMessage =
      request.body?.message ??
      request.body?.query ??
      request.body?.userMessage ??
      "";

    const message =
      String(rawMessage).trim();

    /**
     * Existing static content can be used if vector
     * retrieval does not find a reliable record.
     */
    const rawFallbackText =
      request.body?.fallbackText ??
      request.body?.sourceText ??
      request.body?.text ??
      "";

    const fallbackText =
      String(rawFallbackText).trim();

    if (!message) {
      return response
        .status(400)
        .json({
          error:
            "A non-empty user message is required.",
        });
    }

    if (
      message.length >
      MAX_USER_MESSAGE_LENGTH
    ) {
      return response
        .status(400)
        .json({
          error:
            `The message must be ${MAX_USER_MESSAGE_LENGTH} ` +
            "characters or fewer.",
        });
    }

    if (
      !process.env.OPENAI_API_KEY
    ) {
      return response
        .status(500)
        .json({
          error:
            "OPENAI_API_KEY was not found.",

          details:
            "Add OPENAI_API_KEY to the root .env file and restart the backend.",
        });
    }

    /**
     * Cancels the OpenAI request if the browser
     * disconnects.
     */
    const abortController =
      new AbortController();

    request.on(
      "aborted",
      () => {
        abortController.abort();
      }
    );

    response.on(
      "close",
      () => {
        if (!response.writableEnded) {
          abortController.abort();
        }
      }
    );

    try {
      console.log(
        "\n--- RAG request received ---"
      );

      console.log(
        "Question:",
        message
      );

      /**
       * Step 1:
       * Search exact metadata, keywords and vectors.
       */
      const {
        analysis,
        results,
      } = await retrieveKnowledge(
        message
      );

      console.log(
        "Detected query:",
        analysis
      );

      console.log(
        "Retrieved records:",
        results.map((record) => ({
          id: record.id,
          title: record.title,
          matchType:
            record.match_type,
          score:
            record.score,
        }))
      );

      let context;
      let sources;

      /**
       * Use vector-database information when relevant
       * records were found.
       */
      if (results.length > 0) {
        context =
          buildContext(results);

        sources =
          createSourceSummary(results);
      }

      /**
       * Use the existing static destination content
       * when retrieval finds nothing.
       */
      else if (fallbackText) {
        context = [
          "[Static AIMLA fallback]",
          fallbackText,
        ].join("\n");

        sources = [
          {
            id:
              "static-fallback",

            title:
              "Existing AIMLA static content",

            contentType:
              analysis.contentType ||
              "unknown",

            status:
              "fallback",

            score:
              null,

            metadata:
              {},
          },
        ];
      }

      /**
       * No database result and no static fallback.
       */
      else {
        startSse(response);

        sendSseEvent(
          response,
          {
            type:
              "sources",

            sources:
              [],
          }
        );

        sendSseEvent(
          response,
          {
            type:
              "text",

            text:
              "I could not find reliable AIMLA information that answers that question.",
          }
        );

        sendSseEvent(
          response,
          {
            type:
              "done",
          }
        );

        return response.end();
      }

      /**
       * Begin the response stream.
       */
      startSse(response);

      /**
       * Send retrieval-source information first.
       */
      sendSseEvent(
        response,
        {
          type:
            "sources",

          sources,
        }
      );

      /**
       * Step 2:
       * Ask the model to answer using the retrieved
       * context.
       */
      const stream =
        await createAnswerStream({
          userMessage:
            message,

          context,

          isListRequest:
            analysis.isListRequest,

          signal:
            abortController.signal,
        });

      /**
       * Step 3:
       * Forward each OpenAI text delta directly
       * to React.
       */
      for await (
        const event of stream
      ) {
        if (
          event.type ===
          "response.output_text.delta"
        ) {
          sendSseEvent(
            response,
            {
              type:
                "text",

              text:
                event.delta,
            }
          );
        }

        if (
          event.type ===
          "response.failed"
        ) {
          throw new Error(
            event.response?.error?.message ||
            "The OpenAI response failed."
          );
        }

        if (
          event.type ===
          "error"
        ) {
          throw new Error(
            event.error?.message ||
            "The OpenAI stream failed."
          );
        }
      }

      /**
       * Tell React that the answer is complete.
       */
      sendSseEvent(
        response,
        {
          type:
            "done",
        }
      );

      response.end();

      console.log(
        "--- RAG stream completed ---\n"
      );
    } catch (error) {
      console.error(
        "\n--- RAG request failed ---"
      );

      console.error(
        "Status:",
        error?.status
      );

      console.error(
        "Message:",
        error?.message
      );

      console.error(error);

      console.error(
        "--------------------------\n"
      );

      /**
       * The visitor intentionally stopped the request.
       */
      if (
        abortController.signal.aborted
      ) {
        return;
      }

      /**
       * Streaming has not started yet, so normal JSON
       * can still be returned.
       */
      if (!response.headersSent) {
        return response
          .status(
            error?.status || 500
          )
          .json({
            error:
              "The AIMLA response could not be generated.",

            details:
              error?.message ||
              "An unknown backend error occurred.",
          });
      }

      /**
       * Streaming already started, so send the error
       * through SSE.
       */
      sendSseEvent(
        response,
        {
          type:
            "error",

          message:
            "The AIMLA response could not be completed.",
        }
      );

      return response.end();
    }
  }
);

/**
 * Handles routes that do not exist.
 */
app.use(
  (_request, response) => {
    response
      .status(404)
      .json({
        error:
          "Route not found.",
      });
  }
);

/**
 * Starts the backend server.
 */
const server =
  app.listen(
    PORT,
    () => {
      console.log(
        "--------------------------------------"
      );

      console.log(
        `Backend running at http://localhost:${PORT}`
      );

      console.log(
        `Health check: http://localhost:${PORT}/api/health`
      );

      console.log(
        `Model: ${MODEL}`
      );

      console.log(
        `Embedding model: ${EMBEDDING_MODEL}`
      );

      console.log(
        `API key loaded: ${Boolean(
          process.env.OPENAI_API_KEY
        )}`
      );

      console.log(
        "Streaming mode: OpenAI SSE"
      );

      console.log(
        "--------------------------------------"
      );
    }
  );

/**
 * Closes the backend and database connections cleanly.
 */
async function shutdown(signal) {
  console.log(
    `\n${signal} received. Closing backend...`
  );

  server.close(
    async () => {
      try {
        await pool.end();

        console.log(
          "Database connections closed."
        );

        process.exit(0);
      } catch (error) {
        console.error(
          "Backend shutdown failed:",
          error
        );

        process.exit(1);
      }
    }
  );
}

process.on(
  "SIGINT",
  () => shutdown("SIGINT")
);

process.on(
  "SIGTERM",
  () => shutdown("SIGTERM")
);