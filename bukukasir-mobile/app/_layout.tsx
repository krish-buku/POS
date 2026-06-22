import React from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { LogBox, StyleSheet } from 'react-native';
import { queryClient, asyncStoragePersister } from '../shared/lib/queryClient';

LogBox.ignoreLogs(['Sending `onAnimatedValueUpdate` with no listeners registered.']);

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={styles.container}>
      <PersistQueryClientProvider
        client={queryClient}
        persistOptions={{
          persister: asyncStoragePersister,
          maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
          dehydrateOptions: {
            shouldDehydrateQuery: (q) => q.state.status === 'success',
          },
        }}
      >
        <StatusBar style="light" />
        <Stack
          screenOptions={{
            headerShown: false,
            animation: 'fade',
          }}
        >
          <Stack.Screen name="index" />
          <Stack.Screen name="(auth)" />
          <Stack.Screen name="(cashier)" />
          <Stack.Screen name="(waiter)" />
          <Stack.Screen name="(kitchen)" />
        </Stack>
      </PersistQueryClientProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
