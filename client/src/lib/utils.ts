import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export const cn = (...inputs: ClassValue[]) => twMerge(clsx(inputs));

/** "₹8.5–32 LPA" from rupee amounts per year. */
export const formatLPA = (minINR?: number, maxINR?: number): string => {
  if (!minINR && !maxINR) return '—';
  const lakh = (v: number) => {
    const n = v / 100000;
    return Number.isInteger(n) ? String(n) : n.toFixed(1).replace(/\.0$/, '');
  };
  if (minINR && maxINR) return `₹${lakh(minINR)}–${lakh(maxINR)} LPA`;
  return `₹${lakh((minINR || maxINR) as number)} LPA`;
};

export const formatINR = (amount: number): string =>
  `₹${Math.round(amount).toLocaleString('en-IN')}`;

export type FitTone = 'leaf' | 'royal' | 'saffron';

/**
 * Psychometric scores are not precise to 1%, so the UI leads with a band
 * and only shows the number as secondary detail.
 */
export const fitBand = (score: number): { label: string; tone: FitTone } => {
  if (score >= 80) return { label: 'Strong fit', tone: 'leaf' };
  if (score >= 65) return { label: 'Good fit', tone: 'royal' };
  return { label: 'Worth exploring', tone: 'saffron' };
};

export const strengthBand = (score: number): { label: string; tone: FitTone } => {
  if (score >= 70) return { label: 'Strong', tone: 'royal' };
  if (score >= 50) return { label: 'Medium', tone: 'royal' };
  return { label: 'Still growing', tone: 'saffron' };
};

/** Everyday names for the 16 test dimensions, so students and parents don't need test vocabulary. */
export const PLAIN_DIMENSIONS: Record<string, string> = {
  'Logical Reasoning': 'Working things out step by step',
  'Numerical Reasoning': 'Working with numbers',
  'Scientific Thinking': 'Asking why and testing ideas',
  'Spatial Reasoning': 'Picturing shapes in 3D',
  'Verbal Reasoning': 'Understanding words and meaning',
  'Practical Problem Solving': 'Fixing real-world problems',
  'Creative Thinking': 'Coming up with new ideas',
  'Subject Interests': 'Love for favourite subjects',
  'Communication': 'Explaining ideas to others',
  'Leadership & Teamwork': 'Leading and teamwork',
  'Social Impact': 'Wanting to help society',
  'Career Values': 'Knowing what you want from work',
  'Working Style': 'Staying organised',
  'Work Environment': 'Liking a steady work setting',
  'Risk Tolerance': 'Comfort with risk',
  'Entrepreneurial': 'Starting your own things',
};

export const DIMENSION_DETAIL: Record<string, { body: string; useful: string }> = {
  'Logical Reasoning': { body: 'You spot patterns and solve problems in order, one step at a time.', useful: 'data, engineering, law, finance' },
  'Numerical Reasoning': { body: 'Calculations and data don’t scare you. You can see what numbers are saying.', useful: 'statistics, commerce, actuarial work' },
  'Scientific Thinking': { body: 'You like asking why, and testing ideas until you know the answer.', useful: 'medicine, research, engineering' },
  'Spatial Reasoning': { body: 'You can turn shapes and spaces around in your head easily.', useful: 'architecture, design, aviation' },
  'Verbal Reasoning': { body: 'You understand what words really mean and notice small differences.', useful: 'law, media, civil services' },
  'Practical Problem Solving': { body: 'You enjoy fixing real things and finding what actually works.', useful: 'engineering, operations, healthcare' },
  'Creative Thinking': { body: 'You come up with fresh ideas and enjoy making something new.', useful: 'design, media, entrepreneurship' },
  'Subject Interests': { body: 'You genuinely enjoy your favourite subjects, which keeps you going.', useful: 'choosing your stream' },
  'Communication': { body: 'You explain ideas clearly and people understand you.', useful: 'law, teaching, management' },
  'Leadership & Teamwork': { body: 'You bring people together and help a group move forward.', useful: 'management, defence, civil services' },
  'Social Impact': { body: 'You care about helping people and making things better.', useful: 'healthcare, policy, teaching' },
  'Career Values': { body: 'You know what matters to you in future work.', useful: 'making confident choices' },
  'Working Style': { body: 'You plan, stay organised and finish what you start.', useful: 'almost every career' },
  'Work Environment': { body: 'You know the kind of place where you work best.', useful: 'choosing the right field' },
  'Risk Tolerance': { body: 'You’re comfortable taking calculated chances.', useful: 'business, finance, startups' },
  'Entrepreneurial': { body: 'You like starting things and making them happen.', useful: 'business, startups, product roles' },
};

export const plainDimension = (name: string) => PLAIN_DIMENSIONS[name] || name;

export const classLabel = (currentClass?: string) =>
  currentClass === 'CLASS_12' ? 'Class 11–12' : 'Class 9–10';

export const demandLabel = (demand?: string) => {
  switch (demand) {
    case 'VERY_HIGH': return 'Very high';
    case 'HIGH': return 'High';
    case 'MEDIUM': return 'Medium';
    case 'LOW': return 'Low';
    default: return demand ? demand.replace(/_/g, ' ').toLowerCase() : '—';
  }
};

export const parseList = (value: unknown): string[] => {
  if (Array.isArray(value)) return value as string[];
  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
  return [];
};
