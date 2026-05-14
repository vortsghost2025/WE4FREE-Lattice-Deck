'use client';

import { useState } from 'react';

interface TooltipProps {
  children: React.ReactNode;
  text: string;
}

export function Tooltip({ children, text }: TooltipProps) {
  return (
    <div className="group relative inline-block">
      {children}
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block px-2 py-1 bg-neutral-800 text-neutral-200 text-xs rounded whitespace-nowrap z-50">
        {text}
      </div>
    </div>
  );
}