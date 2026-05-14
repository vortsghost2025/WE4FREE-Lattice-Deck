'use client';

import { ReactNode } from 'react';

type BadgeVariant = 'active' | 'idle' | 'blocked' | 'quarantined' | 'needs-operator' | 'syncing' | 'success' | 'warning' | 'error' | 'info' | 'progression' | 'regression' | 'repair' | 'undo' | 'overwrite' | 'duplication' | 'reconciliation' | 'infrastructure' | 'unknown' | 'critical' | 'high' | 'normal' | 'low';

interface BadgeProps {
  variant: BadgeVariant;
  children: ReactNode;
  className?: string;
  icon?: ReactNode;
}

const variantStyles: Record<BadgeVariant, string> = {
  active: 'bg-green-500/15 text-green-400 border-green-500/30',
  idle: 'bg-neutral-700 text-neutral-400 border-neutral-600/30',
  blocked: 'bg-red-500/15 text-red-400 border-red-500/30',
  quarantined: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30',
  'needs-operator': 'bg-orange-500/15 text-orange-400 border-orange-500/30',
  syncing: 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30',
  success: 'bg-green-500/15 text-green-400 border-green-500/30',
  warning: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30',
  error: 'bg-red-500/15 text-red-400 border-red-500/30',
  info: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
  progression: 'bg-green-500/15 text-green-400 border-green-500/30',
  regression: 'bg-red-500/15 text-red-400 border-red-500/30',
  repair: 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30',
  undo: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30',
  overwrite: 'bg-pink-500/15 text-pink-400 border-pink-500/30',
  duplication: 'bg-purple-500/15 text-purple-400 border-purple-500/30',
  reconciliation: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
  infrastructure: 'bg-neutral-600/30 text-neutral-400 border-neutral-500/30',
  unknown: 'bg-neutral-700 text-neutral-300 border-neutral-600/30',
  critical: 'bg-red-500/15 text-red-400 border-red-500/30',
  high: 'bg-orange-500/15 text-orange-400 border-orange-500/30',
  normal: 'bg-neutral-700/30 text-neutral-400 border-neutral-600/30',
  low: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
};

export function Badge({ variant, children, className = '', icon }: BadgeProps) {
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium border ${variantStyles[variant]} ${className}`}>
      {icon}
      {children}
    </span>
  );
}