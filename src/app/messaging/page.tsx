'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LayoutShell } from '@/components/layout/shell';
import { CopyButton } from '@/components/ui/copy-button';
import {
  Send,
  CheckCircle2,
  Clock,
  AlertTriangle,
  MessageSquare,
  Shield,
  ChevronDown,
  ChevronUp,
  LayoutDashboard,
  Server,
  Users,
  Activity,
} from 'lucide-react';
import { StatusDot } from '@/components/ui/status-dot';

const laneRecipients = [
  { id: 'archivist', name: 'Archivist', icon: <Shield size={14} /> },
  { id: 'library', name: 'Library', icon: <LayoutDashboard size={14} /> },
  { id: 'swarmmind', name: 'SwarmMind', icon: <Activity size={14} /> },
  { id: 'kernel', name: 'Kernel', icon: <Server size={14} /> },
  { id: 'control-plane', name: 'Control Plane', icon: <Shield size={14} /> },
];

const surfaceRecipients = [
  { id: 'desktop' as const, name: 'Desktop', icon: <LayoutDashboard size={14} /> },
  { id: 'headless' as const, name: 'Headless', icon: <Server size={14} /> },
  { id: 'gastown' as const, name: 'Gastown', icon: <Activity size={14} /> },
  { id: 'vps' as const, name: 'VPS', icon: <Server size={14} /> },
];

const messageTypes = [
  { value: 'action-required', label: 'Action Required', icon: <AlertTriangle size={14} /> },
  { value: 'informational', label: 'Informational', icon: <MessageSquare size={14} /> },
  { value: 'governance', label: 'Governance', icon: <Shield size={14} /> },
  { value: 'audit', label: 'Audit', icon: <Clock size={14} /> },
];

const priorityLevels = [
  { value: 'critical', label: 'Critical', cls: 'bg-red-500/20 text-red-400' },
  { value: 'high', label: 'High', cls: 'bg-orange-500/20 text-orange-400' },
  { value: 'normal', label: 'Normal', cls: 'bg-neutral-700/30 text-neutral-400' },
  { value: 'low', label: 'Low', cls: 'bg-blue-500/20 text-blue-400' },
];

const surfaceNameMap: Record<string, string> = {
  desktop: 'Desktop',
  headless: 'Headless',
  gastown: 'Gastown',
  vps: 'VPS',
};

function PacketPreview({ recipients, type, priority, body, requiresAction }: {
  recipients: string[]; type: string; priority: string; body: string; requiresAction: boolean;
}) {
  const packet = {
    to: recipients.length === 1 ? `lanes/${recipients[0]}/inbox` : 'lanes/multi/inbox',
    priority,
    type,
    requires_action: requiresAction,
    body,
    timestamp: new Date().toISOString(),
  };

  return (
    <div className="space-y-3">
      <div className="text-[10px] text-neutral-400 uppercase tracking-wider font-medium mb-2">Governance-Safe Packet Preview</div>
      <pre className="bg-neutral-900 rounded-lg p-4 font-mono text-xs overflow-x-auto border border-neutral-700/30" style={{ maxHeight: 200 }}>
{JSON.stringify(packet, null, 2)}
      </pre>
    </div>
  );
}

const mockHistory = [
  {
    id: 'm1', to: 'lanes/archivist/inbox', priority: 'high' as const, type: 'action-required' as const,
    requiresAction: true, body: 'Review the last 48h of changes. Classify progression/regression/overwrite/duplicate work. Return a timestamped audit.',
    createdAt: '2026-05-14T07:00:00Z', sentAt: '2026-05-14T07:01:00Z',
    delivered: true, read: true, acknowledged: true, actionStarted: true,
    resultArtifact: '/artifacts/archivist/audit-20260514',
    recipients: [{ entityId: 'archivist' as const }],
  },
  {
    id: 'm2', to: 'lanes/library/inbox', priority: 'normal' as const, type: 'informational' as const,
    requiresAction: false, body: 'Sovereignty check completed. Graph index scope under investigation. No immediate action required.',
    createdAt: '2026-05-14T06:00:00Z', sentAt: '2026-05-14T06:01:00Z',
    delivered: true, read: true, acknowledged: false, actionStarted: false,
    resultArtifact: null,
    recipients: [{ entityId: 'library' as const }],
  },
];

export default function MessagingPage() {
  const [recipients, setRecipients] = useState<string[]>([]);
  const [surfaces, setSurfaces] = useState<string[]>([]);
  const [messageType, setMessageType] = useState('action-required');
  const [priority, setPriority] = useState('high');
  const [body, setBody] = useState('');
  const [requiresAction, setRequiresAction] = useState(true);
  const [step, setStep] = useState<'compose' | 'preview' | 'sent'>('compose');

  const handlePreset = (preset: string) => {
    if (preset === 'all-lanes') {
      setRecipients(laneRecipients.map(l => l.id));
      setSurfaces([]);
    } else if (preset === 'all-active') {
      setRecipients(laneRecipients.map(l => l.id));
      setSurfaces([]);
    } else if (preset === 'headless') {
      setRecipients(['archivist', 'library', 'swarmmind', 'kernel']);
      setSurfaces(['headless']);
    } else if (preset === 'mayors') {
      setRecipients(['library']);
      setSurfaces(['gastown']);
    }
  };

  const handleSend = () => {
    setStep('sent');
    setTimeout(() => { setStep('compose'); setBody(''); setRecipients([]); }, 5000);
  };

  const handleReset = () => {
    setStep('compose');
    setRecipients([]);
    setSurfaces([]);
    setBody('');
    setMessageType('action-required');
    setPriority('high');
    setRequiresAction(true);
  };

  return (
    <LayoutShell title="Messaging Deck">
      <div className="space-y-6">
        <Card title="Compose Message" icon={<MessageSquare size={16} />}>
          <div className="space-y-5">
            <div>
              <div className="text-[10px] text-neutral-400 uppercase tracking-wider font-medium mb-2">Quick Presets</div>
              <div className="flex flex-wrap gap-2">
                <button onClick={() => handlePreset('all-lanes')} className="px-3 py-1.5 rounded-lg text-xs font-medium border border-neutral-700/30 bg-neutral-800 text-neutral-300 hover:border-neutral-500 transition-colors">
                  All Lanes
                </button>
                <button onClick={() => handlePreset('all-active')} className="px-3 py-1.5 rounded-lg text-xs font-medium border border-neutral-700/30 bg-neutral-800 text-neutral-300 hover:border-neutral-500 transition-colors">
                  All Active
                </button>
                <button onClick={() => handlePreset('headless')} className="px-3 py-1.5 rounded-lg text-xs font-medium border border-neutral-700/30 bg-neutral-800 text-neutral-300 hover:border-neutral-500 transition-colors">
                  All Headless
                </button>
                <button onClick={() => handlePreset('mayors')} className="px-3 py-1.5 rounded-lg text-xs font-medium border border-neutral-700/30 bg-neutral-800 text-neutral-300 hover:border-neutral-500 transition-colors">
                  All Mayors
                </button>
              </div>
            </div>

            <div>
              <div className="text-[10px] text-neutral-400 uppercase tracking-wider font-medium mb-2">Recipients — Lanes</div>
              <div className="flex flex-wrap gap-2">
                {laneRecipients.map((lane) => (
                  <button
                    key={lane.id}
                    onClick={() => setRecipients(prev => prev.includes(lane.id) ? prev.filter(x => x !== lane.id) : [...prev, lane.id])}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${recipients.includes(lane.id) ? 'bg-indigo-500/15 text-indigo-400 border-indigo-500/30' : 'bg-neutral-800 text-neutral-400 border-neutral-700/30 hover:border-neutral-500'}`}
                  >
                    {lane.icon} {lane.name}
                  </button>
                ))}
              </div>
              <div className="text-[10px] text-neutral-400 uppercase tracking-wider font-medium mb-1 mt-3">Surfaces</div>
              <div className="flex flex-wrap gap-2">
                {surfaceRecipients.map((surf) => (
                  <button
                    key={surf.id}
                    onClick={() => setSurfaces(prev => prev.includes(surf.id) ? prev.filter(x => x !== surf.id) : [...prev, surf.id])}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${surfaces.includes(surf.id) ? 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30' : 'bg-neutral-800 text-neutral-400 border-neutral-700/30 hover:border-neutral-500'}`}
                  >
                    {surf.icon} {surf.name}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="text-[10px] text-neutral-400 uppercase tracking-wider font-medium mb-2">Message Type</div>
              <div className="flex flex-wrap gap-2">
                {messageTypes.map((mt) => (
                  <button
                    key={mt.value}
                    onClick={() => setMessageType(mt.value)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${messageType === mt.value ? 'bg-indigo-500/15 text-indigo-400 border-indigo-500/30' : 'bg-neutral-800 text-neutral-400 border-neutral-700/30 hover:border-neutral-500'}`}
                  >
                    {mt.icon} {mt.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="text-[10px] text-neutral-400 uppercase tracking-wider font-medium mb-2">Priority</div>
              <div className="flex flex-wrap gap-2">
                {priorityLevels.map((p) => (
                  <button
                    key={p.value}
                    onClick={() => setPriority(p.value as any)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${priority === p.value ? p.cls + ' border-opacity-30' : 'bg-neutral-800 text-neutral-400 border-neutral-700/30 hover:border-neutral-500'}`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="text-[10px] text-neutral-400 uppercase tracking-wider font-medium mb-2">Instruction (Plain Language)</div>
              <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="e.g. Review the last 48 hours of changes. Classify progression/regression/overwrite/duplicate work."
                className="w-full bg-neutral-900 border border-neutral-700/30 rounded-lg px-4 py-3 text-sm text-neutral-200 placeholder-neutral-500 focus:ring-2 focus:ring-indigo-500/50 focus:border-transparent resize-none"
                rows={4}
              />
            </div>

            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={requiresAction} onChange={(e) => setRequiresAction(e.target.checked)} className="rounded border-neutral-600/30 bg-neutral-800 text-indigo-500 focus:ring-indigo-500/50" />
              <span className="text-sm text-neutral-300">Requires action from recipients</span>
            </label>

            <div className="flex gap-3">
              {step === 'compose' && (
                <button onClick={() => setStep('preview')} disabled={recipients.length === 0 || !body.trim()} className="px-6 py-2.5 rounded-lg bg-indigo-500 hover:bg-indigo-600 disabled:bg-neutral-700 disabled:text-neutral-500 text-white text-sm font-medium transition-colors flex items-center gap-2">
                  <ChevronDown size={14} /> Preview Packet
                </button>
              )}
              {step === 'preview' && (
                <>
                  <button onClick={() => setStep('compose')} className="px-6 py-2.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-sm font-medium transition-colors flex items-center gap-2">
                    <ChevronUp size={14} /> Edit
                  </button>
                  <button onClick={handleSend} className="px-6 py-2.5 rounded-lg bg-green-500 hover:bg-green-600 text-white text-sm font-medium transition-colors flex items-center gap-2">
                    <Send size={14} /> Send Message
                  </button>
                </>
              )}
              {step === 'sent' && (
                <Badge variant="success" icon={<CheckCircle2 size={14} />} className="px-4 py-2">
                  Message Queued for Relay
                </Badge>
              )}
              {step === 'compose' && (
                <button onClick={handleReset} className="px-4 py-2.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-400 text-sm font-medium transition-colors">
                  Clear
                </button>
              )}
            </div>
          </div>
        </Card>

        {step === 'preview' && recipients.length > 0 && (
          <Card title="Packet Preview" icon={<Shield size={16} />}>
            <PacketPreview recipients={recipients} type={messageType} priority={priority} body={body} requiresAction={requiresAction} />
            {surfaces.length > 0 && (
              <div className="text-xs text-neutral-500 mt-2">Surfaces: {surfaces.map(s => surfaceNameMap[s]).join(', ')}</div>
            )}
          </Card>
        )}

        <Card title="Message History" icon={<Clock size={16} />}>
          <div className="space-y-3">
            {mockHistory.map((msg) => {
              const typeColors: Record<string, string> = {
                'action-required': 'error',
                'informational': 'info',
              };
              return (
                <div key={msg.id} className="flex items-start gap-3 p-3 rounded-lg bg-neutral-900 border border-neutral-700/30">
                  <div className="flex-shrink-0 mt-1">
                    {msg.type === 'action-required' && <AlertTriangle size={14} />}
                    {msg.type === 'informational' && <MessageSquare size={14} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-medium text-neutral-100">{msg.to}</span>
                      <Badge variant={msg.priority as any} className="text-[10px]">{msg.priority}</Badge>
                      <Badge variant={(typeColors[msg.type] || 'info') as any} className="text-[10px]">{msg.type}</Badge>
                    </div>
                    <p className="text-sm text-neutral-400 dark:text-neutral-500 mt-1">{msg.body.substring(0, 100)}...</p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-neutral-500">
                      <span><Clock size={12} className="inline mr-0.5" />{new Date(msg.sentAt!).toLocaleString()}</span>
                      <span className={`flex items-center gap-1 ${msg.delivered ? 'text-green-400' : 'text-neutral-500'}`}>
                        <StatusDot size="sm" status={msg.delivered ? 'active' : 'idle'} /> {msg.delivered ? 'Delivered' : 'Pending'}
                      </span>
                      <span className={msg.read ? 'text-green-400' : 'text-neutral-500'}>Read</span>
                      <span className={msg.acknowledged ? 'text-green-400' : 'text-neutral-500'}>Ack</span>
                      <span className={msg.actionStarted ? 'text-green-400' : 'text-neutral-500'}>{msg.actionStarted ? 'Acted' : 'Waiting'}</span>
                      {msg.resultArtifact && <a href="#" className="text-indigo-400 hover:underline">Artifact →</a>}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>
    </LayoutShell>
  );
}