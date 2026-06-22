import * as React from 'react'

// ─── Types ───────────────────────────────────────────────────────────────────

export type OnboardingStepId = 'business' | 'menu' | 'payments' | 'staff' | 'review'

export const ONBOARDING_STEP_ORDER: OnboardingStepId[] = [
  'business',
  'menu',
  'payments',
  'staff',
  'review',
]

export function stepIndex(id: OnboardingStepId): number {
  return ONBOARDING_STEP_ORDER.indexOf(id)
}

export type BusinessType = 'restaurant' | 'cafe' | 'retail'
export type PaymentMethodType = 'CASH' | 'CARD' | 'EWALLET' | 'QRIS'
export type OnboardingStaffRole = 'MANAGER' | 'CASHIER' | 'WAITER' | 'KITCHEN'

export interface OnboardingBusinessInfo {
  name: string
  type: BusinessType | ''
  address?: string
  phone?: string
  email?: string
  logoUrl?: string
  ownerName: string
  ownerPhone?: string
}

export interface DraftCategory {
  tempKey: string
  name: string
  description?: string
  sortOrder: number
}

export interface DraftMenuItem {
  tempKey: string
  name: string
  price: number
  categoryTempKey: string
  description?: string
  imageUrl?: string
}

export interface DraftPaymentMethod {
  tempKey: string
  name: string
  type: PaymentMethodType
  active: boolean
}

export interface DraftStaffMember {
  tempKey: string
  name: string
  role: OnboardingStaffRole
  phone?: string
  email?: string
  pin?: string
}

export interface OnboardingDraft {
  businessId?: string
  ownerStaffId?: string
  createdCategoryIds?: Record<string, string>
  createdMenuItemIds?: string[]
  createdPaymentMethodIds?: string[]
  createdStaffIds?: string[]

  business: OnboardingBusinessInfo
  menu: {
    categories: DraftCategory[]
    items: DraftMenuItem[]
    skipped: boolean
  }
  payments: {
    methods: DraftPaymentMethod[]
    skipped: boolean
  }
  staff: {
    members: DraftStaffMember[]
    skipped: boolean
  }

  lastStep: OnboardingStepId
  startedAt: string
  updatedAt: string
}

interface OnboardingContextValue {
  draft: OnboardingDraft
  patch: <K extends keyof OnboardingDraft>(key: K, value: OnboardingDraft[K]) => void
  patchBusiness: (partial: Partial<OnboardingBusinessInfo>) => void
  setStep: (id: OnboardingStepId) => void
  reset: () => void
  hasDraft: boolean
}

// ─── Persistence ─────────────────────────────────────────────────────────────

const STORAGE_KEY = 'bukukasir_onboarding_draft_v1'

function emptyDraft(): OnboardingDraft {
  const now = new Date().toISOString()
  return {
    business: {
      name: '',
      type: '',
      address: '',
      phone: '',
      email: '',
      logoUrl: '',
      ownerName: '',
      ownerPhone: '',
    },
    menu: { categories: [], items: [], skipped: false },
    payments: {
      methods: [
        { tempKey: 'cash', name: 'Cash', type: 'CASH', active: true },
      ],
      skipped: false,
    },
    staff: { members: [], skipped: false },
    lastStep: 'business',
    startedAt: now,
    updatedAt: now,
  }
}

function loadDraft(): OnboardingDraft {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return emptyDraft()
    const parsed = JSON.parse(raw) as Partial<OnboardingDraft>
    // Merge with empty to tolerate shape changes
    const base = emptyDraft()
    return {
      ...base,
      ...parsed,
      business: { ...base.business, ...(parsed.business ?? {}) },
      menu: { ...base.menu, ...(parsed.menu ?? {}) },
      payments: { ...base.payments, ...(parsed.payments ?? {}) },
      staff: { ...base.staff, ...(parsed.staff ?? {}) },
    }
  } catch {
    return emptyDraft()
  }
}

function persistDraft(draft: OnboardingDraft) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(draft))
  } catch {
    /* quota exceeded — silent */
  }
}

/**
 * Non-hook helper for reading the draft outside the provider (e.g. resume banner).
 * Returns null when no draft exists.
 */
export function readOnboardingDraft(): OnboardingDraft | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    return JSON.parse(raw) as OnboardingDraft
  } catch {
    return null
  }
}

export function clearOnboardingDraft() {
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch {
    /* ignore */
  }
}

// ─── Context ─────────────────────────────────────────────────────────────────

const OnboardingContext = React.createContext<OnboardingContextValue | null>(null)

export function useOnboarding(): OnboardingContextValue {
  const ctx = React.useContext(OnboardingContext)
  if (!ctx) {
    throw new Error('useOnboarding must be used within an OnboardingProvider')
  }
  return ctx
}

export function OnboardingProvider({ children }: { children: React.ReactNode }) {
  const [draft, setDraft] = React.useState<OnboardingDraft>(loadDraft)

  React.useEffect(() => {
    persistDraft(draft)
  }, [draft])

  const patch = React.useCallback(
    <K extends keyof OnboardingDraft>(key: K, value: OnboardingDraft[K]) => {
      setDraft((prev) => ({ ...prev, [key]: value, updatedAt: new Date().toISOString() }))
    },
    []
  )

  const patchBusiness = React.useCallback((partial: Partial<OnboardingBusinessInfo>) => {
    setDraft((prev) => ({
      ...prev,
      business: { ...prev.business, ...partial },
      updatedAt: new Date().toISOString(),
    }))
  }, [])

  const setStep = React.useCallback((id: OnboardingStepId) => {
    setDraft((prev) => ({ ...prev, lastStep: id, updatedAt: new Date().toISOString() }))
  }, [])

  const reset = React.useCallback(() => {
    clearOnboardingDraft()
    setDraft(emptyDraft())
  }, [])

  const value = React.useMemo<OnboardingContextValue>(
    () => ({
      draft,
      patch,
      patchBusiness,
      setStep,
      reset,
      hasDraft: Boolean(draft.businessId) || draft.business.name.length > 0,
    }),
    [draft, patch, patchBusiness, setStep, reset]
  )

  return <OnboardingContext.Provider value={value}>{children}</OnboardingContext.Provider>
}
