import { test, expect } from '@playwright/test';

test('has title', async ({ page }) => {
  await page.goto('/');
  // Basic title assertion
  await expect(page).toHaveTitle(/SponsorBase/i);
});
