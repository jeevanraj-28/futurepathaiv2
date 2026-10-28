import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Bookmark, GraduationCap, MessageCircle } from 'lucide-react';
import { ApiService } from '../services/api';
import { useAuth } from '../context/auth';
import { Dhruv } from '../components/brand';
import { Character } from '../components/Character';
import { Alert, Button, FitBadge, PageHeader, ProgressBar, Skeleton, StateMessage } from '../components/ui';
import { TaskList } from '../components/Milestone';
import { currentMilestoneIndex, roadmapProgress, type Roadmap } from '../lib/roadmap';
import { classLabel, cn, formatLPA } from '../lib/utils';
import { ParentLinks } from '../components/ParentLinks';
import { answeredCount, loadProgress } from '../lib/testProgress';
import { useT, type MessageKey } from '../lib/i18n';
import { LanguageToggle } from '../components/LanguageToggle';

const greetingKey = (): MessageKey => {
  const h = new Date().getHours();
  return h < 12 ? 'greet_morning' : h < 17 ? 'greet_afternoon' : 'greet_evening';
};

export const StudentDashboardPage: React.FC = () => {
  const { user } = useAuth();
  const { t } = useT();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<number | null>(null);
  const localAnswers = useMemo(() => answeredCount(loadProgress()), []);

  const load = () =>
    ApiService.getStudentDashboard()
      .then((res) => { if (res.success) { setData(res.dashboard); setError(null); } })
      .catch((err) => setError(err.message || 'Could not load your home.'))
      .finally(() => setLoading(false));

  useEffect(() => { load(); }, []);

  const roadmap: Roadmap | null = data?.activeRoadmap || null;
  const mi = currentMilestoneIndex(roadmap);
  const milestone = roadmap?.milestones[mi];
  const progress = roadmapProgress(roadmap);
  const firstName = (data?.studentName || user?.name || '').split(' ')[0];

  const toggle = async (taskIndex: number) => {
    if (!roadmap) return;
    setBusy(taskIndex);
    try {
      const res = await ApiService.toggleRoadmapTask(roadmap.id, mi, taskIndex);
      if (res.success) { setData((d: any) => ({ ...d, activeRoadmap: { ...d.activeRoadmap, milestones: res.roadmap.milestones } })); load(); }
    } catch {
      setError('That change didn’t save. Please try again.');
    } finally {
      setBusy(null);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col gap-6">
        <Skeleton className="h-10 w-80" />
        <Skeleton className="h-40 rounded-3xl" />
        <div className="grid gap-6 lg:grid-cols-[2fr_1fr]"><Skeleton className="h-80 rounded-3xl" /><Skeleton className="h-80 rounded-3xl" /></div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="card">
        <StateMessage pose="think" title="We couldn’t load your home" body={error || 'Please check your connection and try again.'} action={<Button onClick={() => { setLoading(true); load(); }}>{t('try_again')}</Button>} />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={`${t(greetingKey())}, ${firstName}`}
        subtitle={
          roadmap ? t('dash_sub_plan', { pct: progress.pct, career: roadmap.careerTitle })
            : data.assessmentCompleted ? t('dash_sub_report')
              : t('dash_sub_start')
        }
        actions={
          <>
          <LanguageToggle />
          <span className="inline-flex items-center gap-2 rounded-full bg-white px-3.5 py-2 text-sm font-semibold text-ink-2 ring-1 ring-line">
            <GraduationCap className="h-4 w-4 text-royal-500" aria-hidden="true" />{classLabel(data.currentClass)} · {data.board || 'Board not set'}
          </span>
          </>
        }
      />

      {error && <Alert>{error}</Alert>}

      {/* Primary next step */}
      {!data.assessmentCompleted ? (
        <section className="flex flex-wrap items-center gap-6 rounded-4xl bg-ink p-7 text-white sm:p-9">
          <Dhruv pose="backpack" size={130} decorative />
          <div className="flex flex-1 basis-[300px] flex-col gap-3">
            <span className="text-sm font-bold uppercase tracking-[0.08em] text-saffron-300">{t('dash_first_step')}</span>
            <h2 className="font-display text-[28px] font-bold leading-tight text-white">{localAnswers > 0 ? t('dash_answered', { n: localAnswers }) : t('dash_take_test')}</h2>
            <p className="text-night-text">{t('dash_test_body')}</p>
            {localAnswers > 0 && <ProgressBar value={localAnswers} max={40} tone="saffron" className="max-w-sm bg-night-3" label="Test progress" />}
          </div>
          <Button to={localAnswers > 0 ? '/assessment' : '/start'} variant="white" size="lg">{localAnswers > 0 ? t('dash_resume') : t('dash_start_test')}</Button>
        </section>
      ) : roadmap ? (
        <section className="flex flex-wrap items-center justify-between gap-6 rounded-4xl bg-ink p-7 text-white sm:p-9">
          <div className="flex flex-1 basis-[320px] flex-col gap-3">
            <span className="text-sm font-bold uppercase tracking-[0.08em] text-saffron-300">{t('dash_continue')}</span>
            <h2 className="font-display text-[26px] font-bold leading-tight text-white">{milestone?.title} · {roadmap.careerTitle}</h2>
            <div className="flex max-w-md flex-col gap-2">
              <div className="flex justify-between text-sm text-night-text"><span>{t('tasks_done', { done: progress.done, total: progress.total })}</span><span>{milestone?.period}</span></div>
              <ProgressBar value={progress.done} max={progress.total || 1} tone="saffron" className="bg-night-3" label="Plan progress" />
            </div>
          </div>
          <Button to="/plan" variant="white">{t('dash_open_plan')}</Button>
        </section>
      ) : (
        <section className="flex flex-wrap items-center gap-6 rounded-4xl bg-ink p-7 text-white sm:p-9">
          <Dhruv pose="read" size={120} decorative />
          <div className="flex flex-1 basis-[300px] flex-col gap-2">
            <h2 className="font-display text-[26px] font-bold text-white">{t('dash_build_plan')}</h2>
            <p className="text-night-text">{t('dash_build_body')}</p>
          </div>
          <Button to="/plan" variant="white" size="lg">{t('report_create_plan')}</Button>
        </section>
      )}

      <div className="grid items-start gap-6 xl:grid-cols-[2fr_1fr]">
        <div className="flex min-w-0 flex-col gap-6">
          {roadmap && milestone && (
            <section aria-labelledby="week-title" className="card flex flex-col gap-4 p-6">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h2 id="week-title" className="text-xl font-bold">{t('dash_right_now')}: {milestone.period.replace(/\s*\(.*\)/, '')}</h2>
                <span className="text-sm text-ink-3">{t('dash_tap')}</span>
              </div>
              <TaskList tasks={milestone.tasks} onToggle={toggle} busyIndex={busy} />
            </section>
          )}

          <section aria-labelledby="matches-title" className="card flex flex-col gap-4 p-6">
            <div className="flex items-center justify-between gap-3">
              <h2 id="matches-title" className="text-xl font-bold">{t('dash_matches')}</h2>
              {data.assessmentCompleted && <Link to="/assessment/results" className="link text-[15px]">{t('full_report')}</Link>}
            </div>
            {data.topRecommendations?.length ? (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {data.topRecommendations.slice(0, 3).map((r: any) => (
                  <Link key={r.careerId} to={`/careers/${r.slug}`} className="flex flex-col gap-2 rounded-2xl border border-line p-5 hover:border-royal-300">
                    <FitBadge score={r.matchScore} />
                    <span className="text-base font-bold">{r.title}</span>
                    <span className="text-sm text-ink-3">{formatLPA(r.salaryMinINR, r.salaryMaxINR)}</span>
                  </Link>
                ))}
              </div>
            ) : (
              <StateMessage compact pose="relax" title={t('dash_no_matches')} body={t('dash_no_matches_body')} action={<Button size="sm" to="/start">{t('dash_start_test')}</Button>} />
            )}
          </section>
        </div>

        <div className="flex min-w-0 flex-col gap-6">
          <ParentLinks pendingOnly onChange={load} />

          {data.assessmentCompleted && (
            <section aria-labelledby="streak-title" className="card flex items-center gap-4 p-5">
              <Dhruv pose={data.weeklyStreak > 0 ? 'cheer' : 'run'} size={84} decorative />
              <div className="flex flex-1 flex-col gap-2">
                <h2 id="streak-title" className="font-display text-xl font-bold">
                  {data.weeklyStreak > 0 ? t('streak_title', { n: data.weeklyStreak }) : t('streak_start')}
                </h2>
                <div role="img" aria-label={`${t('streak_weeks')}: ${(data.recentWeeks || []).filter(Boolean).length}/6`} className="flex gap-1.5">
                  {(data.recentWeeks || []).map((active: boolean, i: number) => (
                    <span
                      key={i}
                      className={cn(
                        'h-2.5 w-7 rounded-full',
                        active ? 'bg-saffron-500' : i === 5 ? 'border-2 border-dashed border-saffron-500' : 'bg-line'
                      )}
                    />
                  ))}
                </div>
                <p className="text-sm text-ink-3">
                  {data.thisWeekDone > 0 ? t('streak_done', { n: data.thisWeekDone }) : data.weeklyStreak > 0 ? t('streak_keep') : t('streak_begin')}
                </p>
              </div>
            </section>
          )}

          <section aria-labelledby="dhruv-title" className="card flex flex-col gap-3.5 p-6">
            <div className="flex items-center gap-3">
              <Dhruv pose="think" size={56} decorative />
              <div className="flex flex-col">
                <h2 id="dhruv-title" className="text-xl font-bold">{t('dash_ask')}</h2>
                <span className="text-sm text-ink-3">AI mentor · cites official sources</span>
              </div>
            </div>
            {['Is PCMB too much workload for me?', 'Which entrance exams should I plan for?'].map((q) => (
              <Link key={q} to={`/mentor?q=${encodeURIComponent(q)}`} className="rounded-xl border border-line bg-mist px-4 py-3 text-[15px] hover:border-royal-300">{q}</Link>
            ))}
            <div className="flex items-center gap-3 border-t border-line pt-3.5">
              <Character who="ananya" size={40} animate={false} />
              <span className="text-sm text-ink-2">Prefer a person? <Link to="/counselors" className="link">Book a counsellor</Link></span>
            </div>
          </section>

          <section aria-label="Saved" className="grid grid-cols-2 gap-3">
            <Link to="/careers" className="card flex flex-col gap-1 p-5 hover:border-royal-300">
              <Bookmark className="h-5 w-5 text-royal-500" aria-hidden="true" />
              <span className="mt-1 font-display text-2xl font-bold">{data.savedCareersCount}</span>
              <span className="text-sm text-ink-3">{t('dash_saved_careers')}</span>
            </Link>
            <Link to="/colleges" className="card flex flex-col gap-1 p-5 hover:border-royal-300">
              <GraduationCap className="h-5 w-5 text-royal-500" aria-hidden="true" />
              <span className="mt-1 font-display text-2xl font-bold">{data.savedCollegesCount}</span>
              <span className="text-sm text-ink-3">{t('dash_saved_colleges')}</span>
            </Link>
          </section>

          {data.completionScore < 80 && (
            <section className="card flex flex-col gap-3 p-6">
              <div className="flex items-center justify-between"><h2 className="text-lg font-bold">{t('dash_profile')}</h2><span className="font-bold text-royal-600">{data.completionScore}%</span></div>
              <ProgressBar value={data.completionScore} label="Profile strength" />
              <p className="text-sm leading-relaxed text-ink-2">Add your favourite subjects and budget to sharpen your matches.</p>
              <Button to="/onboarding" variant="secondary" size="sm" className="self-start">Complete profile</Button>
            </section>
          )}

          {!data.isPremium && (
            <section className="flex flex-col gap-3 rounded-3xl bg-royal-50 p-6">
              <h2 className="text-lg font-bold">See every match</h2>
              <p className="text-sm leading-relaxed text-ink-2">Premium unlocks all matches, your full plan and unlimited chats with Dhruv.</p>
              <Button to="/pricing" size="sm" className="self-start">See plans</Button>
            </section>
          )}

          <Link to="/mentor" className="flex items-center gap-3 rounded-2xl bg-leaf-50 px-5 py-4 text-[15px] font-semibold text-leaf-900">
            <MessageCircle className="h-5 w-5" aria-hidden="true" />Stuck on something? Dhruv can help any time.
          </Link>
        </div>
      </div>
    </div>
  );
};
