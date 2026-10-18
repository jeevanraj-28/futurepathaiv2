import React, { useState, useEffect } from 'react';
import { ApiService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  CreditCard,
  FileText,
  CheckCircle2,
  Download,
  AlertCircle,
  ShieldCheck,
  Sparkles
} from 'lucide-react';

export const BillingCenterPage: React.FC<{ onOpenCheckout?: (planCode: string) => void }> = ({ onOpenCheckout }) => {
  const { user, subscription, refreshUser } = useAuth();
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);
  const [cancelMessage, setCancelMessage] = useState<string | null>(null);

  const fetchInvoices = async () => {
    try {
      const res = await ApiService.getInvoices();
      if (res.success && res.invoices) {
        setInvoices(res.invoices);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

  const handleCancel = async () => {
    setCancelling(true);
    try {
      const res = await ApiService.request<{ success: boolean; message: string }>('/billing/cancel', {
        method: 'POST'
      });
      if (res.success) {
        setCancelMessage(res.message);
        await refreshUser();
      }
    } catch (err: any) {
      console.error(err);
    } finally {
      setCancelling(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 space-y-8">
        
        {/* Header */}
        <div className="pb-6 border-b border-slate-800 space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/10 text-cyan-400 text-xs font-semibold border border-brand-500/20">
            <CreditCard className="w-3.5 h-3.5" />
            <span>Subscription & Financial History</span>
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight">
            Billing & Invoices Center
          </h1>
          <p className="text-xs text-slate-400">
            Manage your commercial subscription, payment receipts, and GST invoices.
          </p>
        </div>

        {cancelMessage && (
          <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            <span>{cancelMessage}</span>
          </div>
        )}

        {/* Current Plan Overview Card */}
        <div className="p-6 rounded-2xl glass-panel bg-slate-900 border border-slate-800 shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-[11px] font-semibold text-cyan-400 uppercase tracking-wider">
                Current Subscription Tier
              </span>
              <h3 className="text-xl font-bold text-white mt-1">
                {subscription?.planName || 'Free Explorer'}
              </h3>
              <p className="text-xs text-slate-400">
                Status: <strong className="text-emerald-400">{subscription?.isActive ? 'Active' : 'Inactive'}</strong>
                {subscription?.endDate && ` • Valid until ${new Date(subscription.endDate).toLocaleDateString('en-IN')}`}
              </p>
            </div>

            <div className="flex items-center gap-3">
              {subscription?.planCode === 'FREE' ? (
                <button
                  onClick={() => onOpenCheckout ? onOpenCheckout('PREMIUM_STUDENT') : null}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-brand-600 to-cyan-500 hover:from-brand-500 hover:to-cyan-400 text-white font-bold text-xs shadow-md glow-blue transition-all"
                >
                  Upgrade to Premium (₹999/yr)
                </button>
              ) : (
                <button
                  onClick={handleCancel}
                  disabled={cancelling}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-rose-300 transition-colors"
                >
                  Cancel Auto-Renew
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Invoices & Receipts Table */}
        <div className="space-y-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <FileText className="w-4 h-4 text-cyan-400" />
            <span>Payment History & GST Receipts ({invoices.length})</span>
          </h3>

          <div className="rounded-2xl glass-panel bg-slate-900 border border-slate-800 overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950 text-slate-400 font-semibold uppercase tracking-wider border-b border-slate-800">
                  <tr>
                    <th className="p-4">Receipt No</th>
                    <th className="p-4">Plan</th>
                    <th className="p-4">Amount</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">Payment Date</th>
                    <th className="p-4">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-300">
                  {invoices.length > 0 ? (
                    invoices.map((inv, idx) => (
                      <tr key={idx} className="hover:bg-slate-850/40">
                        <td className="p-4 font-mono font-medium text-slate-300">{inv.receiptNumber}</td>
                        <td className="p-4 font-bold text-white">{inv.planCode}</td>
                        <td className="p-4 font-bold text-emerald-400">₹{inv.amountINR}</td>
                        <td className="p-4">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                            {inv.status}
                          </span>
                        </td>
                        <td className="p-4 text-slate-400">
                          {new Date(inv.date).toLocaleDateString('en-IN')}
                        </td>
                        <td className="p-4">
                          <button
                            onClick={() => window.print()}
                            className="text-cyan-400 hover:underline flex items-center gap-1 font-semibold"
                          >
                            <Download className="w-3 h-3" />
                            <span>Download PDF</span>
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-slate-400">
                        No previous payment transactions recorded yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
