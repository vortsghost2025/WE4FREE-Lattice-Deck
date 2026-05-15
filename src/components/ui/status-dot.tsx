const statusColors = {
  active: 'bg-green-500',
  idle: 'bg-neutral-500',
  blocked: 'bg-red-500',
  quarantined: 'bg-yellow-500',
  'needs-operator': 'bg-orange-500',
  syncing: 'bg-cyan-500',
};

const statusLabels: Record<string, string> = {
  active: 'Active',
  idle: 'Idle',
  blocked: 'Blocked',
  quarantined: 'Quarantined',
  'needs-operator': 'Needs Operator',
  syncing: 'Syncing',
};

type StatusType = keyof typeof statusColors;

interface StatusDotProps {
  status: StatusType;
  size?: 'sm' | 'md' | 'lg';
  pulse?: boolean;
  label?: string;
}

export function StatusDot({ status, size = 'md', pulse = false, label }: StatusDotProps) {
  const sizeClasses = { sm: 'w-2 h-2', md: 'w-2.5 h-2.5', lg: 'w-3 h-3' };
  const displayLabel = label || statusLabels[status] || status;

  return (
    <span
      className={`inline-flex items-center gap-1.5`}
      role="status"
      aria-label={displayLabel}
    >
      <span
        className={`inline-block rounded-full ${statusColors[status]} ${sizeClasses[size]} ${pulse ? 'animate-pulse' : ''}`}
        aria-hidden="true"
      />
      <span className="sr-only">{displayLabel}</span>
    </span>
  );
}
