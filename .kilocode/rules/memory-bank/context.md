# WE4FREE Lattice Deck — Project Context

## Current State (2026-05-15)

### What's Built (Stage 1 — Read-Only Observatory)
- **Next.js 15** app router, strict TypeScript, Tailwind CSS dark theme
- **8 pre-rendered pages**: Overview (WE4FREE Pulse briefing), Surface Matrix, Timeline, Messaging, Continuity, Catch Me Up, Settings, Briefing
- **Data layer**: Fully typed mock data at `src/lib/types/` and `src/lib/mock-data.ts`
- **API routes**: `/api/status`, `/api/timeline`, `/api/lanes`, `/api/messages`, `/api/continuity`
- **Briefing contract**: `src/lib/contracts/briefing.ts` — five-card BriefingResponse (Since Last Checked, Active Now, Needs Sean, Autonomy Progress, Most Important Insight)
- **Contract types**: `src/lib/contracts/types.ts` — wire-safe response shapes for all API surfaces
- **Build**: Zero TS errors, all routes compiled and pre-rendered

### Test Infrastructure
- **vitest** v1.6.1 installed as dev dependency
- **vitest.config.ts** — path alias `@/` → `src/`, empty PostCSS override for node env
- **13 passing tests** across 2 suites:
  - `tests/dataAdapter/briefing.test.ts` — 7 tests: fetchBriefingData async contract, 5 card-level shape assertions, provenance validation
  - `tests/contracts/briefing-shape.test.ts` — 6 tests: buildBriefingFromStatus, systemHealth triage (healthy/degraded/critical), passRate computation, notableChange null case
- **CI gate**: `.github/workflows/ci.yml` — typecheck → build → vitest run on every push/PR to main
- **Peer dep**: `--legacy-peer-deps` required (React 19 vs @testing-library/react 14 peer conflict)

### Architecture
- monorepo at session root, git-tracked, pushed to origin
- `lucide-react` for icons, `clsx` / `tailwind-merge` for styling
- Mock data adapters ready for swap-in with real Control Plane/lane endpoints
- No arbitrary shell execution — messaging modeled as governance-safe queued packets

### Lanes
- Archivist, Library, SwarmMind, Kernel, Control Plane
- Realistic mock state with blockers, drift warnings, git divergence, CI failures

### Design System
- Dark high-contrast theme (`surface-900` base)
- Status color system (active/green, idle/gray, blocked/red, quarantined/yellow, syncing/cyan)
- Badge system with 20+ variant types
- Sidebar navigation with responsive mobile toggle
- Accessibility-first (semantic HTML, text labels alongside icons)

## Next Steps
- **Wire one real source**: "Since You Last Checked" from actual timeline/commit activity
- **Stage 2**: Messaging relay endpoint integration (safe queue, not direct SSH)
- **Stage 3**: Live agent tracking (real-time heartbeats via SSE/websocket)
- **Stage 4**: Evolution intelligence (automatic regression detection)
- **Mobile polish**: Big text mode, one-column layout, screen reader summary views
- **Connect real data**: Replace mock adapters with live Control Plane API endpoints

## Location
- Project root: `S:\WE4FREE-Lattice-Deck`
- Git branch: `main`, remote up to date
