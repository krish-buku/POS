import * as React from 'react'
import {
  type Business,
  type User,
  type StaffRole,
  mockUser,
  mockBusinesses,
} from './mock-data'

// ─── Types ───────────────────────────────────────────────────────────────────

export type BusinessScope = 'single' | 'all'

interface AuthState {
  user: User | null
  currentBusiness: Business | null
  scope: BusinessScope
  isAuthenticated: boolean
  role: StaffRole | null
  phone: string | null
  otpSent: boolean
}

interface AuthContextValue extends AuthState {
  login: (phone: string) => Promise<void>
  verifyOtp: (code: string) => Promise<boolean>
  selectBusiness: (id: string, business?: Business) => void
  selectAllBusinesses: () => void
  logout: () => void
}

/** Returns the active business id for data queries, or `null` when scope is 'all'. */
export function useActiveBusinessId(): string | null {
  const { scope, currentBusiness } = useAuth()
  return scope === 'all' ? null : currentBusiness?.id ?? null
}

const STORAGE_KEY = 'bukukasir_auth'
const DEV_MODE = true

// Dev mode: any 6-digit OTP works, any +62 phone number works
const isValidDevOtp = (code: string) => /^\d{6}$/.test(code)
const isValidDevPhone = (phone: string) => phone.startsWith('+62') && phone.length >= 10

// ─── Context ─────────────────────────────────────────────────────────────────

const AuthContext = React.createContext<AuthContextValue | null>(null)

export function useAuth(): AuthContextValue {
  const context = React.useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

// ─── Persistence ─────────────────────────────────────────────────────────────

interface PersistedAuth {
  userId: string
  businessId: string | null
  business?: Business | null
  scope?: BusinessScope
  phone: string
}

function loadPersistedAuth(): AuthState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return defaultState()
    const parsed: PersistedAuth = JSON.parse(raw)
    const user = parsed.userId === mockUser.id ? { ...mockUser } : null
    const business = parsed.business
      ?? (parsed.businessId ? mockBusinesses.find((b) => b.id === parsed.businessId) ?? null : null)
    if (!user) return defaultState()
    return {
      user,
      currentBusiness: business,
      scope: parsed.scope ?? 'single',
      isAuthenticated: true,
      role: user.role,
      phone: parsed.phone,
      otpSent: false,
    }
  } catch {
    return defaultState()
  }
}

function persistAuth(state: AuthState) {
  if (state.isAuthenticated && state.user) {
    const data: PersistedAuth = {
      userId: state.user.id,
      businessId: state.currentBusiness?.id ?? null,
      business: state.currentBusiness,
      scope: state.scope,
      phone: state.phone ?? '',
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  } else {
    localStorage.removeItem(STORAGE_KEY)
  }
}

function defaultState(): AuthState {
  return {
    user: null,
    currentBusiness: null,
    scope: 'single',
    isAuthenticated: false,
    role: null,
    phone: null,
    otpSent: false,
  }
}

// ─── Provider ────────────────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = React.useState<AuthState>(loadPersistedAuth)

  // Persist whenever auth state changes
  React.useEffect(() => {
    persistAuth(state)
  }, [state])

  const login = React.useCallback(async (phone: string) => {
    if (DEV_MODE && !isValidDevPhone(phone)) {
      throw new Error('Dev mode: phone must start with +62 and be at least 10 chars')
    }
    // Dev mode: no real SMS sent, any +62 number accepted
    await new Promise((resolve) => setTimeout(resolve, 800))
    setState((prev) => ({ ...prev, phone, otpSent: true }))
  }, [])

  const verifyOtp = React.useCallback(
    async (code: string): Promise<boolean> => {
      await new Promise((resolve) => setTimeout(resolve, 600))
      if (DEV_MODE ? isValidDevOtp(code) : code === '123456') {
        setState((prev) => ({
          ...prev,
          user: { ...mockUser },
          isAuthenticated: true,
          role: mockUser.role,
          otpSent: false,
        }))
        return true
      }
      return false
    },
    []
  )

  const selectBusiness = React.useCallback((id: string, business?: Business) => {
    const resolved = business ?? mockBusinesses.find((b) => b.id === id) ?? null
    setState((prev) => ({ ...prev, currentBusiness: resolved, scope: 'single' }))
  }, [])

  const selectAllBusinesses = React.useCallback(() => {
    setState((prev) => ({ ...prev, scope: 'all' }))
  }, [])

  const logout = React.useCallback(() => {
    localStorage.removeItem(STORAGE_KEY)
    setState(defaultState())
  }, [])

  const value = React.useMemo<AuthContextValue>(
    () => ({
      ...state,
      login,
      verifyOtp,
      selectBusiness,
      selectAllBusinesses,
      logout,
    }),
    [state, login, verifyOtp, selectBusiness, selectAllBusinesses, logout]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
