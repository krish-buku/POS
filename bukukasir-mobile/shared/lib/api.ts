import {
  mockAreas,
  mockCategories,
  mockFloors,
  mockKitchenTickets,
  mockMenuItems,
  mockOrders,
  mockPaymentMethods,
  mockTables,
} from './mock-data'
import { openTabSessions, posCustomers } from '../pos/demoData'
import {
  normalizeKitchenTicket,
  normalizeList,
  normalizeMenuCategory,
  normalizeMenuItem,
  normalizeOrder,
  normalizePaymentMethod,
  normalizeTable,
} from './normalizers'

const API_BASE = process.env.EXPO_PUBLIC_API_BASE_URL || 'http://localhost:8080'
const API_TIMEOUT_MS = Number(process.env.EXPO_PUBLIC_API_TIMEOUT_MS ?? 5000)
const INCLUDE_DESIGN_SEEDS = process.env.EXPO_PUBLIC_INCLUDE_DESIGN_SEEDS !== 'false'

async function requestFromBase<T>(baseUrl: string, path: string, options?: RequestInit): Promise<T> {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), API_TIMEOUT_MS)
  let res: Response
  let text = ''
  try {
    res = await fetch(`${baseUrl}${path}`, {
      headers: { 'Content-Type': 'application/json', ...options?.headers },
      ...options,
      signal: options?.signal ?? controller.signal,
    })
    text = await res.text()
  } finally {
    clearTimeout(timeout)
  }
  let parsed: any = undefined
  if (text) {
    try { parsed = JSON.parse(text) } catch { parsed = text }
  }
  if (!res.ok) {
    const msg = parsed?.message || parsed?.error || `API error: ${res.status}`
    const err: any = new Error(msg)
    err.status = res.status
    err.body = parsed
    throw err
  }
  if (parsed === undefined) return undefined as T
  return parsed?.data ?? parsed
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  return requestFromBase<T>(API_BASE, path, options)
}

function localServiceBase(port: number): string | null {
  if (!/^https?:\/\/(localhost|127\.0\.0\.1|\[::1\]):8080\b/.test(API_BASE)) {
    return null
  }
  return `http://localhost:${port}`
}

async function requestViaLocalService<T>(
  path: string,
  port: number,
  options?: RequestInit,
): Promise<T> {
  try {
    return await request<T>(path, options)
  } catch (gatewayError) {
    const base = localServiceBase(port)
    if (!base) throw gatewayError
    return requestFromBase<T>(base, path, options)
  }
}

async function withMockFallback<T>(fn: () => Promise<T>, mock: T): Promise<T> {
  try {
    const result = await fn()
    if (Array.isArray(result) && result.length === 0 && Array.isArray(mock) && mock.length > 0) {
      return mock
    }
    return result
  } catch {
    return mock
  }
}

function seedCategoriesForBusiness(businessId: string) {
  const source = mockCategories.filter((c) => c.businessId === businessId);
  const seed = source.length > 0 ? source : mockCategories.filter((c) => c.businessId === 'biz-001');
  return seed.map((category) => ({ ...category, businessId }));
}

function seedMenuItemsForBusiness(businessId: string) {
  const source = mockMenuItems.filter((m) => m.businessId === businessId);
  const seed = source.length > 0 ? source : mockMenuItems.filter((m) => m.businessId === 'biz-001');
  return seed.map((item) => ({ ...item, businessId }));
}

function scopeRowsToBusiness<T extends { businessId?: string | null }>(
  rows: T[],
  businessId: string,
): T[] {
  return rows.map((row) => ({ ...row, businessId }));
}

function mergeDesignSeeds<T>(
  rows: T[],
  seeds: T[],
  getKey: (row: T) => string | undefined | null,
): T[] {
  if (!INCLUDE_DESIGN_SEEDS) return rows;
  const seen = new Set(rows.map(getKey).filter(Boolean) as string[]);
  const missingSeeds = seeds.filter((seed) => {
    const key = getKey(seed);
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
  return [...rows, ...missingSeeds];
}

// Auth
export const verifyPin = (businessId: string, pin: string) =>
  requestViaLocalService<any>('/api/auth/verify-pin', 8081, {
    method: 'POST',
    body: JSON.stringify({ businessId, pin }),
  })

// Businesses
export const getBusinesses = () => requestViaLocalService<any[]>('/api/businesses', 8082)

// Staff
export const getStaff = (businessId: string) =>
  requestViaLocalService<any[]>(`/api/staff?businessId=${encodeURIComponent(businessId)}`, 8083)

// Menu
export const getCategories = (businessId: string) =>
  withMockFallback(
    async () =>
      scopeRowsToBusiness(
        normalizeList(
          await requestViaLocalService<any[]>(
            `/api/menu/categories?businessId=${encodeURIComponent(businessId)}`,
            8084,
          ),
          normalizeMenuCategory,
        ),
        businessId,
      ),
    seedCategoriesForBusiness(businessId).map(normalizeMenuCategory) as any[],
  )
export const getMenuItems = (businessId: string) =>
  withMockFallback(
    async () =>
      scopeRowsToBusiness(
        normalizeList(
          await requestViaLocalService<any[]>(
            `/api/menu/items?businessId=${encodeURIComponent(businessId)}`,
            8084,
          ),
          normalizeMenuItem,
        ),
        businessId,
      ),
    seedMenuItemsForBusiness(businessId).map(normalizeMenuItem) as any[],
  )

// Floors & Areas
export const getFloors = (businessId: string) =>
  withMockFallback(
    async () =>
      scopeRowsToBusiness(
        await requestViaLocalService<any[]>(
          `/api/floors?businessId=${encodeURIComponent(businessId)}`,
          8085,
        ),
        businessId,
      ),
    mockFloors.filter((f) => f.businessId === businessId) as any[],
  )

export const getAreas = (businessId: string) =>
  withMockFallback(
    async () =>
      scopeRowsToBusiness(
        await requestViaLocalService<any[]>(
          `/api/areas?businessId=${encodeURIComponent(businessId)}`,
          8085,
        ),
        businessId,
      ),
    mockAreas.filter((a) => a.businessId === businessId) as any[],
  )

// Tables
export const getTables = (businessId: string) =>
  withMockFallback(
    async () =>
      scopeRowsToBusiness(
        normalizeList(
          await requestViaLocalService<any[]>(
            `/api/tables?businessId=${encodeURIComponent(businessId)}`,
            8085,
          ),
          normalizeTable,
        ),
        businessId,
      ),
    mockTables.filter((t) => t.businessId === businessId).map(normalizeTable) as any[],
  )

export const updateTableStatus = (tableId: string, status: string) =>
  requestViaLocalService<any>(`/api/tables/${tableId}/status`, 8085, {
    method: 'PUT',
    body: JSON.stringify({ status: String(status).toUpperCase() }),
  })

export const assignTableStaff = (tableId: string, assignedStaffId: string) =>
  requestViaLocalService<any>(`/api/tables/${tableId}/assign`, 8085, {
    method: 'PUT',
    body: JSON.stringify({ assignedStaffId }),
  })

export const transferTable = (body: {
  fromTableId: string
  toTableId: string
  staffId?: string
}) =>
  requestViaLocalService<any>('/api/tables/transfer', 8085, {
    method: 'POST',
    body: JSON.stringify(body),
  })

export const mergeTables = (body: {
  tableIds: string[]
  targetTableId: string
}) =>
  requestViaLocalService<any>('/api/tables/merge', 8085, {
    method: 'POST',
    body: JSON.stringify(body),
  })

export const voidOrder = (orderId: string, reason: string) =>
  requestViaLocalService<any>(`/api/orders/${orderId}/void`, 8086, {
    method: 'POST',
    body: JSON.stringify({ reason }),
  })

// Orders
export const getOrders = (businessId: string) =>
  withMockFallback(
    async () => normalizeList(await requestViaLocalService<any[]>(`/api/orders?businessId=${encodeURIComponent(businessId)}`, 8086), normalizeOrder),
    mockOrders.filter((o) => o.businessId === businessId).map(normalizeOrder) as any[],
  )

export const getOrderById = (orderId: string) =>
  withMockFallback(
    async () => normalizeOrder(await requestViaLocalService<any>(`/api/orders/${orderId}`, 8086)),
    normalizeOrder(mockOrders.find((o) => o.id === orderId) ?? mockOrders[0]),
  )

export const createOrder = (body: {
  businessId: string
  tableId?: string
  tableName?: string
  staffId?: string
  staffName?: string
  items: any[]
  orderType: string
  notes?: string
}) =>
  requestViaLocalService<any>('/api/orders', 8086, {
    method: 'POST',
    body: JSON.stringify(body),
  })

export const updateOrderItems = (orderId: string, items: any[]) =>
  requestViaLocalService<any>(`/api/orders/${orderId}/items`, 8086, {
    method: 'PUT',
    body: JSON.stringify({ items }),
  })

// Backend endpoint is POST /api/payments with a PaymentRequest body.
export const createPayment = (body: {
  orderId: string
  orderNumber?: string
  amount: number
  amountPaid: number
  paymentMethodId: string
  paymentMethodName?: string
  staffId?: string
  businessId?: string
}) =>
  requestViaLocalService<any>('/api/payments', 8087, {
    method: 'POST',
    body: JSON.stringify(body),
  })

// Kitchen
export const getKitchenTickets = (businessId: string) =>
  withMockFallback(
    async () => {
      const designTickets = scopeRowsToBusiness(mockKitchenTickets.map(normalizeKitchenTicket), businessId) as any[];
      const apiTickets = scopeRowsToBusiness(
        normalizeList(
          await requestViaLocalService<any[]>(
            `/api/kitchen/tickets?businessId=${encodeURIComponent(businessId)}`,
            8088,
          ),
          normalizeKitchenTicket,
        ),
        businessId,
      );
      return mergeDesignSeeds(apiTickets, designTickets, (ticket: any) => ticket.id);
    },
    scopeRowsToBusiness(mockKitchenTickets.map(normalizeKitchenTicket), businessId) as any[],
  )

export const advanceKitchenTicket = (ticketId: string, nextStatus: string) =>
  requestViaLocalService<any>(`/api/kitchen/tickets/${ticketId}/status`, 8088, {
    method: 'PUT',
    body: JSON.stringify({ status: String(nextStatus).toUpperCase() }),
  })

// Payments
export const getPaymentMethods = (businessId: string) =>
  withMockFallback(
    async () =>
      scopeRowsToBusiness(
        normalizeList(
          await requestViaLocalService<any[]>(
            `/api/payments/methods?businessId=${encodeURIComponent(businessId)}`,
            8087,
          ),
          normalizePaymentMethod,
        ),
        businessId,
      ),
    mockPaymentMethods.map(normalizePaymentMethod) as any[],
  )

// Redesign contracts. These routes intentionally fall back to local data in
// development so all redesigned mobile flows remain usable in simulator.
export const getCustomers = (businessId: string, query = '') =>
  withMockFallback(
    async () => {
      const q = query.trim().toLowerCase();
      const designCustomers = posCustomers.filter((customer) =>
        `${customer.name} ${customer.phone}`.toLowerCase().includes(q)
      ) as any[];
      const apiCustomers = await requestViaLocalService<any[]>(
        `/api/customers?businessId=${encodeURIComponent(businessId)}&q=${encodeURIComponent(query)}`,
        8082,
      );
      return mergeDesignSeeds(apiCustomers, designCustomers, (customer: any) => customer.phone || customer.id);
    },
    posCustomers.filter((customer) =>
      `${customer.name} ${customer.phone}`.toLowerCase().includes(query.trim().toLowerCase())
    ) as any[],
  )

export const createCustomer = (body: {
  businessId: string
  name: string
  phone: string
}) =>
  withMockFallback(
    async () =>
      await requestViaLocalService<any>('/api/customers', 8082, {
        method: 'POST',
        body: JSON.stringify(body),
      }),
    {
      id: `cust-local-${Date.now()}`,
      name: body.name,
      phone: body.phone,
      loyaltyTier: 'New',
      visits: 1,
    },
  )

export const getOpenTabSessions = (businessId: string) =>
  withMockFallback(
    async () =>
      await requestViaLocalService<any[]>(
        `/api/order-sessions?businessId=${encodeURIComponent(businessId)}&status=OPEN`,
        8086,
      ),
    openTabSessions as any[],
  )

export const createOpenTabSession = (body: {
  businessId: string
  tableId: string
  tableName: string
  customerName: string
  guestCount: number
  staffId?: string
}) =>
  withMockFallback(
    async () =>
      await requestViaLocalService<any>('/api/order-sessions', 8086, {
        method: 'POST',
        body: JSON.stringify(body),
      }),
    {
      id: `tab-local-${Date.now()}`,
      tableId: body.tableId,
      tableName: body.tableName,
      customerName: body.customerName,
      guestCount: body.guestCount,
      openedAt: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
      total: 0,
      status: 'open',
    },
  )

export const saveOnboardingSetup = (body: {
  businessId?: string
  businessName: string
  taxEnabled: boolean
  serviceFeePercent: number
  tableCount: number
  menuSeed: string[]
  staffInvites: string[]
}) =>
  withMockFallback(
    async () =>
      await requestViaLocalService<any>('/api/businesses/onboarding', 8082, {
        method: 'POST',
        body: JSON.stringify(body),
      }),
    { ...body, id: body.businessId || `biz-local-${Date.now()}`, status: 'saved' },
  )

export const createPrintJob = (body: {
  businessId: string
  orderId?: string
  type: 'receipt' | 'kitchen' | 'reprint'
  printerName?: string
}) =>
  withMockFallback(
    async () =>
      await requestViaLocalService<any>('/api/print-jobs', 8092, {
        method: 'POST',
        body: JSON.stringify(body),
      }),
    {
      id: `print-local-${Date.now()}`,
      ...body,
      status: body.printerName ? 'queued' : 'failed',
      createdAt: new Date().toISOString(),
    },
  )

export const getPrintJobs = (businessId: string) =>
  withMockFallback(
    async () =>
      await requestViaLocalService<any[]>(
        `/api/print-jobs?businessId=${encodeURIComponent(businessId)}`,
        8092,
      ),
    [] as any[],
  )

export const sendBillRequest = (body: {
  businessId: string
  tableId: string
  staffId?: string
}) =>
  withMockFallback(
    async () =>
      await requestViaLocalService<any>('/api/bill-requests', 8086, {
        method: 'POST',
        body: JSON.stringify(body),
      }),
    { id: `bill-local-${Date.now()}`, ...body, status: 'pending' },
  )

export const createWaiterTransfer = (body: {
  businessId: string
  tableId: string
  fromStaffId?: string
  toStaffName: string
}) =>
  withMockFallback(
    async () =>
      await requestViaLocalService<any>('/api/waiter-transfers', 8085, {
        method: 'POST',
        body: JSON.stringify(body),
      }),
    { id: `transfer-local-${Date.now()}`, ...body, status: 'pending' },
  )

export const acceptWaiterTransfer = (transferId: string, accepted: boolean) =>
  withMockFallback(
    async () =>
      await requestViaLocalService<any>(`/api/waiter-transfers/${transferId}`, 8085, {
        method: 'PUT',
        body: JSON.stringify({ accepted }),
      }),
    { id: transferId, status: accepted ? 'accepted' : 'rejected' },
  )

export const recordAuditEvent = (body: {
  businessId: string
  type: string
  payload?: Record<string, unknown>
}) =>
  withMockFallback(
    async () =>
      await requestViaLocalService<any>('/api/audit-events', 8086, {
        method: 'POST',
        body: JSON.stringify(body),
      }),
    { id: `audit-local-${Date.now()}`, ...body, createdAt: new Date().toISOString() },
  )

// Legacy object form for backward compatibility with existing imports.
export const api = {
  verifyPin,
  getBusinesses,
  getStaff,
  getCategories,
  getMenuItems,
  getFloors,
  getAreas,
  getTables,
  updateTableStatus,
  assignTableStaff,
  transferTable,
  mergeTables,
  voidOrder,
  getOrders,
  getOrderById,
  createOrder,
  updateOrderItems,
  createPayment,
  getKitchenTickets,
  advanceKitchenTicket,
  getPaymentMethods,
  getCustomers,
  createCustomer,
  getOpenTabSessions,
  createOpenTabSession,
  saveOnboardingSetup,
  createPrintJob,
  getPrintJobs,
  sendBillRequest,
  createWaiterTransfer,
  acceptWaiterTransfer,
  recordAuditEvent,
}
