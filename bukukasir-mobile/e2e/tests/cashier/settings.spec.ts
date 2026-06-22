import { test, expect } from '@playwright/test';

test.describe('Cashier - Settings Screen', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/?e2eRole=cashier&e2eTarget=settings&e2eLocale=en');
    await expect(page.getByText('Store operations')).toBeVisible({ timeout: 15000 });
  });

  test('confirms business and printer settings actions', async ({ page }) => {
    await page.getByText('Business profile').click();
    await page.getByRole('button', { name: 'Save business setup' }).click();
    await expect(page.getByText('Business setup saved')).toBeVisible();
    await page.getByRole('button', { name: 'Close' }).last().click();

    await page.getByText('Bluetooth pairing and print jobs').click();
    await page.getByRole('button', { name: 'Pair and save' }).click();
    await expect(page.getByText('Printer saved').first()).toBeVisible();
  });

  test('validates and queues staff invites', async ({ page }) => {
    await page.getByText('Staff invite').click();
    await page.getByRole('button', { name: 'Send invite' }).click();
    await expect(page.getByText('Phone required')).toBeVisible();
    await page.getByRole('button', { name: 'Dismiss' }).click();

    await page.getByPlaceholder('+62').fill('+62812345678');
    await page.getByRole('button', { name: 'Send invite' }).click();
    await expect(page.getByText('Invite queued')).toBeVisible();
  });

  test('updates PIN, switches location, and confirms logout from settings', async ({ page }) => {
    await page.getByRole('button', { name: /PIN and app lock/ }).click();
    await page.getByRole('textbox').fill('654321');
    await page.getByRole('button', { name: 'Save PIN' }).click();
    await expect(page.getByText('PIN saved')).toBeVisible();
    await page.getByRole('button', { name: 'Close' }).last().click();

    await page.getByRole('button', { name: 'Switch location / business' }).click();
    await expect(page.getByText('Pick Business')).toBeVisible({ timeout: 10000 });

    await page.goto('/?e2eRole=cashier&e2eTarget=settings&e2eLocale=en');
    await expect(page.getByText('Store operations')).toBeVisible({ timeout: 10000 });
    await page.getByRole('button', { name: 'Logout' }).click();
    await expect(page.getByText('Log out of this account?')).toBeVisible();
    await page.getByRole('button', { name: 'Confirm logout' }).click();
    await expect(page.getByText('Sign in to your account')).toBeVisible({ timeout: 10000 });
  });
});
