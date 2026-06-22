import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { useTranslate } from '@/lib/i18n-context'
import { useOnboarding, type DraftStaffMember, type OnboardingStaffRole } from '@/lib/onboarding-context'
import { useCreateStaff } from '@/lib/api-hooks'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Plus, Trash2 } from 'lucide-react'

export const Route = createFileRoute('/_auth/onboarding/staff')({
  component: OnboardingStaffStep,
})

const ROLES: OnboardingStaffRole[] = ['MANAGER', 'CASHIER', 'WAITER', 'KITCHEN']

function makeRow(): DraftStaffMember {
  return {
    tempKey: `staff-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    name: '',
    role: 'CASHIER',
    phone: '',
    email: '',
    pin: '',
  }
}

function OnboardingStaffStep() {
  const t = useTranslate()
  const navigate = useNavigate()
  const { draft, patch, setStep } = useOnboarding()
  const createStaff = useCreateStaff()

  const [rows, setRows] = useState<DraftStaffMember[]>(() =>
    draft.staff.members.length > 0 ? draft.staff.members : [makeRow()]
  )
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    setStep('staff')
  }, [setStep])

  const updateRow = (key: string, partial: Partial<DraftStaffMember>) => {
    setRows((prev) => prev.map((r) => (r.tempKey === key ? { ...r, ...partial } : r)))
  }

  const addRow = () => setRows((prev) => [...prev, makeRow()])
  const removeRow = (key: string) => setRows((prev) => prev.filter((r) => r.tempKey !== key))

  const commit = async (skipMode: boolean) => {
    if (!draft.businessId) {
      toast.error(t('onboarding.review.missingBusiness'))
      return
    }
    setSubmitting(true)
    try {
      if (skipMode) {
        patch('staff', { members: [], skipped: true })
        void navigate({ to: '/onboarding/review' })
        return
      }

      const validRows = rows.filter((r) => r.name.trim().length > 0)
      const createdIds: string[] = [...(draft.createdStaffIds ?? [])]

      for (const row of validRows) {
        try {
          const created = await createStaff.mutateAsync({
            name: row.name.trim(),
            role: row.role,
            businessId: draft.businessId,
            phone: row.phone?.trim() || '',
            pin: row.pin?.trim() || '',
            active: true,
          })
          if (created?.id) createdIds.push(created.id)
        } catch (err: any) {
          toast.error(err?.message || t('toast.error'))
          setSubmitting(false)
          return
        }
      }

      patch('createdStaffIds', createdIds)
      patch('staff', { members: validRows, skipped: false })
      void navigate({ to: '/onboarding/review' })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">{t('onboarding.staff.title')}</h2>
        <p className="mt-1 text-muted-foreground">{t('onboarding.staff.subtitle')}</p>
      </div>

      <div className="rounded-xl border bg-[#FDF8E8] p-3 text-sm text-[#8B6C17]">
        {t('onboarding.staff.ownerNote')}
      </div>

      <div className="rounded-xl border bg-card">
        <div className="divide-y">
          {rows.map((row) => (
            <div key={row.tempKey} className="grid gap-3 p-4 md:grid-cols-[1.3fr_1fr_1fr_1fr_1fr_auto]">
              <div>
                <Label className="text-xs">{t('common.name')}</Label>
                <Input
                  value={row.name}
                  onChange={(e) => updateRow(row.tempKey, { name: e.target.value })}
                  placeholder={t('staff.fullName')}
                  className="mt-1"
                />
              </div>
              <div>
                <Label className="text-xs">{t('onboarding.staff.roleLabel')}</Label>
                <Select
                  value={row.role}
                  onValueChange={(v) => {
                    if (v) updateRow(row.tempKey, { role: v as OnboardingStaffRole })
                  }}
                >
                  <SelectTrigger className="mt-1 w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ROLES.map((r) => (
                      <SelectItem key={r} value={r}>
                        {t(`onboarding.staff.role.${r.toLowerCase()}` as any)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs">{t('common.phone')}</Label>
                <Input
                  value={row.phone ?? ''}
                  onChange={(e) => updateRow(row.tempKey, { phone: e.target.value })}
                  className="mt-1"
                />
              </div>
              <div>
                <Label className="text-xs">Email</Label>
                <Input
                  type="email"
                  value={row.email ?? ''}
                  onChange={(e) => updateRow(row.tempKey, { email: e.target.value })}
                  className="mt-1"
                />
              </div>
              <div>
                <Label className="text-xs">PIN</Label>
                <Input
                  value={row.pin ?? ''}
                  onChange={(e) => updateRow(row.tempKey, { pin: e.target.value.replace(/\D/g, '').slice(0, 6) })}
                  placeholder="1234"
                  className="mt-1"
                />
              </div>
              <div className="flex items-end">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeRow(row.tempKey)}
                  disabled={rows.length <= 1}
                  aria-label={t('common.delete')}
                >
                  <Trash2 className="h-4 w-4 text-muted-foreground" />
                </Button>
              </div>
            </div>
          ))}
        </div>
        <div className="border-t p-3">
          <Button type="button" variant="outline" size="sm" onClick={addRow}>
            <Plus className="h-4 w-4" />
            {t('onboarding.staff.addMember')}
          </Button>
        </div>
      </div>

      <p className="text-sm text-muted-foreground">
        {t('onboarding.staff.pinHelp')} · {t('onboarding.staff.skipHint')}
      </p>

      <div className="flex items-center justify-between">
        <Button
          type="button"
          variant="outline"
          onClick={() => void navigate({ to: '/onboarding/payments' })}
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
