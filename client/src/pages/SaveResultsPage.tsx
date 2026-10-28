import React, { useMemo, useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/auth';
import { ApiService } from '../services/api';
import type { AssessmentQuestion } from '../types';
import { Logo, Dhruv } from '../components/brand';
import { Alert, Badge, Button, Field } from '../components/ui';
import { plainDimension } from '../lib/utils';
import { answeredCount, clearProgress, loadProgress, toServerClass } from '../lib/testProgress';

/** Top areas from the answers on this device — a real first look before the account exists. */
const topAreas = (answers: Record<string, number>): string[] => {
  let qs: AssessmentQuestion[] = [];
  try { qs = JSON.parse(localStorage.getItem('futurepath_questions_cache') || '[]'); } catch { qs = []; }
  const totals: Record<string, { sum: number; n: number }> = {};
  qs.forEach((q) => {
    const pick = answers[q.id];
    if (pick === undefined) return;
    const max = Math.max(...q.options.map((o) => o.score)) || 1;
    const t = (totals[q.dimension] ||= { sum: 0, n: 0 });
    t.sum += (q.options[pick]?.score ?? 0) / max;
    t.n += 1;
  });
  return Object.entries(totals)
    .sort((a, b) => b[1].sum / b[1].n - a[1].sum / a[1].n)
    .slice(0, 2)
    .map(([d]) => plainDimension(d));
};

export const SaveResultsPage: React.FC = () => {
  const { user, register } = useAuth();
  const navigate = useNavigate();
  const progress = useMemo(() => loadProgress(), []);
  const areas = useMemo(() => topAreas(progress.answers), [progress]);
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const persist = async () => {
    const res = await ApiService.submitAssessment(progress.answers);
    if (progress.board) {
      await ApiService.updateStudentProfile({ currentClass: toServerClass(progress.grade), board: progress.board }).catch(() => undefined);
    }
    if (res.success) {
      clearProgress();
      navigate('/assessment/results', { replace: true });
    }
  };

  const saveSignedIn = () => {
    setSaving(true);
    setError(null);
    persist().catch((err) => setError(err.message || 'Could not save your results.')).finally(() => setSaving(false));
  };

  if (answeredCount(progress) === 0) return <Navigate to="/start" replace />;

  const set = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const v: Record<string, string> = {};
    if (!form.name.trim()) v.name = 'Enter your name.';
    if (!/^\S+@\S+\.\S+$/.test(form.email.trim())) v.email = 'Enter a valid email address.';
    if (form.password.length < 8) v.password = 'Use at least 8 characters.';
    if (form.phone && !/^\d{10}$/.test(form.phone.replace(/\s/g, ''))) v.phone = 'Enter a 10-digit mobile number.';
    setErrors(v);
    if (Object.keys(v).length) return;
    setSaving(true);
    setError(null);
    try {
      await register({
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
        phone: form.phone ? `+91${form.phone.replace(/\s/g, '')}` : undefined,
        role: 'STUDENT',
        currentClass: toServerClass(progress.grade),
      });
      await persist();
    } catch (err: any) {
      setError(err.message === 'Email is already registered'
        ? 'This email already has an account. Log in to save your results to it.'
        : err.message || 'We couldn’t save your results. Your answers are still on this device.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-mist">
      <header className="border-b border-line bg-white">
        <div className="mx-auto flex h-[72px] max-w-[1120px] items-center px-6">
          <Link to="/" aria-label="FuturePath AI home"><Logo height={28} /></Link>
        </div>
      </header>
      <main id="main" className="mx-auto grid max-w-[1120px] items-start gap-10 px-5 py-10 sm:px-6 lg:grid-cols-2 lg:py-14">
        <section className="flex flex-col gap-6">
          <div className="flex items-center gap-4">
            <Dhruv eager pose="celebrate" size={140} decorative />
            <div className="flex flex-col gap-1.5">
              <p className="text-sm font-bold text-leaf-600">Test complete · {answeredCount(progress)} of 40</p>
              <h1 className="font-display text-4xl font-bold leading-tight tracking-tight">Your results are ready!</h1>
            </div>
          </div>
          <div className="card flex flex-col gap-4 p-6">
            <p className="text-sm font-bold uppercase tracking-[0.06em] text-ink-3">A first look</p>
            {areas.length > 0 && (
              <div className="flex flex-col gap-2 rounded-2xl bg-royal-50 p-5">
                <span className="text-lg font-bold">Your strongest areas</span>
                <div className="flex flex-wrap gap-2">{areas.map((a) => <Badge key={a} tone="royal" className="bg-white">{a}</Badge>)}</div>
              </div>
            )}
            <div aria-hidden="true" className="pointer-events-none flex select-none flex-col gap-2.5 blur-[5px]">
              {['Recommended stream', 'Top career match', 'Second career match'].map((t) => (
                <div key={t} className="flex justify-between rounded-xl bg-mist px-4 py-3.5"><span className="font-bold">{t}</span><span className="font-bold text-leaf-700">Strong fit</span></div>
              ))}
            </div>
            <p className="text-[15px] text-ink-2">Save your results to see your recommended stream, top careers and why each one fits.</p>
          </div>
        </section>

        <section aria-labelledby="save-title" className="flex flex-col gap-5 rounded-4xl border border-line bg-white p-7 shadow-card sm:p-9">
          {user && user.role !== 'STUDENT' ? (
            <>
              <h2 id="save-title" className="font-display text-2xl font-bold">Results belong to a student account</h2>
              <p className="text-ink-2">You’re logged in as {user.name}. Log in as the student to save these answers.</p>
            </>
          ) : user ? (
            <>
              <h2 id="save-title" className="font-display text-2xl font-bold">Save to your account</h2>
              <p className="text-ink-2">You’re logged in as {user.name}. Your answers will be added to this account.</p>
              {error && <Alert>{error}</Alert>}
              <Button size="lg" onClick={saveSignedIn} loading={saving}>Save and see my report</Button>
            </>
          ) : (
            <form onSubmit={submit} noValidate className="flex flex-col gap-5">
              <div className="flex flex-col gap-1.5">
                <h2 id="save-title" className="font-display text-[28px] font-bold tracking-tight">Save your results</h2>
                <p className="text-ink-2">Have an account? <Link to="/login?next=/assessment/save" className="link">Log in to save</Link></p>
              </div>
              {error && <Alert>{error}</Alert>}
              <Field label="Your name" htmlFor="sv-name" error={errors.name}>
                <input id="sv-name" autoComplete="name" value={form.name} onChange={set('name')} className="field-input" aria-invalid={!!errors.name} />
              </Field>
              <Field label="Email" htmlFor="sv-email" error={errors.email}>
                <input id="sv-email" type="email" autoComplete="email" value={form.email} onChange={set('email')} className="field-input" aria-invalid={!!errors.email} />
              </Field>
              <Field label="Create a password" htmlFor="sv-pass" error={errors.password} hint="At least 8 characters.">
                <input id="sv-pass" type="password" autoComplete="new-password" value={form.password} onChange={set('password')} className="field-input" aria-invalid={!!errors.password} />
              </Field>
              <Field label="Mobile number (optional)" htmlFor="sv-phone" error={errors.phone} hint="For deadline reminders. No spam calls, ever.">
                <div className="flex gap-2">
                  <span className="flex items-center rounded-[10px] border border-line-strong bg-mist px-3.5 font-semibold">+91</span>
                  <input id="sv-phone" type="tel" inputMode="numeric" autoComplete="tel-national" value={form.phone} onChange={set('phone')} className="field-input" aria-invalid={!!errors.phone} />
                </div>
              </Field>
              <div className="flex gap-3 rounded-2xl bg-saffron-50 p-4 text-[15px] leading-relaxed text-saffron-900">
                <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
                <span><strong>Under 18?</strong> Your report stays private. A parent can see it only after linking to your account with your OK.</span>
              </div>
              <Button type="submit" size="lg" loading={saving}>Save and see my report</Button>
              <p className="text-sm text-ink-3">By saving you agree to our <Link to="/terms" className="link">terms</Link> and <Link to="/privacy-policy" className="link">privacy policy</Link>. Your data is never sold.</p>
            </form>
          )}
        </section>
      </main>
    </div>
  );
};
