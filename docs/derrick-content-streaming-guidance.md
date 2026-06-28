# Derrick Content Streaming Guidance

## Purpose
Derrick owns the content and streaming boundary: take a resolved page ID, retrieve the right content, and display it cleanly with typewriter-style streaming.

This work should stay focused on content retrieval, tokenization, and presentation behavior.

## Responsibility
- Store and retrieve canonical page content by page ID.
- Tokenize text for streaming behavior.
- Stream content in a way that supports the UI.
- Keep content handling separate from resolver logic.

## Current Implementation
- `src/content/index.js` owns canonical destination data and lookup helpers.
- `src/hooks/useResolvedDestination.js` owns the typewriter-style streaming behavior and destination switching.
- `src/content/homepage.js` bridges resolver output to topic/content selection.
- Keep content lookup and streaming concerns inside this layer unless the architecture changes.

## Files to Modify
- `src/content/index.js`
- `src/content/homepage.js`
- `src/content/schema.js`
- any destination modules under `src/content/destinations/`
- `src/hooks/useResolvedDestination.js`
- `src/components/`, only when display wiring needs it
- `src/App.js`, only when wiring content into the shell needs it
- the top-level `package.json`, only when adding a required streaming dependency such as `typed.js`

## Files to Avoid
- `src/resolver/`
- resolver matching helpers
- resolver normalization logic
- route selection logic that belongs to the resolver layer
- legacy prototype files unless the team explicitly decides to reuse them

## Good Changes
- add or update page content maps
- improve tokenization behavior
- add streaming helpers or hooks
- integrate a local streaming library through the top-level `package.json`
- make UI wiring that consumes resolved page IDs

## Bad Changes
- changing intent matching rules
- adding NLP or destination selection code
- moving content ownership into resolver files
- coupling streaming logic to matching logic
- expanding scope into unrelated layout work

## Working Rule
If a change crosses into resolver ownership, stop and split the work instead of mixing the two layers in one edit.

## Testing Expectations
- add or update tests for tokenization
- verify streaming order and basic timing behavior
- verify page ID lookup returns the expected content
- keep content changes easy to inspect and review
