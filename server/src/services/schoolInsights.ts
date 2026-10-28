/**
 * Stream interest across a school, from each tested student's strongest
 * stream in their readiness profile. Students without a completed test are
 * not counted, so the numbers only ever describe real results.
 */
export interface StreamShare {
  stream: string;
  count: number;
  percentage: number;
}

export const streamDistribution = (readinessProfiles: Array<Record<string, number> | null | undefined>): StreamShare[] => {
  const counts = new Map<string, number>();
  let tested = 0;
  for (const profile of readinessProfiles) {
    if (!profile) continue;
    const top = Object.entries(profile).sort((a, b) => b[1] - a[1])[0];
    if (!top) continue;
    tested += 1;
    counts.set(top[0], (counts.get(top[0]) || 0) + 1);
  }
  if (tested === 0) return [];
  return [...counts.entries()]
    .map(([stream, count]) => ({ stream, count, percentage: Math.round((count / tested) * 100) }))
    .sort((a, b) => b.count - a.count || a.stream.localeCompare(b.stream));
};

export const parseReadiness = (json?: string | null): Record<string, number> | null => {
  if (!json) return null;
  try {
    const parsed = JSON.parse(json);
    return parsed && typeof parsed === 'object' ? parsed : null;
  } catch {
    return null;
  }
};
