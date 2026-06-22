import { test, expect } from '@playwright/test';
import { loginAs } from '../../fixtures/auth';

test.describe('Kitchen - Redesigned KDS', () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, 'kitchen');
    await expect(page.getByText('Dapur', { exact: true }).first()).toBeVisible({ timeout: 15000 });
  });

  test('shows simplified fat tickets with BUMP action', async ({ page }) => {
    await expect(page.getByText('Fat tickets')).toBeVisible();
    await expect(page.getByText('ORD-021').or(page.getByText(/ORD-/).first())).toBeVisible({ timeout: 10000 });
    await expect(page.getByText('BUMP').first()).toBeVisible();
    await page.getByRole('button', { name: 'Sound on' }).click();
    await expect(page.getByRole('button', { name: 'Muted' })).toBeVisible();
    await page.getByText('BUMP').first().click();
    await expect(page.getByText(/sync queued|failed sync/).first()).toBeVisible();
  });

  test('switches to board/detail/reprint flow', async ({ page }) => {
    await page.getByRole('button', { name: 'Board/detail' }).click();
    await expect(page.getByText('Baru')).toBeVisible();
    await expect(page.getByText('Sedang Dimasak')).toBeVisible();
    await expect(page.getByText('Siap')).toBeVisible();
    await page.getByRole('button', { name: /Open ticket ORD-/ }).first().click();
    await expect(page.getByText('REPRINT TIKET')).toBeVisible();
    await page.getByText('REPRINT TIKET').click();
    await expect(page.getByText('Kitchen reprint')).toBeVisible();
    await page.getByRole('button', { name: 'Queue reprint' }).click();
    await expect(page.getByText('Reprint queued')).toBeVisible();
  });

  test('moves board tickets back and forward without opening detail accidentally', async ({ page }) => {
    await page.getByRole('button', { name: 'Board/detail' }).click();
    const preparingColumn = page.getByTestId('kds-column-preparing');
    const newColumn = page.getByTestId('kds-column-new');
    const readyColumn = page.getByTestId('kds-column-ready');

    await expect(readyColumn.getByRole('button', { name: 'Move back' }).first()).toBeVisible();
    await expect(readyColumn.getByRole('button', { name: 'Complete' }).first()).toBeVisible();

    const ticket = preparingColumn.locator('[data-testid^="kds-ticket-"]').first();
    const ticketTitle = await ticket.getByText(/ORD-/).first().innerText();

    await ticket.getByRole('button', { name: 'Move back' }).click();
    await expect(newColumn.getByText(ticketTitle)).toBeVisible();
    await expect(page.getByText('REPRINT TIKET')).toHaveCount(0);

    const movedTicket = newColumn.locator('[data-testid^="kds-ticket-"]').filter({ hasText: ticketTitle }).first();
    await movedTicket.getByRole('button', { name: 'Start cooking' }).click();
    await expect(preparingColumn.getByText(ticketTitle)).toBeVisible();
  });

  test('opens printer settings from header and queues test print', async ({ page }) => {
    await page.getByRole('button', { name: 'Printer' }).click();
    await expect(page.getByText('Kitchen printer')).toBeVisible();
    await expect(page.getByText('Printer pairing')).toBeVisible();
    await page.getByRole('button', { name: 'Queue test print' }).click();
    await expect(page.getByText('Test print queued')).toBeVisible();
    await expect(page.getByText(/kitchen · queued/i).first()).toBeVisible({ timeout: 10000 });
    await page.getByRole('button', { name: 'Reprint last ticket' }).click();
    await expect(page.getByText('Reprint queued')).toBeVisible();
  });
});
