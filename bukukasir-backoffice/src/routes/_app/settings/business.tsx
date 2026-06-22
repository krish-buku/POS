import { createFileRoute } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { useAuth } from '@/lib/auth-context'
import { useBusiness, useUpdateBusiness, useTaxConfigs, useCreateTaxConfig, useUpdateTaxConfig } from '@/lib/api-hooks'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Building2, Save, AlertTriangle, ArrowRightLeft, Trash2 } from 'lucide-react'
import { useTranslate } from '@/lib/i18n-context'

export const Route = createFileRoute('/_app/settings/business')({
  component: BusinessPage,
})

function BusinessPage() {
  const t = useTranslate()
  const { currentBusiness } = useAuth()
  const businessId = currentBusiness?.id ?? 'biz-001'
  const { data: business } = useBusiness(businessId)
  const updateBusiness = useUpdateBusiness()
  const { data: taxConfigs = [] } = useTaxConfigs(businessId)
  const createTaxConfig = useCreateTaxConfig()
  const updateTaxConfig = useUpdateTaxConfig()

  const [businessName, setBusinessName] = useState('')
  const [address, setAddress] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')

  useEffect(() => {
    if (business) {
      setBusinessName(business.name ?? '')
      setAddress(business.address ?? '')
      setPhone(business.phone ?? '')
      setEmail(business.email ?? '')
    }
  }, [business])

  // Tax configuration — synced with tax config API
  const [ppnEnabled, setPpnEnabled] = useState(true)
  const [ppnRate, setPpnRate] = useState(10)
  const [ppnMode, setPpnMode] = useState<'inclusive' | 'exclusive'>('exclusive')
  const [showTaxLabel, setShowTaxLabel] = useState(true)
  const [taxConfigId, setTaxConfigId] = useState<string | null>(null)

  useEffect(() => {
    if (taxConfigs.length > 0) {
      const ppn = taxConfigs[0]
      setTaxConfigId(ppn.id ?? null)
      setPpnEnabled(ppn.active ?? true)
      setPpnRate(ppn.rate ?? 10)
      setPpnMode(ppn.inclusive ? 'inclusive' : 'exclusive')
    }
    // showTaxLabel from localStorage since tax config API doesn't have this field
    try {
      const stored = localStorage.getItem(`showTaxLabel-${businessId}`)
      if (stored !== null) setShowTaxLabel(JSON.parse(stored))
    } catch { /* ignore */ }
  }, [taxConfigs, businessId])

  // Transfer ownership
  const [transferDialogOpen, setTransferDialogOpen] = useState(false)
  const [transferPhone, setTransferPhone] = useState('')
  const [transferStep, setTransferStep] = useState<1 | 2>(1)

  const handleOpenTransfer = () => {
    setTransferPhone('')
    setTransferStep(1)
    setTransferDialogOpen(true)
  }

  const handleTransferNext = () => {
    if (transferStep === 1 && transferPhone.trim()) {
      setTransferStep(2)
    }
  }

  const handleTransferConfirm = () => {
    // Mock transfer - in reality would call API
    setTransferDialogOpen(false)
  }

  return (
    <div className="space-y-6">
      {/* Business Profile */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-blue-600" />
            {t('business.profile')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="biz-name">{t('business.name')}</Label>
              <Input
                id="biz-name"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="biz-phone">{t('common.phone')}</Label>
              <Input
                id="biz-phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="biz-address">{t('business.address')}</Label>
              <Input
                id="biz-address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="biz-email">{t('business.email')}</Label>
              <Input
                id="biz-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tax Configuration */}
      <Card>
        <CardHeader>
          <CardTitle>{t('business.taxConfig')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">{t('business.ppn')}</p>
              <p className="text-xs text-muted-foreground">
                {t('business.ppnDesc')}
              </p>
            </div>
            <Switch checked={ppnEnabled} onCheckedChange={setPpnEnabled} />
          </div>

          {ppnEnabled && (
            <div className="space-y-4 pl-4 border-l-2 border-blue-200">
              <div className="flex items-center gap-2">
                <Label htmlFor="ppn-rate">{t('business.ppnRate')}</Label>
                <Input
                  id="ppn-rate"
                  type="number"
                  min={0}
                  max={100}
                  value={ppnRate}
                  onChange={(e) => { const v = parseFloat(e.target.value); setPpnRate(isNaN(v) || v < 0 ? 0 : v > 100 ? 100 : v) }}
                  className="w-20"
                />
                <span className="text-sm font-medium">%</span>
              </div>

              <div className="space-y-2">
                <Label>{t('business.taxMode')}</Label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="ppn-mode"
                      value="inclusive"
                      checked={ppnMode === 'inclusive'}
                      onChange={() => setPpnMode('inclusive')}
                      className="h-4 w-4 accent-blue-600"
                    />
                    <div>
                      <span className="text-sm font-medium">{t('business.inclusive')}</span>
                      <p className="text-xs text-muted-foreground">
                        {t('business.inclusiveDesc')}
                      </p>
                    </div>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="ppn-mode"
                      value="exclusive"
                      checked={ppnMode === 'exclusive'}
                      onChange={() => setPpnMode('exclusive')}
                      className="h-4 w-4 accent-blue-600"
                    />
                    <div>
                      <span className="text-sm font-medium">{t('business.exclusive')}</span>
                      <p className="text-xs text-muted-foreground">
                        {t('business.exclusiveDesc')}
                      </p>
                    </div>
                  </label>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">{t('business.showTaxLabel')}</p>
                  <p className="text-xs text-muted-foreground">
                    {t('business.showTaxLabelDesc')}
                  </p>
                </div>
                <Switch checked={showTaxLabel} onCheckedChange={setShowTaxLabel} />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Ownership Transfer */}
      <Card>
        <CardHeader>
          <CardTitle>{t('business.transferOwnership')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div>
              <p className="text-sm font-medium">{t('business.currentOwner')}</p>
              <p className="text-sm text-muted-foreground">{business?.ownerName ?? currentBusiness?.name ?? '-'}</p>
              <p className="text-xs text-muted-foreground">{phone}</p>
            </div>
            <Badge>{t('business.owner')}</Badge>
          </div>

          <Button variant="outline" onClick={handleOpenTransfer}>
            <ArrowRightLeft className="h-4 w-4" />
            {t('business.transferOwnership')}
          </Button>

          <Dialog open={transferDialogOpen} onOpenChange={setTransferDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{t('business.transferTitle')}</DialogTitle>
                <DialogDescription>
                  {transferStep === 1
                    ? t('business.transferStep1')
                    : t('business.transferStep2')}
                </DialogDescription>
              </DialogHeader>

              {transferStep === 1 ? (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="transfer-phone">{t('business.newOwnerPhone')}</Label>
                    <Input
                      id="transfer-phone"
                      placeholder="+62..."
                      value={transferPhone}
                      onChange={(e) => setTransferPhone(e.target.value)}
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="rounded-lg border border-orange-200 bg-orange-50 p-4">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="h-5 w-5 text-orange-600 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-orange-800">{t('business.warning')}</p>
                        <p className="text-sm text-orange-700 mt-1">
                          {t('business.transferWarning', { name: businessName, phone: transferPhone })}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setTransferDialogOpen(false)}
                >
                  {t('common.cancel')}
                </Button>
                {transferStep === 1 ? (
                  <Button
                    onClick={handleTransferNext}
                    disabled={!transferPhone.trim()}
                  >
                    {t('common.next')}
                  </Button>
                ) : (
                  <Button
                    variant="destructive"
                    onClick={handleTransferConfirm}
                  >
                    {t('business.confirmTransfer')}
                  </Button>
                )}
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-destructive/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-5 w-5" />
            {t('business.dangerZone')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">{t('business.deleteBusiness')}</p>
              <p className="text-xs text-muted-foreground">
                {t('business.deleteBusinessDesc')}
              </p>
            </div>
            <Button variant="destructive" disabled>
              <Trash2 className="h-4 w-4" />
              {t('business.deleteBusiness')}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground italic">
            {t('business.deleteContact')}
          </p>
        </CardContent>
      </Card>

      <Separator />

      <div className="flex justify-end">
        <Button
          onClick={() => {
            // 1. Save business profile (only fields the backend supports)
            updateBusiness.mutate(
              { id: businessId, name: businessName, type: business?.type, address, phone, email },
              {
                onSuccess: () => toast.success(t('toast.saved')),
                onError: (e: any) => toast.error(e?.message || t('toast.error')),
              }
            )
            // 2. Save tax config via tax config API
            const taxData = { businessId, name: 'PPN', rate: ppnRate, inclusive: ppnMode === 'inclusive', active: ppnEnabled, priority: 1 }
            if (taxConfigId) {
              updateTaxConfig.mutate({ id: taxConfigId, ...taxData }, { onError: (e: any) => toast.error(e?.message || t('toast.error')) })
            } else {
              createTaxConfig.mutate(taxData, {
                onSuccess: (res: any) => { if (res?.id) setTaxConfigId(res.id) },
                onError: (e: any) => toast.error(e?.message || t('toast.error')),
              })
            }
            // 3. Save showTaxLabel in localStorage (no backend field for this)
            try { localStorage.setItem(`showTaxLabel-${businessId}`, JSON.stringify(showTaxLabel)) } catch { /* ignore */ }
          }}
          disabled={updateBusiness.isPending}
        >
          <Save className="h-4 w-4" />
          {updateBusiness.isPending ? t('common.saving') : t('common.save')}
        </Button>
      </div>
    </div>
  )
}
