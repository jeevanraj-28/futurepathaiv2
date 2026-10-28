import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';
import { demoLogin } from './helpers';

/** Fails on serious and critical WCAG 2.1 AA issues; lists them so they're easy to fix. */
const audit = async (page: Page, path: string) => {
  await page.goto(path);
  await page.waitForLoadState('networkidle');
  const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze();
  const blocking = results.violations
    .filter((v) => v.impact === 'serious' || v.impact === 'critical')
    .map((v) => `${v.id} (${v.impact}): ${v.nodes.slice(0, 3).map((n) => n.target.join(' ')).join(' | ')}`);
  expect(blocking, `${path}\n${blocking.join('\n')}`).toEqual([]);
};

test('public pages have no serious accessibility issues', async ({ page }) => {
  for (const path of ['/', '/start', '/pricing', '/careers', '/stream-guide', '/login', '/register']) {
    await audit(page, path);
  }
});

test('student pages have no serious accessibility issues', async ({ page }) => {
  await demoLogin(page, 'Student');
  for (const path of ['/dashboard', '/assessment/results', '/plan', '/mentor', '/onboarding']) {
    await audit(page, path);
  }
});

test('parent and school pages have no serious accessibility issues', async ({ page }) => {
  await demoLogin(page, 'Parent');
  await audit(page, '/parent-portal');
  await demoLogin(page, 'School');
  await audit(page, '/school-portal');
});

test('admin, billing, counsellor and career pages have no serious accessibility issues', async ({ page }) => {
  await demoLogin(page, 'Platform admin');
  await audit(page, '/admin');
  await demoLogin(page, 'Student');
  for (const path of ['/billing', '/counselors', '/careers/data-scientist', '/colleges', '/exams', '/scholarships']) {
    await audit(page, path);
  }
  await demoLogin(page, 'Counsellor');
  await audit(page, '/counselor-portal');
});
