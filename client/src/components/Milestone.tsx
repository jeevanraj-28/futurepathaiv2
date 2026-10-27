import React from 'react';
import { Check } from 'lucide-react';
import { cn } from '../lib/utils';

export type RoadmapTask = { task: string; completed: boolean };
export type RoadmapMilestone = { period: string; title: string; tasks: RoadmapTask[] };
export type Roadmap = { id: string; careerTitle: string; targetYear?: string; milestones: RoadmapMilestone[] };

export const roadmapProgress = (r?: Roadmap | null) => {
  const tasks = r?.milestones.flatMap((m) => m.tasks) || [];
  const done = tasks.filter((t) => t.completed).length;
  return { done, total: tasks.length, pct: tasks.length ? Math.round((done / tasks.length) * 100) : 0 };
};

/** The milestone a student should be working on: the first one with unfinished tasks. */
export const currentMilestoneIndex = (r?: Roadmap | null) => {
  if (!r) return 0;
  const i = r.milestones.findIndex((m) => m.tasks.some((t) => !t.completed));
  return i === -1 ? r.milestones.length - 1 : i;
};

export const TaskList: React.FC<{
  tasks: RoadmapTask[];
  onToggle: (taskIndex: number) => void;
  busyIndex?: number | null;
}> = ({ tasks, onToggle, busyIndex }) => (
  <ul className="flex flex-col gap-2.5">
    {tasks.map((t, i) => (
      <li key={t.task}>
        <button
          type="button"
          role="checkbox"
          aria-checked={t.completed}
          disabled={busyIndex === i}
          onClick={() => onToggle(i)}
          className="flex min-h-[56px] w-full items-center gap-3.5 rounded-xl border border-line bg-white px-4 py-3 text-left hover:border-royal-300 disabled:opacity-60"
        >
          <span className={cn('flex h-6 w-6 shrink-0 items-center justify-center rounded-md border-2', t.completed ? 'border-leaf-600 bg-leaf-600' : 'border-[#A9B4C4] bg-white')}>
            {t.completed && <Check className="h-3.5 w-3.5 text-white" strokeWidth={3.5} aria-hidden="true" />}
          </span>
          <span className={cn('text-[15px] font-semibold leading-snug sm:text-base', t.completed && 'text-ink-3 line-through')}>{t.task}</span>
        </button>
      </li>
    ))}
  </ul>
);
