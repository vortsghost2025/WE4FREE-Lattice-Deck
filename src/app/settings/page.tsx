import { LayoutShell } from '@/components/layout/shell';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Info, Shield, Server, GitBranch, RefreshCw, AlertTriangle, Activity } from 'lucide-react';

function Row({ label, value, badge }: { label: string; value: string; badge?: string }) {
  return (
    <div className="flex justify-between items-center py-2 border-b border-neutral-700/30 last:border-0">
      <span className="text-sm text-neutral-400 dark:text-neutral-500">{label}</span>
      <div className="flex items-center gap-2">
        <span className="text-sm text-neutral-200 dark:text-neutral-100">{value}</span>
        {badge && <Badge variant={badge as any}>{badge}</Badge>}
      </div>
    </div>
  );
}

export default function SettingsPage() {
  return (
    <LayoutShell title="Settings">
      <div className="space-y-6 max-w-2xl">
        <Card title="System Information" icon={<Info size={16} />}>
          <div className="space-y-3">
            <Row label="Application" value="v0.1.0" badge="active" />
            <Row label="Build" value="development" badge="info" />
            <Row label="Framework" value="Next.js 16" badge="info" />
            <Row label="Mode" value="Read-Only Observatory" badge="warning" />
          </div>
        </Card>

        <Card title="Lanes Configured" icon={<Server size={16} />}>
          <div className="space-y-2">
            {['Archivist', 'Library', 'SwarmMind', 'Kernel'].map((name) => (
              <Row key={name} label={name} value="Connected" badge="active" />
            ))}
            <Row label="Control Plane" value="Connected" badge="active" />
          </div>
        </Card>

        <Card title="Surfaces Monitored" icon={<GitBranch size={16} />}>
          <div className="space-y-2">
            {['Desktop', 'Headless Ubuntu', 'Gastown', 'VPS'].map((name, i) => (
              <Row key={name} label={name} value={i < 2 ? 'Active' : 'Pending'} badge={i < 2 ? 'active' : 'idle'} />
            ))}
          </div>
        </Card>

        <Card title="Data Source Connections" icon={<RefreshCw size={16} />}>
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2 text-green-400"><Badge variant="active" className="text-xs">LIVE</Badge><span>/api/status</span></div>
            <div className="flex items-center gap-2 text-green-400"><Badge variant="active" className="text-xs">LIVE</Badge><span>/api/timeline</span></div>
            <div className="flex items-center gap-2 text-green-400"><Badge variant="active" className="text-xs">LIVE</Badge><span>/api/lanes</span></div>
            <div className="flex items-center gap-2 text-green-400"><Badge variant="active" className="text-xs">LIVE</Badge><span>/api/messages</span></div>
            <div className="flex items-center gap-2 text-green-400"><Badge variant="active" className="text-xs">LIVE</Badge><span>/api/continuity</span></div>
          </div>
        </Card>

        <Card title="Safety Settings" icon={<Shield size={16} />}>
          <div className="space-y-3 text-sm">
            <Row label="Messaging relay (governance-safe only)" value="Not Connected" badge="warning" />
            <Row label="Arbitrary command execution" value="Disabled" badge="error" />
            <Row label="Auto-refresh" value="30s interval" badge="info" />
          </div>
        </Card>

        <Card title="Architecture" icon={<Activity size={16} />}>
          <div className="space-y-2 text-sm">
            <p className="text-neutral-400 dark:text-neutral-500">This is a <strong className="text-neutral-200 dark:text-neutral-100">Stage 1 Read-Only Observatory</strong>.</p>
            <p className="text-neutral-400 dark:text-neutral-500">Stage 2: Add messaging composer with governance-safe relay.</p>
            <p className="text-neutral-400 dark:text-neutral-500">Stage 3: Live agent tracking with context utilization.</p>
            <p className="text-neutral-400 dark:text-neutral-500">Stage 4: Evolution intelligence — regression detection, drift analytics.</p>
          </div>
        </Card>
      </div>
    </LayoutShell>
  );
}