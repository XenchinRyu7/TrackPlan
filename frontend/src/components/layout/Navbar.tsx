import React from 'react';
import { Search, Plus, Sun, Moon } from 'lucide-react';
import { NavTab } from './Sidebar';

interface NavbarProps {
  currentTab: NavTab;
  onNewApplication: () => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  searchInputRef: React.RefObject<HTMLInputElement | null>;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onNewApplication,
  searchQuery,
  onSearchChange,
  searchInputRef,
  theme,
  onToggleTheme,
}) => {
  const titles: Record<NavTab, string> = {
    dashboard: 'Dashboard',
    applications: 'Applications',
    schedule: 'Schedule',
    'email-sync': 'Email Alerts',
    settings: 'Settings',
  };

  return (
    <header className="h-14 px-6 border-b border-zinc-800 bg-zinc-950 flex items-center justify-between shrink-0">
      <h1 className="text-sm font-bold text-white tracking-tight">{titles[currentTab]}</h1>

      <div className="flex items-center gap-2.5">
        {/* Search */}
        <div className="relative w-60">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none" />
          <input
            ref={searchInputRef}
            type="text"
            placeholder="Search... (/)"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-8 pr-8 py-1.5 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-zinc-500 transition-all font-medium"
          />
          {searchQuery ? (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-zinc-500 hover:text-white"
            >
              ✕
            </button>
          ) : (
            <kbd className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-mono px-1 py-0.2 rounded bg-zinc-800 text-zinc-400 border border-zinc-700">
              /
            </kbd>
          )}
        </div>

        {/* Theme Switcher Toggle */}
        <button
          onClick={onToggleTheme}
          className="p-2 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-zinc-300 hover:text-white transition-all cursor-pointer"
          title={`Ganti ke mode ${theme === 'dark' ? 'Terang (Light)' : 'Gelap (Dark)'}`}
        >
          {theme === 'dark' ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5 text-blue-500" />}
        </button>

        {/* Quick Add button */}
        <button
          onClick={onNewApplication}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-zinc-200 text-black font-semibold text-xs transition-colors cursor-pointer shadow-sm"
        >
          <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
          <span>New</span>
        </button>
      </div>
    </header>
  );
};
