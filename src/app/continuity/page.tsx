'use client';

import { useState } from 'react';
import { useData } from '@/lib/hooks/useData';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { StatusDot } from '@/components/ui/status-dot';
import { LayoutShell } from '@/components/layout/shell';
import { Header } from '@/components/layout/sidebar';
import {
  Activity, AlertTriangle, CheckCircle2, ChevronDown, ChevronUp,
  RefreshCw, Shield, XCircle, Lock, Unlock, ArrowRight,
} from 'lucide-react';

const steps = ['STOP', 'QUARANTINE', 'COMPACT_RESTORE', 'COMPARE_1', 'SYNC', 'COMPARE_2', 'UNBLOCK'] as const;
const stepLabels: Record<string, string> = {
  STOP: 'Stop', QUARANTINE: 'Quarantine', COMPACT_RESTORE: 'Compact / Restore',
  COMPARE_1: 'Compare ≥93%', SYNC: 'Sync', COMPARE_2: 'Compare ≥93%', UNBLOCK: 'Unblock',
};
const stepIcons: Record<string, React.ReactNode> = {
  STOP: <Lock size={14} />, QUARANTINE: <XCircle size={14} />, COMPACT_RESTORE: <RefreshCw size={14} />,
  COMPARE_1: <CheckCircle2 size={14} />, SYNC: <RefreshCw size={14} />,
  COMPARE_2: <CheckCircle2 size={14} />, UNBLOCK: <Unlock size={14} />,
};

const scMap: Record<string, string> = {
  green: 'bg-green-500/15 text-green-400 border-green-500/30',
  yellow: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30',
  red: 'bg-red-500/15 text-red-400 border-red-500/30',
};

function GateProgress({ state }: { state: { currentStep: string; status: string; passRate: number | null } }) {
  const ci = steps.indexOf(state.currentStep as any);
  return (
    <div className="flex items-center gap-1">
      {steps.map((step, i) => {
        const ia = i === ci, ic = i < ci, ifa = state.status === 'red' && ia;
        return (
          <div key={step} className="flex flex-col items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${ic ? 'bg-green-500 text-white' : ifa ? 'bg-red-500 text-white' : ia ? 'bg-indigo-500 text-white animate-pulse' : 'bg-surface-800 text-surface-500'}`}>
              {ic ? <CheckCircle2 size={14} /> : stepIcons[step]}
            </div>
            <span className="text-[10px] mt-1 text-surface-500 hidden xl:block">{stepLabels[step]}</span>
            {i < steps.length - 1 && <ArrowRight size={12} className="text-surface-600 mx-0.5 hidden xl:block" />}
          </div>
        );
      })}
    </div>
  );
}

export default function ContinuityPage() {
  const { continuity: data, loading } = useData();
  const [exp, setExp] = useState<string | null>(null);

  if (loading || !data) {
    return (
      <LayoutShell title="Continuity — Restore Gate View">
        <div className="flex items-center justify-center py-20">
          <div className="text-surface-400 text-sm">Loading continuity data…</div>
        </div>
      </LayoutShell>
    );
  }

  return (
    <LayoutShell title="Continuity — Restore Gate View">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold">Restore Gate Pipeline</h2>
            <p className="text-sm text-surface-400 mt-1">Monitor compact/restore/compare/sync/unblock states across all lanes</p>
          </div>
          <Badge variant="info" icon={<Shield size={14} />}>Threshold: ≥93%</Badge>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Card title="Green" icon={<CheckCircle2 size={16} />}>
            <Metric label="Lanes" value={data.continuity.filter(c => c.status === 'green').length} className="text-green-400" />
            <span className="text-xs text-surface-500 mt-1">healthy</span>
          </Card>
          <Card title="Yellow" icon={<AlertTriangle size={16} />}>
            <Metric label="Lanes" value={data.continuity.filter(c => c.status === 'yellow').length} className="text-yellow-400" />
            <span className="text-xs text-surface-500 mt-1">caution</span>
          </Card>
          <Card title="Red" icon={<XCircle size={16} />}>
            <Metric label="Lanes" value={data.continuity.filter(c => c.status === 'red').length} className="text-red-400" />
            <span className="text-xs text-surface-500 mt-1">action needed</span>
          </Card>
          <Card title="Avg Pass Rate" icon={<Activity size={16} />}>
            <Metric label="%" value={(data.continuity.reduce((a, c) => a + (c.passRate || 0), 0) / data.continuity.length).toFixed(1)} className="text-indigo-400" />
            <span className="text-xs text-surface-500 mt-1">across lanes</span>
          </Card>
        </div>

        <Card title="Gate Pipeline" icon={<Activity size={16} />}>
          <div className="overflow-x-auto py-2">
            <div className="min-w-[800px]">
              {data.continuity.map((state) => (
                <div key={state.laneId} className="mb-4 last:mb-0 cursor-pointer" onClick={() => setExp(exp === state.laneId ? null : state.laneId)}>
                  <div className="flex items-center gap-3">
                    <div className="w-28 text-right">
                      <span className="text-sm font-semibold text-surface-100">{state.laneId.charAt(0).toUpperCase() + state.laneId.slice(1)}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <GateProgress state={state} />
                    </div>
                    <div className="w-32 text-right">
                      <Badge variant={state.status as any} className={scMap[state.status]}>{state.passRate}%</Badge>
                    </div>
                    <div className="w-8 text-center">
                      {exp === state.laneId ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                    </div>
                  </div>
                  {exp === state.laneId && (
                    <div className="ml-36 mt-3 pt-3 border-t border-surface-700/30">
                      <p className="text-sm text-surface-300">{state.details}</p>
                      <div className="mt-2 text-xs text-surface-500">Last updated: {new Date(state.lastUpdated).toLocaleString()}</div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </Card>

        <Card title="Blockers & Alerts" icon={<AlertTriangle size={16} />}>
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-red-500/5 border border-red-500/20">
              <XCircle size={18} className="text-red-400 flex-shrink-0" />
              <div>
                <div className="text-sm font-medium text-red-400">Library — UNBLOCK DENIED</div>
                <div className="text-xs text-surface-400">Restore comparison at 88.2%. Graph index scope explosion unresolved.</div>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-yellow-500/5 border border-yellow-500/20">
              <AlertTriangle size={18} className="text-yellow-400 flex-shrink-0" />
              <div>
                <div className="text-sm font-medium text-yellow-400">Library — Branch Divergence</div>
                <div className="text-xs text-surface-400">feat/graph-index-scope is 5 ahead / 3 behind main.</div>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-surface-900 border border-surface-700/30">
              <RefreshCw size={18} className="text-surface-400 flex-shrink-0" />
              <div>
                <div className="text-sm font-medium text-surface-300">Control Plane — Behind by 2</div>
                <div className="text-xs text-surface-400">Git: 0 ahead, 2 behind main.</div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </LayoutShell>
  );
}

function Metric({ label, value, className }: { label: string; value: string | number; className?: string }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-xs text-surface-400 uppercase tracking-wider font-medium">{label}</span>
      <span className={`text-lg font-bold ${className || 'text-surface-100'}`}>{value}</span>
    </div>
  );
}