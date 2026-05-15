'use client';

import { useEffect, useState } from 'react';

import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { StatusDot } from '@/components/ui/status-dot';
import { Button } from '@/components/ui/button';
import { LayoutShell } from '@/components/layout/shell';

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
        <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
            <p className="mt-2 text-sm text-surface-300">Loading briefing...</p>
          </div>
        </div>
      </LayoutShell>
    );
  }

  if (error) {
    return (
      <LayoutShell title="WE4FREE Pulse - Error">
        <div className="p-6 text-center text-red-400">
          <p className="text-base">{error}</p>
          <Button variant="outline" onClick={() => window.location.reload()}>
            Retry
          </Button>
        </div>
      </LayoutShell>
    );
  }

  if (!briefing) {
    return (
      <LayoutShell title="WE4FREE Pulse">
        <div className="p-6 text-center text-surface-400">
          <p>No briefing data available</p>
        </div>
      </LayoutShell>
    );
  }

  return (
    <LayoutShell title="WE4FREE Pulse">
      <div className="space-y-8">
        {/* Card 1: Since You Last Checked */}
        <Card title={"🕒 Since You Last Checked"} className="border-indigo-500/20">
          <div className="p-4">
            <p className="text-sm text-surface-300 mb-3">
              {briefing.sinceLastChecked?.summary || 'No recent activity'}
            </p>
            {briefing.sinceLastChecked?.notableChange && (
              <div className={`mb-3 px-3 py-2 rounded-md border ${
                briefing.sinceLastChecked.notableChange.severity === 'critical'
                  ? 'border-red-500/30 bg-red-500/5'
                  : briefing.sinceLastChecked.notableChange.severity === 'warning'
                  ? 'border-yellow-500/30 bg-yellow-500/5'
                  : 'border-blue-500/30 bg-blue-500/5'
              }`}>
                <p className="text-xs font-medium text-surface-200">
                  {briefing.sinceLastChecked.notableChange.title}
                </p>
                <p className="text-xs text-surface-400 mt-0.5">
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
                    INFRASTRUCTURE: 'text-surface-400 border-surface-500/30',
                    RECONCILIATION: 'text-purple-400 border-purple-500/30',
                    DUPLICATION: 'text-yellow-400 border-yellow-500/30',
                    OVERWRITE: 'text-pink-400 border-pink-500/30',
                    UNKNOWN: 'text-surface-400 border-surface-500/30',
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
                    <div key={event.id || idx} className="flex items-start gap-2 text-xs">
                      <span className={`shrink-0 mt-0.5 px-1.5 py-0 rounded border font-mono ${colorClass}`}>
                        {event.type}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-surface-200 truncate">{event.title}</p>
                        <p className="text-surface-500">
                          {timeStr}{event.gitRef ? ` · ${event.gitRef}` : ''}{isGit ? ' · git' : ''}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </Card>

        {/* Card 2: Active Right Now */}
        <Card title={"🟢 Active Right Now"} className="border-teal-500/20">
          <div className="p-4">
            <div className="grid gap-2">
              {briefing.activeNow?.lanes?.map((lane: any) => {
                // Map lane status to StatusDot status
                let dotStatus: 'active' | 'idle' | 'blocked' | 'quarantined' | 'needs-operator' | 'syncing' = 'idle'; // default
                switch (lane.status) {
                  case 'active':
                    dotStatus = 'active';
                    break;
                  case 'idle':
                    dotStatus = 'idle';
                    break;
                  case 'blocked':
                    dotStatus = 'blocked';
                    break;
                  case 'quarantined':
                    dotStatus = 'quarantined';
                    break;
                  case 'needs-operator':
                    dotStatus = 'needs-operator';
                    break;
                  case 'syncing':
                    dotStatus = 'syncing';
                    break;
                  default:
                    dotStatus = 'idle';
                }
                return (
                  <div key={lane.id} className="flex items-center space-x-2">
                    <StatusDot status={dotStatus} size="sm" />
                    <span className="text-xs text-surface-300">{lane.name}</span>
                  </div>
                );
              })}
              {!briefing.activeNow?.lanes?.length && (
                <p className="text-xs text-surface-300">No active lanes</p>
              )}
            </div>
            <div className="mt-2 text-xs text-surface-400">
              Active: {briefing.activeNow?.totalActive || 0} • 
              Idle: {briefing.activeNow?.totalIdle || 0} • 
              Blocked: {briefing.activeNow?.totalBlocked || 0}
            </div>
          </div>
        </Card>

        {/* Card 3: Needs Sean */}
        <Card title={"🙋‍♂️ Needs Sean"} className="border-red-500/20">
          <div className="p-4">
            {briefing.needsSean?.hasUrgent ? (
              <>
                {briefing.needsSean?.decisions?.length > 0 && (
                  <p className="text-sm text-surface-300 font-medium text-red-400 mb-2">
                    {briefing.needsSean.decisions.length} decision{briefing.needsSean.decisions.length === 1 ? '' : 's'} pending
                  </p>
                )}
                {briefing.needsSean?.blockers?.length > 0 && (
                  <p className="text-sm text-surface-300 font-medium text-orange-400 mb-2">
                    {briefing.needsSean.blockers.length} blocker{briefing.needsSean.blockers.length === 1 ? '' : 's'} requiring action
                  </p>
                )}
                {!briefing.needsSean?.decisions?.length && !briefing.needsSean?.blockers?.length && (
                  <p className="text-sm text-surface-300">
                    No urgent items requiring attention
                  </p>
                )}
                <p className="text-sm text-surface-400 mt-2">
                  {briefing.needsSean?.summary || '0 decisions, 0 blockers, 0 warnings'}
                </p>
              </>
            ) : (
              <p className="text-sm text-surface-300">
                All systems operating normally
              </p>
            )}
          </div>
        </Card>

        {/* Card 4: Autonomy Progress */}
        <Card title={"⚙️ Autonomy Progress"} className="border-yellow-500/20">
          <div className="p-4">
            <div className="space-y-2">
              {briefing.autonomyProgress?.lanes?.map((lane: any) => {
                // Map autonomy lane status (green/yellow/red) to StatusDot status
                let dotStatus: 'active' | 'idle' | 'blocked' | 'quarantined' | 'needs-operator' | 'syncing' = 'idle';
                switch (lane.status) {
                  case 'green':
                    dotStatus = 'active';
                    break;
                  case 'yellow':
                    dotStatus = 'quarantined'; // using quarantined as warning equivalent
                    break;
                  case 'red':
                    dotStatus = 'blocked';
                    break;
                  default:
                    dotStatus = 'idle';
                }
                return (
                  <div key={lane.id} className="flex items-center space-x-2">
                    <StatusDot status={dotStatus} size="sm" />
                    <div className="flex-1">
                      <span className="text-xs text-surface-300">{lane.name}</span>
                      <span className="text-xs text-surface-400">{
                        lane.passRate !== null 
                          ? `${lane.passRate}%` 
                          : 'N/A'
                      }</span>
                    </div>
                  </div>
                );
              })}
              {!briefing.autonomyProgress?.lanes?.length && (
                <p className="text-xs text-surface-300">No autonomy data</p>
              )}
            </div>
            <div className="mt-2 text-xs text-surface-400 border-t pt-2">
              Overall: {briefing.autonomyProgress?.overallPassRate || 0}% • 
              Iterations: {briefing.autonomyProgress?.totalIterations || 0}
            </div>
          </div>
        </Card>

        {/* Card 5: Most Important Insight */}
        <Card title={"💡 Most Important Insight"} className="border-purple-500/20">
          <div className="p-4">
            <p className="text-sm font-medium text-surface-200">
              {briefing.mostImportantInsight?.headline || 'All systems nominal'}
            </p>
            <p className="mt-1 text-xs text-surface-300">
              {briefing.mostImportantInsight?.body || 'No action required at this time.'}
            </p>
            {briefing.mostImportantInsight?.actionSuggested && (
              <div className="mt-2">
                <Button variant="outline" size="sm">
                  {briefing.mostImportantInsight.actionSuggested}
                </Button>
              </div>
            )}
          </div>
        </Card>
      </div>
    </LayoutShell>
  );
}
