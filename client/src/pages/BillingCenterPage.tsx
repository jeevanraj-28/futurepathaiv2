import React, { useEffect, useState } from 'react';
import { Printer } from 'lucide-react';
import { ApiService } from '../services/api';
import { useAuth } from '../context/auth';
import { useCheckout } from '../context/checkout';
import { PLAN_INFO } from '../lib/plans';
import { Alert, Badge, Button, Modal, PageHeader, Skeleton, StateMessage } from '../components/ui';
import { formatINR } from '../lib/utils';

export const BillingCenterPage: React.FC = () => {
  const { subscription, refreshUser } = useAuth();
  const { openCheckout } = useCheckout();
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [confirming, setConfirming] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [msg, setMsg] = useState<{ tone: 'leaf' | 'danger'; text: string } | null>(null);
  const free = !subscription || subscription.planCode === 'FREE';

  useEffect(() => {
    ApiService.getInvoices()
      .then((res) => setInvoices(res.invoices || []))
      .catch(() => setInvoices([]))
      .finally(() => setLoading(false));
  }, []);

  const cancel = async () => {
    setCancelling(true);
    try {
      const res = await ApiService.request<{ success: boolean; message: string }>('/billing/cancel', { method: 'POST' });
      setMsg({ tone: 'leaf', text: res.message });
      await refreshUser();
    } catch (err: any) {
      setMsg({ tone: 'danger', text: err.message || 'We couldn’t cancel the plan. Please contact support.' });
    } finally {
      setCancelling(false);
      setConfirming(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Plan and billing" subtitle="Your plan, payments and GST receipts." />
      {msg && <Alert tone={msg.tone}>{msg.text}</Alert>}

      <section className="flex flex-wrap items-center justify-between gap-5 rounded-4xl border border-line bg-white p-6 sm:p-8">
        <div className="flex flex-col gap-2">
          <span className="text-sm font-bold uppercase tracking-[0.08em] text-ink-3">Current plan</span>
          <span className="font-display text-3xl font-bold">{subscription?.planName || 'Free Explorer'}</span>
          <span className="text-[15px] text-ink-2">
            {free ? 'Free forever. Upgrade any time for the full report and plan.' : subscription?.endDate ? `Renews or ends on ${new Date(subscription.endDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}. We’ll remind you first.` : 'Active'}
          </span>
        </div>
        <div className="flex flex-wrap gap-2.5">
          {free ? (
            <>
              <Button onClick={() => openCheckout('PREMIUM_STUDENT')}>Upgrade to Premium · {formatINR(PLAN_INFO.PREMIUM_STUDENT.price)}/yr</Button>
              <Button variant="secondary" to="/pricing">Compare plans</Button>
            </>
          ) : (
            <>
              <Button variant="secondary" to="/pricing">Change plan</Button>
              <Button variant="danger" onClick={() => setConfirming(true)}>Cancel plan</Button>
            </>
          )}
        </div>
      </section>

      <section aria-labelledby="invoices-title" className="card flex flex-col gap-4 p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 id="invoices-title" className="text-lg font-bold">Payments and receipts</h2>
          {invoices.length > 0 && <Button variant="secondary" size="sm" onClick={() => window.print()}><Printer className="h-4 w-4" aria-hidden="true" />Print receipts</Button>}
        </div>
        {loading ? <Skeleton className="h-40 rounded-2xl" /> : invoices.length === 0 ? (
          <StateMessage compact pose="relax" title="No payments yet" body="Receipts with GST details appear here after you buy a plan." />
        ) : (
          <div role="region" aria-label="Payments and receipts" tabIndex={0} className="overflow-x-auto rounded-2xl border border-line">
            <table className="w-full min-w-[620px] border-collapse text-left text-[15px]">
              <thead className="bg-mist"><tr>{['Receipt', 'Plan', 'Amount (incl. GST)', 'Status', 'Date'].map((h) => <th key={h} scope="col" className="px-4 py-3 text-sm font-bold text-ink-2">{h}</th>)}</tr></thead>
              <tbody>
                {invoices.map((inv) => (
                  <tr key={inv.receiptNumber} className="border-t border-line">
                    <td className="px-4 py-3 font-mono text-sm">{inv.receiptNumber}</td>
                    <td className="px-4 py-3">{PLAN_INFO[inv.planCode]?.name || inv.planCode}</td>
                    <td className="px-4 py-3 font-semibold">{formatINR(inv.amountINR)}</td>
                    <td className="px-4 py-3"><Badge tone={inv.status === 'SUCCESS' ? 'leaf' : 'saffron'}>{inv.status === 'SUCCESS' ? 'Paid' : inv.status}</Badge></td>
                    <td className="px-4 py-3 text-ink-2">{new Date(inv.date).toLocaleDateString('en-IN')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {confirming && (
        <Modal title="Cancel plan" onClose={() => setConfirming(false)} width="max-w-md">
          <div className="flex flex-col gap-4 p-6">
            <h2 className="font-display text-2xl font-bold">Cancel {subscription?.planName}?</h2>
            <p className="leading-relaxed text-ink-2">You’ll move to the free Explorer plan. Your report and saved careers stay; premium features stop.</p>
            <div className="flex flex-wrap gap-2.5">
              <Button variant="danger" onClick={cancel} loading={cancelling}>Yes, cancel plan</Button>
              <Button variant="secondary" onClick={() => setConfirming(false)}>Keep my plan</Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
