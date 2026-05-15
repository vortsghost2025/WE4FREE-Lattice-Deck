import { describe, it, expect } from 'vitest';
import { buildBriefingFromStatus } from '../../src/lib/contracts/briefing';
import type { StatusResponse, TimelineResponse, ContinuityResponse } from '../../src/lib/contracts/types';
import { fetchStatus, fetchTimeline, fetchContinuity } from '../../src/lib/services/dataAdapter';

describe('buildBriefingFromStatus', () => {
  it('builds a BriefingResponse from contract data', () => {
    const status = fetchStatus() as StatusResponse;
    const timeline = fetchTimeline(48, undefined, undefined) as TimelineResponse;
    const continuity = fetchContinuity() as ContinuityResponse;
    const b = buildBriefingFromStatus(status, timeline, continuity);

    expect(b).toBeTruthy();
    expect(b.generatedAt).toBeTruthy();
    expect(b.agentProvenance).toBeTruthy();
    expect(['healthy', 'degraded', 'critical']).toContain(b.systemHealth);

    expect(b.sinceLastChecked).toBeTruthy();
    expect(b.activeNow).toBeTruthy();
    expect(b.needsSean).toBeTruthy();
    expect(b.autonomyProgress).toBeTruthy();
    expect(b.mostImportantInsight).toBeTruthy();
  });

  it('systemHealth is critical when >2 blockers or critical decisions exist', () => {
    const status = fetchStatus() as StatusResponse;
    const timeline = fetchTimeline(48, undefined, undefined) as TimelineResponse;
    const continuity = fetchContinuity() as ContinuityResponse;

    // Force 3 blockers to trigger critical
    const mutatedLanes = status.lanes.map((l, i) =>
      i < 3 ? { ...l, blockerCount: 1 } : l
    );
    const mutatedStatus = { ...status, lanes: mutatedLanes };

    const b = buildBriefingFromStatus(mutatedStatus, timeline, continuity);
    expect(b.systemHealth).toBe('critical');
  });

  it('systemHealth is degraded when 1 blocker exists', () => {
    const status = fetchStatus() as StatusResponse;
    const timeline = fetchTimeline(48, undefined, undefined) as TimelineResponse;
    const continuity = fetchContinuity() as ContinuityResponse;

    const mutatedLanes = status.lanes.map((l, i) =>
      i === 0 ? { ...l, blockerCount: 1 } : l
    );
    const mutatedStatus = { ...status, lanes: mutatedLanes };

    const b = buildBriefingFromStatus(mutatedStatus, timeline, continuity);
    expect(b.systemHealth).toBe('degraded');
  });

  it('systemHealth is healthy when no blockers, warnings, or decisions', () => {
    const status = fetchStatus() as StatusResponse;
    const timeline = fetchTimeline(48, undefined, undefined) as TimelineResponse;
    const continuity = fetchContinuity() as ContinuityResponse;

    const cleanLanes = status.lanes.map(l => ({
      ...l,
      blockerCount: 0,
      driftWarning: false,
      status: 'active' as const,
    }));
    const cleanStatus: StatusResponse = {
      lanes: cleanLanes,
      controlPlane: {
        ...status.controlPlane,
        pendingDecisions: 0,
      },
    };

    const b = buildBriefingFromStatus(cleanStatus, timeline, continuity);
    expect(b.systemHealth).toBe('healthy');
  });

  it('computes correct overallPassRate from continuity', () => {
    const status = fetchStatus() as StatusResponse;
    const timeline = fetchTimeline(48, undefined, undefined) as TimelineResponse;
    const continuity = fetchContinuity() as ContinuityResponse;

    const b = buildBriefingFromStatus(status, timeline, continuity);
    const expected = continuity.continuity.reduce((a, c) => a + (c.passRate || 0), 0) / continuity.continuity.length;

    expect(b.autonomyProgress.overallPassRate).toBeCloseTo(Math.round(expected * 10) / 10, 1);
  });

  it('notableChange is null when no regressions or repairs', () => {
    const status = fetchStatus() as StatusResponse;
    const continuity = fetchContinuity() as ContinuityResponse;

    // Build timeline with only PROGRESSION events
    const progressionOnly: TimelineResponse = {
      events: [],
      query: { hours: 48, lane: 'all', type: 'all' },
      total: 0,
    };

    const b = buildBriefingFromStatus(status, progressionOnly, continuity);
    expect(b.sinceLastChecked.notableChange).toBeNull();
  });
});
