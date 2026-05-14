'use client';

import { useState, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LayoutShell } from '@/components/layout/shell';
import {
  Clock,
  Filter,
  ChevronDown,
  ChevronUp,
  GitBranch,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  Activity,
  Shield,
  XCircle,
  LayoutDashboard,
  Server,
  Tv,
} from 'lucide-react';

type EntityId = 'archivist' | 'library' | 'swarmmind' | 'kernel' | 'control-plane';

const eventTypes: Record<string, { label: string; color: string }> = {
  PROGRESSION: { label: 'Progression', color: 'green' },
  REGRESSION: { label: 'Regression', color: 'red' },
  REPAIR: { label: 'Repair', color: 'cyan' },
  UNDO: { label: 'Undo', color: 'yellow' },
  OVERWRITE: { label: 'Overwrite', color: 'pink' },
  DUPLICATION: { label: 'Duplication', color: 'purple' },
  RECONCILIATION: { label: 'Reconciliation', color: 'blue' },
  INFRASTRUCTURE: { label: 'Infrastructure', color: 'info' },
  UNKNOWN: { label: 'Unknown', color: 'info' },
};

const laneNames: Record<EntityId, string> = {
  archivist: 'Archivist',
  library: 'Library',
  swarmmind: 'SwarmMind',
  kernel: 'Kernel',
  'control-plane': 'Control Plane',
};

const surfaceNames: Record<string, string> = {
  desktop: 'Desktop',
  headless: 'Headless',
  gastown: 'Gastown',
  vps: 'VPS',
};

const timelineEvents = [
  { id: 'e1', timestamp: '2026-05-14T08:12:00Z', laneId: 'archivist' as EntityId, surfaceId: 'headless', type: 'REPAIR' as const, title: 'Recovery snapshot regenerated', description: '12/12 PASS — all integrity checks passed', artifactPath: '/artifacts/archivist/snapshot-20260514-0812', gitRef: 'a3f8c2e', attribution: 'archivist-agent-v3', classification: 'autonomous' },
  { id: 'e2', timestamp: '2026-05-14T07:45:00Z', laneId: 'library' as EntityId, surfaceId: 'headless', type: 'REGRESSION' as const, title: 'CI push failures begin', description: 'Failures every ~4 min — graph scope index overflow', artifactPath: '/artifacts/library/ci-log-20260514-0745', gitRef: 'b71d4f0', attribution: 'library-agent-v3', classification: 'autonomous' },
  { id: 'e3', timestamp: '2026-05-14T07:30:00Z', laneId: 'library' as EntityId, surfaceId: 'headless', type: 'RECONCILIATION' as const, title: 'Sovereignty check cycle 139', description: 'Graph index scope mismatch detected, reconciliation attempted', artifactPath: null, gitRef: 'b71d4f0', attribution: 'library-agent-v3', classification: 'autonomous' },
  { id: 'e4', timestamp: '2026-05-14T05:00:00Z', laneId: 'swarmmind' as EntityId, surfaceId: 'headless', type: 'PROGRESSION' as const, title: 'Lane loop iteration 139 complete', description: 'Sovereignty PASS — all sub-agents aligned', artifactPath: '/artifacts/swarmmind/iteration-139', gitRef: 'e90aa31', attribution: 'swarm-agent-v2', classification: 'autonomous' },
  { id: 'e5', timestamp: '2026-05-14T04:00:00Z', laneId: 'archivist' as EntityId, surfaceId: 'headless', type: 'INFRASTRUCTURE' as const, title: 'Compact/restore cycle complete', description: 'Cycle #1247 — 96.8% fidelity', artifactPath: '/artifacts/archivist/compact-1247', gitRef: 'a3f8c2e', attribution: 'archivist-agent-v3', classification: 'autonomous' },
  { id: 'e6', timestamp: '2026-05-14T03:30:00Z', laneId: 'library' as EntityId, surfaceId: 'desktop', type: 'UNDO' as const, title: 'Scope resolver edit reverted', description: 'Manual WIP change reverted — conflict with headless branch', artifactPath: null, gitRef: 'b71d4f0~1', attribution: 'operator', classification: 'operator' },
  { id: 'e7', timestamp: '2026-05-14T03:00:00Z', laneId: 'kernel' as EntityId, surfaceId: 'headless', type: 'PROGRESSION' as const, title: 'Health signal baseline updated', description: 'All lanes reporting normally', artifactPath: '/artifacts/kernel/health-20260514', gitRef: 'c4d5e6f', attribution: 'kernel-agent-v1', classification: 'autonomous' },
  { id: 'e8', timestamp: '2026-05-14T02:15:00Z', laneId: 'archivist' as EntityId, surfaceId: 'headless', type: 'REPAIR' as const, title: 'Block chain verification repaired', description: 'Minor corruption in block 2846 auto-repaired', artifactPath: '/artifacts/archivist/repair-2846', gitRef: 'a3f8c2d', attribution: 'archivist-agent-v3', classification: 'autonomous' },
  { id: 'e9', timestamp: '2026-05-14T01:00:00Z', laneId: 'control-plane' as EntityId, surfaceId: 'desktop', type: 'INFRASTRUCTURE' as const, title: 'Rig coordination update v2.4.1', description: 'Coordination protocol updated for improved cross-lane sync', artifactPath: '/artifacts/control-plane/coord-v2.4.1', gitRef: 'cp-2.4.1', attribution: 'operator', classification: 'operator' },
  { id: 'e10', timestamp: '2026-05-13T22:15:00Z', laneId: 'archivist' as EntityId, surfaceId: 'desktop', type: 'RECONCILIATION' as const, title: 'Restore gate comparison', description: 'Desktop ↔ Headless reconciliation — 97.2% match', artifactPath: null, gitRef: 'a3f8c2c', attribution: 'archivist-agent-v3', classification: 'autonomous' },
  { id: 'e11', timestamp: '2026-05-13T20:00:00Z', laneId: 'library' as EntityId, surfaceId: 'gastown', type: 'PROGRESSION' as const, title: 'Sovereignty reported to Mayor', description: 'Library status confirmed via Gastown municipal channel', artifactPath: null, gitRef: 'b71d4e0', attribution: 'mayor-proxy', classification: 'autonomous' },
  { id: 'e12', timestamp: '2026-05-13T16:03:00Z', laneId: 'archivist' as EntityId, surfaceId: 'headless', type: 'PROGRESSION' as const, title: 'Added archivist to continuous-improvement loop', description: 'Self-improvement cycle enabled for CI/CD integration', artifactPath: '/artifacts/archivist/ciloop-config', gitRef: 'a3f8c2b', attribution: 'archivist-agent-v3', classification: 'autonomous' },
  { id: 'e13', timestamp: '2026-05-13T12:22:00Z', laneId: 'library' as EntityId, surfaceId: 'headless', type: 'PROGRESSION' as const, title: 'Cycle 139 sovereignty PASS', description: 'Graph index integrity verified across all shards', artifactPath: '/artifacts/library/sovereignty-139', gitRef: 'b71d4e0', attribution: 'library-agent-v3', classification: 'autonomous' },
  { id: 'e14', timestamp: '2026-05-13T10:40:00Z', laneId: 'archivist' as EntityId, surfaceId: 'headless', type: 'REGRESSION' as const, title: 'CI push failures begin', description: 'Pushing every ~4 min, likely network or auth issue', artifactPath: '/artifacts/archivist/ci-failures-20260513', gitRef: 'a3f8c28', attribution: 'archivist-agent-v3', classification: 'autonomous' },
];

function BadgeByType({ type }: { type: string }) {
  const info = eventTypes[type] || eventTypes.UNKNOWN;
  return <Badge variant={info.color as any}>{info.label}</Badge>;
}

export default function TimelinePage() {
  const [filters, setFilters] = useState({ hours: 48, lane: 'all', type: 'all' });
  const [expanded, setExpanded] = useState<string | null>(null);

  const filteredEvents = useMemo(() => {
    let events = [...timelineEvents];
    if (filters.lane !== 'all') events = events.filter(e => e.laneId === filters.lane);
    if (filters.type !== 'all') events = events.filter(e => e.type === filters.type);
    return events.sort((a, b) => b.timestamp.localeCompare(a.timestamp));
  }, [filters]);

  const stats = useMemo(() => {
    const counts: Record<string, number> = {};
    timelineEvents.forEach(e => { counts[e.type] = (counts[e.type] || 0) + 1; });
    return counts;
  }, []);

  return (
    <LayoutShell title="Timeline — Evolution Audit">
      <div className="space-y-6">
        <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
          {Object.entries(stats).map(([type, count]) => {
            const info = eventTypes[type] || eventTypes.UNKNOWN;
            const colors: Record<string, string> = {
              green: 'text-green-400', red: 'text-red-400', cyan: 'text-cyan-400',
              yellow: 'text-yellow-400', pink: 'text-pink-400', purple: 'text-purple-400',
              blue: 'text-blue-400', info: 'text-neutral-400 dark:text-neutral-500',
            };
            return (
              <Card key={type} title={info.label} className="text-center">
                <div className={`text-2xl font-bold ${colors[info.color] || 'text-neutral-400'}`}>{count}</div>
                <div className="text-xs text-neutral-500 dark:text-neutral-600 mt-1">events</div>
              </Card>
            );
          })}
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Filter size={16} className="text-neutral-400 dark:text-neutral-500" />
          <select
            value={filters.hours}
            onChange={e => setFilters({ ...filters, hours: parseInt(e.target.value) })}
            className="bg-neutral-800 border border-neutral-700/30 rounded-lg px-3 py-1.5 text-sm text-neutral-200 focus:ring-2 focus:ring-indigo-500/50"
          >
            <option value={6}>Last 6 hours</option>
            <option value={12}>Last 12 hours</option>
            <option value={24}>Last 24 hours</option>
            <option value={48}>Last 48 hours</option>
            <option value={168}>Last 7 days</option>
          </select>
          <select
            value={filters.lane}
            onChange={e => setFilters({ ...filters, lane: e.target.value })}
            className="bg-neutral-800 border border-neutral-700/30 rounded-lg px-3 py-1.5 text-sm text-neutral-200 focus:ring-2 focus:ring-indigo-500/50"
          >
            <option value="all">All Lanes</option>
            <option value="archivist">Archivist</option>
            <option value="library">Library</option>
            <option value="swarmmind">SwarmMind</option>
            <option value="kernel">Kernel</option>
            <option value="control-plane">Control Plane</option>
          </select>
          <select
            value={filters.type}
            onChange={e => setFilters({ ...filters, type: e.target.value })}
            className="bg-neutral-800 border border-neutral-700/30 rounded-lg px-3 py-1.5 text-sm text-neutral-200 focus:ring-2 focus:ring-indigo-500/50"
          >
            <option value="all">All Types</option>
            {Object.entries(eventTypes).map(([key, val]) => (
              <option key={key} value={key}>{val.label}</option>
            ))}
          </select>
          <span className="text-xs text-neutral-500 dark:text-neutral-600 ml-auto">{filteredEvents.length} events</span>
        </div>

        <div className="space-y-2">
          {filteredEvents.length === 0 ? (
            <Card title="No Events"><p className="text-sm text-neutral-400 dark:text-neutral-500">No timeline events match the current filters.</p></Card>
          ) : (
            filteredEvents.map((event) => {
              const info = eventTypes[event.type] || eventTypes.UNKNOWN;
              const isExpanded = expanded === event.id;
              const time = new Date(event.timestamp).toLocaleString();
              return (
                <Card
                  key={event.id}
                  className="cursor-pointer transition-colors hover:border-neutral-600/50"
                  headerAction={
                    <div className="flex items-center gap-2">
                      <BadgeByType type={event.type} />
                      <button onClick={(e) => { e.stopPropagation(); setExpanded(isExpanded ? null : event.id); }} className="p-1 text-neutral-500 hover:text-neutral-300">
                        {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                      </button>
                    </div>
                  }
                >
                  <div onClick={() => setExpanded(isExpanded ? null : event.id)}>
                    <div className="flex items-start gap-3">
                      <div className={`w-1 h-1 rounded-full mt-2 flex-shrink-0 bg-${info.color}-400`} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-medium text-neutral-100">{event.title}</span>
                        </div>
                        <div className="flex items-center gap-3 mt-1 text-xs text-neutral-500">
                          <span><Clock size={12} className="inline mr-0.5" />{time}</span>
                          <span>•</span>
                          <span>{laneNames[event.laneId]}</span>
                          {event.surfaceId && <span>• {surfaceNames[event.surfaceId]}</span>}
                          <span>• {event.classification}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  {isExpanded && (
                    <div className="mt-4 pt-4 border-t border-neutral-700/30 space-y-3 text-sm">
                      <p className="text-neutral-300 dark:text-neutral-200">{event.description}</p>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <div className="text-[10px] text-neutral-400 uppercase tracking-wider font-medium">Git Ref</div>
                          <div className="font-mono text-xs flex items-center gap-1 mt-1 text-neutral-300 dark:text-neutral-200">
                            <GitBranch size={12} />{event.gitRef || '—'}
                          </div>
                        </div>
                        <div>
                          <div className="text-[10px] text-neutral-400 uppercase tracking-wider font-medium">Attribution</div>
                          <div className="flex items-center gap-1 mt-1 text-neutral-300 dark:text-neutral-200">
                            <Shield size={12} />{event.attribution}
                          </div>
                        </div>
                        {event.artifactPath && (
                          <div className="col-span-2">
                            <div className="text-[10px] text-neutral-400 uppercase tracking-wider font-medium">Artifact</div>
                            <a href="#" className="text-indigo-400 hover:underline text-xs">{event.artifactPath}</a>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </Card>
              );
            })
          )}
        </div>
      </div>
    </LayoutShell>
  );
}