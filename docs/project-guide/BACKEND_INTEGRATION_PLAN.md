# Backend Integration Plan

## 1) Introduce API Layer
Create:
- `src/api/client.js` (fetch wrapper)
- `src/api/endpoints.js` (route constants)
- `src/api/services/*.js` (domain services)

Example domains:
- `authService.js`
- `userService.js`
- `problemService.js`
- `submissionService.js`
- `leaderboardService.js`
- `badgeService.js`

## 2) Replace Mock Imports Incrementally
Current pages import `mockData.js` directly.
Migration approach:
1. Keep mock as fallback.
2. Fetch real data in `useEffect`.
3. Swap UI to API response.
4. Remove mock fallback once stable.

## 3) Recommended Initial API Contract
- `POST /auth/login`
- `POST /auth/signup`
- `GET /me`
- `GET /dashboard`
- `GET /problems/:id`
- `POST /submissions/run`
- `POST /submissions/submit`
- `GET /leaderboard?scope=global|friends|weekly|monthly`
- `GET /users/:handle/profile`
- `GET /users/:handle/activity`

## 4) Suggested Response Shapes
- `GET /dashboard`
  - user summary
  - xp progress
  - continue problems
  - daily challenge with reset timestamp
  - topic progress
  - streak matrix
  - mini leaderboard
  - recent badges

- `GET /problems/:id`
  - metadata (difficulty/tags/xp)
  - statement/examples/constraints
  - starter code by language
  - latest submissions snippet

## 5) Auth + Session
- Use JWT in `HttpOnly` cookie if possible.
- Add `GET /me` for session hydration.
- Frontend startup flow:
  1. On app load, call `/me`.
  2. If authenticated, hydrate user context.
  3. If not, keep public routes accessible and guard private routes.

## 6) Add Route Guards
Create:
- `src/components/RequireAuth.jsx`
Wrap protected pages (`/dashboard`, `/problem/1`, `/leaderboard`, `/profile`) once auth is active.

## 7) Real-Time/Timers
- For daily reset, prefer backend-sent `resetAt` timestamp.
- Countdown should compute from server time to avoid client drift.

## 8) Error Handling
- Standardize API error shape:
  - `{ code, message, details? }`
- Add toast or inline error component for:
  - auth failures
  - submission failures
  - leaderboard fetch failures

## 9) Testing Priorities
- Unit test `XPBar`, `CountdownTimer`, route guards.
- Integration test critical routes with mocked API.
- E2E: login → dashboard → open problem → submit.

## 10) Production Readiness Checklist
- Loading skeletons on all data-bound panels
- Empty states (no submissions/badges)
- Retry behavior for transient failures
- Accessibility pass (keyboard/focus/contrast)
- Performance pass (split heavy pages, memoize large grids)
