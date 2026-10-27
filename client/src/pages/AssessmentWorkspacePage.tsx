import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Check, WifiOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { ApiService } from '../services/api';
import type { AssessmentQuestion } from '../types';
import { Logo, Dhruv } from '../components/brand';
import { Alert, Badge, Button, ProgressBar, Spinner, StateMessage } from '../components/ui';
import { cn, plainDimension } from '../lib/utils';
import { clearProgress, loadProgress, saveProgress } from '../lib/testProgress';

const QUESTIONS_CACHE = 'futurepath_questions_cache';
const SECTION_SIZE = 10;
const SECTIONS = ['Thinking and reasoning', 'Solving problems', 'How you like to work', 'What matters to you'];
const CATEGORY_LABEL: Record<string, string> = { APTITUDE: 'Reasoning', WORK_STYLE: 'How you work', VALUE: 'What matters to you' };
const CHEERS = [
  'Take your time. There’s no timer.',
  'Nice and steady. Read each option fully.',
  'No right or wrong answers here — just be honest.',
  'Almost there. You’re doing great.',
];

const readCache = (): AssessmentQuestion[] => {
  try { return JSON.parse(localStorage.getItem(QUESTIONS_CACHE) || '[]'); } catch { return []; }
};

/** The strongest area inside one section, from the student's own answers — shown on the break screen. */
const sectionInsight = (qs: AssessmentQuestion[], answers: Record<string, number>) => {
  const totals: Record<string, { sum: number; n: number }> = {};
  qs.forEach((q) => {
    const pick = answers[q.id];
    if (pick === undefined) return;
    const max = Math.max(...q.options.map((o) => o.score)) || 1;
    const t = (totals[q.dimension] ||= { sum: 0, n: 0 });
    t.sum += (q.options[pick]?.score ?? 0) / max;
    t.n += 1;
  });
  const best = Object.entries(totals).sort((a, b) => b[1].sum / b[1].n - a[1].sum / a[1].n)[0];
  return best ? plainDimension(best[0]) : null;
};

export const AssessmentWorkspacePage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const initial = useMemo(() => loadProgress(), []);
  const [questions, setQuestions] = useState<AssessmentQuestion[]>(readCache);
  const [loading, setLoading] = useState(questions.length === 0);
  const [loadError, setLoadError] = useState(false);
  const [answers, setAnswers] = useState<Record<string, number>>(initial.answers);
  const [index, setIndex] = useState(initial.index);
  const [breaksSeen, setBreaksSeen] = useState<number[]>(initial.breaksSeen);
  const [onBreak, setOnBreak] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [offline, setOffline] = useState(typeof navigator !== 'undefined' && !navigator.onLine);

  const fetchQuestions = useCallback(() => {
    setLoadError(false);
    ApiService.getQuestions()
      .then((res) => {
        if (res.success && res.questions?.length) {
          setQuestions(res.questions);
          try { localStorage.setItem(QUESTIONS_CACHE, JSON.stringify(res.questions)); } catch { /* ignore */ }
        }
      })
      .catch(() => { if (readCache().length === 0) setLoadError(true); })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { fetchQuestions(); }, [fetchQuestions]);

  useEffect(() => {
    const on = () => setOffline(false);
    const off = () => setOffline(true);
    window.addEventListener('online', on);
    window.addEventListener('offline', off);
    return () => { window.removeEventListener('online', on); window.removeEventListener('offline', off); };
  }, []);

  const total = questions.length;
  const safeIndex = Math.min(index, Math.max(total - 1, 0));
  const q = questions[safeIndex];
  const section = Math.floor(safeIndex / SECTION_SIZE);
  const answered = questions.filter((x) => answers[x.id] !== undefined).length;
  const allDone = total > 0 && answered === total;
  const firstUnanswered = questions.findIndex((x) => answers[x.id] === undefined);

  const goTo = useCallback((i: number) => {
    const target = Math.max(0, Math.min(i, total - 1));
    // first time a student crosses into a new section, pause for a short break
    const boundary = target > safeIndex && target % SECTION_SIZE === 0 && target > 0 ? target / SECTION_SIZE : null;
    if (boundary !== null && !breaksSeen.includes(boundary)) {
      const seen = [...breaksSeen, boundary];
      setBreaksSeen(seen);
      setOnBreak(boundary);
      saveProgress({ index: target, breaksSeen: seen });
    } else {
      saveProgress({ index: target });
    }
    setIndex(target);
  }, [breaksSeen, safeIndex, total]);

  const choose = useCallback((optionIndex: number) => {
    if (!q) return;
    const next = { ...answers, [q.id]: optionIndex };
    setAnswers(next);
    saveProgress({ answers: next });
    if (safeIndex < total - 1) window.setTimeout(() => goTo(safeIndex + 1), 280);
  }, [answers, goTo, q, safeIndex, total]);

  // number keys 1–4 pick an answer, arrows move between questions
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (onBreak !== null || !q || e.target instanceof HTMLInputElement || e.metaKey || e.ctrlKey) return;
      const n = Number(e.key);
      if (n >= 1 && n <= q.options.length) choose(n - 1);
      else if (e.key === 'ArrowRight' && answers[q.id] !== undefined) goTo(safeIndex + 1);
      else if (e.key === 'ArrowLeft') goTo(safeIndex - 1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [answers, choose, goTo, onBreak, q, safeIndex]);

  const finish = async () => {
    if (!allDone) {
      goTo(firstUnanswered);
      return;
    }
    if (!user) {
      navigate('/assessment/save');
      return;
    }
    if (user.role !== 'STUDENT') {
      setSubmitError('Results are saved to student accounts. Log in as the student to see the report.');
      return;
    }
    setSubmitting(true);
    setSubmitError(null);
    try {
      const res = await ApiService.submitAssessment(answers);
      if (res.success) {
        clearProgress();
        navigate('/assessment/results', { replace: true });
      }
    } catch (err: any) {
      setSubmitError(offline ? 'You’re offline. Your answers are safe — submit again when you’re back online.' : err.message || 'We couldn’t submit your answers. They’re saved; please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const header = (
    <header className="sticky top-0 z-20 border-b border-line bg-white">
      <div className="mx-auto flex max-w-[1120px] flex-wrap items-center gap-x-5 gap-y-2 px-4 py-3 sm:px-6">
        <Link to="/" aria-label="FuturePath AI home" className="flex items-center gap-2.5">
          <Logo variant="icon" height={36} />
          <span className="hidden font-bold sm:inline">Discovery test</span>
        </Link>
        {total > 0 && (
          <div className="order-3 flex w-full flex-col gap-1.5 sm:order-none sm:w-auto sm:flex-1">
            <div className="flex justify-between text-sm">
              <span className="font-semibold">Section {section + 1} of {SECTIONS.length} · {SECTIONS[section]}</span>
              <span className="text-ink-3">{answered} of {total} answered</span>
            </div>
            <ProgressBar value={answered} max={total} label="Test progress" />
          </div>
        )}
        <Button variant="secondary" size="sm" to={user ? '/dashboard' : '/'} className="ml-auto sm:ml-0">Save and exit</Button>
      </div>
    </header>
  );

  if (loading) {
    return <div className="min-h-screen bg-mist">{header}<Spinner label="Getting your questions" /></div>;
  }

  if (loadError || total === 0) {
    return (
      <div className="min-h-screen bg-mist">
        {header}
        <StateMessage
          pose={offline ? 'sleep' : 'think'}
          title={offline ? 'You’re offline' : 'We couldn’t load the test'}
          body={offline ? 'Connect once to download the questions. After that, the test works offline.' : 'Please check your connection and try again. Nothing you answered is lost.'}
          action={<Button onClick={() => { setLoading(true); fetchQuestions(); }}>Try again</Button>}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-mist">
      {header}
      {offline && (
        <div role="status" className="flex items-center justify-center gap-2 bg-saffron-50 px-4 py-2.5 text-sm font-semibold text-saffron-900">
          <WifiOff className="h-4 w-4" aria-hidden="true" /> You’re offline. Keep answering — everything is saved on this device.
        </div>
      )}

      <div className="mx-auto grid max-w-[1120px] gap-8 px-4 py-8 sm:px-6 lg:grid-cols-[240px_1fr] lg:py-10">
        <nav aria-label="Test sections" className="hidden flex-col gap-2 lg:flex">
          <p className="mb-1 text-[13px] font-bold uppercase tracking-[0.08em] text-ink-3">Sections</p>
          {SECTIONS.map((name, i) => {
            const qs = questions.slice(i * SECTION_SIZE, (i + 1) * SECTION_SIZE);
            const done = qs.length > 0 && qs.every((x) => answers[x.id] !== undefined);
            const current = i === section;
            return (
              <button
                key={name}
                type="button"
                onClick={() => goTo(i * SECTION_SIZE)}
                className={cn(
                  'flex flex-col gap-0.5 rounded-xl px-3.5 py-3 text-left',
                  current ? 'border-2 border-royal-500 bg-white' : done ? 'border border-leaf-50 bg-leaf-50' : 'border border-line hover:bg-white'
                )}
              >
                <span className="flex items-center gap-1.5 text-[15px] font-bold">{done && <Check className="h-4 w-4 text-leaf-600" aria-hidden="true" />}{name}</span>
                <span className="text-sm text-ink-3">{done ? 'Completed' : current ? 'In progress' : `${qs.length} questions`}</span>
              </button>
            );
          })}
          <div className="mt-4 flex items-end gap-2">
            <Dhruv pose="thumbsup" size={64} decorative />
            <p className="rounded-[16px_16px_16px_4px] border border-line bg-white px-3.5 py-3 text-sm leading-snug">{CHEERS[section] || CHEERS[0]}</p>
          </div>
        </nav>

        <main id="main" className="flex min-w-0 flex-col gap-5">
          {onBreak !== null ? (
            <section className="animate-pop flex flex-col items-center gap-6 rounded-3xl border border-line bg-white p-8 text-center sm:flex-row sm:p-10 sm:text-left">
              <Dhruv pose={onBreak === SECTIONS.length - 1 ? 'cheer' : 'relax'} size={180} decorative />
              <div className="flex flex-col gap-4">
                <Badge tone="leaf" className="self-center sm:self-start">Section {onBreak} complete</Badge>
                <h1 className="font-display text-3xl font-bold leading-tight tracking-tight">Nice work! Here’s an early insight.</h1>
                {(() => {
                  const insight = sectionInsight(questions.slice((onBreak - 1) * SECTION_SIZE, onBreak * SECTION_SIZE), answers);
                  return insight ? (
                    <p className="rounded-2xl bg-royal-50 px-5 py-4 text-left text-base leading-relaxed">
                      So far, your strongest area looks like <strong>{insight.toLowerCase()}</strong>. Your full report will show how this connects to streams and careers.
                    </p>
                  ) : null;
                })()}
                <p className="text-[15px] text-ink-3">Take a minute — stretch, drink some water. Next up: {SECTIONS[onBreak]}.</p>
                <Button onClick={() => setOnBreak(null)} className="self-center sm:self-start">Start section {onBreak + 1}</Button>
              </div>
            </section>
          ) : q ? (
            <>
              <section aria-labelledby="question-prompt" className="flex flex-col gap-7 rounded-3xl border border-line bg-white p-6 sm:p-10">
                <div className="flex flex-col gap-3">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <Badge tone="saffron">{CATEGORY_LABEL[q.category] || q.category}</Badge>
                    <span className="text-sm text-ink-3">Question {safeIndex + 1} of {total}</span>
                  </div>
                  <h1 id="question-prompt" className="font-display text-2xl font-semibold leading-snug tracking-tight sm:text-[28px]">{q.prompt}</h1>
                </div>
                <div role="radiogroup" aria-labelledby="question-prompt" className="flex flex-col gap-3">
                  {q.options.map((o, i) => {
                    const selected = answers[q.id] === i;
                    return (
                      <button
                        key={i}
                        type="button"
                        role="radio"
                        aria-checked={selected}
                        onClick={() => choose(i)}
                        className={cn(
                          'flex min-h-[60px] items-center gap-4 rounded-2xl px-4 py-3.5 text-left text-base font-medium transition-colors sm:text-[17px]',
                          selected ? 'border-2 border-royal-500 bg-royal-50' : 'border border-line-strong bg-white hover:border-royal-300'
                        )}
                      >
                        <span className={cn('flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-sm font-bold', selected ? 'bg-royal-500 text-white' : 'bg-mist text-ink-2')}>
                          {String.fromCharCode(65 + i)}
                        </span>
                        <span className="leading-snug">{o.text}</span>
                      </button>
                    );
                  })}
                </div>
                <p className="hidden text-sm text-ink-3 sm:block">Tip: press 1–{q.options.length} to answer, and ← → to move.</p>
              </section>

              {submitError && <Alert>{submitError}</Alert>}

              <div className="flex flex-wrap items-center justify-between gap-3">
                <Button variant="secondary" onClick={() => goTo(safeIndex - 1)} disabled={safeIndex === 0}>
                  <ArrowLeft className="h-4 w-4" aria-hidden="true" />Previous
                </Button>
                <span className="order-3 flex w-full items-center justify-center gap-1.5 text-sm text-ink-3 sm:order-none sm:w-auto">
                  <Check className="h-4 w-4 text-leaf-600" aria-hidden="true" />Saved on this device
                </span>
                {safeIndex < total - 1 && !allDone ? (
                  <Button onClick={() => goTo(safeIndex + 1)} disabled={answers[q.id] === undefined}>
                    Next<ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </Button>
                ) : (
                  <Button onClick={finish} loading={submitting}>
                    {allDone ? 'See my results' : `Answer ${total - answered} more`}
                  </Button>
                )}
              </div>
            </>
          ) : null}
        </main>
      </div>
    </div>
  );
};
