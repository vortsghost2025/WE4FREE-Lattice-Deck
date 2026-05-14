'use client';

import { useState } from 'react';

export function CopyButton({ text, className = '' }: { text: string; className?: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={() => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }}
      className={`px-2 py-1 text-xs rounded transition-colors ${copied ? 'bg-green-600/20 text-green-400' : 'bg-neutral-800 text-neutral-400 hover:bg-neutral-700'} ${className}`}
    >
      {copied ? 'Copied!' : 'Copy'}
    </button>
  );
}