import { test, expect } from '@playwright/test';

async function enterPhoneAndContinue(page: import('@playwright/test').Page) {
  await page.goto('/?e2eReset=1');
  await page.waitForTimeout(1500);
  const phoneInput = page.locator('input').first();
  await phoneInput.waitFor({ timeout: 10000 });
  await phoneInput.fill('8123456789');
  await page.getByText(/Send verification code|Kirim kode verifikasi/).click();
}

async function selectFirstBusinessIfNeeded(page: import('@playwright/test').Page) {
  const rolePicker = page.getByText('Pilih Peran Anda').or(page.getByText('Pick your role'));
  const businessPicker = page.getByText('Pilih Bisnis').or(page.getByText('Pick Business'));
  const routeReached = async () =>
    page.url().includes('/pin-setup') || (await rolePicker.isVisible({ timeout: 500 }).catch(() => false));

  await expect(businessPicker.or(rolePicker)).toBeVisible({ timeout: 10000 });
  const businessPickerVisible = await businessPicker.isVisible().catch(() => false);
  if (businessPickerVisible) {
    for (let attempt = 0; attempt < 4; attempt += 1) {
      const open = page
        .getByTestId('business-open-biz-001')
        .or(page.getByRole('button', { name: /Masuk Warung Makan Sederhana|Open Warung Makan Sederhana/i }));
      await expect(open).toBeVisible({ timeout: 10000 });
      await open.click();
      if (await rolePicker.isVisible({ timeout: 3000 }).catch(() => false)) {
        break;
      }
      if (await routeReached()) {
        await rolePicker.waitFor({ timeout: 5000 }).catch(() => undefined);
        break;
      }

      // RN Web Pressable occasionally drops the locator click in Chromium when
      // the auth tests run back-to-back. Use the actual pointer coordinates as
      // a second try so the test still exercises the visible business card.
      const box = await open.boundingBox();
      if (box) {
        await page.mouse.click(box.x + box.width - 42, box.y + box.height / 2);
      }
      if (await rolePicker.isVisible({ timeout: 3000 }).catch(() => false)) {
        break;
      }
      if (await routeReached()) {
        await rolePicker.waitFor({ timeout: 5000 }).catch(() => undefined);
        break;
      }
    }
  }
}

test.describe('Auth - Login Flow', () => {
  test('Should display redesigned phone login screen', async ({ page }) => {
    await page.goto('/?e2eReset=1');
    await page.waitForTimeout(1500);

    await expect(page.getByText('BUKUKASIR · FRONTLINE')).toBeVisible({ timeout: 10000 });
    await expect(page.getByText('Masuk ke Akun').or(page.getByText('Enter phone number'))).toBeVisible();
    await expect(page.getByText('+62')).toBeVisible();
    await expect(page.locator('input').first()).toBeVisible();
    await expect(page.getByText('SMS', { exact: true })).toBeVisible();
    await expect(page.getByText('WHATSAPP', { exact: true })).toBeVisible();
    await expect(page.getByText(/Send verification code|Kirim kode verifikasi/)).toBeVisible();
  });

  test('Should expose channel selection as stateful buttons', async ({ page }) => {
    await page.goto('/?e2eReset=1&e2eLocale=en');
    await page.waitForTimeout(1500);

    const sms = page.getByRole('button', { name: 'Send OTP via SMS' });
    const whatsApp = page.getByRole('button', { name: 'Send OTP via WhatsApp' });
    await expect(sms).toHaveAttribute('aria-selected', 'true');
    await expect(whatsApp).toHaveAttribute('aria-selected', 'false');

    await whatsApp.click();
    await expect(sms).toHaveAttribute('aria-selected', 'false');
    await expect(whatsApp).toHaveAttribute('aria-selected', 'true');
  });

  test('Should expose OTP keypad controls without a blank no-op button', async ({ page }) => {
    await page.goto('/(auth)/verify-otp?e2eLocale=en');
    await expect(page.getByText(/Verify OTP|Verifikasi OTP/)).toBeVisible({ timeout: 10000 });

    await expect(page.getByRole('button', { name: 'Digit 1' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Digit 0' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Backspace' })).toBeVisible();
    await expect(page.getByRole('button', { name: /^$/ })).toHaveCount(0);
  });

  test('Should move from phone login to business selection or role selection', async ({ page }) => {
    await enterPhoneAndContinue(page);
    await expect(
      page.getByText('Pilih Bisnis')
        .or(page.getByText('Pick Business'))
        .or(page.getByText('Pilih Peran Anda'))
        .or(page.getByText('Pick your role')),
    ).toBeVisible({ timeout: 10000 });
  });

  test('Should show role selection after business selection', async ({ page }) => {
    await enterPhoneAndContinue(page);
    await selectFirstBusinessIfNeeded(page);

    await expect(page.getByText('Pilih Peran Anda').or(page.getByText('Pick your role'))).toBeVisible({ timeout: 10000 });
    await expect(page.getByText(/Kasir|Cashier/).first()).toBeVisible();
    await expect(page.getByText(/Pelayan|Waiter/).first()).toBeVisible();
    await expect(page.getByText(/Dapur|Kitchen/).first()).toBeVisible();
    await expect(page.getByText(/Kelola pembayaran|Manage payments/)).toBeVisible();
    await expect(page.getByText(/Ambil pesanan|Take orders/)).toBeVisible();
    await expect(page.getByText(/antrian masak|cooking queue/i)).toBeVisible();
  });

  test('Should enter PIN and route cashier to new order', async ({ page }) => {
    await enterPhoneAndContinue(page);
    await selectFirstBusinessIfNeeded(page);

    await expect(page.getByText('Pilih Peran Anda').or(page.getByText('Pick your role'))).toBeVisible({ timeout: 10000 });
    await page.getByText(/Kasir|Cashier/).first().click();
    await expect(page.getByText('Masukkan PIN').or(page.getByText('Enter PIN')).first()).toBeVisible({ timeout: 10000 });
    await page.keyboard.type('123456', { delay: 100 });
    await expect(page.getByText('New order').first()).toBeVisible({ timeout: 10000 });
  });

  test('Should expose owner onboarding setup', async ({ page }) => {
    await page.goto('/(auth)/onboarding');
    await expect(page.getByText('Setup BukuKasir POS')).toBeVisible({ timeout: 10000 });
    await expect(page.getByText('Welcome to BukuKasir')).toBeVisible();
    await page.getByText('Continue').click();
    await expect(page.getByText('Owner phone')).toBeVisible();
  });
});
