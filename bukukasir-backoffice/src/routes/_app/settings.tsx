import { createFileRoute, Outlet } from '@tanstack/react-router'
import { useTranslate } from '@/lib/i18n-context'

export const Route = createFileRoute('/_app/settings')({
  component: SettingsLayout,
})

function SettingsLayout() {
  const t = useTranslate()
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">{t('settings.title')}</h1>
        <p className="text-sm text-muted-foreground">
          {t('settings.subtitle')}
        </p>
      </div>
      <Outlet />
    </div>
  )
}
