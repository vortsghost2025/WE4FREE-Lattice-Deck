'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useData } from '@/lib/hooks/useData';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { StatusDot } from '@/components/ui/status-dot';
import { LayoutShell } from '@/components/layout/shell';
import { Header } from '@/components/layout/sidebar';
import { CopyButton } from '@/components/ui/copy-button';
import {
  Send, CheckCircle2, Clock, AlertTriangle, MessageSquare,
  Server, LayoutDashboard, Shield, RefreshCw, Tv, ChevronDown, ChevronUp, XCircle,
} from 'lucide-react';

const lanes = [
  { id: 'archivist', name: 'Archivist', icon: <Shield size={14} /> },
  { id: 'library', name: 'Library', icon: <LayoutDashboard size={14} /> },
  { id: 'swarmmind', name: 'SwarmMind', icon: <Tv size={14} /> },
  { id: 'kernel', name: 'Kernel', icon: <Tv size={14} /> },
  { id: 'control-plane', name: 'Control Plane', icon: <Shield size={14} /> },
];

const surfaces = [
  { id: 'desktop', name: 'Desktop', icon: <LayoutDashboard size={14} /> },
  { id: 'headless', name: 'Headless', icon: <Server size={14} /> },
  { id: 'gastown', name: 'Gastown', icon: <Tv size={14} /> },
  { id: 'vps', name: 'VPS', icon: <Server size={14} /> },
];

const messageTypes = [
  { value: 'action-required', label: 'Action Required', icon: <AlertTriangle size={14} /> },
  { value: 'informational', label: 'Informational', icon: <MessageSquare size={14} /> },
  { value: 'governance', label: 'Governance', icon: <Shield size={14} /> },
  { value: 'audit', label: 'Audit', icon: <Clock size={14} /> },
];

const priorityLevels = [
  { value: 'critical', label: 'Critical', color: 'bg-red-500/20 text-red-400' },
  { value: 'high', label: 'High', color: 'bg-orange-500/20 text-orange-400' },
  { value: 'normal', label: 'Normal', color: 'bg-surface-700/30 text-surface-400' },
  { value: 'low', label: 'Low', color: 'bg-blue-500/20 text-blue-400' },
];

const surfaceNames: Record<string, string> = { desktop: 'Desktop', headless: 'Headless', gastown: 'Gastown', vps: 'VPS' };

function PacketPreview({ recipients, type, priority, body, requiresAction }: {
  recipients: string[]; type: string; priority: string; body: string; requiresAction: boolean;
}) {
  const packet = {
    to: recipients.length === 1 ? `lanes/${recipients[0]}/inbox` : 'lanes/multi/inbox',
    priority, type, requires_action: requiresAction, body,
    timestamp: new Date().toISOString(),
  };
  return (
    <div className="space-y-3">
      <div className="text-xs text-surface-400 uppercase tracking-wider font-medium mb-2">Governance-Safe Packet Preview</div>
      <pre className="bg-surface-900 rounded-lg p-4 font-mono text-xs overflow-x-auto border border-surface-700/30" style={{ maxHeight: 200 }}>
{JSON.stringify(packet, null, 2)}
      </pre>
    </div>
  );
}

export default function MessagingPage() {
  const { lanes: laneData } = useData();
  const [recipients, setRecipients] = useState<string[]>([]);
  const [surfaces, setSurfaces] = useState<string[]>([]);
  const [messageType, setMessageType] = useState('action-required');
  const [priority, setPriority] = useState('high');
  const [body, setBody] = useState('');
  const [requiresAction, setRequiresAction] = useState(true);
  const [step, setStep] = useState<'compose' | 'preview' | 'sent'>('compose');
  const [preset, setPreset] = useState('custom');

  const handlePresetChange = (p: string) => {
    setPreset(p);
    if (p === 'all-lanes') { setRecipients(lanes.map(l => l.id)); setSurfaces([]); }
    else if (p === 'all-active') { setRecipients(lanes.map(l => l.id)); setSurfaces([]); }
    else if (p === 'headless') { setRecipients(lanes.filter(l => l.id !== 'control-plane').map(l => l.id)); setSurfaces(['headless']); }
    else if (p === 'mayors') { setRecipients(['library']); setSurfaces(['gastown']); }
  };

  const handleSend = () => { setStep('sent'); setTimeout(() => setStep('compose'), 5000); };

  return (
    <LayoutShell title="Messaging Deck">
      <div className="space-y-6">
        <Card title="Compose Message" icon={<MessageSquare size={16} />}>
          <div className="space-y-5">
            <div>
              <div className="text-xs text-surface-400 uppercase tracking-wider font-medium mb-2">Recipients</div>
              <div className="flex flex-wrap gap-2 mb-2">
                {['all-lanes', 'all-active', 'headless', 'mayors'].map(p => (
                  <button key={p} onClick={() => handlePresetChange(p)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${preset === p ? 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30' : 'bg-surface-800 text-surface-400 border-surface-700/30 hover:border-surface-500'}`}>
                    {p === 'all-lanes' ? 'All Lanes' : p === 'all-active' ? 'All Active' : p === 'headless' ? 'All Headless' : 'All Mayors'}
                  </button>
                ))}
              </div>
              <div className="flex flex-wrap gap-2">
                {lanes.map((lane) => (
                  <button key={lane.id} onClick={() => setRecipients(prev => prev.includes(lane.id) ? prev.filter(x => x !== lane.id) : [...prev, lane.id])}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${recipients.includes(lane.id) ? 'bg-indigo-500/15 text-indigo-400 border-indigo-500/30' : 'bg-surface-800 text-surface-400 border-surface-700/30 hover:border-surface-500'}`}>
                    {lane.icon} {lane.name}
                  </button>
                ))}
              </div>
              <div className="text-xs text-surface-400 uppercase tracking-wider font-medium mb-1 mt-3">Surfaces</div>
              <div className="flex flex-wrap gap-2">
                {surfaces.map((surf) => (
                  <button key={surf} onClick={() => setSurfaces(prev => prev.filter(x => x !== surf))}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border bg-cyan-500/15 text-cyan-400 border-cyan-500/30">
                    {surfaceNames[surf]} <XCircle size={12} />
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="text-xs text-surface-400 uppercase tracking-wider font-medium mb-2">Message Type</div>
              <div className="flex flex-wrap gap-2">
                {messageTypes.map((mt) => (
                  <button key={mt.value} onClick={() => setMessageType(mt.value)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${messageType === mt.value ? 'bg-indigo-500/15 text-indigo-400 border-indigo-500/30' : 'bg-surface-800 text-surface-400 border-surface-700/30 hover:border-surface-500'}`}>
                    {mt.icon} {mt.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="text-xs text-surface-400 uppercase tracking-wider font-medium mb-2">Priority</div>
              <div className="flex flex-wrap gap-2">
                {priorityLevels.map((p) => (
                  <button key={p.value} onClick={() => setPriority(p.value)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${priority === p.value ? p.color + ' border-opacity-30' : 'bg-surface-800 text-surface-400 border-surface-700/30 hover:border-surface-500'}`}>
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="text-xs text-surface-400 uppercase tracking-wider font-medium mb-2">Instruction (plain language)</div>
              <textarea value={body} onChange={e => setBody(e.target.value)}
                placeholder="e.g. Review the last 48 hours of changes. Classify progression/regression/overwrite/duplicate work. Do not mutate code. Return a timestamped audit."
                className="w-full bg-surface-900 border border-surface-700/30 rounded-lg px-4 py-3 text-sm text-surface-200 placeholder-surface-500 focus:ring-2 focus:ring-indigo-500/50 focus:border-transparent resize-none font-sans min-h-[100px]" rows={4} />
            </div>

            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={requiresAction} onChange={e => setRequiresAction(e.target.checked)}
                className="rounded border-surface-600/30 bg-surface-800 text-indigo-500 focus:ring-indigo-500/50" />
              <span className="text-sm text-surface-300">Requires action from recipients</span>
            </label>

            <div className="flex gap-3">
              {step === 'compose' && (
                <button onClick={() => setStep('preview')} disabled={recipients.length === 0 || !body.trim()}
                  className="px-6 py-2.5 rounded-lg bg-indigo-500 hover:bg-indigo-600 disabled:bg-surface-700 disabled:text-surface-500 text-white text-sm font-medium transition-colors flex items-center gap-2">
                  <ChevronDown size={14} /> Preview Packet
                </button>
              )}
              {step === 'preview' && (
                <>
                  <button onClick={() => setStep('compose')}
                    className="px-6 py-2.5 rounded-lg bg-surface-800 hover:bg-surface-700 text-surface-300 text-sm font-medium transition-colors flex items-center gap-2">
                    <ChevronUp size={14} /> Edit
                  </button>
                  <button onClick={handleSend}
                    className="px-6 py-2.5 rounded-lg bg-green-500 hover:bg-green-600 text-white text-sm font-medium transition-colors flex items-center gap-2">
                    <Send size={14} /> Send Message
                  </button>
                </>
              )}
              {step === 'sent' && (
                <Badge variant="success" icon={<CheckCircle2 size={14} />} className="px-4 py-2">Message Queued for Relay</Badge>
              )}
            </div>
          </div>
        </Card>

        {step === 'preview' && recipients.length > 0 && (
          <Card title="Packet Preview" icon={<Shield size={16} />}>
            <PacketPreview recipients={recipients} type={messageType} priority={priority} body={body} requiresAction={requiresAction} />
            {surfaces.length > 0 && (
              <div className="text-xs text-surface-500 mt-2">Surfaces: {surfaces.map(s => surfaceNames[s]).join(', ')}</div>
            )}
          </Card>
        )}

        <Card title="Message History" icon={<Clock size={16} />}>
          <div className="space-y-3">
            {laneData?.length && (() => {
              // Show contract-typed mock messages using real lane IDs
              const sampleMsgs: Array<{lane: string, msg: string}> = [
                { lane: 'archivist', msg: 'Review last 48h changes. Classify progression/regression. Return timestamped audit.' },
                { lane: 'library', msg: 'Sovereignty check completed. Graph index scope under investigation.' },
              ];
              return sampleMsgs.map(({ lane, msg }) => {
                const ld = laneData.find(l => l.id === lane);
                return (
                  <div key={lane} className="flex items-start gap-3 p-3 rounded-lg bg-surface-900 border border-surface-700/30">
                    <Badge variant="info"><MessageSquare size={14} /></Badge>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-medium text-surface-100">lanes/{lane}/inbox</span>
                        <Badge variant="high">high</Badge>
                        <Badge variant="action-required">action-required</Badge>
                      </div>
                      <p className="text-sm text-surface-400 mt-1">{msg}</p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-surface-500">
                        <span><Clock size={12} className="inline mr-0.5" />{timeAgo(new Date().toISOString())}</span>
                        <span className="flex items-center gap-1"><StatusDot status="active" size="sm" /> Delivered</span>
                        <span>Read</span>
                        <span>Acknowledged</span>
                        <span className="text-indigo-400 hover:underline cursor-pointer">Artifact →</span>
                      </div>
                    </div>
                  </div>
                );
              });
            })()}
          </div>
        </Card>
      </div>
    </LayoutShell>
  );
}

function timeAgo(iso: string): string {
  const d = new Date(iso);
  const diff = Date.now() - d.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}