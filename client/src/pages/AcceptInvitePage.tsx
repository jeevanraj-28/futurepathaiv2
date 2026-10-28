import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ApiService } from '../services/api';
import { useAuth } from '../context/auth';
import { AuthShell } from '../components/layout/AuthShell';
import { Alert, Button, Field, Spinner, StateMessage } from '../components/ui';

/** Students imported by their school land here from the invite link to set a password. */
export const AcceptInvitePage: React.FC = () => {
  const { token = '' } = useParams();
  const { refreshUser } = useAuth();
  const navigate = useNavigate();
  const [invite, setInvite] = useState<{ name: string; email: string; schoolName: string | null } | null>(null);
  const [invalid, setInvalid] = useState(false);
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    ApiService.getInvite(token)
      .then((res) => setInvite(res.invite))
      .catch(() => setInvalid(true));
  }, [token]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 8) return setError('Use at least 8 characters.');
    if (password !== confirm) return setError('The two passwords don’t match.');
    setSaving(true);
    setError(null);
    try {
      const res = await ApiService.acceptInvite(token, password);
      ApiService.setToken(res.token);
      await refreshUser();
      navigate('/start', { replace: true });
    } catch (err: any) {
      setError(err.message || 'We couldn’t set up your account.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <AuthShell pose="backpack" panelTitle="Your school set you up" panelBody="Choose a password and you can start the discovery test straight away.">
      {invalid ? (
        <StateMessage
          pose="think"
          title="This invitation doesn’t work any more"
          body="It may have expired or already been used. Ask your teacher for a new one, or log in if you’ve set a password already."
          action={<Button to="/login">Log in</Button>}
        />
      ) : !invite ? (
        <Spinner label="Checking your invitation" />
      ) : (
        <form onSubmit={submit} noValidate className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <h1 className="font-display text-[32px] font-bold tracking-tight">Welcome, {invite.name.split(' ')[0]}</h1>
            <p className="text-ink-2">
              {invite.schoolName ? `${invite.schoolName} added you to FuturePath.` : 'Your school added you to FuturePath.'} You’ll log in with <strong>{invite.email}</strong>.
            </p>
          </div>
          {error && <Alert>{error}</Alert>}
          <Field label="Choose a password" htmlFor="inv-pass" hint="At least 8 characters.">
            <input id="inv-pass" type="password" autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} className="field-input" />
          </Field>
          <Field label="Type it again" htmlFor="inv-confirm">
            <input id="inv-confirm" type="password" autoComplete="new-password" value={confirm} onChange={(e) => setConfirm(e.target.value)} className="field-input" />
          </Field>
          <Button type="submit" size="lg" loading={saving}>Set password and start</Button>
          <p className="text-sm text-ink-3">Not you? <Link to="/login" className="link">Log in with a different account</Link></p>
        </form>
      )}
    </AuthShell>
  );
};
