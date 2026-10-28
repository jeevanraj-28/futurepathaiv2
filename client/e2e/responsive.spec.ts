import { expect, test, type Page } from '@playwright/test';
import { demoLogin } from './helpers';

const SIZES = [
  { name: 'desktop', width: 1440, height: 900 },
  { name: 'tablet', width: 834, height: 1194 },
  { name: 'phone', width: 390, height: 844 },
];

const hasNoSideScroll = async (page: Page) =>
  page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth);

for (const size of SIZES) {
  test(`${size.name}: public pages fit without sideways scrolling`, async ({ page }) => {
    await page.setViewportSize(size);
    for (const path of ['/', '/start', '/pricing', '/careers', '/login']) {
      await page.goto(path);
      await page.waitForLoadState('networkidle');
      expect(await hasNoSideScroll(page), `${path} at ${size.name}`).toBe(true);
    }
  });

  test(`${size.name}: student app uses the right navigation`, async ({ page }) => {
    await page.setViewportSize(size);
    await demoLogin(page, 'Student');
    await page.waitForLoadState('networkidle');
    expect(await hasNoSideScroll(page)).toBe(true);

    const sidebar = page.locator('aside').first();
    const tabBar = page.locator('nav.fixed[aria-label="App"]');
    if (size.name === 'phone') {
      await expect(sidebar).toBeHidden();
      await expect(tabBar).toBeVisible();
    } else {
      await expect(sidebar).toBeVisible();
      await expect(tabBar).toBeHidden();
      const box = await sidebar.boundingBox();
      // full sidebar on desktop, icon rail on tablet
      if (size.name === 'desktop') expect(box!.width).toBeGreaterThan(200);
      else expect(box!.width).toBeLessThan(100);
    }
  });
}
