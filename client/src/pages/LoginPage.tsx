import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { ApiService } from '../services/api';
import { AuthShell } from '../components/layout/AuthShell';
import { Alert, Button, Field } from '../components/ui';
import { Character, type CharacterId } from '../components/Character';
import { homePathForRole } from '../components/layout/nav';

const DEMOS: Array<{ role: string; who: CharacterId; label: string; sub: string }> = [
  { role: 'STUDENT', who: 'aarav', label: 'Student', sub: 'Aarav · Class 10' },
  { role: 'PARENT', who: 'sunita', label: 'Parent', sub: 'Sunita · linked to Aarav' },
  { role: 'SCHOOL_ADMIN', who: 'harjeet', label: 'School', sub: 'DPS Pune admin' },
  { role: 'COUNSELOR', who: 'ananya', label: 'Counsellor', sub: 'Ananya Deshmukh' },
  { role: 'PLATFORM_ADMIN', who: 'kabir', label: 'Platform admin', sub: 'Revenue and users' },
];

export const LoginPage: React.FC = () => {
  const { login, demoLogin } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const next = params.get('next');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [show, setShow] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [demoLoading, setDemoLoading] = useState<string | null>(null);

  const goHome = async () => {
    const me = await ApiService.getMe().catch(() => null);
    navigate(next || homePathForRole(me?.user?.role), { replace: true });
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!email.trim() || !password) {
      setError('Enter your email and password.');
      return;
    }
    setLoading(true);
    try {
      await login({ email: email.trim(), password });
      await goHome();
    } catch (err: any) {
      setError(err.message === 'Invalid credentials' ? 'That email and password don’t match. Please try again.' : err.message || 'Could not log in.');
    } finally {
      setLoading(false);
    }
  };

  const tryDemo = async (role: string) => {
    setDemoLoading(role);
    setError(null);
    try {
      await demoLogin(role);
      navigate(next || homePathForRole(role), { replace: true });
    } catch (err: any) {
      setError(err.message || 'Demo login failed. Is the server running?');
    } finally {
      setDemoLoading(null);
    }
  };

  return (
    <AuthShell pose="wave" panelTitle="Welcome back" panelBody="Pick up your plan where you left it. Dhruv has been keeping your place.">
      <div className="flex flex-col gap-7">
        <div className="flex flex-col gap-2">
          <h1 className="font-display text-[32px] font-bold tracking-tight">Log in</h1>
          <p className="text-ink-2">New here? <Link to="/start" className="link">Start the free test</Link> — no account needed.</p>
        </div>
        <form onSubmit={submit} noValidate className="flex flex-col gap-5">
          {error && <Alert>{error}</Alert>}
          <Field label="Email" htmlFor="login-email">
            <input id="login-email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} className="field-input" />
          </Field>
          <Field label="Password" htmlFor="login-password">
            <div className="relative">
              <input id="login-password" type={show ? 'text' : 'password'} autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} className="field-input pr-12" />
              <button type="button" onClick={() => setShow((v) => !v)} aria-label={show ? 'Hide password' : 'Show password'} className="absolute right-1.5 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-lg text-ink-3 hover:bg-mist">
                {show ? <EyeOff className="h-5 w-5" aria-hidden="true" /> : <Eye className="h-5 w-5" aria-hidden="true" />}
              </button>
            </div>
          </Field>
          <Button type="submit" size="lg" loading={loading}>Log in</Button>
          <p className="text-center text-[15px] text-ink-2">No account? <Link to={`/register${next ? `?next=${encodeURIComponent(next)}` : ''}`} className="link">Create one</Link></p>
        </form>

        <section aria-labelledby="demo-title" className="flex flex-col gap-3 rounded-2xl bg-mist p-5">
          <div>
            <h2 id="demo-title" className="font-bold">Try a demo account</h2>
            <p className="text-sm text-ink-3">Explore FuturePath as any role in one tap.</p>
          </div>
          <div className="grid gap-2 sm:grid-cols-2">
            {DEMOS.map((d) => (
              <button
                key={d.role}
                type="button"
                onClick={() => tryDemo(d.role)}
                disabled={!!demoLoading}
                className="flex min-h-[56px] items-center gap-3 rounded-xl border border-line bg-white px-3 py-2 text-left hover:border-royal-300 disabled:opacity-60"
              >
                <Character who={d.who} size={40} animate={false} />
                <span className="flex min-w-0 flex-col">
                  <span className="text-[15px] font-semibold">{demoLoading === d.role ? 'Opening…' : d.label}</span>
                  <span className="truncate text-[13px] text-ink-3">{d.sub}</span>
                </span>
              </button>
            ))}
          </div>
        </section>
      </div>
    </AuthShell>
  );
};
