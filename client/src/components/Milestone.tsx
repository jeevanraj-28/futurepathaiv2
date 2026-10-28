import React from 'react';
import { Check } from 'lucide-react';
import { cn } from '../lib/utils';
import type { RoadmapTask } from '../lib/roadmap';

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
