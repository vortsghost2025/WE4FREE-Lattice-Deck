'use client';

import { LayoutShell } from '@/components/layout/shell';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PageContent } from '@/components/layout/page-content';
import { useDisplayMode } from '@/hooks/use-display-mode';
import { Info, Shield, Server, Activity, AlertTriangle, Cpu, Radio, Eye, EyeOff } from 'lucide-react';

function Row({ label, value, badge, mono }: { label: string; value: string; badge?: string; mono?: boolean }) {
  return (
    <div className="flex justify-between items-center py-2.5 border-b border-neutral-700/30 last:border-0">
      <span className="text-sm text-neutral-400">{label}</span>
      <div className="flex items-center gap-2">
        <span className={`text-sm text-neutral-100 ${mono ? 'font-mono' : ''}`}>{value}</span>
        {badge && <Badge variant={badge as any}>{badge}</Badge>}
      </div>
    </div>
  );
}

function StatusRow({ label, connected }: { label: string; connected: boolean }) {
  return (
    <div className="flex items-center gap-3 py-2 border-b border-neutral-700/30 last:border-0">
      <span className={`w-2 h-2 rounded-full shrink-0 ${connected ? 'bg-green-400' : 'bg-neutral-600'}`} />
      <span className="text-sm text-neutral-100 flex-1 truncate font-mono">{label}</span>
      <Badge variant={connected ? 'active' : 'idle'}>{connected ? 'UP' : 'DOWN'}</Badge>
    </div>
  );
}

export default function SettingsPage() {
  const { mode, toggle, mounted } = useDisplayMode();
  const isBigText = mode === 'big-text';

  return (
    <LayoutShell title="Settings">
      <PageContent>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card title="Display Mode" icon={isBigText ? <Eye size={16} /> : <EyeOff size={16} />}>
            <div className="space-y-3">
              <p className="text-sm text-neutral-400">
                Big Text mode increases font sizes, spacing, and touch targets for low-vision operators.
              </p>
              <button
                onClick={toggle}
                disabled={!mounted}
                aria-pressed={isBigText}
                aria-label="Toggle big text mode"
                className={`
                  inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border text-sm font-medium
                  transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500
                  ${isBigText
                    ? 'bg-indigo-500/15 border-indigo-500/40 text-indigo-300'
                    : 'bg-neutral-800/50 border-neutral-700/50 text-neutral-300 hover:bg-neutral-800'
                  }
                  disabled:opacity-50 disabled:cursor-not-allowed
                `}
              >
                {isBigText ? <Eye size={16} /> : <EyeOff size={16} />}
                {isBigText ? 'Big Text: On' : 'Big Text: Off'}
              </button>
              {isBigText && (
                <p className="text-xs text-indigo-400/80">
                  Display mode is persisted in your browser. Refresh will keep this setting.
                </p>
              )}
            </div>
          </Card>
          <Card title="System Information" icon={<Info size={16} />}>
            <div className="space-y-1">
              <Row label="Application" value="v0.1.0" badge="active" />
              <Row label="Build" value="development" badge="info" />
              <Row label="Framework" value="Next.js 16" badge="info" />
              <Row label="Mode" value="Read-Only Observatory" badge="warning" />
            </div>
          </Card>

          <Card title="Architecture" icon={<Activity size={16} />}>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2 py-2 border-b border-neutral-700/30">
                <span className="text-neutral-400">Stage</span>
                <span className="ml-auto text-neutral-100 font-semibold">1 — Read-Only Observatory</span>
              </div>
              <div className="py-1.5 text-neutral-400 flex items-start gap-2">
                <span className="text-neutral-400 font-mono text-xs mt-0.5">2→</span>
                <span>Messaging composer with governance-safe relay</span>
              </div>
              <div className="py-1.5 text-neutral-400 flex items-start gap-2">
                <span className="text-neutral-400 font-mono text-xs mt-0.5">3→</span>
                <span>Live agent tracking with context utilization</span>
              </div>
              <div className="py-1.5 text-neutral-400 flex items-start gap-2">
                <span className="text-neutral-400 font-mono text-xs mt-0.5">4→</span>
                <span>Evolution intelligence — regression detection, drift analytics</span>
              </div>
            </div>
          </Card>

          <Card title="Lanes Configured" icon={<Server size={16} />}>
            <div className="space-y-1">
              {['Archivist', 'Library', 'SwarmMind', 'Kernel'].map((name) => (
                <Row key={name} label={name} value="Connected" badge="active" />
              ))}
              <Row label="Control Plane" value="Connected" badge="active" />
            </div>
          </Card>

          <Card title="Surfaces Monitored" icon={<Cpu size={16} />}>
            <div className="space-y-1">
              {['Desktop', 'Headless Ubuntu', 'Gastown', 'VPS'].map((name, i) => (
                <Row key={name} label={name} value={i < 2 ? 'Active' : 'Pending'} badge={i < 2 ? 'active' : 'idle'} />
              ))}
            </div>
          </Card>

          <Card title="Data Source Connections" icon={<Radio size={16} />}>
            <div className="space-y-1">
              <StatusRow label="/api/status" connected />
              <StatusRow label="/api/timeline" connected />
              <StatusRow label="/api/lanes" connected />
              <StatusRow label="/api/messages" connected />
              <StatusRow label="/api/continuity" connected />
            </div>
          </Card>

          <Card title="Safety Settings" icon={<Shield size={16} />}>
            <div className="space-y-1">
              <Row label="Messaging relay (governance-safe only)" value="Not Connected" badge="warning" />
              <Row label="Arbitrary command execution" value="Disabled" badge="error" />
              <Row label="Auto-refresh" value="30s interval" badge="info" />
            </div>
            <div className="mt-4 p-3 bg-neutral-800/40 rounded-lg border border-neutral-700/40">
              <div className="flex items-start gap-2.5">
                <AlertTriangle size={16} className="text-amber-400 shrink-0 mt-0.5" />
                <p className="text-sm text-neutral-400">
                  All data rendered via <span className="font-mono text-neutral-200">dataAdapter</span> mock contract. No live credentials or secrets are exposed through this interface.
                </p>
              </div>
            </div>
          </Card>

        </div>
      </PageContent>
    </LayoutShell>
  );
}
