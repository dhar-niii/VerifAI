import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BadgeCheck, Fingerprint, IdCard, ShieldCheck, UserRound } from 'lucide-react';
import Button, { buttonClasses } from '../components/Button';
import { Logo, StatusPill } from '../components/Navbar';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const inputClasses =
  'h-11 w-full rounded-lg border border-edge bg-obsidian px-3.5 text-sm text-ink placeholder:text-mist/60 transition focus:border-cyber/60 focus:outline-none focus:ring-2 focus:ring-cyber/40';

const RANKS = ['Cadet', 'Constable', 'Sergeant', 'Inspector', 'Sub-Inspector', 'Commander'];

export default function SignupPage() {
  const { signup } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    fullName: '',
    rank: 'Sergeant',
    email: '',
    badgeId: '',
    password: '',
    confirm: '',
  });
  const [busy, setBusy] = useState(false);

  const set = (key: keyof typeof form) => (e: { target: { value: string } }) =>
    setForm((prev) => ({ ...prev, [key]: e.target.value }));

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!form.fullName.trim() || !form.email.trim() || !form.badgeId.trim()) {
      toast.push({ tone: 'error', title: 'Missing required fields', description: 'Full name, official email and badge ID are required.' });
      return;
    }
    if (form.password.length < 6) {
      toast.push({ tone: 'error', title: 'Weak security PIN', description: 'Use at least 6 characters for the terminal PIN.' });
      return;
    }
    if (form.password !== form.confirm) {
      toast.push({ tone: 'error', title: 'PIN mismatch', description: 'Password and confirmation PIN do not match.' });
      return;
    }
    setBusy(true);
    window.setTimeout(() => {
      signup({
        fullName: form.fullName.trim(),
        rank: form.rank,
        email: form.email.trim(),
        badgeId: form.badgeId.trim(),
      });
      setBusy(false);
      toast.push({
        tone: 'success',
        title: 'Local operator account provisioned',
        description: 'Credentials written to the encrypted local store — welcome aboard.',
      });
      navigate('/dashboard', { replace: true });
    }, 650);
  };

  return (
    <div className="relative min-h-[calc(100vh-4rem)] overflow-hidden lg:grid lg:grid-cols-2">
      <div className="pointer-events-none absolute inset-0 -z-10" aria-hidden="true">
        <div className="dot-matrix absolute inset-0 opacity-30" />
        <div className="absolute -right-28 top-1/4 h-96 w-96 rounded-full bg-cyber/20 blur-[120px]" />
        <div className="absolute -left-28 bottom-0 h-96 w-96 rounded-full bg-tactical/18 blur-[120px]" />
      </div>

      {/* Form panel (left on desktop) */}
      <main className="flex items-center justify-center px-4 py-12 sm:px-8">
        <div className="w-full max-w-md animate-fadeUp">
          <div className="rounded-2xl border border-edge bg-surface p-6 shadow-card sm:p-8">
            <div className="flex items-center gap-2.5 lg:hidden">
              <Logo />
            </div>
            <p className="mono-label mt-6 text-cyber lg:mt-0">Local Provisioning</p>
            <h2 className="mt-2 text-2xl font-bold tracking-tight text-ink">Provision Operator Account</h2>
            <p className="mt-1.5 text-sm text-mist">
              Accounts are created on this edge node only — no directory sync, no cloud identity provider.
            </p>

            <form onSubmit={submit} className="mt-7 space-y-4" noValidate>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label htmlFor="fullName" className="mono-label mb-1.5 block">Officer Full Name</label>
                  <input id="fullName" value={form.fullName} onChange={set('fullName')} className={inputClasses} placeholder="Ananya Sharma" required />
                </div>

                <div>
                  <label htmlFor="rank" className="mono-label mb-1.5 block">Rank</label>
                  <select id="rank" value={form.rank} onChange={set('rank')} className={inputClasses}>
                    {RANKS.map((rank) => (
                      <option key={rank} value={rank}>{rank}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="badgeId" className="mono-label mb-1.5 block">Badge ID</label>
                  <input id="badgeId" value={form.badgeId} onChange={set('badgeId')} className={inputClasses} placeholder="SB-47-0231" required />
                </div>

                <div className="sm:col-span-2">
                  <label htmlFor="email" className="mono-label mb-1.5 block">Official Email</label>
                  <input id="email" type="email" value={form.email} onChange={set('email')} className={inputClasses} placeholder="ananya.sharma@verifai.local" required />
                </div>

                <div>
                  <label htmlFor="pwd" className="mono-label mb-1.5 block">Password / PIN</label>
                  <input id="pwd" type="password" value={form.password} onChange={set('password')} className={inputClasses} placeholder="••••••" required />
                </div>

                <div>
                  <label htmlFor="confirm" className="mono-label mb-1.5 block">Confirm PIN</label>
                  <input id="confirm" type="password" value={form.confirm} onChange={set('confirm')} className={inputClasses} placeholder="••••••" required />
                </div>
              </div>

              <button type="submit" disabled={busy} className={buttonClasses('primary', 'lg', 'w-full')}>
                {busy ? (
                  <>
                    <BadgeCheck className="h-4 w-4 animate-spin" aria-hidden="true" /> Writing to local store…
                  </>
                ) : (
                  <>
                    <ShieldCheck className="h-4 w-4" aria-hidden="true" /> Provision Local Operator Account
                  </>
                )}
              </button>
            </form>

            <p className="mt-6 text-center text-[13px] text-mist">
              Already provisioned?{' '}
              <Link to="/login" className="font-semibold text-cyber transition hover:underline">
                Sign in at the terminal
              </Link>
            </p>
          </div>
        </div>
      </main>

      {/* Brand panel */}
      <aside className="hidden flex-col justify-between border-l border-edge p-10 lg:flex">
        <Logo />
        <div>
          <p className="mono-label text-cyber">Why local provisioning</p>
          <h1 className="mt-3 max-w-md text-3xl font-bold leading-tight tracking-tight text-ink">
            One laptop. One ledger. Zero identity leaks.
          </h1>
          <p className="mt-4 max-w-md text-sm leading-relaxed text-mist">
            Field terminals operate beyond network coverage for days. Operator accounts live inside the encrypted local
            store so authentication keeps working when the checkpoint is fully dark.
          </p>
          <ul className="mt-8 space-y-4">
            {[
              { icon: UserRound, title: 'Bound to your badge ID', body: 'Every dossier and PDF export is signed with your service ID.' },
              { icon: IdCard, title: 'No cloud identity provider', body: 'Provisioning writes straight to the local operator table.' },
              { icon: Fingerprint, title: 'Biometrics stay on device', body: 'Traveler frames are matched in-memory and never persisted remotely.' },
            ].map(({ icon: Icon, title, body }) => (
              <li key={title} className="flex gap-3.5">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-tactical/30 bg-tactical/10 text-tactical">
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
    </div>
  );
}
