import { expect, type Page } from '@playwright/test';

export const DEMO_HOME: Record<string, string> = {
  Student: '/dashboard',
  Parent: '/parent-portal',
  School: '/school-portal',
  Counsellor: '/counselor-portal',
  'Platform admin': '/admin',
};

/** Signs in through the one-tap demo buttons on the log-in page. */
export const demoLogin = async (page: Page, role: keyof typeof DEMO_HOME) => {
  await page.goto('/login');
  await page.getByRole('button', { name: new RegExp(`^${role}`) }).click();
  await expect(page).toHaveURL(new RegExp(`${DEMO_HOME[role]}$`));
};

/** Collects uncaught errors and console errors for the life of the page. */
export const trackErrors = (page: Page) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
  return errors;
};

export const uniqueEmail = (prefix: string) => `e2e.${prefix}.${Date.now()}@futurepath.test`;
