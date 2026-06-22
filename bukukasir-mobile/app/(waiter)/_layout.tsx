import React from 'react';
import { Redirect, Tabs } from 'expo-router';
import { useAuthStore } from '../../features/auth/store';

export default function WaiterLayout() {
  const { isAuthenticated, user, needsBusinessSelection } = useAuthStore();

  if (needsBusinessSelection) {
    return <Redirect href="/(auth)/select-business" />;
  }

  if (!isAuthenticated || !user?.businessId) {
    return <Redirect href="/(auth)/login" />;
  }

  return (
    <Tabs tabBar={() => null} screenOptions={{ headerShown: false }}>
      <Tabs.Screen name="my-tables" options={{ title: 'Meja saya' }} />
      <Tabs.Screen name="order" options={{ title: 'Order' }} />
      <Tabs.Screen name="transfer" options={{ title: 'Transfer' }} />
    </Tabs>
  );
}
