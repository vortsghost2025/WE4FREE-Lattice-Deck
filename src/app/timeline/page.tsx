'use client';

import { useState, useMemo } from 'react';
import { useData } from '@/lib/hooks/useData';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { StatusDot } from '@/components/ui/status-dot';
import { LayoutShell } from '@/components/layout/shell';
import { Header } from '@/components/layout/sidebar';
import {
  Clock, Filter, ChevronDown, ChevronUp, GitBranch,
  AlertTriangle, CheckCircle2, RefreshCw, Activity, Shield, XCircle,
} from 'lucide-react';

const eventTypes: Record<string, { label: string; color: string }> = {
  PROGRESSION: { label: 'Progression', color: 'green' },
  REGRESSION: { label: 'Regression', color: 'red' },
  REPAIR: { label: 'Repair', color: 'cyan' },
  UNDO: { label: 'Undo', color: 'yellow' },
  OVERWRITE: { label: 'Overwrite', color: 'pink' },
  DUPLICATION: { label: 'Duplication', color: 'purple' },
  RECONCILIATION: { label: 'Reconciliation', color: 'blue' },
  INFRASTRUCTURE: { label: 'Infrastructure', color: 'surface' },
  UNKNOWN: { label: 'Unknown', color: 'surface' },
};

const laneNames: Record<string, string> = {
  archivist: 'Archivist', library: 'Library', swarmmind: 'SwarmMind', kernel: 'Kernel', 'control-plane': 'Control Plane',
};

const surfaceNames: Record<string, string> = { desktop: 'Desktop', headless: 'Headless', gastown: 'Gastown', vps: 'VPS' };

export default function TimelinePage() {
  const { timeline: data, loading } = useData();
  const [filters, setFilters] = useState({ hours: 48, lane: 'all', type: 'all' });
  const [expanded, setExpanded] = useState<string | null>(null);

  const filteredEvents = useMemo(() => {
    if (!data) return [];
    return data.events.filter(e => {
      if (filters.lane !== 'all' && e.laneId !== filters.lane) return false;
      if (filters.type !== 'all' && e.type !== filters.type) return false;
      return true;
    });
  }, [data, filters]);

  const stats = useMemo(() => {
    const counts: Record<string, number> = {};
    data?.events.forEach(e => { counts[e.type] = (counts[e.type] || 0) + 1; });
    return counts;
  }, [data]);

  if (loading || !data) {
    return (
      <LayoutShell title="Timeline — Evolution Audit">
        <div className="flex items-center justify-center py-20">
          <div className="text-surface-400 text-sm">Loading timeline data…</div>
        </div>
      </LayoutShell>
    );
  }

  return (
    <LayoutShell title="Timeline — Evolution Audit">
      <div className="space-y-6">
        <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
          {Object.entries(stats).map(([type, count]) => {
            const info = eventTypes[type] || eventTypes.UNKNOWN;
            return (
              <Card key={type} title={info.label} className="text-center">
                <div className="text-2xl font-bold" style={{ color: `var(--${info.color}-400)` || '#64748b' }}>{count}</div>
                <div className="text-xs text-surface-500 mt-1">events</div>
              </Card>
            );
          })}
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Filter size={16} className="text-surface-400" />
          <select value={filters.hours} onChange={e => setFilters({ ...filters, hours: parseInt(e.target.value) })}
            className="bg-surface-800 border border-surface-700/30 rounded-lg px-3 py-1.5 text-sm text-surface-200 focus:ring-2 focus:ring-indigo-500/50 focus:border-transparent">
            <option value={6}>Last 6h</option><option value={12}>Last 12h</option>
            <option value={24}>Last 24h</option><option value={48}>Last 48h</option><option value={168}>Last 7 days</option>
          </select>
          <select value={filters.lane} onChange={e => setFilters({ ...filters, lane: e.target.value })}
            className="bg-surface-800 border border-surface-700/30 rounded-lg px-3 py-1.5 text-sm text-surface-200 focus:ring-2 focus:ring-indigo-500/50 focus:border-transparent">
            <option value="all">All Lanes</option>
            <option value="archivist">Archivist</option><option value="library">Library</option>
            <option value="swarmmind">SwarmMind</option><option value="kernel">Kernel</option>
            <option value="control-plane">Control Plane</option>
          </select>
          <select value={filters.type} onChange={e => setFilters({ ...filters, type: e.target.value })}
            className="bg-surface-800 border border-surface-700/30 rounded-lg px-3 py-1.5 text-sm text-surface-200 focus:ring-2 focus:ring-indigo-500/50 focus:border-transparent">
            <option value="all">All Types</option>
            {Object.entries(eventTypes).map(([key, val]) => <option key={key} value={key}>{val.label}</option>)}
          </select>
          <span className="text-xs text-surface-500 ml-auto">{filteredEvents.length} events</span>
        </div>

        <div className="space-y-2">
          {filteredEvents.map((ev) => {
            const info = eventTypes[ev.type] || eventTypes.UNKNOWN;
            const ex = expanded === ev.id;
            return (
              <Card key={ev.id} className="cursor-pointer hover:border-surface-600/50 transition-colors hover:bg-surface-800/10"
                headerAction={
                  <div className="flex items-center gap-2">
                    <Badge variant={info.color as any}>{info.label}</Badge>
                    <button onClick={(e) => { e.stopPropagation(); setExpanded(ex ? null : ev.id); }} className="p-1 text-surface-400 hover:text-surface-200">
                      {ex ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                    </button>
                  </div>
                }>
                <div onClick={() => setExpanded(ex ? null : ev.id)}>
                  <div className="flex items-start gap-3">
                    <div className={`w-1 h-1 rounded-full mt-2 flex-shrink-0 bg-${info.color}-400`} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-medium text-surface-100">{ev.title}</span>
                        <Badge variant={info.color as any} className="text-[10px]">{ev.type}</Badge>
                      </div>
                      <div className="flex items-center gap-3 mt-1 text-xs text-surface-500">
                        <span><Clock size={12} className="inline mr-0.5" />{new Date(ev.timestamp).toLocaleString()}</span>
                        <span>•</span><span>{laneNames[ev.laneId]}</span>
                        {ev.surfaceId && <span>• {surfaceNames[ev.surfaceId]}</span>}
                        <span>• {ev.classification}</span>
                      </div>
                    </div>
                  </div>
                </div>
                {ex && (
                  <div className="mt-4 pt-4 border-t border-surface-700/30 space-y-3 text-sm">
                    <p className="text-surface-300">{ev.description}</p>
                    <div className="grid grid-cols-2 gap-2">
                      <div><span className="text-xs uppercase tracking-wider font-medium text-surface-500">Git Ref</span>
                        <div className="font-mono text-xs flex items-center gap-1 mt-1"><GitBranch size={12} />{ev.gitRef || '—'}</div>
                      </div>
                      <div><span className="text-xs uppercase tracking-wider font-medium text-surface-500">Attribution</span>
                        <div className="flex items-center gap-1 mt-1"><Shield size={12} />{ev.attribution}</div>
                      </div>
                      {ev.artifactPath && (
                        <div className="col-span-2"><span className="text-xs uppercase tracking-wider font-medium text-surface-500">Artifact</span>
                          <div className="mt-1"><a href="#" className="text-indigo-400 hover:underline text-xs">{ev.artifactPath}</a></div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </Card>
            );
          })}
          {filteredEvents.length === 0 && (
            <Card title="No Events"><p className="text-sm text-surface-400">No timeline events match the current filters.</p></Card>
          )}
        </div>
      </div>
    </LayoutShell>
  );
}