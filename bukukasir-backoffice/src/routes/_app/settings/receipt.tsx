import { createFileRoute } from '@tanstack/react-router'
import { useState, useEffect, useRef } from 'react'
import { toast } from 'sonner'
import { formatRupiah } from '@/lib/mock-data'
import { useTranslate } from '@/lib/i18n-context'
import { useAuth } from '@/lib/auth-context'
import { useBusiness, useReceiptTemplate, useUpdateReceiptTemplate } from '@/lib/api-hooks'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Receipt,
  Upload,
  Save,
} from 'lucide-react'

export const Route = createFileRoute('/_app/settings/receipt')({
  component: ReceiptConfigPage,
})

function ReceiptConfigPage() {
  const { currentBusiness } = useAuth()
  const businessId = currentBusiness?.id ?? 'biz-001'
  const { data: business } = useBusiness(businessId)
  const { data: template } = useReceiptTemplate(businessId)
  const updateTemplate = useUpdateReceiptTemplate()
  const t = useTranslate()

  const [businessName, setBusinessName] = useState('')
  const [address, setAddress] = useState('')
  const [phone, setPhone] = useState('')
  const [headerCustomText, setHeaderCustomText] = useState(() => t('receipt.defaultHeaderText' as any))
  const [thankYouMessage, setThankYouMessage] = useState(() => t('receipt.defaultThankYou' as any))
  const [returnPolicy, setReturnPolicy] = useState(() => t('receipt.defaultReturnPolicy' as any))
  const [footerCustomText, setFooterCustomText] = useState(() => t('receipt.defaultFooterText' as any))
  const [paperSize, setPaperSize] = useState<'58mm' | '80mm'>('58mm')
  const [fontSize, setFontSize] = useState('medium')
  const [showTax, setShowTax] = useState(true)
  const [showStaffName, setShowStaffName] = useState(true)
  const [showOrderTime, setShowOrderTime] = useState(true)
  const [autoPrint, setAutoPrint] = useState(false)
  const [duplicateCopy, setDuplicateCopy] = useState(false)
  const [logoUrl, setLogoUrl] = useState<string | null>(null)
  const logoInputRef = useRef<HTMLInputElement>(null)

  // Load saved logo from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(`receipt-logo-${businessId}`)
      if (saved) setLogoUrl(saved)
    } catch { /* ignore */ }
  }, [businessId])

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 500 * 1024) {
      toast.error(t('receipt.logoTooLarge' as any) || 'File too large (max 500KB)')
      return
    }
    if (!file.type.startsWith('image/')) {
      toast.error(t('receipt.logoInvalidType' as any) || 'Invalid file type')
      return
    }
    const reader = new FileReader()
    reader.onload = () => {
      const dataUrl = reader.result as string
      setLogoUrl(dataUrl)
      try { localStorage.setItem(`receipt-logo-${businessId}`, dataUrl) } catch { /* ignore */ }
      toast.success(t('receipt.logoUploaded' as any) || 'Logo uploaded')
    }
    reader.readAsDataURL(file)
  }

  useEffect(() => {
    if (business) {
      setBusinessName(business.name ?? '')
      setAddress(business.address ?? '')
      setPhone(business.phone ?? '')
    }
  }, [business])

  useEffect(() => {
    if (template) {
      setHeaderCustomText(template.headerText ?? headerCustomText)
      setFooterCustomText(template.footerText ?? footerCustomText)
      setShowTax(template.showTaxDetails ?? showTax)
      setPaperSize(template.paperWidth ?? paperSize)
      if (template.thankYouMessage) setThankYouMessage(template.thankYouMessage)
      if (template.returnPolicy) setReturnPolicy(template.returnPolicy)
      if (template.fontSize) setFontSize(template.fontSize)
      if (template.showStaffName !== undefined) setShowStaffName(template.showStaffName)
      if (template.showOrderTime !== undefined) setShowOrderTime(template.showOrderTime)
      if (template.autoPrint !== undefined) setAutoPrint(template.autoPrint)
      if (template.duplicateCopy !== undefined) setDuplicateCopy(template.duplicateCopy)
    }
  }, [template])

  const handleSave = () => {
    updateTemplate.mutate({
      id: template?.id,
      businessId,
      headerText: headerCustomText,
      footerText: footerCustomText,
      showLogo: true,
      showAddress: true,
      showTaxDetails: showTax,
      paperWidth: paperSize,
      thankYouMessage,
      returnPolicy,
      fontSize,
      showStaffName,
      showOrderTime,
      autoPrint,
      duplicateCopy,
    }, {
      onSuccess: () => toast.success(t('toast.saved')),
      onError: (e: any) => toast.error(e?.message || t('toast.error')),
    })
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        {/* Settings Panel */}
        <div className="space-y-6">
          {/* Header Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Receipt className="h-5 w-5 text-blue-600" />
                {t('receipt.headerSection')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>{t('receipt.logo')}</Label>
                <input
                  ref={logoInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/jpg"
                  className="hidden"
                  onChange={handleLogoUpload}
                />
                <button
                  type="button"
                  onClick={() => logoInputRef.current?.click()}
                  className="flex h-24 w-24 items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/25 bg-muted/50 cursor-pointer hover:border-muted-foreground/50 transition-colors overflow-hidden"
                >
                  {logoUrl ? (
                    <img src={logoUrl} alt="Logo" className="h-full w-full object-contain" />
                  ) : (
                    <Upload className="h-6 w-6 text-muted-foreground" />
                  )}
                </button>
                {logoUrl && (
                  <button
                    type="button"
                    className="text-xs text-destructive hover:underline"
                    onClick={() => {
                      setLogoUrl(null)
                      try { localStorage.removeItem(`receipt-logo-${businessId}`) } catch { /* ignore */ }
                    }}
                  >
                    {t('common.delete' as any) || 'Remove'}
                  </button>
                )}
                <p className="text-xs text-muted-foreground">
                  {t('receipt.logoHint')}
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="receipt-biz-name">{t('business.name')}</Label>
                <Input
                  id="receipt-biz-name"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="receipt-address">{t('business.address')}</Label>
                <Textarea
                  id="receipt-address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  rows={2}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="receipt-phone">{t('common.phone')}</Label>
                <Input
                  id="receipt-phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="receipt-header-text">{t('receipt.customHeader')}</Label>
                <Textarea
                  id="receipt-header-text"
                  value={headerCustomText}
                  onChange={(e) => {
                    const lines = e.target.value.split('\n')
                    if (lines.length <= 5) setHeaderCustomText(e.target.value)
                  }}
                  rows={3}
                  placeholder={t('receipt.customHeaderPlaceholder')}
                />
                <p className={`text-xs ${headerCustomText.split('\n').length >= 5 ? 'text-orange-500 font-medium' : 'text-muted-foreground'}`}>
                  {t('receipt.lines', { count: headerCustomText.split('\n').length })}
                  {headerCustomText.split('\n').length >= 5 && ` — ${t('receipt.lineLimitReached' as any)}`}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Footer Section */}
          <Card>
            <CardHeader>
              <CardTitle>{t('receipt.footer')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="receipt-thankyou">{t('receipt.thankYou')}</Label>
                <Input
                  id="receipt-thankyou"
                  value={thankYouMessage}
                  onChange={(e) => setThankYouMessage(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="receipt-return">{t('receipt.returnPolicy')}</Label>
                <Input
                  id="receipt-return"
                  value={returnPolicy}
                  onChange={(e) => setReturnPolicy(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="receipt-footer-text">{t('receipt.customFooter')}</Label>
                <Textarea
                  id="receipt-footer-text"
                  value={footerCustomText}
                  onChange={(e) => {
                    const lines = e.target.value.split('\n')
                    if (lines.length <= 10) setFooterCustomText(e.target.value)
                  }}
                  rows={4}
                  placeholder={t('receipt.customFooterPlaceholder')}
                />
                <p className={`text-xs ${footerCustomText.split('\n').length >= 10 ? 'text-orange-500 font-medium' : 'text-muted-foreground'}`}>
                  {t('receipt.footerLines', { count: footerCustomText.split('\n').length })}
                  {footerCustomText.split('\n').length >= 10 && ` — ${t('receipt.lineLimitReached' as any)}`}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Receipt Settings */}
          <Card>
            <CardHeader>
              <CardTitle>{t('receipt.settings')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>{t('receipt.paperSize')}</Label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="paper-size"
                      value="58mm"
                      checked={paperSize === '58mm'}
                      onChange={() => setPaperSize('58mm')}
                      className="h-4 w-4 accent-blue-600"
                    />
                    <span className="text-sm">58mm</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="paper-size"
                      value="80mm"
                      checked={paperSize === '80mm'}
                      onChange={() => setPaperSize('80mm')}
                      className="h-4 w-4 accent-blue-600"
                    />
                    <span className="text-sm">80mm</span>
                  </label>
                </div>
              </div>

              <div className="space-y-2">
                <Label>{t('receipt.fontSize')}</Label>
                <Select value={fontSize} onValueChange={(v) => { if (v) setFontSize(v) }}>
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="small">{t('receipt.fontSmall')}</SelectItem>
                    <SelectItem value="medium">{t('receipt.fontMedium')}</SelectItem>
                    <SelectItem value="large">{t('receipt.fontLarge')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Separator />

              <div className="space-y-4">
                <ToggleRow
                  label={t('receipt.showTax')}
                  description={t('receipt.showTaxDesc')}
                  checked={showTax}
                  onCheckedChange={setShowTax}
                />
                <ToggleRow
                  label={t('receipt.showStaff')}
                  description={t('receipt.showStaffDesc')}
                  checked={showStaffName}
                  onCheckedChange={setShowStaffName}
                />
                <ToggleRow
                  label={t('receipt.showTime')}
                  description={t('receipt.showTimeDesc')}
                  checked={showOrderTime}
                  onCheckedChange={setShowOrderTime}
                />
                <ToggleRow
                  label={t('receipt.autoPrint')}
                  description={t('receipt.autoPrintDesc')}
                  checked={autoPrint}
                  onCheckedChange={setAutoPrint}
                />
                <ToggleRow
                  label={t('receipt.duplicate')}
                  description={t('receipt.duplicateDesc')}
                  checked={duplicateCopy}
                  onCheckedChange={setDuplicateCopy}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Preview Panel */}
        <div className="lg:sticky lg:top-20">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">{t('receipt.preview')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div
                className="mx-auto rounded-md border bg-white p-4 font-mono text-[10px] leading-tight text-black shadow-inner"
                style={{ maxWidth: paperSize === '58mm' ? '220px' : '280px' }}
              >
                {/* Header */}
                <div className="text-center space-y-0.5">
                  {logoUrl ? (
                    <img src={logoUrl} alt="Logo" className="mx-auto mb-1 h-10 w-10 object-contain" />
                  ) : (
                    <div className="mx-auto mb-1 flex h-8 w-8 items-center justify-center rounded bg-gray-200 text-[8px] text-gray-500">
                      LOGO
                    </div>
                  )}
                  <div className="font-bold text-xs">{businessName}</div>
                  <div>{address}</div>
                  <div>{t('receipt.previewPhone')}: {phone}</div>
                  {headerCustomText && (
                    <div className="mt-1 whitespace-pre-line">{headerCustomText}</div>
                  )}
                </div>

                <div className="my-2 border-t border-dashed border-gray-400" />

                {/* Order Info */}
                <div className="space-y-0.5">
                  <div className="flex justify-between">
                    <span>{t('receipt.previewOrderNo')}:</span>
                    <span>ORD-20260328-001</span>
                  </div>
                  {showOrderTime && (
                    <div className="flex justify-between">
                      <span>{t('receipt.previewDate')}:</span>
                      <span>28/03/2026 12:30</span>
                    </div>
                  )}
                  {showStaffName && (
                    <div className="flex justify-between">
                      <span>{t('receipt.previewCashier')}:</span>
                      <span>Ahmad Hidayat</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>{t('receipt.previewTable')}:</span>
                    <span>T2</span>
                  </div>
                </div>

                <div className="my-2 border-t border-dashed border-gray-400" />

                {/* Items */}
                <div className="space-y-1">
                  <div>
                    <div className="flex justify-between">
                      <span>Nasi Goreng Spesial</span>
                      <span>{formatRupiah(56000)}</span>
                    </div>
                    <div className="text-gray-500 pl-2">2x {formatRupiah(28000)}</div>
                  </div>
                  <div>
                    <div className="flex justify-between">
                      <span>Es Teh Manis</span>
                      <span>{formatRupiah(16000)}</span>
                    </div>
                    <div className="text-gray-500 pl-2">2x {formatRupiah(8000)}</div>
                  </div>
                </div>

                <div className="my-2 border-t border-dashed border-gray-400" />

                {/* Totals */}
                <div className="space-y-0.5">
                  <div className="flex justify-between">
                    <span>{t('receipt.previewSubtotal')}</span>
                    <span>{formatRupiah(72000)}</span>
                  </div>
                  {showTax && (
                    <div className="flex justify-between">
                      <span>{t('receipt.previewTax')}</span>
                      <span>{formatRupiah(7920)}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-bold text-[11px]">
                    <span>{t('receipt.previewTotal')}</span>
                    <span>{formatRupiah(79920)}</span>
                  </div>
                </div>

                <div className="my-2 border-t border-dashed border-gray-400" />

                <div className="flex justify-between">
                  <span>{t('receipt.previewPayment')}</span>
                  <span>{formatRupiah(79920)}</span>
                </div>
                <div className="flex justify-between">
                  <span>{t('receipt.previewChange')}</span>
                  <span>{formatRupiah(0)}</span>
                </div>

                <div className="my-2 border-t border-dashed border-gray-400" />

                {/* Footer */}
                <div className="text-center space-y-0.5">
                  <div className="font-bold">{thankYouMessage}</div>
                  <div className="text-gray-500">{returnPolicy}</div>
                  {footerCustomText && (
                    <div className="mt-1 whitespace-pre-line text-gray-500">
                      {footerCustomText}
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Separator />

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={updateTemplate.isPending}>
          <Save className="h-4 w-4" />
          {updateTemplate.isPending ? t('common.saving') : t('common.save')}
        </Button>
      </div>
    </div>
  )
}

function ToggleRow({
  label,
  description,
  checked,
  onCheckedChange,
}: {
  label: string
  description: string
  checked: boolean
  onCheckedChange: (checked: boolean) => void
}) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium">{label}</p>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
      <Switch checked={checked} onCheckedChange={onCheckedChange} />
    </div>
  )
}
