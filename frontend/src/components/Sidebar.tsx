import { NavLink, useNavigate } from 'react-router-dom';
import {
  Database,
  FileText,
  History,
  LayoutDashboard,
  LogOut,
  PanelLeftClose,
  PanelLeftOpen,
  ScanFace,
  X,
} from 'lucide-react';
import { cn } from '../utils/format';
import { useAuth } from '../context/AuthContext';
import { Logo } from './Navbar';

const NAV = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/verify', label: 'Verify Document', icon: ScanFace },
  { to: '/history', label: 'Verification History', icon: History },
  { to: '/report/ES-9042', label: 'Forensic Reports', icon: FileText },
  { to: '/settings', label: 'Offline Watchlist & API', icon: Database },
];

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  /** Mobile drawer mode: always expanded, closable. */
  variant?: 'fixed' | 'drawer';
  onNavigate?: () => void;
}

export default function Sidebar({ collapsed, onToggle, variant = 'fixed', onNavigate }: SidebarProps) {
  const { operator, logout } = useAuth();
  const navigate = useNavigate();
  const isDrawer = variant === 'drawer';
  const isCollapsed = collapsed && !isDrawer;

  const initials = (operator?.fullName ?? 'Operator')
    .split(' ')
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <aside
      className={cn(
        'flex h-full flex-col border-r border-edge bg-surface transition-[width] duration-300 ease-out',
        isCollapsed ? 'w-[68px]' : 'w-60',
      )}
      aria-label="Workspace navigation"
    >
      <div className={cn('flex h-16 items-center border-b border-edge', isCollapsed ? 'justify-center px-2' : 'justify-between px-4')}>
        {isDrawer ? <Logo /> : isCollapsed ? <Logo compact /> : <Logo />}
        {isDrawer ? (
          <button
            type="button"
            onClick={onToggle}
            className="rounded-md p-1.5 text-mist transition hover:bg-edge hover:text-ink"
            aria-label="Close navigation menu"
          >
            <X className="h-5 w-5" />
          </button>
        ) : (
          <button
            type="button"
            onClick={onToggle}
            className="rounded-md p-1.5 text-mist transition hover:bg-edge hover:text-ink"
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? <PanelLeftOpen className="h-5 w-5" /> : <PanelLeftClose className="h-5 w-5" />}
          </button>
        )}
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-2 py-4" aria-label="Sections">
        {!isCollapsed && <p className="mono-label px-2 pb-2">Operations</p>}
        {NAV.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            onClick={onNavigate}
            title={label}
            className={({ isActive }) =>
              cn(
                'group relative flex min-h-[42px] items-center gap-3 rounded-lg px-3 text-sm font-medium transition-all duration-200',
                isCollapsed && 'justify-center px-0',
                isActive
                  ? 'bg-cyber/10 text-cyber border border-cyber/30 shadow-glowCyan'
                  : 'border border-transparent text-mist hover:bg-edge/70 hover:text-ink',
              )
            }
          >
            <Icon className="h-[18px] w-[18px] shrink-0" aria-hidden="true" />
            {!isCollapsed && <span className="truncate">{label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* Operator card */}
      <div className={cn('border-t border-edge p-3', isCollapsed && 'px-2')}>
        <div className={cn('flex items-center gap-3', isCollapsed && 'justify-center')}>
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-tactical/40 bg-tactical/15 font-mono text-xs font-bold text-tactical">
            {initials}
          </span>
          {!isCollapsed && (
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-semibold text-ink">{operator?.fullName ?? 'Operator'}</p>
              <p className="truncate font-mono text-[10px] text-mist">
                {operator?.rank ?? 'Field'} · {operator?.badgeId ?? '—'}
              </p>
            </div>
          )}
        </div>
        <button
          type="button"
          onClick={() => {
            logout();
            navigate('/login');
          }}
          title="Sign out"
          className={cn(
            'mt-3 flex h-9 w-full items-center gap-2 rounded-lg border border-edge bg-obsidian px-3 text-xs font-semibold text-mist transition',
            'hover:border-red-500/50 hover:text-red-400',
            isCollapsed && 'justify-center px-0',
          )}
        >
          <LogOut className="h-4 w-4" aria-hidden="true" />
          {!isCollapsed && 'Sign Out'}
        </button>
      </div>
    </aside>
  );
}
