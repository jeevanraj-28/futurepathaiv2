import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { ApiService } from '../services/api';
import {
  X,
  ShieldCheck,
  CheckCircle2,
  Lock,
  CreditCard,
  QrCode,
  Building2,
  AlertCircle,
  Loader2,
  Sparkles
} from 'lucide-react';

interface CheckoutModalProps {
  planCode: string;
  onClose: () => void;
  onSuccess?: () => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({ planCode, onClose, onSuccess }) => {
  const { user, refreshUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'DETAILS' | 'PAYMENT' | 'SUCCESS'>('DETAILS');
  const [selectedMethod, setSelectedMethod] = useState<'UPI' | 'CARD' | 'NETBANKING'>('UPI');
  const [order, setOrder] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  // Plan pricing lookup
  const planInfo: Record<string, { name: string; price: number; period: string }> = {
    DISCOVERY: { name: 'Career Discovery Dossier', price: 299, period: 'one-time' },
    PREMIUM_STUDENT: { name: 'Premium Student Annual', price: 999, period: 'per year' },
    PREMIUM_PLUS: { name: 'Premium Plus & Parent Portal', price: 2499, period: 'per year' },
    SCHOOL_PILOT: { name: 'School Institutional Pilot', price: 19999, period: 'per year' }
  };

  const plan = planInfo[planCode] || { name: 'Premium Plan', price: 999, period: 'per year' };

  const handleInitiateOrder = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await ApiService.createOrder(planCode);
      if (res.success && res.order) {
        setOrder(res.order);
        setStep('PAYMENT');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to initialize payment gateway');
    } finally {
      setLoading(false);
    }
  };

  const handleSimulatePayment = async () => {
    if (!order) return;
    setLoading(true);
    setError(null);
    try {
      const mockPaymentId = `pay_${Date.now()}_${Math.floor(Math.random() * 100000)}`;
      const mockSignature = `sig_mock_${Date.now()}`;

      const res = await ApiService.verifyPayment({
        orderId: order.orderId,
        paymentId: mockPaymentId,
        signature: mockSignature
      });

      if (res.success) {
        await refreshUser();
        setStep('SUCCESS');
        if (onSuccess) onSuccess();
      }
    } catch (err: any) {
      setError(err.message || 'Payment verification failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-lg rounded-2xl glass-panel bg-slate-900 border border-slate-700 shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-brand-600/20 text-cyan-400 flex items-center justify-center border border-brand-500/30">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Razorpay Secure Checkout</h3>
              <p className="text-[11px] text-slate-400">256-bit Encrypted Transaction</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6">
          {error && (
            <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {step === 'DETAILS' && (
            <div className="space-y-6">
              <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/60">
                <span className="text-[11px] font-semibold text-cyan-400 uppercase tracking-wider">
                  Selected Package
                </span>
                <div className="flex items-center justify-between mt-1">
                  <h4 className="text-lg font-bold text-white">{plan.name}</h4>
                  <div className="text-right">
                    <span className="text-2xl font-black text-cyan-400">₹{plan.price}</span>
                    <span className="text-xs text-slate-400 block">/ {plan.period}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-2 text-xs text-slate-300">
                <div className="flex items-center justify-between py-1 border-b border-slate-800">
                  <span className="text-slate-400">Billed To</span>
                  <span className="font-medium text-white">{user?.name} ({user?.email})</span>
                </div>
                <div className="flex items-center justify-between py-1 border-b border-slate-800">
                  <span className="text-slate-400">Currency</span>
                  <span className="font-medium text-white">INR (Indian Rupee)</span>
                </div>
                <div className="flex items-center justify-between py-1 border-b border-slate-800">
                  <span className="text-slate-400">GST / Tax</span>
                  <span className="font-medium text-emerald-400">Included (Inclusive)</span>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-[11px] text-emerald-300 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 flex-shrink-0 text-emerald-400" />
                <span>Instant activation: Full psychometric dossier, AI mentor & roadmaps unlocked immediately upon payment.</span>
              </div>

              <button
                onClick={handleInitiateOrder}
                disabled={loading}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-brand-600 via-blue-600 to-cyan-500 hover:from-brand-500 hover:to-cyan-400 text-white font-bold text-sm shadow-lg glow-blue transition-all flex items-center justify-center gap-2"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                <span>Proceed to Pay ₹{plan.price}</span>
              </button>
            </div>
          )}

          {step === 'PAYMENT' && (
            <div className="space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div>
                  <span className="text-xs text-slate-400">Order ID</span>
                  <p className="text-xs font-mono text-cyan-300">{order?.orderId}</p>
                </div>
                <div className="text-right">
                  <span className="text-xs text-slate-400">Total Payable</span>
                  <p className="text-base font-bold text-white">₹{order?.amount}</p>
                </div>
              </div>

              {/* Payment Methods */}
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedMethod('UPI')}
                  className={`p-3 rounded-xl border text-center transition-all ${
                    selectedMethod === 'UPI'
                      ? 'border-cyan-400 bg-cyan-500/10 text-cyan-300'
                      : 'border-slate-800 bg-slate-800/40 text-slate-400 hover:bg-slate-800'
                  }`}
                >
                  <QrCode className="w-5 h-5 mx-auto mb-1 text-cyan-400" />
                  <span className="text-xs font-semibold block">UPI / QR</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedMethod('CARD')}
                  className={`p-3 rounded-xl border text-center transition-all ${
                    selectedMethod === 'CARD'
                      ? 'border-cyan-400 bg-cyan-500/10 text-cyan-300'
                      : 'border-slate-800 bg-slate-800/40 text-slate-400 hover:bg-slate-800'
                  }`}
                >
                  <CreditCard className="w-5 h-5 mx-auto mb-1 text-cyan-400" />
                  <span className="text-xs font-semibold block">Cards</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedMethod('NETBANKING')}
                  className={`p-3 rounded-xl border text-center transition-all ${
                    selectedMethod === 'NETBANKING'
                      ? 'border-cyan-400 bg-cyan-500/10 text-cyan-300'
                      : 'border-slate-800 bg-slate-800/40 text-slate-400 hover:bg-slate-800'
                  }`}
                >
                  <Building2 className="w-5 h-5 mx-auto mb-1 text-cyan-400" />
                  <span className="text-xs font-semibold block">NetBanking</span>
                </button>
              </div>

              {/* Simulated Method UI */}
              {selectedMethod === 'UPI' && (
                <div className="p-4 rounded-xl bg-slate-800/30 border border-slate-700/50 text-center space-y-2">
                  <div className="w-24 h-24 mx-auto rounded-lg bg-white p-2 flex items-center justify-center">
                    <QrCode className="w-20 h-20 text-slate-950" />
                  </div>
                  <p className="text-xs text-slate-300 font-medium">Scan with Google Pay, PhonePe, Paytm, or BHIM</p>
                  <p className="text-[10px] text-slate-400">Sandbox Test Gateway: One click to simulate instant confirmation</p>
                </div>
              )}

              {selectedMethod === 'CARD' && (
                <div className="p-4 rounded-xl bg-slate-800/30 border border-slate-700/50 space-y-2 text-xs">
                  <input
                    type="text"
                    disabled
                    value="•••• •••• •••• 4242 (Test Card)"
                    className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-300 text-xs"
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      disabled
                      value="12 / 28"
                      className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-300 text-xs"
                    />
                    <input
                      type="text"
                      disabled
                      value="CVV: 123"
                      className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-300 text-xs"
                    />
                  </div>
                </div>
              )}

              {selectedMethod === 'NETBANKING' && (
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2.5 rounded-lg border border-slate-700 bg-slate-800/40 text-center text-slate-300 font-medium">
                    HDFC Bank
                  </div>
                  <div className="p-2.5 rounded-lg border border-slate-700 bg-slate-800/40 text-center text-slate-300 font-medium">
                    State Bank of India (SBI)
                  </div>
                  <div className="p-2.5 rounded-lg border border-slate-700 bg-slate-800/40 text-center text-slate-300 font-medium">
                    ICICI Bank
                  </div>
                  <div className="p-2.5 rounded-lg border border-slate-700 bg-slate-800/40 text-center text-slate-300 font-medium">
                    Axis Bank
                  </div>
                </div>
              )}

              <button
                onClick={handleSimulatePayment}
                disabled={loading}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-bold text-sm shadow-lg transition-all flex items-center justify-center gap-2"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
                <span>Authorize & Complete Payment (₹{order?.amount})</span>
              </button>
            </div>
          )}

          {step === 'SUCCESS' && (
            <div className="text-center py-6 space-y-4">
              <div className="w-16 h-16 mx-auto rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center animate-bounce">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <div>
                <h4 className="text-xl font-bold text-white">Payment Verified & Activated!</h4>
                <p className="text-xs text-slate-300 mt-1">
                  Your account has been upgraded to <span className="text-cyan-400 font-semibold">{plan.name}</span>.
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  An official GST invoice receipt has been recorded in your Billing Center.
                </p>
              </div>

              <div className="pt-2">
                <button
                  onClick={onClose}
                  className="py-2.5 px-6 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs shadow-md transition-all"
                >
                  Return to Workspace
                </button>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
