import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { useTranslate } from '@/lib/i18n-context'
import { useOnboarding, type PaymentMethodType } from '@/lib/onboarding-context'
import { useCreatePaymentMethod } from '@/lib/api-hooks'
import { api } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Banknote, CreditCard, QrCode, Smartphone } from 'lucide-react'

export const Route = createFileRoute('/_auth/onboarding/payments')({
  component: OnboardingPaymentsStep,
})

interface MethodRow {
  key: string
  type: PaymentMethodType
  label: string
  icon: React.ReactNode
  locked?: boolean
  hasCustomName?: boolean
}

function OnboardingPaymentsStep() {
  const t = useTranslate()
  const navigate = useNavigate()
  const { draft, patch, setStep } = useOnboarding()
  const createPaymentMethod = useCreatePaymentMethod()

  const rows: MethodRow[] = [
    { key: 'cash', type: 'CASH', label: t('onboarding.payments.method.cash'), icon: <Banknote className="h-5 w-5" />, locked: true },
    { key: 'card', type: 'CARD', label: t('onboarding.payments.method.card'), icon: <CreditCard className="h-5 w-5" /> },
    { key: 'qris', type: 'QRIS', label: t('onboarding.payments.method.qris'), icon: <QrCode className="h-5 w-5" /> },
    { key: 'ewallet', type: 'EWALLET', label: t('onboarding.payments.method.ewallet'), icon: <Smartphone className="h-5 w-5" />, hasCustomName: true },
  ]

  // Initialize enabled state from draft
  const [enabled, setEnabled] = useState<Record<string, boolean>>(() => {
    const init: Record<string, boolean> = { cash: true }
    for (const r of rows) {
      if (r.key === 'cash') continue
      init[r.key] = draft.payments.methods.some((m) => m.type === r.type && m.active)
    }
    return init
  })
  const [ewalletName, setEwalletName] = useState(() => {
    const existing = draft.payments.methods.find((m) => m.type === 'EWALLET')
    return existing?.name || ''
  })
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    setStep('payments')
  }, [setStep])

  const commit = async (skipMode: boolean) => {
    if (!draft.businessId) {
      toast.error(t('onboarding.review.missingBusiness'))
      return
    }
    setSubmitting(true)
    try {
      // Fetch existing to avoid duplicates on re-entry
      let existing: any[] = []
      try {
        existing = (await api.getPaymentMethods(draft.businessId)) || []
      } catch {
        existing = []
      }

      const hasType = (type: PaymentMethodType) =>
        existing.some((m) => (m.type || '').toUpperCase() === type)

      const createdIds: string[] = [...(draft.createdPaymentMethodIds ?? [])]

      const toCreate: Array<{ name: string; type: PaymentMethodType }> = []

      if (skipMode) {
        if (!hasType('CASH')) toCreate.push({ name: 'Cash', type: 'CASH' })
      } else {
        // Always ensure cash (locked on)
        if (!hasType('CASH')) toCreate.push({ name: 'Cash', type: 'CASH' })
        if (enabled.card && !hasType('CARD')) toCreate.push({ name: 'Card', type: 'CARD' })
        if (enabled.qris && !hasType('QRIS')) toCreate.push({ name: 'QRIS', type: 'QRIS' })
        if (enabled.ewallet && !hasType('EWALLET')) {
          const name = ewalletName.trim() || 'E-Wallet'
          toCreate.push({ name, type: 'EWALLET' })
        }
      }

      for (const item of toCreate) {
        try {
          const created = await createPaymentMethod.mutateAsync({
            name: item.name,
            type: item.type,
            active: true,
            businessId: draft.businessId,
          })
          if (created?.id) createdIds.push(created.id)
        } catch (err: any) {
          toast.error(err?.message || t('toast.error'))
          setSubmitting(false)
          return
        }
      }

      patch('createdPaymentMethodIds', createdIds)
      patch('payments', {
        methods: [
          { tempKey: 'cash', name: 'Cash', type: 'CASH', active: true },
          ...(enabled.card ? [{ tempKey: 'card', name: 'Card', type: 'CARD' as const, active: true }] : []),
          ...(enabled.qris ? [{ tempKey: 'qris', name: 'QRIS', type: 'QRIS' as const, active: true }] : []),
          ...(enabled.ewallet
            ? [{ tempKey: 'ewallet', name: ewalletName.trim() || 'E-Wallet', type: 'EWALLET' as const, active: true }]
            : []),
        ],
        skipped: skipMode,
      })

      void navigate({ to: '/onboarding/staff' })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">{t('onboarding.payments.title')}</h2>
        <p className="mt-1 text-muted-foreground">{t('onboarding.payments.subtitle')}</p>
      </div>

      <div className="space-y-3 rounded-xl border bg-card p-4">
        {rows.map((row) => {
          const isOn = row.locked || enabled[row.key]
          return (
            <div
              key={row.key}
              className="flex items-center gap-4 rounded-lg border bg-background p-4"
            >
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-[#EBF0F7] text-[#1E3A6B]">
                {row.icon}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-foreground">{row.label}</p>
                  {row.locked && (
                    <span className="rounded-full bg-[#FDF8E8] px-2 py-0.5 text-[10px] font-semibold text-[#C0961F]">
                      {t('onboarding.payments.cashLocked')}
                    </span>
                  )}
                </div>
                {row.hasCustomName && enabled[row.key] && (
                  <div className="mt-2">
                    <Label htmlFor={`pm-${row.key}-name`} className="text-xs text-muted-foreground">
                      {t('payments.methodName')}
                    </Label>
                    <Input
                      id={`pm-${row.key}-name`}
                      value={ewalletName}
                      onChange={(e) => setEwalletName(e.target.value)}
                      placeholder={t('payments.methodPlaceholder')}
                      className="mt-1 max-w-xs"
                    />
                  </div>
                )}
              </div>
              <Switch
                checked={isOn}
                onCheckedChange={(v) => {
                  if (row.locked) return
                  setEnabled((prev) => ({ ...prev, [row.key]: v }))
                }}
                disabled={row.locked}
              />
            </div>
          )
        })}
      </div>

      <p className="text-sm text-muted-foreground">{t('onboarding.payments.skipHint')}</p>

      <div className="flex items-center justify-between">
        <Button
          type="button"
          variant="outline"
          onClick={() => void navigate({ to: '/onboarding/menu' })}
          disabled={submitting}
        >
          {t('onboarding.back')}
        </Button>
        <div className="flex gap-2">
          <Button type="button" variant="ghost" onClick={() => void commit(true)} disabled={submitting}>
            {t('onboarding.skip')}
          </Button>
          <Button
            type="button"
            onClick={() => void commit(false)}
            disabled={submitting}
            className="min-w-32 bg-[#D4A726] text-white hover:bg-[#C0961F]"
          >
            {submitting ? t('common.saving') : t('onboarding.next')}
          </Button>
        </div>
      </div>
    </div>
  )
}
