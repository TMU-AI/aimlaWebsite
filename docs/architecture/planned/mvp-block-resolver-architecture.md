# MVP Block Resolver Architecture

## Status
- This document is the implementation source of truth for the first website rewrite MVP.
- This MVP is a clean-slate rewrite. The current website structure, section IDs, scroll model, and component hierarchy are not constraints.
- The only inherited operational constraint is that deployment must remain straightforward on Vercel.
- `docs/architecture/legacy/system-overview.md` and `docs/architecture/legacy/frontend-architecture.md` remain historical context only.
- `docs/architecture/planned/ai-native-website-architecture.md` describes the later expansion path, not the MVP requirement set.

## 1. Purpose And MVP Framing
- The MVP is a constrained block or page selector for club information.
- The system accepts limited user input and resolves it to one allowlisted destination or a deterministic fallback state.
- Canonical content is structured, repo-managed, and rendered through known UI blocks.
- The first rewrite is intentionally narrow so junior contributors can implement it without drifting into chatbot behavior or service-heavy architecture.

## What The MVP Is Not
- Not a general chatbot.
- Not a streaming panel renderer.
- Not a session replay or shareable-session system.
- Not an LLM-owned content system.
- Not a backend-first product.

## 2. Architectural Invariants
- The resolver may return only allowlisted destination IDs.
- Unsupported input must return deterministic fallback suggestions.
- Canonical content is structured and stored in the repo.
- Rendered output is selected from known destinations, not generated ad hoc.
- The MVP must remain deployable on Vercel with a simple frontend-first runtime model.
- Backend persistence, streaming, and LLM augmentation are out of scope for the MVP.
- Any future AI layer may change presentation only and must not own canonical facts.

## 3. System Shape
The MVP is a simple deterministic pipeline:

```text
User input
  -> Input normalization
  -> Block resolver
  -> Valid destination ID or fallback suggestions
  -> Structured content lookup
  -> Render selected page or block
```

### System Notes
- A destination may be implemented as a route, a view-state target, or another simple frontend mechanism.
- The architecture does not assume a single-page scroll layout.
- The architecture does not inherit current section IDs or anchor behavior.
- The resolver is thin application logic, not a general intent-routing platform.

## 4. Valid Destination Model
The MVP output space is intentionally small and allowlisted.

| Destination ID | Label | MVP meaning | Allowed implementation |
| --- | --- | --- | --- |
| `about` | About AIMLA | Club overview, mission, and core intro content | Route or view |
| `events` | Events | Upcoming and past event content | Route or view |
| `members` | Members | Team, groups, or roster information | Route or view |
| `join` | Join AIMLA | CTA content, forms, and participation paths | Route or view |
| `contact` | Contact | Contact channels and external links | Route or view |

### Rules
- Destination IDs are stable contracts.
- The resolver may return only IDs from this table.
- New destinations require an explicit schema, renderer target, and test coverage.
- The output model is defined in product terms, not by mirroring the current site.

## 5. Resolver Contract
The resolver converts limited user input into one destination match or a fallback state.

### Accepted Inputs
- Guided prompt click.
- Button or chip selection.
- Short keyword text.
- Search-like query with simple club-information intent.

### Normalization Rules
- Trim whitespace.
- Lowercase text before matching.
- Collapse repeated spaces and punctuation noise.
- Match approved aliases before falling back.
- Do not infer destinations outside the allowlist.

### Output Shape
```json
{
  "match": "events",
  "confidence": "high",
  "reason": "keyword_match"
}
```

### Fallback Shape
```json
{
  "match": null,
  "confidence": "low",
  "reason": "unsupported_request",
  "suggestions": ["about", "events", "join"]
}
```

### Resolver Rules
- The resolver never returns arbitrary destinations.
- The resolver never returns freeform answers.
- The resolver never invents facts, summaries, or IDs.
- Confidence is minimal and discrete: `high` for direct matches, `low` for fallback.

### Example Alias Mapping
| Input | Normalized form | Output |
| --- | --- | --- |
| `Upcoming events` | `upcoming events` | `events` |
| `team?` | `team` | `members` |
| `how do I join?` | `how do i join` | `join` |
| `email` | `email` | `contact` |

## 6. Structured Content Model
The render target is the destination. The maintainable source of truth is the structured content inside that destination.

### Content Ownership
- Content is repo-managed and deterministic.
- The rewrite should store canonical destination content under a dedicated structured content directory such as `src/content/`.
- UI components read structured content; they do not own canonical copy inline.

### Minimum Destination Shapes
| Destination | Required fields | Optional fields |
| --- | --- | --- |
| `about` | `id`, `title`, `summary`, `bodyBlocks` | `mediaItems`, `links` |
| `events` | `id`, `title`, `intro`, `upcomingItems`, `pastItems` | `links`, `emptyState` |
| `members` | `id`, `title`, `groups` | `summary`, `links` |
| `join` | `id`, `title`, `ctaBlocks` | `formLinks`, `faqLinks` |
| `contact` | `id`, `title`, `channels` | `socialLinks`, `officeHours` |

### Shared Validation Rules
- IDs are stable once published.
- Dates use ISO 8601 strings.
- Links use absolute HTTPS URLs or approved internal paths.
- Visibility, if used, must be explicit and deterministic.

### Example Block Schema
```json
{
  "id": "events",
  "title": "Events",
  "intro": "Workshops, talks, and community sessions from AIMLA.",
  "upcomingItems": ["event_intro_to_llms_2026_07_12"],
  "pastItems": [],
  "links": [
    {
      "label": "See all events",
      "url": "/events"
    }
  ]
}
```

### Example Normalized Event Record
```json
{
  "id": "event_intro_to_llms_2026_07_12",
  "title": "Intro to LLMs Workshop",
  "status": "upcoming",
  "startAt": "2026-07-12T17:00:00-04:00",
  "endAt": "2026-07-12T19:00:00-04:00",
  "summary": "Hands-on workshop for members who want a practical introduction to large language models.",
  "location": "ENG 103",
  "registrationUrl": "https://example.com/register/intro-to-llms",
  "visibility": "public"
}
```

## 7. Rendering Contract
- The UI receives a resolved destination ID and renders the matching destination.
- The frontend may implement destination changes with routes, view state, or another simple client-side mechanism.
- The renderer is not required to support conversational composition, progressive streaming, or session replay.
- Unsupported input may render a deterministic fallback view with suggestions.
- The final implementation should stay compatible with static or near-static deployment on Vercel.

## 8. Unsupported Input Behavior
Unsupported input is the main anti-chatbot guardrail.

### Rules
- Unsupported input does not produce generated answers.
- The system returns a constrained fallback state.
- Fallback content may be friendly in tone but must remain deterministic.
- Fallback suggestions must come from the allowlisted destination set.

### Example
- Input: `Tell me about AI jobs in Toronto`
- Output: no generated answer, plus fallback suggestions such as `about`, `events`, and `join`

## 9. Deployment And Runtime Assumptions
- Deployment must remain viable on Vercel.
- The frontend should prefer static assets and simple runtime behavior where possible.
- Serverless functions are optional, not required.
- The MVP should avoid long-lived backend sessions, streaming dependencies, and infrastructure that complicates Vercel hosting.
- Any later runtime complexity must be justified by a concrete product need, not by speculation.

## 10. MVP Test Matrix
| Area | Example case | Expected result |
| --- | --- | --- |
| Resolver match | Input `events` | Returns `match: "events"` |
| Resolver match | Input `team` | Returns `match: "members"` |
| Alias mapping | Input `how do i join` | Returns `match: "join"` |
| Resolver fallback | Input `Tell me about AI jobs in Toronto` | Returns `match: null` with deterministic suggestions |
| Content validation | Event record missing `startAt` | Validation fails |
| Render target | Resolved `contact` | UI renders contact destination |
| Deployment smoke | Production build on Vercel | Build succeeds without backend dependency |

## 11. Ownership And Parallel Work
- Frontend: implement destination rendering, navigation or selection UI, and fallback state.
- Content/data: define structured destination files, normalize schemas, and validate canonical content.
- Resolver logic: implement normalization, alias mapping, and constrained matching.
- Architecture owner: preserve compatibility with future AI-native evolution without importing that complexity into the MVP.

## 12. MVP Scope Versus Later AI-Native Scope
| Topic | MVP block resolver | Later AI-native architecture |
| --- | --- | --- |
| User interaction | Constrained destination selection | Richer guided interaction |
| Resolution layer | Thin resolver returning destination IDs | Intent routing and retrieval contracts |
| Content output | Deterministic structured destination content | Deterministic retrieval plus optional AI presentation |
| Rendering | Single destination or fallback view | Multi-panel or streamed presentation if needed later |
| Runtime | Frontend-first, Vercel-friendly | More services only if product needs prove them |

## 13. Evolution Path
- Keep stable destination IDs.
- Keep structured content under each destination.
- Keep the resolver as an isolated module.
- Allow a future move from destination selection to finer-grained retrieval such as `events:upcoming`.
- Allow an optional future AI presentation layer that never owns canonical facts.
- Allow future service boundaries only if the rewrite later proves a concrete need.

This MVP is a deterministic destination selector now. It should evolve toward the broader AI-native architecture only by adding richer retrieval and presentation seams without weakening structured content ownership or fallback constraints.
