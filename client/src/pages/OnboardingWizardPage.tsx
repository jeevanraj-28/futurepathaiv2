import React, { useEffect, useState } from 'react';
import { ApiService } from '../services/api';
import { Alert, Button, ChoiceTile, Field, PageHeader, ProgressBar, Skeleton } from '../components/ui';
import { cn, parseList } from '../lib/utils';
import { BOARD_OPTIONS } from '../lib/testProgress';
import { ParentLinks } from '../components/ParentLinks';

const SUBJECTS = ['Mathematics', 'Physics', 'Chemistry', 'Biology', 'Computer Science', 'Economics', 'Accountancy', 'Business Studies', 'English', 'Hindi', 'History', 'Geography', 'Political Science', 'Psychology', 'Fine Arts', 'Physical Education'];
const SKILLS = ['Coding', 'Maths puzzles', 'Creative writing', 'Public speaking', 'Drawing and design', 'Building things', 'Science experiments', 'Managing money', 'Debating', 'Music', 'Sports', 'Organising events'];
const BUDGETS = ['Under ₹2 lakh', '₹2–5 lakh', '₹5–10 lakh', '₹10–20 lakh', 'Above ₹20 lakh'];

const Chips: React.FC<{ options: string[]; value: string[]; onChange: (v: string[]) => void; label: string; max?: number }> = ({ options, value, onChange, label, max }) => (
  <div role="group" aria-label={label} className="flex flex-wrap gap-2">
    {options.map((o) => {
      const on = value.includes(o);
      return (
        <button
          key={o}
          type="button"
          aria-pressed={on}
          onClick={() => onChange(on ? value.filter((x) => x !== o) : max && value.length >= max ? value : [...value, o])}
          className={cn('min-h-[44px] rounded-full px-4 text-[15px] font-semibold', on ? 'bg-royal-500 text-white' : 'border border-line-strong bg-white hover:border-royal-300')}
        >
          {o}
        </button>
      );
    })}
  </div>
);

export const OnboardingWizardPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ tone: 'leaf' | 'danger'; text: string } | null>(null);
  const [score, setScore] = useState(0);
  const [form, setForm] = useState({
    currentClass: 'CLASS_10', board: 'CBSE', state: '', city: '',
    favouriteSubjects: [] as string[], difficultSubjects: [] as string[], skills: [] as string[], hobbies: '',
    budgetRange: '', careerExpectations: '',
  });

  useEffect(() => {
    ApiService.getStudentProfile()
      .then(({ profile: p }) => {
        if (!p) return;
        setScore(p.completionScore || 0);
        setForm({
          currentClass: p.currentClass || 'CLASS_10',
          board: p.board || 'CBSE',
          state: p.state || '',
          city: p.city || '',
          favouriteSubjects: parseList(p.favouriteSubjects),
          difficultSubjects: parseList(p.difficultSubjects),
          skills: parseList(p.skills),
          hobbies: parseList(p.hobbies).join(', '),
          budgetRange: p.budgetRange || '',
          careerExpectations: p.careerExpectations || '',
        });
      })
      .catch(() => undefined)
      .finally(() => setLoading(false));
  }, []);

  const set = <K extends keyof typeof form>(k: K, v: (typeof form)[K]) => setForm((f) => ({ ...f, [k]: v }));

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMsg(null);
    try {
      const res = await ApiService.updateStudentProfile({
        ...form,
        hobbies: form.hobbies.split(',').map((h) => h.trim()).filter(Boolean),
      });
      setScore(res.completionScore);
      setMsg({ tone: 'leaf', text: 'Saved. Your matches will use this the next time you take the test.' });
    } catch (err: any) {
      setMsg({ tone: 'danger', text: err.message || 'We couldn’t save your profile.' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="flex flex-col gap-6"><Skeleton className="h-12 w-72" /><Skeleton className="h-[600px] rounded-3xl" /></div>;

  return (
    <form onSubmit={save} className="flex flex-col gap-6">
      <PageHeader title="Profile and settings" subtitle="The more we know, the sharper your matches." />
      <section className="card flex flex-col gap-2 p-6">
        <div className="flex justify-between"><span className="font-bold">Profile strength</span><span className="font-bold text-royal-600">{score}%</span></div>
        <ProgressBar value={score} label="Profile strength" />
      </section>

      <section className="card flex flex-col gap-6 p-6 sm:p-8">
        <h2 className="text-xl font-bold">School</h2>
        <fieldset className="flex flex-col gap-3">
          <legend className="mb-3 text-[15px] font-semibold">Class</legend>
          <div className="grid max-w-md grid-cols-2 gap-3">
            {[['CLASS_10', 'Class 9–10'], ['CLASS_12', 'Class 11–12']].map(([v, l]) => (
              <ChoiceTile key={v} selected={form.currentClass === v} onClick={() => set('currentClass', v)} className="px-4 font-semibold">{l}</ChoiceTile>
            ))}
          </div>
        </fieldset>
        <fieldset className="flex flex-col gap-3">
          <legend className="mb-3 text-[15px] font-semibold">Board</legend>
          <div className="grid gap-3 sm:grid-cols-4">
            {BOARD_OPTIONS.map((b) => <ChoiceTile key={b.value} selected={form.board === b.value} onClick={() => set('board', b.value)} className="px-4 font-semibold">{b.label}</ChoiceTile>)}
          </div>
        </fieldset>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="State" htmlFor="pf-state"><input id="pf-state" value={form.state} onChange={(e) => set('state', e.target.value)} className="field-input" placeholder="e.g. Maharashtra" /></Field>
          <Field label="City" htmlFor="pf-city" hint="Used for nearby colleges and cost estimates."><input id="pf-city" value={form.city} onChange={(e) => set('city', e.target.value)} className="field-input" placeholder="e.g. Pune" /></Field>
        </div>
      </section>

      <section className="card flex flex-col gap-6 p-6 sm:p-8">
        <h2 className="text-xl font-bold">Subjects and skills</h2>
        <div className="flex flex-col gap-3">
          <span className="text-[15px] font-semibold">Subjects you enjoy <span className="font-normal text-ink-3">(up to 5)</span></span>
          <Chips label="Subjects you enjoy" options={SUBJECTS} value={form.favouriteSubjects} onChange={(v) => set('favouriteSubjects', v)} max={5} />
        </div>
        <div className="flex flex-col gap-3">
          <span className="text-[15px] font-semibold">Subjects you find hard</span>
          <Chips label="Subjects you find hard" options={SUBJECTS} value={form.difficultSubjects} onChange={(v) => set('difficultSubjects', v)} />
        </div>
        <div className="flex flex-col gap-3">
          <span className="text-[15px] font-semibold">Things you’re good at</span>
          <Chips label="Skills" options={SKILLS} value={form.skills} onChange={(v) => set('skills', v)} />
        </div>
        <Field label="Hobbies" htmlFor="pf-hobbies" hint="Separate with commas.">
          <input id="pf-hobbies" value={form.hobbies} onChange={(e) => set('hobbies', e.target.value)} className="field-input" placeholder="e.g. Robotics club, cricket, sketching" />
        </Field>
      </section>

      <section className="card flex flex-col gap-6 p-6 sm:p-8">
        <h2 className="text-xl font-bold">Plans and budget</h2>
        <fieldset className="flex flex-col gap-3">
          <legend className="mb-3 text-[15px] font-semibold">Family budget for higher studies</legend>
          <div className="grid gap-3 sm:grid-cols-5">
            {BUDGETS.map((b) => <ChoiceTile key={b} selected={form.budgetRange === b} onClick={() => set('budgetRange', b)} className="px-3 text-center text-[15px] font-semibold">{b}</ChoiceTile>)}
          </div>
        </fieldset>
        <Field label="What do you want from your future work?" htmlFor="pf-expect">
          <textarea id="pf-expect" rows={3} value={form.careerExpectations} onChange={(e) => set('careerExpectations', e.target.value)} className="field-input" placeholder="e.g. I want to build technology that helps farmers." />
        </Field>
      </section>

      <ParentLinks />

      {msg && <Alert tone={msg.tone}>{msg.text}</Alert>}
      <div className="flex flex-wrap gap-3">
        <Button type="submit" size="lg" loading={saving}>Save profile</Button>
        <Button to="/dashboard" size="lg" variant="secondary" className="font-semibold">Back to home</Button>
      </div>
    </form>
  );
};
