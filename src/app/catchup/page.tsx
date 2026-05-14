'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LayoutShell } from '@/components/layout/shell';
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  GitBranch,
  Activity,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  XCircle,
  Shield,
  MessageSquare,
  Filter,
  Copy,
} from 'lucide-react';

type PriorityLevel = 'critical' | 'high';

const catchUpData = {
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
  },
  operator: {
    decisionsNeeded: [
      {
        title: 'Library Sovereignty Below Threshold',
        description: 'Library compact/restore comparison = 88.2%. Quarantine or allow headless to continue?',
        priority: 'critical' as const,
        lane: 'Library',
      },
      {
        title: 'Library Branch Divergence',
        description: 'feat/graph-index-scope is 5 ahead and 3 behind main. Merge or hold?',
        priority: 'high' as const,
        lane: 'Library',
      },
    ],
  },
};

function SectionHeader({ icon, title, badge }: { icon: React.ReactNode; title: string; badge?: string }) {
  return (
    <div className="flex items-center gap-2 mb-3">
      <span className="text-lg">{icon}</span>
      <h3 className="text-sm font-semibold text-neutral-100">{title}</h3>
      {badge && <Badge variant="info">{badge}</Badge>}
    </div>
  );
}

export default function CatchUpPage() {
  const [viewMode, setViewMode] = useState<'human' | 'researcher'>('human');

const priorityColors: Record<PriorityLevel, string> = {
     critical: 'bg-red-500/20 text-red-400 border-red-500/30',
     high: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
   };

  return (
    <LayoutShell title="Catch Me Up">
      <div className="space-y-6">
        <Card title="⚡ I Was Gone — Catch Me Up" icon={<Clock size={16} />} className="border-neutral-700/50">
          <div className="text-center py-4">
            <p className="text-sm text-neutral-400 dark:text-neutral-500 mb-4">Last catch-up: 38 min ago. 14 events since.</p>
            <div className="flex gap-3 justify-center flex-wrap">
              <button onClick={() => setViewMode('human')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${viewMode === 'human' ? 'bg-indigo-500 text-white' : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700'}`}>
                👤 Human Summary
              </button>
              <button onClick={() => setViewMode('researcher')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${viewMode === 'researcher' ? 'bg-indigo-500 text-white' : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700'}`}>
                🔬 Researcher View
              </button>
              <div className="px-4 py-2 rounded-lg text-sm font-medium bg-neutral-800 text-orange-400 border border-orange-500/20">
                ⚡ Operator Only
              </div>
            </div>
          </div>
        </Card>

<Card title="Decisions Needed" icon={<AlertTriangle size={16} />} className="border-red-500/20">
          {catchUpData.operator.decisionsNeeded.map((decision, i) => {
            const p = decision.priority as PriorityLevel;
            return (
              <div key={i} className="p-3 rounded-lg bg-red-500/5 border border-red-500/20 mb-3 last:mb-0">
                <div className="flex items-start gap-2">
                  <Badge variant={p} className={`${priorityColors[p]}`}>
                    {decision.priority}
                  </Badge>
                  <div>
                    <div className="text-sm font-medium text-red-400">{decision.title}</div>
                    <p className="text-xs text-neutral-400 dark:text-neutral-500 mt-1">{decision.description}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </Card>

        {viewMode === 'human' && (
          <div className="space-y-4">
            <Card>
              <SectionHeader icon={<GitBranch size={14} />} title="What Changed" badge={String(catchUpData.humanReadable.whatChanged.length)} />
              <ul className="space-y-2">
                {catchUpData.humanReadable.whatChanged.map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-neutral-300 dark:text-neutral-200">
                    <CheckCircle2 size={14} className="text-green-400 mt-0.5 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </Card>

            <Card>
              <SectionHeader icon={<XCircle size={14} />} title="What Broke" badge={String(catchUpData.humanReadable.whatBroke.length)} />
              <ul className="space-y-2">
                {catchUpData.humanReadable.whatBroke.map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-neutral-300 dark:text-neutral-200">
                    <XCircle size={14} className="text-red-400 mt-0.5 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </Card>

            <Card>
              <SectionHeader icon={<RefreshCw size={14} />} title="What Was Fixed" badge={String(catchUpData.humanReadable.whatWasFixed.length)} />
              <ul className="space-y-2">
                {catchUpData.humanReadable.whatWasFixed.map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-neutral-300 dark:text-neutral-200">
                    <Activity size={14} className="text-cyan-400 mt-0.5 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </Card>

            <Card>
              <SectionHeader icon={<AlertTriangle size={14} />} title="Needs Your Attention" badge={String(catchUpData.humanReadable.whatNeedsOperator.length)} />
              <ul className="space-y-2">
                {catchUpData.humanReadable.whatNeedsOperator.map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-orange-400">
                    <AlertTriangle size={14} className="mt-0.5 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </Card>

            <Card>
              <SectionHeader icon={<MessageSquare size={14} />} title="Agents Involved" />
              <div className="flex flex-wrap gap-2">
                {catchUpData.humanReadable.whichAgents.map((agent) => (
                  <Badge key={agent} variant="info" className="text-xs">{agent}</Badge>
                ))}
              </div>
            </Card>
          </div>
        )}

        {viewMode === 'researcher' && (
          <div className="space-y-4">
            <Card>
              <SectionHeader icon={<Activity size={14} />} title="Causal Chain" />
              <div className="space-y-4">
                {catchUpData.researcher.causalChain.map((event, i) => (
                  <div key={i} className="relative pl-6">
                    {i < catchUpData.researcher.causalChain.length - 1 && (
                      <div className="absolute left-2 top-8 bottom-0 w-0.5 bg-neutral-700" />
                    )}
                    <div className="absolute left-0 top-1 w-3 h-3 rounded-full bg-indigo-500 border-2 border-neutral-950" />
                    <div className="text-sm">
                      <span className="text-neutral-500 text-xs">{event.timestamp}</span>
                      <p className="text-neutral-200 dark:text-neutral-100">{event.event}</p>
                      {event.cause && (
                        <p className="text-xs text-neutral-500 italic mt-1">Cause: {event.cause}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            <Card title="Git References" icon={<GitBranch size={16} />}>
              <div className="flex flex-wrap gap-2">
                {catchUpData.researcher.gitRefs.map((ref) => (
                  <Badge key={ref} variant="info"><GitBranch size={12} className="mr-1" />{ref}</Badge>
                ))}
              </div>
            </Card>

            <Card title="Artifacts" icon={<Copy size={16} />}>
              <ul className="space-y-1">
                {catchUpData.researcher.artifacts.map((path) => (
                  <li key={path} className="text-sm">
                    <a href="#" className="text-indigo-400 hover:underline">{path}</a>
                  </li>
                ))}
              </ul>
            </Card>

            <Card title="Lane Attribution" icon={<Filter size={16} />}>
              {Object.entries({
                archivist: ['recovery snapshot', 'block chain repair', 'CI push recovery', 'continuous-improvement loop'],
                library: ['sovereignty cycle 139', 'graph index scope explosion', 'scope resolver WIP'],
                swarmmind: ['lane loop iteration 139'],
                kernel: ['health signal baseline update'],
                'control-plane': ['rig coordination update v2.4.1'],
              }).map(([lane, actions]) => (
                <div key={lane} className="mb-3 last:mb-0">
                  <div className="text-sm font-medium text-neutral-200 dark:text-neutral-100 capitalize mb-1">{lane}</div>
                  <ul className="ml-3 space-y-0.5">
                    {actions.map((action: string) => (
                      <li key={action} className="text-xs text-neutral-400 dark:text-neutral-500">• {action}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </Card>

            <Card title="Classification Summary" icon={<Shield size={16} />}>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between items-center py-2 border-b border-neutral-700/30">
                  <span className="text-neutral-400 dark:text-neutral-500">Regression Classification</span>
                  <Badge variant="error">Library graph index scope explosion</Badge>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-neutral-700/30">
                  <span className="text-neutral-400 dark:text-neutral-500">Progression Classification</span>
                  <Badge variant="progression">Archivist self-improvement enabled</Badge>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-neutral-700/30">
                  <span className="text-neutral-400 dark:text-neutral-500">Swarm & Kernel</span>
                  <Badge variant="success">Stable — no regressions</Badge>
                </div>
                <div className="pt-2">
                  <span className="text-xs text-neutral-500 dark:text-neutral-600">Unresolved Uncertainty:</span>
                  <ul className="mt-1 space-y-0.5">
                    <li className="text-xs text-yellow-400">• Library scope explosion root cause not yet confirmed</li>
                    <li className="text-xs text-yellow-400">• Whether desktop revert fully resolved the divergence</li>
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