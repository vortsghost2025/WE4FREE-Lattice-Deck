// API Contract Response Types
// These define the exact shape each endpoint returns over the wire.
// When wiring to a live Control Plane, only the service adapter changes — not these types.

import type { LaneId, EntityId, SurfaceId, Status, EventType, Priority, MessageType } from '../types';

// ─────────────────────────────────────────────
// Shared primitives (wire-safe)
// ─────────────────────────────────────────────

export interface GitState {
  branch: string;
  ahead: number;
  behind: number;
}

// ─────────────────────────────────────────────
// /api/status contract
// ─────────────────────────────────────────────

export interface LaneStatusContract {
  id: LaneId;
  name: string;
  status: Status;
  currentTask: string | null;
  lastHeartbeat: string;          // ISO 8601
  lastCommit: string;             // short ref + relative time
  lastCompact: string | null;     // ISO 8601
  lastRestore: string | null;     // ISO 8601
  lastTestResult: 'pass' | 'fail' | 'pending' | null;
  git: GitState;
  driftWarning: boolean;
  blockerCount: number;
  activeSurfaces: SurfaceId[];
  currentAgent: string | null;
  currentModel: string | null;
  contextPercent: number;
  compactCount: number;
  lastHandoffPacket: string | null;
}

export interface ControlPlaneContract {
  id: EntityId;
  name: string;
  status: Status;
  currentTask: string | null;
  lastHeartbeat: string;
  coordinatorVersion: string;
  activeLaneCount: number;
  messageQueueDepth: number;
  pendingDecisions: number;
  git: GitState;
}

export interface StatusResponse {
  lanes: LaneStatusContract[];
  controlPlane: ControlPlaneContract;
}

// ─────────────────────────────────────────────
// /api/timeline contract
// ─────────────────────────────────────────────

export interface TimelineEventContract {
  id: string;
  timestamp: string;              // ISO 8601
  laneId: EntityId;
  surfaceId: SurfaceId | null;
  type: EventType;
  title: string;
  description: string;
  artifactPath: string | null;
  gitRef: string | null;
  attribution: string;
  classification: 'autonomous' | 'operator';
}

export interface TimelineResponse {
  events: TimelineEventContract[];
  query: {
    hours: number;
    lane: EntityId | 'all';
    type: EventType | 'all';
  };
  total: number;
}

// ─────────────────────────────────────────────
// /api/lanes contract
// ─────────────────────────────────────────────

export interface LanesResponse {
  lanes: LaneStatusContract[];
  controlPlane: ControlPlaneContract;
  entities: (LaneStatusContract | ControlPlaneContract)[];
}

// ─────────────────────────────────────────────
// /api/messages contract
// ─────────────────────────────────────────────

export interface MessageRecipient {
  entityId: EntityId;
  surfaceId?: SurfaceId;
}

export interface MessagePacketContract {
  id: string;
  to: string;
  priority: Priority;
  type: MessageType;
  requiresAction: boolean;
  body: string;
  createdAt: string;             // ISO 8601
  sentAt: string | null;
  delivered: boolean;
  read: boolean;
  acknowledged: boolean;
  actionStarted: boolean;
  resultArtifact: string | null;
  recipients: MessageRecipient[];
}

export interface MessagesResponse {
  messages: MessagePacketContract[];
}

export interface SendMessageRequest {
  to: string;
  priority: Priority;
  type: MessageType;
  requiresAction: boolean;
  body: string;
  recipients: MessageRecipient[];
}

// ─────────────────────────────────────────────
// /api/continuity contract
// ─────────────────────────────────────────────

export type GateStep = 'STOP' | 'QUARANTINE' | 'COMPACT_RESTORE' | 'COMPARE_1' | 'SYNC' | 'COMPARE_2' | 'UNBLOCK';

export interface ContinuityStateContract {
  laneId: EntityId;
  currentStep: GateStep;
  passRate: number | null;
  status: 'green' | 'yellow' | 'red';
  lastUpdated: string;           // ISO 8601
  details: string;
}

export interface ContinuityResponse {
  continuity: ContinuityStateContract[];
  threshold: number;             // e.g. 93
}

// Re-export the primitive types for convenience
export type { LaneId, EntityId, SurfaceId, Status, EventType, Priority, MessageType };