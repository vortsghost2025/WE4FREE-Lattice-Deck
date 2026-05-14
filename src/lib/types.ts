// Type definitions for the WE4FREE Lattice Deck

export type LaneId = 'archivist' | 'library' | 'swarmmind' | 'kernel';
export type ControlPlaneId = 'control-plane';
export type EntityId = LaneId | ControlPlaneId;

export type SurfaceId = 'desktop' | 'headless' | 'gastown' | 'vps';

export type Status = 'active' | 'idle' | 'blocked' | 'quarantined' | 'needs-operator' | 'syncing';

export type EventType =
  | 'PROGRESSION'
  | 'REGRESSION'
  | 'REPAIR'
  | 'UNDO'
  | 'OVERWRITE'
  | 'DUPLICATION'
  | 'RECONCILIATION'
  | 'INFRASTRUCTURE'
  | 'UNKNOWN';

export type Priority = 'critical' | 'high' | 'normal' | 'low';
export type MessageType = 'action-required' | 'informational' | 'governance' | 'audit';

export interface LaneStatus {
  id: LaneId;
  name: string;
  status: Status;
  currentTask: string | null;
  lastHeartbeat: string;
  lastCommit: string;
  lastCompact: string | null;
  lastRestore: string | null;
  lastTestResult: 'pass' | 'fail' | 'pending' | null;
  gitBranch: string;
  gitAhead: number;
  gitBehind: number;
  driftWarning: boolean;
  blockerCount: number;
  activeSurfaces: SurfaceId[];
  currentAgent: string | null;
  currentModel: string | null;
  contextPercent: number;
  compactCount: number;
  lastHandoffPacket: string | null;
}

export interface ControlPlaneStatus {
  id: ControlPlaneId;
  name: string;
  status: Status;
  currentTask: string | null;
  lastHeartbeat: string;
  coordinatorVersion: string;
  activeLanes: LaneId[];
  messageQueueDepth: number;
  pendingDecisions: number;
  gitBranch: string;
  gitAhead: number;
  gitBehind: number;
}

export interface SurfaceCell {
  laneId: EntityId;
  surfaceId: SurfaceId;
  state: 'active' | 'executing' | 'supervising' | 'wip' | 'coordinating' | 'none';
  label: string;
  repo: string;
  branch: string;
  lastChange: string | null;
  agent: string | null;
  logs: string[];
}

export interface TimelineEvent {
  id: string;
  timestamp: string;
  laneId: EntityId;
  surfaceId: SurfaceId | null;
  type: EventType;
  title: string;
  description: string;
  artifactPath: string | null;
  gitRef: string | null;
  attribution: string;
  classification: string;
}

export interface MessagePacket {
  id: string;
  to: string;
  priority: Priority;
  type: MessageType;
  requiresAction: boolean;
  body: string;
  createdAt: string;
  sentAt: string | null;
  delivered: boolean;
  read: boolean;
  acknowledged: boolean;
  actionStarted: boolean;
  resultArtifact: string | null;
  recipients: { entityId: EntityId; surfaceId?: SurfaceId }[];
}

export interface ContinuityState {
  laneId: EntityId;
  currentStep: 'STOP' | 'QUARANTINE' | 'COMPACT_RESTORE' | 'COMPARE_1' | 'SYNC' | 'COMPARE_2' | 'UNBLOCK';
  passRate: number | null;
  status: 'green' | 'yellow' | 'red';
  lastUpdated: string;
  details: string;
}