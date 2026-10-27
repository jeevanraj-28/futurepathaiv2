/**
 * The discovery test can be started without an account. Answers live on the device
 * (so they survive refreshes and offline use) until the student signs up to save them.
 */
const KEY = 'futurepath_test_v2';

export type TestProgress = {
  answers: Record<string, number>;
  index: number;
  breaksSeen: number[];
  grade?: '9' | '10' | '11' | '12';
  board?: string;
  updatedAt: number;
};

const EMPTY: TestProgress = { answers: {}, index: 0, breaksSeen: [], updatedAt: 0 };

export const loadProgress = (): TestProgress => {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return { ...EMPTY, ...JSON.parse(raw) };
    // carry over drafts saved by the previous version of the test page
    const legacy = localStorage.getItem('futurepath_assessment_draft');
    if (legacy) return { ...EMPTY, answers: JSON.parse(legacy) };
  } catch {
    /* storage can be unavailable in private mode */
  }
  return { ...EMPTY };
};

export const saveProgress = (patch: Partial<TestProgress>): TestProgress => {
  const next = { ...loadProgress(), ...patch, updatedAt: Date.now() };
  try {
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    /* ignore quota and private-mode errors */
  }
  return next;
};

export const clearProgress = () => {
  try {
    localStorage.removeItem(KEY);
    localStorage.removeItem('futurepath_assessment_draft');
  } catch {
    /* ignore */
  }
};

export const answeredCount = (p: TestProgress) => Object.keys(p.answers).length;

/** Backend only distinguishes the two decision points. */
export const toServerClass = (grade?: string) => (grade === '11' || grade === '12' ? 'CLASS_12' : 'CLASS_10');

export const BOARD_OPTIONS = [
  { value: 'CBSE', label: 'CBSE' },
  { value: 'CISCE', label: 'CISCE (ICSE/ISC)' },
  { value: 'STATE_BOARD', label: 'State board' },
  { value: 'IB', label: 'IB / Cambridge' },
];
