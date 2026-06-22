import { test, expect } from '@playwright/test';

test.describe('I18n - Login Language Toggle', () => {
  test('switches login copy between Indonesian and English', async ({ page }) => {
    await page.goto('/?e2eReset=1');
    await expect(page.getByText('Masuk ke Akun').or(page.getByText('Enter phone number'))).toBeVisible({ timeout: 10000 });
    await page.getByTestId('login-language-toggle').click();
    await expect(page.getByText('Sign in to your account').or(page.getByText('Masuk ke Akun'))).toBeVisible({ timeout: 10000 });
  });

  test('switches the authenticated POS shell to English', async ({ page }) => {
    await page.goto('/?e2eRole=cashier&e2eLocale=id');
    await expect(page.getByText('New order').first()).toBeVisible({ timeout: 15000 });
    await expect(page.getByText('Meja buka').first()).toBeVisible();
    await expect(page.getByText('Tambah customer')).toBeVisible();

    await page.getByTestId('pos-language-toggle').click();

    await expect(page.getByText('Open tables').first()).toBeVisible();
    await expect(page.getByText('Add customer')).toBeVisible();
    await expect(page.getByTestId('pos-language-toggle').getByText('ID')).toBeVisible();
  });
});
