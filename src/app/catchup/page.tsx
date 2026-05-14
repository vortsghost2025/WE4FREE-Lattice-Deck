'use client';

import { useState } from 'react';
import { useData } from '@/lib/hooks/useData';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LayoutShell } from '@/components/layout/shell';
import { Header } from '@/components/layout/sidebar';
import {
  AlertTriangle, CheckCircle2, Clock, GitBranch, Activity,
  RefreshCw, Copy, MessageSquare, Filter, ChevronDown, ChevronUp, XCircle, Shield,
} from 'lucide-react';

const catchUpStatic = {
  humanReadable: {
    whatChanged: [
      'Archivist: Recovery snapshot regenerated (12/12 PASS)',
      'Control Plane: Updated to coordination v2.4.1',
      'Library: Graph index scope resolver modified on desktop (WIP)',
    ],
    whatBroke: [
      'Library CI loop failing since 10:40 — graph scope index overflow, ~20 failures',
      'Library desktop↔headless divergence on scope resolver branch',
    ],
    whatWasFixed: [
      'Archivist block chain corruption in block 2846 auto-repaired',
      'Archivist CI push failures resolved (network issue cleared)',
    ],
    whatNeedsOperator: [
      'Library sovereignty below threshold (88.2%) — unblock decision needed',
      'Library branch feat/graph-index-scope is 5 ahead, 3 behind main',
    ],
    whichAgents: ['archivist-agent-v3', 'library-agent-v3', 'swarm-agent-v2', 'kernel-agent-v1', 'mayor-proxy'],
  },
  researcher: {
    causalChain: [
      { timestamp: 'May 14 08:12', event: 'Archivist recovery snapshot regenerated', cause: 'Automated cycle' },
      { timestamp: 'May 14 07:45', event: 'Library CI failures begin', cause: 'Graph scope index overflow' },
      { timestamp: 'May 14 03:30', event: 'Library scope resolver revert on desktop', cause: 'Conflict with headless branch' },
      { timestamp: 'May 14 03:00', event: 'SwarmMind iteration 139 complete', cause: 'Autonomous' },
      { timestamp: 'May 14 01:00', event: 'Control Plane rig coordination update', cause: 'Operator deployment' },
      { timestamp: 'May 14 02:15', event: 'Archivist block chain repair', cause: 'Corruption auto-detected' },
    ],
    gitRefs: ['a3f8c2e', 'b71d4f0', 'e90aa31', 'c4d5e6f', 'cp-2.4.1'],
    artifacts: [
      '/artifacts/archivist/snapshot-20260514-0812',
      '/artifacts/library/ci-log-20260514-0745',
      '/artifacts/swarmmind/iteration-139',
      '/artifacts/archivist/compact-1247',
      '/artifacts/archivist/repair-2846',
    ],
    laneAttribution: {
      archivist: ['recovery snapshot', 'block chain repair', 'CI push recovery', 'continuous-improvement loop'],
      library: ['sovereignty cycle 139', 'graph index scope explosion', 'scope resolver WIP'],
      swarmmind: ['lane loop iteration 139'],
      kernel: ['health signal baseline update'],
      'control-plane': ['rig coordination update v2.4.1'],
    },
  },
  operator: {
    decisionsNeeded: [
      { title: 'Library Sovereignty Below Threshold', description: 'compact/restore = 88.2%. Quarantine or allow headless to continue?', priority: 'critical' as const, lane: 'Library' },
      { title: 'Library Branch Divergence', description: 'feat/graph-index-scope: 5 ahead / 3 behind main. Merge or hold?', priority: 'high' as const, lane: 'Library' },
    ],
  },
};

function SectionHeader({ icon, title, badge }: { icon: React.ReactNode; title: string; badge?: string }) {
  return (
    <div className="flex items-center gap-2 mb-3">
      <span className="text-lg">{icon}</span>
      <h3 className="text-sm font-semibold text-surface-100">{title}</h3>
      {badge && <Badge variant="info">{badge}</Badge>}
    </div>
  );
}

export default function CatchUpPage() {
  const { lanes } = useData();
  const [viewMode, setViewMode] = useState<'human' | 'researcher'>('human');

  return (
    <LayoutShell title="Catch Me Up">
      <div className="space-y-6">
        <Card title="I Was Gone — Catch Me Up" icon={<Clock size={16} />} className="border-indigo-500/30">
          <div className="text-center py-4">
            <p className="text-sm text-surface-400 mb-4">Last catch-up: 38 min ago. 14 events since then.</p>
            <div className="flex gap-3 justify-center">
              <button onClick={() => setViewMode('human')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${viewMode === 'human' ? 'bg-indigo-500 text-white' : 'bg-surface-800 text-surface-300 hover:bg-surface-700'}`}>
                Human Summary
              </button>
              <button onClick={() => setViewMode('researcher')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${viewMode === 'researcher' ? 'bg-indigo-500 text-white' : 'bg-surface-800 text-surface-300 hover:bg-surface-700'}`}>
                Researcher View
              </button>
              <button className="px-4 py-2 rounded-lg text-sm font-medium bg-surface-800 text-orange-400 hover:bg-surface-700 transition-colors border border-orange-500/20">
                ⚡ Operator Only
              </button>
            </div>
          </div>
        </Card>

        <Card title="⚡ Decisions Needed" icon={<AlertTriangle size={16} />} className="border-red-500/20">
          {catchUpStatic.operator.decisionsNeeded.map((d, i) => (
            <div key={i} className="p-3 rounded-lg bg-red-500/5 border border-red-500/20 mb-3 last:mb-0">
              <div className="flex items-start gap-2">
                <Badge variant={d.priority}>{d.priority}</Badge>
                <div>
                  <div className="text-sm font-medium text-red-400">{d.title}</div>
                  <p className="text-xs text-surface-400 mt-1">{d.description}</p>
                </div>
              </div>
            </div>
          ))}
        </Card>

        {viewMode === 'human' ? (
          <div className="space-y-4">
            <Card><SectionHeader icon={<GitBranch size={14} />} title="What Changed" badge={String(catchUpStatic.humanReadable.whatChanged.length)} />
              <ul className="space-y-2">
                {catchUpStatic.humanReadable.whatChanged.map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-surface-300"><CheckCircle2 size={14} className="text-green-400 mt-0.5 flex-shrink-0" />{item}</li>
                ))}
              </ul>
            </Card>
            <Card><SectionHeader icon={<XCircle size={14} />} title="What Broke" badge={String(catchUpStatic.humanReadable.whatBroke.length)} />
              <ul className="space-y-2">
                {catchUpStatic.humanReadable.whatBroke.map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-surface-300"><XCircle size={14} className="text-red-400 mt-0.5 flex-shrink-0" />{item}</li>
                ))}
              </ul>
            </Card>
            <Card><SectionHeader icon={<RefreshCw size={14} />} title="What Was Fixed" badge={String(catchUpStatic.humanReadable.whatWasFixed.length)} />
              <ul className="space-y-2">
                {catchUpStatic.humanReadable.whatWasFixed.map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-surface-300"><Activity size={14} className="text-cyan-400 mt-0.5 flex-shrink-0" />{item}</li>
                ))}
              </ul>
            </Card>
            <Card><SectionHeader icon={<AlertTriangle size={14} />} title="Needs Your Attention" badge={String(catchUpStatic.humanReadable.whatNeedsOperator.length)} />
              <ul className="space-y-2">
                {catchUpStatic.humanReadable.whatNeedsOperator.map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-orange-400"><AlertTriangle size={14} className="mt-0.5 flex-shrink-0" />{item}</li>
                ))}
              </ul>
            </Card>
            <Card><SectionHeader icon={<MessageSquare size={14} />} title="Agents Involved" />
              <div className="flex flex-wrap gap-2">
                {catchUpStatic.humanReadable.whichAgents.map((a) => <Badge key={a} variant="info" className="text-xs">{a}</Badge>)}
              </div>
            </Card>
          </div>
        ) : (
          <div className="space-y-4">
            <Card><SectionHeader icon={<Activity size={14} />} title="Causal Chain" />
              <div className="space-y-4">
                {catchUpStatic.researcher.causalChain.map((ev, i) => (
                  <div key={i} className="relative pl-6">
                    {i < catchUpStatic.researcher.causalChain.length - 1 && <div className="absolute left-2 top-8 bottom-0 w-0.5 bg-surface-700" />}
                    <div className="absolute left-0 top-1 w-3 h-3 rounded-full bg-indigo-500 border-2 border-surface-950" />
                    <div className="text-sm">
                      <span className="text-surface-400 text-xs">{ev.timestamp}</span>
                      <p className="text-surface-200">{ev.event}</p>
                      {ev.cause && <p className="text-xs text-surface-500 italic mt-1">Cause: {ev.cause}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
            <Card title="Git References" icon={<GitBranch size={16} />}>
              <div className="flex flex-wrap gap-2">
                {catchUpStatic.researcher.gitRefs.map(r => <Badge key={r} variant="info"><GitBranch size={12} className="mr-1" />{r}</Badge>)}
              </div>
            </Card>
            <Card title="Artifacts" icon={<Copy size={16} />}>
              <ul className="space-y-1">
                {catchUpStatic.researcher.artifacts.map(p => <li key={p}><a href="#" className="text-indigo-400 hover:underline text-sm">{p}</a></li>)}
              </ul>
            </Card>
            <Card title="Lane Attribution" icon={<Filter size={16} />}>
              {Object.entries(catchUpStatic.researcher.laneAttribution).map(([lane, actions]) => (
                <div key={lane} className="mb-3 last:mb-0">
                  <div className="text-sm font-medium text-surface-200 capitalize mb-1">{lane}</div>
                  <ul className="ml-3 space-y-0.5">
                    {actions.map(a => <li key={a} className="text-xs text-surface-400">• {a}</li>)}
                  </ul>
                </div>
              ))}
            </Card>
            <Card title="Classification Summary" icon={<Shield size={16} />}>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between items-center py-2 border-b border-surface-700/30">
                  <span className="text-surface-400">Regression</span>
                  <Badge variant="error">Library graph index scope explosion</Badge>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-surface-700/30">
                  <span className="text-surface-400">Progression</span>
                  <Badge variant="progression">Archivist self-improvement enabled</Badge>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-surface-700/30">
                  <span className="text-surface-400">Swarm & Kernel</span>
                  <Badge variant="success">Stable — no regressions</Badge>
                </div>
                <div className="pt-2">
                  <span className="text-xs text-surface-500">Unresolved Uncertainty:</span>
                  <ul className="mt-1 space-y-0.5">
                    <li className="text-xs text-yellow-400">• Library scope explosion root cause not confirmed</li>
                    <li className="text-xs text-yellow-400">• Whether desktop revert fully resolved divergence</li>
                  </ul>
                </div>
              </div>
            </Card>
          </div>
        )}
      </div>
    </LayoutShell>
  );
}