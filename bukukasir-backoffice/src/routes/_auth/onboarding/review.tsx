import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { useTranslate } from '@/lib/i18n-context'
import { useAuth } from '@/lib/auth-context'
import { useOnboarding } from '@/lib/onboarding-context'
import { api } from '@/lib/api'
import type { Business } from '@/lib/mock-data'
import { Button } from '@/components/ui/button'
import { Check } from 'lucide-react'

export const Route = createFileRoute('/_auth/onboarding/review')({
  component: OnboardingReviewStep,
})

function OnboardingReviewStep() {
  const t = useTranslate()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { selectBusiness } = useAuth()
  const { draft, setStep, reset } = useOnboarding()
  const [finishing, setFinishing] = useState(false)

  useEffect(() => {
    setStep('review')
  }, [setStep])

  const handleFinish = async () => {
    if (!draft.businessId) {
      toast.error(t('onboarding.review.missingBusiness'))
      return
    }
    setFinishing(true)
    try {
      await queryClient.invalidateQueries({ queryKey: ['businesses'] })
      let fresh: Business | null = null
      try {
        fresh = (await queryClient.fetchQuery({
          queryKey: ['business', draft.businessId],
          queryFn: () => api.getBusiness(draft.businessId!),
        })) as Business
      } catch {
        // Fallback: build a Business-shaped object from the draft
        fresh = {
          id: draft.businessId,
          name: draft.business.name,
          address: draft.business.address ?? '',
          phone: draft.business.phone ?? '',
          type: (draft.business.type || 'restaurant') as Business['type'],
          createdAt: new Date().toISOString(),
        } as Business
      }

      selectBusiness(draft.businessId, fresh as Business)
      const bizName = fresh?.name ?? draft.business.name
      reset()
      toast.success(t('onboarding.review.success', { name: bizName }))
      void navigate({ to: '/dashboard' })
    } catch (err: any) {
      toast.error(err?.message || t('toast.error'))
    } finally {
      setFinishing(false)
    }
  }

  const skippedLabel = t('onboarding.review.skippedLabel')

  const menuSummary = draft.menu.skipped
    ? skippedLabel
    : `${draft.menu.categories.length} categories · ${draft.menu.items.length} items`

  const paymentsSummary = draft.payments.skipped
    ? `${skippedLabel} (Cash seeded)`
    : draft.payments.methods.map((m) => m.name).join(', ') || 'Cash'

  const staffSummary = draft.staff.skipped
    ? `${skippedLabel} (Owner only)`
    : `${draft.staff.members.length + 1} members`

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">{t('onboarding.review.title')}</h2>
        <p className="mt-1 text-muted-foreground">{t('onboarding.review.subtitle')}</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <SummaryCard
          title={t('onboarding.review.businessSection')}
          onEdit={() => void navigate({ to: '/onboarding/business' })}
          editLabel={t('onboarding.review.edit')}
        >
          <dl className="space-y-1.5 text-sm">
            <Row label={t('business.name')} value={draft.business.name} />
            <Row label={t('common.type')} value={draft.business.type} />
            <Row label={t('business.address')} value={draft.business.address || '—'} />
            <Row label={t('common.phone')} value={draft.business.phone || '—'} />
            <Row label={t('business.owner')} value={draft.business.ownerName} />
          </dl>
        </SummaryCard>

        <SummaryCard
          title={t('onboarding.review.menuSection')}
          onEdit={() => void navigate({ to: '/onboarding/menu' })}
          editLabel={t('onboarding.review.edit')}
        >
          <p className="text-sm text-foreground">{menuSummary}</p>
        </SummaryCard>

        <SummaryCard
          title={t('onboarding.review.paymentsSection')}
          onEdit={() => void navigate({ to: '/onboarding/payments' })}
          editLabel={t('onboarding.review.edit')}
        >
          <p className="text-sm text-foreground">{paymentsSummary}</p>
        </SummaryCard>

        <SummaryCard
          title={t('onboarding.review.staffSection')}
          onEdit={() => void navigate({ to: '/onboarding/staff' })}
          editLabel={t('onboarding.review.edit')}
        >
          <p className="text-sm text-foreground">{staffSummary}</p>
        </SummaryCard>
      </div>

      <div className="flex items-center justify-between">
        <Button
          type="button"
          variant="outline"
          onClick={() => void navigate({ to: '/onboarding/staff' })}
          disabled={finishing}
        >
          {t('onboarding.back')}
        </Button>
        <Button
          type="button"
          onClick={handleFinish}
          disabled={finishing}
          className="min-w-40 bg-[#D4A726] text-white hover:bg-[#C0961F]"
        >
          <Check className="h-4 w-4" />
          {finishing ? t('onboarding.review.finishing') : t('onboarding.review.finish')}
        </Button>
      </div>
    </div>
  )
}

function SummaryCard({
  title,
  children,
  onEdit,
  editLabel,
}: {
  title: string
  children: React.ReactNode
  onEdit: () => void
  editLabel: string
}) {
  return (
    <div className="rounded-xl border bg-card p-5">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
        <button
          type="button"
          onClick={onEdit}
          className="text-xs font-medium text-[#1E3A6B] hover:underline"
        >
          {editLabel}
        </button>
      </div>
      {children}
    </div>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-3">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="truncate text-right font-medium text-foreground">{value}</dd>
    </div>
  )
}
