import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/auth';
import { AuthShell } from '../components/layout/AuthShell';
import { Alert, Button, ChoiceTile, Field } from '../components/ui';
import { Character } from '../components/Character';
import { homePathForRole } from '../components/layout/nav';

export const RegisterPage: React.FC = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const next = params.get('next');
  const [role, setRole] = useState<'STUDENT' | 'PARENT'>(params.get('role') === 'PARENT' ? 'PARENT' : 'STUDENT');
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '', currentClass: 'CLASS_10' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const set = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = 'Enter your name.';
    if (!/^\S+@\S+\.\S+$/.test(form.email.trim())) e.email = 'Enter a valid email address.';
    if (form.password.length < 8) e.password = 'Use at least 8 characters.';
    if (form.phone && !/^\d{10}$/.test(form.phone.replace(/\s/g, ''))) e.phone = 'Enter a 10-digit mobile number.';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!validate()) return;
    setLoading(true);
    try {
      await register({
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
        phone: form.phone ? `+91${form.phone.replace(/\s/g, '')}` : undefined,
        role,
        currentClass: role === 'STUDENT' ? form.currentClass : undefined,
      });
      navigate(next || (role === 'STUDENT' ? '/start' : homePathForRole(role)), { replace: true });
    } catch (err: any) {
      setError(err.message || 'Could not create your account.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell pose="backpack" panelTitle="Let’s find what fits you" panelBody="Create a free account to save your results, your plan and your saved careers.">
      <form onSubmit={submit} noValidate className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <h1 className="font-display text-[32px] font-bold tracking-tight">Create your account</h1>
          <p className="text-ink-2">Already have one? <Link to="/login" className="link">Log in</Link></p>
        </div>
        {error && <Alert>{error}</Alert>}
        <fieldset className="flex flex-col gap-3">
          <legend className="mb-3 text-[15px] font-semibold">I am a</legend>
          <div className="grid grid-cols-2 gap-3">
            <ChoiceTile selected={role === 'STUDENT'} onClick={() => setRole('STUDENT')} className="flex items-center gap-3 p-3">
              <Character who="aarav" size={40} animate={false} /><span className="font-semibold">Student</span>
            </ChoiceTile>
            <ChoiceTile selected={role === 'PARENT'} onClick={() => setRole('PARENT')} className="flex items-center gap-3 p-3">
              <Character who="sunita" size={40} animate={false} /><span className="font-semibold">Parent</span>
            </ChoiceTile>
          </div>
        </fieldset>
        <Field label="Full name" htmlFor="reg-name" error={errors.name}>
          <input id="reg-name" autoComplete="name" value={form.name} onChange={set('name')} className="field-input" aria-invalid={!!errors.name} />
        </Field>
        <Field label="Email" htmlFor="reg-email" error={errors.email}>
          <input id="reg-email" type="email" autoComplete="email" value={form.email} onChange={set('email')} className="field-input" aria-invalid={!!errors.email} />
        </Field>
        <Field label="Password" htmlFor="reg-password" error={errors.password} hint="At least 8 characters.">
          <input id="reg-password" type="password" autoComplete="new-password" value={form.password} onChange={set('password')} className="field-input" aria-invalid={!!errors.password} />
        </Field>
        <Field label="Mobile number (optional)" htmlFor="reg-phone" error={errors.phone} hint="For exam and deadline reminders. No spam calls.">
          <div className="flex gap-2">
            <span className="flex items-center rounded-[10px] border border-line-strong bg-mist px-3.5 font-semibold">+91</span>
            <input id="reg-phone" type="tel" inputMode="numeric" autoComplete="tel-national" value={form.phone} onChange={set('phone')} className="field-input" aria-invalid={!!errors.phone} />
          </div>
        </Field>
        {role === 'STUDENT' && (
          <fieldset className="flex flex-col gap-3">
            <legend className="mb-3 text-[15px] font-semibold">Class</legend>
            <div className="grid grid-cols-2 gap-3">
              {[['CLASS_10', 'Class 9–10'], ['CLASS_12', 'Class 11–12']].map(([v, l]) => (
                <ChoiceTile key={v} selected={form.currentClass === v} onClick={() => setForm((f) => ({ ...f, currentClass: v }))} className="px-4 font-semibold">{l}</ChoiceTile>
              ))}
            </div>
          </fieldset>
        )}
        <Button type="submit" size="lg" loading={loading}>Create account</Button>
        <p className="text-sm leading-relaxed text-ink-3">
          By continuing you agree to our <Link to="/terms" className="link">terms</Link> and <Link to="/privacy-policy" className="link">privacy policy</Link>. Students under 18 need a parent’s consent before results are shared.
        </p>
      </form>
    </AuthShell>
  );
};
