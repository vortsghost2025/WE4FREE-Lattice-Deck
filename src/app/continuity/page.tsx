'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LayoutShell } from '@/components/layout/shell';
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Shield,
  XCircle,
  Lock,
  Unlock,
  ArrowRight,
} from 'lucide-react';

const steps = ['STOP', 'QUARANTINE', 'COMPACT_RESTORE', 'COMPARE_1', 'SYNC', 'COMPARE_2', 'UNBLOCK'] as const;

const stepLabels: Record<string, string> = {
  STOP: 'Stop',
  QUARANTINE: 'Quarantine',
  COMPACT_RESTORE: 'Compact / Restore',
  COMPARE_1: 'Compare ≥93%',
  SYNC: 'Sync',
  COMPARE_2: 'Compare ≥93%',
  UNBLOCK: 'Unblock',
};

const stepIcons: Record<string, React.ReactNode> = {
  STOP: <Lock size={14} />,
  QUARANTINE: <XCircle size={14} />,
  COMPACT_RESTORE: <RefreshCw size={14} />,
  COMPARE_1: <CheckCircle2 size={14} />,
  SYNC: <RefreshCw size={14} />,
  COMPARE_2: <CheckCircle2 size={14} />,
  UNBLOCK: <Unlock size={14} />,
};

const continuityMock: ContinuityState[] = [
  { laneId: 'archivist', currentStep: 'SYNC', passRate: 96.8, status: 'green' as const, lastUpdated: 'Today 04:00', details: 'Last compact/restore cycle: 96.8% fidelity. All integrity checks passed.' },
  { laneId: 'library', currentStep: 'QUARANTINE', passRate: 88.2, status: 'red' as const, lastUpdated: 'Today 07:45', details: 'Compact restore comparison = 88.2%. UNBLOCK DENIED. Graph index scope issue under investigation.' },
  { laneId: 'swarmmind', currentStep: 'UNBLOCK', passRate: 97.0, status: 'green' as const, lastUpdated: 'Today 05:00', details: 'Iteration 139 sovereignty PASS. All sub-agents aligned.' },
  { laneId: 'kernel', currentStep: 'UNBLOCK', passRate: 99.2, status: 'green' as const, lastUpdated: 'Today 06:00', details: 'Health signal OK. All lanes reporting normally. Integrity: GREEN.' },
  { laneId: 'control-plane', currentStep: 'SYNC', passRate: 95.5, status: 'green' as const, lastUpdated: 'Today 08:12', details: 'Rig coordination active. 4 lanes supervised. Message queue depth: 3.' },
];

const statusColorMap: Record<string, string> = {
  green: 'bg-green-500/15 text-green-400 border-green-500/30',
  yellow: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30',
  red: 'bg-red-500/15 text-red-400 border-red-500/30',
};

function GateProgress({ state }: { state: { currentStep: string; status: string; passRate: number | null } }) {
  const currentIdx = steps.indexOf(state.currentStep as any);
  return (
    <div className="flex items-center gap-1">
      {steps.map((step, i) => {
        const isActive = i === currentIdx;
        const isComplete = i < currentIdx;
        const isFailed = state.status === 'red' && isActive;
        return (
          <div key={step} className="flex flex-col items-center">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${isComplete ? 'bg-green-500 text-white' : isFailed ? 'bg-red-500 text-white' : isActive ? 'bg-indigo-500 text-white animate-pulse' : 'bg-neutral-800 text-neutral-500'}`}
            >
              {isComplete ? <CheckCircle2 size={14} /> : stepIcons[step]}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function MetricLabel({ label, value, className = '' }: { label: string; value: string | number; className?: string }) {
  return (
    <div className={className}>
      <div className="text-[10px] text-neutral-400 uppercase tracking-wider font-medium">{label}</div>
      <div className="text-sm font-semibold text-neutral-100 dark:text-neutral-200">{value}</div>
    </div>
  );
}

export default function ContinuityPage() {
  const [expanded, setExpanded] = useState<string | null>(null);

  return (
    <LayoutShell title="Continuity — Restore Gate View">
      <div className="space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h2 className="text-xl font-semibold">Restore Gate Pipeline</h2>
            <p className="text-sm text-neutral-400 dark:text-neutral-500 mt-1">Monitor compact/restore/compare/sync/unblock states across all lanes</p>
          </div>
          <Badge variant="info" icon={<Shield size={14} />}>Threshold: ≥93%</Badge>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Card title="Healthy" icon={<CheckCircle2 size={16} />}>
            <MetricLabel label="Lanes" value={continuityMock.filter(c => c.status === 'green').length} />
            <span className="text-xs text-green-400 mt-1">of {continuityMock.length} stable</span>
          </Card>
          <Card title="Warning" icon={<AlertTriangle size={16} />}>
            <MetricLabel label="Lanes" value={continuityMock.filter(c => c.status === 'yellow').length} />
            <span className="text-xs text-yellow-400 mt-1">caution zone</span>
          </Card>
          <Card title="Critical" icon={<XCircle size={16} />}>
            <MetricLabel label="Lanes" value={continuityMock.filter(c => c.status === 'red').length} />
            <span className="text-xs text-red-400 mt-1">action needed</span>
          </Card>
          <Card title="Avg Pass Rate" icon={<Activity size={16} />}>
            <MetricLabel label="%" value={(continuityMock.reduce((a, c) => a + (c.passRate || 0), 0) / continuityMock.length).toFixed(1)} />
            <span className="text-xs text-neutral-500 dark:text-neutral-600 mt-1">across all lanes</span>
          </Card>
        </div>

        <Card title="Gate Pipeline" icon={<Activity size={16} />}>
          <div className="overflow-x-auto py-2">
            {continuityMock.map((state) => (
              <div key={state.laneId} className="mb-4 last:mb-0">
                <div className="flex items-center gap-3 cursor-pointer" onClick={() => setExpanded(expanded === state.laneId ? null : state.laneId)}>
                  <div className="w-32 text-right">
                    <span className="text-sm font-semibold text-neutral-100 capitalize">{state.laneId}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <GateProgress state={state} />
                  </div>
                  <div className="w-28 text-right">
                    <Badge variant={state.status as any} className={statusColorMap[state.status]}>{state.passRate}%</Badge>
                  </div>
                  <div className="w-6 text-center">
                    {expanded === state.laneId ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                  </div>
                </div>
                {expanded === state.laneId && (
                  <div className="ml-36 mt-3 pt-3 border-t border-neutral-700/30">
                    <p className="text-sm text-neutral-300 dark:text-neutral-200">{state.details}</p>
                    <div className="mt-2 text-xs text-neutral-500">Last updated: {state.lastUpdated}</div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </Card>

        <Card title="Blockers & Alerts" icon={<AlertTriangle size={16} />}>
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-red-500/5 border border-red-500/20">
              <XCircle size={18} className="text-red-400 flex-shrink-0" />
              <div>
                <div className="text-sm font-medium text-red-400">Library — UNBLOCK DENIED</div>
                <div className="text-xs text-neutral-400 dark:text-neutral-500">Restore comparison at 88.2%. Graph index scope explosion unresolved.</div>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-yellow-500/5 border border-yellow-500/20">
              <AlertTriangle size={18} className="text-yellow-400 flex-shrink-0" />
              <div>
                <div className="text-sm font-medium text-yellow-400">Library — Branch Divergence</div>
                <div className="text-xs text-neutral-400 dark:text-neutral-500">feat/graph-index-scope is 5 ahead / 3 behind main.</div>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-neutral-900 border border-neutral-700/30">
              <RefreshCw size={18} className="text-neutral-500 flex-shrink-0" />
              <div>
                <div className="text-sm font-medium text-neutral-300 dark:text-neutral-200">Control Plane — Behind by 2</div>
                <div className="text-xs text-neutral-500">Git state: 0 ahead, 2 behind main.</div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </LayoutShell>
  );
}