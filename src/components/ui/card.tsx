import React from 'react';

interface CardProps {
  title?: string | React.ReactNode;
  children: React.ReactNode;
  className?: string;
  headerAction?: React.ReactNode;
  icon?: React.ReactNode;
  headingLevel?: 2 | 3 | 4 | 5 | 6;
}

export function Card({ title, children, className = '', headerAction, icon, headingLevel = 3 }: CardProps) {
  const HeadingTag = `h${headingLevel}` as keyof React.JSX.IntrinsicElements;

  return (
    <section aria-label={typeof title === 'string' ? title : undefined}>
      <div className={`bg-neutral-900 border border-neutral-700/50 rounded-xl overflow-hidden ${className}`}>
        {title && (
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-neutral-700/30">
            <div className="flex items-center gap-2">
              {icon && <span className="text-lg" aria-hidden="true">{icon}</span>}
              <HeadingTag className="text-base font-semibold text-neutral-100 tracking-tight">{title}</HeadingTag>
            </div>
            {headerAction && <div>{headerAction}</div>}
          </div>
        )}
        <div className="p-5">{children}</div>
      </div>
    </section>
  );
}
