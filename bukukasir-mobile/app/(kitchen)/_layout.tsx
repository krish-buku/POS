import React from 'react';
import { Redirect, Stack } from 'expo-router';
import { useTheme } from '../../shared/theme';
import { useAuthStore } from '../../features/auth/store';

export default function KitchenLayout() {
  const theme = useTheme();
  const { isAuthenticated, user, needsBusinessSelection } = useAuthStore();

  if (needsBusinessSelection) {
    return <Redirect href="/(auth)/select-business" />;
  }

  if (!isAuthenticated || !user?.businessId) {
    return <Redirect href="/(auth)/login" />;
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: theme.palette.neutral[50] },
        animation: 'slide_from_bottom',
      }}
    >
      <Stack.Screen name="queue" />
    </Stack>
  );
}
