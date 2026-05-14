# DATA_CONTRACT.md — WE4FREE Lattice Deck API Response Contracts

This document defines the **canonical response shapes** for every API endpoint in the Lattice Deck. These contracts serve as the **stable seam** between the operator surface (UI) and the organism state source (Control Plane / live lane endpoints).

When wiring to a live Control Plane, **only the service adapter (`src/lib/services/dataAdapter.ts`) changes**. The contract types, API route signatures, and all page consumers remain untouched.

---

## Base Principles

- Every endpoint returns JSON with a top-level typed shape defined below.
- All timestamps are ISO 8601 strings.
- All responses are **read-only**. No endpoint mutates organism state.
- Governance-critical fields are marked with 🔒. Display-only fields are marked with 📌.

---

## `GET /api/status`

**Purpose:** Current state snapshot of all lanes and the Control Plane.

**Response Shape:** `StatusResponse`

```typescript
{
  lanes: LaneStatusContract[],        // 🔒 All lane states
  controlPlane: ControlPlaneContract   // 🔒 Control Plane state
}
```

### `LaneStatusContract` 🔒

| Field               | Type                          | Source                                       |
|---------------------|-------------------------------|----------------------------------------------|
| `id`                | `'archivist' \| 'library' \| 'swarmmind' \| 'kernel'` | Lane identity |
| `name`              | `string`                      | Human label                                  |
| `status`            | `'active' \| 'idle' \| 'blocked' \| 'quarantined' \| 'needs-operator' \| 'syncing'` | 🔒 Live state from lane heartbeat |
| `currentTask`       | `string \| null`              | 🔒 What the lane is doing now                |
| `lastHeartbeat`     | `string` (ISO 8601)           | 🔒 Last time lane reported alive             |
| `lastCommit`        | `string`                      | 🔒 Short ref + relative time of last commit  |
| `lastCompact`       | `string \| null` (ISO 8601)   | 🔒 Last compact cycle completion             |
| `lastRestore`       | `string \| null` (ISO 8601)   | 🔒 Last restore cycle completion             |
| `lastTestResult`    | `'pass' \| 'fail' \| 'pending' \| null` | 🔒 Gate test result              |
| `git`               | `GitState`                    | 🔒 Branch, ahead/behind counts               |
| `driftWarning`      | `boolean`                     | 🔒 Whether lane state diverges from expected |
| `blockerCount`      | `number`                      | 🔒 Open blockers requiring operator action   |
| `activeSurfaces`    | `SurfaceId[]`                 | 🔒 Where this lane is currently alive        |
| `currentAgent`      | `string \| null`              | 🔒 Name of running agent process             |
| `currentModel`      | `string \| null`              | 🔒 LLM model the agent is using              |
| `contextPercent`    | `number`                      | 📌 Context utilization (0-100)               |
| `compactCount`      | `number`                      | 📌 Total compacts completed                  |
| `lastHandoffPacket` | `string \| null`              | 📌 Last packet ID handed off                 |

### `ControlPlaneContract` 🔒

| Field                  | Type                     | Source                              |
|------------------------|--------------------------|-------------------------------------|
| `id`                   | `EntityId`               | Always `'control-plane'`            |
| `name`                 | `string`                 | Human label                         |
| `status`               | Status                   | 🔒 CP health state                  |
| `currentTask`          | `string \| null`         | 🔒 Current coordination activity    |
| `lastHeartbeat`        | `string` (ISO 8601)      | 🔒 Last CP heartbeat                |
| `coordinatorVersion`   | `string`                 | 🔒 Rig coordination software version|
| `activeLaneCount`      | `number`                 | 🔒 How many lanes are active        |
| `messageQueueDepth`    | `number`                 | 🔒 Pending messages in queue        |
| `pendingDecisions`     | `number`                 | 🔒 Decisions awaiting operator      |
| `git`                  | `GitState`               | 🔒 CP repo state                    |

### `GitState`

| Field    | Type   | Description                     |
|----------|--------|---------------------------------|
| `branch` | string | Current branch name             |
| `ahead`  | number | Commits ahead of remote tracking|
| `behind` | number | Commits behind remote tracking  |

---

## `GET /api/timeline?hours={n}&lane={id}&type={type}`

**Purpose:** Filtered timeline of organism events over a time window.

**Response Shape:** `TimelineResponse`

```typescript
{
  events: TimelineEventContract[],   // 🔒 Chronological event log
  query: {                           // 📌 Echo of request parameters
    hours: number;
    lane: EntityId | 'all';
    type: EventType | 'all';
  };
  total: number;                     // 📌 Total matching events
}
```

### `TimelineEventContract` 🔒

| Field            | Type                              | Description                       |
|------------------|-----------------------------------|-----------------------------------|
| `id`             | `string`                          | Unique event ID                   |
| `timestamp`      | `string` (ISO 8601)               | When event occurred               |
| `laneId`         | `EntityId`                        | Which lane/CP produced event      |
| `surfaceId`      | `SurfaceId \| null`               | Which surface (if applicable)     |
| `type`           | `EventType`                       | Classification of event           |
| `title`          | `string`                          | Short description                 |
| `description`    | `string`                          | Full details                      |
| `artifactPath`   | `string \| null`                  | Link to artifact if any           |
| `gitRef`         | `string \| null`                  | Git ref at time of event          |
| `attribution`    | `string`                          | Agent or operator who caused it   |
| `classification` | `'autonomous' \| 'operator'`      | Who initiated: agent vs operator  |

### `EventType` Values

`PROGRESSION` | `REGRESSION` | `REPAIR` | `UNDO` | `OVERWRITE` | `DUPLICATION` | `RECONCILIATION` | `INFRASTRUCTURE` | `UNKNOWN`

---

## `GET /api/lanes`

**Purpose:** Redundant lane + CP data for the Surface Matrix and cross-reference views.

**Response Shape:** `LanesResponse`

```typescript
{
  lanes: LaneStatusContract[],
  controlPlane: ControlPlaneContract,
  entities: (LaneStatusContract | ControlPlaneContract)[]  // Combined for iteration
}
```

---

## `GET /api/messages` / `POST /api/messages`

**Purpose:** Read message history and submit new governance-safe messages.

**Response Shape:** `MessagesResponse`

```typescript
{
  messages: MessagePacketContract[]   // 🔒 Message delivery log
}
```

### `MessagePacketContract` 🔒

| Field             | Type                          | Description                          |
|-------------------|-------------------------------|--------------------------------------|
| `id`              | `string`                      | Unique packet ID                     |
| `to`              | `string`                      | Destination path (e.g., `lanes/archivist/inbox`) |
| `priority`        | Priority                      | `critical` | `high` | `normal` | `low` |
| `type`            | MessageType                   | `action-required` | `informational` | `governance` | `audit` |
| `requiresAction`  | `boolean`                     | Whether recipients must act          |
| `body`            | `string`                      | Plain-language instruction body      |
| `createdAt`       | `string` (ISO 8601)           | When packet was composed             |
| `sentAt`          | `string \| null`              | When packet was dispatched           |
| `delivered`       | `boolean`                     | 🔒 Whether it reached the target     |
| `read`            | `boolean`                     | 🔒 Whether the target consumed it    |
| `acknowledged`    | `boolean`                     | 🔒 Whether the target acknowledged   |
| `actionStarted`   | `boolean`                     | 🔒 Whether action execution began    |
| `resultArtifact`  | `string \| null`              | 📌 Path to result if action produced one |
| `recipients`      | `MessageRecipient[]`          | List of target entity/surface pairs  |

### `SendMessageRequest` (POST body)

```typescript
{
  to: string;
  priority: Priority;
  type: MessageType;
  requiresAction: boolean;
  body: string;
  recipients: MessageRecipient[];
}
```

---

## `GET /api/continuity`

**Purpose:** Restore gate pipeline state — the compact/restore/compare/sync/unblock lifecycle.

**Response Shape:** `ContinuityResponse`

```typescript
{
  continuity: ContinuityStateContract[],   // 🔒 Per-lane gate state machine
  threshold: number                        // 📌 Minimum pass rate for unblock (93)
}
```

### `ContinuityStateContract` 🔒

| Field           | Type                          | Description                          |
|-----------------|-------------------------------|--------------------------------------|
| `laneId`        | `EntityId`                    | Which lane is tracked                |
| `currentStep`   | GateStep                      | Where in the pipeline it is          |
| `passRate`      | `number \| null`              | Fidelity percentage at current step  |
| `status`        | `'green' \| 'yellow' \| 'red'`| 🔒 Overall health assessment         |
| `lastUpdated`   | `string` (ISO 8601)           | When this state was last refreshed   |
| `details`       | `string`                      | Human-readable explanation           |

### `GateStep` Pipeline Order

```
STOP → QUARANTINE → COMPACT_RESTORE → COMPARE_1 → SYNC → COMPARE_2 → UNBLOCK
```

Each lane must reach `COMPARE_1` and `COMPARE_2` with `passRate >= threshold` (93%) before `UNBLOCK`.

---

## Wiring to a Live Control Plane

When ready to replace mock data with live feeds:

1. **Edit only `src/lib/services/dataAdapter.ts`** — change each `fetch*` function to call the real API / read from live state stores.
2. The contract types guarantee that if the live source returns the correct shape, nothing downstream changes.
3. For real-time updates, consider replacing `useData`'s `setTick` polling with a WebSocket or SSE listener that calls the same `set*` functions.
4. **Never remove the mock data layer (`src/lib/data/`)** — it remains essential for offline dev, testing, and CI.

---

## SurfaceId Reference

| Value       | Meaning                          |
|-------------|----------------------------------|
| `desktop`   | Sean's local development machine |
| `headless`  | Headless Ubuntu server           |
| `gastown`   | Gastown municipal relay          |
| `vps`       | External VPS / worker surface    |