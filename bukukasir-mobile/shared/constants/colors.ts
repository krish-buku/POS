import { palette } from '../theme/colors';

export const Colors = {
  primary: palette.brand.navy,
  primaryDark: palette.brand.navyDark,
  primaryLight: '#EBF0F7',
  secondary: '#2B5EA7',
  secondaryDark: palette.brand.navy,
  secondaryLight: '#EBF0F7',
  accent: palette.brand.gold,
  accentDark: palette.brand.goldDark,
  accentLight: '#FDF6E3',
  background: '#FFFFFF',
  surface: palette.neutral[50],
  surfaceHover: '#EBF0F7',
  text: '#1A2332',
  textSecondary: '#4A5568',
  textMuted: '#8896A6',
  textOnPrimary: '#ffffff',
  textOnAccent: '#ffffff',
  border: palette.neutral[200],
  borderLight: '#EBF0F7',
  success: palette.semantic.success,
  successLight: palette.semantic.successBg,
  warning: palette.semantic.warning,
  warningLight: palette.semantic.warningBg,
  error: palette.semantic.error,
  errorLight: palette.semantic.errorBg,
  info: palette.semantic.info,
  infoLight: palette.semantic.infoBg,
  table: palette.status.table,
  kitchen: palette.status.kitchen,
  order: palette.status.order,
  cashierHeader: palette.roles.cashier,
  waiterHeader: palette.roles.waiter,
  kitchenHeader: palette.roles.kitchen,
} as const;

export type TableStatus = 'available' | 'occupied' | 'reserved' | 'cleaning';
export type OrderStatus = 'new' | 'preparing' | 'ready' | 'served' | 'paid' | 'cancelled';
export type KitchenTicketStatus = 'new' | 'preparing' | 'ready';
