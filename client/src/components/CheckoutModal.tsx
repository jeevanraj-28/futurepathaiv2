import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, CreditCard, Landmark, Lock, Smartphone, X } from 'lucide-react';
import { ApiService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Alert, Button, Modal } from './ui';
import { Dhruv } from './brand';
import { cn, formatINR } from '../lib/utils';

export const PLAN_INFO: Record<string, { name: string; price: number; period: string }> = {
  DISCOVERY: { name: 'Career Report', price: 299, period: 'one-time' },
  PREMIUM_STUDENT: { name: 'Premium', price: 999, period: 'per year' },
  PREMIUM_PLUS: { name: 'Family', price: 2499, period: 'per year' },
  SCHOOL_PILOT: { name: 'School Pilot', price: 19999, period: 'per year' },
};

const METHODS = [
  { id: 'UPI' as const, label: 'UPI', hint: 'GPay, PhonePe, Paytm', Icon: Smartphone },
  { id: 'CARD' as const, label: 'Card', hint: 'Debit or credit', Icon: CreditCard },
  { id: 'NETBANKING' as const, label: 'Net banking', hint: 'All major banks', Icon: Landmark },
];

export const CheckoutModal: React.FC<{ planCode: string; onClose: () => void; onSuccess?: () => void }> = ({ planCode, onClose, onSuccess }) => {
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'DETAILS' | 'PAYMENT' | 'SUCCESS'>('DETAILS');
  const [method, setMethod] = useState<'UPI' | 'CARD' | 'NETBANKING'>('UPI');
  const [order, setOrder] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const plan = PLAN_INFO[planCode] || PLAN_INFO.PREMIUM_STUDENT;

  const startOrder = async () => {
    if (!user) {
      onClose();
      navigate(`/login?next=${encodeURIComponent('/pricing')}`);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await ApiService.createOrder(planCode);
      if (res.success && res.order) {
        setOrder(res.order);
        setStep('PAYMENT');
      }
    } catch (err: any) {
      setError(err.message || 'We couldn’t start the payment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Sandbox: the server verifies a mock signature in local development.
  const pay = async () => {
    if (!order) return;
    setLoading(true);
    setError(null);
    try {
      const res = await ApiService.verifyPayment({
        orderId: order.orderId,
        paymentId: `pay_${Date.now()}_${Math.floor(Math.random() * 100000)}`,
        signature: `sig_mock_${Date.now()}`,
      });
      if (res.success) {
        await refreshUser();
        setStep('SUCCESS');
        onSuccess?.();
      }
    } catch (err: any) {
      setError(err.message || 'Payment could not be verified. You have not been charged.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal title={`Checkout: ${plan.name}`} onClose={onClose}>
      <div className="flex items-center justify-between border-b border-line px-6 py-4">
        <span className="inline-flex items-center gap-2 text-sm font-semibold text-ink-2">
          <Lock className="h-4 w-4 text-leaf-600" aria-hidden="true" /> Secure checkout · Razorpay
        </span>
        <button type="button" onClick={onClose} aria-label="Close" className="flex h-10 w-10 items-center justify-center rounded-lg hover:bg-mist">
          <X className="h-5 w-5" aria-hidden="true" />
        </button>
      </div>

      {step === 'SUCCESS' ? (
        <div className="flex flex-col items-center gap-3 px-6 py-10 text-center">
          <Dhruv pose="thanks" size={140} decorative />
          <h2 className="font-display text-2xl font-bold">Payment successful</h2>
          <p className="max-w-sm text-[15px] text-ink-2">
            {plan.name} is now active. Your GST invoice is in Billing.
          </p>
          <div className="mt-2 flex flex-wrap justify-center gap-2.5">
            <Button to="/dashboard" onClick={onClose}>Go to my home</Button>
            <Button variant="secondary" to="/billing" onClick={onClose}>View invoice</Button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-5 px-6 py-6">
          <div className="flex items-baseline justify-between gap-4 rounded-2xl bg-mist px-5 py-4">
            <div>
              <p className="text-lg font-bold">{plan.name}</p>
              <p className="text-sm text-ink-3">{plan.period === 'one-time' ? 'One-time payment' : 'Billed yearly · reminder before renewal'}</p>
            </div>
            <p className="font-display text-3xl font-bold">{formatINR(plan.price)}</p>
          </div>

          {step === 'PAYMENT' && (
            <fieldset className="flex flex-col gap-2.5">
              <legend className="mb-2 text-[15px] font-semibold">Pay with</legend>
              {METHODS.map(({ id, label, hint, Icon }) => (
                <button
                  key={id}
                  type="button"
                  role="radio"
                  aria-checked={method === id}
                  onClick={() => setMethod(id)}
                  className={cn(
                    'flex min-h-[56px] items-center gap-3 rounded-xl px-4 text-left',
                    method === id ? 'border-2 border-royal-500 bg-royal-50' : 'border border-line-strong hover:border-royal-300'
                  )}
                >
                  <Icon className="h-5 w-5 text-royal-500" aria-hidden="true" />
                  <span className="flex flex-col">
                    <span className="font-semibold">{label}</span>
                    <span className="text-sm text-ink-3">{hint}</span>
                  </span>
                  {method === id && <CheckCircle2 className="ml-auto h-5 w-5 text-royal-500" aria-hidden="true" />}
                </button>
              ))}
            </fieldset>
          )}

          {error && <Alert>{error}</Alert>}

          {step === 'DETAILS' ? (
            <>
              <ul className="flex flex-col gap-2 text-[15px] text-ink-2">
                <li>Prices include GST. Invoice is emailed and saved in Billing.</li>
                <li>{user ? `Paying as ${user.email}` : 'You’ll log in first so the plan is added to your account.'}</li>
              </ul>
              <Button size="lg" onClick={startOrder} loading={loading}>
                {user ? `Continue to pay ${formatINR(plan.price)}` : 'Log in to continue'}
              </Button>
            </>
          ) : (
            <Button size="lg" onClick={pay} loading={loading}>Pay {formatINR(plan.price)}</Button>
          )}
          <p className="text-center text-xs text-ink-3">Test mode in local development — no real money is charged.</p>
        </div>
      )}
    </Modal>
  );
};
