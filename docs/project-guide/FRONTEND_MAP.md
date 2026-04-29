# Frontend Responsibility Map

## Pages
- `src/pages/Landing.jsx`
  - Marketing hero, platform features, onboarding CTA.
- `src/pages/Login.jsx`
  - Email/password entry and OAuth entrypoint UI.
- `src/pages/Signup.jsx`
  - Registration UI + skill/language preferences capture.
- `src/pages/Dashboard.jsx`
  - Learning hub: XP progress, continue cards, daily challenge, skill progress, streak.
- `src/pages/Problem.jsx`
  - Problem details, editor mock, test case panel, submission action area.
- `src/pages/Leaderboard.jsx`
  - Podium + rank table with current-user highlight.
- `src/pages/Profile.jsx`
  - Profile summary, achievements, activity heatmap, submission snapshot.

## Components
- `Navbar.jsx`: global navigation + auth actions.
- `Sidebar.jsx`: dashboard profile card + dashboard-side links.
- `XPBar.jsx`: animated progress track/fill component.
- `ProblemCard.jsx`: reusable challenge/problem preview card.
- `StreakCalendar.jsx`: compact streak cells with reveal animation.
- `BadgeGrid.jsx`: earned/locked badge rendering.
- `HeatmapCalendar.jsx`: seeded yearly activity grid.
- `CountdownTimer.jsx`: live decrementing timer.
- `VerdictPanel.jsx`: accepted verdict summary block.
- `LeaderboardRow.jsx`: table row render with stagger animation support.

## Data File
- `src/data/mockData.js`
  - Central mock contract for all pages.
  - Replace this first when connecting backend.

## Styles
- `src/styles/globals.css`
  - Design tokens
  - Core layout
  - Component styling
  - Animations
