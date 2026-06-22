import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Image,
  ImageBackground,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Pressable,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../../features/auth/store';
import { useTheme } from '../../shared/theme';
import { Button } from '../../shared/ui/Button';
import { useLocaleStore, useT } from '../../shared/i18n/store';

export default function LoginScreen() {
  const router = useRouter();
  const loginWithPhone = useAuthStore((s) => s.loginWithPhone);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [channel, setChannel] = useState<'sms' | 'wa'>('sms');
  const [isLoading, setIsLoading] = useState(false);
  const theme = useTheme();
  const t = useT();
  const locale = useLocaleStore((s) => s.locale);
  const toggleLocale = useLocaleStore((s) => s.toggle);

  const handleLogin = async () => {
    const cleaned = phoneNumber.replace(/\D/g, '');
    if (cleaned.length !== 10) {
      Alert.alert(t('common.error'), t('auth.login.err.digits'));
      return;
    }
    setIsLoading(true);
    const success = await loginWithPhone(cleaned);
    setIsLoading(false);
    if (!success) {
      Alert.alert(t('common.error'), t('auth.login.err.load'));
      return;
    }
    const { needsBusinessSelection } = useAuthStore.getState();
    router.replace(
      needsBusinessSelection ? '/(auth)/select-business' : '/(auth)/pin-setup',
    );
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: theme.palette.neutral[50] }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={{ flex: 1, flexDirection: 'row' }}>
        {/* ─── LEFT: dark hero panel ─── */}
        <ImageBackground
          source={{ uri: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1200&q=70' }}
          style={{
            flex: 1,
            padding: 40,
            justifyContent: 'space-between',
            backgroundColor: '#1B1915',
          }}
          imageStyle={{ opacity: 0.14 }}
        >
          <View
            style={{
              position: 'absolute',
              top: 0,
              right: 0,
              bottom: 0,
              left: 0,
              backgroundColor: 'rgba(27,25,21,0.86)',
            }}
          />
          <View>
            <View
              style={{
                width: 112,
                height: 88,
                borderRadius: 16,
                backgroundColor: '#FFFFFF',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 20,
                shadowColor: '#000',
                shadowOpacity: 0.25,
                shadowRadius: 14,
                shadowOffset: { width: 0, height: 4 },
              }}
            >
              <Image source={require('../../assets/bukuwarung-logo.png')} style={{ width: 96, height: 76 }} resizeMode="contain" />
            </View>
            <Text
              style={{
                fontSize: 11,
                fontWeight: '800',
                color: theme.palette.brand.gold,
                letterSpacing: 1.2,
                marginBottom: 6,
              }}
            >
              BUKUKASIR · FRONTLINE
            </Text>
            <Text
              style={{
                fontSize: 15,
                color: 'rgba(255,255,255,0.65)',
                fontWeight: '500',
              }}
            >
              V1.2
            </Text>
          </View>

          <View>
            <Text
              style={{
                fontSize: 56,
                fontWeight: '500',
                color: '#FFFFFF',
                lineHeight: 59,
                letterSpacing: -1.5,
                fontStyle: 'italic',
              }}
            >
              {t('auth.login.heroTitle')}
            </Text>
            <Text
              style={{
                marginTop: 16,
                fontSize: 15,
                color: 'rgba(255,255,255,0.75)',
                lineHeight: 22,
                maxWidth: 460,
              }}
            >
              {t('auth.login.hero')}
            </Text>
          </View>

          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 12,
            }}
          >
            <Text
              style={{
                fontSize: 10,
                fontWeight: '700',
                color: theme.palette.brand.gold,
                letterSpacing: 1.4,
              }}
            >
              {t('auth.login.location')}
            </Text>
            <View
              style={{
                width: 4,
                height: 4,
                borderRadius: 2,
                backgroundColor: 'rgba(255,255,255,0.4)',
              }}
            />
            <Text
              style={{
                fontSize: 10,
                fontWeight: '700',
                color: 'rgba(255,255,255,0.6)',
                letterSpacing: 1.4,
              }}
            >
              {t('auth.login.device')}
            </Text>
          </View>
        </ImageBackground>

        {/* ─── RIGHT: phone form ─── */}
        <View
          style={{
            flex: 1,
            backgroundColor: '#FFFFFF',
            padding: 48,
            justifyContent: 'center',
          }}
        >
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={locale === 'id' ? 'Switch language to English' : 'Ganti bahasa ke Indonesia'}
            testID="login-language-toggle"
            onPress={toggleLocale}
            style={({ pressed }) => ({
              position: 'absolute',
              top: 28,
              right: 32,
              flexDirection: 'row',
              alignItems: 'center',
              paddingHorizontal: 12,
              paddingVertical: 7,
              borderRadius: 10,
              borderWidth: 1,
              borderColor: theme.palette.neutral[300],
              backgroundColor: pressed ? theme.palette.neutral[100] : '#FFFFFF',
            })}
          >
            <Text style={{ fontSize: 13, fontWeight: '900', color: theme.palette.neutral[900] }}>
              {locale === 'id' ? 'ID' : 'EN'}
            </Text>
            <Text style={{ marginLeft: 4, fontSize: 11, fontWeight: '700', color: theme.palette.neutral[500] }}>
              / {locale === 'id' ? 'EN' : 'ID'}
            </Text>
          </Pressable>

          <View
            style={{
              alignSelf: 'flex-start',
              backgroundColor: '#FBF2DA',
              paddingHorizontal: 10,
              paddingVertical: 4,
              borderRadius: 6,
              marginBottom: 20,
            }}
          >
            <Text
              style={{
                fontSize: 10,
                fontWeight: '800',
                color: theme.palette.brand.goldDark,
                letterSpacing: 1.2,
              }}
            >
              {t('auth.login.step')}
            </Text>
          </View>

          <Text
            style={{
              fontSize: 30,
              fontWeight: '900',
              color: theme.palette.neutral[900],
              letterSpacing: -0.6,
              marginBottom: 10,
            }}
          >
            {t('auth.login.heading')}
          </Text>
          <Text
            style={{
              fontSize: 14,
              color: theme.palette.neutral[600],
              lineHeight: 21,
              marginBottom: 28,
              maxWidth: 460,
            }}
          >
            {t('auth.login.subtitle')}
          </Text>

          {/* Phone input row */}
          <View
            style={{
              flexDirection: 'row',
              borderWidth: 1.5,
              borderColor: theme.palette.neutral[200],
              borderRadius: 12,
              overflow: 'hidden',
            }}
          >
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 8,
                paddingHorizontal: 14,
                paddingVertical: 14,
                backgroundColor: theme.palette.neutral[50],
                borderRightWidth: 1,
                borderRightColor: theme.palette.neutral[200],
              }}
            >
              <Text style={{ fontSize: 18 }}>{'\uD83C\uDDEE\uD83C\uDDE9'}</Text>
              <Text
                style={{
                  fontSize: 15,
                  fontWeight: '700',
                  color: theme.palette.neutral[900],
                }}
              >
                +62
              </Text>
            </View>
            <TextInput
              value={phoneNumber}
              onChangeText={(text) =>
                setPhoneNumber(text.replace(/\D/g, '').slice(0, 10))
              }
              placeholder="812 3456 7890"
              placeholderTextColor={theme.palette.neutral[400]}
              keyboardType="number-pad"
              maxLength={10}
              autoFocus
              onSubmitEditing={handleLogin}
              style={{
                flex: 1,
                paddingHorizontal: 14,
                paddingVertical: 14,
                fontSize: 16,
                color: theme.palette.neutral[900],
                fontWeight: '600',
              }}
            />
          </View>

          {/* Channel toggle */}
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 12,
              marginTop: 16,
            }}
          >
            <Text
              style={{
                fontSize: 12,
                color: theme.palette.neutral[600],
                fontWeight: '600',
              }}
            >
              {t('auth.login.sendVia')}
            </Text>
            {(['sms', 'wa'] as const).map((ch) => {
              const active = channel === ch;
              return (
              <Pressable
                  key={ch}
                  onPress={() => setChannel(ch)}
                  accessibilityRole="button"
                  accessibilityLabel={`${t('auth.login.sendVia')} ${ch === 'sms' ? 'SMS' : 'WhatsApp'}`}
                  accessibilityState={{ selected: active }}
                  aria-selected={active}
                  testID={`login-channel-${ch}`}
                  style={({ pressed }) => ({
                    paddingHorizontal: 10,
                    paddingVertical: 3,
                    borderRadius: 6,
                    backgroundColor: active
                      ? theme.palette.brand.gold
                      : pressed
                      ? theme.palette.neutral[200]
                      : 'transparent',
                  })}
                >
                  <Text
                    style={{
                      fontSize: 11,
                      fontWeight: '800',
                      letterSpacing: 0.8,
                      color: active ? '#FFFFFF' : theme.palette.neutral[700],
                    }}
                  >
                    {ch === 'sms' ? 'SMS' : 'WHATSAPP'}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          {/* Submit */}
          <View style={{ marginTop: 28 }}>
            <Button
              variant="primary"
              size="lg"
              onPress={handleLogin}
              disabled={isLoading || phoneNumber.length !== 10}
              loading={isLoading}
            >
              {isLoading ? t('auth.login.loading') : t('auth.login.sendCode')}
            </Button>
          </View>

          {/* Footer hint */}
          <Text
            style={{
              marginTop: 20,
              fontSize: 12,
              color: theme.palette.neutral[500],
              lineHeight: 18,
            }}
          >
            {t('auth.login.help')}
          </Text>

          <Pressable
            onPress={() => router.push('/(auth)/onboarding')}
            accessibilityRole="button"
            accessibilityLabel="Setup new business"
            style={({ pressed }) => ({
              marginTop: 14,
              alignSelf: 'flex-start',
              paddingHorizontal: 12,
              paddingVertical: 9,
              borderRadius: 8,
              backgroundColor: pressed ? theme.palette.neutral[100] : theme.palette.semantic.infoBg,
            })}
          >
            <Text style={{ color: theme.palette.brand.navy, fontSize: 13, fontWeight: '900' }}>
              Setup new business
            </Text>
          </Pressable>

          <View
            style={{
              marginTop: 24,
              padding: 10,
              borderRadius: 8,
              backgroundColor: theme.palette.semantic.warningBg,
              borderWidth: 1,
              borderColor: theme.palette.brand.gold,
            }}
          >
            <Text
              style={{
                fontSize: 11,
                color: theme.palette.brand.goldDark,
                fontWeight: '700',
              }}
            >
              {t('auth.login.demoHint')}
            </Text>
          </View>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
