import React from 'react';
import { Sidebar } from './sidebar';
import { Header } from './sidebar';

export const LayoutShell = ({ children, title }: { children: React.ReactNode; title: string }) => {
  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100">
      <Sidebar />
      <div className="lg:pl-64 min-h-screen">
        <Header title={title} />
        <main className="p-5">{children}</main>
      </div>
    </div>
  );
};