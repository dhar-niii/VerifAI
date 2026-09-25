import { useEffect, useState, type ReactNode } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar, { StatusPill } from './Navbar';
import Footer from './Footer';
import Sidebar from './Sidebar';
import { useIsCompact } from '../hooks/useMediaQuery';
import { cn } from '../utils/format';

/** Public shell: navbar + page + footer (landing, login, signup). */
export function PublicLayout({ children }: { children?: ReactNode }) {
  const location = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main id="main" className="flex-1">
        {children ?? <Outlet />}
      </main>
      <Footer />
    </div>
  );
}

const COLLAPSE_KEY = 'verifai.sidebarCollapsed';

/** Authenticated workspace shell: collapsible sidebar + top bar + content. */
export function AppLayout() {
  const { operator } = useAuth();
  const location = useLocation();
  const compact = useIsCompact();
  const [collapsed, setCollapsed] = useState(() => {
    try {
      return localStorage.getItem(COLLAPSE_KEY) === '1';
    } catch {
      return false;
    }
  });
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem(COLLAPSE_KEY, collapsed ? '1' : '0');
    } catch {
      /* ignore */
    }
  }, [collapsed]);

  useEffect(() => {
    setDrawerOpen(false);
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, [location.pathname]);

  if (!operator) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return (
    <div className="flex min-h-screen bg-obsidian">
      {/* Desktop sidebar */}
      {!compact && (
        <div className="sticky top-0 h-screen shrink-0">
          <Sidebar collapsed={collapsed} onToggle={() => setCollapsed((v) => !v)} />
        </div>
      )}

      {/* Mobile drawer */}
      {compact && (
        <>
          <div
            className={cn(
              'fixed inset-0 z-40 bg-obsidian/70 backdrop-blur-sm transition-opacity duration-300',
              drawerOpen ? 'opacity-100' : 'pointer-events-none opacity-0',
            )}
            onClick={() => setDrawerOpen(false)}
            aria-hidden="true"
          />
          <div
            className={cn(
              'fixed inset-y-0 left-0 z-50 transition-[transform,visibility] duration-300 ease-out',
              drawerOpen ? 'visible translate-x-0' : 'invisible -translate-x-full',
            )}
          >
            <Sidebar variant="drawer" collapsed={false} onToggle={() => setDrawerOpen(false)} onNavigate={() => setDrawerOpen(false)} />
          </div>
        </>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Top bar */}
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-3 border-b border-edge bg-obsidian/85 px-4 backdrop-blur-xl sm:px-6">
          <div className="flex min-w-0 items-center gap-3">
            {compact && (
              <button
                type="button"
                onClick={() => setDrawerOpen(true)}
                className="flex h-10 w-10 items-center justify-center rounded-lg border border-edge bg-surface text-ink"
                aria-label="Open navigation menu"
              >
                <span className="flex flex-col gap-[3px]" aria-hidden="true">
                  <span className="block h-0.5 w-4 bg-ink" />
                  <span className="block h-0.5 w-4 bg-ink" />
                  <span className="block h-0.5 w-4 bg-ink" />
                </span>
              </button>
            )}
            <div className="min-w-0">
              <p className="truncate font-mono text-[10px] uppercase tracking-[0.2em] text-mist">
                {location.pathname.startsWith('/verify')
                  ? 'Verification Terminal'
                  : location.pathname.startsWith('/report')
                    ? 'Forensic Dossier'
                    : location.pathname.startsWith('/history')
                      ? 'Verification History'
                      : location.pathname.startsWith('/settings')
                        ? 'Edge Node Settings'
                        : 'Command Dashboard'}
              </p>
              <p className="truncate text-sm font-semibold text-ink">
                {operator.fullName} · {operator.rank}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <StatusPill className="hidden md:inline-flex" />
          </div>
        </header>

        <main id="main" className="min-w-0 flex-1 px-4 py-6 sm:px-6 lg:px-8">
          <div className="mx-auto w-full max-w-[1400px] animate-fadeIn">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
