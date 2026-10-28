/**
 * Validation for school roster imports ("name, email, roll number, class").
 * Kept free of database access so the rules can be unit-tested.
 */
export interface RosterRow {
  name: string;
  email: string;
  rollNumber?: string;
  currentClass: 'CLASS_10' | 'CLASS_12';
}

export interface RowError {
  row: number;
  email?: string;
  reason: string;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const MAX_IMPORT_ROWS = 500;

/** Classes 9–10 map to the stream decision, 11–12 to the degree decision. */
export const toServerClass = (value?: string): 'CLASS_10' | 'CLASS_12' | null => {
  const digits = String(value ?? '').match(/\d+/)?.[0];
  if (!digits) return null;
  const n = Number(digits);
  if (n === 9 || n === 10) return 'CLASS_10';
  if (n === 11 || n === 12) return 'CLASS_12';
  return null;
};

export const validateRoster = (rows: unknown): { valid: RosterRow[]; errors: RowError[] } => {
  const valid: RosterRow[] = [];
  const errors: RowError[] = [];
  if (!Array.isArray(rows)) return { valid, errors: [{ row: 0, reason: 'Expected a list of students' }] };
  if (rows.length > MAX_IMPORT_ROWS) {
    return { valid, errors: [{ row: 0, reason: `Import at most ${MAX_IMPORT_ROWS} students at a time` }] };
  }

  const seen = new Set<string>();
  rows.forEach((raw, i) => {
    const row = i + 1;
    const r = (raw ?? {}) as Record<string, unknown>;
    const name = String(r.name ?? '').trim();
    const email = String(r.email ?? '').trim().toLowerCase();
    const rollNumber = String(r.rollNumber ?? '').trim() || undefined;
    const currentClass = toServerClass(String(r.currentClass ?? ''));

    if (!name) return errors.push({ row, email, reason: 'Missing name' });
    if (!EMAIL_RE.test(email)) return errors.push({ row, email, reason: 'Invalid email' });
    if (!currentClass) return errors.push({ row, email, reason: 'Class must be 9, 10, 11 or 12' });
    if (seen.has(email)) return errors.push({ row, email, reason: 'Duplicate email in file' });
    seen.add(email);
    valid.push({ name, email, rollNumber, currentClass });
  });
  return { valid, errors };
};
