import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Check } from 'lucide-react';
import { useAuth } from '../context/auth';
import { ApiService } from '../services/api';
import { Logo, Dhruv } from '../components/brand';
import { Button, ChoiceTile } from '../components/ui';
import { Character } from '../components/Character';
import { BOARD_OPTIONS, answeredCount, loadProgress, saveProgress, toServerClass } from '../lib/testProgress';

type Grade = '9' | '10' | '11' | '12';

export const QuickStartPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const saved = loadProgress();
  const initialGrade = (params.get('class') === '12' ? '12' : (saved.grade || '10')) as Grade;
  const [grade, setGrade] = useState<Grade>(initialGrade);
  const [board, setBoard] = useState(saved.board || 'CBSE');
  const [starting, setStarting] = useState(false);
  const resumeCount = answeredCount(saved);

  const start = async () => {
    setStarting(true);
    saveProgress({ grade, board });
    if (user?.role === 'STUDENT') {
      // keep the profile in step for signed-in students; the test still works if this fails
      await ApiService.updateStudentProfile({ currentClass: toServerClass(grade), board }).catch(() => undefined);
    }
    navigate('/assessment');
  };

  return (
    <div className="flex min-h-screen flex-col bg-mist">
      <header className="border-b border-line bg-white">
        <div className="mx-auto flex h-[72px] max-w-[1120px] items-center justify-between px-6">
          <Link to="/" aria-label="FuturePath AI home"><Logo height={28} /></Link>
          {!user && (
            <p className="text-[15px] text-ink-3">
              Already started? <Link to="/login?next=/assessment" className="link">Log in</Link>
            </p>
          )}
        </div>
      </header>

      <main id="main" className="mx-auto grid w-full max-w-[1120px] flex-1 items-center gap-12 px-6 py-12 lg:grid-cols-2">
        <div className="flex flex-col gap-5">
          <Dhruv pose="backpack" size={170} bob decorative />
          <h1 className="h-display text-4xl sm:text-5xl">Let’s find what fits you. No sign-up needed.</h1>
          <p className="max-w-md text-lg leading-relaxed text-ink-2">
            Answer two quick questions and start straight away. Your answers save on this device, so you can stop and come back any time.
          </p>
          <ul className="flex flex-wrap gap-x-5 gap-y-2 text-[15px] text-ink-2">
            {['40 questions', 'About 25 minutes', 'Works offline'].map((t) => (
              <li key={t} className="flex items-center gap-1.5"><Check className="h-4 w-4 text-leaf-600" aria-hidden="true" />{t}</li>
            ))}
          </ul>
        </div>

        <div className="flex flex-col gap-7 rounded-4xl border border-line bg-white p-7 shadow-card sm:p-9">
          {resumeCount > 0 && (
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-royal-50 px-4 py-3">
              <span className="text-[15px] font-semibold text-royal-600">You’ve answered {resumeCount} of 40 already.</span>
              <Button size="sm" to="/assessment">Resume test</Button>
            </div>
          )}
          <fieldset className="flex flex-col gap-3">
            <legend className="mb-3 text-lg font-bold">1. Which class are you in?</legend>
            <div className="grid grid-cols-4 gap-2.5">
              {(['9', '10', '11', '12'] as Grade[]).map((g) => (
                <ChoiceTile key={g} selected={grade === g} onClick={() => setGrade(g)} className="text-center font-bold">Class {g}</ChoiceTile>
              ))}
            </div>
            <p className="text-sm text-ink-3">{grade === '9' || grade === '10' ? 'You’ll get stream guidance for Class 11.' : 'You’ll get degree, exam and career guidance.'}</p>
          </fieldset>
          <fieldset className="flex flex-col gap-3">
            <legend className="mb-3 text-lg font-bold">2. Your board</legend>
            <div className="grid grid-cols-2 gap-2.5">
              {BOARD_OPTIONS.map((b) => (
                <ChoiceTile key={b.value} selected={board === b.value} onClick={() => setBoard(b.value)} className="px-4 font-semibold">{b.label}</ChoiceTile>
              ))}
            </div>
          </fieldset>
          <Button size="lg" onClick={start} loading={starting}>{resumeCount > 0 ? 'Continue the test' : 'Start the discovery test'}</Button>
          <p className="text-center text-sm leading-relaxed text-ink-3">Subjects and values come up inside the test. You’ll only create an account to save your results.</p>
        </div>
      </main>

      <section aria-label="Other roles" className="border-t border-line bg-white">
        <div className="mx-auto flex max-w-[1120px] flex-wrap items-center gap-x-8 gap-y-3 px-6 py-5">
          <span className="text-[15px] font-semibold text-ink-2">Not a student?</span>
          <Link to="/register?role=PARENT" className="flex items-center gap-2.5 py-1 font-semibold"><Character who="sunita" size={44} animate={false} />I’m a parent →</Link>
          <Link to="/for-counselors" className="flex items-center gap-2.5 py-1 font-semibold"><Character who="fatima" size={44} animate={false} />I’m a teacher or counsellor →</Link>
          <Link to="/for-schools" className="flex items-center gap-2.5 py-1 font-semibold"><Character who="harjeet" size={44} animate={false} />I run a school →</Link>
        </div>
      </section>
    </div>
  );
};
