'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { StatusDot } from '@/components/ui/status-dot';
import { Tooltip } from '@/components/ui/tooltip';
import { Info, Activity, Server, LayoutDashboard, Tv, Shield } from 'lucide-react';

type SurfaceId = 'desktop' | 'headless' | 'gastown' | 'vps';
type EntityId = 'archivist' | 'library' | 'swarmmind' | 'kernel' | 'control-plane';

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

const matrixData: SurfaceCellData[][] = [
  [
    { entityId: 'archivist', surfaceId: 'desktop', state: 'supervising', label: 'Supervising', repo: 'we4free/archivist', branch: 'main', lastChange: '2h ago', agent: 'archivist-agent-v3', logs: ['[08:12] Heartbeat OK', '[07:45] Compact #1247', '[06:30] Watchdog sync'], details: 'Monitoring local compact/restore cycles. Agent running with 87.3% context.' },
    { entityId: 'archivist', surfaceId: 'headless', state: 'executing', label: 'Executing', repo: 'we4free/archivist', branch: 'main', lastChange: '4h ago', agent: 'archivist-agent-v3', logs: ['[08:10] CI push success', '[04:00] Compact/restore complete'], details: 'Running continuous CI loop. 1247 compacts completed.' },
    { entityId: 'archivist', surfaceId: 'gastown', state: 'none', label: 'None', repo: '—', branch: '—', lastChange: null, agent: null, logs: [], details: 'No Archivist presence on Gastown surface.' },
    { entityId: 'archivist', surfaceId: 'vps', state: 'none', label: 'None', repo: '—', branch: '—', lastChange: null, agent: null, logs: [], details: 'No Archivist presence on VPS surface.' },
  ],
  [
    { entityId: 'library', surfaceId: 'desktop', state: 'wip', label: 'Local WIP', repo: 'we4free/library', branch: 'feat/graph-index-scope', lastChange: '3h ago', agent: null, logs: ['[07:00] Scope resolver edit', '[06:45] Debug session started'], details: 'Manual WIP in progress. 5 commits ahead of main.' },
    { entityId: 'library', surfaceId: 'headless', state: 'executing', label: 'CI Loop', repo: 'we4free/library', branch: 'feat/graph-index-scope', lastChange: '38min ago', agent: 'library-agent-v3', logs: ['[07:45] Cycle 139 FAIL', '[07:30] Graph scope exception', '[06:00] Cycle 138 PASS'], details: 'CI loop failing. Graph index scope overflow — regression in cycle 139.' },
    { entityId: 'library', surfaceId: 'gastown', state: 'coordinating', label: 'Mayor Aware', repo: 'we4free/library', branch: 'main', lastChange: 'Yesterday 20:00', agent: 'mayor-proxy', logs: ['[20:00] Sovereign report received', '[19:00] Municipal check OK'], details: 'Gastown Mayor proxy is aware of Library sovereignty.' },
    { entityId: 'library', surfaceId: 'vps', state: 'none', label: 'None', repo: '—', branch: '—', lastChange: null, agent: null, logs: [], details: 'No Library presence on VPS surface.' },
  ],
  [
    { entityId: 'swarmmind', surfaceId: 'desktop', state: 'none', label: 'None', repo: '—', branch: '—', lastChange: null, agent: null, logs: [], details: 'No SwarmMind presence on Desktop surface.' },
    { entityId: 'swarmmind', surfaceId: 'headless', state: 'executing', label: 'Lane Loop', repo: 'we4free/swarmmind', branch: 'main', lastChange: '5h ago', agent: 'swarm-agent-v2', logs: ['[08:10] Iteration 139 start', '[05:00] Iteration 138 complete', '[05:00] Sovereignty: PASS'], details: 'Running autonomous lane loop. 97.0% context utilization.' },
    { entityId: 'swarmmind', surfaceId: 'gastown', state: 'none', label: 'None', repo: '—', branch: '—', lastChange: null, agent: null, logs: [], details: 'No SwarmMind presence on Gastown surface.' },
    { entityId: 'swarmmind', surfaceId: 'vps', state: 'none', label: 'None', repo: '—', branch: '—', lastChange: null, agent: null, logs: [], details: 'No SwarmMind presence on VPS surface.' },
  ],
  [
    { entityId: 'kernel', surfaceId: 'desktop', state: 'none', label: 'None', repo: '—', branch: '—', lastChange: null, agent: null, logs: [], details: 'No Kernel presence on Desktop surface.' },
    { entityId: 'kernel', surfaceId: 'headless', state: 'executing', label: 'Lane Loop', repo: 'we4free/kernel', branch: 'main', lastChange: '6h ago', agent: 'kernel-agent-v1', logs: ['[08:11] Health signal OK', '[06:00] Lane sync complete', '[06:00] Integrity: GREEN'], details: 'Running health monitoring. All signals green. 99.2% context.' },
    { entityId: 'kernel', surfaceId: 'gastown', state: 'none', label: 'None', repo: '—', branch: '—', lastChange: null, agent: null, logs: [], details: 'No Kernel presence on Gastown surface.' },
    { entityId: 'kernel', surfaceId: 'vps', state: 'none', label: 'None', repo: '—', branch: '—', lastChange: null, agent: null, logs: [], details: 'No Kernel presence on VPS surface.' },
  ],
];

function ShieldIcon({ size }: { size: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>;
}

const entityIcons: Record<EntityId, React.ReactNode> = {
  archivist: <Server size={14} />,
  library: <LayoutDashboard size={14} />,
  swarmmind: <Activity size={14} />,
  kernel: <Tv size={14} />,
  'control-plane': <ShieldIcon size={14} />,
};

function CellMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-[10px] text-neutral-400 uppercase tracking-wider font-medium">{label}</span>
      <span className="text-sm font-semibold text-neutral-100">{value}</span>
    </div>
  );
}

export default function MatrixPage() {
  const [selected, setSelected] = useState<{ entity: EntityId; surface: SurfaceId } | null>(null);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Surface Matrix</h2>
          <p className="text-sm text-neutral-400 dark:text-neutral-500 mt-1">Where each lane is alive across execution surfaces</p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className="text-left p-3 text-xs text-neutral-400 dark:text-neutral-500 uppercase tracking-wider font-medium border-b border-neutral-700/30 bg-neutral-900">
                Lane / Surface
              </th>
              {(['desktop', 'headless', 'gastown', 'vps'] as SurfaceId[]).map((s) => (
                <th key={s} className="p-3 text-center text-xs text-neutral-400 dark:text-neutral-500 uppercase tracking-wider font-medium border-b border-neutral-700/30 bg-neutral-900">
                  <div className="flex items-center justify-center gap-1">
                    {s === 'desktop' && <LayoutDashboard size={14} />}
                    {s === 'headless' && <Server size={14} />}
                    {s === 'gastown' && <Tv size={14} />}
                    {s === 'vps' && <Server size={14} />}
                    {s.charAt(0).toUpperCase() + s.slice(1)}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {matrixData.map((row) => (
              <tr key={row[0].entityId} className="border-b border-neutral-700/20">
                <td className="p-3 align-top bg-neutral-950/50 min-w-[140px]">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{entityIcons[row[0].entityId]}</span>
                    <div>
                      <div className="text-sm font-medium text-neutral-100">{entityNames[row[0].entityId]}</div>
                      <div className="text-xs text-neutral-500">{row[0].entityId}</div>
                    </div>
                  </div>
                </td>
                {row.map((cell) => {
                  const isSelected = selected?.entity === cell.entityId && selected?.surface === cell.surfaceId;
                  const stateColorMap: Record<string, string> = {
                    active: 'bg-green-500/20 text-green-400',
                    executing: 'bg-green-500/20 text-green-400',
                    supervising: 'bg-blue-500/20 text-blue-400',
                    wip: 'bg-yellow-500/20 text-yellow-400',
                    coordinating: 'bg-purple-500/20 text-purple-400',
                    none: 'bg-neutral-800/50 text-neutral-500',
                  };
                  return (
                    <td
                      key={cell.surfaceId}
                      className="p-3 align-top cursor-pointer transition-colors hover:bg-neutral-800/30"
                      onClick={() => setSelected(isSelected ? null : { entity: cell.entityId, surface: cell.surfaceId })}
                    >
                      <div className={`rounded-lg p-3 border ${stateColorMap[cell.state]} ${isSelected ? 'ring-2 ring-indigo-500 ring-offset-2 ring-offset-neutral-950' : ''}`}>
                        <div className="text-sm font-medium">{cell.label}</div>
                        {cell.state !== 'none' && (
                          <div className="text-xs mt-1 text-neutral-400 dark:text-neutral-500">
                            <div>{cell.repo}</div>
                            <div className="font-mono">{cell.branch}</div>
                            {cell.lastChange && <div>Last: {cell.lastChange}</div>}
                            {cell.agent && <div>Agent: {cell.agent}</div>}
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

      {selected && (() => {
        const cell = matrixData.find(r => r[0].entityId === selected.entity)?.find(c => c.surfaceId === selected.surface);
        if (!cell) return null;
        return (
          <Card
            title={`${entityNames[cell.entityId]} — ${cell.surfaceId.charAt(0).toUpperCase() + cell.surfaceId.slice(1)}`}
            icon={<Info size={16} />}
            headerAction={<Badge variant={cell.state === 'none' ? 'idle' : 'active'}>{cell.state}</Badge>}
          >
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <CellMetric label="Repository" value={cell.repo} />
                <CellMetric label="Branch" value={cell.branch} />
                <CellMetric label="Last Change" value={cell.lastChange || '—'} />
                <CellMetric label="Agent" value={cell.agent || '—'} />
              </div>
              <div>
                <div className="text-[10px] text-neutral-400 uppercase tracking-wider font-medium mb-1">Details</div>
                <p className="text-sm text-neutral-300 dark:text-neutral-200">{cell.details}</p>
              </div>
              {cell.logs.length > 0 && (
                <div>
                  <div className="text-[10px] text-neutral-400 uppercase tracking-wider font-medium mb-1">Recent Logs</div>
                  <div className="bg-neutral-900 rounded p-2 font-mono text-xs space-y-0.5 max-h-40 overflow-y-auto border border-neutral-700/30">
                    {cell.logs.map((log, i) => (
                      <div key={i} className="text-neutral-400 dark:text-neutral-500">{log}</div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </Card>
        );
      })()}

      {!selected && (
        <Card title="How to use" icon={<Info size={16} />}>
          <p className="text-sm text-neutral-400 dark:text-neutral-500">Click any cell in the matrix to see detailed information about what is running on that lane and surface combination.</p>
        </Card>
      )}
    </div>
  );
}