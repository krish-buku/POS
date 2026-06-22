import type { OrderCustomer, OpenTabSession } from '../../features/order/types';

export const posCustomers: OrderCustomer[] = [
  { id: 'cust-001', name: 'Sarah Lim', phone: '+62 812 4455 0198', loyaltyTier: 'Gold', visits: 18 },
  { id: 'cust-002', name: 'Raka Pratama', phone: '+62 813 7700 9121', loyaltyTier: 'Regular', visits: 6 },
  { id: 'cust-003', name: 'Maya Putri', phone: '+62 811 2233 8844', loyaltyTier: 'New', visits: 1 },
];

export const posTables = [
  { id: 'table-001', name: 'T1', seats: 2, shape: 'square' as const, status: 'available' as const, runningTotal: 0, guests: 0 },
  { id: 'table-002', name: 'T2', seats: 4, shape: 'round' as const, status: 'occupied' as const, runningTotal: 78000, guests: 3 },
  { id: 'table-003', name: 'T3', seats: 4, shape: 'square' as const, status: 'occupied' as const, runningTotal: 126000, guests: 4 },
  { id: 'table-004', name: 'T4', seats: 6, shape: 'long' as const, status: 'reserved' as const, runningTotal: 0, guests: 0 },
  { id: 'table-005', name: 'T5', seats: 2, shape: 'round' as const, status: 'cleaning' as const, runningTotal: 0, guests: 0 },
  { id: 'table-006', name: 'T6', seats: 8, shape: 'long' as const, status: 'available' as const, runningTotal: 0, guests: 0 },
  { id: 'table-007', name: 'T7', seats: 4, shape: 'square' as const, status: 'available' as const, runningTotal: 0, guests: 0 },
  { id: 'table-008', name: 'T8', seats: 4, shape: 'round' as const, status: 'reserved' as const, runningTotal: 0, guests: 0 },
];

export const openTabSessions: OpenTabSession[] = [
  {
    id: 'tab-001',
    tableId: 'table-002',
    tableName: 'T2',
    customerName: 'Sarah Lim',
    guestCount: 3,
    openedAt: '10:24',
    total: 78000,
    status: 'open',
  },
  {
    id: 'tab-002',
    tableId: 'table-003',
    tableName: 'T3',
    customerName: 'Raka Pratama',
    guestCount: 4,
    openedAt: '10:41',
    total: 126000,
    status: 'bill_requested',
  },
];

export const paymentMethods = [
  { id: 'cash' as const, label: 'Cash', meta: 'Tunai, change calculated', type: 'cash' as const },
  { id: 'qris' as const, label: 'QRIS', meta: 'Manual reference required', type: 'qris' as const },
  { id: 'edc' as const, label: 'EDC Card', meta: 'Terminal approval code', type: 'edc' as const },
  { id: 'ewallet' as const, label: 'E-wallet', meta: 'GoPay/OVO/DANA note', type: 'ewallet' as const },
];

export const historyOrders = [
  { id: 'hist-001', orderNumber: 'ORD-20260602-021', customer: 'Sarah Lim', table: 'T2', total: 156000, status: 'Paid', method: 'QRIS', time: '11:14' },
  { id: 'hist-002', orderNumber: 'ORD-20260602-020', customer: 'Walk-in', table: 'Takeaway', total: 58000, status: 'Paid', method: 'Cash', time: '10:52' },
  { id: 'hist-003', orderNumber: 'ORD-20260602-019', customer: 'Raka Pratama', table: 'T3', total: 126000, status: 'Open tab', method: 'Pending', time: '10:41' },
  { id: 'hist-004', orderNumber: 'ORD-20260602-018', customer: 'Maya Putri', table: 'Courier', total: 82000, status: 'Refund review', method: 'EDC', time: '09:58' },
];

export const kitchenTickets = [
  {
    id: 'kds-001',
    orderNumber: 'ORD-021',
    tableName: 'T2',
    status: 'new' as const,
    elapsed: '04m 12s',
    items: ['2x Nasi Goreng Spesial', '1x Es Teh Manis', 'No sambal'],
  },
  {
    id: 'kds-002',
    orderNumber: 'ORD-020',
    tableName: 'Takeaway',
    status: 'preparing' as const,
    elapsed: '11m 03s',
    items: ['1x Ayam Bakar', '1x Kopi Susu'],
  },
  {
    id: 'kds-003',
    orderNumber: 'ORD-019',
    tableName: 'T3',
    status: 'ready' as const,
    elapsed: '17m 44s',
    items: ['3x Soto Ayam', '2x Pisang Goreng'],
  },
];

export const onboardingSteps = [
  'Welcome',
  'Phone',
  'OTP',
  'Business',
  'Tax & hours',
  'Tables',
  'Menu',
  'Staff',
  'Done',
];
