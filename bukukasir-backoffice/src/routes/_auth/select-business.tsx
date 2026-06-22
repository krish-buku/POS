import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth-context'
import { useTranslate } from '@/lib/i18n-context'
import { useBusinesses, useStaff, useMenuItems } from '@/lib/api-hooks'
import { readOnboardingDraft, clearOnboardingDraft } from '@/lib/onboarding-context'
import type { Business } from '@/lib/mock-data'
import { Button } from '@/components/ui/button'
import {
  Store,
  MapPin,
  Phone,
  Plus,
  ChevronRight,
  Building2,
  Coffee,
} from 'lucide-react'

export const Route = createFileRoute('/_auth/select-business')({
  component: SelectBusinessPage,
})

function SelectBusinessPage() {
  const { isAuthenticated, selectBusiness, user } = useAuth()
  const navigate = useNavigate()
  const t = useTranslate()
  const { data: businesses = [] } = useBusinesses()
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const { data: staffList = [] } = useStaff(selectedId ?? '')
  const { data: menuItems = [] } = useMenuItems(selectedId ?? '')

  useEffect(() => {
    if (!isAuthenticated) {
      void navigate({ to: '/login' })
    }
  }, [isAuthenticated, navigate])

  const resumeDraft = readOnboardingDraft()
  const canResume = Boolean(
    resumeDraft &&
      resumeDraft.businessId &&
      businesses.some((b) => b.id === resumeDraft.businessId)
  )
  // If draft references a business that no longer exists on the server, clean it up silently
  useEffect(() => {
    if (resumeDraft && resumeDraft.businessId && businesses.length > 0 && !canResume) {
      clearOnboardingDraft()
    }
  }, [businesses.length, canResume, resumeDraft])

  const selectedBusiness = selectedId
    ? businesses.find((b) => b.id === selectedId)
    : null

  const handleEnter = () => {
    if (!selectedId || !selectedBusiness) return
    selectBusiness(selectedId, selectedBusiness as any)
    void navigate({ to: '/dashboard' })
  }

  const getBusinessIcon = (type: Business['type']) => {
    switch (type) {
      case 'cafe':
        return <Coffee className="h-5 w-5" />
      default:
        return <Building2 className="h-5 w-5" />
    }
  }

  return (
    <div className="flex w-full items-center justify-center px-6 py-12">
      <div className="w-full max-w-4xl">
        {/* Header */}
        <div className="mb-8 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#1E3A6B]">
            <Store className="h-6 w-6 text-white" />
          </div>
          <h1 className="text-2xl font-bold"><span className="text-[#1E3A6B]">Buku</span><span className="text-[#D4A726]">Kasir</span></h1>
        </div>

        <div className="mb-8">
          <h2 className="text-2xl font-bold text-foreground">
            {t('auth.selectBusiness')}
          </h2>
          <p className="mt-1 text-muted-foreground">
            {t('auth.welcomeBack', { name: user?.name ?? '' })}
          </p>
        </div>

        {canResume && resumeDraft && (
          <div className="mb-6 flex flex-col items-start gap-3 rounded-xl border border-[#D4A726]/40 bg-[#FDF8E8] p-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-foreground">
                {t('onboarding.resumeBanner', { name: resumeDraft.business.name || 'your business' })}
              </p>
              <p className="text-xs text-muted-foreground">
                {t('onboarding.step.' + resumeDraft.lastStep as any)}
              </p>
            </div>
            <Button
              onClick={() => void navigate({ to: `/onboarding/${resumeDraft.lastStep}` })}
              className="bg-[#D4A726] text-white hover:bg-[#C0961F]"
            >
              {t('onboarding.resumeAction')}
            </Button>
          </div>
        )}

        <div className="flex flex-col gap-8 lg:flex-row">
          {/* Business List */}
          <div className="flex-1 space-y-3" role="listbox" aria-label={t('auth.selectBusiness')}>
            {businesses.map((business) => (
              <button
                key={business.id}
                role="option"
                aria-selected={selectedId === business.id}
                onClick={() => setSelectedId(business.id)}
                className={`flex w-full items-center gap-4 rounded-xl border-2 p-4 text-left transition-all ${
                  selectedId === business.id
                    ? 'border-[#D4A726] bg-[#FDF8E8] ring-2 ring-[#D4A726]/20'
                    : 'border-border bg-card hover:border-[#D4A726]/40 hover:bg-[#FDF8E8]/50'
                }`}
              >
                <div
                  className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${
                    selectedId === business.id
                      ? 'bg-[#1E3A6B] text-white'
                      : 'bg-[#EBF0F7] text-[#1E3A6B]'
                  }`}
                >
                  {getBusinessIcon(business.type)}
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold text-foreground">
                    {business.name}
                  </h3>
                  <p className="truncate text-sm text-muted-foreground">
                    {business.address}
                  </p>
                </div>
                <ChevronRight
                  className={`h-5 w-5 shrink-0 ${
                    selectedId === business.id
                      ? 'text-[#D4A726]'
                      : 'text-muted-foreground'
                  }`}
                />
              </button>
            ))}

            {/* Add Business Link */}
            <Link
              to="/onboarding/business"
              className="flex w-full items-center gap-4 rounded-xl border-2 border-dashed border-border p-4 text-left transition-colors hover:border-[#D4A726]/40 hover:bg-[#FDF8E8]/50"
            >
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-muted text-muted-foreground">
                <Plus className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">
                  {t('auth.addBusiness')}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {t('auth.addBusinessDesc')}
                </p>
              </div>
            </Link>
          </div>

          {/* Selected Business Detail */}
          <div className="flex-1">
            {selectedBusiness ? (
              <div className="rounded-xl border bg-card p-6">
                <div className="mb-6 flex items-center gap-4">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#1E3A6B] text-white">
                    {getBusinessIcon(selectedBusiness.type)}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-foreground">
                      {selectedBusiness.name}
                    </h3>
                    <span className="inline-block rounded-full bg-[#EBF0F7] px-2.5 py-0.5 text-xs font-medium text-[#1E3A6B] capitalize">
                      {selectedBusiness.type}
                    </span>
                  </div>
                </div>

                <div className="mb-6 space-y-3">
                  <div className="flex items-start gap-3 text-sm">
                    <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                    <span className="text-foreground">
                      {selectedBusiness.address}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <Phone className="h-4 w-4 shrink-0 text-muted-foreground" />
                    <span className="text-foreground">
                      {selectedBusiness.phone}
                    </span>
                  </div>
                </div>

                <div className="mb-6 rounded-lg bg-muted/50 p-4">
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div>
                      <p className="text-2xl font-bold text-[#1E3A6B]">{staffList.length}</p>
                      <p className="text-xs text-muted-foreground">{t('nav.staff')}</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-[#1E3A6B]">{menuItems.length}</p>
                      <p className="text-xs text-muted-foreground">{t('nav.menu')}</p>
                    </div>
                  </div>
                </div>

                <Button
                  onClick={handleEnter}
                  className="h-11 w-full bg-[#D4A726] text-base text-white hover:bg-[#C0961F]"
                >
                  {t('auth.enterBusiness')}
                </Button>
              </div>
            ) : (
              <div className="flex h-full items-center justify-center rounded-xl border-2 border-dashed border-border p-12">
                <div className="text-center">
                  <Store className="mx-auto mb-4 h-12 w-12 text-muted-foreground/50" />
                  <p className="text-muted-foreground">
                    {t('auth.selectToView')}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
