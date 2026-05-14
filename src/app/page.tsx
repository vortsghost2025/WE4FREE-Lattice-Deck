'use client';

import { useState } from 'react';
import { useData } from '@/lib/hooks/useData';
import { Card } from '@/components/ui/card';
import { Metric } from '@/components/ui/metric';
import { Badge } from '@/components/ui/badge';
import { StatusDot } from '@/components/ui/status-dot';
import { LayoutShell } from '@/components/layout/shell';
import { Header } from '@/components/layout/sidebar';
import {
  Activity, AlertTriangle, CheckCircle2, Clock,
  GitBranch, Server, Shield, XCircle,
  Send, MessageSquare, ChevronDown, ChevronUp,
} from 'lucide-react';

function timeAgo(iso: string): string {
  const d = new Date(iso);
  const diff = Date.now() - d.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export default function OverviewPage() {
  const { status, timeline, lanes, messages, continuity, loading } = useData();
  const [tf, setTf] = useState({ hours: 48, lane: 'all', type: 'all' });
  const [exp, setExp] = useState<string | null>(null);

  if (loading || !status || !timeline || !lanes) {
    return (
      <LayoutShell title="Organism Overview">
        <div className="flex items-center justify-center py-20">
          <div className="text-surface-400 text-sm">Loading organism data…</div>
        </div>
      </LayoutShell>
    );
  }

  const activeCount = lanes.lanes.filter(l => l.status === 'active').length;
  const totalBlockers = lanes.lanes.reduce((a, l) => a + l.blockerCount, 0);
  const driftWarnings = lanes.lanes.filter(l => l.driftWarning).length;

  const tc: Record<string, string> = {
    PROGRESSION: 'green', REGRESSION: 'red', REPAIR: 'cyan', UNDO: 'yellow',
    OVERWRITE: 'pink', DUPLICATION: 'purple', RECONCILIATION: 'blue',
    INFRASTRUCTURE: 'info', UNKNOWN: 'info',
  };

  return (
    <LayoutShell title="Organism Overview">
      <div className="space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h2 className="text-xl font-semibold">WE4FREE Organism</h2>
            <p className="text-sm text-surface-400 mt-1">4 lanes · 4 surfaces · 1 Control Plane</p>
          </div>
          <Badge variant="active" icon={<StatusDot status="active" pulse />}>System Online</Badge>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card title="Lanes Active" icon={<Server size={16} />}>
            <Metric label="Status" value={`${activeCount}/4`} />
            <span className="text-xs text-green-400 mt-1">{activeCount} active</span>
          </Card>
          <Card title="Blockers" icon={<XCircle size={16} />}>
            <Metric label="Open" value={totalBlockers} />
            <span className="text-xs text-surface-400 mt-1">across all lanes</span>
          </Card>
              <Card title="Pending Decisions" icon={<AlertTriangle size={16} />}>
                <Metric label="Actions" value={status.controlPlane.pendingDecisions} />
                <span className="text-xs text-orange-400 mt-1">operator required</span>
              </Card>
              <Card title="Drift Warnings" icon={<GitBranch size={16} />}>
                <Metric label="Affected" value={driftWarnings} />
                <span className="text-xs text-yellow-400 mt-1">lanes with drift</span>
              </Card>
            </div>
        
        {status.controlPlane && (
          <Card
            title={
              <div className="flex items-center gap-2">
                <Shield size={16} /> Control Plane
                <Badge variant={status.controlPlane.status} className="ml-auto">{status.controlPlane.status}</Badge>
              </div>
            }
            icon={<Shield size={16} />}
          >
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <Metric label="Version" value={status.controlPlane.coordinatorVersion} />
              <Metric label="Active Lanes" value={status.controlPlane.activeLaneCount} />
              <Metric label="Message Queue" value={status.controlPlane.messageQueueDepth} />
              <Metric label="Git" value={`${status.controlPlane.git.ahead}A / ${status.controlPlane.git.behind}B`} />
            </div>
            <div className="flex items-center gap-2 text-sm">
              <StatusDot status={status.controlPlane.status} />
              <span className="text-surface-300">{status.controlPlane.currentTask}</span>
            </div>
            <div className="mt-2 text-xs text-surface-500">Last heartbeat: {timeAgo(status.controlPlane.lastHeartbeat)}</div>
          </Card>
        )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {lanes.lanes.map((lane) => (
              <Card
                key={lane.id}
                title={
                  <div className="flex items-center gap-2">
                    <StatusDot status={lane.status} pulse={lane.status === 'active'} />
                    <span>{lane.name}</span>
                    <Badge variant={lane.status} className="ml-auto text-xs">{lane.status}</Badge>
          </div>
        
        {status.controlPlane && (
          <Card
            title={
              <div className="flex items-center gap-2">
                <Shield size={16} /> Control Plane
                <Badge variant={status.controlPlane.status} className="ml-auto">{status.controlPlane.status}</Badge>
              </div>
            }
            icon={<Shield size={16} />}
          >
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <Metric label="Version" value={status.controlPlane.coordinatorVersion} />
              <Metric label="Active Lanes" value={status.controlPlane.activeLaneCount} />
              <Metric label="Message Queue" value={status.controlPlane.messageQueueDepth} />
              <Metric label="Git" value={`${status.controlPlane.git.ahead}A / ${status.controlPlane.git.behind}B`} />
            </div>
            <div className="flex items-center gap-2 text-sm">
              <StatusDot status={status.controlPlane.status} />
              <span className="text-surface-300">{status.controlPlane.currentTask}</span>
            </div>
            <div className="mt-2 text-xs text-surface-500">Last heartbeat: {timeAgo(status.controlPlane.lastHeartbeat)}</div>
          </Card>
        )}
        
        <Card
          title={
            <div className="flex items-center gap-2">
              <Clock size={16} /> Timeline
              <Badge variant="info">{timeline?.events.length ?? 0} events</Badge>
            </div>
          }
          headerAction={
            <div className="flex gap-2">
              <select value={tf.hours} onChange={e => setTf({ ...tf, hours: parseInt(e.target.value) })}
                className="bg-surface-800 border border-surface-700/30 rounded-lg px-2 py-1 text-xs text-surface-200 focus:ring-2 focus:ring-indigo-500/50">
                <option value={6}>6h</option><option value={12}>12h</option>
                <option value={24}>24h</option><option value={48}>48h</option><option value={168}>7d</option>
              </select>
              <select value={tf.lane} onChange={e => setTf({ ...tf, lane: e.target.value })}
                className="bg-surface-800 border border-surface-700/30 rounded-lg px-2 py-1 text-xs text-surface-200 focus:ring-2 focus:ring-indigo-500/50">
                <option value="all">All Lanes</option>
                <option value="archivist">Archivist</option><option value="library">Library</option>
                <option value="swarmmind">SwarmMind</option><option value="kernel">Kernel</option>
                <option value="control-plane">Control Plane</option>
              </select>
            </div>
          }
        >
          <div className="space-y-2 max-h-[500px] overflow-y-auto">
            {timeline?.events.map((ev) => {
              const ex = exp === ev.id;
              return (
                <div key={ev.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-surface-800/30 cursor-pointer transition-colors border border-transparent hover:border-surface-700/30"
                  onClick={() => setExp(ex ? null : ev.id)}>
                  <div className={`w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0 bg-${tc[ev.type]}-400`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-medium text-surface-100">{ev.title}</span>
                      <Badge variant={tc[ev.type] as any} className="text-[10px]">{ev.type}</Badge>
                    </div>
                    <div className="flex items-center gap-3 mt-0.5 text-[11px] text-surface-500">
                      <span>{new Date(ev.timestamp).toLocaleString()}</span><span>•</span>
                      <span>{ev.laneId} / {ev.surfaceId || '—'}</span>
                    </div>
                  </div>
                  <button className="flex-shrink-0 text-surface-500">
                    {ex ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                  </button>
                </div>
              );
            })}
          </div>
        </Card>
        
        <Card title={<div className="flex items-center gap-2"><MessageSquare size={16} /> Quick Message</div>}>
          <p className="text-sm text-surface-400 mb-3">Send a governance-safe message to one or more lanes.</p>
          <div className="space-y-3">
            <div>
              <label className="text-xs text-surface-400 uppercase tracking-wider font-medium mb-1 block">To</label>
              <div className="flex flex-wrap gap-2">
                {lanes.lanes.map((l) => (
                  <Badge key={l.id} variant="info" className="cursor-pointer hover:bg-indigo-500/30 transition-colors">
                    <StatusDot status={l.status} size="sm" /> {l.name}
                  </Badge>
                ))}
              </div>
            </div>
            <div>
              <label className="text-xs text-surface-400 uppercase tracking-wider font-medium mb-1 block">Instruction</label>
              <textarea placeholder="Type plain-language instruction..."
                className="w-full bg-surface-900 border border-surface-700/30 rounded-lg px-3 py-2 text-sm text-surface-200 placeholder-surface-500 focus:ring-2 focus:ring-indigo-500/50 focus:border-transparent resize-none" rows={2} />
            </div>
            <button className="px-4 py-2 rounded-lg bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-medium transition-colors flex items-center gap-2">
              <Send size={14} /> Preview & Send
            </button>
          </div>
        </Card>
      
      </div>
    </LayoutShell>
  );
}
               icon={<Activity size={16} }}>
               <div className="space-y-3">
                 <div className="text-sm text-surface-300">{lane.currentTask || 'Idle'}</div>
                 <div className="grid grid-cols-3 gap-y-3">
                   <Metric label="Agent" value={lane.currentAgent || '—'} className="text-xs" />
                   <Metric label="Model" value={lane.currentModel || '—'} className="text-xs" />
                   <Metric label="Commit" value={lane.lastCommit} className="text-xs" />
                   <Metric label="Heartbeat" value={timeAgo(lane.lastHeartbeat)} className="text-xs" />
                   <Metric label="Branch" value={lane.git.branch} className="text-xs" />
                   <Metric label="Context" value={`${lane.contextPercent}%`} className="text-xs" />
                 </div>
                 <div className="flex gap-2">
                   {lane.activeSurfaces.map(s => <Badge key={s} variant="info">{s}</Badge>)}
                   {lane.activeSurfaces.length === 0 && <span className="text-xs text-surface-500">None</span>}
                 </div>
                 <div className="grid grid-cols-3 gap-2 pt-2 border-t border-surface-700/30">
                   <div className="text-center">
                     <div className="text-[10px] text-surface-400">Compact</div>
                     <div className="text-sm">{lane.lastCompact || '—'}</div>
                   </div>
                   <div className="text-center">
                     <div className="text-[10px] text-surface-400">Restore</div>
                     <div className="text-sm">{lane.lastRestore || '—'}</div>
                   </div>
                   <div className="text-center">
                     <div className="text-[10px] text-surface-400">Test</div>
                     <div className="flex items-center justify-center gap-1">
                       {lane.lastTestResult === 'pass' && <CheckCircle2 size={14} className="text-green-400" />}
                       {lane.lastTestResult === 'fail' && <XCircle size={14} className="text-red-400" />}
                       <span className="text-sm capitalize">{lane.lastTestResult || '—'}</span>
                     </div>
                   </div>
                 </div>
                 {(lane.driftWarning || lane.blockerCount > 0) && (
                   <div className="flex gap-2 pt-2 border-t border-surface-700/30">
                     {lane.driftWarning && <Badge variant="warning" icon={<GitBranch size={12} />}>Drift Warning</Badge>}
                     {lane.blockerCount > 0 && <Badge variant="needs-operator">{lane.blockerCount} Blocker{lane.blockerCount > 1 ? 's' : ''}</Badge>}
                   </div>
                 )}
               </div>
             </Card>
           ))}
         </div>
              }
              icon={<Activity size={16} />}
            >
              <div className="space-y-3">
                <div className="text-sm text-surface-300">{lane.currentTask || 'Idle'}</div>
                <div className="grid grid-cols-3 gap-y-3">
                  <Metric label="Agent" value={lane.currentAgent || '—'} className="text-xs" />
                  <Metric label="Model" value={lane.currentModel || '—'} className="text-xs" />
                  <Metric label="Commit" value={lane.lastCommit} className="text-xs" />
                  <Metric label="Heartbeat" value={timeAgo(lane.lastHeartbeat)} className="text-xs" />
                  <Metric label="Branch" value={lane.git.branch} className="text-xs" />
                  <Metric label="Context" value={`${lane.contextPercent}%`} className="text-xs" />
                </div>
                <div className="flex gap-2">
                  {lane.activeSurfaces.map(s => <Badge key={s} variant="info">{s}</Badge>)}
                  {lane.activeSurfaces.length === 0 && <span className="text-xs text-surface-500">None</span>}
                </div>
                <div className="grid grid-cols-3 gap-2 pt-2 border-t border-surface-700/30">
                  <div className="text-center">
                    <div className="text-[10px] text-surface-400">Compact</div>
                    <div className="text-sm">{lane.lastCompact || '—'}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-[10px] text-surface-400">Restore</div>
                    <div className="text-sm">{lane.lastRestore || '—'}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-[10px] text-surface-400">Test</div>
                    <div className="flex items-center justify-center gap-1">
                      {lane.lastTestResult === 'pass' && <CheckCircle2 size={14} className="text-green-400" />}
                      {lane.lastTestResult === 'fail' && <XCircle size={14} className="text-red-400" />}
                      <span className="text-sm capitalize">{lane.lastTestResult || '—'}</span>
                    </div>
                  </div>
                </div>
                {(lane.driftWarning || lane.blockerCount > 0) && (
                  <div className="flex gap-2 pt-2 border-t border-surface-700/30">
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
               <Badge variant="info">{timeline?.events.length ?? 0} events</Badge>
             </div>
          }
          headerAction={
            <div className="flex gap-2">
              <select value={tf.hours} onChange={e => setTf({ ...tf, hours: parseInt(e.target.value) })}
                className="bg-surface-800 border border-surface-700/30 rounded-lg px-2 py-1 text-xs text-surface-200 focus:ring-2 focus:ring-indigo-500/50">
                <option value={6}>6h</option><option value={12}>12h</option>
                <option value={24}>24h</option><option value={48}>48h</option><option value={168}>7d</option>
              </select>
              <select value={tf.lane} onChange={e => setTf({ ...tf, lane: e.target.value })}
                className="bg-surface-800 border border-surface-700/30 rounded-lg px-2 py-1 text-xs text-surface-200 focus:ring-2 focus:ring-indigo-500/50">
                <option value="all">All Lanes</option>
                <option value="archivist">Archivist</option><option value="library">Library</option>
                <option value="swarmmind">SwarmMind</option><option value="kernel">Kernel</option>
                <option value="control-plane">Control Plane</option>
              </select>
            </div>
          }
        >
           <div className="space-y-2 max-h-[500px] overflow-y-auto">
             {timeline?.events.map((ev) => {
              const ex = exp === ev.id;
              return (
                <div key={ev.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-surface-800/30 cursor-pointer transition-colors border border-transparent hover:border-surface-700/30"
                  onClick={() => setExp(ex ? null : ev.id)}>
                  <div className={`w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0 bg-${tc[ev.type]}-400`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-medium text-surface-100">{ev.title}</span>
                      <Badge variant={tc[ev.type] as any} className="text-[10px]">{ev.type}</Badge>
                    </div>
                    <div className="flex items-center gap-3 mt-0.5 text-[11px] text-surface-500">
                      <span>{new Date(ev.timestamp).toLocaleString()}</span><span>•</span>
                      <span>{ev.laneId} / {ev.surfaceId || '—'}</span>
                    </div>
                  </div>
                  <button className="flex-shrink-0 text-surface-500">
                    {ex ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                  </button>
                </div>
              );
            })}
          </div>
        </Card>

        <Card title={<div className="flex items-center gap-2"><MessageSquare size={16} /> Quick Message</div>}>
          <p className="text-sm text-surface-400 mb-3">Send a governance-safe message to one or more lanes.</p>
          <div className="space-y-3">
            <div>
              <label className="text-xs text-surface-400 uppercase tracking-wider font-medium mb-1 block">To</label>
              <div className="flex flex-wrap gap-2">
                {lanes.lanes.map((l) => (
                  <Badge key={l.id} variant="info" className="cursor-pointer hover:bg-indigo-500/30 transition-colors">
                    <StatusDot status={l.status} size="sm" /> {l.name}
                  </Badge>
                ))}
              </div>
            </div>
            <div>
              <label className="text-xs text-surface-400 uppercase tracking-wider font-medium mb-1 block">Instruction</label>
              <textarea placeholder="Type plain-language instruction..."
                className="w-full bg-surface-900 border border-surface-700/30 rounded-lg px-3 py-2 text-sm text-surface-200 placeholder-surface-500 focus:ring-2 focus:ring-indigo-500/50 focus:border-transparent resize-none" rows={2} />
            </div>
            <button className="px-4 py-2 rounded-lg bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-medium transition-colors flex items-center gap-2">
              <Send size={14} /> Preview & Send
            </button>
          </div>
        </Card>
      </div>
    </LayoutShell>
  );
}