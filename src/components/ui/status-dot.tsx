const statusColors = {
  active: 'bg-green-500',
  idle: 'bg-neutral-500',
  blocked: 'bg-red-500',
  quarantined: 'bg-yellow-500',
  'needs-operator': 'bg-orange-500',
  syncing: 'bg-cyan-500',
};

type StatusType = keyof typeof statusColors;

interface StatusDotProps {
  status: StatusType;
  size?: 'sm' | 'md' | 'lg';
  pulse?: boolean;
}

export function StatusDot({ status, size = 'md', pulse = false }: StatusDotProps) {
  const sizeClasses = { sm: 'w-2 h-2', md: 'w-2.5 h-2.5', lg: 'w-3 h-3' };
  return (
    <span
      className={`inline-block rounded-full ${statusColors[status]} ${sizeClasses[size]} ${pulse ? 'animate-pulse' : ''}`}
      title={status}
    />
  );
}