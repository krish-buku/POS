import type { KitchenTicketStatus, OrderStatus, TableStatus } from '../constants/colors';

const TABLE_STATUSES: TableStatus[] = ['available', 'occupied', 'reserved', 'cleaning'];
const ORDER_STATUSES: OrderStatus[] = ['new', 'preparing', 'ready', 'served', 'paid', 'cancelled'];
const KITCHEN_STATUSES: KitchenTicketStatus[] = ['new', 'preparing', 'ready'];

function normalizeEnum<T extends string>(value: unknown, allowed: readonly T[], fallback: T): T {
  const normalized = String(value ?? fallback).trim().toLowerCase().replace(/_/g, '-') as T;
  return allowed.includes(normalized) ? normalized : fallback;
}

function tableNumber(table: any): number {
  if (typeof table?.number === 'number') return table.number;
  const digits = String(table?.name ?? table?.id ?? '').match(/\d+/)?.[0];
  return digits ? Number(digits) : 0;
}

export function normalizeTable(table: any) {
  const status = normalizeEnum(table?.status, TABLE_STATUSES, 'available');
  const runningTotal =
    Number(table?.runningTotal ?? table?.total ?? table?.currentTotal ?? table?.amount ?? 0) || 0;
  return {
    ...table,
    number: tableNumber(table),
    name: table?.name ?? `Meja ${tableNumber(table) || '-'}`,
    capacity: Number(table?.capacity ?? table?.seats ?? 4) || 4,
    status,
    currentOrderId: table?.currentOrderId ?? table?.orderId ?? null,
    assignedStaffId: table?.assignedStaffId ?? table?.staffId ?? null,
    runningTotal,
    orderStartedAt: table?.orderStartedAt ?? table?.currentOrderStartedAt ?? table?.createdAt ?? null,
    syncState: table?.syncState ?? 'synced',
  };
}

export function normalizeOrder(order: any) {
  const status = normalizeEnum(order?.status, ORDER_STATUSES, 'new');
  const items = Array.isArray(order?.items)
    ? order.items.map((item: any, index: number) => ({
        ...item,
        id: item?.id ?? `line-${index}`,
        menuItemName: item?.menuItemName ?? item?.name ?? 'Item',
        quantity: Number(item?.quantity ?? 1) || 1,
        unitPrice: Number(item?.unitPrice ?? item?.price ?? 0) || 0,
        subtotal: Number(item?.subtotal ?? (Number(item?.quantity ?? 1) || 1) * (Number(item?.unitPrice ?? item?.price ?? 0) || 0)) || 0,
        modifiers: Array.isArray(item?.modifiers) ? item.modifiers : [],
        notes: item?.notes ?? '',
      }))
    : [];
  const subtotal = Number(order?.subtotal ?? items.reduce((sum: number, item: any) => sum + item.subtotal, 0)) || 0;
  const total = Number(order?.total ?? subtotal) || 0;
  return {
    ...order,
    items,
    subtotal,
    discount: Number(order?.discount ?? 0) || 0,
    tax: Number(order?.tax ?? 0) || 0,
    total,
    status,
    type: order?.type ?? order?.orderType ?? 'dine_in',
    tableName: order?.tableName ?? (order?.tableId ? order.tableId : 'Takeaway'),
    taxBreakdown: Array.isArray(order?.taxBreakdown) ? order.taxBreakdown : [],
    syncState: order?.syncState ?? 'synced',
  };
}

export function normalizeKitchenTicket(ticket: any) {
  return {
    ...ticket,
    status: normalizeEnum(ticket?.status, KITCHEN_STATUSES, 'new'),
    tableName: ticket?.tableName ?? ticket?.table ?? '-',
    items: Array.isArray(ticket?.items)
      ? ticket.items.map((item: any, index: number) => ({
          ...item,
          id: item?.id ?? `kti-${index}`,
          name: item?.name ?? item?.menuItemName ?? 'Item',
          quantity: Number(item?.quantity ?? 1) || 1,
          modifiers: Array.isArray(item?.modifiers) ? item.modifiers : [],
          notes: item?.notes ?? '',
        }))
      : [],
    createdAt: ticket?.createdAt ?? new Date().toISOString(),
    syncState: ticket?.syncState ?? 'synced',
  };
}

export function normalizeMenuItem(item: any) {
  const modifierGroups = Array.isArray(item?.modifierGroups) ? item.modifierGroups : [];
  const legacyModifiers = Array.isArray(item?.modifiers) ? item.modifiers : [];
  return {
    ...item,
    name: item?.name ?? 'Menu',
    price: Number(item?.price ?? 0) || 0,
    imageUrl: item?.imageUrl ?? item?.thumbnailUrl ?? item?.thumbnail ?? item?.image ?? null,
    isAvailable: item?.isAvailable ?? item?.available ?? true,
    modifiers: legacyModifiers,
    modifierGroups,
  };
}

const CATEGORY_NAME_BY_ID: Record<string, string> = {
  'cat-001': 'Makanan',
  'cat-002': 'Minuman',
  'cat-003': 'Snack',
  'cat-004': 'Dessert',
};

export function normalizeMenuCategory(category: any) {
  const id = String(
    typeof category === 'string'
      ? category
      : category?.id ?? category?.categoryId ?? category?.code ?? 'uncategorized',
  );
  return {
    ...(typeof category === 'object' && category ? category : {}),
    id,
    name:
      (typeof category === 'object' && category
        ? category.name ?? category.categoryName ?? category.label
        : null) ??
      CATEGORY_NAME_BY_ID[id] ??
      'Lainnya',
    sortOrder:
      Number(
        typeof category === 'object' && category
          ? category.sortOrder ?? category.order ?? category.position
          : 999,
      ) || 999,
    active:
      typeof category === 'object' && category
        ? category.active ?? category.isActive ?? true
        : true,
  };
}

export function normalizePaymentMethod(method: any) {
  return {
    ...method,
    type: String(method?.type ?? 'custom').toLowerCase(),
    active: method?.active ?? method?.isActive ?? true,
    isActive: method?.isActive ?? method?.active ?? true,
  };
}

export function normalizeList<T>(value: T[] | null | undefined, mapper: (item: T) => any) {
  return Array.isArray(value) ? value.map(mapper) : [];
}
