# Codify Arena Frontend Architecture

## Tech Stack
- React 18
- React Router v6
- Vite
- CSS (single global stylesheet at `src/styles/globals.css`)

## High-Level Structure
- `src/main.jsx`: App bootstrap, router provider, global CSS import.
- `src/App.jsx`: Route table and fallback redirect.
- `src/pages/*`: Route-level screens.
- `src/components/*`: Reusable UI primitives and functional widgets.
- `src/data/mockData.js`: Local mock domain data (user, problems, leaderboard, badges, topics).
- `src/styles/globals.css`: Design tokens, layout utilities, component styles, and animations.

## Routing Map
- `/` → `Landing`
- `/login` → `Login`
- `/signup` → `Signup`
- `/dashboard` → `Dashboard`
- `/problem/1` → `Problem`
- `/leaderboard` → `Leaderboard`
- `/profile` → `Profile`

## Layout Model
- Shared top nav via `Navbar` on app pages.
- Auth pages are centered cards without nav.
- Dashboard uses 3-column layout:
  - Left: profile/stats/action nav
  - Main: learning progress/content
  - Right: mini leaderboard + badges
- Problem page uses 42/58 split layout.

## State Strategy (Current)
- Local component state only (`useState`, `useEffect`).
- Timed UI states:
  - `XPBar`: animated width on mount.
  - `CountdownTimer`: second-by-second decrement.
  - `Profile`, `Problem`: local tab selection.
- No global store yet (Redux/Zustand not added).

## Data Model (Current Mock)
- `user`: profile + progress summary.
- `problems`: challenge cards and problem metadata.
- `leaderboard`: ranking rows.
- `badges`: earned/locked badge catalog.
- `topics`: skill bar percentages.

## Styling System
- Theme tokens in `:root`.
- Utility classes for spacing and text.
- Component-specific classes for nav, cards, tables, editor, heatmap.
- Animations in CSS keyframes for fade, cursor blink, and cell reveal.

## Suggested Backend Boundaries
- Auth: login/signup/session.
- User profile: rank, streak, XP, badge unlocks.
- Problem catalog: metadata, descriptions, constraints.
- Submissions: run/submit history and verdict stats.
- Leaderboard: global/friends/weekly/monthly slices.
- Activity: contribution heatmap and daily streak source.
