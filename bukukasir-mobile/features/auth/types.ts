export type UserRole = 'owner' | 'cashier' | 'waiter' | 'kitchen';

export interface AuthUser {
  id: string;
  name: string;
  phone: string;
  role: UserRole;
  businessId: string;
  businessName: string;
}

export interface AuthBusiness {
  id: string;
  name: string;
  type?: string;
}

export interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  role: UserRole | null;
  pin: string | null;
  phone: string | null;
  isOtpSent: boolean;
  isOtpVerified: boolean;
  isPinSetup: boolean;
  /** Businesses the current phone has access to — used for the business-picker screen */
  availableBusinesses: AuthBusiness[];
  /** True when login found >1 business and caller must route to picker */
  needsBusinessSelection: boolean;
}

export interface AuthActions {
  setPhone: (phone: string) => void;
  sendOtp: (phone: string) => Promise<boolean>;
  verifyOtp: (code: string) => Promise<boolean>;
  loginWithPhone: (phone: string) => Promise<boolean>;
  selectBusiness: (businessId: string) => Promise<boolean>;
  /** Drop auth context and re-open the business picker (refreshes list) */
  switchBusiness: () => Promise<void>;
  setupPin: (pin: string) => void;
  verifyPin: (pin: string) => boolean;
  selectRole: (role: UserRole) => void;
  devLoginAs: (role: Exclude<UserRole, 'owner'>, businessId?: string) => void;
  logout: () => void;
}
