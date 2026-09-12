import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { X } from 'lucide-react';
import { SidebarContent } from './Sidebar';
import { Topbar } from './Topbar';
import { CommandSearch } from './CommandSearch';
import { useUIStore } from '../../stores/ui';
import { Toaster } from '../ui/Toast';
import { useEscapeKey } from '../../hooks';

export function AppLayout() {
  const { sidebarOpen, closeSidebar } = useUIStore();
  const [searchOpen, setSearchOpen] = useState(false);

  useEscapeKey(closeSidebar, sidebarOpen);

  return (
    <div className="min-h-full lg:pl-64">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 hidden w-64 border-r border-slate-200 bg-white lg:block dark:border-slate-800 dark:bg-slate-900">
        <SidebarContent />
      </aside>

      {/* Mobile drawer */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden" aria-modal="true" role="dialog">
          <div className="absolute inset-0 animate-fade-in bg-slate-950/50" onClick={closeSidebar} aria-hidden />
          <aside className="absolute inset-y-0 left-0 flex w-72 max-w-[85%] flex-col bg-white shadow-pop animate-scale-in dark:bg-slate-900">
            <button
              type="button"
              onClick={closeSidebar}
              aria-label="Close navigation"
              className="absolute right-3 top-4 rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <X className="h-5 w-5" aria-hidden />
            </button>
            <SidebarContent onNavigate={closeSidebar} />
          </aside>
        </div>
      )}

      <div className="flex min-h-screen flex-col">
        <Topbar onOpenSearch={() => setSearchOpen(true)} />
        <main id="main-content" className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
          <Outlet />
        </main>
        <footer className="border-t border-slate-200 px-6 py-4 text-xs text-slate-400 dark:border-slate-800 dark:text-slate-500">
          Nexora — SaaS project management demo. Built with React, TypeScript, Vite &amp; Tailwind CSS.
        </footer>
      </div>

      <CommandSearch open={searchOpen} onClose={() => setSearchOpen(false)} />
      <Toaster />
    </div>
  );
}