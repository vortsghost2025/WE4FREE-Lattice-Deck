## Optional Feature Guides

When users request features beyond the base template, check for available recipes in `.kilocode/recipes/`.

### Available Recipes

| Recipe       | File                                | When to Use                                           |
| ------------ | ----------------------------------- | ----------------------------------------------------- |
| Add Database | `.kilocode/recipes/add-database.md` | When user needs data persistence (users, posts, etc.) |

### How to Use Recipes

1. Read the recipe file when the user requests the feature
2. Follow the step-by-step instructions
3. Update the memory bank after implementing the feature

## Output Provenance (Required)

Every final completion report, status summary, or governance-significant output emitted by an agent MUST include an `OUTPUT_PROVENANCE` block:

```
OUTPUT_PROVENANCE:
  agent: <agent identifier>
  lane: <lane or project context>
  generated_at: <ISO 8601>
  session_id: <session identifier>
  target: <what this output addresses>
```

Omitting this block is a **reporting-contract miss**, even if the underlying work is correct.

### Why this exists

This requirement was introduced after a trust incident (2026-05-15) where two major agents omitted provenance on Day 16 of the mandate. The root cause: the requirement lived in prose (docs, instructions) but was not bound to any execution path. Agents treated "you were told to" as enforcement. It is not.

### Enforcement status

- **Current enforcement**: Honor-system only — no runtime check rejects output missing provenance.
- **Known gap**: The chat/final-report output path is outside all automated verifiers (CI, typecheck, vitest). No pre-output hook, session-start protocol, or output filter exists yet.
- **Classification**: Not-yet-runtime-enforceable. This AGENTS.md entry is the strongest binding currently possible for chat-layer output.
- **Aspirational target**: A pre-output hook or wrapper that injects provenance automatically, or a session-start protocol requiring provenance emission before any other output.

### Self-report is not sufficient closure

An agent claiming "done" proves nothing without live-path evidence. Until provenance enforcement moves from instruction to execution, trust in this requirement is not earned — it is borrowed.

## Memory Bank Maintenance

After completing the user's request, update the relevant memory bank files:

- `.kilocode/rules/memory-bank/context.md` - Current state and recent changes
- Other memory bank files as needed when architecture, tech stack, or project goals change
