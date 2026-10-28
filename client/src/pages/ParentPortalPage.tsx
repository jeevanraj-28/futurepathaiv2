import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { MessageCircle, ShieldCheck, UserPlus } from 'lucide-react';
import { ApiService } from '../services/api';
import { useAuth } from '../context/auth';
import { Dhruv } from '../components/brand';
import { Character } from '../components/Character';
import { Alert, Badge, Button, Field, FitBadge, PageHeader, ProgressBar, Skeleton, StateMessage } from '../components/ui';
import { roadmapProgress } from '../lib/roadmap';
import { classLabel, formatINR, plainDimension } from '../lib/utils';

const STREAMS = ['Engineering', 'Medical', 'Design', 'Law', 'Commerce', 'Humanities'];

export const ParentPortalPage: React.FC = () => {
  const { user } = useAuth();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [childIndex, setChildIndex] = useState(0);
  const [cost, setCost] = useState({ stream: 'Engineering', collegeType: 'GOVERNMENT', cityTier: 'TIER_1' });
  const [estimate, setEstimate] = useState<any>(null);
  const [email, setEmail] = useState('');
  const [linking, setLinking] = useState(false);
  const [linkMsg, setLinkMsg] = useState<{ tone: 'leaf' | 'danger'; text: string } | null>(null);
  const [showLink, setShowLink] = useState(false);

  const load = () =>
    ApiService.getParentOverview()
      .then((res) => res.success && setData(res))
      .catch(() => setData({ linkedStudents: [] }))
      .finally(() => setLoading(false));

  useEffect(() => { load(); }, []);

  useEffect(() => {
    ApiService.calculateCost(cost).then((res) => res.success && setEstimate(res.estimate)).catch(() => setEstimate(null));
  }, [cost]);

  const link = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) {
      setLinkMsg({ tone: 'danger', text: 'Enter the email your child uses for FuturePath.' });
      return;
    }
    setLinking(true);
    setLinkMsg(null);
    try {
      const res = await ApiService.linkStudent(email.trim(), 'Parent');
      setLinkMsg({ tone: 'leaf', text: res.message || 'Request sent. You’ll see the report once your child approves.' });
      setEmail('');
      load();
    } catch (err: any) {
      setLinkMsg({ tone: 'danger', text: err.message || 'We couldn’t send the request.' });
    } finally {
      setLinking(false);
    }
  };

  if (loading) {
    return <div className="flex flex-col gap-6"><Skeleton className="h-12 w-72" /><Skeleton className="h-56 rounded-3xl" /><Skeleton className="h-80 rounded-3xl" /></div>;
  }

  const children: any[] = data?.linkedStudents || [];
  const child = children[childIndex];
  const linkForm = (
    <form onSubmit={link} className="flex flex-col gap-4">
      <Field label="Your child’s FuturePath email" htmlFor="link-email" hint="We’ll ask them to approve before you can see anything.">
        <input id="link-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="field-input" />
      </Field>
      {linkMsg && <Alert tone={linkMsg.tone}>{linkMsg.text}</Alert>}
      <Button type="submit" loading={linking} className="self-start"><UserPlus className="h-4 w-4" aria-hidden="true" />Send link request</Button>
    </form>
  );

  if (!child) {
    return (
      <div className="flex flex-col gap-6">
        <PageHeader title={`Welcome, ${user?.name?.split(' ')[0] || ''}`} subtitle="Link to your child’s account to follow their progress." leading={<Character who="sunita" size={56} />} />
        <section className="grid items-center gap-8 rounded-4xl border border-line bg-white p-7 sm:p-10 lg:grid-cols-[auto_1fr]">
          <Dhruv pose="wave" size={150} decorative />
          <div className="flex flex-col gap-5">
            <h2 className="font-display text-2xl font-bold">Connect to your child’s FuturePath</h2>
            <p className="leading-relaxed text-ink-2">Once linked, you’ll see the same report, matches and plan — and you can use the cost planner together.</p>
            {linkForm}
          </div>
        </section>
      </div>
    );
  }

  const readiness = Object.entries<number>(child.latestAssessment?.readinessProfile || {}).sort((a, b) => b[1] - a[1]);
  const strengths: string[] = child.latestAssessment?.topStrengths || [];
  const plan = roadmapProgress(child.activeRoadmap);
  const childFirst = child.studentName?.split(' ')[0];
  const pending = child.status && child.status !== 'APPROVED' && child.status !== 'ACTIVE';
  const share = `${childFirst}'s FuturePath report: recommended stream ${readiness[0]?.[0] || '—'}. Top careers: ${(child.topCareers || []).slice(0, 3).map((c: any) => c.title).join(', ')}.`;

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        leading={<Character who="aarav" mood="wave" size={64} />}
        title={`${childFirst}’s progress`}
        subtitle={`${classLabel(child.currentClass)} · ${child.board || 'Board not set'} · ${child.studentEmail}`}
        actions={
          <>
            {children.length > 1 && (
              <>
                <label htmlFor="child-select" className="sr-only">Choose child</label>
                <select id="child-select" value={childIndex} onChange={(e) => setChildIndex(Number(e.target.value))} className="min-h-[44px] rounded-xl border border-line-strong bg-white px-3 font-semibold">
                  {children.map((c, i) => <option key={c.linkId} value={i}>{c.studentName}</option>)}
                </select>
              </>
            )}
            {child.latestAssessment && (
              <Button variant="whatsapp" size="sm" href={`https://wa.me/?text=${encodeURIComponent(share)}`}><MessageCircle className="h-4 w-4" aria-hidden="true" />Share on WhatsApp</Button>
            )}
            <Button variant="secondary" size="sm" onClick={() => setShowLink((v) => !v)}><UserPlus className="h-4 w-4" aria-hidden="true" />Add a child</Button>
          </>
        }
      />

      {showLink && <section className="card p-6">{linkForm}</section>}
      {pending && <Alert tone="saffron">Waiting for {childFirst} to approve your link. You’ll see the full report after that.</Alert>}

      <div className="grid gap-6 xl:grid-cols-[2fr_1fr]">
        <section className="flex flex-col gap-5 rounded-4xl border border-line bg-white p-6 sm:p-8">
          <span className="eyebrow">In plain words</span>
          {child.latestAssessment ? (
            <>
              <h2 className="font-display text-[26px] font-bold leading-tight">
                {childFirst}’s best-fit stream is {readiness[0]?.[0] || '—'}.
              </h2>
              {strengths.length > 0 && (
                <p className="leading-relaxed text-ink-2">
                  Strongest areas: {strengths.slice(0, 3).map((s) => plainDimension(s).toLowerCase()).join(', ')}.
                </p>
              )}
              <div className="flex flex-col gap-2">
                {(child.topCareers || []).slice(0, 4).map((c: any) => (
                  <div key={c.title} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-mist px-4 py-3">
                    <span className="flex flex-col"><span className="font-bold">{c.title}</span><span className="text-sm text-ink-3">{c.category} · {c.salaryRange}</span></span>
                    <FitBadge score={c.matchScore} />
                  </div>
                ))}
              </div>
            </>
          ) : (
            <StateMessage compact pose="backpack" title={`${childFirst} hasn’t taken the test yet`} body="Once they finish the 25-minute discovery test, the report appears here." />
          )}
        </section>

        <section className="card flex flex-col gap-4 p-6">
          <h2 className="text-lg font-bold">Good questions to ask {childFirst}</h2>
          <ul className="flex list-disc flex-col gap-2.5 pl-5 leading-relaxed text-ink-2">
            <li>Which subject do you lose track of time in?</li>
            <li>{child.topCareers?.[0] ? `Does the day-to-day work of ${child.topCareers[0].title.split(' & ')[0]} sound fun to you?` : 'What kind of work sounds fun to you?'}</li>
            <li>How do you feel about two years of entrance exam preparation?</li>
          </ul>
        </section>
      </div>

      <section aria-label="Status" className="grid gap-3 sm:grid-cols-3">
        <div className="card flex flex-col gap-1 p-5"><span className="text-sm text-ink-3">Discovery test</span><span className="text-xl font-bold">{child.latestAssessment ? <span className="text-leaf-700">Completed</span> : 'Not yet'}</span></div>
        <div className="card flex flex-col gap-2 p-5">
          <span className="text-sm text-ink-3">Plan</span>
          <span className="text-xl font-bold">{child.activeRoadmap ? `${plan.done} of ${plan.total} tasks` : 'Not started'}</span>
          {child.activeRoadmap && <ProgressBar value={plan.done} max={plan.total || 1} tone="saffron" label="Plan progress" />}
        </div>
        <div className="card flex flex-col gap-2 p-5">
          <span className="text-sm text-ink-3">Profile</span>
          <span className="text-xl font-bold">{child.completionScore}% complete</span>
          <ProgressBar value={child.completionScore} label="Profile completion" />
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[3fr_2fr]">
        <section aria-labelledby="cost-title" className="card flex flex-col gap-5 p-6 sm:p-8">
          <div className="flex flex-col gap-1">
            <h2 id="cost-title" className="text-xl font-bold">Higher-education cost planner</h2>
            <p className="text-[15px] text-ink-3">Estimates for the full degree. Change the options to compare.</p>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <Field label="Field" htmlFor="cost-stream">
              <select id="cost-stream" value={cost.stream} onChange={(e) => setCost((c) => ({ ...c, stream: e.target.value }))} className="field-input">{STREAMS.map((s) => <option key={s}>{s}</option>)}</select>
            </Field>
            <Field label="College type" htmlFor="cost-type">
              <select id="cost-type" value={cost.collegeType} onChange={(e) => setCost((c) => ({ ...c, collegeType: e.target.value }))} className="field-input"><option value="GOVERNMENT">Government</option><option value="PRIVATE">Private</option></select>
            </Field>
            <Field label="City" htmlFor="cost-city">
              <select id="cost-city" value={cost.cityTier} onChange={(e) => setCost((c) => ({ ...c, cityTier: e.target.value }))} className="field-input"><option value="TIER_1">Metro / Tier 1</option><option value="TIER_2">Tier 2 city</option></select>
            </Field>
          </div>
          {estimate && (
            <>
              <dl className="divide-y divide-line overflow-hidden rounded-2xl border border-line">
                {[[`Tuition (${estimate.degreeDurationYears} years)`, estimate.totalTuitionINR], ['Hostel and living', estimate.totalLivingINR], ['Books and equipment', estimate.totalIncidentalsINR]].map(([k, v]) => (
                  <div key={k as string} className="flex justify-between gap-4 px-5 py-3.5"><dt className="text-ink-2">{k}</dt><dd className="font-semibold">{formatINR(v as number)}</dd></div>
                ))}
                <div className="flex justify-between gap-4 bg-mist px-5 py-4"><dt className="font-bold">Total estimate</dt><dd className="font-display text-2xl font-bold">{formatINR(estimate.totalEstimatedCostINR)}</dd></div>
              </dl>
              <p className="rounded-2xl bg-leaf-50 px-4 py-3 text-[15px] text-leaf-900">Saving about <strong>{formatINR(estimate.suggestedMonthlySavingsINR)} a month</strong> from now would cover it. <Link to="/scholarships" className="underline">See scholarships</Link></p>
              <p className="text-[13px] text-ink-3">{estimate.disclaimer}</p>
            </>
          )}
        </section>

        <div className="flex flex-col gap-6">
          <section className="flex flex-col gap-4 rounded-3xl bg-ink p-6 text-white">
            <div className="flex items-center gap-3">
              <Character who="ananya" size={52} />
              <h2 className="text-lg font-bold text-white">Talk to a counsellor</h2>
            </div>
            <p className="text-[15px] leading-relaxed text-night-text">Verified counsellors for a one-on-one family session about streams, exams and colleges.</p>
            <Button to="/counselors" variant="white" size="sm" className="self-start">See available counsellors</Button>
          </section>
          <section className="card flex flex-col gap-2.5 p-6">
            <h2 className="flex items-center gap-2 text-lg font-bold"><ShieldCheck className="h-5 w-5 text-leaf-600" aria-hidden="true" />Access and privacy</h2>
            <p className="text-[15px] leading-relaxed text-ink-2">
              Link status: <Badge tone={pending ? 'saffron' : 'leaf'}>{pending ? 'Waiting for approval' : 'Approved'}</Badge>
            </p>
            <p className="text-[15px] leading-relaxed text-ink-2">You see the report, matches and plan. Either of you can remove the link at any time.</p>
          </section>
        </div>
      </div>
    </div>
  );
};
