'use client';

import { useState } from 'react';
import { useData } from '@/lib/hooks/useData';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PageContent } from '@/components/layout/page-content';
import { LayoutShell } from '@/components/layout/shell';
import { Info, Server } from 'lucide-react';
import { ShieldIcon } from '@/components/ui/shield-icon';
import type { SurfaceId, EntityId } from '@/lib/types';

const surfaceColors: Record<SurfaceId, string> = {
  desktop: 'from-blue-500/20 to-blue-600/20',
  headless: 'from-green-500/20 to-green-600/20',
  gastown: 'from-purple-500/20 to-purple-600/20',
  vps: 'from-orange-500/20 to-orange-600/20',
};

const entityNames: Record<EntityId, string> = {
  archivist: 'Archivist',
  library: 'Library',
  swarmmind: 'SwarmMind',
  kernel: 'Kernel',
  'control-plane': 'Control Plane',
};

interface SurfaceCellData {
  entityId: EntityId;
  surfaceId: SurfaceId;
  state: 'active' | 'executing' | 'supervising' | 'wip' | 'coordinating' | 'none';
  label: string;
  repo: string;
  branch: string;
  lastChange: string | null;
  agent: string | null;
  logs: string[];
  details: string;
}

const matrixData: SurfaceCellData[][] = [
  [
    { entityId: 'archivist', surfaceId: 'desktop', state: 'supervising', label: 'Supervising', repo: 'we4free/archivist', branch: 'main', lastChange: '2h ago', agent: 'archivist-agent-v3', logs: ['[08:12] Heartbeat OK', '[07:45] Compact #1247', '[06:30] Watchdog sync'], details: 'Monitoring local compact/restore cycles. Agent running with 87.3% context utilization.' },
    { entityId: 'archivist', surfaceId: 'headless', state: 'executing', label: 'Executing', repo: 'we4free/archivist', branch: 'main', lastChange: '4h ago', agent: 'archivist-agent-v3', logs: ['[08:10] CI push success', '[04:00] Compact/restore complete'], details: 'Running continuous CI loop. 1247 compacts completed. Recovery snapshot verified 12/12.' },
    { entityId: 'archivist', surfaceId: 'gastown', state: 'none', label: 'None', repo: '—', branch: '—', lastChange: null, agent: null, logs: [], details: 'No Archivist presence on Gastown surface.' },
    { entityId: 'archivist', surfaceId: 'vps', state: 'none', label: 'None', repo: '—', branch: '—', lastChange: null, agent: null, logs: [], details: 'No Archivist presence on VPS surface.' },
  ],
  [
    { entityId: 'library', surfaceId: 'desktop', state: 'wip', label: 'Local WIP', repo: 'we4free/library', branch: 'feat/graph-index-scope', lastChange: '3h ago', agent: null, logs: ['[07:00] Scope resolver edit', '[06:45] Debug session'], details: 'Manual WIP. Desktop scope resolver under active development.' },
    { entityId: 'library', surfaceId: 'headless', state: 'executing', label: 'CI Loop', repo: 'we4free/library', branch: 'feat/graph-index-scope', lastChange: '38min ago', agent: 'library-agent-v3', logs: ['[07:45] Cycle 139 FAIL', '[07:30] Graph scope exception', '[06:00] Cycle 138 PASS'], details: 'CI loop failing. Graph index scope overflow — regression in cycle 139.' },
    { entityId: 'library', surfaceId: 'gastown', state: 'coordinating', label: 'Mayor Aware', repo: 'we4free/library', branch: 'main', lastChange: 'Yesterday 20:00', agent: 'mayor-proxy', logs: ['[20:00] Sovereign report received', '[19:00] Municipal check OK'], details: 'Gastown Mayor proxy is aware of Library sovereignty.' },
    { entityId: 'library', surfaceId: 'vps', state: 'none', label: 'None', repo: '—', branch: '—', lastChange: null, agent: null, logs: [], details: 'No Library presence on VPS surface.' },
  ],
  [
    { entityId: 'swarmmind', surfaceId: 'desktop', state: 'none', label: 'None', repo: '—', branch: '—', lastChange: null, agent: null, logs: [], details: 'No SwarmMind on Desktop.' },
    { entityId: 'swarmmind', surfaceId: 'headless', state: 'executing', label: 'Lane Loop', repo: 'we4free/swarmmind', branch: 'main', lastChange: '5h ago', agent: 'swarm-agent-v2', logs: ['[08:10] Iter 139 start', '[05:00] Iter 138 complete', '[05:00] Sovereignty: PASS'], details: 'Lane loop running. Iteration 139 in progress. 97.0% context.' },
    { entityId: 'swarmmind', surfaceId: 'gastown', state: 'none', label: 'None', repo: '—', branch: '—', lastChange: null, agent: null, logs: [], details: 'No SwarmMind on Gastown.' },
    { entityId: 'swarmmind', surfaceId: 'vps', state: 'none', label: 'None', repo: '—', branch: '—', lastChange: null, agent: null, logs: [], details: 'No SwarmMind on VPS.' },
  ],
  [
    { entityId: 'kernel', surfaceId: 'desktop', state: 'none', label: 'None', repo: '—', branch: '—', lastChange: null, agent: null, logs: [], details: 'No Kernel on Desktop.' },
    { entityId: 'kernel', surfaceId: 'headless', state: 'executing', label: 'Lane Loop', repo: 'we4free/kernel', branch: 'main', lastChange: '6h ago', agent: 'kernel-agent-v1', logs: ['[08:11] Health OK', '[06:00] Lane sync', '[06:00] Integrity: GREEN'], details: 'Health monitoring. All signals green. 99.2% context.' },
    { entityId: 'kernel', surfaceId: 'gastown', state: 'none', label: 'None', repo: '—', branch: '—', lastChange: null, agent: null, logs: [], details: 'No Kernel on Gastown.' },
    { entityId: 'kernel', surfaceId: 'vps', state: 'none', label: 'None', repo: '—', branch: '—', lastChange: null, agent: null, logs: [], details: 'No Kernel on VPS.' },
  ],
];

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-xs text-neutral-400 uppercase tracking-wider font-medium">{label}</span>
      <span className="text-sm font-semibold text-neutral-100 font-mono">{value}</span>
    </div>
  );
}

const stateStyles: Record<SurfaceCellData['state'], string> = {
  active: 'bg-green-500/15 text-green-400 border-green-500/20',
  executing: 'bg-green-500/15 text-green-400 border-green-500/20',
  supervising: 'bg-blue-500/15 text-blue-400 border-blue-500/20',
  wip: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/20',
  coordinating: 'bg-purple-500/15 text-purple-400 border-purple-500/20',
  none: 'bg-neutral-800/40 text-neutral-500 border-neutral-700/30',
};

export default function MatrixPage() {
  const { lanes, status: data } = useData();
  const [selected, setSelected] = useState<{ entity: EntityId; surface: SurfaceId } | null>(null);

  const cell = selected ? matrixData.find(r => r[0].entityId === selected.entity)?.find(c => c.surfaceId === selected.surface) : null;

  return (
    <LayoutShell title="Surface Matrix">
      <PageContent>
        <div className="space-y-5">
          <div>
            <h2 className="text-xl font-semibold text-neutral-100">Surface Matrix</h2>
            <p className="text-sm text-neutral-400 mt-1">Where each lane is alive across execution surfaces</p>
          </div>
          <div className="overflow-x-auto rounded-lg border border-neutral-700/30">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-neutral-900/80">
                  <th className="text-left p-3 text-xs text-neutral-400 uppercase tracking-wider font-medium border-b border-neutral-700/30">Lane / Surface</th>
                  {(['desktop', 'headless', 'gastown', 'vps'] as SurfaceId[]).map(s => (
                    <th key={s} className="p-3 text-center text-xs text-neutral-400 uppercase tracking-wider font-medium border-b border-neutral-700/30 whitespace-nowrap">
                      {s.charAt(0).toUpperCase() + s.slice(1)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {matrixData.map((row) => (
                  <tr key={row[0].entityId} className="border-b border-neutral-700/20">
                    <td className="p-3 align-top bg-neutral-950/50 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <span className="text-lg text-neutral-400">
                          {row[0].entityId === 'control-plane' ? <ShieldIcon size={14} /> : <Server size={14} />}
                        </span>
                        <div>
                          <div className="text-sm font-medium text-neutral-100">{entityNames[row[0].entityId]}</div>
                          <div className="text-xs text-neutral-400 font-mono">{row[0].entityId}</div>
                        </div>
                      </div>
                    </td>
                    {row.map((c) => {
                      const isSel = selected?.entity === c.entityId && selected?.surface === c.surfaceId;
                      const sc = stateStyles[c.state];
                      return (
                        <td key={c.surfaceId} className="p-2 align-top cursor-pointer" onClick={() => setSelected(isSel ? null : { entity: c.entityId, surface: c.surfaceId })}>
                          <div className={`rounded-lg p-3 border ${sc} transition-colors hover:brightness-110 ${isSel ? 'ring-2 ring-indigo-500 ring-offset-2 ring-offset-neutral-950' : ''}`}>
                            <div className="text-sm font-medium">{c.label}</div>
                            {c.state !== 'none' && (
                              <div className="text-xs mt-1.5 text-neutral-400 space-y-0.5">
                                <div className="font-mono truncate">{c.repo}/{c.branch}</div>
                                {c.lastChange && <div>Last: {c.lastChange}</div>}
                                {c.agent && <div>Agent: {c.agent}</div>}
                              </div>
                            )}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {cell && (
            <Card
              title={`${entityNames[cell.entityId]} — ${cell.surfaceId}`}
              icon={<Info size={16} />}
              headerAction={<Badge variant={cell.state === 'none' ? 'idle' : 'active'}>{cell.state}</Badge>}
            >
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <Metric label="Repository" value={cell.repo} />
                  <Metric label="Branch" value={cell.branch} />
                  <Metric label="Last Change" value={cell.lastChange || '—'} />
                  <Metric label="Agent" value={cell.agent || '—'} />
                </div>
                <div>
                  <div className="text-xs text-neutral-400 uppercase tracking-wider font-medium mb-1">Details</div>
                  <p className="text-sm text-neutral-300">{cell.details}</p>
                </div>
                {cell.logs.length > 0 && (
                  <div>
                    <div className="text-xs text-neutral-400 uppercase tracking-wider font-medium mb-1">Recent Logs</div>
                    <div className="bg-neutral-900 rounded-lg p-3 font-mono text-xs space-y-0.5 max-h-40 overflow-y-auto border border-neutral-700/30">
                      {cell.logs.map((l, i) => <div key={i} className="text-neutral-400">{l}</div>)}
                    </div>
                  </div>
                )}
              </div>
            </Card>
          )}
        </div>
      </PageContent>
    </LayoutShell>
  );
}
