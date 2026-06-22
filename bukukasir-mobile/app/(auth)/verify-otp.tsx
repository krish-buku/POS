import React, { useEffect, useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSequence,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../../features/auth/store';
import { useTheme } from '../../shared/theme';
import { Button } from '../../shared/ui/Button';
import { Card } from '../../shared/ui/Card';
import { PressScale } from '../../shared/motion/PressScale';
import { useT } from '../../shared/i18n/store';

const KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', '<'];

export default function VerifyOtpScreen() {
  const router = useRouter();
  const { sendOtp, verifyOtp, phone } = useAuthStore();
  const [digits, setDigits] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [resendNotice, setResendNotice] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const theme = useTheme();
  const t = useT();

  const shakeX = useSharedValue(0);

  const triggerShake = () => {
    shakeX.value = withSequence(
      withTiming(-12, { duration: 60 }),
      withTiming(12, { duration: 60 }),
      withTiming(-8, { duration: 60 }),
      withTiming(8, { duration: 60 }),
      withTiming(0, { duration: 60 })
    );
  };

  const handleVerify = async (code: string) => {
    setIsLoading(true);
    const success = await verifyOtp(code);
    setIsLoading(false);
    if (success) {
      router.replace('/(auth)/pin-setup');
    } else {
      setError(t('auth.otp.err.wrong'));
      triggerShake();
      setDigits('');
    }
  };

  const handleResend = async () => {
    if (isLoading || !phone) return;
    setIsLoading(true);
    const success = await sendOtp(phone);
    setIsLoading(false);
    setDigits('');
    setError(success ? null : t('auth.otp.resendFailed'));
    setResendNotice(success ? t('auth.otp.resendSent') : null);
  };

  const pressKey = (key: string) => {
    if (isLoading) return;
    if (key === '<') {
      setDigits((d) => d.slice(0, -1));
      setError(null);
      return;
    }
    if (key === '') return;
    if (digits.length >= 6) return;
    const next = digits + key;
    setDigits(next);
    setError(null);
    if (next.length === 6) {
      handleVerify(next);
    }
  };

  const maskedPhone = phone
    ? phone.replace(/(\+62)(\d{3})(\d+)(\d{3})/, '$1 $2 **** $4')
    : '';

  const shakeStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: shakeX.value }],
  }));

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: theme.palette.neutral[50],
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <Card elevation="md" padding={theme.spacing[40]}>
        <View style={{ width: 440, alignItems: 'center' }}>
          <Pressable
            onPress={() => router.back()}
            accessibilityRole="button"
            accessibilityLabel={t('common.back')}
            style={{ alignSelf: 'flex-start', marginBottom: theme.spacing[20] }}
          >
            <Text
              style={{
                fontSize: theme.type.caption.size,
                color: theme.palette.brand.navy,
                fontWeight: '600',
              }}
            >
              {'\u2190'} {t('common.back')}
            </Text>
          </Pressable>

          <Text
            style={{
              fontSize: theme.type.title.size,
              fontWeight: theme.type.title.weight,
              color: theme.palette.neutral[900],
              marginBottom: theme.spacing[8],
            }}
          >
            {t('auth.otp.title')}
          </Text>
          <Text
            style={{
              fontSize: theme.type.caption.size,
              color: theme.palette.neutral[600],
              marginBottom: theme.spacing[32],
              textAlign: 'center',
            }}
          >
            {t('auth.otp.subtitle')} {maskedPhone}
          </Text>

          <Animated.View
            style={[
              { flexDirection: 'row', gap: 12, marginBottom: theme.spacing[16] },
              shakeStyle,
            ]}
          >
            {Array.from({ length: 6 }).map((_, i) => (
              <DotBox key={i} filled={i < digits.length} error={!!error} />
            ))}
          </Animated.View>

          {error ? (
            <Text
              style={{
                color: theme.palette.semantic.error,
                fontSize: theme.type.caption.size,
                fontWeight: '500',
                marginBottom: theme.spacing[8],
              }}
            >
              {error}
            </Text>
          ) : null}

          {resendNotice ? (
            <Text
              style={{
                color: theme.palette.semantic.success,
                fontSize: theme.type.caption.size,
                fontWeight: '600',
                marginBottom: theme.spacing[8],
              }}
            >
              {resendNotice}
            </Text>
          ) : null}

          {isLoading ? (
            <Text
              style={{
                color: theme.palette.brand.navy,
                fontSize: theme.type.caption.size,
                fontWeight: '500',
                marginBottom: theme.spacing[8],
              }}
            >
              {t('auth.otp.verifying')}
            </Text>
          ) : null}

          <View
            style={{
              width: 280,
              flexDirection: 'row',
              flexWrap: 'wrap',
              justifyContent: 'center',
              gap: 10,
              marginTop: theme.spacing[16],
            }}
          >
            {KEYS.map((k, idx) => {
              const keyStyle = {
                width: 80,
                height: 60,
                borderRadius: theme.radii[12],
                backgroundColor: k === '' ? 'transparent' : theme.palette.neutral[100],
                justifyContent: 'center' as const,
                alignItems: 'center' as const,
              };
              if (k === '') {
                return <View key={idx} style={keyStyle} />;
              }
              return (
                <PressScale
                  key={idx}
                  onPress={() => pressKey(k)}
                  disabled={isLoading}
                  accessibilityRole="button"
                  accessibilityLabel={k === '<' ? 'Backspace' : `Digit ${k}`}
                  accessibilityState={{ disabled: isLoading }}
                  style={keyStyle}
                >
                  <Text
                    style={{
                      fontSize: 24,
                      fontWeight: '700',
                      color: theme.palette.neutral[900],
                    }}
                  >
                    {k === '<' ? '\u232B' : k}
                  </Text>
                </PressScale>
              );
            })}
          </View>

          <View style={{ marginTop: theme.spacing[20] }}>
            <Button variant="ghost" size="sm" onPress={handleResend} disabled={isLoading || !phone}>
              {t('auth.otp.resend')}
            </Button>
          </View>

          <View
            style={{
              marginTop: theme.spacing[20],
              padding: theme.spacing[12],
              backgroundColor: 'rgba(245, 158, 11, 0.1)',
              borderRadius: theme.radii[8],
              width: '100%',
              alignItems: 'center',
            }}
          >
            <Text
              style={{
                fontSize: theme.type.micro.size,
                color: theme.palette.semantic.warning,
                fontWeight: '500',
              }}
            >
              {t('auth.otp.demoHint')}
            </Text>
          </View>
        </View>
      </Card>
    </View>
  );
}

function DotBox({ filled, error }: { filled: boolean; error: boolean }) {
  const theme = useTheme();
  const scale = useSharedValue(filled ? 1 : 0.6);
  const opacity = useSharedValue(filled ? 1 : 0.3);

  useEffect(() => {
    scale.value = withTiming(filled ? 1 : 0.6, {
      duration: 140,
      easing: Easing.out(Easing.cubic),
    });
    opacity.value = withTiming(filled ? 1 : 0.3, {
      duration: theme.motion.duration.fast,
    });
  }, [filled]);

  const style = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const borderColor = error
    ? theme.palette.semantic.error
    : filled
    ? theme.palette.brand.navy
    : theme.palette.neutral[200];
  const dotColor = error
    ? theme.palette.semantic.error
    : theme.palette.brand.navy;

  return (
    <View
      style={{
        width: 48,
        height: 56,
        borderRadius: theme.radii[12],
        borderWidth: 2,
        borderColor,
        backgroundColor: error ? 'rgba(239,68,68,0.08)' : theme.palette.neutral[0],
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <Animated.View
        style={[
          {
            width: 12,
            height: 12,
            borderRadius: 6,
            backgroundColor: dotColor,
          },
          style,
        ]}
      />
    </View>
  );
}
