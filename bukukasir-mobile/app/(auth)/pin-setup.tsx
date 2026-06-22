import React, { useState } from 'react';
import { View, Text, ScrollView, Image, type ImageSourcePropType } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useAuthStore } from '../../features/auth/store';
import { useTheme } from '../../shared/theme';
import { Card } from '../../shared/ui/Card';
import { Button } from '../../shared/ui/Button';
import { PressScale } from '../../shared/motion/PressScale';
import { FadeIn } from '../../shared/motion/FadeIn';
import { PinInput } from '../../shared/components/PinInput';
import type { UserRole } from '../../features/auth/types';
import { useT } from '../../shared/i18n/store';

type Step = 'select-role' | 'enter-pin';
type PinMode = 'setup' | 'unlock' | 'change-pin' | 'switch-role';

type RoleDef = {
  key: Exclude<UserRole, 'owner'>;
  title: string;
  subtitle: string;
  image: ImageSourcePropType;
};

const ROLE_IMAGES: Record<Exclude<UserRole, 'owner'>, ImageSourcePropType> = {
  cashier: require('../../assets/generated/role-cashier.png'),
  waiter: require('../../assets/generated/role-waiter.png'),
  kitchen: require('../../assets/generated/role-kitchen.png'),
};

export default function PinSetupScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ mode?: string }>();
  const pinMode: PinMode =
    params.mode === 'unlock' || params.mode === 'change-pin' || params.mode === 'switch-role' ? params.mode : 'setup';
  const { user, setupPin, selectRole, verifyPin, role } = useAuthStore();
  const currentRole = role ?? user?.role ?? null;
  const [step, setStep] = useState<Step>(() =>
    pinMode === 'setup' || pinMode === 'switch-role' || !currentRole ? 'select-role' : 'enter-pin',
  );
  const [pendingRole, setPendingRole] = useState<Exclude<UserRole, 'owner'> | null>(null);
  const [error, setError] = useState<string | null>(null);
  const theme = useTheme();
  const t = useT();

  const ROLES: RoleDef[] = [
    {
      key: 'cashier',
      title: t('auth.role.cashier'),
      subtitle: t('auth.role.cashier.desc'),
      image: ROLE_IMAGES.cashier,
    },
    {
      key: 'waiter',
      title: t('auth.role.waiter'),
      subtitle: t('auth.role.waiter.desc'),
      image: ROLE_IMAGES.waiter,
    },
    {
      key: 'kitchen',
      title: t('auth.role.kitchen'),
      subtitle: t('auth.role.kitchen.desc'),
      image: ROLE_IMAGES.kitchen,
    },
  ];

  const routeByRole = (r: UserRole | null) => {
    switch (r) {
      case 'cashier':
      case 'owner':
        router.replace('/(cashier)/order');
        break;
      case 'waiter':
        router.replace('/(waiter)/my-tables');
        break;
      case 'kitchen':
        router.replace('/(kitchen)/queue');
        break;
      default:
        router.replace('/(cashier)/order');
    }
  };

  const handleSelectRole = (r: Exclude<UserRole, 'owner'>) => {
    setPendingRole(r);
    setStep('enter-pin');
  };

  const handleEnterPin = (pin: string) => {
    if (!/^\d{6}$/.test(pin)) {
      setError(t('auth.pin.err.sixDigits'));
      return;
    }
    setError(null);
    if (pinMode === 'unlock') {
      if (!verifyPin(pin)) {
        setError(t('auth.pin.err.invalid'));
        return;
      }
      routeByRole(useAuthStore.getState().role);
      return;
    }

    if (pinMode === 'switch-role') {
      const nextRole = pendingRole ?? (currentRole && currentRole !== 'owner' ? currentRole : null);
      if (!nextRole) {
        setError(t('auth.pin.err.pickRole'));
        setStep('select-role');
        return;
      }
      if (!verifyPin(pin)) {
        setError(t('auth.pin.err.invalid'));
        return;
      }
      selectRole(nextRole);
      routeByRole(nextRole);
      return;
    }

    if (pendingRole) {
      selectRole(pendingRole);
    }
    setupPin(pin);
    routeByRole(pendingRole ?? useAuthStore.getState().role);
  };

  const handlePinFooter = () => {
    setError(null);
    if (pinMode === 'setup' || pinMode === 'switch-role') {
      setPendingRole(null);
      setStep('select-role');
      return;
    }
    if (pinMode === 'unlock') {
      router.replace('/(auth)/login');
      return;
    }
    routeByRole(useAuthStore.getState().role);
  };

  const pinCopy = (() => {
    if (pinMode === 'unlock') {
      return {
        title: t('auth.pin.unlockTitle'),
        subtitlePrefix: t('auth.pin.unlockSubPrefix'),
        subtitleSuffix: t('auth.pin.unlockSubSuffix'),
        footerLabel: t('auth.pin.backToLogin'),
      };
    }
    if (pinMode === 'change-pin') {
      return {
        title: t('auth.pin.changeTitle'),
        subtitlePrefix: t('auth.pin.changeSubPrefix'),
        subtitleSuffix: t('auth.pin.changeSubSuffix'),
        footerLabel: t('common.cancel'),
      };
    }
    if (pinMode === 'switch-role') {
      return {
        title: t('auth.pin.confirmRoleTitle'),
        subtitlePrefix: t('auth.pin.confirmRoleSubPrefix'),
        subtitleSuffix: t('auth.pin.confirmRoleSubSuffix'),
        footerLabel: t('auth.pin.changeRole'),
      };
    }
    return {
      title: t('auth.pin.enterTitle'),
      subtitlePrefix: t('auth.pin.enterSubPrefix'),
      subtitleSuffix: t('auth.pin.enterSubSuffix'),
      footerLabel: t('auth.pin.changeRole'),
    };
  })();

  const roleStepCopy = pinMode === 'switch-role'
    ? { title: t('auth.pin.switchRoleTitle'), subtitle: t('auth.pin.switchRoleSub') }
    : { title: t('auth.pin.pickRole'), subtitle: t('auth.pin.pickRoleSub') };

  const selectedRole = pendingRole ?? (currentRole && currentRole !== 'owner' ? currentRole : null);

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: theme.palette.neutral[50] }}
      contentContainerStyle={{
        flexGrow: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: theme.spacing[40],
        paddingHorizontal: theme.spacing[24],
      }}
    >
      <FadeIn style={{ width: '100%', maxWidth: 720, alignItems: 'center' }}>
        <Card elevation="md" padding={theme.spacing[40]}>
          <View style={{ alignItems: 'center', width: '100%' }}>
            <Text
              style={{
                fontSize: theme.type.caption.size,
                color: theme.palette.neutral[600],
                marginBottom: theme.spacing[8],
                fontWeight: '500',
              }}
            >
              {t('auth.pin.welcome')}, {user?.name || t('auth.pin.defaultUser')}
            </Text>

            {step === 'select-role' ? (
              <RoleStep
                roles={ROLES}
                title={roleStepCopy.title}
                subtitle={roleStepCopy.subtitle}
                onSelect={handleSelectRole}
                footerLabel={pinMode === 'switch-role' ? t('common.cancel') : undefined}
                onFooterPress={pinMode === 'switch-role' ? () => routeByRole(currentRole) : undefined}
                theme={theme}
              />
            ) : (
              <PinStep
                roleTitle={ROLES.find((r) => r.key === selectedRole)?.title}
                title={pinCopy.title}
                subtitlePrefix={pinCopy.subtitlePrefix}
                subtitleSuffix={pinCopy.subtitleSuffix}
                footerLabel={pinCopy.footerLabel}
                error={error}
                onComplete={handleEnterPin}
                onFooterPress={handlePinFooter}
                theme={theme}
                t={t}
              />
            )}
          </View>
        </Card>
      </FadeIn>
    </ScrollView>
  );
}

function RoleStep({
  roles,
  title,
  subtitle,
  onSelect,
  footerLabel,
  onFooterPress,
  theme,
}: {
  roles: RoleDef[];
  title: string;
  subtitle: string;
  onSelect: (r: Exclude<UserRole, 'owner'>) => void;
  footerLabel?: string;
  onFooterPress?: () => void;
  theme: ReturnType<typeof useTheme>;
}) {
  return (
    <>
      <Text
        style={{
          fontSize: theme.type.title.size,
          fontWeight: theme.type.title.weight,
          color: theme.palette.neutral[900],
          marginBottom: theme.spacing[8],
        }}
      >
        {title}
      </Text>
      <Text
        style={{
          fontSize: theme.type.caption.size,
          color: theme.palette.neutral[600],
          marginBottom: theme.spacing[32],
          textAlign: 'center',
        }}
      >
        {subtitle}
      </Text>

      <View
        style={{
          flexDirection: 'row',
          gap: theme.spacing[16],
          width: '100%',
          justifyContent: 'center',
          flexWrap: 'wrap',
        }}
      >
        {roles.map(({ key, title, subtitle, image }) => (
          <PressScale
            key={key}
            onPress={() => onSelect(key)}
            accessibilityRole="button"
            accessibilityLabel={`${title}. ${subtitle}`}
            testID={`role-card-${key}`}
            style={{
              flex: 1,
              minWidth: 180,
              maxWidth: 220,
              borderRadius: theme.radii[16],
              borderWidth: 1,
              borderColor: theme.palette.neutral[200],
              backgroundColor: theme.palette.neutral[0],
              paddingVertical: theme.spacing[24],
              paddingHorizontal: theme.spacing[20],
              alignItems: 'center',
              gap: theme.spacing[8],
              ...theme.elevation.sm,
            }}
          >
            <View
              style={{
                width: 82,
                height: 82,
                borderRadius: theme.radii[16],
                backgroundColor: theme.palette.neutral[50],
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: theme.spacing[8],
                borderWidth: 1,
                borderColor: theme.palette.neutral[100],
              }}
            >
              <Image
                source={image}
                resizeMode="contain"
                accessibilityIgnoresInvertColors
                style={{ width: 74, height: 74 }}
              />
            </View>
            <Text
              style={{
                fontSize: theme.type.body.size,
                fontWeight: '700',
                color: theme.palette.neutral[900],
              }}
            >
              {title}
            </Text>
            <Text
              style={{
                fontSize: theme.type.micro.size,
                color: theme.palette.neutral[600],
                textAlign: 'center',
                lineHeight: 16,
              }}
            >
              {subtitle}
            </Text>
          </PressScale>
        ))}
      </View>
      {footerLabel && onFooterPress ? (
        <View style={{ marginTop: theme.spacing[24] }}>
          <Button variant="ghost" size="sm" onPress={onFooterPress}>
            {footerLabel}
          </Button>
        </View>
      ) : null}
    </>
  );
}

function PinStep({
  roleTitle,
  title,
  subtitlePrefix,
  subtitleSuffix,
  footerLabel,
  error,
  onComplete,
  onFooterPress,
  theme,
  t,
}: {
  roleTitle?: string;
  title: string;
  subtitlePrefix: string;
  subtitleSuffix: string;
  footerLabel: string;
  error: string | null;
  onComplete: (pin: string) => void;
  onFooterPress: () => void;
  theme: ReturnType<typeof useTheme>;
  t: ReturnType<typeof useT>;
}) {
  return (
    <>
      <Text
        style={{
          fontSize: theme.type.title.size,
          fontWeight: theme.type.title.weight,
          color: theme.palette.neutral[900],
          marginBottom: theme.spacing[8],
        }}
      >
        {title}
      </Text>
      <Text
        style={{
          fontSize: theme.type.caption.size,
          color: theme.palette.neutral[600],
          marginBottom: theme.spacing[32],
          textAlign: 'center',
        }}
      >
        {subtitlePrefix} {roleTitle ?? t('auth.pin.defaultRole')}. {subtitleSuffix}
      </Text>

      <PinInput accessibilityLabel={`${title}. ${roleTitle ?? t('auth.pin.defaultRole')}`} onComplete={onComplete} error={error} />

      <View style={{ marginTop: theme.spacing[24] }}>
        <Button variant="ghost" size="sm" onPress={onFooterPress}>
          {footerLabel}
        </Button>
      </View>
    </>
  );
}
