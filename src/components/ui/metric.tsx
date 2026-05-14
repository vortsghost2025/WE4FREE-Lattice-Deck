import React from 'react';

interface MetricProps {
  label: string;
  value: string | number;
  children?: React.ReactNode;
  className?: string;
}

export function Metric({ label, value, children, className = '' }: MetricProps) {
  return (
    <div className={`flex flex-col gap-0.5 ${className}`}>
      <span className="text-xs text-neutral-400 uppercase tracking-wider font-medium dark:text-neutral-500">{label}</span>
      <span className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">{value}</span>
      {children}
    </div>
  );
}