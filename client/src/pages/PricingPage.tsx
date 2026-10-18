import React, { useState, useEffect } from 'react';
import { ApiService } from '../services/api';
import { SubscriptionPlan } from '../types';
import {
  CheckCircle2,
  Sparkles,
  ShieldCheck,
  CreditCard,
  Building,
  HelpCircle,
  Lock,
  ArrowRight
} from 'lucide-react';

export const PricingPage: React.FC<{ onOpenCheckout?: (planCode: string) => void }> = ({ onOpenCheckout }) => {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    ApiService.getPlans().then(res => {
      if (res.success && res.plans) {
        setPlans(res.plans);
      }
    }).finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/10 text-cyan-400 text-xs font-semibold border border-brand-500/20">
            <CreditCard className="w-3.5 h-3.5" />
            <span>Honest, Transparent Indian Pricing</span>
          </div>
          <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight">
            Invest in Evidence-Informed Guidance
          </h1>
          <p className="text-sm sm:text-base text-slate-400 leading-relaxed">
            Choose the right level of career intelligence for your family or school. No deceptive subscriptions, hidden auto-debits, or predatory tactics.
          </p>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {plans.map(plan => {
            const isHighlight = plan.isPopular;
            const isFree = plan.priceINR === 0;

            return (
              <div
                key={plan.id}
                className={`p-7 rounded-2xl glass-card flex flex-col justify-between transition-all relative ${
                  isHighlight
                    ? 'bg-gradient-to-b from-slate-900 via-slate-900 to-brand-950/40 border-2 border-brand-500 shadow-2xl hover:border-cyan-400'
                    : 'bg-slate-900 border border-slate-800 hover:border-slate-700'
                }`}
              >
                {isHighlight && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-gradient-to-r from-brand-600 to-cyan-500 text-white font-bold text-[10px] tracking-wider uppercase shadow-md">
                    Most Popular in India
                  </div>
                )}

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-cyan-400">
                      {plan.name}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-semibold">
                      {plan.billingType.replace('_', ' ')}
                    </span>
                  </div>

                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-black text-white">₹{plan.priceINR}</span>
                    <span className="text-xs text-slate-400">
                      {isFree ? '/ forever' : plan.billingType === 'ANNUAL' ? '/ year' : '/ one-time'}
                    </span>
                  </div>

                  <p className="text-xs text-slate-400 leading-relaxed">{plan.description}</p>

                  <ul className="space-y-2.5 text-xs text-slate-300 pt-4 border-t border-slate-800">
                    {plan.features?.map((f: string, i: number) => (
                      <li key={i} className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="pt-8">
                  <button
                    onClick={() => {
                      if (onOpenCheckout && !isFree) {
                        onOpenCheckout(plan.code);
                      }
                    }}
                    className={`w-full py-3 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-1.5 ${
                      isHighlight
                        ? 'bg-gradient-to-r from-brand-600 to-cyan-500 hover:from-brand-500 hover:to-cyan-400 text-white shadow-lg glow-blue'
                        : isFree
                        ? 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                        : 'bg-brand-600 hover:bg-brand-500 text-white'
                    }`}
                  >
                    <span>{isFree ? 'Active Plan' : `Upgrade (₹${plan.priceINR})`}</span>
                    {!isFree && <ArrowRight className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Security & Refund Assurance Banner */}
        <div className="p-6 rounded-2xl glass-panel bg-slate-900 border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-6 text-xs text-slate-400">
          <div className="flex items-center gap-3">
            <ShieldCheck className="w-8 h-8 text-emerald-400 flex-shrink-0" />
            <div>
              <h4 className="font-bold text-white text-sm">7-Day Risk-Free Satisfaction Policy</h4>
              <p className="text-[11px] text-slate-400">
                If the Career Discovery Dossier does not clarify your child's academic direction, request a 100% prompt refund via our Billing Center within 7 days.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs font-semibold text-slate-300 whitespace-nowrap">
            <span className="flex items-center gap-1">
              <Lock className="w-3.5 h-3.5 text-cyan-400" />
              <span>Razorpay Secured</span>
            </span>
            <span>•</span>
            <span>GST Invoice Included</span>
          </div>
        </div>

      </div>
    </div>
  );
};
