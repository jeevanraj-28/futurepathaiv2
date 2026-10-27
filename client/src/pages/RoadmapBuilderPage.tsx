import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Download, FileText, Plus } from 'lucide-react';
import { ApiService } from '../services/api';
import { Dhruv } from '../components/brand';
import { Alert, Badge, Button, Field, PageHeader, ProgressBar, Skeleton } from '../components/ui';
import { TaskList, currentMilestoneIndex, roadmapProgress, type Roadmap } from '../components/Milestone';
import { cn } from '../lib/utils';

const THIS_YEAR = new Date().getFullYear();
const YEARS = [1, 2, 3, 4, 5].map((n) => String(THIS_YEAR + n));

export const RoadmapBuilderPage: React.FC = () => {
  const [params] = useSearchParams();
  const [roadmaps, setRoadmaps] = useState<Roadmap[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<Array<{ title: string; slug: string }>>([]);
  const [career, setCareer] = useState(params.get('career') || '');
  const [year, setYear] = useState(YEARS[2]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [showForm, setShowForm] = useState(!!params.get('career'));
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      ApiService.getRoadmaps().catch(() => ({ success: false, roadmaps: [] })),
      ApiService.getStudentDashboard().catch(() => null),
    ]).then(([r, d]: any) => {
      const list: Roadmap[] = r?.roadmaps || [];
      setRoadmaps(list);
      setActiveId(list[0]?.id || null);
      setSuggestions((d?.dashboard?.topRecommendations || []).slice(0, 4).map((x: any) => ({ title: x.title, slug: x.slug })));
      if (!list.length) setShowForm(true);
    }).finally(() => setLoading(false));
  }, []);

  const active = roadmaps.find((r) => r.id === activeId) || null;
  const progress = roadmapProgress(active);
  const current = currentMilestoneIndex(active);

  const create = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!career.trim()) {
      setError('Choose or type a career for your plan.');
      return;
    }
    setCreating(true);
    setError(null);
    try {
      const res = await ApiService.generateRoadmap(career.trim(), year);
      if (res.success) {
        const r: Roadmap = { ...res.roadmap, targetYear: year };
        setRoadmaps((list) => [r, ...list]);
        setActiveId(r.id);
        setShowForm(false);
        setCareer('');
      }
    } catch (err: any) {
      setError(err.message || 'We couldn’t create the plan. Please try again.');
    } finally {
      setCreating(false);
    }
  };

  const toggle = async (mi: number, ti: number) => {
    if (!active) return;
    setBusy(`${mi}-${ti}`);
    try {
      const res = await ApiService.toggleRoadmapTask(active.id, mi, ti);
      if (res.success) setRoadmaps((list) => list.map((r) => (r.id === active.id ? { ...r, milestones: res.roadmap.milestones } : r)));
    } catch {
      setError('That change didn’t save. Please try again.');
    } finally {
      setBusy(null);
    }
  };

  if (loading) {
    return <div className="flex flex-col gap-6"><Skeleton className="h-10 w-64" /><Skeleton className="h-36 rounded-3xl" /><Skeleton className="h-96 rounded-3xl" /></div>;
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="My plan"
        subtitle="Your report and the steps that turn it into action."
        actions={
          <>
            <Button variant="secondary" size="sm" to="/assessment/results"><FileText className="h-4 w-4" aria-hidden="true" />My report</Button>
            {active && <Button variant="secondary" size="sm" onClick={() => window.print()}><Download className="h-4 w-4" aria-hidden="true" />PDF</Button>}
            {roadmaps.length > 0 && !showForm && <Button size="sm" onClick={() => setShowForm(true)}><Plus className="h-4 w-4" aria-hidden="true" />New plan</Button>}
          </>
        }
      />

      {error && <Alert>{error}</Alert>}

      {showForm && (
        <section aria-labelledby="create-title" className="flex flex-wrap items-start gap-6 rounded-4xl border border-line bg-white p-6 sm:p-8 print:hidden">
          <Dhruv pose="read" size={110} decorative />
          <form onSubmit={create} className="flex min-w-0 flex-1 basis-[360px] flex-col gap-5">
            <div className="flex flex-col gap-1.5">
              <h2 id="create-title" className="font-display text-2xl font-bold">Build a plan for a career</h2>
              <p className="text-ink-2">You’ll get tasks for the next 30 days, 90 days and year — based on the exams and skills that career needs.</p>
            </div>
            {suggestions.length > 0 && (
              <div className="flex flex-col gap-2">
                <span className="text-[15px] font-semibold">From your matches</span>
                <div className="flex flex-wrap gap-2">
                  {suggestions.map((s) => (
                    <button
                      key={s.slug}
                      type="button"
                      aria-pressed={career === s.title}
                      onClick={() => setCareer(s.title)}
                      className={cn('min-h-[44px] rounded-full px-4 text-[15px] font-semibold', career === s.title ? 'bg-royal-500 text-white' : 'border border-line-strong bg-white hover:border-royal-300')}
                    >
                      {s.title}
                    </button>
                  ))}
                </div>
              </div>
            )}
            <div className="grid gap-4 sm:grid-cols-[1fr_180px]">
              <Field label="Career" htmlFor="plan-career">
                <input id="plan-career" value={career} onChange={(e) => setCareer(e.target.value)} placeholder="e.g. Data Scientist" className="field-input" />
              </Field>
              <Field label="Target year" htmlFor="plan-year">
                <select id="plan-year" value={year} onChange={(e) => setYear(e.target.value)} className="field-input">
                  {YEARS.map((y) => <option key={y}>{y}</option>)}
                </select>
              </Field>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button type="submit" loading={creating}>Create my plan</Button>
              {roadmaps.length > 0 && <Button variant="secondary" onClick={() => setShowForm(false)}>Cancel</Button>}
            </div>
          </form>
        </section>
      )}

      {roadmaps.length > 1 && (
        <div role="tablist" aria-label="Your plans" className="flex gap-2 overflow-x-auto print:hidden">
          {roadmaps.map((r) => (
            <button
              key={r.id}
              role="tab"
              type="button"
              aria-selected={r.id === activeId}
              onClick={() => setActiveId(r.id)}
              className={cn('min-h-[44px] shrink-0 rounded-full px-4 text-[15px] font-semibold', r.id === activeId ? 'bg-ink text-white' : 'border border-line-strong bg-white')}
            >
              {r.careerTitle}
            </button>
          ))}
        </div>
      )}

      {active && (
        <>
          <section className="flex flex-wrap items-center justify-between gap-6 rounded-4xl bg-ink p-7 text-white sm:p-9">
            <div className="flex flex-1 basis-[300px] flex-col gap-3">
              <span className="text-sm font-bold uppercase tracking-[0.08em] text-saffron-300">Plan · target {active.targetYear || '—'}</span>
              <h2 className="font-display text-3xl font-bold text-white">{active.careerTitle}</h2>
              <div className="flex max-w-md flex-col gap-2">
                <div className="flex justify-between text-sm text-night-text"><span>{progress.done} of {progress.total} tasks done</span><span>{progress.pct}%</span></div>
                <ProgressBar value={progress.done} max={progress.total || 1} tone="saffron" className="bg-night-3" label="Plan progress" />
              </div>
            </div>
            <Dhruv pose={progress.pct === 100 ? 'celebrate' : 'run'} size={120} className="print:hidden" decorative />
          </section>

          <ol className="flex flex-col">
            {active.milestones.map((m, mi) => {
              const done = m.tasks.every((t) => t.completed);
              const isCurrent = mi === current && !done;
              return (
                <li key={m.period} className="flex gap-4 sm:gap-6">
                  <div className="flex flex-col items-center">
                    <span className={cn('flex h-10 w-10 shrink-0 items-center justify-center rounded-full font-bold', done ? 'bg-leaf-600 text-white' : isCurrent ? 'bg-royal-500 text-white' : 'bg-white text-ink-3 ring-1 ring-line-strong')}>{mi + 1}</span>
                    {mi < active.milestones.length - 1 && <span className="my-1 w-0.5 flex-1 bg-line-strong" />}
                  </div>
                  <section className={cn('mb-6 flex min-w-0 flex-1 flex-col gap-4 rounded-3xl bg-white p-5 sm:p-6', isCurrent ? 'border-2 border-royal-500' : 'border border-line')}>
                    <div className="flex flex-wrap items-center gap-2.5">
                      <span className="text-sm font-bold text-royal-500">{m.period}</span>
                      {isCurrent && <Badge tone="royal">Now</Badge>}
                      {done && <Badge tone="leaf">Done</Badge>}
                    </div>
                    <h3 className="text-xl font-bold">{m.title}</h3>
                    <TaskList tasks={m.tasks} onToggle={(ti) => toggle(mi, ti)} busyIndex={busy?.startsWith(`${mi}-`) ? Number(busy.split('-')[1]) : null} />
                  </section>
                </li>
              );
            })}
          </ol>

          <section className="flex flex-wrap items-center justify-between gap-4 rounded-3xl bg-royal-50 p-6 print:hidden">
            <p className="text-[15px] font-semibold text-royal-600">Want a person to check this plan with you?</p>
            <div className="flex flex-wrap gap-2.5">
              <Button size="sm" to={`/mentor?q=${encodeURIComponent(`Help me with my ${active.careerTitle} plan`)}`}>Ask Dhruv</Button>
              <Button size="sm" variant="secondary" to="/counselors">Book a counsellor</Button>
            </div>
          </section>
        </>
      )}

      {!active && !showForm && (
        <p className="text-ink-2">No plans yet. <Link to="/plan?career=" className="link" onClick={() => setShowForm(true)}>Create your first plan</Link></p>
      )}
    </div>
  );
};
