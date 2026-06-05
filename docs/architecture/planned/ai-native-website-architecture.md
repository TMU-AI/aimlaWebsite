# AI-Native Website Architecture

## Status
- This document defines the target architecture for the club's summer project.
- The current shipped site is still described by `system-overview.md` and `frontend-architecture.md`.
- Where this document disagrees with `future-state-architecture.md`, treat this document as the implementation source of truth.

## 1. Purpose And Product Framing
- The system is an AI-mediated information interface for club content, not a general-purpose chatbot.
- Canonical information is deterministic, structured, and owned outside the LLM layer.
- The LLM is non-authoritative and optional.
- Session state is reconstructed from compact event/state metadata, not raw HTML dumps.
- The frontend should feel dynamic and conversational while staying largely cacheable and operationally simple.
- The architecture favors a disciplined core with a flexible presentation layer.

## What The System Is Not
- Not an open-ended assistant that answers arbitrary questions as if it were authoritative.
- Not a system where the LLM creates canonical facts, IDs, dates, links, or team/event metadata.
- Not a UI that depends on hidden local state or persisted markup to replay a session.
- Not a backend-first product on day one; deterministic content and shared contracts come first.

## Why The Architecture Is Constrained This Way
- Junior contributors need stable contracts so work can split cleanly across frontend, backend, and AI/routing tasks.
- Club information changes slowly enough that structured content and caching should handle most traffic.
- The project still needs a dynamic-feeling interface, but that should not come from making facts probabilistic.
- Replayability, testability, and handoff quality matter more than maximum model autonomy.

## 2. Architectural Invariants
- Structured content is the source of truth.
- Retrieval happens before any LLM transformation.
- LLM output cannot change identifiers, URLs, dates, names, or other canonical facts.
- Every rendered panel must be reproducible from serialized session state plus canonical content.
- Shareable URLs reference compact session state, not rendered markup.
- The system must remain coherent when the LLM layer is disabled, unavailable, rate-limited, or rejected.
- Renderer events are append-only facts about UI assembly; replay never depends on implicit client history.
- Shared schemas, event types, and persistence formats are versioned contracts.

## 3. System Context

### Major Subsystems
- Structured content layer: canonical content entities such as events, team members, FAQs, CTAs, and guided prompts.
- Intent router: maps allowed UI actions and constrained text input into supported intents.
- Retrieval layer: resolves deterministic content bundles from structured data.
- Optional LLM transformation layer: paraphrases or summarizes retrieval output without changing canonical facts.
- Streaming renderer: emits UI events and assembles panels progressively.
- Session persistence layer: stores compact event/state metadata for replay and sharing.
- Caching layer: serves static shell, deterministic bundles, transformed variants, and session hydration efficiently.

### High-Level Flow
```text
User action
  -> Intent router
  -> Retrieval query
  -> Canonical content bundle
  -> Optional LLM transformation
  -> Streaming renderer event stream
  -> Client panel state
  -> Session persistence
```

### Request Lifecycle Example
1. The user clicks the guided prompt `What's happening next?`.
2. The intent router resolves `open_section` with an `events` target and `status=upcoming` filter.
3. The retrieval layer returns a deterministic bundle of upcoming events sorted by `startAt` ascending.
4. If enabled, the LLM produces a friendly summary that preserves all locked facts.
5. The renderer streams `session_started`, `intent_resolved`, `panel_added`, `text_stream_*`, and `suggestions_updated` events.
6. The session store persists the ordered event log, panel states, retrieval references, and suggestion context.

## 4. Canonical Data Model

### Shared Entity Rules
- Every entity has a stable `id`.
- Every entity declares `entityType`.
- Every entity supports `updatedAt` and `visibility` metadata.
- Cross-entity references use stable IDs, never copied display strings.
- Content schema validation runs before deployment and before cache publication.

### Primary Entity Types
| Entity | Required fields | Optional fields | Notes |
| --- | --- | --- | --- |
| `page` | `id`, `entityType`, `title`, `sectionIds`, `updatedAt`, `visibility` | `description`, `seo` | Top-level composition metadata. |
| `section` | `id`, `entityType`, `title`, `kind`, `contentRefs`, `updatedAt`, `visibility` | `summary`, `ctaIds` | Logical content bucket, not DOM markup. |
| `event` | `id`, `entityType`, `title`, `status`, `startAt`, `summary`, `updatedAt`, `visibility` | `endAt`, `location`, `tags`, `registration`, `linkIds`, `speakerIds` | Canonical event schedule record. |
| `team_member` | `id`, `entityType`, `name`, `role`, `group`, `updatedAt`, `visibility` | `pronouns`, `bio`, `imageAsset`, `linkIds` | Team roster entry. |
| `faq` | `id`, `entityType`, `question`, `answer`, `updatedAt`, `visibility` | `topic`, `sectionId` | Deterministic answer source. |
| `cta` | `id`, `entityType`, `label`, `kind`, `target`, `updatedAt`, `visibility` | `description`, `trackingKey` | Explicit call-to-action record. |
| `link` | `id`, `entityType`, `label`, `url`, `kind`, `updatedAt`, `visibility` | `icon`, `rel` | External or internal destination. |
| `guided_prompt` | `id`, `entityType`, `label`, `intentType`, `inputTemplate`, `updatedAt`, `visibility` | `description`, `defaultFilters`, `followUpPromptIds` | Allowed entry point for the guided interface. |

### Reference Rules
- `section.contentRefs` may reference `event`, `team_member`, `faq`, or `cta` IDs.
- `event.linkIds` and `team_member.linkIds` may reference only `link` entities.
- `guided_prompt.followUpPromptIds` may reference only other `guided_prompt` entities.
- Retrieval bundles contain entity IDs plus denormalized display data, but canonical ownership stays with the source entity.

### Validation Rules
- IDs are immutable once published.
- `status` for events is one of `upcoming`, `past`, or `cancelled`.
- `startAt` and `endAt` use ISO 8601 strings.
- URLs must be absolute HTTPS URLs except approved internal paths.
- `visibility` is one of `public`, `unlisted`, or `draft`.
- Retrieval bundles must not include orphan references.

### Example Event Record
```json
{
  "id": "event_intro_to_llms_2026_07_12",
  "entityType": "event",
  "title": "Intro to LLMs Workshop",
  "status": "upcoming",
  "startAt": "2026-07-12T17:00:00-04:00",
  "endAt": "2026-07-12T19:00:00-04:00",
  "summary": "Hands-on workshop for members who want a practical introduction to large language models.",
  "location": {
    "kind": "in_person",
    "label": "ENG 103"
  },
  "tags": ["workshop", "beginner"],
  "registration": {
    "open": true,
    "url": "https://example.com/register/intro-to-llms"
  },
  "linkIds": ["link_intro_to_llms_signup"],
  "updatedAt": "2026-05-25T10:00:00Z",
  "visibility": "public"
}
```

### Example Team Record
```json
{
  "id": "team_member_ava_chen",
  "entityType": "team_member",
  "name": "Ava Chen",
  "role": "President",
  "group": "Executive",
  "pronouns": "she/her",
  "bio": "Leads club operations, partner outreach, and cross-team planning for the summer project.",
  "imageAsset": "team/ava-chen.jpg",
  "linkIds": ["link_ava_linkedin"],
  "updatedAt": "2026-05-25T10:00:00Z",
  "visibility": "public"
}
```

### Example Guided Prompt Definition
```json
{
  "id": "prompt_upcoming_events",
  "entityType": "guided_prompt",
  "label": "What's happening next?",
  "intentType": "open_section",
  "inputTemplate": {
    "sectionId": "events",
    "filters": {
      "status": "upcoming"
    }
  },
  "description": "Show the next public events with registration links when available.",
  "followUpPromptIds": ["prompt_join_club", "prompt_team_overview"],
  "updatedAt": "2026-05-25T10:00:00Z",
  "visibility": "public"
}
```

### Example Retrieved Content Bundle
```json
{
  "bundleId": "bundle_events_upcoming_en_v1",
  "intentId": "intent_open_events_upcoming_01",
  "sectionId": "events",
  "queryKey": "entity=event|status=upcoming|sort=startAt:asc|limit=3|locale=en|rev=content_2026_05_25",
  "query": {
    "entityType": "event",
    "filters": {
      "status": "upcoming"
    },
    "sort": ["startAt:asc"],
    "limit": 3
  },
  "entities": [
    {
      "id": "event_intro_to_llms_2026_07_12",
      "entityType": "event",
      "title": "Intro to LLMs Workshop",
      "status": "upcoming",
      "startAt": "2026-07-12T17:00:00-04:00",
      "summary": "Hands-on workshop for members who want a practical introduction to large language models.",
      "registration": {
        "open": true,
        "url": "https://example.com/register/intro-to-llms"
      }
    }
  ],
  "meta": {
    "resultCount": 1,
    "sortApplied": ["startAt:asc", "id:asc"],
    "contentRevision": "content_2026_05_25",
    "retrievedAt": "2026-05-29T18:30:00Z"
  },
  "fallbackPromptIds": ["prompt_join_club", "prompt_team_overview"]
}
```

## 5. Intent Router Contract

### Supported Intent Types
| Intent type | Purpose | Typical UI sources |
| --- | --- | --- |
| `open_section` | Open a known content area with optional filters. | Guided prompt, nav chip |
| `compare_events` | Compare two or more known event IDs. | Prompt, comparison CTA |
| `show_team` | Show a team group or member detail. | Guided prompt, team card |
| `suggest_next` | Request next-step prompts from current context. | End-of-panel prompt row |
| `summarize_content` | Produce a short summary for already retrieved entities. | Summary chip, follow-up prompt |

### Accepted Inputs From UI
- Guided prompt click with prompt ID.
- Structured freeform text that matches an allowlisted slot pattern.
- Direct entity selection such as a team member card or event comparison picker.
- Existing session context including active section, visible panel IDs, and selected entity IDs.

### Router Input Shape
```json
{
  "actionId": "act_01",
  "sessionId": "sess_01",
  "source": "guided_prompt",
  "promptId": "prompt_upcoming_events",
  "rawText": null,
  "context": {
    "activeSectionId": "home",
    "visiblePanelIds": [],
    "selectedEntityIds": []
  }
}
```

### Router Output Shape
```json
{
  "intentId": "intent_open_events_upcoming_01",
  "type": "open_section",
  "confidence": "high",
  "reason": "guided_prompt_exact_match",
  "retrievalQuery": {
    "entityType": "event",
    "sectionId": "events",
    "filters": {
      "status": "upcoming"
    },
    "sort": ["startAt:asc"],
    "limit": 3
  },
  "fallbackPromptIds": ["prompt_join_club", "prompt_team_overview"]
}
```

### Fallback And Rejection Behavior
- Unsupported or out-of-scope freeform input resolves to `suggest_next` with constrained prompt suggestions.
- The router never fabricates unsupported intents.
- Low-confidence matches return `confidence: low` and a fallback prompt set instead of guessing.

### Example Unsupported Request Response
```json
{
  "intentId": "intent_unsupported_01",
  "type": "suggest_next",
  "confidence": "low",
  "reason": "out_of_scope_query",
  "fallbackPromptIds": ["prompt_upcoming_events", "prompt_team_overview", "prompt_join_club"]
}
```

### Example Router Derivation
- Input UI action: click `prompt_team_overview`.
- Routed intent: `show_team`.
- Derived retrieval query: `entityType=team_member`, `filters.group=Executive`, `sort=role:asc`.

## 6. Retrieval Layer Contract

### Inputs
- `entityType`.
- `sectionId` when the request is scoped to a known section.
- `filters` with allowlisted fields per entity type.
- `sort` with deterministic tie-breakers.
- `limit` and optional `cursor` for bounded pagination.
- `locale` and `contentRevision` when needed.

### Deterministic Rules
- Sorting must be explicit. If the caller omits a sort, the retrieval layer applies the entity default.
- Equal sort values break ties with ascending `id`.
- Empty results still return retrieval metadata and fallback prompt IDs.
- Retrieval output includes enough metadata for replay, analytics, and cache keys.

### Output Shape
```json
{
  "bundleId": "bundle_id",
  "intentId": "intent_id",
  "sectionId": "section_id",
  "queryKey": "entity=event|status=upcoming|sort=startAt:asc|limit=3|locale=en|rev=content_2026_05_25",
  "query": {
    "entityType": "event"
  },
  "entities": [],
  "meta": {
    "resultCount": 0,
    "sortApplied": ["startAt:asc", "id:asc"],
    "contentRevision": "content_2026_05_25",
    "retrievedAt": "2026-05-29T18:30:00Z"
  },
  "fallbackPromptIds": []
}
```

### Example Event List Retrieval
```json
{
  "bundleId": "bundle_events_upcoming_en_v1",
  "intentId": "intent_open_events_upcoming_01",
  "sectionId": "events",
  "queryKey": "entity=event|status=upcoming|sort=startAt:asc|limit=3|locale=en|rev=content_2026_05_25",
  "query": {
    "entityType": "event",
    "filters": {
      "status": "upcoming"
    },
    "sort": ["startAt:asc"],
    "limit": 3
  },
  "entities": [
    {
      "id": "event_intro_to_llms_2026_07_12",
      "entityType": "event",
      "title": "Intro to LLMs Workshop",
      "status": "upcoming",
      "startAt": "2026-07-12T17:00:00-04:00"
    },
    {
      "id": "event_ai_ethics_panel_2026_07_26",
      "entityType": "event",
      "title": "AI Ethics Student Panel",
      "status": "upcoming",
      "startAt": "2026-07-26T18:00:00-04:00"
    }
  ],
  "meta": {
    "resultCount": 2,
    "sortApplied": ["startAt:asc", "id:asc"],
    "contentRevision": "content_2026_05_25",
    "retrievedAt": "2026-05-29T18:30:00Z"
  },
  "fallbackPromptIds": ["prompt_join_club"]
}
```

### Example Single Initiative Retrieval
```json
{
  "bundleId": "bundle_initiative_outreach_en_v1",
  "intentId": "intent_open_outreach_01",
  "sectionId": "about",
  "queryKey": "entity=section|id=section_outreach|locale=en|rev=content_2026_05_25",
  "query": {
    "entityType": "section",
    "filters": {
      "id": "section_outreach"
    },
    "sort": ["id:asc"],
    "limit": 1
  },
  "entities": [
    {
      "id": "section_outreach",
      "entityType": "section",
      "title": "Community Outreach",
      "kind": "initiative",
      "contentRefs": ["faq_outreach_overview", "cta_partner_with_us"]
    }
  ],
  "meta": {
    "resultCount": 1,
    "sortApplied": ["id:asc"],
    "contentRevision": "content_2026_05_25",
    "retrievedAt": "2026-05-29T18:30:00Z"
  },
  "fallbackPromptIds": ["prompt_partner_with_us"]
}
```

### Example Suggested Next Prompts
```json
{
  "bundleId": "bundle_suggestions_after_events_en_v1",
  "intentId": "intent_suggest_next_01",
  "sectionId": "events",
  "queryKey": "suggestions|context=intent_open_events_upcoming_01|locale=en|rev=content_2026_05_25",
  "query": {
    "entityType": "guided_prompt",
    "filters": {
      "contextIntentId": "intent_open_events_upcoming_01"
    },
    "sort": ["id:asc"],
    "limit": 2
  },
  "entities": [
    {
      "id": "prompt_join_club",
      "entityType": "guided_prompt",
      "label": "How do I join?"
    },
    {
      "id": "prompt_team_overview",
      "entityType": "guided_prompt",
      "label": "Who runs the club?"
    }
  ],
  "meta": {
    "resultCount": 2,
    "sortApplied": ["id:asc"],
    "contentRevision": "content_2026_05_25",
    "retrievedAt": "2026-05-29T18:30:00Z"
  },
  "fallbackPromptIds": []
}
```

## 7. Optional LLM Transformation Boundary

### Invocation Rules
- The LLM may run only after retrieval returns a valid deterministic bundle.
- The LLM receives structured content plus explicit locked fields.
- The LLM is skipped for unsupported intents, empty retrieval results, or when policy disables augmentation.

### Allowed Functions
- Paraphrase deterministic content into a different tone.
- Summarize already retrieved content.
- Reorder presentation blocks if the output still references the same canonical entities.
- Apply lightweight personalization based on safe session context such as beginner vs returning-member tone.

### Forbidden Functions
- Invent facts not present in the retrieval bundle.
- Change IDs, URLs, dates, titles, names, or registration state.
- Perform tool use outside the router and retrieval contracts.
- Answer unsupported freeform queries as if the system has general world knowledge.

### LLM Input Shape
```json
{
  "transformationId": "xform_01",
  "intentType": "summarize_content",
  "bundleId": "bundle_events_upcoming_en_v1",
  "lockedFields": ["id", "title", "startAt", "registration.url"],
  "presentationGoal": "friendly_summary",
  "entities": [
    {
      "id": "event_intro_to_llms_2026_07_12",
      "title": "Intro to LLMs Workshop",
      "startAt": "2026-07-12T17:00:00-04:00",
      "summary": "Hands-on workshop for members who want a practical introduction to large language models."
    }
  ]
}
```

### Safe Output Shape
```json
{
  "transformationId": "xform_01",
  "bundleId": "bundle_events_upcoming_en_v1",
  "variantKey": "friendly_summary|bundle_events_upcoming_en_v1|policy_v1|locale_en",
  "summaryText": "Next up is Intro to LLMs Workshop, a beginner-friendly hands-on session for members who want a practical start with large language models.",
  "entityOrder": ["event_intro_to_llms_2026_07_12"],
  "lockedFieldsPreserved": true,
  "confidence": "high"
}
```

### Fallback Rules
- If the LLM is disabled or unavailable, the renderer uses deterministic text assembled directly from the retrieval bundle.
- If the LLM is rate-limited, the request completes without augmentation and records the rate-limit outcome for observability.
- If the LLM returns `confidence: low`, the transformed output is discarded and the deterministic presentation path is used.
- If guardrails fail, the transformed output is discarded and the request continues without augmentation.
- Cache transformed variants separately from canonical retrieval responses.

## 8. Streaming Renderer And UI Reconstruction

### Renderer Input Contract
- `sessionId`.
- Routed intent.
- Retrieval bundle.
- Optional transformation output.
- Existing session context for replay-safe insertion and suggestion updates.

### Panel Model
```json
{
  "panelId": "panel_events_upcoming_01",
  "kind": "event_list",
  "sourceIntentId": "intent_open_events_upcoming_01",
  "entityRefs": ["event_intro_to_llms_2026_07_12", "event_ai_ethics_panel_2026_07_26"],
  "status": "complete",
  "expanded": true,
  "blockIds": ["block_summary_01", "block_cards_01"]
}
```

### Event Types Emitted To The UI
| Event type | Purpose |
| --- | --- |
| `session_started` | Creates a new logical session if one does not exist. |
| `intent_resolved` | Records the routed intent and its confidence. |
| `panel_added` | Adds a new panel shell to the UI. |
| `text_stream_started` | Starts a progressive text block. |
| `text_stream_delta` | Appends streaming text content. |
| `text_stream_completed` | Finalizes a text block. |
| `panel_expanded` | Marks a panel as expanded. |
| `panel_collapsed` | Marks a panel as collapsed. |
| `suggestions_updated` | Replaces the visible guided prompt set. |

### Progressive Assembly Rules
- `panel_added` must arrive before any content deltas for that panel.
- `text_stream_delta` events append to a block identified by `blockId`; they do not carry HTML.
- A renderer may batch deltas internally, but persisted logs store the original event order.
- Suggestion updates replace the current suggestion row atomically.

### Replay Rules
- Replay starts from the stored event log plus referenced canonical bundles.
- Expand/collapse state is derived from the latest relevant panel event.
- Missing transformed variants fall back to deterministic bundle rendering without changing panel identity or order.
- Replay must reproduce panel order, visible text, and suggestion context without persisted markup.

### Example Event Log
```json
[
  {
    "eventId": "evt_001",
    "type": "session_started",
    "sessionId": "sess_01",
    "timestamp": "2026-05-29T18:30:00Z"
  },
  {
    "eventId": "evt_002",
    "type": "intent_resolved",
    "intentId": "intent_open_events_upcoming_01",
    "timestamp": "2026-05-29T18:30:01Z"
  },
  {
    "eventId": "evt_003",
    "type": "panel_added",
    "panelId": "panel_events_upcoming_01",
    "kind": "event_list",
    "entityRefs": ["event_intro_to_llms_2026_07_12", "event_ai_ethics_panel_2026_07_26"],
    "timestamp": "2026-05-29T18:30:01Z"
  },
  {
    "eventId": "evt_004",
    "type": "text_stream_started",
    "panelId": "panel_events_upcoming_01",
    "blockId": "block_summary_01",
    "timestamp": "2026-05-29T18:30:01Z"
  },
  {
    "eventId": "evt_005",
    "type": "text_stream_delta",
    "panelId": "panel_events_upcoming_01",
    "blockId": "block_summary_01",
    "text": "Next up is Intro to LLMs Workshop...",
    "timestamp": "2026-05-29T18:30:01Z"
  },
  {
    "eventId": "evt_006",
    "type": "text_stream_completed",
    "panelId": "panel_events_upcoming_01",
    "blockId": "block_summary_01",
    "timestamp": "2026-05-29T18:30:02Z"
  },
  {
    "eventId": "evt_007",
    "type": "suggestions_updated",
    "promptIds": ["prompt_join_club", "prompt_team_overview"],
    "timestamp": "2026-05-29T18:30:02Z"
  }
]
```

## 9. Session Persistence And Shareable URLs

### Persistence Contract
- Session IDs are opaque strings such as `sess_01` or `sess_2026_05_29_a1b2`.
- Persisted sessions store versioned event/state metadata, not raw markup.
- Stored metadata includes ordered event log, current panel states, retrieval references, and suggestion context.
- Derived UI such as rendered card markup, expanded summaries, and animation state is regenerated on hydration.

### Share Model
- Canonical shared URLs use `?session=<sessionId>&v=1`.
- The session record behind that URL must be sufficient to replay the experience without hidden client-only state.
- Session expiry and cleanup are operational concerns, but expired sessions must fail with a clear recovery state instead of a broken UI.

### Session Hydration Flow
1. Load the base shell.
2. Read `session` and `v` from the URL.
3. Fetch persisted session metadata.
4. Resolve referenced retrieval bundles and transformed variants.
5. Replay the event log to reconstruct panels and suggestion state.
6. Fall back to deterministic rendering if any transformed variant is missing.

### Example Persisted Session Payload
```json
{
  "version": "1.0",
  "sessionId": "sess_2026_05_29_a1b2",
  "startedAt": "2026-05-29T18:30:00Z",
  "events": [
    {
      "eventId": "evt_001",
      "type": "session_started",
      "timestamp": "2026-05-29T18:30:00Z"
    },
    {
      "eventId": "evt_002",
      "type": "intent_resolved",
      "intentId": "intent_open_events_upcoming_01",
      "timestamp": "2026-05-29T18:30:01Z"
    },
    {
      "eventId": "evt_003",
      "type": "panel_added",
      "panelId": "panel_events_upcoming_01",
      "kind": "event_list",
      "entityRefs": ["event_intro_to_llms_2026_07_12", "event_ai_ethics_panel_2026_07_26"],
      "timestamp": "2026-05-29T18:30:01Z"
    },
    {
      "eventId": "evt_004",
      "type": "text_stream_started",
      "panelId": "panel_events_upcoming_01",
      "blockId": "block_summary_01",
      "timestamp": "2026-05-29T18:30:01Z"
    },
    {
      "eventId": "evt_005",
      "type": "text_stream_delta",
      "panelId": "panel_events_upcoming_01",
      "blockId": "block_summary_01",
      "text": "Next up is Intro to LLMs Workshop...",
      "timestamp": "2026-05-29T18:30:01Z"
    },
    {
      "eventId": "evt_006",
      "type": "text_stream_completed",
      "panelId": "panel_events_upcoming_01",
      "blockId": "block_summary_01",
      "timestamp": "2026-05-29T18:30:02Z"
    },
    {
      "eventId": "evt_007",
      "type": "suggestions_updated",
      "promptIds": ["prompt_join_club", "prompt_team_overview"],
      "timestamp": "2026-05-29T18:30:02Z"
    }
  ],
  "panelStates": [
    {
      "panelId": "panel_events_upcoming_01",
      "kind": "event_list",
      "expanded": true,
      "entityRefs": ["event_intro_to_llms_2026_07_12", "event_ai_ethics_panel_2026_07_26"],
      "status": "complete"
    }
  ],
  "suggestionContext": {
    "activePromptIds": ["prompt_join_club", "prompt_team_overview"],
    "sourceIntentId": "intent_open_events_upcoming_01"
  },
  "retrievalRefs": [
    {
      "queryKey": "entity=event|status=upcoming|sort=startAt:asc|limit=3|locale=en|rev=content_2026_05_25",
      "bundleId": "bundle_events_upcoming_en_v1"
    }
  ],
  "llmVariantRefs": [
    {
      "variantKey": "friendly_summary|bundle_events_upcoming_en_v1|policy_v1|locale_en",
      "bundleId": "bundle_events_upcoming_en_v1"
    }
  ]
}
```

## 10. Caching And Delivery Strategy

### Cache Layers
- Static shell: HTML, JS, CSS, and static assets.
- Canonical retrieval cache: deterministic bundle responses.
- Transformed variant cache: optional LLM-derived summaries or tone variants.
- Session cache or store: persisted replay metadata.
- Live generation fallback: on-demand transformation only when no valid variant exists.

### Cache Keys
- Static shell: build hash.
- Retrieval cache: `schemaVersion + locale + queryKey + contentRevision`.
- Transformed variant cache: `bundleId + presentationGoal + modelPolicyVersion + locale`.
- Session persistence: `sessionId + version`.

### Invalidation Rules
- Content edits invalidate retrieval caches that reference the changed entity types or IDs.
- Schema changes invalidate all retrieval and session compatibility checks for older versions.
- Guardrail or prompt-template changes invalidate transformed variants only.
- Static asset changes invalidate the shell cache only.

### Stale Serving Rules
- Static shell and deterministic retrieval bundles may be served stale while revalidating.
- Transformed variants may be served stale only if they still map to the same bundle ID and policy version.
- Expired or incompatible sessions must not replay against mismatched schema versions silently.

### Deterministic Fallback Behavior
- If only deterministic content is available, the UI still renders the full panel set and suggestion flow.
- Loss of the LLM layer downgrades presentation quality, not correctness.

## 11. Frontend/Backend Boundary

### Boundary Principles
- Frontend code depends on versioned request/response schemas, not service internals.
- The first implementation may use local mocks or repo adapters, but they must honor the same contracts as future services.
- Streaming uses Server-Sent Events for browser simplicity and progressive rendering.

### API Surface
| Endpoint | Purpose |
| --- | --- |
| `POST /api/v1/intent/resolve` | Convert an allowed UI action into a supported intent. |
| `POST /api/v1/content/query` | Return deterministic retrieval bundles. |
| `POST /api/v1/render/stream` | Stream renderer events for a request lifecycle. |
| `GET /api/v1/sessions/:sessionId` | Fetch persisted session metadata for hydration. |
| `PUT /api/v1/sessions/:sessionId` | Save or replace versioned session metadata. |

### Error Envelope
```json
{
  "version": "v1",
  "requestId": "req_01",
  "error": {
    "code": "unsupported_intent",
    "message": "The request is outside the supported guided actions.",
    "retryable": false,
    "fallbackPromptIds": ["prompt_upcoming_events", "prompt_join_club"]
  }
}
```

### Example Render API Contract
Request:
```json
{
  "actionId": "act_01",
  "sessionId": "sess_2026_05_29_a1b2",
  "action": {
    "source": "guided_prompt",
    "promptId": "prompt_upcoming_events",
    "rawText": null
  },
  "context": {
    "activeSectionId": "home",
    "visiblePanelIds": [],
    "selectedEntityIds": []
  }
}
```

SSE response:
```text
event: session_started
data: {"eventId":"evt_001","sessionId":"sess_2026_05_29_a1b2"}

event: intent_resolved
data: {"eventId":"evt_002","intentId":"intent_open_events_upcoming_01","type":"open_section"}

event: panel_added
data: {"eventId":"evt_003","panelId":"panel_events_upcoming_01","kind":"event_list"}
```

### Versioning Expectations
- Any change to shared schemas, event types, or persistence payloads increments the contract version.
- Additive fields are preferred over field renames.
- Frontend mocks must stay version-matched with backend contracts in CI.

## 12. Testing Strategy And Contract Examples

### Required Test Categories
- Schema validation tests for canonical content.
- Intent routing tests.
- Retrieval determinism tests.
- LLM guardrail tests.
- Renderer replay and reconstruction tests.
- Session serialization and deserialization tests.
- Cache key consistency tests.
- Unsupported-query behavior tests.

### Test Matrix
| Test name | Subsystem owner | Input fixture | Expected output | Contract being protected |
| --- | --- | --- | --- | --- |
| `schema-event-valid` | Backend or content | `event_intro_to_llms_2026_07_12` | Passes validation with stable required fields | Canonical content schema |
| `router-show-team` | AI/routing | `prompt_team_overview` click | Returns `show_team` with deterministic team query | Router input/output boundary |
| `router-unsupported-query` | AI/routing | Freeform text outside scope | Returns `suggest_next` and fallback prompt IDs | No chatbot improvisation |
| `retrieval-events-sort` | Backend/APIs | Upcoming event query | Returns events sorted by `startAt`, then `id` | Retrieval determinism |
| `llm-locked-fields` | AI/routing | Transform request for event bundle | Rejects output if `title` or `startAt` changes | LLM guardrail boundary |
| `renderer-no-llm` | Frontend/rendering | Retrieval bundle with LLM disabled | Produces complete panel with deterministic text | Graceful degradation |
| `replay-panel-order` | Frontend/rendering | Persisted session `sess_2026_05_29_a1b2` | Reconstructs the same panel order and visible prompts | Event log replay contract |
| `session-roundtrip` | Backend/APIs | Persist then reload session payload | Loaded payload matches saved versioned metadata | Session serialization format |
| `cache-key-bundle-stability` | Infrastructure | Same query, same content revision | Identical retrieval cache key | Cache consistency |
| `cache-key-variant-split` | Infrastructure | Same bundle, different tone goal | Different variant cache key | Canonical vs transformed cache separation |

### Minimum Shared Fixtures
- One public upcoming event fixture.
- One past event fixture.
- One executive team fixture.
- One guided prompt fixture for each supported intent type.
- One persisted session fixture with at least one completed panel and one suggestion update.

## 13. Team Ownership And Parallel Work Model
- Frontend/rendering owns panel models, animation, stream presentation, hydration, and replay behavior.
- Backend/APIs own content query services, session persistence, cache orchestration, and versioned response envelopes.
- AI/routing owns intent classification, fallback behavior, safe transformation contracts, and guardrail validation.
- Infrastructure/CI owns deployment, preview environments, schema validation in CI, cache policy enforcement, and observability.
- Shared schemas, mock payloads, event contracts, and versioning rules are joint ownership and require cross-team agreement.

## 14. Governance And Change Control
- Subsystem owners may change internal implementation freely if public contracts remain stable.
- Changes to shared schemas, event types, persistence formats, or architectural invariants require short RFC-style review.
- UI presentation may iterate quickly as long as replayability and contract stability remain intact.
- The architecture should be reviewed again after the first major redesign and then re-frozen.

## 15. Delivery Phases
1. Vertical slice: one guided prompt, one intent, one retrieval path, one rendered panel, one persisted session.
2. Session replay slice: serialize event/state metadata and reconstruct the interface on reload.
3. Optional LLM slice: summarize or paraphrase deterministic content while enforcing locked-field guardrails.
4. Caching and sharing slice: add cache keys, transformed variants, and shareable session URLs.
5. UX expansion slice: add richer prompt sets, more panel types, and contextual transitions without changing core contracts.

## Implementation Success Markers
- Two junior teams can work against the same schemas and event contracts without frequent re-alignment.
- A saved session replays without persisted HTML.
- Turning the LLM off still yields a coherent guided experience.
- Canonical content remains authoritative in every render mode.
- Integration points are protected by shared fixtures and CI-visible contract tests.
