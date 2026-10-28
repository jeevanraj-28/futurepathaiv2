/**
 * Weekly streaks for roadmap work. Career planning isn't a daily habit, so a
 * streak counts consecutive weeks (Monday–Sunday, India time) with at least
 * one task completed. The current week keeps the streak alive while it's still
 * in progress, so students aren't penalised mid-week.
 */

const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000;
const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

/** Index of the IST week (starting Monday) that contains the instant. */
export const istWeekIndex = (date: Date): number => {
  const ist = date.getTime() + IST_OFFSET_MS;
  // 1970-01-01 was a Thursday; shift so weeks start on Monday
  const mondayAligned = ist + 3 * 24 * 60 * 60 * 1000;
  return Math.floor(mondayAligned / WEEK_MS);
};

export interface WeeklyStreak {
  /** Consecutive active weeks, counting this week if it already has activity. */
  weeklyStreak: number;
  /** Tasks completed so far in the current week. */
  thisWeekDone: number;
  /** Last six weeks, oldest first; the final entry is the current week. */
  recentWeeks: boolean[];
}

export const computeWeeklyStreak = (completions: Date[], now: Date = new Date()): WeeklyStreak => {
  const current = istWeekIndex(now);
  const counts = new Map<number, number>();
  for (const d of completions) {
    const w = istWeekIndex(d);
    if (w <= current) counts.set(w, (counts.get(w) || 0) + 1);
  }

  const thisWeekDone = counts.get(current) || 0;
  // an unfinished current week doesn't break the streak; start from last week instead
  let week = thisWeekDone > 0 ? current : current - 1;
  let weeklyStreak = 0;
  while (counts.has(week)) {
    weeklyStreak += 1;
    week -= 1;
  }

  const recentWeeks = Array.from({ length: 6 }, (_, i) => counts.has(current - 5 + i));
  return { weeklyStreak, thisWeekDone, recentWeeks };
};
