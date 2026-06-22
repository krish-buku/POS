import { test, expect } from '@playwright/test';

test.describe('Mobile POS integration stitching', () => {
  test('created orders reach kitchen and completed payments update order visibility', async ({ request }) => {
    const businessId = 'biz-001';
    const suffix = Date.now().toString().slice(-6);

    const orderResponse = await request.post('/api/orders', {
      data: {
        tableId: null,
        tableName: `Takeaway ${suffix}`,
        staffId: 'staff-003',
        staffName: 'Rudi Hartono',
        businessId,
        items: [
          {
            menuItemId: `e2e-menu-${suffix}`,
            menuItemName: `E2E Soto ${suffix}`,
            quantity: 1,
            unitPrice: 20000,
            notes: 'Integration stitching test',
            modifiers: [],
            variantName: null,
          },
        ],
        notes: 'Mobile POS integration stitching test',
      },
    });

    expect(orderResponse.status()).toBe(201);
    const orderBody = await orderResponse.json();
    const order = orderBody.data;
    expect(order.id).toBeTruthy();
    expect(order.orderNumber).toBeTruthy();

    await expect
      .poll(async () => {
        const ticketsResponse = await request.get(`/api/kitchen/tickets?businessId=${businessId}`);
        const ticketsBody = await ticketsResponse.json();
        return (ticketsBody.data ?? []).some((ticket: any) =>
          ticket.orderId === order.id && ticket.orderNumber === order.orderNumber
        );
      }, { timeout: 5000 })
      .toBeTruthy();

    const paymentResponse = await request.post('/api/payments', {
      data: {
        orderId: order.id,
        orderNumber: order.orderNumber,
        amount: order.total,
        amountPaid: order.total,
        paymentMethodId: 'pm-001',
        paymentMethodName: 'Cash',
        staffId: 'staff-003',
        businessId,
      },
    });

    expect(paymentResponse.status()).toBe(201);
    const paymentBody = await paymentResponse.json();
    const payment = paymentBody.data;
    expect(payment.id).toBeTruthy();
    expect(payment.orderId).toBe(order.id);
    expect(payment.status).toBe('COMPLETED');

    await expect
      .poll(async () => {
        const paidOrderResponse = await request.get(`/api/orders/${order.id}`);
        const paidOrderBody = await paidOrderResponse.json();
        return paidOrderBody.data?.status;
      }, { timeout: 5000 })
      .toBe('COMPLETED');

    const paymentsResponse = await request.get(`/api/payments?businessId=${businessId}`);
    expect(paymentsResponse.status()).toBe(200);
    const paymentsBody = await paymentsResponse.json();
    expect((paymentsBody.data ?? []).some((row: any) =>
      row.id === payment.id && row.orderId === order.id && row.paymentMethodName === 'Cash'
    )).toBeTruthy();
  });
});
