import React, { useEffect } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  withRepeat,
  Easing,
} from 'react-native-reanimated';
import { useAuthStore } from '../features/auth/store';
import { useTheme } from '../shared/theme';
import { useLocaleStore, useT } from '../shared/i18n/store';

export default function IndexScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ e2eRole?: string; e2eReset?: string; e2eTarget?: string; e2eLocale?: string }>();
  const { isAuthenticated, role, devLoginAs, logout } = useAuthStore();
  const theme = useTheme();
  const t = useT();
  const setLocale = useLocaleStore((state) => state.setLocale);

  const logoScale = useSharedValue(0.8);
  const logoOpacity = useSharedValue(0);
  const taglineY = useSharedValue(24);
  const taglineOpacity = useSharedValue(0);
  const loaderOpacity = useSharedValue(0);

  useEffect(() => {
    logoOpacity.value = withTiming(1, { duration: theme.motion.duration.slow });
    logoScale.value = withTiming(1.0, {
      duration: 260,
      easing: Easing.out(Easing.cubic),
    });
    taglineOpacity.value = withDelay(
      200,
      withTiming(1, { duration: theme.motion.duration.normal })
    );
    taglineY.value = withDelay(
      200,
      withTiming(0, { duration: 260, easing: Easing.out(Easing.cubic) })
    );
    loaderOpacity.value = withDelay(
      400,
      withRepeat(
        withTiming(1, { duration: 900, easing: Easing.inOut(Easing.ease) }),
        -1,
        true
      )
    );
  }, []);

  useEffect(() => {
    const e2eLocale = String(params.e2eLocale ?? '');
    if (e2eLocale === 'en' || e2eLocale === 'id') {
      setLocale(e2eLocale);
    }

    if (String(params.e2eReset ?? '') === '1') {
      logout();
      router.replace('/(auth)/login');
      return;
    }

    const e2eRole = String(params.e2eRole ?? '');
    if (['cashier', 'waiter', 'kitchen'].includes(e2eRole)) {
      devLoginAs(e2eRole as 'cashier' | 'waiter' | 'kitchen');
      const target = String(params.e2eTarget ?? '');
      switch (e2eRole) {
        case 'waiter':
          if (target === 'order') {
            router.replace('/(waiter)/order');
            return;
          }
          if (target === 'transfer') {
            router.replace('/(waiter)/transfer');
            return;
          }
          router.replace('/(waiter)/my-tables');
          return;
        case 'kitchen':
          if (target === 'board') {
            router.replace({ pathname: '/(kitchen)/queue', params: { kdsMode: 'board' } } as any);
            return;
          }
          router.replace('/(kitchen)/queue');
          return;
        default:
          if (['tables', 'payment', 'history', 'settings', 'transfer'].includes(target)) {
            router.replace(`/(cashier)/${target}` as any);
            return;
          }
          router.replace('/(cashier)/order');
          return;
      }
    }

    const timeout = setTimeout(() => {
      if (!isAuthenticated) {
        router.replace('/(auth)/login');
        return;
      }

      // Route based on role
      switch (role) {
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
          router.replace('/(auth)/login');
      }
    }, 900);

    return () => clearTimeout(timeout);
  }, [devLoginAs, isAuthenticated, logout, params.e2eLocale, params.e2eReset, params.e2eRole, params.e2eTarget, role, router, setLocale]);

  const logoStyle = useAnimatedStyle(() => ({
    opacity: logoOpacity.value,
    transform: [{ scale: logoScale.value }],
  }));
  const taglineStyle = useAnimatedStyle(() => ({
    opacity: taglineOpacity.value,
    transform: [{ translateY: taglineY.value }],
  }));
  const loaderStyle = useAnimatedStyle(() => ({
    opacity: loaderOpacity.value,
  }));

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: theme.palette.brand.navy,
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <Animated.View style={[{ alignItems: 'center' }, logoStyle]}>
        <Text style={{ fontSize: 72, marginBottom: theme.spacing[4] }}>
          {'\uD83D\uDCB0'}
        </Text>
        <Text
          style={{
            fontSize: 40,
            fontWeight: '800',
            color: theme.palette.neutral[0],
            letterSpacing: 1,
          }}
        >
          BukuKasir
        </Text>
      </Animated.View>
      <Animated.View style={[{ marginTop: theme.spacing[2] }, taglineStyle]}>
        <Text
          style={{
            fontSize: 16,
            lineHeight: 24,
            color: 'rgba(255,255,255,0.8)',
            fontWeight: '500',
          }}
        >
          {t('auth.tagline')}
        </Text>
      </Animated.View>

      <Animated.View
        style={[
          {
            position: 'absolute',
            bottom: 48,
            alignItems: 'center',
          },
          loaderStyle,
        ]}
      >
        <ActivityIndicator size="small" color={theme.palette.brand.gold} />
      </Animated.View>
    </View>
  );
}
