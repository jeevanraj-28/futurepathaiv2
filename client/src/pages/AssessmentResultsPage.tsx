import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Download, MessageCircle, RotateCcw } from 'lucide-react';
import { ApiService } from '../services/api';
import { useAuth } from '../context/auth';
import { useCheckout } from '../context/checkout';
import { Dhruv } from '../components/brand';
import { Badge, Button, FitBadge, Segmented, Skeleton, StateMessage } from '../components/ui';
import { DIMENSION_DETAIL, cn, demandLabel, fitBand, formatLPA, plainDimension, strengthBand } from '../lib/utils';

const FREE_VISIBLE = 3;

const T = {
  en: { stream: 'Recommended stream', strengths: 'What you’re naturally good at', careers: 'Careers that fit you', share: 'Share on WhatsApp', next: 'Your next steps' },
  hi: { stream: 'सुझाई गई स्ट्रीम', strengths: 'आप किन चीज़ों में स्वाभाविक रूप से अच्छे हैं', careers: 'आपके लिए उपयुक्त करियर', share: 'WhatsApp पर भेजें', next: 'आपके अगले कदम' },
};

export const AssessmentResultsPage: React.FC = () => {
  const { user, subscription } = useAuth();
  const { openCheckout } = useCheckout();
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [missing, setMissing] = useState(false);
  const [lang, setLang] = useState<'en' | 'hi'>('en');
  const [showAll, setShowAll] = useState(false);
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const t = T[lang];
  const isFree = !subscription || subscription.planCode === 'FREE';

  useEffect(() => {
    ApiService.getAssessmentResults()
      .then((res) => (res.success ? setResult(res.result) : setMissing(true)))
      .catch(() => setMissing(true))
      .finally(() => setLoading(false));
  }, []);

  const dims = useMemo(
    () => Object.entries<number>(result?.dimensionScores || {}).sort((a, b) => b[1] - a[1]),
    [result]
  );
  const streams = useMemo(
    () => Object.entries<number>(result?.readinessProfile || {}).sort((a, b) => b[1] - a[1]),
    [result]
  );

  if (loading) {
    return (
      <div className="flex flex-col gap-5">
        <Skeleton className="h-12 w-2/3" />
        <div className="grid gap-4 md:grid-cols-3">{[0, 1, 2].map((i) => <Skeleton key={i} className="h-52 rounded-3xl" />)}</div>
        <Skeleton className="h-80 rounded-3xl" />
      </div>
    );
  }

  if (missing || !result) {
    return (
      <div className="card">
        <StateMessage
          pose="backpack"
          title="You haven’t taken the discovery test yet"
          body="It takes about 25 minutes and works on any device. Your report will appear here."
          action={<Button to="/start">Start the test</Button>}
        />
      </div>
    );
  }

  const recs: any[] = result.recommendations || [];
  const visible = isFree ? recs.slice(0, FREE_VISIBLE) : recs;
  const locked = isFree ? recs.slice(FREE_VISIBLE) : [];
  const [topStream, topStreamScore] = streams[0] || ['—', 0];
  const top3 = dims.slice(0, 3);
  const growing = dims[dims.length - 1];
  const firstName = user?.name?.split(' ')[0] || 'You';
  const headline = top3.length >= 2
    ? `${firstName === 'You' ? 'You’re' : `${firstName}, you’re`} strongest at ${plainDimension(top3[0][0]).toLowerCase()} and ${plainDimension(top3[1][0]).toLowerCase()}.`
    : 'Here’s what your answers say about you.';
  const shareText = `My FuturePath AI report: recommended stream ${topStream}. Top careers: ${recs.slice(0, 3).map((r) => r.title).join(', ')}. ${window.location.origin}`;
  const nextSteps: string[] = recs[0]?.suggestedNextSteps || [];

  return (
    <div className="flex flex-col gap-10 print:gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3 print:hidden">
        <Link to="/plan" className="inline-flex min-h-[44px] items-center gap-2 font-semibold text-ink-2 hover:text-ink">
          <ArrowLeft className="h-[18px] w-[18px]" aria-hidden="true" />My plan
        </Link>
        <div className="flex flex-wrap items-center gap-2.5">
          <Segmented size="sm" label="Language" value={lang} onChange={setLang} options={[{ value: 'en', label: 'English' }, { value: 'hi', label: 'हिन्दी' }]} />
          <Button variant="secondary" size="sm" onClick={() => window.print()}><Download className="h-4 w-4" aria-hidden="true" />PDF</Button>
          <Button variant="whatsapp" size="sm" href={`https://wa.me/?text=${encodeURIComponent(shareText)}`}>
            <MessageCircle className="h-4 w-4" aria-hidden="true" />{t.share}
          </Button>
        </div>
      </div>

      {/* Summary */}
      <section className="flex flex-col gap-7 rounded-4xl border border-line bg-white p-6 sm:p-10">
        <div className="flex flex-wrap items-center justify-between gap-6">
          <div className="flex max-w-3xl flex-col gap-3">
            <p className="text-sm font-semibold text-ink-3">
              {user?.name} · Test taken {result.completedAt ? new Date(result.completedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) : 'recently'}
            </p>
            <h1 className="h-display text-[32px] sm:text-[42px]">{headline}</h1>
          </div>
          <Dhruv pose="celebrate" size={140} className="print:hidden" decorative />
        </div>
        <div className="grid gap-4 lg:grid-cols-3">
          <div className="flex flex-col gap-2.5 rounded-3xl border-2 border-royal-500 p-6">
            <span className="eyebrow">{t.stream}</span>
            <span className="font-display text-3xl font-bold">{topStream}</span>
            <FitBadge score={topStreamScore} />
            <span className="text-[15px] leading-relaxed text-ink-2">Based on how your reasoning, interests and values line up with what this stream asks of you.</span>
          </div>
          <div className="flex flex-col gap-1 rounded-3xl border border-line p-6">
            <span className="mb-2 text-[13px] font-bold uppercase tracking-[0.08em] text-ink-3">Also worth considering</span>
            {streams.slice(1, 3).map(([name, score]) => (
              <div key={name} className="flex items-center justify-between gap-3 border-b border-line py-2.5 last:border-0">
                <span className="font-bold">{name}</span><FitBadge score={score} />
              </div>
            ))}
            <Link to="/stream-guide" className="link mt-2 text-[15px]">Compare all streams →</Link>
          </div>
          <div className="flex flex-col gap-3 rounded-3xl border border-line p-6">
            <span className="text-[13px] font-bold uppercase tracking-[0.08em] text-ink-3">How to read this</span>
            <p className="text-[15px] leading-relaxed text-ink-2">Fit bands compare you with yourself, not with other students. They’re a guide for discussion — never a guarantee.</p>
            <Link to="/how-it-works" className="link text-[15px]">How the test works →</Link>
            <button
              type="button"
              aria-expanded={feedbackOpen}
              onClick={() => setFeedbackOpen((v) => !v)}
              className="mt-auto min-h-[44px] self-start rounded-xl border border-line-strong px-4 text-[15px] font-semibold hover:bg-mist print:hidden"
            >
              This doesn’t feel right?
            </button>
          </div>
        </div>
        {feedbackOpen && (
          <div className="animate-pop flex flex-wrap items-center gap-5 rounded-3xl bg-mist p-6 print:hidden">
            <Dhruv pose="think" size={80} decorative />
            <div className="flex flex-1 flex-col gap-3">
              <p className="text-[17px] font-bold">That’s useful to know — tests can miss things.</p>
              <p className="text-[15px] text-ink-2">Talk it through with Dhruv, or retake the test when you feel ready. Your current report stays saved.</p>
              <div className="flex flex-wrap gap-2.5">
                <Button size="sm" to={`/mentor?q=${encodeURIComponent('My report doesn’t feel right to me. Can we talk about it?')}`}>Talk to Dhruv</Button>
                <Button size="sm" variant="secondary" to="/start"><RotateCcw className="h-4 w-4" aria-hidden="true" />Retake the test</Button>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* Strengths */}
      <section aria-labelledby="strengths-title" className="flex flex-col gap-6">
        <div className="flex max-w-2xl flex-col gap-2">
          <h2 id="strengths-title" className="font-display text-[28px] font-bold tracking-tight sm:text-[34px]">{t.strengths}</h2>
          <p className="text-[17px] leading-relaxed text-ink-2">Your three biggest strengths, in plain words. Everyone has a different mix — there’s no good or bad result.</p>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {top3.map(([dim], i) => (
            <div key={dim} className="flex flex-col gap-3 rounded-3xl bg-royal-50 p-6">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white font-display text-xl font-extrabold text-royal-600">{i + 1}</span>
              <span className="text-xl font-bold leading-snug">{plainDimension(dim)}</span>
              <span className="leading-relaxed text-ink-2">{DIMENSION_DETAIL[dim]?.body}</span>
              {DIMENSION_DETAIL[dim] && <span className="text-sm font-semibold text-royal-600">Useful for: {DIMENSION_DETAIL[dim].useful}</span>}
            </div>
          ))}
        </div>
        {growing && (
          <div className="flex flex-wrap items-center gap-5 rounded-3xl bg-saffron-50 px-6 py-5">
            <Dhruv pose="thumbsup" size={72} decorative />
            <div className="flex flex-1 flex-col gap-1">
              <span className="text-lg font-bold">Still growing: {plainDimension(growing[0]).toLowerCase()}</span>
              <span className="leading-relaxed text-saffron-900">Very normal at your age. Small, regular practice makes a real difference — Dhruv can suggest how.</span>
            </div>
          </div>
        )}
        <button
          type="button"
          aria-expanded={showAll}
          onClick={() => setShowAll((v) => !v)}
          className="min-h-[48px] self-start rounded-xl border border-line-strong bg-white px-5 font-semibold hover:bg-mist print:hidden"
        >
          {showAll ? 'Hide the full breakdown' : `See all ${dims.length} areas`}
        </button>
        {(showAll) && (
          <div className="card grid gap-x-10 gap-y-4 p-6 md:grid-cols-2">
            {dims.map(([dim, score]) => {
              const band = strengthBand(score);
              return (
                <div key={dim} className="grid grid-cols-[minmax(0,1fr)_96px] items-center gap-x-4 gap-y-1.5 text-[15px]">
                  <span className="text-ink-2">{plainDimension(dim)}</span>
                  <span className={cn('text-right text-sm font-bold', band.tone === 'saffron' ? 'text-saffron-700' : 'text-royal-600')}>{band.label}</span>
                  <span className="col-span-2 block h-2 overflow-hidden rounded-full bg-[#EDF0F5]">
                    <span className={cn('block h-full rounded-full', score >= 70 ? 'bg-royal-500' : score >= 50 ? 'bg-royal-300' : 'bg-saffron-500')} style={{ width: `${score}%` }} />
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Careers */}
      <section aria-labelledby="careers-title" className="flex flex-col gap-5">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <h2 id="careers-title" className="font-display text-[28px] font-bold tracking-tight sm:text-[34px]">{t.careers}</h2>
          <span className="text-sm text-ink-3">{recs.length} matches</span>
        </div>
        <div className="flex flex-col gap-3.5">
          {visible.map((r) => (
            <article key={r.careerId} className="card flex flex-wrap items-center gap-5 p-6">
              <div className="flex min-w-0 flex-1 basis-[380px] flex-col gap-2">
                <FitBadge score={r.matchScore} showScore />
                <h3 className="text-xl font-bold">{r.title} <span className="text-sm font-semibold text-ink-3">· {r.stream}</span></h3>
                <p className="leading-relaxed text-ink-2"><strong className="text-ink">Why:</strong> {r.whyItMatches}</p>
                {r.areasToDevelop && <p className="text-sm text-ink-3"><strong className="text-ink-2">To work on:</strong> {r.areasToDevelop}</p>}
              </div>
              <div className="flex shrink-0 flex-col items-start gap-1.5 sm:items-end">
                <span className="text-[13px] text-ink-3">Typical salary</span>
                <span className="text-lg font-bold">{formatLPA(r.salaryMinINR, r.salaryMaxINR)}</span>
                {r.futureDemand && <span className="text-[13px] text-ink-3">Demand: {demandLabel(r.futureDemand)}</span>}
                <Link to={`/careers/${r.slug}`} className="link print:hidden">View career →</Link>
              </div>
            </article>
          ))}
          {locked.length > 0 && (
            <div className="relative overflow-hidden rounded-3xl print:hidden">
              <div aria-hidden="true" className="pointer-events-none flex select-none flex-col gap-3.5 blur-[6px]">
                {locked.slice(0, 3).map((r) => (
                  <div key={r.careerId} className="card flex justify-between p-7"><span className="text-xl font-bold">{r.title}</span><Badge tone={fitBand(r.matchScore).tone}>{fitBand(r.matchScore).label}</Badge></div>
                ))}
              </div>
              <div className="absolute inset-0 flex items-center justify-center p-4">
                <div className="flex max-w-xl flex-wrap items-center gap-5 rounded-3xl border-2 border-royal-500 bg-white p-6 shadow-lift">
                  <Dhruv pose="read" size={88} decorative />
                  <div className="flex flex-1 basis-[240px] flex-col gap-2">
                    <span className="text-lg font-bold">{locked.length} more careers fit you</span>
                    <span className="text-[15px] leading-relaxed text-ink-2">Unlock every match, the full breakdown and a PDF for your parents.</span>
                    <div className="mt-1 flex flex-wrap items-center gap-3">
                      <Button size="sm" onClick={() => openCheckout('DISCOVERY')}>Unlock for ₹299</Button>
                      <Link to="/pricing" className="link text-[15px]">or Premium ₹999/yr</Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
        <p className="text-[13px] text-ink-3">Salary ranges are annual, entry to experienced, from each career’s cited source. See the career page for the source and the date it was checked.</p>
      </section>

      {/* Next steps */}
      <section aria-labelledby="next-title" className="flex flex-col gap-5 rounded-4xl bg-mist p-6 sm:p-10 print:hidden">
        <h2 id="next-title" className="font-display text-[28px] font-bold tracking-tight">{t.next}</h2>
        {nextSteps.length > 0 && (
          <ol className="grid gap-3 md:grid-cols-3">
            {nextSteps.slice(0, 3).map((step, i) => (
              <li key={step} className="flex flex-col gap-2 rounded-2xl bg-white p-5">
                <span className="text-[13px] font-bold text-saffron-700">Step {i + 1}</span>
                <span className="leading-relaxed">{step}</span>
              </li>
            ))}
          </ol>
        )}
        <div className="flex flex-wrap gap-3">
          <Button to="/plan" size="lg">Create my plan</Button>
          <Button to={`/mentor?q=${encodeURIComponent('Explain my report simply')}`} size="lg" variant="secondary" className="font-semibold">Ask Dhruv about my report</Button>
        </div>
      </section>
    </div>
  );
};
