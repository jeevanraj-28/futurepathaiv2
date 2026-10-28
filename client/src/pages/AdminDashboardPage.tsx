import React, { useEffect, useState } from 'react';
import { Pencil, Search } from 'lucide-react';
import { ApiService } from '../services/api';
import { Alert, Badge, Button, PageHeader, ProgressBar, Skeleton } from '../components/ui';
import { formatINR } from '../lib/utils';

const ROLE_LABEL: Record<string, string> = {
  STUDENT: 'Student', PARENT: 'Parent', SCHOOL_ADMIN: 'School', COUNSELOR: 'Counsellor', PLATFORM_ADMIN: 'Admin',
};

export const AdminDashboardPage: React.FC = () => {
  const [metrics, setMetrics] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [logs, setLogs] = useState<any[]>([]);
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<string | null>(null);
  const [price, setPrice] = useState('');
  const [msg, setMsg] = useState<{ tone: 'leaf' | 'danger'; text: string } | null>(null);
  const [query, setQuery] = useState('');

  const load = () =>
    Promise.all([
      ApiService.getAdminMetrics().catch(() => null),
      ApiService.getAdminUsers().catch(() => null),
      ApiService.request<{ success: boolean; logs: any[] }>('/admin/audit-logs').catch(() => null),
      ApiService.getPlans().catch(() => null),
    ]).then(([m, u, l, p]: any) => {
      setMetrics(m?.metrics || null);
      setUsers(u?.users || []);
      setLogs(l?.logs || []);
      setPlans(p?.plans || []);
    }).finally(() => setLoading(false));

  useEffect(() => { load(); }, []);

  const savePrice = async (code: string) => {
    const value = Number(price);
    if (!Number.isFinite(value) || value < 0) {
      setMsg({ tone: 'danger', text: 'Enter a valid price in rupees.' });
      return;
    }
    try {
      const res = await ApiService.updatePlanPrice(code, value);
      setMsg({ tone: 'leaf', text: res.message });
      setEditing(null);
      load();
    } catch (err: any) {
      setMsg({ tone: 'danger', text: err.message || 'Price update failed.' });
    }
  };

  if (loading) return <div className="flex flex-col gap-6"><Skeleton className="h-12 w-72" /><div className="grid gap-4 sm:grid-cols-4">{[0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-28 rounded-2xl" />)}</div><Skeleton className="h-96 rounded-3xl" /></div>;

  const breakdown = metrics?.breakdown || {};
  const total = metrics?.totalUsers || 0;
  const shownUsers = users.filter((u) => `${u.name} ${u.email} ${u.role} ${u.plan}`.toLowerCase().includes(query.toLowerCase()));

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Platform admin" subtitle="Revenue, users, pricing and security activity." />
      {msg && <Alert tone={msg.tone}>{msg.text}</Alert>}

      {metrics && (
        <section aria-label="Key numbers" className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {[
            ['Total revenue', formatINR(metrics.totalRevenueINR), 'All successful payments'],
            ['MRR (estimate)', formatINR(metrics.mrrEstimateINR), `ARR ${formatINR(metrics.arrEstimateINR)}`],
            ['Paid subscriptions', String(metrics.activeSubscriptions), `${metrics.conversionRatePercent}% of users`],
            ['Counsellor bookings', String(metrics.totalCounselorBookings ?? 0), `AI cost est. ${formatINR(metrics.aiUsageCostEstINR)}`],
          ].map(([k, v, s]) => (
            <div key={k} className="card flex flex-col gap-1 p-5">
              <span className="text-sm text-ink-3">{k}</span>
              <span className="font-display text-3xl font-bold">{v}</span>
              <span className="text-sm text-ink-3">{s}</span>
            </div>
          ))}
        </section>
      )}

      <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        <section aria-labelledby="mix-title" className="card flex flex-col gap-4 p-6">
          <h2 id="mix-title" className="text-lg font-bold">Users by role · {total} total</h2>
          {[['Students', breakdown.students], ['Parents', breakdown.parents], ['Schools', breakdown.schools], ['Counsellors', breakdown.counselors]].map(([label, n]) => (
            <div key={label as string} className="flex flex-col gap-1.5">
              <div className="flex justify-between text-[15px]"><span>{label}</span><span className="font-bold">{n ?? 0}</span></div>
              <ProgressBar value={Number(n) || 0} max={total || 1} label={label as string} />
            </div>
          ))}
        </section>

        <section aria-labelledby="plans-title" className="card flex flex-col gap-3 p-6">
          <h2 id="plans-title" className="text-lg font-bold">Plan prices</h2>
          <ul className="divide-y divide-line">
            {plans.map((p) => (
              <li key={p.code} className="flex flex-wrap items-center justify-between gap-3 py-3">
                <span className="flex flex-col"><span className="font-semibold">{p.name}</span><span className="text-sm text-ink-3">{p.code}</span></span>
                {editing === p.code ? (
                  <form onSubmit={(e) => { e.preventDefault(); savePrice(p.code); }} className="flex items-center gap-2">
                    <label htmlFor={`price-${p.code}`} className="sr-only">New price for {p.name}</label>
                    <input id={`price-${p.code}`} type="number" min={0} value={price} onChange={(e) => setPrice(e.target.value)} className="field-input w-32 py-2" autoFocus />
                    <Button type="submit" size="sm">Save</Button>
                    <Button size="sm" variant="secondary" onClick={() => setEditing(null)}>Cancel</Button>
                  </form>
                ) : (
                  <span className="flex items-center gap-3">
                    <span className="font-bold">{formatINR(p.priceINR)}</span>
                    <button type="button" onClick={() => { setEditing(p.code); setPrice(String(p.priceINR)); }} aria-label={`Edit price for ${p.name}`} className="flex h-10 w-10 items-center justify-center rounded-lg border border-line hover:bg-mist">
                      <Pencil className="h-4 w-4" aria-hidden="true" />
                    </button>
                  </span>
                )}
              </li>
            ))}
          </ul>
        </section>
      </div>

      <section aria-labelledby="users-title" className="card flex flex-col gap-4 p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 id="users-title" className="text-lg font-bold">Recent users</h2>
          <div className="relative w-full max-w-xs">
            <label htmlFor="user-search" className="sr-only">Search users</label>
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-3" aria-hidden="true" />
            <input id="user-search" type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search users" className="field-input py-2.5 pl-10" />
          </div>
        </div>
        <div role="region" aria-label="Recent users" tabIndex={0} className="overflow-x-auto rounded-2xl border border-line">
          <table className="w-full min-w-[720px] border-collapse text-left text-[15px]">
            <thead className="bg-mist"><tr>{['User', 'Role', 'Class', 'Plan', 'Profile', 'Joined'].map((h) => <th key={h} scope="col" className="px-4 py-3 text-sm font-bold text-ink-2">{h}</th>)}</tr></thead>
            <tbody>
              {shownUsers.map((u) => (
                <tr key={u.id} className="border-t border-line">
                  <td className="px-4 py-3"><span className="block font-semibold">{u.name}</span><span className="text-sm text-ink-3">{u.email}</span></td>
                  <td className="px-4 py-3"><Badge>{ROLE_LABEL[u.role] || u.role}</Badge></td>
                  <td className="px-4 py-3 text-ink-2">{u.class === 'CLASS_12' ? '11–12' : u.class === 'CLASS_10' ? '9–10' : '—'}</td>
                  <td className="px-4 py-3">{u.plan}</td>
                  <td className="px-4 py-3">{u.role === 'STUDENT' ? `${u.completionScore}%` : '—'}</td>
                  <td className="px-4 py-3 text-sm text-ink-3">{new Date(u.createdAt).toLocaleDateString('en-IN')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section aria-labelledby="audit-title" className="card flex flex-col gap-3 p-6">
        <h2 id="audit-title" className="text-lg font-bold">Security and audit log</h2>
        {logs.length === 0 ? <p className="text-ink-3">No activity yet.</p> : (
          <ul className="divide-y divide-line">
            {logs.slice(0, 20).map((l) => (
              <li key={l.id} className="flex flex-wrap items-center justify-between gap-2 py-3 text-[15px]">
                <span><strong>{l.action?.replace(/_/g, ' ').toLowerCase()}</strong> · {l.resource} · {l.user?.email || 'system'}</span>
                <span className="text-sm text-ink-3">{new Date(l.createdAt).toLocaleString('en-IN')}{l.ipAddress ? ` · ${l.ipAddress}` : ''}</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
};
