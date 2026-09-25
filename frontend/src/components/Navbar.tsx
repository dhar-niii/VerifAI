import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { Activity, Menu, Radar, ShieldCheck, X } from 'lucide-react';
import { cn } from '../utils/format';
import { buttonClasses } from './Button';

const LINKS = [
  { to: '/', label: 'Home' },
  { to: '/verify', label: 'Verify' },
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/history', label: 'History' },
  { to: '/settings', label: 'Settings' },
];

export function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <Link to="/" className="group flex items-center gap-2.5" aria-label="VerifAI home">
      <span className="relative flex h-9 w-9 items-center justify-center rounded-lg border border-cyber/40 bg-cyber/10 transition group-hover:shadow-glowCyan">
        <ShieldCheck className="h-5 w-5 text-cyber" aria-hidden="true" />
        <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-tactical animate-softPulse" aria-hidden="true" />
      </span>
      {!compact && (
        <span className="leading-none">
          <span className="block text-[17px] font-bold tracking-tight text-ink">
            Verif<span className="text-cyber">AI</span>
          </span>
          <span className="mono-label block text-[8px]">Edge Forensics</span>
        </span>
      )}
    </Link>
  );
}

export function StatusPill({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5',
        className,
      )}
      title="Local FastAPI edge engine"
    >
      <span className="relative flex h-2 w-2" aria-hidden="true">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
        <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
      </span>
      <span className="font-mono text-[10px] font-bold tracking-wider text-emerald-400">
        EDGE NODE: OFFLINE ACTIVE (localhost:8000)
      </span>
    </span>
  );
}

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const location = useLocation();

  useEffect(() => setOpen(false), [location.pathname]);

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  return (
    <header className="sticky top-0 z-50 border-b border-edge bg-obsidian/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-6">
          <Logo />
          <nav aria-label="Primary" className="hidden items-center gap-1 lg:flex">
            {LINKS.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.to === '/'}
                className={({ isActive }) =>
                  cn(
                    'rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                    isActive ? 'bg-edge/80 text-ink' : 'text-mist hover:bg-edge/50 hover:text-ink',
                  )
                }
              >
                {link.label}
              </NavLink>
            ))}
          </nav>
        </div>

        <div className="hidden items-center gap-3 xl:flex">
          <StatusPill />
        </div>

        <div className="hidden items-center gap-2 lg:flex">
          <Link to="/login" className={buttonClasses('ghost', 'md')}>
            Operator Login
          </Link>
          <Link to="/verify" className={buttonClasses('primary', 'md')}>
            <Radar className="h-4 w-4" aria-hidden="true" />
            Launch Scanner
          </Link>
        </div>

        {/* Mobile toggle */}
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="flex h-10 w-10 items-center justify-center rounded-lg border border-edge bg-surface text-ink lg:hidden"
          aria-label={open ? 'Close navigation menu' : 'Open navigation menu'}
          aria-expanded={open}
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile slide-out drawer */}
      <div
        className={cn('fixed inset-0 z-40 bg-obsidian/70 backdrop-blur-sm transition-opacity duration-300 lg:hidden', open ? 'opacity-100' : 'pointer-events-none opacity-0')}
        onClick={() => setOpen(false)}
        aria-hidden="true"
      />
      <aside
        className={cn(
          'fixed right-0 top-0 z-50 flex h-full w-[82%] max-w-sm flex-col border-l border-edge bg-surface transition-[transform,visibility] duration-300 ease-out lg:hidden',
          open ? 'visible translate-x-0' : 'invisible pointer-events-none translate-x-full',
        )}
        aria-label="Mobile navigation"
        aria-hidden={!open}
      >
        <div className="flex items-center justify-between border-b border-edge px-5 py-4">
          <Logo />
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="rounded-md p-2 text-mist hover:bg-edge hover:text-ink"
            aria-label="Close navigation menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4" aria-label="Mobile primary">
          {LINKS.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === '/'}
              className={({ isActive }) =>
                cn(
                  'flex min-h-[48px] items-center rounded-lg px-4 text-[15px] font-medium transition',
                  isActive ? 'bg-cyber/10 text-cyber' : 'text-mist hover:bg-edge/60 hover:text-ink',
                )
              }
            >
              {link.label}
            </NavLink>
          ))}
          <div className="pt-3">
            <StatusPill className="w-full justify-center" />
          </div>
        </nav>
        <div className="space-y-2 border-t border-edge p-4">
          <Link to="/login" className={buttonClasses('secondary', 'lg', 'w-full')}>
            Operator Login
          </Link>
          <Link to="/verify" className={buttonClasses('primary', 'lg', 'w-full')}>
            <Radar className="h-4 w-4" aria-hidden="true" />
            Launch Scanner
          </Link>
        </div>
      </aside>

      {/* Compact status strip on tablet/mobile */}
      <div className="flex items-center justify-center gap-2 border-t border-edge/60 bg-obsidian/60 px-4 py-1.5 xl:hidden">
        <Activity className="h-3 w-3 text-emerald-400" aria-hidden="true" />
        <span className="font-mono text-[9px] font-semibold tracking-wider text-emerald-400/90">
          EDGE NODE: OFFLINE ACTIVE (localhost:8000)
        </span>
      </div>
    </header>
  );
}
