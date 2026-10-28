import { expect, test } from '@playwright/test';
import { DEMO_HOME, demoLogin, trackErrors } from './helpers';

for (const role of Object.keys(DEMO_HOME)) {
  test(`${role} demo lands on their home without errors`, async ({ page }) => {
    const errors = trackErrors(page);
    await demoLogin(page, role);
    await expect(page.getByRole('heading', { level: 1 }).first()).toBeVisible();
    await page.waitForLoadState('networkidle');
    expect(errors).toEqual([]);
  });
}
