// ─── Type Definitions ────────────────────────────────────────────────────────

export interface Business {
  id: string
  name: string
  address: string
  phone: string
  type: 'restaurant' | 'cafe' | 'retail'
  logo?: string
  createdAt: string
}

export interface User {
  id: string
  name: string
  phone: string
  email?: string
  avatarUrl?: string
  role: StaffRole
}

export type StaffRole = 'owner' | 'manager' | 'cashier' | 'waiter'

export interface MenuCategory {
  id: string
  name: string
  description: string
  sortOrder: number
  itemCount: number
  imageUrl?: string
}

export interface MenuModifier {
  id: string
  name: string
  price: number
}

export interface MenuVariant {
  id: string
  name: string
  price: number
}

export interface MenuItem {
  id: string
  name: string
  description: string
  categoryId: string
  price: number
  variants: MenuVariant[]
  modifiers: MenuModifier[]
  imageUrl?: string
  isAvailable: boolean
  sku: string
}

// ─── Mock Data (used by dev-mode auth) ──────────────────────────────────────

export const mockBusinesses: Business[] = [
  {
    id: 'biz-001',
    name: 'Warung Nusantara',
    address: 'Jl. Merdeka No. 45, Jakarta Selatan',
    phone: '+6281234567890',
    type: 'restaurant',
    createdAt: '2024-01-15T08:00:00Z',
  },
  {
    id: 'biz-002',
    name: 'Kopi Kenangan Senja',
    address: 'Jl. Sudirman No. 12, Jakarta Pusat',
    phone: '+6281298765432',
    type: 'cafe',
    createdAt: '2024-06-01T10:00:00Z',
  },
]

export const mockUser: User = {
  id: 'usr-001',
  name: 'Budi Santoso',
  phone: '+6281234567890',
  email: 'budi@warung-nusantara.id',
  role: 'owner',
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

export function formatRupiah(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}
