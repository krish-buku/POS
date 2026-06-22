import React, { useEffect } from 'react';
import { View, Text, Pressable, ScrollView } from 'react-native';
import { useRouter, Redirect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '../../features/auth/store';
import { useTheme } from '../../shared/theme';
import { Header } from '../../shared/ui/Header';
import { useT } from '../../shared/i18n/store';

export default function SelectBusinessScreen() {
  const router = useRouter();
  const theme = useTheme();
  const t = useT();
  const availableBusinesses = useAuthStore((s) => s.availableBusinesses);
  const selectBusiness = useAuthStore((s) => s.selectBusiness);
  const isOtpVerified = useAuthStore((s) => s.isOtpVerified);

  const handlePick = async (id: string) => {
    const ok = await selectBusiness(id);
    if (ok) router.replace('/(auth)/pin-setup');
  };

  // Auto-pick if somehow only one remained (edge case)
  useEffect(() => {
    if (availableBusinesses.length === 1) {
      handlePick(availableBusinesses[0].id);
    }
  }, [availableBusinesses]);

  if (!isOtpVerified) {
    return <Redirect href="/(auth)/login" />;
  }

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: theme.palette.neutral[50] }}
      edges={['top', 'left', 'right', 'bottom']}
    >
      <Header
        title={t('auth.biz.title')}
        subtitle={t('auth.biz.subtitle')}
        roleColor="cashier"
        onBack={router.canGoBack() ? () => router.back() : undefined}
      />

      <ScrollView
        contentContainerStyle={{
          padding: theme.spacing[20],
          gap: theme.spacing[12],
        }}
      >
        <Text
          style={{
            fontSize: 13,
            color: theme.palette.neutral[600],
            fontWeight: '600',
            textTransform: 'uppercase',
            letterSpacing: 0.5,
            marginBottom: 4,
          }}
        >
          {availableBusinesses.length} {t('auth.biz.count')}
        </Text>

        {availableBusinesses.map((biz) => (
          <Pressable
            key={biz.id}
            onPress={() => handlePick(biz.id)}
            accessibilityRole="button"
            accessibilityLabel={`${t('auth.biz.open')} ${biz.name}`}
            testID={`business-open-${biz.id}`}
            style={({ pressed }) => ({
              padding: theme.spacing[16],
              borderRadius: 14,
              backgroundColor: pressed ? theme.palette.neutral[100] : theme.palette.neutral[0],
              borderWidth: 1.5,
              borderColor: theme.palette.neutral[200],
              flexDirection: 'row',
              alignItems: 'center',
              gap: 14,
            })}
          >
            <View
              style={{
                width: 48,
                height: 48,
                borderRadius: 12,
                backgroundColor: theme.palette.brand.accent,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Text style={{ fontSize: 22 }}>{'\uD83C\uDFEA'}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: '800',
                  color: theme.palette.neutral[900],
                }}
              >
                {biz.name}
              </Text>
              {biz.type ? (
                <Text
                  style={{
                    fontSize: 12,
                    color: theme.palette.neutral[600],
                    marginTop: 2,
                    textTransform: 'capitalize',
                  }}
                >
                  {biz.type}
                </Text>
              ) : null}
            </View>
            <View
              style={{
                minWidth: 74,
                height: 36,
                paddingHorizontal: 12,
                borderRadius: theme.radii.md,
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: theme.palette.neutral[100],
              }}
            >
              <Text style={{ color: theme.palette.neutral[800], fontSize: 14, fontWeight: '700' }}>
                {t('auth.biz.open')}
              </Text>
            </View>
          </Pressable>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}
