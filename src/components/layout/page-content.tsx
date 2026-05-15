import React from 'react';

interface PageContentProps {
  children: React.ReactNode;
  narrow?: boolean;
  className?: string;
}

export function PageContent({ children, narrow, className = '' }: PageContentProps) {
  return (
    <div className={`mx-auto w-full ${narrow ? 'max-w-3xl' : 'max-w-[1400px]'} ${className}`}>
      {children}
    </div>
  );
}
