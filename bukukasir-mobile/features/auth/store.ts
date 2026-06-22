import { create } from 'zustand';
import type { AuthState, AuthActions, UserRole } from './types';
import { mockStaff, mockBusinesses } from '../../shared/lib/mock-data';
import { api } from '../../shared/lib/api';
import { clearQueryCache } from '../../shared/lib/queryClient';

const DEV_MODE = true;
const MOCK_PIN = '123456';

// Dev mode: any 6-digit OTP works, any +62 phone number works
const isValidDevOtp = (code: string) => /^\d{6}$/.test(code);
const isValidDevPhone = (phone: string) => phone.startsWith('+62') && phone.length >= 10;

interface AuthStore extends AuthState, AuthActions {}

export const useAuthStore = create<AuthStore>((set, get) => ({
  // State
  user: null,
  isAuthenticated: false,
  role: null,
  pin: null,
  phone: null,
  isOtpSent: false,
  isOtpVerified: false,
  isPinSetup: false,
  availableBusinesses: [],
  needsBusinessSelection: false,

  // Actions
  setPhone: (phone: string) => {
    set({ phone });
  },

  sendOtp: async (phone: string) => {
    if (DEV_MODE && !isValidDevPhone(phone)) {
      return false;
    }
    // Dev mode: no real SMS sent, any +62 number accepted
    set({ phone, isOtpSent: true });
    return true;
  },

  loginWithPhone: async (phone: string) => {
    const cleaned = phone.replace(/\D/g, '').replace(/^62/, '')
    if (cleaned.length !== 10) return false
    const fullPhone = `+62${cleaned}`

    // Fetch all businesses (may be filtered by phone in the future).
    let businesses: any[] = []
    try {
      businesses = (await api.getBusinesses()) ?? []
    } catch (e) {
      console.log('API unavailable, falling back to mock data:', e)
    }
    if (!businesses || businesses.length === 0) {
      businesses = [...mockBusinesses]
    }

    // Remember phone + the list so the picker screen can render.
    set({
      phone: fullPhone,
      isOtpSent: true,
      isOtpVerified: true,
      availableBusinesses: businesses.map((b: any) => ({
        id: b.id,
        name: b.name,
        type: b.type,
      })),
      needsBusinessSelection: businesses.length > 1,
    })

    // If only one business, auto-select immediately.
    if (businesses.length === 1) {
      return await get().selectBusiness(businesses[0].id)
    }

    // Multiple businesses — caller should navigate to /(auth)/select-business.
    return true
  },

  selectBusiness: async (businessId: string) => {
    // Start tenant cache clearing immediately, but don't block the login tap on
    // AsyncStorage in web/iOS test shells. The selected business context is set
    // synchronously below so navigation cannot stall on storage latency.
    void clearQueryCache()
    const { phone, availableBusinesses } = get()
    const business =
      availableBusinesses.find((b) => b.id === businessId) ??
      mockBusinesses.find((b) => b.id === businessId) ??
      null
    if (!business) return false

    const fallbackStaff =
      mockStaff.find((s) => s.phone === phone && s.businessId === business.id) ||
      mockStaff.find((s) => s.businessId === business.id) ||
      mockStaff[0]

    const resolvedRole = (fallbackStaff.role || 'cashier').toLowerCase() as UserRole
    set({
      isPinSetup: true,
      needsBusinessSelection: false,
      user: {
        id: fallbackStaff.id,
        name: fallbackStaff.name,
        phone: fallbackStaff.phone || phone || '',
        role: resolvedRole,
        businessId: business.id,
        businessName: business.name,
      },
      role: resolvedRole,
      pin: fallbackStaff.pin || MOCK_PIN,
    })

    void api.getStaff(business.id)
      .then((staffList) => {
        const staff = staffList?.find((s: any) => s.phone === phone) || staffList?.[0]
        const current = get().user
        if (!staff || current?.businessId !== business.id) return
        set({
          user: {
            id: staff.id,
            name: staff.name,
            phone: staff.phone || phone || '',
            role: current.role,
            businessId: business.id,
            businessName: business.name,
          },
          pin: staff.pin || MOCK_PIN,
        })
      })
      .catch((e) => {
        console.log('API unavailable for staff; using local staff fallback:', e)
      })
    return true
  },

  verifyOtp: async (code: string) => {
    if (DEV_MODE ? isValidDevOtp(code) : code === '123456') {
      const { phone } = get();

      // Try to fetch real data from API first
      let staff: any = null;
      let business: any = null;

      try {
        const [businesses, staffList] = await Promise.all([
          api.getBusinesses(),
          // We'll try the first business for staff; if businesses is empty we fall back
          api.getBusinesses().then(async (biz) => {
            if (biz && biz.length > 0) {
              return api.getStaff(biz[0].id);
            }
            return [];
          }),
        ]);

        if (businesses && businesses.length > 0) {
          business = businesses[0];
          // Find staff matching phone, or use first staff
          if (staffList && staffList.length > 0) {
            staff = staffList.find((s: any) => s.phone === phone) || staffList[0];
          }
        }
      } catch (e) {
        console.log('API unavailable, falling back to mock data:', e);
      }

      // Fallback to mock data if API didn't return results
      if (!staff) {
        staff = mockStaff.find((s) => s.phone === phone) || mockStaff[0];
      }
      if (!business) {
        business = staff.businessId
          ? mockBusinesses.find((b) => b.id === staff.businessId) || mockBusinesses[0]
          : mockBusinesses[0];
      }

      set({
        isOtpVerified: true,
        user: {
          id: staff.id,
          name: staff.name,
          phone: staff.phone,
          role: (staff.role || 'cashier').toLowerCase() as UserRole,
          businessId: business.id,
          businessName: business.name,
        },
        role: (staff.role || 'cashier').toLowerCase() as UserRole,
        pin: staff.pin || MOCK_PIN,
        isPinSetup: true,
      });

      return true;
    }
    return false;
  },

  setupPin: (pin: string) => {
    set({ pin, isPinSetup: true, isAuthenticated: true });
  },

  verifyPin: (pin: string) => {
    // DEV_MODE: any 6-digit PIN is accepted so the team can test flows freely.
    if (DEV_MODE && /^\d{6}$/.test(pin)) {
      set({ isAuthenticated: true });
      return true;
    }
    const state = get();
    if (pin === state.pin || pin === MOCK_PIN) {
      set({ isAuthenticated: true });
      return true;
    }
    return false;
  },

  selectRole: (role: UserRole) => {
    const { user } = get();
    if (user) {
      set({
        role,
        user: { ...user, role },
      });
    }
  },

  devLoginAs: (role, businessId = 'biz-001') => {
    const business =
      mockBusinesses.find((b) => b.id === businessId) || mockBusinesses[0]
    const staff =
      mockStaff.find((s) => s.businessId === business.id && s.role === role) ||
      mockStaff.find((s) => s.role === role) ||
      mockStaff[0]
    set({
      phone: staff.phone,
      isOtpSent: true,
      isOtpVerified: true,
      isPinSetup: true,
      isAuthenticated: true,
      needsBusinessSelection: false,
      availableBusinesses: [],
      role,
      pin: staff.pin || MOCK_PIN,
      user: {
        id: staff.id,
        name: staff.name,
        phone: staff.phone,
        role,
        businessId: business.id,
        businessName: business.name,
      },
    })
  },

  switchBusiness: async () => {
    const { phone, user, isOtpSent, isOtpVerified } = get();
    const verifiedPhone = phone || user?.phone || null;
    await clearQueryCache();
    // Re-fetch the business list so newly-created businesses show up.
    let businesses: any[] = [];
    try {
      businesses = (await api.getBusinesses()) ?? [];
    } catch {
      businesses = [...mockBusinesses];
    }
    if (!businesses || businesses.length === 0) {
      businesses = [...mockBusinesses];
    }
    set({
      isAuthenticated: false,
      isPinSetup: false,
      phone: verifiedPhone,
      isOtpSent: isOtpSent || Boolean(verifiedPhone),
      isOtpVerified: isOtpVerified || Boolean(verifiedPhone),
      role: null,
      user: null,
      availableBusinesses: businesses.map((b: any) => ({
        id: b.id,
        name: b.name,
        type: b.type,
      })),
      needsBusinessSelection: true,
    });
  },

  logout: () => {
    // Clear cached data so the next user doesn't see previous tenant's responses.
    void clearQueryCache();
    set({
      user: null,
      isAuthenticated: false,
      role: null,
      pin: null,
      phone: null,
      isOtpSent: false,
      isOtpVerified: false,
      isPinSetup: false,
      availableBusinesses: [],
      needsBusinessSelection: false,
    });
  },
}));
