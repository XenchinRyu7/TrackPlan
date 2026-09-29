import {
  LayoutDashboard,
  Briefcase,
  Calendar,
  Settings,
  Plus,
  Layers,
  Mail,
} from 'lucide-react';

export type NavTab = 'dashboard' | 'applications' | 'schedule' | 'email-sync' | 'settings';

interface SidebarProps {
  currentTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  onNewApplication: () => void;
  totalApplications: number;
  unreadEmailCount?: number;
  dbPath?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onTabChange,
  onNewApplication,
  totalApplications,
  unreadEmailCount = 0,
}) => {
  const navItems: Array<{ id: NavTab; label: string; icon: React.ComponentType<{ className?: string }>; badge?: number }> = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'applications', label: 'Applications', icon: Briefcase, badge: totalApplications },
    { id: 'schedule', label: 'Schedule', icon: Calendar },
    { id: 'email-sync', label: 'Email Alerts', icon: Mail, badge: unreadEmailCount > 0 ? unreadEmailCount : undefined },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside className="w-56 shrink-0 flex flex-col h-screen border-r border-zinc-800 bg-black select-none text-zinc-300">
      {/* Brand Header */}
      <div className="p-4 border-b border-zinc-800/80 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-white text-black flex items-center justify-center font-black shadow-sm">
            <Layers className="w-4 h-4 stroke-[2.5]" />
          </div>
          <span className="font-bold text-sm tracking-tight text-white">TrackPlan</span>
        </div>
      </div>

      {/* Quick Action Button */}
      <div className="p-3">
        <button
          onClick={onNewApplication}
          className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-white hover:bg-zinc-200 text-black font-semibold text-xs shadow-sm transition-all duration-150 cursor-pointer active:scale-[0.99]"
        >
          <div className="flex items-center gap-1.5">
            <Plus className="w-3.5 h-3.5 stroke-[3]" />
            <span>New Application</span>
          </div>
          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-zinc-200 text-zinc-800 font-bold">
            Ctrl+N
          </span>
        </button>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-2 py-1 space-y-0.5">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                isActive
                  ? 'bg-zinc-900 text-white font-semibold shadow-sm'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-900/60'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-zinc-400'}`} />
                <span>{item.label}</span>
              </div>
              {item.badge !== undefined && item.badge > 0 && (
                <span
                  className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full font-bold ${
                    isActive ? 'bg-white text-black' : 'bg-zinc-800 text-zinc-400'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Clean Minimalist Footer */}
      <div className="p-3 border-t border-zinc-800/80 flex items-center justify-between text-[11px] text-zinc-500">
        <span>TrackPlan Desktop</span>
        <span className="font-mono text-[10px]">v1.0</span>
      </div>
    </aside>
  );
};
