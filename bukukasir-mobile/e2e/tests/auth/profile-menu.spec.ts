import { test, expect, type Page } from '@playwright/test';

async function openCashierProfile(page: Page) {
  await page.goto('/?e2eRole=cashier&e2eLocale=en');
  await expect(page.getByText('New order').first()).toBeVisible({ timeout: 10000 });
  const profileButton = page.getByTestId('staff-chip').or(page.getByRole('button', { name: /Siti Rahayu|Rudi Hartono|Dewi Lestari/ })).first();
  await expect(profileButton).toBeVisible({ timeout: 10000 });
  await profileButton.click();
  await expect(page.getByText('Lock now')).toBeVisible({ timeout: 10000 });
}

async function openWaiterProfile(page: Page) {
  await page.goto('/?e2eRole=waiter&e2eLocale=en');
  await expect(page.getByText('Assigned tables')).toBeVisible({ timeout: 10000 });
  const profileButton = page.getByTestId('staff-chip').or(page.getByRole('button', { name: /Rudi Hartono|Siti Rahayu|Dewi Lestari/ })).first();
  await expect(profileButton).toBeVisible({ timeout: 10000 });
  await profileButton.click();
  await expect(page.getByText('Profile')).toBeVisible({ timeout: 10000 });
}

test.describe('Auth - Profile Menu Actions', () => {
  test('locks the tablet and unlocks with PIN without exposing role selection', async ({ page }) => {
    await openCashierProfile(page);

    await page.getByRole('button', { name: 'Lock now' }).click();
    await expect(page.getByText('Unlock tablet')).toBeVisible({ timeout: 10000 });
    await expect(page.getByText('Unlocking as Cashier. Enter your 6-digit PIN to continue.')).toBeVisible();
    await expect(page.getByText('Pick your role')).not.toBeVisible();

    await page.keyboard.type('123456', { delay: 50 });
    await expect(page.getByText('New order').first()).toBeVisible({ timeout: 10000 });
  });

  test('opens a real change PIN flow from the profile menu', async ({ page }) => {
    await openCashierProfile(page);

    await page.getByRole('button', { name: 'Change PIN' }).click();
    await expect(page.getByText('Set new PIN')).toBeVisible({ timeout: 10000 });
    await expect(page.getByText('Changing PIN for Cashier. Enter a new 6-digit PIN.')).toBeVisible();

    await page.keyboard.type('654321', { delay: 50 });
    await expect(page.getByText('New order').first()).toBeVisible({ timeout: 10000 });
  });

  test('requires confirmation before logout clears the session', async ({ page }) => {
    await openCashierProfile(page);

    await page.getByRole('button', { name: 'Log out' }).click();
    await expect(page.getByText('Log out of this account?')).toBeVisible();
    await expect(page.getByText('Order drafts, tenant cache, and local table selection will be cleared.')).toBeVisible();

    await page.getByRole('button', { name: 'Log out' }).click();
    await expect(page.getByText('Sign in to your account')).toBeVisible({ timeout: 10000 });
  });

  test('shows role and location controls from the waiter profile sheet', async ({ page }) => {
    await openWaiterProfile(page);

    await expect(page.getByRole('button', { name: 'Switch role' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Switch location / business' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Lock now' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Change PIN' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Log out' })).toBeVisible();
  });

  test('translates the already-open cashier profile sheet to English', async ({ page }) => {
    await page.goto('/?e2eRole=cashier&e2eLocale=id');
    await expect(page.getByText('Tambah customer')).toBeVisible({ timeout: 10000 });

    await page.getByTestId('staff-chip').click();
    await expect(page.getByText('Profil')).toBeVisible({ timeout: 10000 });
    await expect(page.getByRole('button', { name: 'Pengaturan' }).last()).toBeVisible();
    await expect(page.getByRole('button', { name: 'Lock sekarang' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Ganti PIN' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Ganti peran' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Ganti lokasi / bisnis' })).toBeVisible();

    await page.getByRole('button', { name: 'Ganti ke English' }).last().click();

    await expect(page.getByText('Profile')).toBeVisible();
    await expect(page.getByText('Cashier').first()).toBeVisible();
    await expect(page.getByText('Online · synced')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Settings' }).last()).toBeVisible();
    await expect(page.getByRole('button', { name: 'Lock now' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Change PIN' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Switch role' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Switch location / business' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Switch to Indonesian' }).last()).toBeVisible();
    await expect(page.getByRole('button', { name: 'Log out' })).toBeVisible();
  });

  test('switches from waiter to kitchen after PIN confirmation', async ({ page }) => {
    await openWaiterProfile(page);

    await page.getByRole('button', { name: 'Switch role' }).click();
    await expect(page.getByText('Switch role')).toBeVisible({ timeout: 10000 });
    await page.getByTestId('role-card-kitchen').click();
    await expect(page.getByText('Confirm role')).toBeVisible({ timeout: 10000 });
    await expect(page.getByText('Switching to Kitchen. Enter your PIN to continue.')).toBeVisible();

    await page.keyboard.type('123456', { delay: 50 });
    await expect(page.getByText('Kitchen').first()).toBeVisible({ timeout: 10000 });
  });

  test('opens location/business picker from the profile sheet', async ({ page }) => {
    await openWaiterProfile(page);

    await page.getByRole('button', { name: 'Switch location / business' }).click();
    await expect(page.getByText('Pick Business')).toBeVisible({ timeout: 10000 });
    await expect(page.getByText(/businesses available/i)).toBeVisible();
  });
});
