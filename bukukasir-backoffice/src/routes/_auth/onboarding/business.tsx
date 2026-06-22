import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { useAuth } from '@/lib/auth-context'
import { useTranslate } from '@/lib/i18n-context'
import { useOnboarding, type BusinessType } from '@/lib/onboarding-context'
import { useCreateBusiness, useUpdateBusiness, useCreateStaff } from '@/lib/api-hooks'
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

export const Route = createFileRoute('/_auth/onboarding/business')({
  component: OnboardingBusinessStep,
})

function OnboardingBusinessStep() {
  const t = useTranslate()
  const navigate = useNavigate()
  const { user, phone } = useAuth()
  const { draft, patch, patchBusiness, setStep } = useOnboarding()

  const createBusiness = useCreateBusiness()
  const updateBusiness = useUpdateBusiness()
  const createStaff = useCreateStaff()

  // Strip a leading +62 / 62 country-code and keep only up to 10 numeric digits.
  const sanitizePhone = (raw: string): string => {
    let digits = raw.replace(/\D/g, '')
    if (digits.startsWith('62')) digits = digits.slice(2)
    return digits.slice(0, 10)
  }

  const [form, setForm] = useState(() => ({
    name: draft.business.name,
    type: draft.business.type as BusinessType | '',
    address: draft.business.address ?? '',
    phonePrimary: sanitizePhone(draft.business.phone ?? ''),
    email: draft.business.email ?? '',
    logoUrl: draft.business.logoUrl ?? '',
    ownerName: draft.business.ownerName || user?.name || '',
    ownerPhone: sanitizePhone(draft.business.ownerPhone || phone || ''),
  }))

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    setStep('business')
  }, [setStep])

  const update = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }))
    if (errors[key as string]) {
      setErrors((prev) => {
        const next = { ...prev }
        delete next[key as string]
        return next
      })
    }
  }

  const validate = (): boolean => {
    const next: Record<string, string> = {}
    if (!form.name || form.name.trim().length < 2) {
      next.name = t('onboarding.business.error.nameRequired')
    }
    if (!form.type) {
      next.type = t('onboarding.business.error.typeRequired')
    }
    if (!form.ownerName || form.ownerName.trim().length < 2) {
      next.ownerName = t('onboarding.business.error.ownerNameRequired')
    }
    // Phone fields are optional, but if filled they must be exactly 10 digits.
    if (form.phonePrimary && form.phonePrimary.length !== 10) {
      next.phonePrimary = t('auth.phoneMinDigits')
    }
    if (form.ownerPhone && form.ownerPhone.length !== 10) {
      next.ownerPhone = t('auth.phoneMinDigits')
    }
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return

    setSubmitting(true)
    try {
      // Format the 10-digit local number into E.164 "+62XXXXXXXXXX" before
      // persisting. Empty strings are left undefined so the backend treats
      // them as "not provided".
      const fmtE164 = (digits: string) => (digits ? `+62${digits}` : undefined)
      const bizPhoneE164 = fmtE164(form.phonePrimary)
      const ownerPhoneE164 = fmtE164(form.ownerPhone)

      // Persist form to draft first
      patchBusiness({
        name: form.name.trim(),
        type: form.type as BusinessType,
        address: form.address.trim() || undefined,
        phone: bizPhoneE164,
        email: form.email.trim() || undefined,
        logoUrl: form.logoUrl.trim() || undefined,
        ownerName: form.ownerName.trim(),
        ownerPhone: ownerPhoneE164,
      })

      let businessId = draft.businessId
      if (!businessId) {
        const created = await createBusiness.mutateAsync({
          name: form.name.trim(),
          type: form.type as string,
          address: form.address.trim() || undefined,
          phone: bizPhoneE164,
          email: form.email.trim() || undefined,
          logoUrl: form.logoUrl.trim() || undefined,
        })
        businessId = created.id as string
        patch('businessId', businessId)
      } else {
        await updateBusiness.mutateAsync({
          id: businessId,
          name: form.name.trim(),
          type: form.type as string,
          address: form.address.trim() || undefined,
          phone: bizPhoneE164,
          email: form.email.trim() || undefined,
        })
      }

      if (!draft.ownerStaffId && businessId) {
        const owner = await createStaff.mutateAsync({
          name: form.ownerName.trim(),
          role: 'OWNER',
          businessId,
          phone: ownerPhoneE164 ?? '',
          pin: '',
          active: true,
        })
        patch('ownerStaffId', owner.id as string)
      }

      void navigate({ to: '/onboarding/menu' })
    } catch (err: any) {
      toast.error(err?.message || t('onboarding.business.createFailed'))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">
          {t('onboarding.business.title')}
        </h2>
        <p className="mt-1 text-muted-foreground">{t('onboarding.business.subtitle')}</p>
      </div>

      <div className="rounded-xl border bg-card p-6">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="md:col-span-2">
            <Label htmlFor="biz-name">
              {t('onboarding.business.nameLabel')} <span className="text-destructive">*</span>
            </Label>
            <Input
              id="biz-name"
              value={form.name}
              onChange={(e) => update('name', e.target.value)}
              placeholder={t('onboarding.business.namePlaceholder')}
              aria-invalid={!!errors.name}
              className="mt-1.5 w-full"
            />
            {errors.name && <p className="mt-1 text-xs text-destructive">{errors.name}</p>}
          </div>

          <div>
            <Label>
              {t('onboarding.business.typeLabel')} <span className="text-destructive">*</span>
            </Label>
            <Select
              value={form.type || undefined}
              onValueChange={(v) => {
                if (v) update('type', v as BusinessType)
              }}
            >
              <SelectTrigger className="mt-1.5 w-full" aria-invalid={!!errors.type}>
                <SelectValue placeholder={t('onboarding.business.typePlaceholder')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="restaurant">{t('onboarding.business.type.restaurant')}</SelectItem>
                <SelectItem value="cafe">{t('onboarding.business.type.cafe')}</SelectItem>
                <SelectItem value="retail">{t('onboarding.business.type.retail')}</SelectItem>
              </SelectContent>
            </Select>
            {errors.type && <p className="mt-1 text-xs text-destructive">{errors.type}</p>}
          </div>

          <div>
            <Label htmlFor="biz-phone">{t('onboarding.business.phoneLabel')}</Label>
            <div className="mt-1.5 flex gap-2">
              <div className="flex h-9 items-center rounded-md border border-input bg-muted px-3 text-sm font-medium text-muted-foreground">
                +62
              </div>
              <Input
                id="biz-phone"
                type="tel"
                inputMode="numeric"
                value={form.phonePrimary}
                onChange={(e) => update('phonePrimary', sanitizePhone(e.target.value))}
                maxLength={10}
                placeholder="8123456789"
                className="flex-1"
                aria-invalid={!!errors.phonePrimary}
              />
            </div>
            {errors.phonePrimary && (
              <p className="mt-1 text-xs text-destructive">{errors.phonePrimary}</p>
            )}
          </div>

          <div className="md:col-span-2">
            <Label htmlFor="biz-address">{t('onboarding.business.addressLabel')}</Label>
            <Input
              id="biz-address"
              value={form.address}
              onChange={(e) => update('address', e.target.value)}
              className="mt-1.5 w-full"
            />
          </div>

          <div>
            <Label htmlFor="biz-email">{t('onboarding.business.emailLabel')}</Label>
            <Input
              id="biz-email"
              type="email"
              value={form.email}
              onChange={(e) => update('email', e.target.value)}
              className="mt-1.5 w-full"
            />
          </div>

          <div>
            <Label htmlFor="biz-logo">{t('onboarding.business.logoLabel')}</Label>
            <Input
              id="biz-logo"
              value={form.logoUrl}
              onChange={(e) => update('logoUrl', e.target.value)}
              placeholder="https://..."
              className="mt-1.5 w-full"
            />
          </div>
        </div>
      </div>

      <div className="rounded-xl border bg-card p-6">
        <h3 className="mb-4 text-base font-semibold text-foreground">
          {t('onboarding.business.ownerSection')}
        </h3>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <Label htmlFor="owner-name">
              {t('onboarding.business.ownerName')} <span className="text-destructive">*</span>
            </Label>
            <Input
              id="owner-name"
              value={form.ownerName}
              onChange={(e) => update('ownerName', e.target.value)}
              aria-invalid={!!errors.ownerName}
              className="mt-1.5 w-full"
            />
            {errors.ownerName && (
              <p className="mt-1 text-xs text-destructive">{errors.ownerName}</p>
            )}
          </div>
          <div>
            <Label htmlFor="owner-phone">{t('onboarding.business.ownerPhone')}</Label>
            <div className="mt-1.5 flex gap-2">
              <div className="flex h-9 items-center rounded-md border border-input bg-muted px-3 text-sm font-medium text-muted-foreground">
                +62
              </div>
              <Input
                id="owner-phone"
                type="tel"
                inputMode="numeric"
                value={form.ownerPhone}
                onChange={(e) => update('ownerPhone', sanitizePhone(e.target.value))}
                maxLength={10}
                placeholder="8123456789"
                className="flex-1"
                aria-invalid={!!errors.ownerPhone}
              />
            </div>
            {errors.ownerPhone && (
              <p className="mt-1 text-xs text-destructive">{errors.ownerPhone}</p>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-end gap-3">
        <Button
          type="submit"
          disabled={submitting}
          className="h-10 min-w-32 bg-[#D4A726] text-white hover:bg-[#C0961F]"
        >
          {submitting ? t('common.saving') : t('onboarding.next')}
        </Button>
      </div>
    </form>
  )
}
