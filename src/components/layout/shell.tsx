import React from 'react';
import { Sidebar } from './sidebar';
import { Header } from './sidebar';

export const LayoutShell = ({ children, title }: { children: React.ReactNode; title: string }) => {
  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100">
      <nav aria-label="Primary navigation">
        <Sidebar />
      </nav>
      <div className="lg:pl-64 min-h-screen">
        <Header title={title} />
        <main id="main-content" className="p-5" role="main" aria-label={`${title} content`}>
          <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:p-3 focus:bg-indigo-600 focus:text-white focus:rounded-br-lg">
            Skip to main content
          </a>
          {children}
        </main>
      </div>
    </div>
  );
};
