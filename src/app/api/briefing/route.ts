import { NextResponse } from 'next/server';
import { fetchStatus, fetchTimeline, fetchContinuity } from '@/lib/services/dataAdapter';
import { buildBriefingFromStatus } from '@/lib/contracts/briefing';
import { getGitTimelineEvents } from '@/lib/services/git-commit-adapter';
import { readGitStatus } from '@/lib/services/git-status-adapter';
import { assertProvenance } from '@/lib/services/provenance-validator';
import { readJournalState } from '@/lib/services/journal-reader';

export const dynamic = 'force-dynamic';

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

  let gitStatus = null;
  try {
    gitStatus = readGitStatus();
  } catch {
    // Git status unavailable
  }

  const briefing = buildBriefingFromStatus(status, mergedTimeline, continuity, gitStatus);

  // ── RUNTIME PROVENANCE ENFORCEMENT ──
  // This assertion makes provenance enforceable in the data layer.
  // If the briefing response lacks valid provenance, this throws at request time.
  // This is a live-path proof — not prose, not honor-system.
  try {
    assertProvenance(briefing.agentProvenance, 'briefing.agentProvenance');
    if (briefing.mostImportantInsight?.attribution) {
      assertProvenance(briefing.mostImportantInsight.attribution, 'briefing.mostImportantInsight.attribution');
    }
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Provenance validation failed';
    return NextResponse.json(
      { error: 'PROVENANCE_ENFORCEMENT_FAILURE', detail: message },
      { status: 500 },
    );
  }

  // ── JOURNAL READ-PATH ──
  // Surface journal state in the response so any agent consuming
  // the briefing sees current task context without needing to
  // separately parse JOURNAL.md.
  let journalState = null;
  try {
    journalState = await readJournalState();
  } catch {
    // Journal unavailable — non-fatal
  }

  const response = { ...briefing, _meta: { journal: journalState } };
  return NextResponse.json(response);
}
