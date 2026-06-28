# Gab Resolver Guidance

## Purpose
Gab owns the resolver boundary: take raw user text, normalize it, and map it to a destination page ID.

This work should stay deterministic, testable, and separate from UI or content rendering.

## Responsibility
- Clean and normalize user input before matching.
- Map cleaned input to a known destination ID.
- Keep matching logic isolated from presentation and streaming.
- Prefer small, composable helper functions.

## Current Implementation
- `src/resolver/normalizeInput.js` owns raw-text normalization.
- `src/resolver/matchDestination.js` owns destination matching and returns `{ match, confidence, reason, suggestions }`.
- `src/resolver/index.js` exposes the public `resolveDestination()` entry point.
- Keep these behaviors stable unless the resolver contract itself is being intentionally changed.

## Files to Modify
- `src/resolver/normalizeInput.js`
- `src/resolver/index.js`
- `src/resolver/matchDestination.js`
- `src/resolver/aliases.js`
- `src/resolver/index.test.js`
- any new helper files added under `src/resolver/`

## Files to Avoid
- `src/content/`
- `src/hooks/useResolvedDestination.js`
- `src/components/`
- `src/sections/`
- `src/App.js`, unless a resolver export must be wired into the shell
- the top-level `package.json`, unless a resolver-only dependency is absolutely required and approved

## Good Changes
- improve normalization rules
- add aliases or destination matching logic
- add tests for resolver behavior
- refactor resolver helpers without changing UI code

## Bad Changes
- adding UI state or animations
- editing content text or page copy
- adding token streaming behavior
- wiring layout changes into resolver files
- mixing resolver logic with rendering logic

## Working Rule
If a change touches both resolver logic and UI/content behavior, split it into separate changes or get a reviewer decision before editing across boundaries.

## Testing Expectations
- add or update tests for normalization
- add or update tests for destination matching
- verify unknown input returns `{ match: null, confidence: 0, reason: "no-match", suggestions: [...] }` or the equivalent empty-match fallback used by the resolver
