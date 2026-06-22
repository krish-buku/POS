import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useAuth } from '@/lib/auth-context'
import { useTranslate } from '@/lib/i18n-context'
import { useEffect } from 'react'

export const Route = createFileRoute('/')({
  component: IndexRedirect,
})

function IndexRedirect() {
  const { isAuthenticated, currentBusiness } = useAuth()
  const t = useTranslate()
  const navigate = useNavigate()

  useEffect(() => {
    if (!isAuthenticated) {
      void navigate({ to: '/login' })
    } else if (!currentBusiness) {
      void navigate({ to: '/select-business' })
    } else {
      void navigate({ to: '/dashboard' })
    }
  }, [isAuthenticated, currentBusiness, navigate])

  return (
    <div className="flex h-screen items-center justify-center">
      <div className="animate-pulse text-lg text-muted-foreground">
        {t('common.loading')}
      </div>
    </div>
  )
}
