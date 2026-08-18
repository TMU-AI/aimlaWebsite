CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE IF NOT EXISTS knowledge_records (
    id TEXT PRIMARY KEY,

    content_type TEXT NOT NULL,

    title TEXT NOT NULL,

    content TEXT NOT NULL,

    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,

    status TEXT NOT NULL DEFAULT 'current',

    embedding VECTOR(1536) NOT NULL,

    search_vector TSVECTOR GENERATED ALWAYS AS (
        setweight(
            to_tsvector(
                'english',
                COALESCE(title, '')
            ),
            'A'
        )
        ||
        setweight(
            to_tsvector(
                'english',
                COALESCE(content, '')
            ),
            'B'
        )
        ||
        setweight(
            to_tsvector(
                'english',
                COALESCE(metadata::text, '')
            ),
            'C'
        )
    ) STORED,

    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS knowledge_records_embedding_hnsw_idx
ON knowledge_records
USING hnsw (
    embedding vector_cosine_ops
);

CREATE INDEX IF NOT EXISTS knowledge_records_search_vector_idx
ON knowledge_records
USING gin (
    search_vector
);

CREATE INDEX IF NOT EXISTS knowledge_records_content_type_idx
ON knowledge_records (
    content_type
);

CREATE INDEX IF NOT EXISTS knowledge_records_status_idx
ON knowledge_records (
    status
);

CREATE INDEX IF NOT EXISTS knowledge_records_metadata_idx
ON knowledge_records
USING gin (
    metadata
);