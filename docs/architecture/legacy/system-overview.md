# System Overview

## Purpose
The TMU AIMLA website is a single-page public-facing site for the club's identity, events, team roster, and joining/collaboration calls to action. The codebase is optimized for a static browser experience rather than a service-backed product.

## Primary Audiences
- Visitors: students, collaborators, sponsors, and community members discovering the club.
- Maintainers: current and future student contributors updating content, visuals, and event information.
- Handoff readers: future execs or developers inheriting the repo and its operating assumptions.

## Runtime Model
- The app is a React 17 Create React App build served as static assets.
- `src/index.js` mounts a single `App` tree inside `BrowserRouter`, but the site does not currently use route-driven page views.
- `src/App.js` renders one `<main data-scroll-container>` and composes the full experience in a fixed section order: `Home`, `About`, `Events`, `Team`, `Join`.
- Navigation is anchor based and depends on DOM section IDs rather than route changes.
- Locomotive Scroll and Framer Motion are part of the runtime behavior, not optional decoration. Several sections depend on `data-scroll-section`, `data-scroll`, `data-scroll-speed`, and `useLocomotiveScroll`.

## System Boundaries
- In scope: static frontend rendering, local content/config, media assets, smooth-scroll navigation, and visual motion.
- External dependencies: Google Forms for join/collaboration flows, social platform links, and static hosting such as Vercel.
- Out of scope today: backend services, authenticated admin tooling, persisted dynamic data, server-side rendering, or route-based application workflows.

## Current Constraints
- The site behaves as a single anchored experience. Adding or renaming sections requires updating both navigation systems that rely on section IDs.
- Most mutable content is embedded directly in React component files, which makes maintenance possible but mixes content, presentation, and interaction logic.
- The project has minimal visible architecture or testing scaffolding beyond the default CRA structure.
- Deployment remains operationally simple because the site can be built and hosted as static files.

## Current-State Risks
- Content updates are spread across multiple section files and use inconsistent data shapes.
- Scroll and animation logic are tightly coupled to presentational components, which raises refactor risk.
- Theme typography tokens use `front*` naming instead of `font*`; treat that as current-state debt rather than a future contract.
- `Nav.js` references `theme.fontmd`, while the theme defines `frontmd`.
- `src/setupTest.js` uses a nonstandard singular filename.
- `public/robot.txt` is present instead of the conventional `robots.txt`.

## Maintainer Guidance
- Treat the current architecture as static-first unless a new requirement clearly needs service ownership.
- Preserve the section ID contract used by navigation and scroll state until both systems are updated together.
- Prefer documenting current behavior honestly before proposing cleanup or normalization work.
