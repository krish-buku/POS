import { useAuthStore } from '../../features/auth/store';

export function useAuth() {
  const store = useAuthStore();

  return {
    user: store.user,
    isAuthenticated: store.isAuthenticated,
    role: store.role,
    phone: store.phone,
    isOtpSent: store.isOtpSent,
    isOtpVerified: store.isOtpVerified,
    isPinSetup: store.isPinSetup,
    setPhone: store.setPhone,
    sendOtp: store.sendOtp,
    verifyOtp: store.verifyOtp,
    setupPin: store.setupPin,
    verifyPin: store.verifyPin,
    selectRole: store.selectRole,
    logout: store.logout,
    isCashier: store.role === 'cashier' || store.role === 'owner',
    isWaiter: store.role === 'waiter',
    isKitchen: store.role === 'kitchen',
    isOwner: store.role === 'owner',
  };
}
