import { createFileRoute } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { formatRupiah } from '@/lib/mock-data'
import { useAuth } from '@/lib/auth-context'
import { useTranslate } from '@/lib/i18n-context'
import { useTaxConfigs, useCreateTaxConfig, useUpdateTaxConfig, useDeleteTaxConfig } from '@/lib/api-hooks'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { DollarSign, Plus, Pencil, Trash2 } from 'lucide-react'

export const Route = createFileRoute('/_app/settings/fees')({
  component: FeesPage,
})

interface TaxConfigItem {
  id: string
  name: string
  rate: number
  inclusive: boolean
  active: boolean
  priority?: number
}

function FeesPage() {
  const { currentBusiness } = useAuth()
  const businessId = currentBusiness?.id ?? 'biz-001'
  const { data: apiTaxConfigs = [], isLoading } = useTaxConfigs(businessId)

  const createTaxConfig = useCreateTaxConfig()
  const updateTaxConfig = useUpdateTaxConfig()
  const deleteTaxConfig = useDeleteTaxConfig()

  const t = useTranslate()

  const taxConfigs: TaxConfigItem[] = apiTaxConfigs.map((tc: any) => ({
    id: tc.id,
    name: tc.name,
    rate: (tc.rate ?? 0) < 1 ? (tc.rate ?? 0) * 100 : tc.rate ?? 0, // API stores as decimal (0.11), display as percentage (11)
    inclusive: tc.inclusive ?? false,
    active: tc.active ?? true,
    priority: tc.priority,
  }))

  // Load local-only settings from localStorage
  const localStorageKey = `fees-settings-${businessId}`
  const [serviceChargeEnabled, setServiceChargeEnabled] = useState(true)
  const [serviceChargePercent, setServiceChargePercent] = useState(5)

  const [packagingEnabled, setPackagingEnabled] = useState(false)
  const [packagingAmount, setPackagingAmount] = useState(2000)
  const [packagingPer, setPackagingPer] = useState<'item' | 'order'>('order')

  const [showAsSeparateItem, setShowAsSeparateItem] = useState(true)

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(localStorageKey)
      if (stored) {
        const data = JSON.parse(stored)
        if (data.serviceChargeEnabled !== undefined) setServiceChargeEnabled(data.serviceChargeEnabled)
        if (data.serviceChargePercent !== undefined) setServiceChargePercent(data.serviceChargePercent)
        if (data.packagingEnabled !== undefined) setPackagingEnabled(data.packagingEnabled)
        if (data.packagingAmount !== undefined) setPackagingAmount(data.packagingAmount)
        if (data.packagingPer) setPackagingPer(data.packagingPer)
        if (data.showAsSeparateItem !== undefined) setShowAsSeparateItem(data.showAsSeparateItem)
      }
    } catch { /* ignore */ }
  }, [localStorageKey])

  // Persist to localStorage on change
  useEffect(() => {
    try {
      localStorage.setItem(localStorageKey, JSON.stringify({
        serviceChargeEnabled, serviceChargePercent,
        packagingEnabled, packagingAmount, packagingPer,
        showAsSeparateItem,
      }))
    } catch { /* ignore */ }
  }, [localStorageKey, serviceChargeEnabled, serviceChargePercent, packagingEnabled, packagingAmount, packagingPer, showAsSeparateItem])

  // Delete confirmation state
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null)

  const [feeDialogOpen, setFeeDialogOpen] = useState(false)
  const [editingFee, setEditingFee] = useState<TaxConfigItem | null>(null)
  const [feeName, setFeeName] = useState('')
  const [feeRate, setFeeRate] = useState('')
  const [feeInclusive, setFeeInclusive] = useState(false)

  const openAddDialog = () => {
    setEditingFee(null)
    setFeeName('')
    setFeeRate('')
    setFeeInclusive(false)
    setFeeDialogOpen(true)
  }

  const openEditDialog = (fee: TaxConfigItem) => {
    setEditingFee(fee)
    setFeeName(fee.name)
    setFeeRate(fee.rate.toString())
    setFeeInclusive(fee.inclusive)
    setFeeDialogOpen(true)
  }

  const handleSaveFee = () => {
    if (!feeName.trim() || !feeRate) return
    const parsed = parseFloat(feeRate)
    if (isNaN(parsed) || parsed <= 0 || parsed > 100) return
    const rateDecimal = parsed / 100 // Convert percentage (11) to decimal (0.11) for API

    if (editingFee) {
      updateTaxConfig.mutate(
        {
          id: editingFee.id,
          businessId,
          name: feeName.trim(),
          rate: rateDecimal,
          inclusive: feeInclusive,
          active: editingFee.active,
        },
        { onSuccess: () => { setFeeDialogOpen(false); toast.success(t('toast.updated')) }, onError: (e: any) => toast.error(e?.message || t('toast.error')) },
      )
    } else {
      createTaxConfig.mutate(
        {
          businessId,
          name: feeName.trim(),
          rate: rateDecimal,
          inclusive: feeInclusive,
          active: true,
        },
        { onSuccess: () => { setFeeDialogOpen(false); toast.success(t('toast.created')) }, onError: (e: any) => toast.error(e?.message || t('toast.error')) },
      )
    }
  }

  const handleDeleteFee = () => {
    if (!deleteTargetId) return
    deleteTaxConfig.mutate(deleteTargetId, {
      onSuccess: () => { setDeleteTargetId(null); toast.success(t('toast.deleted')) },
      onError: (e: any) => toast.error(e?.message || t('toast.error')),
    })
  }

  const handleToggleActive = (fee: TaxConfigItem, active: boolean) => {
    updateTaxConfig.mutate({
      id: fee.id,
      businessId,
      name: fee.name,
      rate: fee.rate / 100, // Convert percentage back to decimal for API
      inclusive: fee.inclusive,
      active,
    }, {
      onSuccess: () => toast.success(t('toast.updated')),
      onError: (e: any) => toast.error(e?.message || t('toast.error')),
    })
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-sm text-muted-foreground">{t('fees.loading')}</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Service Charge */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-blue-600" />
            {t('fees.title')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Service Charge (PB1) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">{t('fees.serviceCharge')}</p>
                <p className="text-xs text-muted-foreground">
                  {t('fees.serviceChargeDesc')}
                </p>
              </div>
              <Switch
                checked={serviceChargeEnabled}
                onCheckedChange={setServiceChargeEnabled}
              />
            </div>
            {serviceChargeEnabled && (
              <div className="flex items-center gap-2 pl-4 border-l-2 border-blue-200">
                <Label htmlFor="service-charge-pct">{t('fees.percentage')}</Label>
                <Input
                  id="service-charge-pct"
                  type="number"
                  min={0}
                  max={100}
                  value={serviceChargePercent}
                  onChange={(e) => { const v = parseFloat(e.target.value); setServiceChargePercent(isNaN(v) || v < 0 ? 0 : v > 100 ? 100 : v) }}
                  className="w-20"
                />
                <span className="text-sm font-medium">%</span>
              </div>
            )}
          </div>

          <Separator />

          {/* Packaging Fee */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">{t('fees.packaging')}</p>
                <p className="text-xs text-muted-foreground">
                  {t('fees.packagingDesc')}
                </p>
              </div>
              <Switch
                checked={packagingEnabled}
                onCheckedChange={setPackagingEnabled}
              />
            </div>
            {packagingEnabled && (
              <div className="space-y-3 pl-4 border-l-2 border-blue-200">
                <div className="flex items-center gap-2">
                  <Label htmlFor="packaging-amount">{t('common.amount')}</Label>
                  <Input
                    id="packaging-amount"
                    type="number"
                    min={0}
                    value={packagingAmount}
                    onChange={(e) => { const v = parseInt(e.target.value, 10); setPackagingAmount(isNaN(v) || v < 0 ? 0 : v) }}
                    className="w-32"
                  />
                  <span className="text-sm text-muted-foreground">
                    ({formatRupiah(packagingAmount)})
                  </span>
                </div>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="packaging-per"
                      value="item"
                      checked={packagingPer === 'item'}
                      onChange={() => setPackagingPer('item')}
                      className="h-4 w-4 accent-blue-600"
                    />
                    <span className="text-sm">{t('fees.perItem')}</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="packaging-per"
                      value="order"
                      checked={packagingPer === 'order'}
                      onChange={() => setPackagingPer('order')}
                      className="h-4 w-4 accent-blue-600"
                    />
                    <span className="text-sm">{t('fees.perOrder')}</span>
                  </label>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Tax / Fee Configurations from API */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="space-y-1">
            <CardTitle>{t('fees.taxFeeConfig')}</CardTitle>
            <p className="text-sm text-muted-foreground">
              {t('fees.taxFeeConfigDesc')}
            </p>
          </div>
          <Dialog open={feeDialogOpen} onOpenChange={setFeeDialogOpen}>
            <DialogTrigger render={<Button variant="outline" onClick={openAddDialog} />}>
              <Plus className="h-4 w-4" />
              {t('fees.addFee')}
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingFee ? t('fees.editFee') : t('fees.addNewFee')}
                </DialogTitle>
                <DialogDescription>
                  {t('fees.feeDetail')}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="fee-name">{t('fees.feeName')}</Label>
                  <Input
                    id="fee-name"
                    placeholder={t('fees.feeNamePlaceholder')}
                    value={feeName}
                    onChange={(e) => setFeeName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fee-rate">{t('fees.feeRate')}</Label>
                  <Input
                    id="fee-rate"
                    type="number"
                    min={0}
                    max={100}
                    value={feeRate}
                    onChange={(e) => setFeeRate(e.target.value)}
                    placeholder="11"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">{t('fees.inclusiveMode')}</p>
                    <p className="text-xs text-muted-foreground">
                      {t('fees.inclusiveModeDesc')}
                    </p>
                  </div>
                  <Switch checked={feeInclusive} onCheckedChange={setFeeInclusive} />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setFeeDialogOpen(false)}>
                  {t('common.cancel')}
                </Button>
                <Button
                  onClick={handleSaveFee}
                  disabled={!feeName.trim() || !feeRate || createTaxConfig.isPending || updateTaxConfig.isPending}
                >
                  {createTaxConfig.isPending || updateTaxConfig.isPending ? t('common.saving') : editingFee ? t('common.save') : t('common.add')}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          {taxConfigs.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">
              {t('fees.noConfigs')}
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('fees.feeName')}</TableHead>
                  <TableHead>{t('fees.feeRate')}</TableHead>
                  <TableHead>{t('fees.mode')}</TableHead>
                  <TableHead>{t('common.status')}</TableHead>
                  <TableHead className="w-24">{t('common.action')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {taxConfigs.map((fee) => (
                  <TableRow key={fee.id}>
                    <TableCell className="font-medium">{fee.name}</TableCell>
                    <TableCell>{fee.rate}%</TableCell>
                    <TableCell>
                      {fee.inclusive ? t('fees.inclusiveMode') : t('fees.exclusive')}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={fee.active}
                          onCheckedChange={(checked) => handleToggleActive(fee, checked)}
                          size="sm"
                        />
                        <span className="text-sm">
                          {fee.active ? t('common.active') : t('common.inactive')}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon-xs"
                          onClick={() => openEditDialog(fee)}
                        >
                          <Pencil className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon-xs"
                          className="text-destructive hover:text-destructive"
                          onClick={() => setDeleteTargetId(fee.id)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Display Options */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">{t('fees.showSeparate')}</p>
              <p className="text-xs text-muted-foreground">
                {t('fees.showSeparateDesc')}
              </p>
            </div>
            <Switch
              checked={showAsSeparateItem}
              onCheckedChange={setShowAsSeparateItem}
            />
          </div>
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteTargetId} onOpenChange={(open) => { if (!open) setDeleteTargetId(null) }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('fees.deleteTitle' as any)}</DialogTitle>
            <DialogDescription>{t('fees.deleteConfirm' as any)}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTargetId(null)}>
              {t('common.cancel')}
            </Button>
            <Button variant="destructive" onClick={handleDeleteFee} disabled={deleteTaxConfig.isPending}>
              {deleteTaxConfig.isPending ? t('common.loading') : t('common.delete')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
