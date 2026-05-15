# WE4FREE Lattice Deck — Project Context

## Current State (2026-05-15)

### What's Built (Stage 1 — Read-Only Observatory)
- **Next.js 16** app router, strict TypeScript, Tailwind CSS dark theme
- **8 pre-rendered pages**: Overview (WE4FREE Pulse briefing), Surface Matrix, Timeline, Messaging, Continuity, Catch Me Up, Settings, Briefing
- **Data layer**: Fully typed mock data at `src/lib/types/` and `src/lib/mock-data.ts`
- **API routes**: `/api/status`, `/api/timeline`, `/api/lanes`, `/api/messages`, `/api/continuity`, `/api/briefing`
- **Briefing contract**: `src/lib/contracts/briefing.ts` — five-card BriefingResponse (Since Last Checked, Active Now, Needs Sean, Autonomy Progress, Most Important Insight)
- **Contract types**: `src/lib/contracts/types.ts` — wire-safe response shapes for all API surfaces
- **Build**: Zero TS errors, all routes compiled and pre-rendered

### Git-Commit Adapter (Real Data Wiring — Stage 1.5)
- **`src/lib/services/git-commit-adapter.ts`**: reads real git log via `execSync`, parses into `GitCommitRaw[]`, transforms into `TimelineEventContract[]`
- `parseGitLog` — splits git log output on `---COMMIT---` delimiter, validates hex hashes
- `inferEventType` — maps conventional commit prefixes → EventType (UNDO checked before REPAIR to avoid shadowing)
- `inferLaneId` — scans subject+body for lane keywords, defaults to `kernel`
- `inferClassification` — maps conventional prefixes → `autonomous`, wip/manual/operator → `operator`
- `getGitTimelineEvents` — orchestrates read+transform with fallbackOnError
- **`/api/briefing` route**: server-side only — merges git events into mock timeline (deduped by id, sorted desc), falls back to mock-only on error; also calls `readGitStatus()` and passes to builder
- **`dataAdapter.ts`**: reverted to client-safe (no `child_process` import); `fetchBriefingData` returns mock-only briefing
- **Card 1 enrichment**: notableChange with severity-colored border, event list (up to 8) with type-colored badges, timestamps, gitRef, git indicator

### Git-Status Adapter + Cards 2-5 Enrichment (Stage 1.6)
- **`src/lib/services/git-status-adapter.ts`**: reads working tree status via `git status --porcelain=2`, parses branch, ahead/behind, staged/modified/conflicted/untracked/stashed counts, isClean, hasDiverged
- **`GitStatusEnrichment` interface** added to `briefing.ts` contract layer — mirrors `GitStatusResult` but decoupled from adapter
- **`buildBriefingFromStatus`** now accepts optional 4th param `gitStatus: GitStatusEnrichment | null`
- **Card 2 (Active Now)**: git uncommitted changes surfaced as blockers with `'control-plane'` laneId
- **Card 3 (Needs Sean)**: iteration counts derived from timeline events grouped by laneId via Map
- **Card 4 (Autonomy Progress)**: derived from continuity + timeline event grouping
- **Card 5 (Most Important Insight)**: priority chain — blockers > decisions > regression cluster ≥2 > drift warnings > regressions > git uncommitted changes
- **Agent version** bumped `1.0.0` → `1.1.0`
- **Duplicate old code removed** from `briefing.ts` — single enriched function + single `computeTrend`

### Test Infrastructure
- **vitest** v1.6.1 installed as dev dependency
- **vitest.config.ts** — path alias `@/` → `src/`, empty PostCSS override for node env
- **37 passing tests** across 3 suites:
  - `tests/dataAdapter/briefing.test.ts` — 7 tests: fetchBriefingData async contract, 5 card-level shape assertions, provenance validation
  - `tests/contracts/briefing-shape.test.ts` — 6 tests: buildBriefingFromStatus, systemHealth triage, passRate computation, notableChange null case
  - `tests/services/git-commit-adapter.test.ts` — 24 tests: parseGitLog (6), inferEventType (8), inferLaneId (4), inferClassification (2), transformCommitToTimelineEvent (2), getGitTimelineEvents integration (1), error fallback (1)
- **CI gate**: `.github/workflows/ci.yml` — typecheck → build → vitest run on every push/PR to main
- **Peer dep**: `--legacy-peer-deps` required (React 19 vs @testing-library/react 14 peer conflict)

### Key Design Decisions
- Git-commit adapter uses `execSync` with 5s timeout, `fallbackOnError` default true
- Server-only modules (child_process) isolated in API routes — never imported client-side
- Git event ids prefixed `git-` + shortHash for namespace separation
- Event dedup by id set prevents mock+git duplicates
- Card 1 type badge colors: PROGRESSION=emerald, REGRESSION=red, REPAIR=blue, UNDO=orange, INFRASTRUCTURE=surface, RECONCILIATION=purple, DUPLICATION=yellow, OVERWRITE=pink
- `GitStatusEnrichment` interface in contract layer for decoupling from adapter
- Card 3 git blockers use `'control-plane'` as laneId — git status is lane-agnostic
- Card 5 insight priority order: blockers > decisions > regression cluster ≥2 > drift warnings > regressions > git uncommitted changes

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
- **Stage 2**: Messaging relay endpoint integration (safe queue, not direct SSH)
- **Stage 3**: Live agent tracking (real-time heartbeats via SSE/websocket)
- **Stage 4**: Evolution intelligence (automatic regression detection)
- **Mobile polish**: Big text mode, one-column layout, screen reader summary views
- **Connect real data**: Replace mock adapters with live Control Plane API endpoints

## Location
- Project root: `S:\WE4FREE-Lattice-Deck`
- Git branch: `main`, remote up to date (latest: `2cbbe3e` — git-status adapter, Cards 2-5 enrichment, duplicate removal pushed 2026-05-15)
