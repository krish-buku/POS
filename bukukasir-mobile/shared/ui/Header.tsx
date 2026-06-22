import React from 'react';
import { Image, View, Text, Pressable, StyleSheet } from 'react-native';
import { theme } from '../theme';
import { useLocaleStore, useT } from '../i18n/store';

type RoleName = 'cashier' | 'waiter' | 'kitchen';

interface HeaderProps {
  title: string;
  subtitle?: string;
  leading?: React.ReactNode;
  trailing?: React.ReactNode;
  // Accept a role name ('cashier' | 'waiter' | 'kitchen') which resolves to the
  // role-tinted hex color, OR a raw color string.
  roleColor?: RoleName | string;
  onBack?: () => void;
}

function LocaleToggle({ tinted }: { tinted: boolean }) {
  const locale = useLocaleStore((s) => s.locale);
  const toggle = useLocaleStore((s) => s.toggle);
  const t = useT();
  const fg = tinted ? '#FFFFFF' : theme.palette.neutral[900];
  const border = tinted ? 'rgba(255,255,255,0.35)' : theme.palette.neutral[300];
  const bgActive = tinted ? 'rgba(255,255,255,0.22)' : theme.palette.neutral[200];
  const bgIdle = tinted ? 'rgba(255,255,255,0.10)' : theme.palette.neutral[0];

  return (
    <Pressable
      onPress={toggle}
      hitSlop={8}
      accessibilityRole="button"
      accessibilityLabel={locale === 'id' ? t('language.switchToEnglish') : t('language.switchToIndonesian')}
      style={({ pressed }) => ({
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: border,
        backgroundColor: pressed ? bgActive : bgIdle,
        marginRight: 8,
      })}
    >
      <Text style={{ color: fg, fontSize: 13, fontWeight: '800' }}>
        {locale === 'id' ? 'ID' : 'EN'}
      </Text>
      <Text style={{ color: fg, fontSize: 10, fontWeight: '600', marginLeft: 4, opacity: 0.7 }}>
        / {locale === 'id' ? 'EN' : 'ID'}
      </Text>
    </Pressable>
  );
}

function resolveRoleColor(roleColor?: string): string | undefined {
  if (!roleColor) return undefined;
  const roles = theme.palette.roles as Record<string, string>;
  if (roleColor in roles) return roles[roleColor];
  return roleColor;
}

export function Header({ title, subtitle, leading, trailing, roleColor, onBack }: HeaderProps) {
  const t = useT();
  const resolved = resolveRoleColor(roleColor);
  const roleName =
    roleColor === 'cashier' ? t('auth.role.cashier') : roleColor === 'waiter' ? t('auth.role.waiter') : roleColor === 'kitchen' ? t('auth.role.kitchen') : null;
  const fg = theme.palette.neutral[900];
  const muted = theme.palette.neutral[500];

  const leadingNode = onBack ? (
    <Pressable onPress={onBack} hitSlop={10} accessibilityRole="button" accessibilityLabel={t('common.back')}>
      <Text style={{ color: theme.palette.neutral[700], fontSize: 24, fontWeight: '700' }}>{'\u2039'}</Text>
    </Pressable>
  ) : leading;

  return (
    <View style={styles.wrap}>
      <View style={styles.row}>
        <View style={styles.brand}>
          {leadingNode ? <View style={{ marginRight: 6 }}>{leadingNode}</View> : null}
          <View style={styles.logo}>
            <Image source={require('../../assets/bukuwarung-logo.png')} style={{ width: 38, height: 30 }} resizeMode="contain" />
          </View>
          <View>
            <Text style={styles.brandTitle}>BukuKasir</Text>
            <Text style={styles.brandSub} numberOfLines={1}>
              {subtitle || title}
            </Text>
          </View>
        </View>

        <View style={styles.divider} />
        {roleName && resolved ? <RoleChip label={roleName} color={resolved} /> : null}
        <View style={{ flex: 1, alignItems: 'center' }}>
          <Text style={[styles.screenTitle, { color: fg }]} numberOfLines={1}>
            {title}
          </Text>
        </View>
        <LiveDot label={t('header.live')} />
        <LocaleToggle tinted={false} />
        {trailing}
      </View>
    </View>
  );
}

function RoleChip({ label, color }: { label: string; color: string }) {
  return (
    <View style={[styles.roleChip, { backgroundColor: color }]}>
      <View style={styles.roleDot} />
      <Text style={styles.roleText}>{label}</Text>
    </View>
  );
}

function LiveDot({ label }: { label: string }) {
  return (
    <View style={styles.live}>
      <View style={styles.liveDot} />
      <Text style={styles.liveText}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    height: 60,
    paddingHorizontal: 20,
    backgroundColor: theme.palette.neutral[0],
    borderBottomWidth: 1,
    borderBottomColor: theme.palette.neutral[200],
    justifyContent: 'center',
  },
  row: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  brand: { flexDirection: 'row', alignItems: 'center', gap: 10, minWidth: 190 },
  logo: {
    width: 30,
    height: 30,
    borderRadius: 8,
    backgroundColor: theme.palette.neutral[0],
    borderWidth: 1,
    borderColor: theme.palette.neutral[200],
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  brandTitle: { fontSize: 14, fontWeight: '800', color: theme.palette.neutral[900], letterSpacing: -0.2 },
  brandSub: {
    maxWidth: 150,
    marginTop: 2,
    fontSize: 10,
    fontWeight: '700',
    color: theme.palette.neutral[500],
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  divider: { width: 1, height: 24, backgroundColor: theme.palette.neutral[200] },
  roleChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 11,
    paddingVertical: 6,
    borderRadius: 999,
  },
  roleDot: { width: 5, height: 5, borderRadius: 3, backgroundColor: '#FFFFFF' },
  roleText: { color: '#FFFFFF', fontSize: 10, fontWeight: '900', letterSpacing: 1, textTransform: 'uppercase' },
  screenTitle: { fontSize: 14, fontWeight: '800', letterSpacing: -0.2 },
  live: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  liveDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: theme.palette.semantic.success },
  liveText: { fontSize: 11, color: theme.palette.semantic.success, fontWeight: '800' },
});
