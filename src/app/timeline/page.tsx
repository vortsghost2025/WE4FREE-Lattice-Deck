'use client';

import { useState, useMemo } from 'react';
import { useData } from '@/lib/hooks/useData';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PageContent } from '@/components/layout/page-content';
import { LayoutShell } from '@/components/layout/shell';
import {
  Clock, Filter, ChevronDown, ChevronUp, GitBranch,
  AlertTriangle, Shield,
} from 'lucide-react';

const eventTypes: Record<string, { label: string; dot: string; bg: string; text: string }> = {
  PROGRESSION: { label: 'Progression', dot: 'bg-green-400', bg: 'bg-green-400/10', text: 'text-green-400' },
  REGRESSION: { label: 'Regression', dot: 'bg-red-400', bg: 'bg-red-400/10', text: 'text-red-400' },
  REPAIR: { label: 'Repair', dot: 'bg-cyan-400', bg: 'bg-cyan-400/10', text: 'text-cyan-400' },
  UNDO: { label: 'Undo', dot: 'bg-yellow-400', bg: 'bg-yellow-400/10', text: 'text-yellow-400' },
  OVERWRITE: { label: 'Overwrite', dot: 'bg-pink-400', bg: 'bg-pink-400/10', text: 'text-pink-400' },
  DUPLICATION: { label: 'Duplication', dot: 'bg-purple-400', bg: 'bg-purple-400/10', text: 'text-purple-400' },
  RECONCILIATION: { label: 'Reconciliation', dot: 'bg-blue-400', bg: 'bg-blue-400/10', text: 'text-blue-400' },
  INFRASTRUCTURE: { label: 'Infrastructure', dot: 'bg-neutral-400', bg: 'bg-neutral-400/10', text: 'text-neutral-400' },
  UNKNOWN: { label: 'Unknown', dot: 'bg-neutral-500', bg: 'bg-neutral-500/10', text: 'text-neutral-500' },
};

const laneNames: Record<string, string> = {
  archivist: 'Archivist', library: 'Library', swarmmind: 'SwarmMind', kernel: 'Kernel', 'control-plane': 'Control Plane',
};

const surfaceNames: Record<string, string> = { desktop: 'Desktop', headless: 'Headless', gastown: 'Gastown', vps: 'VPS' };

const typeColorMap: Record<string, string> = {
  PROGRESSION: 'active', REGRESSION: 'error', REPAIR: 'info', UNDO: 'warning',
  OVERWRITE: 'error', DUPLICATION: 'info', RECONCILIATION: 'active', INFRASTRUCTURE: 'idle', UNKNOWN: 'idle',
};

function SelectFilter({ value, onChange, options, label }: { value: string | number; onChange: (v: string) => void; options: { value: string; label: string }[]; label: string }) {
  return (
    <select
      value={value}
      onChange={e => onChange(e.target.value)}
      aria-label={label}
      className="bg-neutral-800 border border-neutral-700/50 rounded-lg px-3 py-2 text-sm text-neutral-200 focus:ring-2 focus:ring-indigo-500/50 focus:border-transparent appearance-none pr-8"
    >
      {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  );
}

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
          <div className="text-neutral-400 text-sm">Loading timeline data…</div>
        </div>
      </LayoutShell>
    );
  }

  return (
    <LayoutShell title="Timeline — Evolution Audit">
      <PageContent>
        <h1 className="sr-only">Timeline</h1>
        <div className="space-y-5">

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {Object.entries(stats).map(([type, count]) => {
              const info = eventTypes[type] || eventTypes.UNKNOWN;
              return (
                <div key={type} className={`${info.bg} rounded-lg px-4 py-3 text-center border border-neutral-700/30`}>
                  <div className={`text-2xl font-bold ${info.text}`}>{count}</div>
                  <div className="text-xs text-neutral-400 mt-1">{info.label}</div>
                </div>
              );
            })}
          </div>

      <div className="flex flex-wrap items-center gap-3 p-4 bg-neutral-800/40 rounded-lg border border-neutral-700/30" role="search" aria-label="Filter timeline events">
        <Filter size={16} className="text-neutral-400" aria-hidden="true" />
        <SelectFilter
          label="Time range"
          value={filters.hours}
          onChange={v => setFilters({ ...filters, hours: parseInt(v) })}
          options={[
            { value: '6', label: 'Last 6h' }, { value: '12', label: 'Last 12h' },
            { value: '24', label: 'Last 24h' }, { value: '48', label: 'Last 48h' },
            { value: '168', label: 'Last 7 days' },
          ]}
        />
        <SelectFilter
          label="Filter by lane"
          value={filters.lane}
          onChange={v => setFilters({ ...filters, lane: v })}
          options={[
            { value: 'all', label: 'All Lanes' },
            ...Object.entries(laneNames).map(([k, v]) => ({ value: k, label: v })),
          ]}
        />
        <SelectFilter
          label="Filter by event type"
          value={filters.type}
          onChange={v => setFilters({ ...filters, type: v })}
          options={[
            { value: 'all', label: 'All Types' },
            ...Object.entries(eventTypes).map(([k, v]) => ({ value: k, label: v.label })),
          ]}
        />
            <span className="text-sm text-neutral-400 ml-auto font-mono">{filteredEvents.length} events</span>
          </div>

          <div className="space-y-2">
            {filteredEvents.map((ev) => {
              const info = eventTypes[ev.type] || eventTypes.UNKNOWN;
              const isExpanded = expanded === ev.id;
              return (
                <Card
                  key={ev.id}
                  className={`cursor-pointer hover:bg-neutral-800/40 transition-colors ${isExpanded ? 'ring-1 ring-neutral-700/60' : ''}`}
                  headerAction={
                    <div className="flex items-center gap-2">
                      <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2 py-0.5 rounded ${info.bg} ${info.text}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${info.dot}`} />
                        {info.label}
                      </span>
                      <button
                        onClick={(e) => { e.stopPropagation(); setExpanded(isExpanded ? null : ev.id); }}
                        className="p-1 text-neutral-400 hover:text-neutral-200 transition-colors"
                        aria-label={isExpanded ? 'Collapse' : 'Expand'}
                      >
                        {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                      </button>
                    </div>
                  }
                >
                  <div onClick={() => setExpanded(isExpanded ? null : ev.id)}>
                    <div className="flex items-start gap-3">
                      <div className={`w-2 h-2 rounded-full mt-2 shrink-0 ${info.dot}`} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-medium text-neutral-100">{ev.title}</span>
                        </div>
                        <div className="flex items-center gap-3 mt-1.5 text-xs text-neutral-400 flex-wrap">
                          <span className="flex items-center gap-1"><Clock size={12} />{new Date(ev.timestamp).toLocaleString()}</span>
                          <span>•</span>
                          <span>{laneNames[ev.laneId] || ev.laneId}</span>
                          {ev.surfaceId && (<><span>•</span><span>{surfaceNames[ev.surfaceId]}</span></>)}
                          <span>•</span>
                          <span>{ev.classification}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  {isExpanded && (
                    <div className="mt-4 pt-4 border-t border-neutral-700/30 space-y-3 text-sm">
                      <p className="text-neutral-300">{ev.description}</p>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <span className="text-xs uppercase tracking-wider font-medium text-neutral-400">Git Ref</span>
                          <div className="font-mono text-xs flex items-center gap-1 mt-1 text-neutral-200">
                            <GitBranch size={12} />{ev.gitRef || '—'}
                          </div>
                        </div>
                        <div>
                          <span className="text-xs uppercase tracking-wider font-medium text-neutral-400">Attribution</span>
                          <div className="flex items-center gap-1 mt-1 text-neutral-200">
                            <Shield size={12} />{ev.attribution}
                          </div>
                        </div>
                        {ev.artifactPath && (
                          <div className="col-span-2">
                            <span className="text-xs uppercase tracking-wider font-medium text-neutral-400">Artifact</span>
                            <div className="mt-1">
                              <span className="text-indigo-400 text-xs font-mono">{ev.artifactPath}</span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </Card>
              );
            })}
            {filteredEvents.length === 0 && (
              <Card title="No Events">
                <p className="text-sm text-neutral-400">No timeline events match the current filters.</p>
              </Card>
            )}
          </div>

        </div>
      </PageContent>
    </LayoutShell>
  );
}
