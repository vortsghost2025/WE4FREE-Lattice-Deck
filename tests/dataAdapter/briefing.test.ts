import { describe, it, expect } from 'vitest';
import { fetchBriefingData } from '../../src/lib/services/dataAdapter';
import type { BriefingResponse } from '../../src/lib/contracts/briefing';

describe('fetchBriefingData', () => {
  it('returns a briefing object with expected top-level fields', async () => {
    const b: BriefingResponse = await fetchBriefingData();

    expect(b).toBeTruthy();
    expect(b.generatedAt).toBeTruthy();
    expect(b.agentProvenance).toBeTruthy();
    expect(['healthy', 'degraded', 'critical']).toContain(b.systemHealth);
  });

  it('Card 1 — sinceLastChecked has summary, events, notableChange', async () => {
    const b = await fetchBriefingData();
    const card = b.sinceLastChecked;

    expect(typeof card.summary).toBe('string');
    expect(Array.isArray(card.events)).toBe(true);
    if (card.events.length > 0) {
      const e = card.events[0];
      expect(e).toHaveProperty('timestamp');
      expect(e).toHaveProperty('type');
      expect(e).toHaveProperty('title');
      expect(e).toHaveProperty('laneId');
      expect(e).toHaveProperty('classification');
    }
    // notableChange is nullable
    if (card.notableChange) {
      expect(card.notableChange).toHaveProperty('title');
      expect(card.notableChange).toHaveProperty('description');
      expect(card.notableChange).toHaveProperty('laneId');
      expect(['critical', 'warning', 'info']).toContain(card.notableChange.severity);
    }
  });

  it('Card 2 — activeNow has lanes, controlPlane, totals', async () => {
    const b = await fetchBriefingData();
    const card = b.activeNow;

    expect(Array.isArray(card.lanes)).toBe(true);
    if (card.lanes.length > 0) {
      const lane = card.lanes[0];
      expect(lane).toHaveProperty('id');
      expect(lane).toHaveProperty('name');
      expect(lane).toHaveProperty('status');
      expect(lane).toHaveProperty('currentTask');
      expect(lane).toHaveProperty('agent');
      expect(lane).toHaveProperty('contextPercent');
      expect(lane).toHaveProperty('surfaces');
    }
    expect(card.controlPlane).toHaveProperty('status');
    expect(card.controlPlane).toHaveProperty('pendingDecisions');
    expect(typeof card.totalActive).toBe('number');
    expect(typeof card.totalIdle).toBe('number');
    expect(typeof card.totalBlocked).toBe('number');
  });

  it('Card 3 — needsSean has decisions, blockers, warnings, hasUrgent, summary', async () => {
    const b = await fetchBriefingData();
    const card = b.needsSean;

    expect(Array.isArray(card.decisions)).toBe(true);
    expect(Array.isArray(card.blockers)).toBe(true);
    expect(Array.isArray(card.warnings)).toBe(true);
    expect(typeof card.hasUrgent).toBe('boolean');
    expect(typeof card.summary).toBe('string');

    if (card.decisions.length > 0) {
      const d = card.decisions[0];
      expect(d).toHaveProperty('id');
      expect(d).toHaveProperty('title');
      expect(d).toHaveProperty('priority');
      expect(d).toHaveProperty('laneId');
    }
    if (card.blockers.length > 0) {
      const bl = card.blockers[0];
      expect(bl).toHaveProperty('id');
      expect(bl).toHaveProperty('title');
      expect(bl).toHaveProperty('laneId');
      expect(bl).toHaveProperty('since');
    }
  });

  it('Card 4 — autonomyProgress has lanes, overallPassRate, totalIterations', async () => {
    const b = await fetchBriefingData();
    const card = b.autonomyProgress;

    expect(Array.isArray(card.lanes)).toBe(true);
    expect(typeof card.overallPassRate).toBe('number');
    expect(typeof card.totalIterations).toBe('number');

    if (card.lanes.length > 0) {
      const lane = card.lanes[0];
      expect(lane).toHaveProperty('id');
      expect(lane).toHaveProperty('name');
      expect(['green', 'yellow', 'red']).toContain(lane.status);
      expect(lane).toHaveProperty('currentStep');
      expect(lane).toHaveProperty('passRate');
      expect(['improving', 'stable', 'declining']).toContain(lane.trend);
    }
  });

  it('Card 5 — mostImportantInsight has headline, body, confidence, attribution', async () => {
    const b = await fetchBriefingData();
    const card = b.mostImportantInsight;

    expect(typeof card.headline).toBe('string');
    expect(typeof card.body).toBe('string');
    expect(typeof card.confidence).toBe('number');
    expect(card.confidence).toBeGreaterThanOrEqual(1);
    expect(card.confidence).toBeLessThanOrEqual(10);
    expect(Array.isArray(card.supportingData)).toBe(true);
    expect(card.attribution).toHaveProperty('agentId');
    expect(card.attribution).toHaveProperty('agentVersion');
    expect(card.attribution).toHaveProperty('generatedAt');
  });

  it('agentProvenance is present and well-formed', async () => {
    const b = await fetchBriefingData();
    const prov = b.agentProvenance;

    expect(prov.agentId).toBeTruthy();
    expect(prov.agentVersion).toBeTruthy();
    expect(prov.generatedAt).toBeTruthy();
    expect(typeof prov.confidence).toBe('number');
  });
});
