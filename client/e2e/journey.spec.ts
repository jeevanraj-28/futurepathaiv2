import { expect, test } from '@playwright/test';
import { demoLogin, uniqueEmail } from './helpers';

test('a visitor takes the test, signs up and gets a report', async ({ page }) => {
  await page.goto('/start');
  await page.getByRole('button', { name: 'Class 10' }).click();
  await page.getByRole('button', { name: 'Start the discovery test' }).click();
  await expect(page).toHaveURL(/\/assessment$/);

  const breakButton = page.getByRole('button', { name: /^Start section/ });
  for (let n = 1; n <= 40; n++) {
    await expect(page.getByText(`Question ${n} of 40`)).toBeVisible();
    await page.getByRole('radio').first().click();
    if (n === 40) break;
    // answering moves on by itself; after every tenth question there's a short break
    await expect(page.getByText(`Question ${n + 1} of 40`).or(breakButton)).toBeVisible();
    if (await breakButton.isVisible()) await breakButton.click();
  }

  await page.getByRole('button', { name: 'See my results' }).click();
  await expect(page).toHaveURL(/\/assessment\/save$/);
  await expect(page.getByRole('heading', { name: 'Your results are ready!' })).toBeVisible();

  await page.getByLabel('Your name').fill('E2E Student');
  await page.getByLabel('Email').fill(uniqueEmail('journey'));
  await page.getByLabel('Create a password').fill('LocalTest#2026');
  await page.getByRole('button', { name: 'Save and see my report' }).click();

  await expect(page).toHaveURL(/\/assessment\/results$/);
  await expect(page.getByRole('heading', { name: 'Careers that fit you' })).toBeVisible();
  // free plan: three matches are open, the rest sit behind the unlock panel
  await expect(page.getByText(/more careers fit you/)).toBeVisible();
  await expect(page.getByRole('button', { name: 'Unlock for ₹299' })).toBeVisible();
});

test('a student’s plan changes are saved', async ({ page }) => {
  await demoLogin(page, 'Student');
  await page.goto('/plan');
  const first = page.getByRole('checkbox').first();
  await expect(first).toBeVisible();
  const before = await first.getAttribute('aria-checked');
  const flipped = before === 'true' ? 'false' : 'true';

  await first.click();
  await expect(first).toHaveAttribute('aria-checked', flipped);
  await page.reload();
  await expect(page.getByRole('checkbox').first()).toHaveAttribute('aria-checked', flipped);

  // put the demo data back the way it was
  await page.getByRole('checkbox').first().click();
  await expect(page.getByRole('checkbox').first()).toHaveAttribute('aria-checked', before ?? 'false');
});
