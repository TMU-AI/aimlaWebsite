# TMU AIMLA Website

Modern single-page site for TMU AIMLA, built with React, styled-components, and Locomotive Scroll.

## Quick Start
1) Install deps: `npm install`
2) Run dev server: `npm start`
3) Build for production: `npm run build`

## Key Paths
- `src/App.js` — page composition and scroll provider
- `src/components/ScrollIndicator.js` — right-side section nav
- `src/sections/*.js` — content sections (Home, About, Events, Team, Join)
- `src/styles/Themes.js` — theme tokens (colors, typography, nav height)

## Editing Content
- About copy: `src/sections/About.js`
- Events data (sign-up toggles): `src/sections/Events.js` → `upcomingEvents`
  - Set `signUpOpen: true` and `signUpLink: "https://..."` to enable the button
- Team structure: `src/sections/Team.js`
- Join CTA links/socials: `src/sections/Join.js` (`JOIN_FORM_URL`, `COLLAB_FORM_URL`, `SOCIAL_LINKS`)

## Assets & Icons
- Favicon/app icon: `public/aimla-logo.png` (replace with your transparent logo as needed)
- Media: `src/assets/Images/`

## Styling Notes
- Global theme: `src/styles/Themes.js`
- Global styles/fonts: `src/styles/GlobalStyles.js`
- Locomotive scroll sections use `data-scroll-section` on each section

## Deployment
- Build: `npm run build`
- Serve `build/` with your hosting of choice (e.g., static host or CDN)

## Contribution
PRs welcome. Keep styling consistent (styled-components) and prefer `rg` for search. Include smooth scroll IDs when adding new sections.
