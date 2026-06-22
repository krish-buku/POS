import { type Page, expect } from '@playwright/test';

/**
 * Helper to enter the OTP code on the verify-otp screen.
 * The OTP screen has 6 individual TextInput boxes. The first one is auto-focused.
 * We use keyboard.type() to simulate typing digit by digit, which triggers
 * the auto-advance behavior between inputs.
 */
async function enterOtp(page: Page, code: string = '123456') {
  await page.keyboard.type(code, { delay: 100 });
  await page.waitForTimeout(500);
}

/**
 * Helper to enter PIN. The PinInput component uses a hidden TextInput (opacity:0)
 * that receives actual keystrokes. It is auto-focused, so we just type.
 */
async function enterPin(page: Page, pin: string = '123456') {
  await page.keyboard.type(pin, { delay: 100 });
  await page.waitForTimeout(800);
}

function pinGate(page: Page) {
  return page
    .getByText('Pilih Peran Anda')
    .or(page.getByText('Pick your role'))
    .or(page.getByText('Buat PIN', { exact: true }).first())
    .or(page.getByText('Masukkan PIN').first())
    .or(page.getByText('Enter PIN').first());
}

/**
 * Perform the full login flow: enter phone, submit OTP "123456", set up PIN "123456",
 * and select a role.
 */
export async function loginAs(
  page: Page,
  role: 'cashier' | 'waiter' | 'kitchen' = 'cashier',
) {
  // Most flow specs need stable authenticated state, not another copy of the
  // phone/PIN journey. Auth-specific specs still exercise the visible login UI.
  await page.goto(`/?e2eRole=${role}`);
  if (role === 'cashier') {
    await expect(page.getByText('New order').first()).toBeVisible({ timeout: 15000 });
  } else if (role === 'waiter') {
    await expect(page.getByText('Meja saya').first()).toBeVisible({ timeout: 15000 });
  } else {
    await expect(page.getByText('Dapur', { exact: true }).first()).toBeVisible({ timeout: 15000 });
  }
  return;

  // 1. Navigate to root - the splash screen auto-redirects to login
  await page.goto('/');
  await page.waitForTimeout(1500);

  // Should land on login screen
  await expect(page.getByText('BukuKasir').first()).toBeVisible({ timeout: 10000 });

  // 2. Enter phone number. RN web renders this as a plain input for number-pad.
  const phoneInput = page.locator('input').first();
  await phoneInput.waitFor({ timeout: 10000 });
  await phoneInput.fill('8123456789');

  // 3. Dev login sends verification and jumps to business selection when multiple businesses exist.
  await page.getByText(/Send verification code|Kirim kode verifikasi/).click();

  const businessPickerVisible = await page
    .getByText('Pilih Bisnis')
    .or(page.getByText('Pick Business'))
    .isVisible({ timeout: 10000 })
    .catch(() => false);
  if (businessPickerVisible) {
    const preferredBusiness = page.getByText(/Masuk|Open/).first();
    await expect(preferredBusiness).toBeVisible({ timeout: 10000 });
    await page.waitForTimeout(1000);

    for (let attempt = 0; attempt < 4; attempt += 1) {
      await preferredBusiness.click({ force: true });
      if (await pinGate(page).isVisible({ timeout: 3000 }).catch(() => false)) {
        break;
      }
    }
  }

  // 4. Wait for PIN setup / role selection screen
  await expect(pinGate(page)).toBeVisible({ timeout: 15000 });

  // 5. Select role if role selection screen is shown first
  const roleSelectionVisible = await page
    .getByText('Pilih Peran Anda')
    .or(page.getByText('Pick your role'))
    .isVisible()
    .catch(() => false);
  if (roleSelectionVisible) {
    const roleButtonText =
      role === 'cashier'
        ? /Kasir|Cashier/
        : role === 'waiter'
        ? /Pelayan|Waiter/
        : /Dapur|Kitchen/;
    await page.getByText(roleButtonText).first().click();
    await page.waitForTimeout(500);
  }

  // 6. Enter PIN "123456"
  await expect(page.getByText('Masukkan PIN').or(page.getByText('Enter PIN')).first()).toBeVisible({ timeout: 10000 });
  await enterPin(page, '123456');
  await page.waitForTimeout(1500);
}

/**
 * Navigate to the login screen from root
 */
export async function goToLogin(page: Page) {
  await page.goto('/');
  await page.waitForTimeout(1500);
  await expect(page.getByText('BukuKasir').first()).toBeVisible({ timeout: 10000 });
}
