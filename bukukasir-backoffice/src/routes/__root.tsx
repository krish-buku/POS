import { createRootRoute, Outlet } from '@tanstack/react-router'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'sonner'
import { AuthProvider } from '@/lib/auth-context'
import { I18nProvider } from '@/lib/i18n-context'
import { ErrorBoundary } from '@/components/error-boundary'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      retry: 1,
    },
  },
})

export const Route = createRootRoute({
  component: RootComponent,
})

function RootComponent() {
  return (
    <QueryClientProvider client={queryClient}>
      <I18nProvider>
        <AuthProvider>
          <ErrorBoundary>
            <Outlet />
          </ErrorBoundary>
          <Toaster position="top-right" richColors closeButton />
        </AuthProvider>
      </I18nProvider>
    </QueryClientProvider>
  )
}
