import { NextResponse } from 'next/server';
import { fetchStatus, fetchTimeline, fetchContinuity } from '@/lib/services/dataAdapter';
import { buildBriefingFromStatus } from '@/lib/contracts/briefing';
import { getGitTimelineEvents } from '@/lib/services/git-commit-adapter';

export async function GET() {
  const status = fetchStatus();
  const timeline = fetchTimeline();
  const continuity = fetchContinuity();

  let mergedTimeline = timeline;
  try {
    const gitEvents = getGitTimelineEvents();
    if (gitEvents.length > 0) {
      const existingIds = new Set(timeline.events.map(e => e.id));
      const novelGitEvents = gitEvents.filter(e => !existingIds.has(e.id));
      mergedTimeline = {
        ...timeline,
        events: [...novelGitEvents, ...timeline.events].sort(
          (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
        ),
        total: timeline.total + novelGitEvents.length,
      };
    }
  } catch {
    // Git unavailable — fall back to mock-only timeline
  }

  const briefing = buildBriefingFromStatus(status, mergedTimeline, continuity);
  return NextResponse.json(briefing);
}
