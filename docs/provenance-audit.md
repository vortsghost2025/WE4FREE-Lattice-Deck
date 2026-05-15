# Provenance Enforcement Audit

**Date:** 2026-05-15
**Auditor:** lattice-deck-agent
**Scope:** What CI provenance gate (`scripts/verify-provenance.mjs`) CAN and CANNOT verify

---

## What IS Runtime-Enforceable (CI Gate Covers)

| Layer | Enforcement | Mechanism | CI Gate Check |
|-------|-------------|-----------|---------------|
| Provenance interface | TypeScript contract | `Provenance` interface in `briefing.ts` | ✓ Check #1-2 |
| Runtime validator | Code execution | `validateProvenance()`, `assertProvenance()`, `ProvenanceError` | ✓ Check #3-5 |
| API route assertion | HTTP response guard | `assertProvenance()` in briefing route, 500 on failure | ✓ Check #6-7 |
| Journal read-path | Code execution | `readJournalState()` in briefing route | ✓ Check #8-9 |
| Test coverage | Vitest | 20 tests for validator + assertion | ✓ Check #10-11 |
| Governance binding | Prose-to-code | AGENTS.md references + honest gap classification | ✓ Check #12-15 |

**Total: 15 CI gate checks, all passing. Data-layer provenance IS runtime-enforced.**

---

## What is NOT Runtime-Enforceable (Known Gaps)

| Gap | Why Not Enforceable | Current Mitigation | Path to Closure |
|-----|---------------------|-------------------|-----------------|
| Chat-layer OUTPUT_PROVENANCE | Agent terminal output is outside CI/vitest/typecheck paths. No pre-output hook exists. | AGENTS.md binding + honor-system + incident history documented | Pre-output hook or session-start protocol in opencode/agent framework |
| Agent session provenance | No session-start protocol requires provenance emission before other output | N/A | Framework-level session middleware |
| Cross-repo provenance | Other repos (Control Plane, Archivist, etc.) have no provenance enforcement | GLOBAL_GOVERNANCE.md exists as prose only | Propagate provenance validator pattern + CI gate to each repo |

---

## Classification Summary

- **Runtime-enforceable**: Data-layer provenance (briefing API contracts, validator, tests, CI gate)
- **Not-yet-runtime-enforceable**: Chat-layer OUTPUT_PROVENANCE, session provenance, cross-repo provenance
- **Honest assessment**: The CI gate prevents data-layer provenance regressions. It CANNOT verify that agents include OUTPUT_PROVENANCE blocks in their terminal output. That gap requires framework-level tooling that does not yet exist.

---

## Incident History

- **2026-05-15**: Two agents omitted OUTPUT_PROVENANCE on Day 16. Root cause: prose-only requirement with no execution binding. Remediation: AGENTS.md updated, CI gate created, honest classification applied.

---

## Recommendations

1. **Accept current state**: Data-layer enforcement is real and verified. Chat-layer remains honor-system.
2. **Do NOT fake coverage**: Do not add checks that scan .md files for OUTPUT_PROVENANCE text blocks — that proves nothing about live agent behavior.
3. **Track toward framework support**: When opencode/agent frameworks support pre-output hooks, wire them.
4. **Propagate pattern**: Offer provenance-validator.ts + CI gate pattern to other repos in the ecosystem.
