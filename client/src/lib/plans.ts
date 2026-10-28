/** Display names and prices used by checkout and billing (the server remains the source of truth for charges). */
export const PLAN_INFO: Record<string, { name: string; price: number; period: string }> = {
  DISCOVERY: { name: 'Career Report', price: 299, period: 'one-time' },
  PREMIUM_STUDENT: { name: 'Premium', price: 999, period: 'per year' },
  PREMIUM_PLUS: { name: 'Family', price: 2499, period: 'per year' },
  SCHOOL_PILOT: { name: 'School Pilot', price: 19999, period: 'per year' },
};
