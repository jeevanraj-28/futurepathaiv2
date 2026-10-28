import React, { useEffect, useState } from 'react';
import { ShieldCheck } from 'lucide-react';
import { ApiService } from '../services/api';
import { Alert, Badge, Button } from './ui';
import { Character } from './Character';

type Link = Awaited<ReturnType<typeof ApiService.getParentLinks>>['links'][number];

/**
 * A student's control over parent access. With `pendingOnly`, it shows just the
 * requests waiting for an answer (student home); otherwise every link, with a
 * way to remove access (profile and settings).
 */
export const ParentLinks: React.FC<{ pendingOnly?: boolean; onChange?: () => void }> = ({ pendingOnly, onChange }) => {
  const [links, setLinks] = useState<Link[] | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = () =>
    ApiService.getParentLinks()
      .then((res) => setLinks(res.links))
      .catch(() => setLinks([]));

  useEffect(() => { load(); }, []);

  const act = async (id: string, action: 'approve' | 'reject' | 'remove') => {
    setBusy(id);
    setError(null);
    try {
      await ApiService.updateParentLink(id, action);
      await load();
      onChange?.();
    } catch (err: any) {
      setError(err.message || 'That didn’t save. Please try again.');
    } finally {
      setBusy(null);
    }
  };

  const shown = (links || []).filter((l) => !pendingOnly || l.status === 'PENDING');
  if (links === null || (pendingOnly && shown.length === 0)) return null;

  return (
    <section aria-labelledby="parent-links-title" className={pendingOnly ? 'flex flex-col gap-3.5 rounded-3xl border-2 border-saffron-500 bg-white p-6' : 'card flex flex-col gap-3.5 p-6 sm:p-8'}>
      <h2 id="parent-links-title" className="flex items-center gap-2 text-lg font-bold">
        <ShieldCheck className="h-5 w-5 text-leaf-600" aria-hidden="true" />
        {pendingOnly ? 'A parent wants to see your report' : 'Family access'}
      </h2>
      <p className="text-[15px] leading-relaxed text-ink-2">
        {pendingOnly
          ? 'They’ll see your report, matches and plan — not your chats with Dhruv. You can remove access any time.'
          : 'People who can see your report, matches and plan. Only you can approve or remove them.'}
      </p>
      {error && <Alert>{error}</Alert>}
      {shown.length === 0 ? (
        <p className="text-[15px] text-ink-3">No one is linked yet. A parent can send a request from their own FuturePath account.</p>
      ) : (
        <ul className="flex flex-col gap-2.5">
          {shown.map((l) => (
            <li key={l.id} className="flex flex-wrap items-center gap-3 rounded-2xl bg-mist p-3.5">
              <Character who="sunita" size={40} animate={false} />
              <span className="flex min-w-0 flex-1 flex-col">
                <span className="font-semibold">{l.parentName}</span>
                <span className="truncate text-sm text-ink-3">{l.parentEmail}</span>
              </span>
              {l.status === 'PENDING' ? (
                <span className="flex gap-2">
                  <Button size="sm" onClick={() => act(l.id, 'approve')} loading={busy === l.id}>Approve</Button>
                  <Button size="sm" variant="secondary" onClick={() => act(l.id, 'reject')} disabled={busy === l.id}>Decline</Button>
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Badge tone="leaf">Can see your report</Badge>
                  <Button size="sm" variant="danger" onClick={() => act(l.id, 'remove')} loading={busy === l.id}>Remove</Button>
                </span>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
};
