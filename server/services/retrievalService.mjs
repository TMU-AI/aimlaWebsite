import pgvector from "pgvector/pg";

import { pool } from "../db/pool.mjs";
import { createEmbedding } from "./embeddingService.mjs";
import { analyzeQuery } from "./queryAnalysis.mjs";

const DEFAULT_LIMIT = Number(
  process.env.MAX_RETRIEVAL_RESULTS || 3
);

const DEFAULT_MIN_SCORE = Number(
  process.env.MIN_RETRIEVAL_SCORE || 0.42
);

const MAX_LIST_RESULTS = 25;

/**
 * Keeps a score between zero and one.
 */
function clampScore(value) {
  const number = Number(value || 0);

  return Math.max(
    0,
    Math.min(number, 1)
  );
}

/**
 * Converts a PostgreSQL result into a consistent object.
 */
function normalizeRow(row) {
  return {
    id: row.id,
    content_type: row.content_type,
    title: row.title,
    content: row.content,
    metadata: row.metadata || {},
    status: row.status,

    match_type:
      row.match_type || "hybrid",

    semantic_score:
      clampScore(row.semantic_score),

    keyword_score:
      clampScore(row.keyword_score),

    team_score:
      clampScore(row.team_score),

    score:
      clampScore(row.score),
  };
}

/**
 * Determines how many results should be returned.
 */
function getResultLimit(
  analysis,
  requestedLimit
) {
  if (analysis.isListRequest) {
    return Math.max(
      1,
      Math.min(
        Number(
          requestedLimit ||
          MAX_LIST_RESULTS
        ),
        MAX_LIST_RESULTS
      )
    );
  }

  return Math.max(
    1,
    Math.min(
      Number(
        requestedLimit ||
        DEFAULT_LIMIT
      ),
      10
    )
  );
}

/**
 * Attempts an exact structured database lookup before
 * creating an embedding.
 *
 * Structured searches include:
 * - leadership roles
 * - usernames
 * - department lists
 * - social platforms
 * - email contact information
 */
async function findStructuredRecords(
  analysis,
  limit
) {
  const hasExactRole =
    Boolean(analysis.exactRole);

  const hasExactUsername =
    Boolean(analysis.exactUsername);

  const hasTeamListRequest =
    Boolean(
      analysis.isListRequest &&
      analysis.team
    );

  const hasContentTypeListRequest =
    Boolean(
      analysis.isListRequest &&
      analysis.contentType &&
      !analysis.team
    );

  const hasExactPlatform =
    Boolean(analysis.platform);

  const membersOnly =
    analysis.membersOnly === true;

  /**
   * There is no structured filter to apply.
   * Continue to vector retrieval instead.
   */
  if (
    !hasExactRole &&
    !hasExactUsername &&
    !hasTeamListRequest &&
    !hasContentTypeListRequest &&
    !hasExactPlatform
  ) {
    return [];
  }

  const result = await pool.query(
    `
      SELECT
        id,
        content_type,
        title,
        content,
        metadata,
        status,

        'structured'::text
          AS match_type,

        1.0::float8
          AS semantic_score,

        1.0::float8
          AS keyword_score,

        CASE
          WHEN $5::text IS NOT NULL
            AND LOWER(
              COALESCE(
                metadata->>'team',
                ''
              )
            ) = LOWER($5)
          THEN 1.0
          ELSE 0.0
        END AS team_score,

        1.0::float8
          AS score

      FROM knowledge_records

      WHERE status = $1

        AND (
          $2::text IS NULL
          OR content_type = $2
        )

        /*
         * A request for regular department members
         * should not include Presidents or VPs.
         */
        AND (
          $10::boolean = FALSE

          OR (
            LOWER(
              COALESCE(
                metadata->>'role',
                ''
              )
            ) NOT LIKE 'vp of %'

            AND LOWER(
              COALESCE(
                metadata->>'role',
                ''
              )
            ) <> 'president'
          )
        )

        AND (
          /*
           * Exact leadership role.
           */
          (
            $3::text IS NOT NULL

            AND LOWER(
              COALESCE(
                metadata->>'role',
                ''
              )
            ) = LOWER($3)
          )

          OR

          /*
           * Exact username.
           */
          (
            $4::text IS NOT NULL

            AND LOWER(
              COALESCE(
                metadata->>'username',
                ''
              )
            ) = LOWER($4)
          )

          OR

          /*
           * All records from a specific team.
           */
          (
            $6::boolean = TRUE

            AND $5::text IS NOT NULL

            AND LOWER(
              COALESCE(
                metadata->>'team',
                ''
              )
            ) = LOWER($5)
          )

          OR

          /*
           * All records from a content category.
           */
          (
            $7::boolean = TRUE
            AND $2::text IS NOT NULL
          )

          OR

          /*
           * Exact social platform or email lookup.
           *
           * Social links are stored inside:
           * metadata.socialLinks
           *
           * Email is stored inside:
           * metadata.email
           */
          (
            $9::boolean = TRUE

            AND (
              (
                LOWER($8) = 'email'

                AND COALESCE(
                  metadata->>'email',
                  ''
                ) <> ''
              )

              OR

              (
                LOWER($8) IN (
                  'discord',
                  'instagram',
                  'linkedin'
                )

                AND COALESCE(
                  metadata
                    -> 'socialLinks'
                    ->> LOWER($8),
                  ''
                ) <> ''
              )
            )
          )
        )

      ORDER BY
        /*
         * Put exact platform records first.
         */
        CASE
          WHEN $9::boolean = TRUE
          THEN 0
          ELSE 1
        END,

        /*
         * Leadership ordering for team lists.
         */
        CASE
          WHEN LOWER(
            COALESCE(
              metadata->>'role',
              ''
            )
          ) = 'president'
          THEN 0

          WHEN LOWER(
            COALESCE(
              metadata->>'role',
              ''
            )
          ) LIKE 'vp of %'
          THEN 1

          ELSE 2
        END,

        COALESCE(
          metadata->>'name',
          title
        )

      LIMIT $11
    `,
    [
      analysis.status,
      analysis.contentType,
      analysis.exactRole,
      analysis.exactUsername,
      analysis.team,
      hasTeamListRequest,
      hasContentTypeListRequest,
      analysis.platform,
      hasExactPlatform,
      membersOnly,
      limit,
    ]
  );

  return result.rows.map(
    normalizeRow
  );
}

/**
 * Performs vector, keyword, and team-based retrieval.
 */
async function findVectorCandidates({
  analysis,
  queryEmbedding,
  contentType,
  team,
  membersOnly,
  candidateLimit,
}) {
  const vectorSql =
    pgvector.toSql(queryEmbedding);

  const result = await pool.query(
    `
      SELECT
        id,
        content_type,
        title,
        content,
        metadata,
        status,

        'hybrid'::text
          AS match_type,

        1 - (
          embedding <=> $1::vector
        ) AS semantic_score,

        ts_rank_cd(
          search_vector,
          websearch_to_tsquery(
            'english',
            $2
          ),
          32
        ) AS keyword_score,

        CASE
          WHEN $5::text IS NOT NULL

            AND LOWER(
              COALESCE(
                metadata->>'team',
                ''
              )
            ) = LOWER($5)

          THEN 1.0
          ELSE 0.0
        END AS team_score

      FROM knowledge_records

      WHERE status = $3

        AND (
          $4::text IS NULL
          OR content_type = $4
        )

        AND (
          $5::text IS NULL

          OR LOWER(
            COALESCE(
              metadata->>'team',
              ''
            )
          ) = LOWER($5)
        )

        /*
         * Regular-member questions should not retrieve
         * President or VP records.
         */
        AND (
          $6::boolean = FALSE

          OR (
            LOWER(
              COALESCE(
                metadata->>'role',
                ''
              )
            ) NOT LIKE 'vp of %'

            AND LOWER(
              COALESCE(
                metadata->>'role',
                ''
              )
            ) <> 'president'
          )
        )

      ORDER BY
        embedding <=> $1::vector

      LIMIT $7
    `,
    [
      vectorSql,
      analysis.normalizedQuery,
      analysis.status,
      contentType,
      team,
      membersOnly,
      candidateLimit,
    ]
  );

  return result.rows.map(
    (row) => {
      const semanticScore =
        clampScore(
          row.semantic_score
        );

      const keywordScore =
        clampScore(
          row.keyword_score
        );

      const teamScore =
        clampScore(
          row.team_score
        );

      /**
       * Hybrid retrieval score:
       *
       * 76% semantic similarity
       * 19% keyword relevance
       * 5% exact team match
       */
      const finalScore =
        clampScore(
          semanticScore * 0.76 +
          keywordScore * 0.19 +
          teamScore * 0.05
        );

      return normalizeRow({
        ...row,

        semantic_score:
          semanticScore,

        keyword_score:
          keywordScore,

        team_score:
          teamScore,

        score:
          finalScore,
      });
    }
  );
}

/**
 * Removes duplicate records returned by different
 * search plans.
 */
function mergeUniqueRecords(
  recordGroups
) {
  const recordsById =
    new Map();

  for (const records of recordGroups) {
    for (const record of records) {
      const existing =
        recordsById.get(record.id);

      if (
        !existing ||
        record.score > existing.score
      ) {
        recordsById.set(
          record.id,
          record
        );
      }
    }
  }

  return [
    ...recordsById.values(),
  ];
}

/**
 * Main AIMLA knowledge retrieval function.
 */
export async function retrieveKnowledge(
  query,
  options = {}
) {
  const analysis =
    analyzeQuery(query);

  if (!analysis.normalizedQuery) {
    return {
      analysis,
      results: [],
    };
  }

  const limit =
    getResultLimit(
      analysis,
      options.limit
    );

  /**
   * Step 1:
   * Try an exact metadata lookup first.
   */
  const structuredRecords =
    await findStructuredRecords(
      analysis,
      limit
    );

  if (
    structuredRecords.length > 0
  ) {
    return {
      analysis,
      results:
        structuredRecords,
    };
  }

  /**
   * Step 2:
   * Create an embedding if no exact structured
   * record was found.
   */
  const queryEmbedding =
    await createEmbedding(
      analysis.normalizedQuery
    );

  const candidateLimit =
    Math.max(
      limit * 5,
      15
    );

  /**
   * Step 3:
   * Search from the most specific filters
   * to the broadest filters.
   */
  const searchPlans = [
    {
      contentType:
        analysis.contentType,

      team:
        analysis.team,
    },
    {
      contentType:
        analysis.contentType,

      team: null,
    },
    {
      contentType: null,
      team: null,
    },
  ];

  const candidateGroups = [];
  const completedPlans =
    new Set();

  for (
    const searchPlan of searchPlans
  ) {
    const planKey =
      JSON.stringify(
        searchPlan
      );

    if (
      completedPlans.has(planKey)
    ) {
      continue;
    }

    completedPlans.add(
      planKey
    );

    const candidates =
      await findVectorCandidates({
        analysis,

        queryEmbedding,

        contentType:
          searchPlan.contentType,

        team:
          searchPlan.team,

        membersOnly:
          analysis.membersOnly === true,

        candidateLimit,
      });

    candidateGroups.push(
      candidates
    );

    const strongMatches =
      candidates.filter(
        (record) => {
          return (
            record.score >=
            DEFAULT_MIN_SCORE
          );
        }
      );

    if (
      strongMatches.length >=
      limit
    ) {
      break;
    }
  }

  /**
   * Step 4:
   * Remove duplicate and low-scoring records.
   */
  const results =
    mergeUniqueRecords(
      candidateGroups
    )
      .filter((record) => {
        return (
          record.score >=
          DEFAULT_MIN_SCORE
        );
      })
      .sort((left, right) => {
        return (
          right.score -
          left.score
        );
      })
      .slice(0, limit);

  return {
    analysis,
    results,
  };
}