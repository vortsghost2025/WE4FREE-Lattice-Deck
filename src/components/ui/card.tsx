import React from 'react';

interface CardProps {
  title?: string | React.ReactNode;
  children: React.ReactNode;
  className?: string;
  headerAction?: React.ReactNode;
  icon?: React.ReactNode;
}

export function Card({ title, children, className = '', headerAction, icon }: CardProps) {
  return (
    <div className={`bg-neutral-900 border border-neutral-700/50 rounded-xl overflow-hidden ${className}`}>
      <div className="flex items-center justify-between px-5 py-3 border-b border-neutral-700/30">
        <div className="flex items-center gap-2">
          {icon && <span className="text-lg">{icon}</span>}
          <h3 className="text-sm font-semibold text-neutral-100 tracking-tight">{title}</h3>
        </div>
        {headerAction && <div>{headerAction}</div>}
      </div>
      <div className="p-4">{children}</div>
    </div>
  );
}