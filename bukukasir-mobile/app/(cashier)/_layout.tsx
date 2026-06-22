import React from 'react';
import { Redirect, Tabs } from 'expo-router';
import { useAuthStore } from '../../features/auth/store';

export default function CashierLayout() {
  const { isAuthenticated, user, needsBusinessSelection } = useAuthStore();

  if (needsBusinessSelection) {
    return <Redirect href="/(auth)/select-business" />;
  }

  if (!isAuthenticated || !user?.businessId) {
    return <Redirect href="/(auth)/login" />;
  }

  return (
    <Tabs
      tabBar={() => null}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tabs.Screen name="order" options={{ title: 'Order' }} />
      <Tabs.Screen name="tables" options={{ title: 'Meja buka' }} />
      <Tabs.Screen name="payment" options={{ title: 'Pay' }} />
      <Tabs.Screen name="history" options={{ title: 'History' }} />
      <Tabs.Screen name="settings" options={{ title: 'Settings' }} />
      <Tabs.Screen name="transfer" options={{ title: 'Transfer' }} />
    </Tabs>
  );
}
