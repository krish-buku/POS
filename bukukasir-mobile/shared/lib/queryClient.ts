import { QueryClient } from '@tanstack/react-query';
import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const QUERY_CACHE_KEY = 'bukukasir-offline-cache';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      gcTime: 7 * 24 * 60 * 60 * 1000, // 7 days
      retry: 1,
      networkMode: 'offlineFirst',
    },
    mutations: {
      networkMode: 'offlineFirst',
    },
  },
});

export const asyncStoragePersister = createAsyncStoragePersister({
  storage: AsyncStorage,
  key: QUERY_CACHE_KEY,
  throttleTime: 1000,
});

/**
 * Wipe all cached data + persisted storage.
 * Call on logout so the next user doesn't see the previous tenant's data,
 * and on business switch so stale empty responses (seeded later) are refetched.
 */
export async function clearQueryCache(): Promise<void> {
  queryClient.clear();
  try {
    await AsyncStorage.removeItem(QUERY_CACHE_KEY);
  } catch {
    /* ignore */
  }
}
