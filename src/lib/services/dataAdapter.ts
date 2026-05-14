// Data adapter layer
// Maps internal mock data → formal contract types for /api/* responses.
// When wiring live Control Plane data, replace ONLY the source functions here.
// All contracts and UI consumers remain unchanged.

import type {
  LaneStatusContract, ControlPlaneContract, StatusResponse,
  TimelineEventContract, TimelineResponse,
  LanesResponse,
  MessagePacketContract, MessagesResponse, SendMessageRequest,
  ContinuityStateContract, ContinuityResponse,
} from './types';

import {
  getLaneConfig, getControlPlane, getSurfaceMatrix,
  getTimeline, getMessages, getContinuity, getCatchUp,
} from '../mock-data';

// ─────────────────────────────────────────────
// Mappers: internal → contract
// ─────────────────────────────────────────────

function toLaneStatusContract(lane: ReturnType<typeof getLaneConfig>[number]): LaneStatusContract {
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

function toControlPlaneContract(cp: ReturnType<typeof getControlPlane>): ControlPlaneContract {
  return {
    id: cp.id as 'control-plane',
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

function toTimelineEventContract(event: ReturnType<typeof getTimeline>[number]): TimelineEventContract {
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
    classification: event.classification,
  };
}

function toMessagePacketContract(msg: ReturnType<typeof getMessages>[number]): MessagePacketContract {
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

// ─────────────────────────────────────────────
// Service functions (used by API routes)
// ─────────────────────────────────────────────

export function fetchStatus(): StatusResponse {
  return {
    lanes: getLaneConfig().map(toLaneStatusContract),
    controlPlane: toControlPlaneContract(getControlPlane()),
  };
}

export function fetchTimeline(hours: number = 48, lane?: string, type?: string): TimelineResponse {
  const allEvents = getTimeline();
  const cutoff = new Date(Date.now() - hours * 3600000);
  let events = allEvents.filter(e => new Date(e.timestamp) >= cutoff);

  const validLanes: (LaneId | 'control-plane')[] = ['archivist', 'library', 'swarmmind', 'kernel', 'control-plane'];
  if (lane && validLanes.includes(lane as any)) {
    events = events.filter(e => e.laneId === lane);
  }

  const validTypes: EventType[] = ['PROGRESSION', 'REGRESSION', 'REPAIR', 'UNDO', 'OVERWRITE', 'DUPLICATION', 'RECONCILIATION', 'INFRASTRUCTURE', 'UNKNOWN'];
  if (type && validTypes.includes(type as any)) {
    events = events.filter(e => e.type === type);
  }

  return {
    events: events.map(toTimelineEventContract).sort((a, b) => b.timestamp.localeCompare(a.timestamp)),
    query: { hours, lane: (lane || 'all') as any, type: (type || 'all') as any },
    total: events.length,
  };
}

export function fetchLanes(): LanesResponse {
  const lanes = getLaneConfig().map(toLaneStatusContract);
  const cp = toControlPlaneContract(getControlPlane());
  return { lanes, controlPlane: cp, entities: [...lanes, cp] };
}

export function fetchMessages(): MessagesResponse {
  return {
    messages: getMessages().map(toMessagePacketContract),
  };
}

export function createMessage(body: SendMessageRequest): { message: MessagePacketContract; success: boolean } {
  const newMsg: MessagePacketContract = {
    id: `m-${Date.now()}`,
    to: body.to,
    priority: body.priority,
    type: body.type,
    requiresAction: body.requiresAction,
    body: body.body,
    createdAt: new Date().toISOString(),
    sentAt: new Date().toISOString(),
    delivered: false,
    read: false,
    acknowledged: false,
    actionStarted: false,
    resultArtifact: null,
    recipients: body.recipients,
  };
  return { message: newMsg, success: true };
}

export function fetchContinuity(): ContinuityResponse {
  return {
    continuity: getContinuity(),
    threshold: 93,
  };
}

// Expose raw catch-up data (no contract transform needed — stays internal to Catch Me Up)
export { getCatchUp };