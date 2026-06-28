# Derrick Content Streaming Guidance

## Purpose
Derrick owns the content and streaming boundary: take a resolved page ID, retrieve the right content, and display it cleanly with typewriter-style streaming.

This work should stay focused on content retrieval, tokenization, and presentation behavior.

## Responsibility
- Store and retrieve canonical page content by page ID.
- Tokenize text for streaming behavior.
- Stream content in a way that supports the UI.
- Keep content handling separate from resolver logic.

## Contract
### `tokenize_text(input_text: str) -> string[]`
- Input: a text string.
- Output: an ordered list of tokens.
- Expected behavior:
  - split text predictably
  - preserve a useful reading order
  - avoid mutating the source text

### `stream_text_tokens(input_tokens: string[], delay: int) -> None`
- Input: token list and delay in milliseconds.
- Output: none.
- Expected behavior:
  - emit tokens one at a time
  - keep streaming behavior isolated from resolver logic
  - support later UI integration without changing the contract

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
