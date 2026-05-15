'use client';

import { useEffect, useState } from 'react';
import { fetchBriefingData } from '@/lib/services/dataAdapter';
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
        const data = await fetchBriefingData();
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
            <p className="text-sm text-surface-300">
              {briefing.sinceLastChecked?.summary || 'No recent activity'}
            </p>
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
