# WE4FREE Lattice Deck — Project Context

## Current State (2026-05-14)

### What's Built (Stage 1 — Read-Only Observatory)
- **Next.js 15** app router, strict TypeScript, Tailwind CSS dark theme
- **7 pre-rendered pages**: Overview, Surface Matrix, Timeline, Messaging, Continuity, Catch Me Up, Settings
- **Data layer**: Fully typed mock data at `src/lib/types/` and `src/lib/mock-data.ts`
- **API routes**: `/api/status`, `/api/timeline`, `/api/lanes`, `/api/messages`, `/api/continuity`
- **Build**: Zero TS errors, all routes compiled and pre-rendered

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
- Project root: `/workspace/4a3ce27d-ed21-4f70-a11a-d7408091f4c3/sessions/agent_46f8e02e-4a44-4012-82f8-a1bbdad9c821/`
- Git branch: `main`, 1 commit ahead of origin