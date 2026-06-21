import { test, expect } from '@playwright/test';

// Smoke scope: assert the contactus-app boots and routes resolve without
// crashing. A full "renders contacts" check needs an authenticated session +
// seeded space (deferred), so unauthenticated navigation is the expected path —
// the assertion is that the app shell mounts and throws no uncaught errors.

test('app boots without uncaught errors', async ({ page }) => {
  const pageErrors: string[] = [];
  page.on('pageerror', (e) => pageErrors.push(String(e)));

  await page.goto('/');

  // Angular bootstrapped and rendered the app shell.
  await expect(page.locator('contactus-root')).toBeAttached();

  expect(pageErrors, `uncaught page errors:\n${pageErrors.join('\n')}`).toEqual(
    [],
  );
});

test('space-scoped route loads without crashing', async ({ page }) => {
  const pageErrors: string[] = [];
  page.on('pageerror', (e) => pageErrors.push(String(e)));

  // Lazy-loads the space shell. Unauthenticated, this redirects to the
  // signed-out / login flow; the assertion is that it handles it without throwing.
  await page.goto('/space/family/smoke-test-space');

  await expect(page.locator('contactus-root')).toBeAttached();

  expect(pageErrors, `uncaught page errors:\n${pageErrors.join('\n')}`).toEqual(
    [],
  );
});
