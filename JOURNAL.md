# WE4FREE Lattice Deck — Action Journal

**Created:** 2026-05-15
**Purpose:** Comprehensive todo list + execution log for Lattice Deck and connected systems

---

## Active Tasks

### P1 — Governance Trust Proofs (must complete before feature work)

| # | Task | Status | Blocked | Notes |
|---|------|--------|---------|-------|
| 1 | Provenance enforcement: runtime validator + CI gate for data-layer provenance | **done** | Chat-layer OUTPUT_PROVENANCE classified not-yet-runtime-enforceable | `provenance-validator.ts` + `verify-provenance.mjs` + CI gate + 20 tests + briefing route assertion |
| 2 | Ollama local model: install on headless Ubuntu ES, verify local model routing | pending | Need SSH/physical access to headless Ubuntu ES | No local model routing exists. Instruction in prose only. |
| 3 | Journal read-path: wire agent to read journal state at session start | **done** | No | `journal-reader.ts` + briefing route `_meta.journal` field |

### P2 — Feature Stages (after P1 proofs)

| # | Task | Status | Blocked | Notes |
|---|------|--------|---------|-------|
| 4 | Stage 2: Messaging relay endpoint integration (safe queue, not direct SSH) | pending | Needs Control Plane API contract | Replace mock messaging with real relay |
| 5 | Stage 3: Live agent tracking (real-time heartbeats via SSE/websocket) | pending | Needs agent heartbeat spec | Replace static lane status with live data |
| 6 | Stage 4: Evolution intelligence (automatic regression detection) | pending | Needs regression detection algorithm | Auto-detect regressions from timeline events |
| 7 | Replace mock adapters with live Control Plane API endpoints | pending | Needs Control Plane API availability | dataAdapter.ts, briefing route, all /api/* routes |

### P3 — Hardening & Audit

| # | Task | Status | Blocked | Notes |
|---|------|--------|---------|-------|
| 8 | Audit provenance enforcement coverage — classify what CI gate can/cannot verify | **done** | No | `docs/provenance-audit.md` — 15 CI checks cover data-layer; chat-layer honestly classified as not-yet-runtime-enforceable; 3 known gaps documented with path-to-closure |
| 9 | Survey connected repos for shared governance gaps (prose-not-enforced pattern) | pending | No | Check Control Plane, Archivist, SwarmMind, kernel-lane, federation, Research-Intake, self-organizing-library |

---

## Execution Log

### 2026-05-15 — Session 2: P1 Governance Trust Proofs

**Completed:**

1. **Provenance runtime validator** — `src/lib/services/provenance-validator.ts`
   - `validateProvenance()`: returns `{ valid, errors, warnings }`
   - `assertProvenance()`: throws `ProvenanceError` on invalid provenance
   - Checks: required fields, ISO 8601 date, confidence 0-1, sourceHashes type, model format
   - Warnings: low confidence (<0.5), non-kebab-case agent IDs

2. **Provenance CI gate** — `scripts/verify-provenance.mjs`
   - 15 checks across 5 layers: contract, runtime enforcement, API wiring, test coverage, governance binding
   - Runs after vitest in CI; exits 1 on failure

3. **Briefing API route provenance assertion** — `src/app/api/briefing/route.ts`
   - `assertProvenance()` called on `agentProvenance` and `mostImportantInsight.attribution`
   - Returns 500 `PROVENANCE_ENFORCEMENT_FAILURE` on invalid provenance

4. **Journal read-path** — `src/lib/services/journal-reader.ts`
   - `readJournalState()`: parses JOURNAL.md markdown tables, returns `JournalTaskSummary`
   - Wired into briefing route: `_meta.journal` field on response

5. **Test coverage** — `tests/services/provenance-validator.test.ts`
   - 20 tests: valid provenance, null/undefined/empty rejection, missing fields, invalid dates, confidence range, sourceHashes type, model type, low-confidence warning, kebab-case warning, context in errors, assertProvenance throw/no-throw, ProvenanceError properties

6. **Verification**: tsc clean, vitest 57/57, next build 16 routes, CI provenance gate 15/15

**Provenance enforcement split decision:**
- Data-layer provenance (briefing API, contracts) → **runtime-enforceable** ✓
- Chat-layer OUTPUT_PROVENANCE (agent terminal output) → **not-yet-runtime-enforceable** — honestly classified in AGENTS.md with known gap and aspirational target

### 2026-05-15 — Session 1: Accessibility + Governance Foundations

**Completed:**
- Accessibility/readability hardening (Stage 1.7) — 7 fixes + prior work
- Governance trust incident remediation — AGENTS.md updated, context.md updated
- S: drive ecosystem survey — 8+ connected repos identified
- JOURNAL.md created — this document

**Shared root failure pattern identified:**
Three operator directives (OUTPUT_PROVENANCE, Ollama, journal) share the same failure mode:
- Instruction exists in prose/docs
- Write path exists mechanically
- Read/enforcement path does NOT exist
- "You were told to" was treated as enforcement. It is not.

**Remediation doctrine:**
- Self-report is not sufficient closure
- "Implemented" requires live-path proof
- Every operator-critical directive needs: runtime enforcement, executable verification, or explicit not-yet-enforceable classification with operator acceptance

---

## Completed (Prior Sessions)

- Stage 1: Full read-only observatory (8 pages, API routes, mock data, contracts)
- Stage 1.5: Git-commit adapter (real git log → timeline events)
- Stage 1.6: Git-status adapter + Cards 2-5 enrichment
- Stage 1.7: Accessibility/readability hardening (all 6 pages, design system, big-text mode, semantic HTML, contrast fixes, focus-visible, sr-only, responsive sidebar with backdrop)
- Test infrastructure: 37 vitest tests, CI gate
- Governance: AGENTS.md provenance binding, context.md trust incident, GLOBAL_GOVERNANCE.md acknowledged
