'use client';

import { useEffect, useState } from 'react';

export type DisplayMode = 'default' | 'big-text';

const STORAGE_KEY = 'lattice-display-mode';

export function useDisplayMode() {
  const [mode, setMode] = useState<DisplayMode>('default');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const stored = localStorage.getItem(STORAGE_KEY) as DisplayMode | null;
    if (stored === 'big-text') {
      setMode('big-text');
      document.documentElement.setAttribute('data-mode', 'big-text');
    }
  }, []);

  const toggle = () => {
    setMode((prev) => {
      const next = prev === 'big-text' ? 'default' : 'big-text';
      localStorage.setItem(STORAGE_KEY, next);
      document.documentElement.setAttribute('data-mode', next);
      return next;
    });
  };

  return { mode, toggle, mounted };
}
