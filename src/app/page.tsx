'use client';

import { useEffect, useState } from 'react';

import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { StatusDot } from '@/components/ui/status-dot';
import { Button } from '@/components/ui/button';
import { LayoutShell } from '@/components/layout/shell';
import { PageContent } from '@/components/layout/page-content';

export default function BriefingPage() {
  const [briefing, setBriefing] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadBriefing = async () => {
      try {
        setLoading(true);
        const res = await fetch('/api/briefing');
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        setBriefing(data);
        setError(null);
      } catch (err) {
        console.error('Failed to load briefing:', err);
        setError('Failed to load briefing data');
      } finally {
        setLoading(false);
      }
    };

    loadBriefing();
  }, []);

  if (loading) {
    return (
      <LayoutShell title="WE4FREE Pulse">
        <PageContent>
          <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
              <p className="mt-2 text-sm text-neutral-400">Loading briefing...</p>
            </div>
          </div>
        </PageContent>
      </LayoutShell>
    );
  }

  if (error) {
    return (
      <LayoutShell title="WE4FREE Pulse - Error">
        <PageContent>
          <div className="p-6 text-center text-red-400">
            <p className="text-base">{error}</p>
            <Button variant="outline" onClick={() => window.location.reload()}>
              Retry
            </Button>
          </div>
        </PageContent>
      </LayoutShell>
    );
  }

  if (!briefing) {
    return (
      <LayoutShell title="WE4FREE Pulse">
        <PageContent>
          <div className="p-6 text-center text-neutral-400">
            <p>No briefing data available</p>
          </div>
        </PageContent>
      </LayoutShell>
    );
  }

  return (
    <LayoutShell title="WE4FREE Pulse">
      <PageContent>
        <h1 className="sr-only">WE4FREE Pulse Overview</h1>
        <div className="space-y-6">
          {/* Row 1: Since You Last Checked — full width */}
          <Card title={"🕒 Since You Last Checked"} className="border-indigo-500/20">
            <p className="text-base text-neutral-400 mb-3">
              {briefing.sinceLastChecked?.summary || 'No recent activity'}
            </p>
            {briefing.sinceLastChecked?.notableChange && (
              <div className={`mb-3 px-3 py-2 rounded-md border ${
                briefing.sinceLastChecked.notableChange.severity === 'critical'
                  ? 'border-red-500/30 bg-red-500/5'
                  : briefing.sinceLastChecked.notableChange.severity === 'warning'
                  ? 'border-yellow-500/30 bg-yellow-500/5'
                  : 'border-blue-500/30 bg-blue-500/5'
              }`} role="alert">
              <p className="text-sm font-medium text-neutral-200">
                <span className="sr-only">{briefing.sinceLastChecked.notableChange.severity} alert: </span>
                  {briefing.sinceLastChecked.notableChange.title}
                </p>
                <p className="text-sm text-neutral-400 mt-0.5">
                  {briefing.sinceLastChecked.notableChange.description}
                </p>
              </div>
            )}
            {briefing.sinceLastChecked?.events?.length > 0 && (
              <div className="space-y-1.5 max-h-48 overflow-y-auto">
                {briefing.sinceLastChecked.events.slice(0, 8).map((event: any, idx: number) => {
                  const typeColors: Record<string, string> = {
                    PROGRESSION: 'text-emerald-400 border-emerald-500/30',
                    REGRESSION: 'text-red-400 border-red-500/30',
                    REPAIR: 'text-blue-400 border-blue-500/30',
                    UNDO: 'text-orange-400 border-orange-500/30',
                    INFRASTRUCTURE: 'text-neutral-400 border-neutral-500/30',
                    RECONCILIATION: 'text-purple-400 border-purple-500/30',
                    DUPLICATION: 'text-yellow-400 border-yellow-500/30',
                    OVERWRITE: 'text-pink-400 border-pink-500/30',
                    UNKNOWN: 'text-neutral-400 border-neutral-500/30',
                  };
                  const colorClass = typeColors[event.type] || typeColors.UNKNOWN;
                  const isGit = event.id?.startsWith('git-');
                  const timeStr = event.timestamp
                    ? new Date(event.timestamp).toLocaleString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })
                    : '';
                  return (
                    <div key={event.id || idx} className="flex items-start gap-2 text-sm">
                      <span className={`shrink-0 mt-0.5 px-1.5 py-0 rounded border font-mono text-xs ${colorClass}`}>
                        {event.type}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-neutral-200 truncate">{event.title}</p>
                        <p className="text-neutral-400 text-xs">
                          {timeStr}{event.gitRef ? ` · ${event.gitRef}` : ''}{isGit ? ' · git' : ''}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>

          {/* Row 2: Active Right Now + Needs Sean — side by side */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card title={"🟢 Active Right Now"} className="border-teal-500/20">
              <div className="grid gap-2">
                {briefing.activeNow?.lanes?.map((lane: any) => {
                  let dotStatus: 'active' | 'idle' | 'blocked' | 'quarantined' | 'needs-operator' | 'syncing' = 'idle';
                  switch (lane.status) {
                    case 'active': dotStatus = 'active'; break;
                    case 'idle': dotStatus = 'idle'; break;
                    case 'blocked': dotStatus = 'blocked'; break;
                    case 'quarantined': dotStatus = 'quarantined'; break;
                    case 'needs-operator': dotStatus = 'needs-operator'; break;
                    case 'syncing': dotStatus = 'syncing'; break;
                    default: dotStatus = 'idle';
                  }
                  return (
                    <div key={lane.id} className="flex items-center space-x-2">
                      <StatusDot status={dotStatus} size="sm" />
                      <span className="text-sm text-neutral-400">{lane.name}</span>
                    </div>
                  );
                })}
                {!briefing.activeNow?.lanes?.length && (
                  <p className="text-sm text-neutral-400">No active lanes</p>
                )}
              </div>
              <div className="mt-3 text-sm text-neutral-400">
                Active: {briefing.activeNow?.totalActive || 0} · Idle: {briefing.activeNow?.totalIdle || 0} · Blocked: {briefing.activeNow?.totalBlocked || 0}
              </div>
            </Card>

            <Card title={"🙋‍♂️ Needs Sean"} className="border-red-500/20">
              {briefing.needsSean?.hasUrgent ? (
                <>
                  {briefing.needsSean?.decisions?.length > 0 && (
                    <p className="text-base text-red-400 font-medium mb-2">
                      {briefing.needsSean.decisions.length} decision{briefing.needsSean.decisions.length === 1 ? '' : 's'} pending
                    </p>
                  )}
                  {briefing.needsSean?.blockers?.length > 0 && (
                    <p className="text-base text-orange-400 font-medium mb-2">
                      {briefing.needsSean.blockers.length} blocker{briefing.needsSean.blockers.length === 1 ? '' : 's'} requiring action
                    </p>
                  )}
                  {!briefing.needsSean?.decisions?.length && !briefing.needsSean?.blockers?.length && (
                    <p className="text-base text-neutral-400">
                      No urgent items requiring attention
                    </p>
                  )}
                  <p className="text-sm text-neutral-400 mt-2">
                    {briefing.needsSean?.summary || '0 decisions, 0 blockers, 0 warnings'}
                  </p>
                </>
              ) : (
                <p className="text-base text-neutral-400">
                  All systems operating normally
                </p>
              )}
            </Card>
          </div>

          {/* Row 3: Autonomy Progress + Most Important Insight — side by side */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card title={"⚙️ Autonomy Progress"} className="border-yellow-500/20">
              <div className="space-y-2">
                {briefing.autonomyProgress?.lanes?.map((lane: any) => {
                  let dotStatus: 'active' | 'idle' | 'blocked' | 'quarantined' | 'needs-operator' | 'syncing' = 'idle';
                  switch (lane.status) {
                    case 'green': dotStatus = 'active'; break;
                    case 'yellow': dotStatus = 'quarantined'; break;
                    case 'red': dotStatus = 'blocked'; break;
                    default: dotStatus = 'idle';
                  }
                  return (
                    <div key={lane.id} className="flex items-center space-x-2">
                      <StatusDot status={dotStatus} size="sm" />
                      <div className="flex-1">
                        <span className="text-sm text-neutral-400">{lane.name}</span>
                        <span className="text-sm text-neutral-400 ml-2">
                          {lane.passRate !== null ? `${lane.passRate}%` : 'N/A'}
                        </span>
                      </div>
                    </div>
                  );
                })}
                {!briefing.autonomyProgress?.lanes?.length && (
                  <p className="text-sm text-neutral-400">No autonomy data</p>
                )}
              </div>
              <div className="mt-3 text-sm text-neutral-400 border-t border-neutral-700/30 pt-3">
                Overall: {briefing.autonomyProgress?.overallPassRate || 0}% · Iterations: {briefing.autonomyProgress?.totalIterations || 0}
              </div>
            </Card>

            <Card title={"💡 Most Important Insight"} className="border-purple-500/20">
              <p className="text-base font-medium text-neutral-200">
                {briefing.mostImportantInsight?.headline || 'All systems nominal'}
              </p>
              <p className="mt-2 text-sm text-neutral-400">
                {briefing.mostImportantInsight?.body || 'No action required at this time.'}
              </p>
              {briefing.mostImportantInsight?.actionSuggested && (
                <div className="mt-3">
                  <Button variant="outline" size="sm" aria-label={briefing.mostImportantInsight.actionSuggested}>
                    {briefing.mostImportantInsight.actionSuggested}
                  </Button>
                </div>
              )}
            </Card>
          </div>
        </div>
      </PageContent>
    </LayoutShell>
  );
}
