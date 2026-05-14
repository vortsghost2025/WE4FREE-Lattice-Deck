'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Metric } from '@/components/ui/metric';
import { Badge } from '@/components/ui/badge';
import { StatusDot } from '@/components/ui/status-dot';
import { LayoutShell } from '@/components/layout/shell';
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  Clock,
  GitBranch,
  Server,
  Shield,
  XCircle,
  Send,
  MessageSquare,
  ChevronDown,
  ChevronUp,
  LayoutDashboard,
  Tv,
  Users,
  User,
} from 'lucide-react';

const lanes = [
  {
    id: 'archivist', name: 'Archivist', status: 'active' as const,
    currentTask: 'Ingesting artifact batch #2847 — verifying checksums',
    lastHeartbeat: '2 min ago', lastCommit: 'a3f8c2e (3h ago)',
    lastCompact: 'Today 04:00', lastRestore: 'Yesterday 22:15',
    lastTestResult: 'pass' as const, gitBranch: 'main', gitAhead: 2, gitBehind: 0,
    driftWarning: false, blockerCount: 0, activeSurfaces: ['Desktop', 'Headless'],
    currentAgent: 'archivist-agent-v3', contextPercent: 87.3, compactCount: 1247,
  },
  {
    id: 'library', name: 'Library', status: 'blocked' as const,
    currentTask: 'Graph index scope explosion — under investigation',
    lastHeartbeat: '38 min ago', lastCommit: 'b71d4f0 (1d ago)',
    lastCompact: 'Today 03:30', lastRestore: 'Yesterday 21:45',
    lastTestResult: 'fail' as const, gitBranch: 'feat/graph-index-scope', gitAhead: 5, gitBehind: 3,
    driftWarning: true, blockerCount: 2, activeSurfaces: ['Headless', 'Gastown'],
    currentAgent: 'library-agent-v3', contextPercent: 94.1, compactCount: 892,
  },
  {
    id: 'swarmmind', name: 'SwarmMind', status: 'active' as const,
    currentTask: 'Lane loop iteration #139 — sovereignty check',
    lastHeartbeat: '3 min ago', lastCommit: 'e90aa31 (5h ago)',
    lastCompact: null, lastRestore: null,
    lastTestResult: 'pass' as const, gitBranch: 'main', gitAhead: 0, gitBehind: 1,
    driftWarning: false, blockerCount: 0, activeSurfaces: ['Headless'],
    currentAgent: 'swarm-agent-v2', contextPercent: 97.0, compactCount: 0,
  },
  {
    id: 'kernel', name: 'Kernel', status: 'active' as const,
    currentTask: 'Lane loop — monitoring health signals',
    lastHeartbeat: '2 min ago', lastCommit: 'c4d5e6f (6h ago)',
    lastCompact: null, lastRestore: null,
    lastTestResult: 'pass' as const, gitBranch: 'main', gitAhead: 1, gitBehind: 0,
    driftWarning: false, blockerCount: 0, activeSurfaces: ['Headless'],
    currentAgent: 'kernel-agent-v1', contextPercent: 99.2, compactCount: 0,
  },
];

const cp = {
  name: 'Control Plane', status: 'active' as const,
  currentTask: 'Rig coordination — 4 lanes supervised',
  lastHeartbeat: '2 min ago', coordinatorVersion: 'v2.4.1',
  activeLanes: 4, messageQueueDepth: 3, pendingDecisions: 1,
  gitBranch: 'main', gitAhead: 0, gitBehind: 2,
};

const typeColors: Record<string, string> = {
  PROGRESSION: 'green', REGRESSION: 'red', REPAIR: 'cyan', UNDO: 'yellow',
  OVERWRITE: 'pink', DUPLICATION: 'purple', RECONCILIATION: 'blue',
  INFRASTRUCTURE: 'info', UNKNOWN: 'info',
};

const timelineEvents = [
  { id: 'e1', time: '08:12', lane: 'Archivist', surface: 'Headless', type: 'REPAIR' as const, title: 'Recovery snapshot regenerated → 12/12 PASS', badge: 'green' },
  { id: 'e2', time: '07:45', lane: 'Library', surface: 'Headless', type: 'REGRESSION' as const, title: 'CI push failures begin — every ~4 min', badge: 'red' },
  { id: 'e3', time: '07:30', lane: 'Library', surface: 'Headless', type: 'RECONCILIATION' as const, title: 'Sovereignty check cycle 139', badge: 'blue' },
  { id: 'e4', time: '05:00', lane: 'SwarmMind', surface: 'Headless', type: 'PROGRESSION' as const, title: 'Lane loop iteration 139 complete', badge: 'green' },
  { id: 'e5', time: '04:00', lane: 'Archivist', surface: 'Headless', type: 'INFRASTRUCTURE' as const, title: 'Compact/restore cycle #1247 — 96.8%', badge: 'info' },
  { id: 'e6', time: '03:30', lane: 'Library', surface: 'Desktop', type: 'UNDO' as const, title: 'Scope resolver WIP reverted — conflict', badge: 'yellow' },
  { id: 'e7', time: '03:00', lane: 'Kernel', surface: 'Headless', type: 'PROGRESSION' as const, title: 'Health signal baseline updated', badge: 'green' },
  { id: 'e8', time: '02:15', lane: 'Archivist', surface: 'Headless', type: 'REPAIR' as const, title: 'Block chain verification repaired — block 2846', badge: 'cyan' },
  { id: 'e9', time: '01:00', lane: 'Control Plane', surface: 'Desktop', type: 'INFRASTRUCTURE' as const, title: 'Rig coordination update v2.4.1', badge: 'info' },
  { id: 'e10', time: 'Yday 22:15', lane: 'Archivist', surface: 'Desktop', type: 'RECONCILIATION' as const, title: 'Restore gate: Desktop ↔ Headless — 97.2%', badge: 'blue' },
  { id: 'e11', time: 'Yday 20:00', lane: 'Library', surface: 'Gastown', type: 'PROGRESSION' as const, title: 'Sovereignty reported to Mayor', badge: 'green' },
  { id: 'e12', time: 'Yday 16:03', lane: 'Archivist', surface: 'Headless', type: 'PROGRESSION' as const, title: 'Added archivist to continuous-improvement loop', badge: 'green' },
  { id: 'e13', time: 'Yday 12:22', lane: 'Library', surface: 'Headless', type: 'PROGRESSION' as const, title: 'Cycle 139 sovereignty PASS', badge: 'green' },
  { id: 'e14', time: 'Yday 10:40', lane: 'Archivist', surface: 'Headless', type: 'REGRESSION' as const, title: 'CI push failures begin — network/auth', badge: 'red' },
];

export default function OverviewPage() {
  const [filterHours, setFilterHours] = useState(48);

  const filteredEvents = timelineEvents.filter(e => {
    if (filterHours === 6) return e.id === 'e1' || e.id === 'e2' || e.id === 'e3';
    if (filterHours === 12) return ['e1','e2','e3','e4','e5','e6','e7','e8','e9'].includes(e.id);
    if (filterHours === 24) return true;
    return true;
  });

  return (
    <LayoutShell title="Organism Overview">
      <div className="space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h2 className="text-xl font-semibold">WE4FREE Organism</h2>
            <p className="text-sm text-neutral-400 mt-1 dark:text-neutral-500">4 lanes · 4 surfaces · 1 Control Plane</p>
          </div>
          <Badge variant="active" icon={<StatusDot status="active" pulse size="sm" />}>
            System Online — {new Date().toLocaleTimeString()}
          </Badge>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card title="Lanes Active" icon={<Server size={16} />}>
            <Metric label="Status" value="3/4" />
            <span className="text-xs text-green-400 mt-1">1 blocked (Library)</span>
          </Card>
          <Card title="Total Blockers" icon={<XCircle size={16} />}>
            <Metric label="Open" value={2} />
            <span className="text-xs text-neutral-400 dark:text-neutral-500 mt-1">across all lanes</span>
          </Card>
          <Card title="Pending Decisions" icon={<AlertTriangle size={16} />}>
            <Metric label="Actions Needed" value={1} />
            <span className="text-xs text-orange-400 mt-1">operator required</span>
          </Card>
          <Card title="Drift Warnings" icon={<GitBranch size={16} />}>
            <Metric label="Affected" value={1} />
            <span className="text-xs text-yellow-400 mt-1">Library branch drift</span>
          </Card>
        </div>

        <Card
          title={
            <div className="flex items-center gap-2">
              <Shield size={16} /> Control Plane
              <Badge variant={cp.status} className="ml-auto">{cp.status}</Badge>
            </div>
          }
          headerAction={<Badge variant="info">v{cp.coordinatorVersion}</Badge>}
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <Metric label="Version" value={cp.coordinatorVersion} />
            <Metric label="Active Lanes" value={cp.activeLanes} />
            <Metric label="Message Queue" value={cp.messageQueueDepth} />
            <Metric label="Git" value={`${cp.gitAhead}A / ${cp.gitBehind}B`} />
          </div>
          <div className="flex items-center gap-2 text-sm">
            <StatusDot status={cp.status} />
            <span className="text-neutral-300 dark:text-neutral-200">{cp.currentTask}</span>
          </div>
          <div className="mt-2 text-xs text-neutral-500">Last heartbeat: {cp.lastHeartbeat}</div>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {lanes.map((lane) => (
            <Card
              key={lane.id}
              title={
                <div className="flex items-center gap-2">
                  <StatusDot status={lane.status} pulse={lane.status === 'active'} />
                  <span>{lane.name}</span>
                  <Badge variant={lane.status} className="ml-auto text-xs">{lane.status}</Badge>
                </div>
              }
              icon={<Activity size={16} />}
            >
              <div className="space-y-3">
                <div className="text-sm text-neutral-300 dark:text-neutral-200">{lane.currentTask || 'Idle'}</div>
                <div className="grid grid-cols-2 gap-3">
                  <Metric label="Agent" value={lane.currentAgent || '—'} className="text-xs" />
                  <Metric label="Context" value={`${lane.contextPercent}%`} className="text-xs" />
                  <Metric label="Branch" value={lane.gitBranch} className="text-xs" />
                  <Metric label="Last Commit" value={lane.lastCommit} className="text-xs" />
                  <Metric label="Last Heartbeat" value={lane.lastHeartbeat} className="text-xs" />
                  <Metric label="Compact" value={lane.compactCount} className="text-xs" />
                </div>
                <div>
                  <div className="text-[10px] text-neutral-400 uppercase tracking-wider font-medium mb-1">Active Surfaces</div>
                  <div className="flex gap-2">
                    {lane.activeSurfaces.map(s => (
                      <Badge key={s} variant="info" className="text-xs">{s}</Badge>
                    ))}
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2 pt-2 border-t border-neutral-700/30">
                  <div className="text-center">
                    <div className="text-[10px] text-neutral-400">Last Compact</div>
                    <div className="text-sm">{lane.lastCompact || '—'}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-[10px] text-neutral-400">Last Restore</div>
                    <div className="text-sm">{lane.lastRestore || '—'}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-[10px] text-neutral-400">Test</div>
                    <div className="flex items-center justify-center gap-1">
                      {lane.lastTestResult === 'pass' && <CheckCircle2 size={14} className="text-green-400" />}
                      {lane.lastTestResult === 'fail' && <XCircle size={14} className="text-red-400" />}
                      <span className="text-sm capitalize">{lane.lastTestResult}</span>
                    </div>
                  </div>
                </div>
                {(lane.driftWarning || lane.blockerCount > 0) && (
                  <div className="flex gap-2 pt-2 border-t border-neutral-700/30">
                    {lane.driftWarning && <Badge variant="warning" icon={<GitBranch size={12} />}>Drift Warning</Badge>}
                    {lane.blockerCount > 0 && <Badge variant="needs-operator">{lane.blockerCount} Blocker{lane.blockerCount > 1 ? 's' : ''}</Badge>}
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>

        <Card
          title={
            <div className="flex items-center gap-2">
              <Clock size={16} /> Timeline
              <Badge variant="info">{filteredEvents.length} events</Badge>
            </div>
          }
          headerAction={
            <select
              value={filterHours}
              onChange={e => setFilterHours(parseInt(e.target.value))}
              className="bg-neutral-800 border border-neutral-700/30 rounded-lg px-2 py-1 text-xs text-neutral-200 focus:ring-2 focus:ring-indigo-500/50"
            >
              <option value={48}>Last 48h</option>
              <option value={24}>Last 24h</option>
              <option value={12}>Last 12h</option>
              <option value={6}>Last 6h</option>
            </select>
          }
        >
          <div className="space-y-1 max-h-[400px] overflow-y-auto">
            {filteredEvents.map((event) => (
              <div key={event.id} className="flex items-start gap-3 p-2.5 rounded hover:bg-neutral-800/40 transition-colors">
                <div className={`w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0 bg-${typeColors[event.type]}-400`} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-medium text-neutral-100">{event.title}</span>
                    <Badge variant={typeColors[event.type] as any} className="text-[10px]">{event.type}</Badge>
                  </div>
                  <div className="flex items-center gap-3 mt-0.5 text-[11px] text-neutral-500">
                    <span>{event.time}</span>
                    <span>•</span>
                    <span>{event.lane} / {event.surface}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card
          title={<div className="flex items-center gap-2"><MessageSquare size={16} /> Quick Message</div>}
        >
          <p className="text-sm text-neutral-400 dark:text-neutral-500 mb-3">Send a governance-safe message to one or more lanes.</p>
          <div className="space-y-3">
            <div>
              <label className="text-xs text-neutral-400 uppercase tracking-wider font-medium mb-1 block dark:text-neutral-500">To</label>
              <div className="flex flex-wrap gap-2">
                {lanes.map((l) => (
                  <Badge key={l.id} variant="info" className="cursor-pointer hover:bg-indigo-500/30 transition-colors">
                    <StatusDot status={l.status} size="sm" /> {l.name}
                  </Badge>
                ))}
              </div>
            </div>
            <div>
              <label className="text-xs text-neutral-400 uppercase tracking-wider font-medium mb-1 block dark:text-neutral-500">Instruction</label>
              <textarea
                placeholder="Type plain-language instruction..."
                className="w-full bg-neutral-900 border border-neutral-700/30 rounded-lg px-3 py-2 text-sm text-neutral-200 placeholder-neutral-500 focus:ring-2 focus:ring-indigo-500/50 focus:border-transparent resize-none"
                rows={2}
              />
            </div>
            <button className="px-4 py-2 rounded-lg bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-medium transition-colors flex items-center gap-2">
              <Send size={14} />
              Preview & Send
            </button>
          </div>
        </Card>
      </div>
    </LayoutShell>
  );
}