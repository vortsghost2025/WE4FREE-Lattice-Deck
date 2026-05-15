// Briefing Layer Response Contract
// Extends the existing DATA_CONTRACT.md shapes for the five-card briefing home screen.
// This is the "compassionate perceptual compression layer" — Sean's first point of contact.
//
// Design principle: Every card answers exactly one canonical question.
// No dense metrics by default. Drill-downs exist for detail.
// Agent provenance is on every output.

import type { EntityId, Status, EventType, LaneId } from '../types';
import type { GateStep } from '@/lib/contracts/types';

// ─────────────────────────────────────────────
// BRIEFING RESPONSE
// ─────────────────────────────────────────────

export interface BriefingResponse {
  // Card 1 — Since You Last Checked
  sinceLastChecked: SinceCard;
  // Card 2 — Active Right Now
  activeNow: ActiveCard;
  // Card 3 — Needs Sean
  needsSean: NeedsCard;
  // Card 4 — Autonomy Progress
  autonomyProgress: AutonomyCard;
  // Card 5 — Most Important Insight
  mostImportantInsight: InsightCard;

  // Metadata
  generatedAt: string;          // ISO 8601
  agentProvenance: Provenance;  // Who produced this briefing
  systemHealth: 'healthy' | 'degraded' | 'critical';
}

// ─────────────────────────────────────────────
// CARD 1: SINCE YOU LAST CHECKED
// ─────────────────────────────────────────────

export interface SinceCard {
  summary: string;                        // Human-readable "X events, Y notable"
  events: BriefEvent[];                   // Condensed timeline events
  notableChange: NotableChange | null;    // The single biggest change
}

export interface BriefEvent {
  timestamp: string;        // ISO 8601
  type: EventType;
  title: string;
  laneId: EntityId;
  classification: 'autonomous' | 'operator';
}

export interface NotableChange {
  title: string;
  description: string;
  laneId: EntityId;
  severity: 'critical' | 'warning' | 'info';
}

// ─────────────────────────────────────────────
// CARD 2: ACTIVE RIGHT NOW
// ─────────────────────────────────────────────

export interface ActiveCard {
  lanes: ActiveLane[];
  controlPlane: ActiveControlPlane;
  totalActive: number;
  totalIdle: number;
  totalBlocked: number;
}

export interface ActiveLane {
  id: LaneId;
  name: string;
  status: Status;
  currentTask: string | null;
  agent: string | null;
  contextPercent: number;
  surfaces: string[];
}

export interface ActiveControlPlane {
  status: Status;
  currentTask: string | null;
  activeLanes: number;
  pendingDecisions: number;
  messageQueueDepth: number;
}

// ─────────────────────────────────────────────
// CARD 3: NEEDS SEAN
// ─────────────────────────────────────────────

export interface NeedsCard {
  decisions: DecisionNeeded[];
  blockers: Blocker[];
  warnings: Warning[];
  hasUrgent: boolean;
  summary: string;                        // "2 decisions, 1 blocker, 0 warnings"
}

export interface DecisionNeeded {
  id: string;
  title: string;
  description: string;
  priority: 'critical' | 'high' | 'normal' | 'low';
  laneId: EntityId;
  context: string | null;                 // What Sean needs to know to decide
  proposedAction: string | null;          // Suggested action (agent recommendation)
}

export interface Blocker {
  id: string;
  title: string;
  description: string;
  laneId: EntityId;
  since: string;                          // ISO 8601
}

export interface Warning {
  id: string;
  title: string;
  description: string;
  laneId: EntityId;
}

// ─────────────────────────────────────────────
// CARD 4: AUTONOMY PROGRESS
// ─────────────────────────────────────────────

export interface AutonomyCard {
  lanes: AutonomyLane[];
  overallPassRate: number;                 // Average across all lanes
  totalIterations: number;                // Sum of all lane iterations/cycles
  lastSync: string | null;                // ISO 8601 of last successful sync
}

export interface AutonomyLane {
  id: LaneId;
  name: string;
  status: 'green' | 'yellow' | 'red';
  currentStep: GateStep;                  // e.g. "SYNC", "COMPARE_1", "UNBLOCK"
  passRate: number | null;
  iteration: number | null;               // Current cycle/iteration number
  lastAction: string | null;              // What the lane last did
  trend: 'improving' | 'stable' | 'declining';
}

// ─────────────────────────────────────────────
// CARD 5: MOST IMPORTANT INSIGHT
// ─────────────────────────────────────────────

export interface InsightCard {
  headline: string;                       // The one-sentence takeaway
  body: string;                           // 2-3 sentence explanation
  supportingData: InsightData[];          // Key facts backing the insight
  attribution: Provenance;                // Which agent(s) contributed
  confidence: number;                     // 1-10
  actionSuggested: string | null;         // Optional concrete next step
}

export interface InsightData {
  label: string;
  value: string;
  trend?: 'up' | 'down' | 'flat';
}

// ─────────────────────────────────────────────
// PROVENANCE (Agent Identification)
// ─────────────────────────────────────────────

export interface Provenance {
  agentId: string;                        // e.g. "we4free-briefing-agent-v1"
  agentVersion: string;                   // e.g. "1.0.0"
  model: string | null;                   // LLM used, if applicable
  generatedAt: string;                    // ISO 8601
  sourceHashes: Record<string, string>;   // SHA of source data used
  confidence: number;                     // 1-10
  notes: string | null;                   // Any caveats
}

// ─────────────────────────────────────────────
// LEGACY COMPAT: Map existing contract types → Briefing types
// ─────────────────────────────────────────────

export function buildBriefingFromStatus(
  status: import('./types').StatusResponse,
  timeline: import('./types').TimelineResponse,
  continuity: import('./types').ContinuityResponse
): BriefingResponse {
  const now = new Date().toISOString();

  // Card 1: Since You Last Checked — last 10 events
  const recentEvents = timeline.events.slice(0, 10).map(e => ({
    timestamp: e.timestamp,
    type: e.type,
    title: e.title,
    laneId: e.laneId,
    classification: e.classification as any,
  }));

  const regressions = timeline.events.filter(e => e.type === 'REGRESSION');
  const repairs = timeline.events.filter(e => e.type === 'REPAIR');
  const progressions = timeline.events.filter(e => e.type === 'PROGRESSION');

  const notableChange = regressions.length > 0
    ? {
        title: `${regressions.length} regression${regressions.length > 1 ? 's' : ''} detected`,
        description: regressions.map(r => r.title).join('; '),
        laneId: regressions[0].laneId,
        severity: 'critical' as const,
      }
    : repairs.length > 0
    ? {
        title: `${repairs.length} repair${repairs.length > 1 ? 's' : ''} completed`,
        description: repairs.map(r => r.title).join('; '),
        laneId: repairs[0].laneId,
        severity: 'info' as const,
      }
    : null;

  // Card 2: Active Right Now
  const activeLanes = status.lanes.map(l => ({
    id: l.id as LaneId,
    name: l.name,
    status: l.status,
    currentTask: l.currentTask,
    agent: l.currentAgent,
    contextPercent: l.contextPercent,
    surfaces: l.activeSurfaces,
  }));

  // Card 3: Needs Sean
  const decisions: DecisionNeeded[] = [];
  const blockers: Blocker[] = [];
  const warnings: Warning[] = [];

  status.lanes.forEach(l => {
    if (l.blockerCount > 0) {
      blockers.push({
        id: `blocker-${l.id}`,
        title: `${l.name}: ${l.blockerCount} blocker${l.blockerCount > 1 ? 's' : ''}`,
        description: `${l.blockerCount} open blocker${l.blockerCount > 1 ? 's' : ''} requiring operator action`,
        laneId: l.id as EntityId,
        since: l.lastHeartbeat,
      });
    }
    if (l.driftWarning) {
      warnings.push({
        id: `drift-${l.id}`,
        title: `${l.name}: Drift warning`,
        description: 'Lane state diverges from expected — investigate',
        laneId: l.id as EntityId,
      });
    }
    if (l.status === 'needs-operator') {
      decisions.push({
        id: `decision-${l.id}`,
        title: `${l.name}: Operator decision required`,
        description: 'Lane has flagged a need for operator intervention',
        priority: 'high',
        laneId: l.id as EntityId,
        context: `Status: ${l.status}. Task: ${l.currentTask || 'none'}.`,
        proposedAction: null,
      });
    }
  });

  if (status.controlPlane.pendingDecisions > 0) {
    decisions.push({
      id: 'decision-cp',
      title: `Control Plane: ${status.controlPlane.pendingDecisions} pending decision${status.controlPlane.pendingDecisions > 1 ? 's' : ''}`,
      description: 'Control Plane awaiting operator input',
      priority: status.controlPlane.pendingDecisions >= 3 ? 'critical' : 'high',
      laneId: 'control-plane' as EntityId,
      context: `Message queue depth: ${status.controlPlane.messageQueueDepth}`,
      proposedAction: null,
    });
  }

  // Card 4: Autonomy Progress
  const autonomyLanes = continuity.continuity.map(c => ({
    id: c.laneId as LaneId,
    name: c.laneId === 'control-plane' ? 'Control Plane' : c.laneId.charAt(0).toUpperCase() + c.laneId.slice(1),
    status: c.status,
    currentStep: c.currentStep,
    passRate: c.passRate,
    iteration: null,  // Filled from timeline events (not implemented yet)
    lastAction: c.details,
    trend: computeTrend(c.passRate),
  }));

  const avgPassRate = continuity.continuity.reduce((a, c) => a + (c.passRate || 0), 0)
    / continuity.continuity.length;

  // Card 5: Most Important Insight
  let headline = 'All systems nominal';
  let body = 'No action required at this time.';
  let actionSuggested: string | null = null;
  let confidence = 8;

  if (blockers.length > 0) {
    headline = `${blockers.length} blocker${blockers.length > 1 ? 's' : ''} need attention`;
    body = `${blockers.length} lane${blockers.length > 1 ? 's have' : ' has'} open blockers. The most critical is on the ${status.lanes.find(l => l.blockerCount > 0)?.name || 'unknown'} lane.`;
    actionSuggested = `Review blockers on the ${status.lanes.find(l => l.blockerCount > 0)?.name || 'unknown'} lane and take action.`;
    confidence = 9;
  }

  if (decisions.length > 0) {
    const criticalDecisions = decisions.filter(d => d.priority === 'critical');
    headline = criticalDecisions.length > 0
      ? `${criticalDecisions.length} critical decision${criticalDecisions.length > 1 ? 's' : ''} pending`
      : `${decisions.length} decision${decisions.length > 1 ? 's' : ''} need${decisions.length > 1 ? '' : 's'} your input`;
    body = decisions.map(d => `${d.title}: ${d.description}`).join('. ');
    actionSuggested = 'Review and act on the pending decisions.';
    confidence = 8;
  }

  if (warnings.length > 0) {
    headline = `${warnings.length} drift warning${warnings.length > 1 ? 's' : ''}`;
    body = `${warnings.length} lane${warnings.length > 1 ? 's show' : ' shows'} drift — deviation from expected state detected.`;
    actionSuggested = 'Investigate drift warnings to prevent escalation.';
    confidence = 7;
  }

  if (regressions.length > 0 && blockers.length === 0) {
    headline = `${regressions.length} recent regression${regressions.length > 1 ? 's' : ''}`;
    body = `${regressions.length} regressiv${regressions.length > 1 ? 'e events' : 'e event'} detected. ${repairs.length > 0 ? `${repairs.length} repair${repairs.length > 1 ? 's' : ''} already in progress.` : 'No repairs initiated yet.'}`;
    confidence = 7;
  }

  // System health
  let systemHealth: 'healthy' | 'degraded' | 'critical' = 'healthy';
  if (blockers.length > 2 || decisions.filter(d => d.priority === 'critical').length > 0) {
    systemHealth = 'critical';
  } else if (blockers.length > 0 || warnings.length > 0 || decisions.length > 0) {
    systemHealth = 'degraded';
  }

  return {
    sinceLastChecked: {
      summary: `${timeline.events.length} events since last check. ${regressions.length} regression${regressions.length !== 1 ? 's' : ''}, ${repairs.length} repair${repairs.length !== 1 ? 's' : ''}, ${progressions.length} progression${progressions.length !== 1 ? 's' : ''}.`,
      events: recentEvents,
      notableChange,
    },
    activeNow: {
      lanes: activeLanes,
      controlPlane: {
        status: status.controlPlane.status,
        currentTask: status.controlPlane.currentTask,
        activeLanes: status.controlPlane.activeLaneCount,
        pendingDecisions: status.controlPlane.pendingDecisions,
        messageQueueDepth: status.controlPlane.messageQueueDepth,
      },
      totalActive: activeLanes.filter(l => l.status === 'active').length,
      totalIdle: activeLanes.filter(l => l.status === 'idle').length,
      totalBlocked: activeLanes.filter(l => l.status === 'blocked').length,
    },
    needsSean: {
      decisions,
      blockers,
      warnings,
      hasUrgent: decisions.some(d => d.priority === 'critical') || blockers.length > 0,
      summary: `${decisions.length} decision${decisions.length !== 1 ? 's' : ''}, ${blockers.length} blocker${blockers.length !== 1 ? 's' : ''}, ${warnings.length} warning${warnings.length !== 1 ? 's' : ''}`,
    },
    autonomyProgress: {
      lanes: autonomyLanes,
      overallPassRate: Math.round(avgPassRate * 10) / 10,
      totalIterations: timeline.events.length,
      lastSync: continuity.continuity.reduce((latest, c) => {
        if (!latest) return c.lastUpdated;
        return c.lastUpdated > latest ? c.lastUpdated : latest;
      }, null as string | null),
    },
    mostImportantInsight: {
      headline,
      body,
      supportingData: [
        { label: 'Active Lanes', value: `${status.controlPlane.activeLaneCount}/4` },
        { label: 'Blockers', value: String(blockers.length), trend: blockers.length > 0 ? 'up' : 'flat' },
        { label: 'Avg Pass Rate', value: `${Math.round(avgPassRate)}%`, trend: avgPassRate >= 93 ? 'up' : avgPassRate >= 85 ? 'flat' : 'down' },
        { label: 'Recent Regressions', value: String(regressions.length), trend: regressions.length > 0 ? 'down' : 'flat' },
      ],
      attribution: {
        agentId: 'we4free-briefing-agent-v1',
        agentVersion: '1.0.0',
        model: null,
        generatedAt: now,
        sourceHashes: {},
        confidence,
        notes: 'Briefing synthesized from status, timeline, and continuity data',
      },
      actionSuggested,
      confidence,
    },
    generatedAt: now,
    agentProvenance: {
      agentId: 'we4free-briefing-agent-v1',
      agentVersion: '1.0.0',
      model: null,
      generatedAt: now,
      sourceHashes: {},
      confidence: 9,
      notes: `Built from: status (${status.lanes.length} lanes), timeline (${timeline.events.length} events), continuity (${continuity.continuity.length} lanes)`,
    },
    systemHealth, // Add the systemHealth field
  };
}

function computeTrend(passRate: number | null): 'improving' | 'stable' | 'declining' {
  if (passRate === null) return 'stable';
  // Simple heuristic: if passRate > 95 improving, < 90 declining, else stable
  if (passRate > 95) return 'improving';
  if (passRate < 90) return 'declining';
  return 'stable';
}