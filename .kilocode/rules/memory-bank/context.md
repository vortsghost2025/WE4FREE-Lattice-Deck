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

### Accessibility & Readability Hardening (Stage 1.7 — completed 2026-05-15)
- **`PageContent` wrapper** (`src/components/layout/page-content.tsx`): `mx-auto w-full max-w-[1400px]`, `narrow` prop → `max-w-3xl`
- **Base typography**: `html { font-size: 17px }`, `body { line-height: 1.6 }` in `globals.css`
- **Card component** (`src/components/ui/card.tsx`): `<section aria-label>`, `headingLevel` prop (default 3), `aria-hidden` on decorative icon
- **StatusDot** (`src/components/ui/status-dot.tsx`): `role="status"`, `aria-label`, sr-only text, `label` prop — status never encoded by color alone
- **Shell layout** (`src/components/layout/shell.tsx`): semantic `<nav>`, `<main>`, skip-to-content link
- **Sidebar** (`src/components/layout/sidebar.tsx`): responsive hamburger (`lg:hidden`, `aria-label="Toggle sidebar"`), slide-in sidebar with `lg:translate-x-0`, **backdrop overlay** (`bg-black/50`, click-to-close, `aria-hidden="true"`)
- **Big Text / Low-Vision Operator Mode**: `useDisplayMode` hook (`src/hooks/use-display-mode.ts`), `html[data-mode="big-text"]` CSS overrides in `globals.css`, Settings toggle with `aria-pressed`, localStorage persistence (`lattice-display-mode`)
- **Focus-visible styles**: indigo outline ring in `globals.css`, no outline on mouse-focus-only
- **`.sr-only` class**: in `globals.css` with `focus:not-sr-only` override
- **Duplicate Header imports** removed from catchup, continuity, messaging pages
- **Contrast hardening**: all `text-neutral-500`/`text-neutral-600` → `text-neutral-400` across timeline, continuity, messaging, catchup, overview, settings (excluded: disabled states, badge variants, dark mode fallbacks, UNKNOWN event type)
- **High-zoom responsiveness**: Matrix table `min-w` removed from th/td (replaced with `whitespace-nowrap`); Continuity `min-w-[800px]`→`[600px]`, step labels `xl:block`→`lg:block`; Timeline stats grid `grid-cols-2` minimum; GateProgress step label `text-[10px]`→`text-xs`; sidebar backdrop overlay for mobile dismiss
- **All 6 pages rewritten** with `PageContent`, `neutral-*` tokens, h1, semantic improvements
- **`surface-*` tokens fully eliminated** from entire `src/` (grep: zero matches)
- **Build verification**: tsc clean, vitest 37/37 pass, next build succeeds (all 16 routes)

### Design System
- Dark high-contrast theme (`neutral-900` base) — `surface-*` tokens fully removed
- Status color system (active/green, idle/gray, blocked/red, quarantined/yellow, syncing/cyan)
- Badge system with 20+ variant types
- Sidebar navigation with responsive mobile toggle + backdrop overlay
- Accessibility-first: semantic HTML, aria-labels, sr-only text, focus-visible rings, big-text mode, skip-to-content link

### Governance Trust Incident (2026-05-15)
- **Incident**: Two major agents (including GLM-5.1 on Lattice Deck) omitted `OUTPUT_PROVENANCE` on Day 16 of the mandate
- **Root cause**: Provenance requirement existed only in prose/docs, not bound to any execution path. "You were told to" was treated as enforcement. It is not.
- **Shared pattern with other incidents** (Ollama local model, journal continuity): instruction remembered in prose, not bound to execution. Write paths exist; read/enforcement paths do not.
- **Remediation applied**: `AGENTS.md` updated with provenance requirement, enforcement status (honor-system only), known gap (chat output path outside all verifiers), classification (not-yet-runtime-enforceable), and aspirational target (pre-output hook / session-start protocol)
- **Current enforcement**: Honor-system only. No runtime check, pre-output hook, or output filter exists for chat-layer provenance.
- **Doctrine established**: Self-report is not sufficient closure. "Implemented" requires live-path proof. Every operator-critical directive needs runtime enforcement, executable verification, or explicit not-yet-enforceable classification with operator acceptance.

### OPORD Standing Watch — Baseline Assessment (2026-05-15 T17:32Z)

**Stage 1 Baseline: PASS with degradations**
- All 16 systemd services `active/enabled` on headless
- Heartbeats healthy: 0-8s age range, no stalls (3 samples over 60s)
- Lane sync: Kernel, Library, SwarmMind SYNCED; **Archivist DIVERGED** (3 commits behind origin: `213336d9`, `c278cf51`, `0942688a`; many local auto-commits ahead)
- Ollama: `active`, `qwen2.5-coder:7b` loaded, bound to Tailscale IP `100.95.40.99:11434` (NOT localhost — `localhost:11434` will fail)
- Headless uptime: ~18.5h, system state `degraded` (3 stale session scopes, cosmetic)

**Stage 2 Watch Cycle: PASS**
- Heartbeat age cycling normally across all 4 lanes (0-8s, no stalls observed)

**Stage 3 Library Identity Investigation:**
- Library `.identity/` on headless: 9 files (current.json, identity.json, private.pem, public.pem, sign-snapshot.js, snapshot.json, snapshot.jws, test.js, exports/ + archive/)
- `missing_identity_keys` flag: heartbeat reports key mismatch — files exist but keys may not match expected schema
- Archivist `.identity/`: 30+ files (full identity layer with test scripts, spec docs, debug tools)
- Kernel `.identity/`: 4 files (minimal — keys.json, private.pem, public.pem, snapshot.json)
- SwarmMind `.identity/`: 4 files (same minimal set as Kernel)

**Stage 4 Desktop Process Sanity:**
- `opencode` running (4 processes, PID 30408/30512/30564/35004) — Lattice Deck agent
- `codex` running (1 process, PID 41068) — secondary agent
- 40+ `node` processes — Next.js dev server + tooling
- 2 `python` processes — likely MCP/tooling servers

**Stage 5 Lattice Deck Repo Dirty Files:**
- 16 modified: CI workflow, context.md, AGENTS.md, 6 pages, 4 components, briefing route, globals.css
- 8 untracked: JOURNAL.md, docs/, firebase-debug.log, scripts/, page-content.tsx, hooks/, journal-reader.ts, provenance-validator.ts + test

**Known Issues (flagged, not mutating):**
- Archivist DIVERGED from origin — needs `git pull` but boundary prohibits mutation
- Library `missing_identity_keys` — files present but heartbeat flagging mismatch
- SwarmMind `.gitignore` missing `lanes/*/state/active-owner.json` entry
- Ollama bound to Tailscale IP, not localhost — consumers must use `100.95.40.99:11434`
- Windows `S:\dev\null` path errors when git tries `/dev/null` redirects

## Next Steps
- **Stage 2**: Messaging relay endpoint integration (safe queue, not direct SSH)
- **Stage 3**: Live agent tracking (real-time heartbeats via SSE/websocket)
- **Stage 4**: Evolution intelligence (automatic regression detection)
- **Connect real data**: Replace mock adapters with live Control Plane API endpoints
- **Provenance enforcement**: Wire runtime enforcement for OUTPUT_PROVENANCE (pre-output hook, session-start protocol, or output filter) — currently classified as not-yet-runtime-enforceable
- **Archivist sync**: Operator decision needed — pull 3 origin commits into desktop clone (diverged history may need merge strategy)

## Location
- Project root: `S:\WE4FREE-Lattice-Deck`
- Git branch: `main`, remote up to date (latest: governance trust incident remediation + AGENTS.md provenance binding — 2026-05-15)
