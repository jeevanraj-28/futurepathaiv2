import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Bookmark, BookmarkCheck, Check, ExternalLink, Plus } from 'lucide-react';
import { ApiService } from '../services/api';
import { useAuth } from '../context/auth';
import { Dhruv } from '../components/brand';
import { Alert, Badge, Button, Skeleton, StateMessage } from '../components/ui';
import { PageFrame } from '../components/layout/AppLayout';
import { useInApp } from '../components/layout/inApp';
import { cn, demandLabel, fitBand, formatLPA } from '../lib/utils';

const SECTIONS = [
  ['overview', 'Overview'],
  ['path', 'How to get there'],
  ['pay', 'Pay and outlook'],
  ['colleges', 'Colleges'],
] as const;

/** Remounts for each career so loading state starts fresh without resetting it inside an effect. */
export const CareerDetailPage: React.FC = () => {
  const { slug = '' } = useParams();
  return <CareerDetail key={slug} slug={slug} />;
};

const CareerDetail: React.FC<{ slug: string }> = ({ slug }) => {
  const { user } = useAuth();
  const inApp = useInApp();
  const [career, setCareer] = useState<any>(null);
  const [fit, setFit] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [missing, setMissing] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    ApiService.getCareerBySlug(slug)
      .then((res) => (res.success ? setCareer(res.career) : setMissing(true)))
      .catch(() => setMissing(true))
      .finally(() => setLoading(false));
    if (user?.role === 'STUDENT') {
      ApiService.getAssessmentResults()
        .then((res) => setFit(res.result?.recommendations?.find((r: any) => r.slug === slug) || null))
        .catch(() => setFit(null));
    }
  }, [slug, user]);

  const toggleSave = async () => {
    if (!user) { setNotice('Log in to save careers to your list.'); return; }
    setSaving(true);
    try {
      const res = await ApiService.toggleSaveCareer(career.id);
      setSaved(res.saved);
      setNotice(res.saved ? 'Saved to your careers.' : 'Removed from your saved careers.');
    } catch (err: any) {
      setNotice(err.message || 'Could not save right now.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <PageFrame className="flex flex-col gap-5"><Skeleton className="h-12 w-1/2" /><Skeleton className="h-48 rounded-3xl" /><Skeleton className="h-96 rounded-3xl" /></PageFrame>;
  }
  if (missing || !career) {
    return <PageFrame><div className="card"><StateMessage pose="read" title="We couldn’t find that career" body="It may have moved. Browse the full library instead." action={<Button to="/careers">Browse careers</Button>} /></div></PageFrame>;
  }

  const path: Array<{ when: string; title: string; body?: string }> = [
    { when: 'Class 11–12', title: career.stream === 'ANY' ? 'Any stream works' : `Stream: ${career.stream}`, body: career.requiredSubjects?.length ? `Key subjects: ${career.requiredSubjects.join(', ')}` : undefined },
    ...(career.entranceExams?.length ? [{ when: 'Entrance', title: career.entranceExams.slice(0, 3).join(', '), body: 'Check eligibility and dates on each official portal.' }] : []),
    ...(career.degrees?.length ? [{ when: 'Degree', title: career.degrees[0], body: career.degrees.length > 1 ? `Also: ${career.degrees.slice(1).join(', ')}` : undefined }] : []),
    ...(career.entryQualifications ? [{ when: 'To get hired', title: career.entryQualifications }] : []),
    { when: 'Goal', title: career.title },
  ];

  return (
    <div className="flex flex-col">
      <section className={inApp ? 'rounded-4xl border border-line bg-white' : 'border-b border-line bg-mist'}>
        <div className={cn('flex flex-col gap-6', inApp ? 'p-6 sm:p-8' : 'page py-8 sm:py-10')}>
          <nav aria-label="Breadcrumb" className="flex flex-wrap gap-2 text-sm text-ink-3">
            <Link to="/careers" className="hover:text-royal-500">Careers</Link><span aria-hidden="true">/</span>
            <Link to={`/careers?category=${encodeURIComponent(career.category)}`} className="hover:text-royal-500">{career.category}</Link><span aria-hidden="true">/</span>
            <span aria-current="page" className="text-ink">{career.title}</span>
          </nav>
          <div className="flex flex-wrap items-stretch gap-6">
            <div className="flex min-w-0 flex-1 basis-[460px] flex-col justify-center gap-4">
              <div className="flex flex-wrap gap-2">
                <Badge tone="saffron">{career.category}</Badge>
                <Badge>Stream: {career.stream}</Badge>
              </div>
              <h1 className="h-display text-4xl sm:text-[52px]">{career.title}</h1>
              <p className="max-w-2xl text-lg leading-relaxed text-ink-2">{career.fullDescription || career.shortDescription}</p>
            </div>
            <div className="flex flex-1 basis-[320px] flex-col gap-4 rounded-3xl border-2 border-leaf-600 bg-white p-6">
              {fit ? (
                <>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex flex-col gap-1.5">
                      <span className="text-[13px] font-bold uppercase tracking-[0.08em] text-leaf-700">Your fit</span>
                      <span className="font-display text-3xl font-bold text-leaf-700">{fitBand(fit.matchScore).label}</span>
                      <span className="text-sm text-ink-3">score {Math.round(fit.matchScore)}/100</span>
                    </div>
                    <Dhruv pose="thumbsup" size={80} decorative />
                  </div>
                  <p className="text-[15px] leading-relaxed text-ink-2"><strong className="text-ink">Why:</strong> {fit.whyItMatches}</p>
                </>
              ) : (
                <div className="flex items-center gap-4">
                  <Dhruv pose="think" size={72} decorative />
                  <div className="flex flex-col gap-1.5">
                    <span className="font-bold">Does this fit you?</span>
                    <span className="text-[15px] text-ink-2">{user?.role === 'STUDENT' ? 'This career isn’t in your top matches yet.' : 'Take the free test to see how well it matches you.'}</span>
                    {user?.role !== 'STUDENT' && <Link to="/start" className="link text-[15px]">Start the test →</Link>}
                  </div>
                </div>
              )}
              <div className="mt-auto flex flex-wrap gap-2.5">
                <Button to={user ? `/plan?career=${encodeURIComponent(career.title)}` : '/start'} className="flex-1"><Plus className="h-4 w-4" aria-hidden="true" />Add to my plan</Button>
                <Button variant="secondary" onClick={toggleSave} loading={saving} aria-pressed={saved}>
                  {saved ? <BookmarkCheck className="h-4 w-4" aria-hidden="true" /> : <Bookmark className="h-4 w-4" aria-hidden="true" />}{saved ? 'Saved' : 'Save'}
                </Button>
              </div>
            </div>
          </div>
          {notice && <Alert tone="royal">{notice} {!user && <Link to="/login" className="link">Log in</Link>}</Alert>}
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {[
              ['Typical salary', formatLPA(career.salaryMinINR, career.salaryMaxINR), 'Entry to experienced'],
              ['Future demand', demandLabel(career.futureDemand), 'Hiring outlook'],
              ['Automation exposure', demandLabel(career.automationExposure), 'How much AI may change it'],
              ['Main exam', career.entranceExams?.[0] || '—', 'Most common route'],
            ].map(([k, v, s]) => (
              <div key={k} className="flex flex-col gap-0.5 rounded-2xl border border-line bg-white p-4">
                <span className="text-sm text-ink-3">{k}</span>
                <span className="text-xl font-bold">{v}</span>
                <span className="text-[13px] text-ink-3">{s}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <nav
        aria-label="On this page"
        className={cn('sticky z-10 bg-white', inApp ? 'top-16 mt-6 rounded-2xl border border-line md:top-0' : 'top-[72px] border-b border-line')}
      >
        <div className={cn('flex gap-1 overflow-x-auto whitespace-nowrap', inApp ? 'px-3' : 'page')}>
          {SECTIONS.map(([id, label]) => (
            <a key={id} href={`#${id}`} className="px-3.5 py-4 text-[15px] font-semibold text-ink-2 hover:text-royal-500">{label}</a>
          ))}
        </div>
      </nav>

      <div className={cn('flex flex-col gap-14 py-10', !inApp && 'page py-12')}>
        <section id="overview" className="grid scroll-mt-32 gap-10 lg:grid-cols-2">
          {career.responsibilities?.length > 0 && (
            <div className="flex flex-col gap-4">
              <h2 className="font-display text-[28px] font-bold">What you’d actually do</h2>
              <ul className="flex flex-col gap-3">
                {career.responsibilities.map((r: string) => (
                  <li key={r} className="flex gap-3 text-[17px] leading-relaxed text-ink-2"><Check className="mt-1 h-5 w-5 shrink-0 text-royal-500" aria-hidden="true" />{r}</li>
                ))}
              </ul>
            </div>
          )}
          <div className="flex flex-col gap-4">
            <h2 className="font-display text-[28px] font-bold">Skills to start building</h2>
            <div className="flex flex-wrap gap-2.5">
              {(career.recommendedSkills || []).map((s: string) => (
                <span key={s} className="rounded-xl border border-line bg-mist px-3.5 py-2.5 text-[15px] font-semibold">{s}</span>
              ))}
            </div>
            {career.requiredSubjects?.length > 0 && (
              <p className="text-[15px] text-ink-2"><strong className="text-ink">School subjects that help:</strong> {career.requiredSubjects.join(', ')}</p>
            )}
          </div>
        </section>

        <section id="path" className="flex scroll-mt-32 flex-col gap-6">
          <h2 className="font-display text-[28px] font-bold">How to get there</h2>
          <ol className="flex max-w-3xl flex-col">
            {path.map((s, i) => {
              const last = i === path.length - 1;
              return (
                <li key={s.when + s.title} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <span className={last ? 'flex h-9 w-9 items-center justify-center rounded-full bg-ink font-bold text-white' : 'flex h-9 w-9 items-center justify-center rounded-full bg-royal-50 font-bold text-royal-600'}>{i + 1}</span>
                    {!last && <span className="my-1 min-h-[24px] w-0.5 flex-1 bg-line-strong" />}
                  </div>
                  <div className="flex flex-col gap-1 pb-6">
                    <span className="text-[13px] font-bold text-royal-500">{s.when}</span>
                    <span className="text-lg font-bold">{s.title}</span>
                    {s.body && <span className="text-[15px] leading-relaxed text-ink-2">{s.body}</span>}
                  </div>
                </li>
              );
            })}
          </ol>
        </section>

        <section id="pay" className="flex scroll-mt-32 flex-col gap-5">
          <h2 className="font-display text-[28px] font-bold">Pay and outlook</h2>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="card flex flex-col gap-1 p-6"><span className="text-sm text-ink-3">Starting pay</span><span className="text-2xl font-bold">{formatLPA(career.salaryMinINR)}</span><span className="text-sm text-ink-3">Typical for early years</span></div>
            <div className="card flex flex-col gap-1 p-6"><span className="text-sm text-ink-3">Experienced pay</span><span className="text-2xl font-bold">up to {formatLPA(career.salaryMaxINR)}</span><span className="text-sm text-ink-3">Senior roles, top employers</span></div>
            <div className="card flex flex-col gap-1 p-6"><span className="text-sm text-ink-3">Outlook</span><span className="text-2xl font-bold">{demandLabel(career.futureDemand)} demand</span><span className="text-sm text-ink-3">{demandLabel(career.automationExposure)} automation exposure</span></div>
          </div>
          <p className="text-sm text-ink-3">
            Source: {career.sourceName || 'Industry reports'}{career.lastVerifiedDate ? ` · last checked ${new Date(career.lastVerifiedDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}` : ''}
            {career.sourceUrl && <> · <a href={career.sourceUrl} target="_blank" rel="noopener noreferrer" className="link inline-flex items-center gap-1">Open source<ExternalLink className="h-3.5 w-3.5" aria-hidden="true" /></a></>}
          </p>
        </section>

        <section id="colleges" className="grid scroll-mt-32 gap-8 lg:grid-cols-[2fr_1fr]">
          <div className="flex flex-col gap-4">
            <h2 className="font-display text-[28px] font-bold">Top colleges</h2>
            <ul className="divide-y divide-line overflow-hidden rounded-2xl border border-line">
              {(career.topColleges || []).map((c: string) => <li key={c} className="px-5 py-4 font-semibold">{c}</li>)}
            </ul>
            <Link to="/colleges" className="link">See all colleges →</Link>
          </div>
          <div className="flex flex-col gap-3 self-start rounded-3xl bg-mist p-6">
            <h2 className="text-lg font-bold">Still unsure?</h2>
            <p className="text-[15px] leading-relaxed text-ink-2">Ask Dhruv anything about this career, or book a verified counsellor.</p>
            <Button to={`/mentor?q=${encodeURIComponent(`Tell me more about becoming a ${career.title}`)}`} variant="secondary">Ask Dhruv</Button>
            <Button to="/counselors" variant="secondary">Book a counsellor</Button>
          </div>
        </section>

      </div>
    </div>
  );
};
