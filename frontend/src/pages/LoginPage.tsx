import { useState, type FormEvent } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Fingerprint, KeyRound, Lock, Radar, ScanFace, ShieldCheck, WifiOff } from 'lucide-react';
import Button, { buttonClasses } from '../components/Button';
import { Logo, StatusPill } from '../components/Navbar';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { cn } from '../utils/format';

const inputClasses =
  'h-11 w-full rounded-lg border border-edge bg-obsidian px-3.5 text-sm text-ink placeholder:text-mist/60 transition focus:border-cyber/60 focus:outline-none focus:ring-2 focus:ring-cyber/40';

export default function LoginPage() {
  const { login } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: string } | null)?.from ?? '/dashboard';

  const [serviceId, setServiceId] = useState('operator@verifai.local');
  const [password, setPassword] = useState('verifai-2026');
  const [remember, setRemember] = useState(true);
  const [busy, setBusy] = useState(false);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!serviceId.trim() || !password.trim()) {
      toast.push({ tone: 'error', title: 'Credentials required', description: 'Enter your service ID and security PIN to authenticate.' });
      return;
    }
    setBusy(true);
    window.setTimeout(() => {
      login(serviceId.trim(), remember);
      setBusy(false);
      toast.push({ tone: 'success', title: 'Operator authenticated', description: 'Terminal session unlocked — edge node ready.' });
      navigate(from, { replace: true });
    }, 550);
  };

  const ssoLogin = () => {
    setBusy(true);
    window.setTimeout(() => {
      login('smartcard@verifai.local', remember, { fullName: 'Vikram Rao', rank: 'Sergeant', serviceId: 'OP-114', badgeId: 'SB-47-0114' });
      setBusy(false);
      toast.push({ tone: 'success', title: 'Smart card accepted', description: 'CAC/PIV session established on this terminal.' });
      navigate(from, { replace: true });
    }, 700);
  };

  return (
    <div className="relative min-h-[calc(100vh-4rem)] overflow-hidden lg:grid lg:grid-cols-2">
      {/* atmosphere */}
      <div className="pointer-events-none absolute inset-0 -z-10" aria-hidden="true">
        <div className="dot-matrix absolute inset-0 opacity-30" />
        <div className="absolute -left-32 top-1/4 h-96 w-96 rounded-full bg-tactical/20 blur-[120px]" />
        <div className="absolute -right-24 bottom-0 h-96 w-96 rounded-full bg-cyber/15 blur-[120px]" />
      </div>

      {/* Brand panel */}
      <aside className="hidden flex-col justify-between border-r border-edge p-10 lg:flex">
        <Logo />
        <div>
          <p className="mono-label text-cyber">Secure Terminal Access</p>
          <h1 className="mt-3 max-w-md text-3xl font-bold leading-tight tracking-tight text-ink">
            Authenticate the operator. Unlock the edge node.
          </h1>
          <p className="mt-4 max-w-md text-sm leading-relaxed text-mist">
            Sessions are bound to this terminal only. No credential, token or biometric sample is transmitted beyond
            localhost — authentication is verified against the local operator store.
          </p>

          <ul className="mt-8 space-y-4">
            {[
              { icon: WifiOff, title: 'Air-gapped session', body: 'Credential checks run against the encrypted local store.' },
              { icon: Fingerprint, title: 'SSO / Smart Card ready', body: 'CAC/PIV readers supported at equipped checkpoints.' },
              { icon: ShieldCheck, title: 'Audit-logged by design', body: 'Every verdict is signed with the authenticating service ID.' },
            ].map(({ icon: Icon, title, body }) => (
              <li key={title} className="flex gap-3.5">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-cyber/30 bg-cyber/10 text-cyber">
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </span>
                <div>
                  <p className="text-sm font-semibold text-ink">{title}</p>
                  <p className="mt-0.5 text-xs text-mist">{body}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
        <StatusPill />
      </aside>

      {/* Form panel */}
      <main className="flex items-center justify-center px-4 py-12 sm:px-8">
        <div className="w-full max-w-md animate-fadeUp">
          <div className="rounded-2xl border border-edge bg-surface p-6 shadow-card sm:p-8">
            <div className="flex items-center gap-2.5 lg:hidden">
              <Logo />
            </div>
            <p className="mono-label mt-6 text-cyber lg:mt-0">Operator Login</p>
            <h2 className="mt-2 text-2xl font-bold tracking-tight text-ink">Access Command Terminal</h2>
            <p className="mt-1.5 text-sm text-mist">SSB Post 47 · restricted to provisioned field operators.</p>

            <form onSubmit={submit} className="mt-7 space-y-4" noValidate>
              <div>
                <label htmlFor="serviceId" className="mono-label mb-1.5 block">
                  Officer Email / Service ID
                </label>
                <input
                  id="serviceId"
                  type="text"
                  autoComplete="username"
                  value={serviceId}
                  onChange={(e) => setServiceId(e.target.value)}
                  className={inputClasses}
                  placeholder="operator@verifai.local"
                  required
                />
              </div>

              <div>
                <div className="mb-1.5 flex items-center justify-between">
                  <label htmlFor="password" className="mono-label">
                    Password / Security PIN
                  </label>
                  <button
                    type="button"
                    onClick={() =>
                      toast.push({
                        tone: 'info',
                        title: 'Credential recovery',
                        description: 'Recovery is offline: present your badge ID to the checkpoint commander to re-provision a PIN.',
                      })
                    }
                    className="text-[11px] text-mist underline decoration-dotted underline-offset-2 transition hover:text-cyber"
                  >
                    Forgot credentials
                  </button>
                </div>
                <input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={inputClasses}
                  placeholder="••••••••••••"
                  required
                />
              </div>

              <label className="flex cursor-pointer items-center gap-2.5 text-[13px] text-mist">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                  className="h-4 w-4 rounded border-edge bg-obsidian accent-[#2563EB]"
                />
                Remember terminal session
              </label>

              <button type="submit" disabled={busy} className={buttonClasses('primary', 'lg', 'w-full')}>
                {busy ? (
                  <>
                    <KeyRound className="h-4 w-4 animate-spin" aria-hidden="true" /> Authenticating…
                  </>
                ) : (
                  <>
                    <Lock className="h-4 w-4" aria-hidden="true" /> Authenticate Operator
                  </>
                )}
              </button>

              <div className="relative py-1 text-center">
                <span className="absolute inset-x-0 top-1/2 h-px bg-edge" aria-hidden="true" />
                <span className="relative bg-surface px-3 font-mono text-[10px] text-mist">OR</span>
              </div>

              <button type="button" onClick={ssoLogin} disabled={busy} className={buttonClasses('secondary', 'lg', 'w-full')}>
                <Fingerprint className="h-4 w-4" aria-hidden="true" /> Switch to SSO / Smart Card
              </button>
            </form>

            <p className={cn('mt-6 text-center text-[13px] text-mist')}>
              No local operator account yet?{' '}
              <Link to="/signup" className="font-semibold text-cyber transition hover:underline">
                Provision one here
              </Link>
            </p>
          </div>

          <div className="mt-4 flex items-center justify-center gap-3">
            <Link to="/verify" className="flex items-center gap-1.5 text-[11px] text-mist transition hover:text-cyber">
              <Radar className="h-3.5 w-3.5" aria-hidden="true" /> Continue to demo terminal
            </Link>
            <span className="text-edge" aria-hidden="true">·</span>
            <Link to="/dashboard" className="flex items-center gap-1.5 text-[11px] text-mist transition hover:text-cyber">
              <ScanFace className="h-3.5 w-3.5" aria-hidden="true" /> Command dashboard
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
