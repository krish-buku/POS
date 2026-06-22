const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'

/** Build a URL-encoded query string from non-nullish params */
function qs(params: Record<string, string | number | boolean | undefined | null>): string {
  const entries = Object.entries(params).filter(([, v]) => v != null) as [string, string | number | boolean][]
  if (entries.length === 0) return ''
  return '?' + entries.map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`).join('&')
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...options?.headers },
    ...options,
  })
  if (!res.ok) {
    const errorText = await res.text().catch(() => '')
    let message = `API error: ${res.status}`
    try {
      const errorJson = JSON.parse(errorText)
      if (errorJson.message) message = errorJson.message
    } catch { /* use default message */ }
    throw new Error(message)
  }
  const text = await res.text()
  if (!text) return undefined as T
  const json = JSON.parse(text)
  return json.data ?? json
}

export const api = {
  // Auth
  verifyPin: (businessId: string, pin: string) =>
    request<any>('/api/auth/verify-pin', {
      method: 'POST',
      body: JSON.stringify({ businessId, pin }),
    }),
  getSession: (staffId: string) =>
    request<any>(`/api/auth/session${qs({ staffId })}`),
  resetPin: (staffId: string, managerStaffId: string) =>
    request<any>('/api/auth/reset-pin', {
      method: 'POST',
      body: JSON.stringify({ staffId, managerStaffId }),
    }),

  // Menu — Categories
  getCategories: (businessId?: string) =>
    request<any[]>(`/api/menu/categories${qs({ businessId })}`),
  createCategory: (data: { name: string; description: string; businessId: string; sortOrder?: number; imageUrl?: string }) =>
    request<any>('/api/menu/categories', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  updateCategory: (id: string, data: { name: string; description: string; businessId: string; sortOrder?: number; imageUrl?: string }) =>
    request<any>(`/api/menu/categories/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  deleteCategory: (id: string) =>
    request<void>(`/api/menu/categories/${id}`, { method: 'DELETE' }),

  // Menu — Items
  getMenuItems: (businessId: string) =>
    request<any[]>(`/api/menu/items${qs({ businessId })}`),
  createMenuItem: (data: { name: string; description: string; price: number; categoryId: string; businessId: string; imageUrl?: string }) =>
    request<any>('/api/menu/items', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  updateMenuItem: (id: string, data: { name: string; description: string; price: number; categoryId: string; businessId: string; imageUrl?: string }) =>
    request<any>(`/api/menu/items/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  deleteMenuItem: (id: string) =>
    request<void>(`/api/menu/items/${id}`, { method: 'DELETE' }),
  toggleMenuItemAvailability: (id: string, available: boolean) =>
    request<any>(`/api/menu/items/${id}/availability`, {
      method: 'PATCH',
      body: JSON.stringify({ available }),
    }),

  // Staff
  getStaff: (businessId: string) =>
    request<any[]>(`/api/staff${qs({ businessId })}`),
  createStaff: (data: { name: string; phone: string; role: string; businessId: string; pin: string; active?: boolean }) =>
    request<any>('/api/staff', {
      method: 'POST',
      body: JSON.stringify({ ...data, role: data.role.toUpperCase() }),
    }),
  updateStaff: (id: string, data: { name: string; phone: string; role: string; businessId: string; active?: boolean }) =>
    request<any>(`/api/staff/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ ...data, role: data.role.toUpperCase() }),
    }),
  deleteStaff: (id: string) =>
    request<void>(`/api/staff/${id}`, { method: 'DELETE' }),
  resetStaffPin: (id: string) =>
    request<any>(`/api/staff/${id}/reset-pin`, { method: 'POST' }),

  // Orders
  getOrders: (businessId: string) =>
    request<any[]>(`/api/orders${qs({ businessId })}`),

  // Tables
  getTables: (businessId: string) =>
    request<any[]>(`/api/tables${qs({ businessId })}`),

  // Floors
  getFloors: (businessId: string) =>
    request<any[]>(`/api/floors${qs({ businessId })}`),
  createFloor: (data: { name: string; businessId: string; sortOrder: number }) =>
    request<any>('/api/floors', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  updateFloor: (id: string, data: { name: string; businessId: string; sortOrder: number }) =>
    request<any>(`/api/floors/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  deleteFloor: (id: string) =>
    request<void>(`/api/floors/${id}`, { method: 'DELETE' }),

  // Areas
  getAreas: (businessId?: string, floorId?: string) =>
    request<any[]>(`/api/areas${qs({ businessId, floorId })}`),
  createArea: (data: { name: string; floorId: string; businessId: string; sortOrder: number }) =>
    request<any>('/api/areas', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  updateArea: (id: string, data: { name: string; floorId: string; businessId: string; sortOrder: number }) =>
    request<any>(`/api/areas/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  deleteArea: (id: string) =>
    request<void>(`/api/areas/${id}`, { method: 'DELETE' }),

  // Payments — Methods
  getPayments: (businessId?: string) =>
    request<any[]>(`/api/payments${qs({ businessId })}`),
  getPaymentMethods: (businessId: string) =>
    request<any[]>(`/api/payments/methods${qs({ businessId })}`),
  createPaymentMethod: (data: { name: string; type: string; active: boolean; businessId: string }) =>
    request<any>('/api/payments/methods', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  updatePaymentMethod: (id: string, data: { name: string; type: string; active: boolean; businessId: string }) =>
    request<any>(`/api/payments/methods/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  deletePaymentMethod: (id: string) =>
    request<void>(`/api/payments/methods/${id}`, { method: 'DELETE' }),

  // Kitchen
  getKitchenTickets: (businessId: string) =>
    request<any[]>(`/api/kitchen/tickets${qs({ businessId })}`),

  // Shifts
  getShifts: (businessId: string) =>
    request<any[]>(`/api/shifts${qs({ businessId })}`),

  // Reports
  getDailySummary: (date?: string, businessId?: string) =>
    request<any>(`/api/reports/daily-summary${qs({ date, businessId })}`),
  getSalesReport: (period?: string, businessId?: string) =>
    request<any>(`/api/reports/sales${qs({ period, businessId })}`),
  getPaymentMethodReport: (businessId?: string) =>
    request<any[]>(`/api/reports/payment-methods${qs({ businessId })}`),
  getTopItems: (limit?: number, businessId?: string) =>
    request<any[]>(`/api/reports/top-items${qs({ limit, businessId })}`),
  getStaffPerformance: (businessId?: string) =>
    request<any[]>(`/api/reports/staff-performance${qs({ businessId })}`),

  // Business
  getBusiness: (id: string) =>
    request<any>(`/api/businesses/${id}`),
  getBusinesses: () =>
    request<any[]>('/api/businesses'),
  updateBusiness: (id: string, data: { name: string; type?: string; address?: string; phone?: string; email?: string; ppnEnabled?: boolean; ppnRate?: number; ppnMode?: string; showTaxLabel?: boolean }) =>
    request<any>(`/api/businesses/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  createBusiness: (data: { name: string; type: string; address?: string; phone?: string; email?: string; ownerId?: string; logoUrl?: string }) =>
    request<any>('/api/businesses', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Promotions
  getPromotions: (businessId: string) =>
    request<any[]>(`/api/orders/promotions${qs({ businessId })}`),
  createPromotion: (data: any) =>
    request<any>('/api/orders/promotions', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  updatePromotion: (id: string, data: any) =>
    request<any>(`/api/orders/promotions/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  deletePromotion: (id: string) =>
    request<void>(`/api/orders/promotions/${id}`, { method: 'DELETE' }),

  // Tax Config
  getTaxConfigs: (businessId: string) =>
    request<any[]>(`/api/orders/tax-config${qs({ businessId })}`),
  createTaxConfig: (data: { businessId: string; name: string; rate: number; inclusive: boolean; active: boolean; priority?: number }) =>
    request<any>('/api/orders/tax-config', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  updateTaxConfig: (id: string, data: { businessId: string; name: string; rate: number; inclusive: boolean; active: boolean; priority?: number }) =>
    request<any>(`/api/orders/tax-config/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  deleteTaxConfig: (id: string) =>
    request<void>(`/api/orders/tax-config/${id}`, { method: 'DELETE' }),

  // Receipt Template
  getReceiptTemplate: (businessId: string) =>
    request<any>(`/api/receipts/template${qs({ businessId })}`),
  updateReceiptTemplate: (data: { id?: string; businessId: string; headerText: string; footerText: string; showLogo: boolean; showAddress: boolean; showTaxDetails: boolean; paperWidth: string; thankYouMessage?: string; returnPolicy?: string; fontSize?: string; showStaffName?: boolean; showOrderTime?: boolean; autoPrint?: boolean; duplicateCopy?: boolean }) =>
    request<any>('/api/receipts/template', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
}
