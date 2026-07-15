# Repo Layout Summary

## Instructions from Oliver

- Feature work can be done directly on the release branch now. Commit your changes every time you feel you've made a change worth documenting (kind of like a save state in a video game), and push your changes to the repo at the end of every work session, but NEVER push any changes that causes errors (if you do, just fix it in a future commit. Don't undo any commits for now since those require great care). 
- We're gonna practice collaborative coding now and working in an environment where your code affects other people. It might get messy if you modify the same files and fail to pull those changes before you start (this is where merge conflicts occur). 
- But since I've modularized the codebase and given you guys strictly separate functionalities to work on, it shouldn't be a problem. 
- This will teach you guys the importance of good version control practices now that your code will be interacting. It will also hopefully motivate CI/CD workflows (continuous testing), which is supposed to help mitigate merge conflicts.


# Repo Restructure Overview

The codebase is organized around a thin app shell, a deterministic resolver layer, and canonical content modules.

## Main Areas

- `src/resolver/`: resolver logic only. This is where normalization, aliasing, and destination matching live.
- `src/content/`: destination data only. This holds the canonical text, labels, IDs, fallback copy, and content registry.
- `src/hooks/`: wiring between resolver output, streaming state, and UI behavior.
- `src/app/`: app-level shell constants and route/configuration data.
- `src/components/`: presentational UI components.
- `src/styles/`: global styles and theme tokens.
- `src/App.js`: thin composition layer that connects everything.
- `src/sections/`: legacy scroll-based page sections kept as reference modules.
- `src/resolver/resolver.js`: experimental ML resolver prototype, not used by the main app.

## Instructions for Development

- On a fresh checkout, run `npm install` once.
- Run `npm start` to launch the CRA dev server.
- Save files to see resolver, content, hook, component, and app-shell changes hot-reload in the browser.
- Resolver and streaming logic are already wired into the main webapp through `src/hooks/useResolvedDestination.js` and `src/App.js`.

## Ownership Split

- Gab: resolver logic in `src/resolver/`
- Derrick: text streaming and content retrieval in `src/hooks/` and `src/content/`
- The legacy prototype files under `src/resolver/` and `src/sections/` should be treated as reference/transition code unless explicitly re-integrated.

## Dependency Flow

```text
App -> hook -> resolver + content
App -> app/routes + app/shell
App -> components/styles
```

## Files To Touch For Feature Work

- Resolver / intent matching: `src/resolver/normalizeInput.js`, `src/resolver/matchDestination.js`, `src/resolver/aliases.js`, `src/resolver/index.js`, `src/resolver/index.test.js`
- Content / copy updates: `src/content/index.js`, `src/content/homepage.js`, `src/content/schema.js`, and destination modules under `src/content/destinations/`
- Streaming / state behavior: `src/hooks/useResolvedDestination.js`
- UI layout / refinement: `src/App.js`, `src/components/`, `src/styles/`
- App-level routes and shell constants: `src/app/`
- Legacy scroll-based reference work only if intentionally migrating old behavior: `src/sections/` and `src/resolver/resolver.js`

## Junior Rules

- Matching changes go in `src/resolver/`.
- Text/content changes go in `src/content/`.
- Streaming/state changes go in `src/hooks/`.
- Layout changes go in `src/components/` or the wiring in `src/App.js`.
- Prototype or legacy scroll-section changes should stay isolated unless the team chooses to migrate them back into the main app.

## Documentation Note

- Top-of-file docstrings were added across `src/` to make module purpose obvious at a glance.
- These comments are meant to model good documentation practice for juniors and to reinforce the boundary between resolver, content, hook, and UI modules.
