import type {
  LaneStatus,
  ControlPlaneStatus,
  SurfaceCell,
  TimelineEvent,
  MessagePacket,
  ContinuityState,
  EntityId,
  Status,
  EventType,
  Priority,
  MessageType,
  SurfaceId,
} from '@/lib/types';
import type { LaneId } from '@/lib/types';
import type { GateStep } from '@/lib/contracts/types';
import type {
  StatusResponse,
  TimelineResponse,
  LanesResponse,
  MessagesResponse,
  ContinuityResponse,
  LaneStatusContract,
  ControlPlaneContract,
  TimelineEventContract,
  MessagePacketContract,
  ContinuityStateContract,
} from '@/lib/contracts/types';

import {
  mockLaneStatuses,
  mockControlPlane,
  mockTimeline,
  mockMessages,
  mockContinuity,
} from '@/lib/mock-data';
import { buildBriefingFromStatus } from '@/lib/contracts/briefing';

// Helper to generate a mock ID
const generateId = () => Math.random().toString(36).substring(2, 9);

// Map mock lane status to contract lane status
function mapLaneStatus(lane: typeof mockLaneStatuses[number]): LaneStatusContract {
  return {
    id: lane.id,
    name: lane.name,
    status: lane.status,
    currentTask: lane.currentTask,
    lastHeartbeat: lane.lastHeartbeat,
    lastCommit: lane.lastCommit,
    lastCompact: lane.lastCompact,
    lastRestore: lane.lastRestore,
    lastTestResult: lane.lastTestResult,
    git: {
      branch: lane.gitBranch,
      ahead: lane.gitAhead,
      behind: lane.gitBehind,
    },
    driftWarning: lane.driftWarning,
    blockerCount: lane.blockerCount,
    activeSurfaces: lane.activeSurfaces,
    currentAgent: lane.currentAgent,
    currentModel: lane.currentModel,
    contextPercent: lane.contextPercent,
    compactCount: lane.compactCount,
    lastHandoffPacket: lane.lastHandoffPacket,
  };
}

// Map mock control plane to contract control plane
function mapControlPlane(cp: typeof mockControlPlane): ControlPlaneContract {
  return {
    id: cp.id,
    name: cp.name,
    status: cp.status,
    currentTask: cp.currentTask,
    lastHeartbeat: cp.lastHeartbeat,
    coordinatorVersion: cp.coordinatorVersion,
    activeLaneCount: cp.activeLanes.length,
    messageQueueDepth: cp.messageQueueDepth,
    pendingDecisions: cp.pendingDecisions,
    git: {
      branch: cp.gitBranch,
      ahead: cp.gitAhead,
      behind: cp.gitBehind,
    },
  };
}

// Map mock timeline event to contract timeline event
function mapTimelineEvent(event: typeof mockTimeline[number]): TimelineEventContract {
  return {
    id: event.id,
    timestamp: event.timestamp,
    laneId: event.laneId,
    surfaceId: event.surfaceId,
    type: event.type,
    title: event.title,
    description: event.description,
    artifactPath: event.artifactPath,
    gitRef: event.gitRef,
    attribution: event.attribution,
    classification: event.classification as 'autonomous' | 'operator', // safe because mock data uses only these strings
  };
}

// Map mock message to contract message packet
function mapMessage(msg: typeof mockMessages[number]): MessagePacketContract {
  return {
    id: msg.id,
    to: msg.to,
    priority: msg.priority,
    type: msg.type,
    requiresAction: msg.requiresAction,
    body: msg.body,
    createdAt: msg.createdAt,
    sentAt: msg.sentAt,
    delivered: msg.delivered,
    read: msg.read,
    acknowledged: msg.acknowledged,
    actionStarted: msg.actionStarted,
    resultArtifact: msg.resultArtifact,
    recipients: msg.recipients,
  };
}

// Map mock continuity to contract continuity state
function mapContinuityState(cont: typeof mockContinuity[number]): ContinuityStateContract {
  return {
    laneId: cont.laneId,
    currentStep: cont.currentStep,
    passRate: cont.passRate,
    status: cont.status,
    lastUpdated: cont.lastUpdated,
    details: cont.details,
  };
}

// Export the required functions for API routes and hooks

export function fetchStatus(): StatusResponse {
  return {
    lanes: mockLaneStatuses.map(mapLaneStatus),
    controlPlane: mapControlPlane(mockControlPlane),
  };
}

export function fetchTimeline(hours?: number, lane?: EntityId | 'all', type?: EventType | 'all'): TimelineResponse {
  let filtered = [...mockTimeline];

  if (lane && lane !== 'all') {
    filtered = filtered.filter(e => e.laneId === lane);
  }

  if (type && type !== 'all') {
    filtered = filtered.filter(e => e.type === type);
  }

  if (hours !== undefined) {
    const cutoff = Date.now() - hours * 60 * 60 * 1000;
    filtered = filtered.filter(e => new Date(e.timestamp).getTime() >= cutoff);
  }

  return {
    events: filtered.map(mapTimelineEvent),
    query: {
      hours: hours ?? 48,
      lane: lane ?? 'all',
      type: type ?? 'all',
    },
    total: filtered.length,
  };
}

export function fetchLanes(): LanesResponse {
  return {
    lanes: mockLaneStatuses.map(mapLaneStatus),
    controlPlane: mapControlPlane(mockControlPlane),
    entities: [
      ...mockLaneStatuses.map(mapLaneStatus),
      mapControlPlane(mockControlPlane),
    ],
  };
}

export function fetchMessages(): MessagesResponse {
  return {
    messages: mockMessages.map(mapMessage),
  };
}

export function fetchContinuity(): ContinuityResponse {
  return {
    continuity: mockContinuity.map(mapContinuityState),
    threshold: 93, // matches the mock data? We'll use 93 as default.
  };
}

export type SendMessageRequest = {
  to: string;
  priority: Priority;
  type: MessageType;
  requiresAction: boolean;
  body: string;
  recipients: { entityId: EntityId; surfaceId?: SurfaceId }[];
};

export function createMessage(request: SendMessageRequest): MessagePacket {
  return {
    id: `msg-${generateId()}`,
    to: request.to,
    priority: request.priority,
    type: request.type,
    requiresAction: request.requiresAction,
    body: request.body,
    createdAt: new Date().toISOString(),
    sentAt: new Date().toISOString(),
    delivered: true,
    read: false,
    acknowledged: false,
    actionStarted: false,
    resultArtifact: null,
    recipients: request.recipients,
  };
}

// Briefing layer function (mock-only; use /api/briefing for git-merged data)
export async function fetchBriefingData() {
  const status = fetchStatus();
  const timeline = fetchTimeline();
  const continuity = fetchContinuity();

  return buildBriefingFromStatus(status, timeline, continuity);
}