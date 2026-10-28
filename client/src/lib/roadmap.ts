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
