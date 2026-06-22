import React, { useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../../features/auth/store';
import { useOrderStore } from '../../features/order/store';
import { useTableStore } from '../../features/table/store';
import { useLocaleStore, useT } from '../i18n/store';
import { useTheme } from '../theme';
import { Sheet } from '../ui/Sheet';
import { Button } from '../ui/Button';

export function ProfileMenu() {
  const router = useRouter();
  const t = useT();
  const locale = useLocaleStore((s) => s.locale);
  const toggleLocale = useLocaleStore((s) => s.toggle);
  const theme = useTheme();
  const user = useAuthStore((s) => s.user);
  const switchBusiness = useAuthStore((s) => s.switchBusiness);
  const logout = useAuthStore((s) => s.logout);
  const hasDraft = useOrderStore(
    (s) => s.items.length > 0 || s.syncQueueCount > 0 || s.failedSyncCount > 0 || !!s.recoveryDraftSavedAt,
  );
  const [open, setOpen] = useState(false);
  const [confirmLogout, setConfirmLogout] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  const initial =
    (user?.name?.trim()?.charAt(0) || user?.businessName?.trim()?.charAt(0) || '?')
      .toUpperCase();

  const clearTenantState = () => {
    useOrderStore.getState().clearOrder();
    useTableStore.getState().clearSelection();
  };

  const handleLock = () => {
    setOpen(false);
    setConfirmLogout(false);
    useAuthStore.setState({ isAuthenticated: false });
    router.replace({ pathname: '/(auth)/pin-setup', params: { mode: 'unlock' } } as any);
  };

  const handleSwitchBusiness = async () => {
    clearTenantState();
    setOpen(false);
    setConfirmLogout(false);
    await switchBusiness();
    router.replace('/(auth)/select-business');
  };

  const handleLogout = () => {
    if (!confirmLogout) {
      setConfirmLogout(true);
      return;
    }
    clearTenantState();
    setOpen(false);
    logout();
    router.replace('/(auth)/login');
  };

  const handleChangePin = () => {
    setOpen(false);
    setConfirmLogout(false);
    router.replace({ pathname: '/(auth)/pin-setup', params: { mode: 'change-pin' } } as any);
  };

  const handleSwitchRole = () => {
    setOpen(false);
    setConfirmLogout(false);
    router.replace({ pathname: '/(auth)/pin-setup', params: { mode: 'switch-role' } } as any);
  };

  return (
    <>
      <Pressable
        onPress={() => {
          setNotice(null);
          setConfirmLogout(false);
          setOpen(true);
        }}
        hitSlop={8}
        accessibilityRole="button"
        accessibilityLabel={t('profile.account')}
        style={({ pressed }) => ({
          flexDirection: 'row',
          alignItems: 'center',
          gap: 6,
          paddingHorizontal: 10,
          paddingVertical: 6,
          borderRadius: 999,
          borderWidth: 1,
          borderColor: theme.palette.neutral[300],
          backgroundColor: pressed
            ? theme.palette.neutral[100]
            : theme.palette.neutral[0],
        })}
      >
        <View
          style={{
            width: 22,
            height: 22,
            borderRadius: 11,
            backgroundColor: theme.palette.brand.navy,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Text style={{ fontSize: 11, fontWeight: '800', color: '#FFFFFF' }}>
            {initial}
          </Text>
        </View>
        <Text style={{ color: theme.palette.neutral[600], fontSize: 12, fontWeight: '700' }}>
          {'\u22EE'}
        </Text>
      </Pressable>

      <Sheet visible={open} onDismiss={() => setOpen(false)} title={t('profile.title')}>
        <View style={{ gap: 14 }}>
          <View
            style={{
              flexDirection: 'row',
              gap: 12,
              alignItems: 'center',
              paddingBottom: 14,
              borderBottomWidth: 1,
              borderBottomColor: theme.palette.neutral[200],
            }}
          >
            <View
              style={{
                width: 52,
                height: 52,
                borderRadius: 16,
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: theme.palette.brand.navy,
              }}
            >
              <Text style={{ color: '#FFFFFF', fontSize: 22, fontWeight: '900' }}>{initial}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ color: theme.palette.neutral[900], fontSize: 18, fontWeight: '900' }}>
                {user?.name ?? t('auth.pin.defaultUser')}
              </Text>
              <Text style={{ color: theme.palette.neutral[600], marginTop: 2, fontSize: 12, fontWeight: '700' }}>
                {user?.businessName ?? 'BukuKasir'} · {user?.role ? t(`auth.role.${user.role}` as any) : t('auth.pin.defaultRole')}
              </Text>
            </View>
            <View
              style={{
                paddingHorizontal: 10,
                paddingVertical: 6,
                borderRadius: 999,
                backgroundColor: theme.palette.semantic.successBg,
                borderWidth: 1,
                borderColor: theme.palette.semantic.success,
              }}
            >
              <Text style={{ color: theme.palette.semantic.success, fontSize: 11, fontWeight: '900' }}>
                {t('header.live')}
              </Text>
            </View>
          </View>

          <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
            <StatusChip label={t('sync.online')} />
            <StatusChip label={t('profile.autoLock')} />
            {hasDraft ? <StatusChip label={t('profile.pendingLocal')} tone="warning" /> : null}
          </View>

          {notice ? (
            <Text style={{ color: theme.palette.neutral[600], fontSize: 12, lineHeight: 18 }}>
              {notice}
            </Text>
          ) : null}

          {confirmLogout ? (
            <View
              style={{
                padding: 12,
                borderRadius: 12,
                borderWidth: 1,
                borderColor: theme.palette.semantic.error,
                backgroundColor: theme.palette.semantic.errorBg,
                gap: 4,
              }}
            >
              <Text style={{ color: theme.palette.semantic.error, fontWeight: '900' }}>
                {t('profile.logoutConfirm')}
              </Text>
              <Text style={{ color: theme.palette.neutral[700], fontSize: 12, lineHeight: 18 }}>
                {t('profile.logoutWarning')}
              </Text>
            </View>
          ) : null}

          <View style={{ gap: 8 }}>
            <Button variant="secondary" size="lg" onPress={handleLock}>
              {t('profile.lockNow')}
            </Button>
            <Button variant="secondary" size="lg" onPress={handleChangePin}>
              {t('profile.changePin')}
            </Button>
            <Button variant="secondary" size="lg" onPress={handleSwitchRole}>
              {t('profile.switchRole')}
            </Button>
            <Button variant="secondary" size="lg" onPress={handleSwitchBusiness}>
              {t('profile.switchLocation')}
            </Button>
            <Button variant="secondary" size="lg" onPress={toggleLocale}>
              {locale === 'id' ? t('language.switchToEnglish') : t('language.switchToIndonesian')}
            </Button>
            <Button variant={confirmLogout ? 'destructive' : 'ghost'} size="lg" onPress={handleLogout}>
              {confirmLogout ? t('profile.logoutAction') : t('common.logout')}
            </Button>
          </View>
        </View>
      </Sheet>
    </>
  );
}

function StatusChip({ label, tone }: { label: string; tone?: 'warning' }) {
  const theme = useTheme();
  const color = tone === 'warning' ? theme.palette.semantic.warning : theme.palette.semantic.success;
  const bg = tone === 'warning' ? theme.palette.semantic.warningBg : theme.palette.semantic.successBg;
  return (
    <View
      style={{
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 999,
        backgroundColor: bg,
        borderWidth: 1,
        borderColor: color,
      }}
    >
      <Text style={{ color, fontSize: 11, fontWeight: '900' }}>{label}</Text>
    </View>
  );
}
