# Codify Arena Developer Guide

## Quick Start
1. Install deps: `npm install`
2. Start dev server: `npm run dev`
3. Open the local Vite URL.

## Read These First
1. `ARCHITECTURE.md`
2. `FRONTEND_MAP.md`
3. `BACKEND_INTEGRATION_PLAN.md`

## Where To Change What
- Theme/styling: `src/styles/globals.css`
- Routes: `src/App.jsx`
- Navbar and global nav behavior: `src/components/Navbar.jsx`
- Dashboard layout/content: `src/pages/Dashboard.jsx`
- Problem workspace/editor view: `src/pages/Problem.jsx`
- Profile tabs/sections: `src/pages/Profile.jsx`
- Mock data contract: `src/data/mockData.js`

## Backend-First Implementation Order
1. Auth (`/login`, `/signup`, `/me`)
2. Dashboard payload (`/dashboard`)
3. Problem fetch + submit/run endpoints
4. Leaderboard scopes
5. Profile + activity + badges

## Suggested Near-Term Refactor
- Add `src/api/` services.
- Add `src/context/AuthContext.jsx` for session state.
- Add `RequireAuth` wrapper for protected routes.
- Move repeated section headers/cards into smaller shared components.

## Notes
- UI currently uses mock data only.
- Timers and progress visuals are client-side simulated.
- Replace mocked values incrementally to avoid large breakages.
