'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Grid3x3,
  Clock,
  MessageSquare,
  Activity,
  AlertTriangle,
  Menu,
  X,
  Home,
  Settings,
} from 'lucide-react';

const navItems = [
  { href: '/', label: 'Overview', icon: LayoutDashboard },
  { href: '/matrix', label: 'Surface Matrix', icon: Grid3x3 },
  { href: '/timeline', label: 'Timeline', icon: Clock },
  { href: '/messaging', label: 'Messaging', icon: MessageSquare },
  { href: '/continuity', label: 'Continuity', icon: Activity },
  { href: '/catchup', label: 'Catch Me Up', icon: AlertTriangle },
  { href: '/settings', label: 'Settings', icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(true);

  return (
    <>
      {open && (
        <div
          className="lg:hidden fixed inset-0 z-30 bg-black/50"
          onClick={() => setOpen(false)}
          aria-hidden="true"
        />
      )}
      <button
        className="lg:hidden fixed top-3 left-3 z-50 p-2 rounded-lg bg-neutral-800 border border-neutral-700/50 text-neutral-300"
        onClick={() => setOpen(!open)}
        aria-label="Toggle sidebar"
      >
        {open ? <X size={20} /> : <Menu size={20} />}
      </button>

      <aside
        className={`fixed top-0 left-0 z-40 h-full w-64 bg-neutral-950 border-r border-neutral-700/30 transition-transform duration-300 lg:translate-x-0 ${open ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <div className="flex items-center gap-2 px-5 py-4 border-b border-neutral-700/30">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center flex-shrink-0">
            <Home size={16} className="text-white" />
          </div>
          <span className="text-sm font-bold text-neutral-100 tracking-tight">WE4FREE Lattice Deck</span>
        </div>
        <nav className="p-3 space-y-1">
          {navItems.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => {
                  if (typeof window !== 'undefined' && window.innerWidth < 1024) setOpen(false);
                }}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${active
                  ? 'bg-indigo-500/15 text-indigo-400'
                  : 'text-neutral-400 hover:bg-neutral-800 hover:text-neutral-100'
                  }`}
              >
                <item.icon size={16} />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>
    </>
  );
}

export function Header({ title }: { title: string }) {
  return (
    <header className="lg:pl-64 flex items-center justify-between px-5 py-3 border-b border-neutral-700/30 bg-neutral-950/80 backdrop-blur-sm sticky top-0 z-30">
      <h1 className="text-lg font-semibold text-neutral-100">{title}</h1>
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 px-2.5 py-1 rounded bg-green-500/15 text-green-400 border border-green-500/30 text-xs font-medium">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          System Online
        </div>
      </div>
    </header>
  );
}