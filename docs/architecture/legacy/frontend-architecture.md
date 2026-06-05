# Frontend Architecture

## Composition Flow
- `src/index.js` mounts `App` inside `BrowserRouter`.
- `src/App.js` applies global styles, injects the dark theme, configures `LocomotiveScrollProvider`, and renders one scroll container.
- The page is assembled in a fixed sequence: `Home`, `About`, `Events`, `Team`, `Join`.

This is effectively a section-composed landing site, not a route-composed multi-page frontend.

## Section Model
- Each major section is rendered as a top-level `<section>` with an `id` and `data-scroll-section`.
- Current IDs are `home`, `about`, `events`, `team`, and `join`.
- `Home` is a wrapper around the hero video and logo.
- `About` combines club copy, gallery configuration, and parallax motion in one file.
- `Events` combines event content, event UI state, sign-up behavior, and previous-event expansion behavior.
- `Team` contains the full org structure and team member assets inline.
- `Join` contains CTA copy, external form URLs, and social links.

## Navigation And Scroll Coupling
- `src/components/Nav.js` renders a fixed menu whose links target in-page anchors like `#about` and use Locomotive Scroll when available.
- `src/components/ScrollIndicator.js` is a second navigation system that computes the active section from DOM positions and scroll state.
- Both components depend on the same section IDs and scroll offsets.
- Any section rename, reorder, removal, or addition must update both navigation systems together.

## Shared UI Components
- `CoverVideo.js` renders the full-screen hero video, dark overlay, title animation, and subtitle scatter animation.
- `Logo.js` renders a top-left logo that links to `/` through `react-router-dom`.
- `Nav.js` and `ScrollIndicator.js` are global fixed-position UI layers over the scroll container.

## Styling System
- Styling is implemented with `styled-components`.
- `src/styles/GlobalStyles.js` provides reset rules, font imports, and width/overflow assumptions for `#root` and `[data-scroll-container]`.
- `src/styles/Themes.js` provides the single dark theme and shared tokens for colors, nav height, and typography sizes.
- The theme token names currently use `frontxs`, `frontsm`, `frontmd`, and similar spellings. This is a codebase quirk that should be treated as debt, not a preferred naming convention.

## Motion Model
- Framer Motion is used for reveal, fade, and expand/collapse interactions.
- Locomotive Scroll is used for smooth scrolling and parallax-style effects.
- Motion behavior is embedded directly in section and component implementations rather than isolated in a dedicated animation layer.
- This approach is simple for a small site, but it means structural refactors can easily affect interaction behavior.

## Content Placement Today
- `About.js` stores gallery content inline inside the component.
- `Events.js` stores separate `upcomingEvents` and `previousEvents` arrays with different field shapes.
- `Team.js` stores a large `teamStructure` array, and the `vp` field is inconsistent across entries: object, array, or `null`.
- `Join.js` stores operational constants such as form links and social URLs at file scope.

The current frontend is maintainable for a small team, but the architecture makes content updates harder than they need to be because the content model is spread across UI files.

## Assets And Dependencies
- Media assets live under `src/assets/Images/` plus the hero video in `src/assets/background.mp4`.
- The frontend depends on React 17, Create React App, styled-components, framer-motion, locomotive-scroll, and react-router-dom.
- External runtime dependencies include Google Forms and club social platforms.

## Architecture Notes For Future Refactors
- Do not document the app as route-based unless page routing is actually introduced.
- Preserve the `data-scroll-section` and section ID contracts while Locomotive Scroll remains in place.
- If content is externalized, normalize content shapes before treating them as reusable contracts.
