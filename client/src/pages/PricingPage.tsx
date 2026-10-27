import React, { useEffect, useState } from 'react';
import { Check } from 'lucide-react';
import { ApiService } from '../services/api';
import type { SubscriptionPlan } from '../types';
import { useAuth } from '../context/AuthContext';
import { useCheckout } from '../context/CheckoutContext';
import { Button, Segmented, Skeleton } from '../components/ui';
import { Dhruv } from '../components/brand';
import { Character } from '../components/Character';
import { cn, formatINR, parseList } from '../lib/utils';

const DISPLAY: Record<string, { name: string; for: string }> = {
  FREE: { name: 'Explorer', for: 'Try the test and see where you stand' },
  DISCOVERY: { name: 'Career Report', for: 'One complete report to discuss at home' },
  PREMIUM_STUDENT: { name: 'Premium', for: 'For students actively planning their next step' },
  PREMIUM_PLUS: { name: 'Family', for: 'Bring parents and an expert into the plan' },
  SCHOOL_PILOT: { name: 'School Pilot', for: 'For schools guiding Class 10 and 12 batches' },
};

const FAQ = [
  ['Do I need to pay to take the test?', 'No. You can start the discovery test free, without signing up, and see your recommended stream and top matches.'],
  ['How do I pay?', 'UPI, debit and credit cards, net banking and wallets through Razorpay. Prices include GST and the invoice is saved in Billing.'],
  ['Will my plan renew automatically?', 'Yearly plans show the renewal date in Billing, and we remind you before it renews.'],
  ['Can a parent pay for a student?', 'Yes. The Family plan includes the parent portal; a parent can buy it and link to the student’s account with their consent.'],
];

export const PricingPage: React.FC = () => {
  const { subscription } = useAuth();
  const { openCheckout } = useCheckout();
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [audience, setAudience] = useState<'family' | 'school'>('family');

  useEffect(() => {
    ApiService.getPlans()
      .then((res) => res.success && setPlans(res.plans.map((p: any) => ({ ...p, features: parseList(p.features ?? p.featuresJson) }))))
      .catch(() => setPlans([]))
      .finally(() => setLoading(false));
  }, []);

  const familyPlans = plans.filter((p) => p.code !== 'SCHOOL_PILOT');
  const school = plans.find((p) => p.code === 'SCHOOL_PILOT');
  const currentCode = subscription?.planCode;

  return (
    <>
      <section className="page flex flex-col items-center gap-5 pb-10 pt-16 text-center sm:pt-20">
        <Dhruv pose="thumbsup" size={110} decorative />
        <h1 className="h-display max-w-3xl text-4xl sm:text-[56px]">Simple prices. No surprise renewals.</h1>
        <p className="max-w-2xl text-lg leading-relaxed text-ink-2">Take the discovery test free. Pay only when you want the full report, your plan and expert help. All prices include GST.</p>
        <Segmented
          label="Plan audience"
          value={audience}
          onChange={setAudience}
          options={[{ value: 'family', label: 'Students & families' }, { value: 'school', label: 'Schools' }]}
          className="mt-2 bg-mist"
        />
      </section>

      {audience === 'family' ? (
        <section className="page pb-20">
          {loading ? (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">{[0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-[460px] rounded-3xl" />)}</div>
          ) : (
            <div className="grid items-stretch gap-4 md:grid-cols-2 xl:grid-cols-4">
              {familyPlans.map((p) => {
                const d = DISPLAY[p.code] || { name: p.name, for: p.description };
                const featured = p.isPopular;
                const isCurrent = currentCode === p.code;
                return (
                  <div
                    key={p.code}
                    className={cn('relative flex flex-col gap-6 rounded-3xl bg-white p-7', featured ? 'border-2 border-royal-500 shadow-[0_20px_40px_-24px_rgba(35,71,214,0.45)]' : 'border border-line')}
                  >
                    {featured && <span className="absolute -top-3 left-6 rounded-full bg-royal-500 px-2.5 py-1 text-xs font-bold text-white">Most chosen</span>}
                    <div className="flex flex-col gap-1.5">
                      <h2 className="text-xl font-bold">{d.name}</h2>
                      <p className="text-[15px] leading-snug text-ink-3">{d.for}</p>
                    </div>
                    <p className="flex items-baseline gap-1.5">
                      <span className="font-display text-[44px] font-bold tracking-tight">{p.priceINR === 0 ? '₹0' : formatINR(p.priceINR)}</span>
                      <span className="text-[15px] font-medium text-ink-3">{p.priceINR === 0 ? 'free' : p.billingType === 'ANNUAL' ? 'per year' : 'one time'}</span>
                    </p>
                    {isCurrent ? (
                      <Button variant="secondary" disabled>Your current plan</Button>
                    ) : p.priceINR === 0 ? (
                      <Button variant="secondary" to="/start">Start free test</Button>
                    ) : (
                      <Button variant={featured ? 'primary' : 'secondary'} onClick={() => openCheckout(p.code)}>Choose {d.name}</Button>
                    )}
                    <ul className="flex flex-col gap-3 border-t border-line pt-5">
                      {p.features.map((f) => (
                        <li key={f} className="flex gap-2.5 text-[15px] leading-snug">
                          <Check className="mt-0.5 h-[18px] w-[18px] shrink-0 text-leaf-600" aria-hidden="true" />{f}
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      ) : (
        <section className="page grid gap-5 pb-20 lg:grid-cols-[1.4fr_1fr]">
          <div className="flex flex-col gap-5 rounded-3xl border-2 border-royal-500 p-8">
            <div className="flex items-center gap-3">
              <Character who="harjeet" size={56} />
              <Character who="fatima" size={56} />
              <h2 className="ml-1 text-xl font-bold">School Pilot</h2>
            </div>
            <p className="flex items-baseline gap-1.5">
              <span className="font-display text-[44px] font-bold">{formatINR(school?.priceINR ?? 19999)}</span>
              <span className="text-[15px] text-ink-3">per year</span>
            </p>
            <div className="flex flex-wrap gap-3">
              <Button onClick={() => openCheckout('SCHOOL_PILOT')}>Start the pilot</Button>
              <Button variant="secondary" to="/contact">Book a school demo</Button>
            </div>
            <ul className="grid gap-3 sm:grid-cols-2">
              {(school?.features || []).map((f) => (
                <li key={f} className="flex gap-2.5 text-[15px]"><Check className="mt-0.5 h-[18px] w-[18px] shrink-0 text-leaf-600" aria-hidden="true" />{f}</li>
              ))}
            </ul>
          </div>
          <div className="card-muted flex flex-col gap-4 p-8">
            <h2 className="text-xl font-bold">Groups & districts</h2>
            <p className="leading-relaxed text-ink-2">Multi-campus groups, state programmes and NGOs get custom pricing, single sign-on and data agreements.</p>
            <Button variant="secondary" to="/contact" className="self-start">Talk to our team</Button>
          </div>
        </section>
      )}

      <section className="border-t border-line bg-mist">
        <div className="page grid gap-6 py-14 sm:grid-cols-2 lg:grid-cols-4">
          {[['Pay your way', 'UPI, cards, net banking and wallets through Razorpay.'], ['GST invoice', 'Downloadable from Billing right after purchase.'], ['Renewal reminders', 'We remind you before any yearly plan renews.'], ['Your data stays yours', 'DPDP Act 2023 compliant. Never sold.']].map(([t, b]) => (
            <div key={t} className="flex flex-col gap-1.5">
              <span className="text-[17px] font-bold">{t}</span>
              <span className="text-[15px] leading-relaxed text-ink-2">{b}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto flex max-w-3xl flex-col gap-6 px-4 py-20 sm:px-6">
        <h2 className="h-section">Pricing questions</h2>
        <dl className="flex flex-col divide-y divide-line border-y border-line">
          {FAQ.map(([q, a]) => (
            <div key={q} className="flex flex-col gap-2 py-5">
              <dt className="text-lg font-semibold">{q}</dt>
              <dd className="leading-relaxed text-ink-2">{a}</dd>
            </div>
          ))}
        </dl>
      </section>
    </>
  );
};
