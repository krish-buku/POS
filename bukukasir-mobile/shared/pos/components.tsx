import React from 'react';
import {
  Image,
  Modal,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
  useWindowDimensions,
  type TextStyle,
  type ViewStyle,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import {
  Bell,
  Check,
  ChevronLeft,
  CircleDollarSign,
  Cloud,
  CreditCard,
  History,
  Languages,
  LayoutGrid,
  Menu as MenuIcon,
  ReceiptText,
  Search,
  Settings,
  ShoppingBag,
  UserRound,
  Wifi,
  X,
} from 'lucide-react-native';
import { useTheme } from '../theme';
import { useLocaleStore, useT } from '../i18n/store';
import { formatRupiah } from '../lib/format';
import { useAuthStore } from '../../features/auth/store';
import { useOrderStore } from '../../features/order/store';
import { useTableStore } from '../../features/table/store';
import type { OrderCustomer, OrderLineItem, PrintJob, SyncQueueItem } from '../../features/order/types';

type Role = 'cashier' | 'waiter' | 'kitchen';

export function usePOSLayout() {
  const { width, height } = useWindowDimensions();
  const isPhone = width < 760;
  const isPortrait = height > width;
  const isCompact = width < 980;
  return { width, height, isPhone, isPortrait, isCompact };
}

export function POSScreen({
  role = 'cashier',
  title,
  subtitle,
  active = 'order',
  staffName,
  onBack,
  onNavigate,
  children,
}: {
  role?: Role;
  title: string;
  subtitle?: string;
  active?: 'order' | 'tables' | 'history' | 'settings' | 'queue' | 'waiter';
  staffName?: string;
  onBack?: () => void;
  onNavigate?: (target: 'order' | 'tables' | 'history' | 'settings' | 'queue' | 'waiter') => void;
  children: React.ReactNode;
}) {
  const theme = useTheme();
  const t = useT();
  const router = useRouter();
  const switchBusiness = useAuthStore((state) => state.switchBusiness);
  const logout = useAuthStore((state) => state.logout);
  const hasDraft = useOrderStore(
    (state) =>
      state.items.length > 0 ||
      state.syncQueueCount > 0 ||
      state.failedSyncCount > 0 ||
      !!state.recoveryDraftSavedAt,
  );
  const [staffSheetOpen, setStaffSheetOpen] = React.useState(false);
  const [confirmLogout, setConfirmLogout] = React.useState(false);
  const locale = useLocaleStore((state) => state.locale);
  const toggleLocale = useLocaleStore((state) => state.toggle);
  const { isPhone } = usePOSLayout();
  const roleColor = theme.palette.roles[role];
  const nav =
    role === 'cashier'
      ? [
          { key: 'order' as const, label: t('pos.nav.order'), icon: ShoppingBag },
          { key: 'tables' as const, label: t('pos.nav.openTables'), icon: LayoutGrid },
          { key: 'history' as const, label: t('pos.nav.history'), icon: History },
          { key: 'settings' as const, label: t('pos.nav.settings'), icon: Settings },
        ]
      : role === 'waiter'
        ? [
            { key: 'waiter' as const, label: t('pos.nav.myTables'), icon: LayoutGrid },
            { key: 'order' as const, label: t('pos.nav.order'), icon: MenuIcon },
            { key: 'tables' as const, label: t('pos.nav.transfer'), icon: Bell },
          ]
        : [
            { key: 'queue' as const, label: t('pos.nav.kds'), icon: ReceiptText },
            { key: 'settings' as const, label: t('pos.nav.printer'), icon: Settings },
          ];
  const roleLabel = role === 'cashier' ? t('pos.role.cashier') : role === 'waiter' ? t('pos.role.waiter') : t('pos.role.kitchen');
  const nextLocaleLabel = locale === 'id' ? t('language.short.en') : t('language.short.id');
  const closeStaffSheet = () => {
    setConfirmLogout(false);
    setStaffSheetOpen(false);
  };
  const clearTenantState = () => {
    useOrderStore.getState().clearOrder();
    useTableStore.getState().clearSelection();
  };
  const handleLock = () => {
    closeStaffSheet();
    useAuthStore.setState({ isAuthenticated: false });
    router.replace({ pathname: '/(auth)/pin-setup', params: { mode: 'unlock' } } as any);
  };
  const handleChangePin = () => {
    closeStaffSheet();
    router.replace({ pathname: '/(auth)/pin-setup', params: { mode: 'change-pin' } } as any);
  };
  const handleSwitchRole = () => {
    closeStaffSheet();
    router.replace({ pathname: '/(auth)/pin-setup', params: { mode: 'switch-role' } } as any);
  };
  const handleSwitchBusiness = async () => {
    clearTenantState();
    closeStaffSheet();
    await switchBusiness();
    router.replace('/(auth)/select-business');
  };
  const handleLogout = () => {
    if (!confirmLogout) {
      setConfirmLogout(true);
      return;
    }
    clearTenantState();
    closeStaffSheet();
    logout();
    router.replace('/(auth)/login');
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.palette.neutral[50] }} edges={['top', 'left', 'right']}>
      <View
        style={{
          minHeight: isPhone ? 72 : 64,
          paddingHorizontal: isPhone ? 12 : 18,
          paddingVertical: 10,
          backgroundColor: theme.palette.neutral[0],
          borderBottomWidth: 1,
          borderBottomColor: theme.palette.neutral[200],
          flexDirection: 'row',
          alignItems: 'center',
          gap: 12,
          flexWrap: isPhone ? 'wrap' : 'nowrap',
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, minWidth: isPhone ? 210 : 240 }}>
          {onBack ? (
            <IconButton label="Back" onPress={onBack} icon={<ChevronLeft size={19} color={theme.palette.neutral[800]} />} />
          ) : null}
          <View
            style={{
              width: 34,
              height: 34,
              borderRadius: 9,
              borderWidth: 1,
              borderColor: theme.palette.neutral[200],
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden',
              backgroundColor: '#FFFFFF',
            }}
          >
            <Image source={require('../../assets/bukuwarung-logo.png')} style={{ width: 40, height: 32 }} resizeMode="contain" />
          </View>
          <View style={{ minWidth: 0 }}>
            <Text style={{ fontSize: 14, fontWeight: '900', color: theme.palette.neutral[900] }}>BukuKasir</Text>
            <Text
              numberOfLines={1}
              style={{
                marginTop: 1,
                maxWidth: isPhone ? 150 : 190,
                fontSize: 10,
                color: theme.palette.neutral[500],
                fontWeight: '800',
                textTransform: 'uppercase',
              }}
            >
              {subtitle || t('pos.frontline')}
            </Text>
          </View>
        </View>

        <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
          <View style={{ paddingHorizontal: 10, height: 28, borderRadius: 999, backgroundColor: roleColor, alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ color: '#FFFFFF', fontSize: 10, fontWeight: '900', textTransform: 'uppercase' }}>{roleLabel}</Text>
          </View>
          <StatusDot label={t('header.live')} tone={theme.palette.semantic.success} />
        </View>

        <View style={{ flex: 1, alignItems: isPhone ? 'flex-start' : 'center', minWidth: isPhone ? '100%' : 180 }}>
          <Text numberOfLines={1} style={{ fontSize: 15, color: theme.palette.neutral[900], fontWeight: '900' }}>
            {title}
          </Text>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 6, alignItems: 'center' }}>
          {nav.map(({ key, label, icon: Icon }) => {
            const selected = active === key;
            return (
              <Pressable
                key={key}
                onPress={() => onNavigate?.(key)}
                accessibilityRole="button"
                style={({ pressed }) => ({
                  height: 36,
                  paddingHorizontal: 10,
                  borderRadius: 9,
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 6,
                  backgroundColor: selected ? theme.palette.neutral[900] : pressed ? theme.palette.neutral[100] : theme.palette.neutral[0],
                  borderWidth: 1,
                  borderColor: selected ? theme.palette.neutral[900] : theme.palette.neutral[200],
                })}
              >
                <Icon size={15} color={selected ? '#FFFFFF' : theme.palette.neutral[700]} strokeWidth={2.4} />
                <Text style={{ color: selected ? '#FFFFFF' : theme.palette.neutral[700], fontSize: 12, fontWeight: '800' }}>
                  {label}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        <Pressable
          onPress={toggleLocale}
          accessibilityRole="button"
          accessibilityLabel={locale === 'id' ? t('language.switchToEnglish') : t('language.switchToIndonesian')}
          testID="pos-language-toggle"
          style={({ pressed }) => ({
            height: 34,
            paddingHorizontal: 10,
            borderRadius: 9,
            borderWidth: 1,
            borderColor: theme.palette.neutral[200],
            backgroundColor: pressed ? theme.palette.neutral[100] : theme.palette.neutral[0],
            flexDirection: 'row',
            alignItems: 'center',
            gap: 6,
          })}
        >
          <Languages size={15} color={theme.palette.neutral[700]} />
          <Text style={{ color: theme.palette.neutral[800], fontSize: 12, fontWeight: '900' }}>{nextLocaleLabel}</Text>
        </Pressable>

        {staffName ? <StaffChip name={staffName} onPress={() => { setConfirmLogout(false); setStaffSheetOpen(true); }} /> : null}
      </View>
      {children}
      <OverlaySheet visible={staffSheetOpen} title={t('profile.title')} onClose={closeStaffSheet}>
        <Panel padding={12} style={{ gap: 8 }}>
          <UserRound size={24} color={roleColor} />
          <Text style={{ color: theme.palette.neutral[900], fontSize: 17, fontWeight: '900' }}>{staffName}</Text>
          <Text style={{ color: theme.palette.neutral[600], fontSize: 13, fontWeight: '800' }}>{roleLabel} · {subtitle || t('pos.frontline')}</Text>
          <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap', marginTop: 4 }}>
            <StatusMiniChip label={t('sync.online')} tone="success" />
            <StatusMiniChip label={t('profile.autoLock')} tone="success" />
            {hasDraft ? <StatusMiniChip label={t('profile.pendingLocal')} tone="warning" /> : null}
          </View>
        </Panel>
        {confirmLogout ? (
          <Panel
            padding={12}
            style={{
              gap: 4,
              borderColor: theme.palette.semantic.error,
              backgroundColor: theme.palette.semantic.errorBg,
            }}
          >
            <Text style={{ color: theme.palette.semantic.error, fontSize: 13, fontWeight: '900' }}>{t('profile.logoutConfirm')}</Text>
            <Text style={{ color: theme.palette.neutral[700], fontSize: 12, lineHeight: 18 }}>{t('profile.logoutWarning')}</Text>
          </Panel>
        ) : null}
        {role !== 'waiter' ? (
          <PrimaryButton
            tone="light"
            onPress={() => {
              closeStaffSheet();
              onNavigate?.('settings');
            }}
          >
            {t('pos.nav.settings')}
          </PrimaryButton>
        ) : null}
        <PrimaryButton tone="light" onPress={handleLock}>
          {t('profile.lockNow')}
        </PrimaryButton>
        <PrimaryButton tone="light" onPress={handleChangePin}>
          {t('profile.changePin')}
        </PrimaryButton>
        <PrimaryButton tone="light" onPress={handleSwitchRole}>
          {t('profile.switchRole')}
        </PrimaryButton>
        <PrimaryButton tone="light" onPress={() => { void handleSwitchBusiness(); }}>
          {t('profile.switchLocation')}
        </PrimaryButton>
        <PrimaryButton tone="light" onPress={toggleLocale}>
          {locale === 'id' ? t('language.switchToEnglish') : t('language.switchToIndonesian')}
        </PrimaryButton>
        <PrimaryButton tone={confirmLogout ? 'danger' : 'light'} onPress={handleLogout}>
          {confirmLogout ? t('profile.logoutAction') : t('common.logout')}
        </PrimaryButton>
      </OverlaySheet>
    </SafeAreaView>
  );
}

function StatusMiniChip({ label, tone }: { label: string; tone: 'success' | 'warning' }) {
  const theme = useTheme();
  const color = tone === 'warning' ? theme.palette.semantic.warning : theme.palette.semantic.success;
  const bg = tone === 'warning' ? theme.palette.semantic.warningBg : theme.palette.semantic.successBg;
  return (
    <View
      style={{
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 999,
        borderWidth: 1,
        borderColor: color,
        backgroundColor: bg,
      }}
    >
      <Text style={{ color, fontSize: 10, fontWeight: '900' }}>{label}</Text>
    </View>
  );
}

export function StaffChip({ name, onPress }: { name: string; onPress?: () => void }) {
  const theme = useTheme();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={name}
      testID="staff-chip"
      style={({ pressed }) => ({
        height: 34,
        paddingHorizontal: 10,
        borderRadius: 9,
        borderWidth: 1,
        borderColor: theme.palette.neutral[200],
        backgroundColor: pressed ? theme.palette.neutral[100] : theme.palette.neutral[0],
        flexDirection: 'row',
        alignItems: 'center',
        gap: 7,
      })}
    >
      <UserRound size={15} color={theme.palette.neutral[700]} />
      <Text numberOfLines={1} style={{ maxWidth: 120, color: theme.palette.neutral[800], fontSize: 12, fontWeight: '800' }}>{name}</Text>
    </Pressable>
  );
}

export function StatusDot({ label, tone }: { label: string; tone: string }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
      <View style={{ width: 7, height: 7, borderRadius: 4, backgroundColor: tone }} />
      <Text style={{ color: tone, fontSize: 11, fontWeight: '900' }}>{label}</Text>
    </View>
  );
}

export function Panel({
  children,
  style,
  padding = 14,
}: {
  children: React.ReactNode;
  style?: ViewStyle;
  padding?: number;
}) {
  const theme = useTheme();
  const t = useT();
  return (
    <View
      style={[
        {
          backgroundColor: theme.palette.neutral[0],
          borderWidth: 1,
          borderColor: theme.palette.neutral[200],
          borderRadius: 8,
          padding,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}

export function SectionHeader({
  eyebrow,
  title,
  action,
}: {
  eyebrow?: string;
  title: string;
  action?: React.ReactNode;
}) {
  const theme = useTheme();
  const t = useT();
  return (
    <View style={{ flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', gap: 12 }}>
      <View style={{ minWidth: 0, flex: 1 }}>
        {eyebrow ? (
          <Text style={{ color: theme.palette.neutral[500], fontSize: 10, fontWeight: '900', textTransform: 'uppercase' }}>
            {eyebrow}
          </Text>
        ) : null}
        <Text numberOfLines={1} style={{ marginTop: eyebrow ? 3 : 0, color: theme.palette.neutral[900], fontSize: 20, fontWeight: '900' }}>
          {title}
        </Text>
      </View>
      {action}
    </View>
  );
}

export function Stepper({
  steps,
  activeIndex,
  onStep,
}: {
  steps: string[];
  activeIndex: number;
  onStep?: (index: number) => void;
}) {
  const theme = useTheme();
  const t = useT();
  return (
    <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
      {steps.map((step, index) => {
        const active = index === activeIndex;
        const complete = index < activeIndex;
        return (
          <Pressable
            key={step}
            onPress={() => onStep?.(index)}
            testID={`stepper-step-${index}`}
            accessibilityRole="button"
            accessibilityLabel={`Step ${index + 1}: ${step}`}
            accessibilityState={{ selected: active }}
            style={({ pressed }) => ({
              height: 34,
              paddingHorizontal: 12,
              borderRadius: 999,
              flexDirection: 'row',
              alignItems: 'center',
              gap: 7,
              backgroundColor: active ? theme.palette.brand.navy : complete ? theme.palette.semantic.successBg : pressed ? theme.palette.neutral[100] : theme.palette.neutral[0],
              borderWidth: 1,
              borderColor: active ? theme.palette.brand.navy : complete ? theme.palette.semantic.success : theme.palette.neutral[200],
            })}
          >
            <View
              style={{
                width: 20,
                height: 20,
                borderRadius: 10,
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: active ? '#FFFFFF' : complete ? theme.palette.semantic.success : theme.palette.neutral[200],
              }}
            >
              {complete ? <Check size={12} color="#FFFFFF" strokeWidth={3} /> : <Text style={{ color: active ? theme.palette.brand.navy : theme.palette.neutral[700], fontSize: 11, fontWeight: '900' }}>{index + 1}</Text>}
            </View>
            <Text style={{ color: active ? '#FFFFFF' : theme.palette.neutral[800], fontSize: 12, fontWeight: '900' }}>{step}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export function SegmentTabs<T extends string>({
  items,
  value,
  onChange,
}: {
  items: { key: T; label: string; meta?: string }[];
  value: T;
  onChange: (value: T) => void;
}) {
  const theme = useTheme();
  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
      {items.map((item) => {
        const active = item.key === value;
        return (
          <Pressable
            key={item.key}
            onPress={() => onChange(item.key)}
            accessibilityRole="button"
            accessibilityLabel={item.meta ? `${item.label}. ${item.meta}` : item.label}
            accessibilityState={{ selected: active }}
            style={({ pressed }) => ({
              minHeight: 42,
              paddingHorizontal: 12,
              paddingVertical: 8,
              borderRadius: 8,
              backgroundColor: active ? theme.palette.neutral[900] : pressed ? theme.palette.neutral[100] : theme.palette.neutral[0],
              borderWidth: 1,
              borderColor: active ? theme.palette.neutral[900] : theme.palette.neutral[200],
            })}
          >
            <Text style={{ color: active ? '#FFFFFF' : theme.palette.neutral[900], fontSize: 13, fontWeight: '900' }}>{item.label}</Text>
            {item.meta ? (
              <Text style={{ marginTop: 2, color: active ? 'rgba(255,255,255,0.72)' : theme.palette.neutral[500], fontSize: 10, fontWeight: '700' }}>
                {item.meta}
              </Text>
            ) : null}
          </Pressable>
        );
      })}
    </View>
  );
}

export function IconButton({ label, onPress, icon }: { label: string; onPress?: () => void; icon: React.ReactNode }) {
  const theme = useTheme();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={({ pressed }) => ({
        width: 36,
        height: 36,
        borderRadius: 9,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: pressed ? theme.palette.neutral[100] : theme.palette.neutral[0],
        borderWidth: 1,
        borderColor: theme.palette.neutral[200],
      })}
    >
      {icon}
    </Pressable>
  );
}

export function PrimaryButton({
  children,
  onPress,
  disabled,
  tone = 'blue',
  style,
}: {
  children: React.ReactNode;
  onPress?: () => void;
  disabled?: boolean;
  tone?: 'blue' | 'dark' | 'green' | 'danger' | 'light';
  style?: ViewStyle;
}) {
  const theme = useTheme();
  const bg =
    tone === 'dark'
      ? theme.palette.neutral[900]
      : tone === 'green'
        ? theme.palette.semantic.success
        : tone === 'danger'
          ? theme.palette.semantic.error
          : tone === 'light'
            ? theme.palette.neutral[100]
            : theme.palette.brand.navy;
  const fg = tone === 'light' ? theme.palette.neutral[900] : '#FFFFFF';
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityState={{ disabled: !!disabled }}
      style={({ pressed }) => [
        {
          minHeight: 44,
          paddingHorizontal: 14,
          paddingVertical: 11,
          borderRadius: 8,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: bg,
          opacity: disabled ? 0.45 : pressed ? 0.86 : 1,
        },
        style,
      ]}
    >
      <Text style={{ color: fg, fontSize: 14, fontWeight: '900', textAlign: 'center' }}>{children}</Text>
    </Pressable>
  );
}

export function TextField({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType,
  multiline,
  style,
}: {
  label?: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder?: string;
  keyboardType?: 'default' | 'number-pad' | 'phone-pad';
  multiline?: boolean;
  style?: ViewStyle;
}) {
  const theme = useTheme();
  return (
    <View style={[{ gap: 6 }, style]}>
      {label ? <Text style={{ color: theme.palette.neutral[700], fontSize: 12, fontWeight: '900' }}>{label}</Text> : null}
      <TextInput
        accessibilityLabel={label}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={theme.palette.neutral[400]}
        keyboardType={keyboardType}
        multiline={multiline}
        style={{
          minHeight: multiline ? 86 : 42,
          borderRadius: 8,
          borderWidth: 1,
          borderColor: theme.palette.neutral[200],
          backgroundColor: theme.palette.neutral[0],
          color: theme.palette.neutral[900],
          paddingHorizontal: 12,
          paddingVertical: 10,
          fontSize: 14,
          fontWeight: '700',
          textAlignVertical: multiline ? 'top' : 'center',
        }}
      />
    </View>
  );
}

export function SearchField({
  value,
  onChangeText,
  placeholder,
}: {
  value: string;
  onChangeText: (value: string) => void;
  placeholder: string;
}) {
  const theme = useTheme();
  return (
    <View style={{ height: 42, borderRadius: 8, borderWidth: 1, borderColor: theme.palette.neutral[200], backgroundColor: '#FFFFFF', paddingHorizontal: 12, flexDirection: 'row', alignItems: 'center', gap: 8 }}>
      <Search size={16} color={theme.palette.neutral[500]} />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={theme.palette.neutral[400]}
        style={{ flex: 1, color: theme.palette.neutral[900], fontSize: 14, fontWeight: '700', padding: 0 }}
      />
    </View>
  );
}

export function CustomerChip({
  customer,
  onPress,
}: {
  customer: OrderCustomer | null;
  onPress?: () => void;
}) {
  const theme = useTheme();
  const t = useT();
  const chipStyle = {
    borderRadius: 8,
    padding: 10,
    backgroundColor: theme.palette.neutral[0],
    borderWidth: 1,
    borderColor: customer ? theme.palette.brand.navy : theme.palette.neutral[200],
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 10,
  };
  const content = (
    <>
      <View style={{ width: 34, height: 34, borderRadius: 17, backgroundColor: customer ? theme.palette.semantic.infoBg : theme.palette.neutral[100], alignItems: 'center', justifyContent: 'center' }}>
        <UserRound size={17} color={customer ? theme.palette.brand.navy : theme.palette.neutral[500]} />
      </View>
      <View style={{ flex: 1, minWidth: 0 }}>
        <Text numberOfLines={1} style={{ color: theme.palette.neutral[900], fontSize: 13, fontWeight: '900' }}>
          {customer ? customer.name : t('pos.customer.add')}
        </Text>
        <Text numberOfLines={1} style={{ marginTop: 2, color: theme.palette.neutral[500], fontSize: 11, fontWeight: '700' }}>
          {customer ? `${customer.phone || t('pos.customer.noPhone')}${customer.loyaltyTier ? ` · ${customer.loyaltyTier}` : ''}` : t('pos.customer.searchCreate')}
        </Text>
      </View>
    </>
  );
  if (!onPress) {
    return <View style={chipStyle}>{content}</View>;
  }
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={customer ? `${customer.name}. ${customer.phone || t('pos.customer.noPhone')}` : t('pos.customer.add')}
      style={({ pressed }) => [
        chipStyle,
        { backgroundColor: pressed ? theme.palette.neutral[100] : theme.palette.neutral[0] },
      ]}
    >
      {content}
    </Pressable>
  );
}

export function OrderSummary({
  items,
  subtotal,
  discount,
  fees,
  total,
  onQty,
  onRemove,
  onVoid,
}: {
  items: OrderLineItem[];
  subtotal: number;
  discount: number;
  fees: number;
  total: number;
  onQty?: (itemId: string, qty: number) => void;
  onRemove?: (itemId: string) => void;
  onVoid?: (itemId: string) => void;
}) {
  const theme = useTheme();
  const t = useT();
  const activeItems = items.filter((item) => !item.voided);
  return (
    <View style={{ gap: 10 }}>
      {activeItems.length === 0 ? (
        <View style={{ minHeight: 120, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderStyle: 'dashed', borderColor: theme.palette.neutral[300], borderRadius: 8 }}>
          <ShoppingBag size={24} color={theme.palette.neutral[400]} />
          <Text style={{ marginTop: 8, color: theme.palette.neutral[500], fontSize: 13, fontWeight: '800' }}>{t('pos.order.emptyItems')}</Text>
        </View>
      ) : (
        activeItems.map((item) => (
          <View key={item.id} style={{ paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: theme.palette.neutral[100], gap: 7 }}>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              <View style={{ flex: 1, minWidth: 0 }}>
                <Text numberOfLines={1} style={{ color: theme.palette.neutral[900], fontSize: 13, fontWeight: '900' }}>{item.menuItemName}</Text>
                <Text numberOfLines={1} style={{ marginTop: 2, color: theme.palette.neutral[500], fontSize: 11, fontWeight: '700' }}>
                  {item.modifiers.length > 0 ? item.modifiers.join(', ') : item.notes || 'Regular'}
                </Text>
              </View>
              <Text style={{ color: theme.palette.neutral[900], fontSize: 13, fontWeight: '900' }}>{formatRupiah(item.subtotal)}</Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <QtyStepper value={item.quantity} onChange={onQty ? (qty) => onQty(item.id, qty) : undefined} />
              <View style={{ flex: 1 }} />
              {onVoid ? <SmallLink label="Void" tone={theme.palette.semantic.error} onPress={() => onVoid(item.id)} /> : null}
              {onRemove ? <SmallLink label="Remove" onPress={() => onRemove(item.id)} /> : null}
            </View>
          </View>
        ))
      )}
      <Totals subtotal={subtotal} discount={discount} fees={fees} total={total} />
    </View>
  );
}

export function Totals({ subtotal, discount, fees, total }: { subtotal: number; discount: number; fees: number; total: number }) {
  const theme = useTheme();
  return (
    <View style={{ gap: 7, paddingTop: 8 }}>
      <TotalRow label="Subtotal" value={subtotal} />
      {discount > 0 ? <TotalRow label="Discount" value={-discount} tone={theme.palette.semantic.success} /> : null}
      {fees > 0 ? <TotalRow label="Fees" value={fees} /> : null}
      <View style={{ height: 1, backgroundColor: theme.palette.neutral[200], marginVertical: 3 }} />
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <Text style={{ color: theme.palette.neutral[900], fontSize: 14, fontWeight: '900' }}>Total</Text>
        <Text style={{ color: theme.palette.neutral[900], fontSize: 22, fontWeight: '900' }}>{formatRupiah(total)}</Text>
      </View>
    </View>
  );
}

function TotalRow({ label, value, tone }: { label: string; value: number; tone?: string }) {
  const theme = useTheme();
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
      <Text style={{ color: theme.palette.neutral[500], fontSize: 12, fontWeight: '800' }}>{label}</Text>
      <Text style={{ color: tone || theme.palette.neutral[800], fontSize: 12, fontWeight: '900' }}>{formatRupiah(value)}</Text>
    </View>
  );
}

export function QtyStepper({ value, onChange }: { value: number; onChange?: (value: number) => void }) {
  const theme = useTheme();
  if (!onChange) {
    return (
      <View
        accessibilityLabel={`Quantity ${value}`}
        style={{
          minWidth: 50,
          height: 28,
          borderRadius: 8,
          paddingHorizontal: 10,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: theme.palette.neutral[100],
          borderWidth: 1,
          borderColor: theme.palette.neutral[200],
        }}
      >
        <Text style={{ color: theme.palette.neutral[800], fontSize: 12, fontWeight: '900' }}>x{value}</Text>
      </View>
    );
  }
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', borderRadius: 8, borderWidth: 1, borderColor: theme.palette.neutral[200], overflow: 'hidden' }}>
      <Pressable accessibilityRole="button" accessibilityLabel="Decrease quantity" onPress={() => onChange(value - 1)} style={{ width: 30, height: 28, alignItems: 'center', justifyContent: 'center', backgroundColor: theme.palette.neutral[100] }}>
        <Text style={{ color: theme.palette.neutral[800], fontWeight: '900' }}>-</Text>
      </Pressable>
      <Text style={{ width: 34, textAlign: 'center', color: theme.palette.neutral[900], fontSize: 12, fontWeight: '900' }}>{value}</Text>
      <Pressable accessibilityRole="button" accessibilityLabel="Increase quantity" onPress={() => onChange(value + 1)} style={{ width: 30, height: 28, alignItems: 'center', justifyContent: 'center', backgroundColor: theme.palette.neutral[100] }}>
        <Text style={{ color: theme.palette.neutral[800], fontWeight: '900' }}>+</Text>
      </Pressable>
    </View>
  );
}

function SmallLink({ label, onPress, tone }: { label: string; onPress?: () => void; tone?: string }) {
  const theme = useTheme();
  return (
    <Pressable onPress={onPress} hitSlop={8} accessibilityRole={onPress ? 'button' : undefined} accessibilityLabel={label}>
      <Text style={{ color: tone || theme.palette.brand.navy, fontSize: 11, fontWeight: '900' }}>{label}</Text>
    </Pressable>
  );
}

export function Numpad({ onKey }: { onKey: (key: string) => void }) {
  const theme = useTheme();
  const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '00', '0', '<'];
  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
      {keys.map((key) => (
        <Pressable
          key={key}
          onPress={() => onKey(key)}
          accessibilityRole="button"
          accessibilityLabel={key === '<' ? 'Backspace' : key}
          style={({ pressed }) => ({
            width: '30.5%',
            minWidth: 62,
            height: 48,
            borderRadius: 8,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: pressed ? theme.palette.neutral[200] : theme.palette.neutral[100],
          })}
        >
          <Text style={{ color: theme.palette.neutral[900], fontSize: 19, fontWeight: '900' }}>{key}</Text>
        </Pressable>
      ))}
    </View>
  );
}

export function PaymentMethodCard({
  label,
  meta,
  selected,
  onPress,
  type,
}: {
  label: string;
  meta?: string;
  selected?: boolean;
  onPress?: () => void;
  type: 'cash' | 'qris' | 'edc' | 'ewallet';
}) {
  const theme = useTheme();
  const Icon = type === 'cash' ? CircleDollarSign : type === 'edc' ? CreditCard : ReceiptText;
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={meta ? `${label}. ${meta}` : label}
      accessibilityState={{ selected: !!selected }}
      style={({ pressed }) => ({
        padding: 12,
        borderRadius: 8,
        borderWidth: 1.5,
        borderColor: selected ? theme.palette.brand.navy : theme.palette.neutral[200],
        backgroundColor: selected ? theme.palette.semantic.infoBg : pressed ? theme.palette.neutral[100] : theme.palette.neutral[0],
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
      })}
    >
      <View style={{ width: 34, height: 34, borderRadius: 9, backgroundColor: selected ? theme.palette.brand.navy : theme.palette.neutral[100], alignItems: 'center', justifyContent: 'center' }}>
        <Icon size={18} color={selected ? '#FFFFFF' : theme.palette.neutral[700]} />
      </View>
      <View style={{ flex: 1, minWidth: 0 }}>
        <Text style={{ color: theme.palette.neutral[900], fontSize: 13, fontWeight: '900' }}>{label}</Text>
        {meta ? <Text style={{ marginTop: 2, color: theme.palette.neutral[500], fontSize: 10, fontWeight: '700' }}>{meta}</Text> : null}
      </View>
    </Pressable>
  );
}

export function OverlaySheet({
  visible,
  title,
  children,
  onClose,
  width = 440,
}: {
  visible: boolean;
  title: string;
  children: React.ReactNode;
  onClose: () => void;
  width?: number;
}) {
  const theme = useTheme();
  const t = useT();
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={{ flex: 1, backgroundColor: 'rgba(17,24,39,0.28)', alignItems: 'flex-end' }}>
        <View style={{ width: '100%', maxWidth: width, height: '100%', backgroundColor: '#FFFFFF', padding: 18 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 16 }}>
            <Text style={{ flex: 1, color: theme.palette.neutral[900], fontSize: 18, fontWeight: '900' }}>{title}</Text>
            <IconButton label="Close" onPress={onClose} icon={<X size={18} color={theme.palette.neutral[700]} />} />
          </View>
          <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ gap: 12, paddingBottom: 28 }}>
            {children}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

export function ResilienceBanner({
  syncQueue,
  recoveryLabel,
  printJobs,
  onRetry,
  onSyncPress,
  onPrinterPress,
}: {
  syncQueue: SyncQueueItem[];
  recoveryLabel?: string;
  printJobs?: PrintJob[];
  onRetry?: () => void;
  onSyncPress?: () => void;
  onPrinterPress?: () => void;
}) {
  const theme = useTheme();
  const failed = syncQueue.filter((item) => item.status === 'failed').length;
  const queued = syncQueue.filter((item) => item.status === 'queued').length;
  const failedPrints = printJobs?.filter((job) => job.status === 'failed').length ?? 0;
  return (
    <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
      <InfoPill icon={<Cloud size={14} color={theme.palette.brand.navy} />} label={queued > 0 ? `${queued} sync queued` : 'Sync ready'} onPress={onSyncPress} />
      <InfoPill icon={<Wifi size={14} color={failed ? theme.palette.semantic.error : theme.palette.semantic.success} />} label={failed ? `${failed} failed sync` : 'Online'} tone={failed ? theme.palette.semantic.errorBg : theme.palette.semantic.successBg} onPress={onSyncPress} />
      <InfoPill icon={<ReceiptText size={14} color={failedPrints ? theme.palette.semantic.warning : theme.palette.neutral[600]} />} label={failedPrints ? `${failedPrints} print pending` : 'Printer fallback ready'} tone={failedPrints ? theme.palette.semantic.warningBg : theme.palette.neutral[100]} onPress={onPrinterPress} />
      {recoveryLabel ? <InfoPill icon={<History size={14} color={theme.palette.semantic.warning} />} label={recoveryLabel} tone={theme.palette.semantic.warningBg} onPress={onRetry} /> : null}
    </View>
  );
}

function InfoPill({ icon, label, tone, onPress }: { icon: React.ReactNode; label: string; tone?: string; onPress?: () => void }) {
  const theme = useTheme();
  const content = (
    <>
      {icon}
      <Text style={{ color: theme.palette.neutral[800], fontSize: 11, fontWeight: '900' }}>{label}</Text>
    </>
  );
  const style = { minHeight: 30, paddingHorizontal: 10, borderRadius: 999, backgroundColor: tone || theme.palette.semantic.infoBg, flexDirection: 'row' as const, alignItems: 'center' as const, gap: 6 };
  return onPress ? (
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={label} style={({ pressed }) => [style, { opacity: pressed ? 0.82 : 1 }]}>
      {content}
    </Pressable>
  ) : (
    <View style={style}>
      {content}
    </View>
  );
}

export function ReceiptBlock({
  orderNumber,
  businessName,
  items,
  total,
  paid,
  method,
}: {
  orderNumber: string;
  businessName?: string;
  items: OrderLineItem[];
  total: number;
  paid?: number;
  method?: string;
}) {
  const theme = useTheme();
  const t = useT();
  return (
    <Panel padding={16} style={{ backgroundColor: '#FFFFFF' }}>
      <Text style={{ textAlign: 'center', color: theme.palette.neutral[900], fontSize: 15, fontWeight: '900' }}>{businessName || 'BukuKasir POS'}</Text>
      <Text style={{ textAlign: 'center', marginTop: 3, color: theme.palette.neutral[500], fontSize: 11, fontWeight: '800' }}>{orderNumber}</Text>
      <View style={{ height: 1, backgroundColor: theme.palette.neutral[200], marginVertical: 12 }} />
      {items.filter((item) => !item.voided).map((item) => (
        <View key={item.id} style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 7, gap: 8 }}>
          <Text style={{ flex: 1, color: theme.palette.neutral[700], fontSize: 12, fontWeight: '800' }}>{item.quantity}x {item.menuItemName}</Text>
          <Text style={{ color: theme.palette.neutral[900], fontSize: 12, fontWeight: '900' }}>{formatRupiah(item.subtotal)}</Text>
        </View>
      ))}
      <View style={{ height: 1, backgroundColor: theme.palette.neutral[200], marginVertical: 10 }} />
      <TotalRow label="Total" value={total} />
      {paid != null ? <TotalRow label="Paid" value={paid} /> : null}
      {method ? <Text style={{ marginTop: 10, color: theme.palette.neutral[500], fontSize: 11, fontWeight: '800' }}>{t('pos.receipt.method')}: {method}</Text> : null}
    </Panel>
  );
}

export function StatCard({ label, value, meta, tone }: { label: string; value: string; meta?: string; tone?: string }) {
  const theme = useTheme();
  return (
    <Panel style={{ minWidth: 150, flex: 1 }}>
      <Text style={{ color: tone || theme.palette.neutral[900], fontSize: 22, fontWeight: '900' }}>{value}</Text>
      <Text style={{ marginTop: 4, color: theme.palette.neutral[500], fontSize: 11, fontWeight: '900', textTransform: 'uppercase' }}>{label}</Text>
      {meta ? <Text style={{ marginTop: 8, color: theme.palette.neutral[600], fontSize: 12, fontWeight: '700' }}>{meta}</Text> : null}
    </Panel>
  );
}

export const text = {
  tiny: { fontSize: 10, fontWeight: '900' as TextStyle['fontWeight'] },
  label: { fontSize: 12, fontWeight: '900' as TextStyle['fontWeight'] },
  body: { fontSize: 14, fontWeight: '700' as TextStyle['fontWeight'] },
  title: { fontSize: 20, fontWeight: '900' as TextStyle['fontWeight'] },
};
