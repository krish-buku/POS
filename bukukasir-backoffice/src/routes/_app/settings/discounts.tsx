import { createFileRoute } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { useAuth } from '@/lib/auth-context'
import { useTranslate } from '@/lib/i18n-context'
import { usePromotions, useCreatePromotion, useUpdatePromotion, useDeletePromotion } from '@/lib/api-hooks'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
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
import { Percent, Plus, Pencil, Trash2, AlertTriangle } from 'lucide-react'

export const Route = createFileRoute('/_app/settings/discounts')({
  component: DiscountsPage,
})

interface PromotionItem {
  id: string
  name: string
  type: string
  value: number
  active: boolean
  description?: string
}

function DiscountsPage() {
  const { currentBusiness } = useAuth()
  const businessId = currentBusiness?.id ?? 'biz-001'
  const { data: apiPromotions = [], isLoading } = usePromotions(businessId)

  const createPromotion = useCreatePromotion()
  const updatePromotion = useUpdatePromotion()
  const deletePromotion = useDeletePromotion()

  const t = useTranslate()

  const promotions: PromotionItem[] = apiPromotions.map((p: any) => ({
    id: p.id,
    name: p.name ?? '',
    type: p.discountType ?? p.type ?? 'PERCENTAGE',
    value: p.discountValue ?? p.value ?? 0,
    active: p.active ?? true,
    description: p.description,
  }))

  // Local UI settings (no backend endpoint for these)
  const localStorageKey = `discounts-settings-${businessId}`
  const [presetDiscounts, setPresetDiscounts] = useState([5, 10, 15, 20])
  const [editingPreset, setEditingPreset] = useState<number | null>(null)
  const [editingValue, setEditingValue] = useState('')
  const [approvalThreshold, setApprovalThreshold] = useState(20)
  const [disableAllDiscounts, setDisableAllDiscounts] = useState(false)

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(localStorageKey)
      if (stored) {
        const data = JSON.parse(stored)
        if (data.presetDiscounts) setPresetDiscounts(data.presetDiscounts)
        if (data.approvalThreshold !== undefined) setApprovalThreshold(data.approvalThreshold)
        if (data.disableAllDiscounts !== undefined) setDisableAllDiscounts(data.disableAllDiscounts)
      }
    } catch { /* ignore */ }
  }, [localStorageKey])

  // Persist to localStorage on change
  useEffect(() => {
    try {
      localStorage.setItem(localStorageKey, JSON.stringify({
        presetDiscounts, approvalThreshold, disableAllDiscounts,
      }))
    } catch { /* ignore */ }
  }, [localStorageKey, presetDiscounts, approvalThreshold, disableAllDiscounts])

  // Promotion dialog
  const [promoDialogOpen, setPromoDialogOpen] = useState(false)
  const [editingPromo, setEditingPromo] = useState<PromotionItem | null>(null)
  const [promoName, setPromoName] = useState('')
  const [promoType, setPromoType] = useState('PERCENTAGE')
  const [promoValue, setPromoValue] = useState('')
  const [promoDescription, setPromoDescription] = useState('')

  const roleLimits = [
    { role: t('role.cashier'), max: 20 },
    { role: t('role.manager'), max: 50 },
    { role: t('role.owner'), max: -1 },
  ]

  const handlePresetEdit = (index: number) => {
    setEditingPreset(index)
    setEditingValue(presetDiscounts[index].toString())
  }

  const handlePresetSave = (index: number) => {
    const value = parseInt(editingValue, 10)
    if (!isNaN(value) && value > 0 && value <= 100) {
      setPresetDiscounts((prev) => {
        const updated = [...prev]
        updated[index] = value
        return updated
      })
    }
    setEditingPreset(null)
    setEditingValue('')
  }

  const openAddPromo = () => {
    setEditingPromo(null)
    setPromoName('')
    setPromoType('PERCENTAGE')
    setPromoValue('')
    setPromoDescription('')
    setPromoDialogOpen(true)
  }

  const openEditPromo = (promo: PromotionItem) => {
    setEditingPromo(promo)
    setPromoName(promo.name)
    setPromoType(promo.type)
    setPromoValue(promo.value.toString())
    setPromoDescription(promo.description ?? '')
    setPromoDialogOpen(true)
  }

  const handleSavePromo = () => {
    if (!promoName.trim() || !promoValue) return
    const parsed = parseFloat(promoValue)
    if (isNaN(parsed) || parsed <= 0) return

    if (editingPromo) {
      updatePromotion.mutate(
        {
          id: editingPromo.id,
          businessId,
          name: promoName.trim(),
          type: 'ORDER_DISCOUNT',
          discountType: promoType,
          discountValue: parsed,
          active: editingPromo.active,
          description: promoDescription.trim(),
        },
        { onSuccess: () => { setPromoDialogOpen(false); toast.success(t('toast.updated')) }, onError: (e: any) => toast.error(e?.message || t('toast.error')) },
      )
    } else {
      createPromotion.mutate(
        {
          businessId,
          name: promoName.trim(),
          type: 'ORDER_DISCOUNT',
          discountType: promoType,
          discountValue: parsed,
          active: true,
          description: promoDescription.trim(),
        },
        { onSuccess: () => { setPromoDialogOpen(false); toast.success(t('toast.created')) }, onError: (e: any) => toast.error(e?.message || t('toast.error')) },
      )
    }
  }

  const handleDeletePromo = (id: string) => {
    deletePromotion.mutate(id, {
      onSuccess: () => toast.success(t('toast.deleted')),
      onError: (e: any) => toast.error(e?.message || t('toast.error')),
    })
  }

  const handleTogglePromo = (promo: PromotionItem, active: boolean) => {
    updatePromotion.mutate({
      id: promo.id,
      businessId,
      name: promo.name,
      type: 'ORDER_DISCOUNT',
      discountType: promo.type,
      discountValue: promo.value,
      active,
      description: promo.description,
    }, {
      onSuccess: () => toast.success(t('toast.updated')),
      onError: (e: any) => toast.error(e?.message || t('toast.error')),
    })
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-sm text-muted-foreground">{t('discounts.loading')}</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Disable All Toggle */}
      {disableAllDiscounts && (
        <div className="flex items-center gap-3 rounded-lg border border-orange-200 bg-orange-50 p-4">
          <AlertTriangle className="h-5 w-5 text-orange-600" />
          <p className="text-sm text-orange-800">
            {t('discounts.allDisabled')}
          </p>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Preset Discount Buttons */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Percent className="h-5 w-5 text-blue-600" />
              {t('discounts.quickButtons')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              {t('discounts.quickButtonsDesc')}
            </p>
            <div className="grid grid-cols-2 gap-3">
              {presetDiscounts.map((discount, index) => (
                <div key={index}>
                  {editingPreset === index ? (
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        min={1}
                        max={100}
                        value={editingValue}
                        onChange={(e) => setEditingValue(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handlePresetSave(index)
                          if (e.key === 'Escape') setEditingPreset(null)
                        }}
                        className="w-20"
                        autoFocus
                      />
                      <span className="text-sm">%</span>
                      <Button
                        size="sm"
                        onClick={() => handlePresetSave(index)}
                      >
                        {t('common.ok' as any)}
                      </Button>
                    </div>
                  ) : (
                    <Button
                      variant="outline"
                      className="w-full h-12 text-lg font-semibold"
                      onClick={() => handlePresetEdit(index)}
                    >
                      {discount}%
                    </Button>
                  )}
                </div>
              ))}
            </div>
            <p className="text-xs text-muted-foreground">
              {t('discounts.clickToEdit')}
            </p>
          </CardContent>
        </Card>

        {/* Maximum Discount Limit per Role */}
        <Card>
          <CardHeader>
            <CardTitle>{t('discounts.maxLimit')}</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('common.role')}</TableHead>
                  <TableHead>{t('fees.maxLimit')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {roleLimits.map((limit) => (
                  <TableRow key={limit.role}>
                    <TableCell className="font-medium">{limit.role}</TableCell>
                    <TableCell>
                      {limit.max === -1 ? (
                        <Badge variant="secondary">{t('discounts.unlimited')}</Badge>
                      ) : (
                        <span>{limit.max}%</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Approval Threshold */}
      <Card>
        <CardHeader>
          <CardTitle>{t('discounts.approvalThreshold')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3">
            <Label htmlFor="approval-threshold" className="whitespace-nowrap">
              {t('discounts.needApproval')}
            </Label>
            <Input
              id="approval-threshold"
              type="number"
              min={1}
              max={100}
              value={approvalThreshold}
              onChange={(e) => { const v = parseInt(e.target.value, 10); setApprovalThreshold(isNaN(v) || v < 1 ? 1 : v > 100 ? 100 : v) }}
              className="w-20"
            />
            <span className="text-sm font-medium">%</span>
          </div>
          <p className="text-xs text-muted-foreground">
            {t('discounts.approvalDesc', { threshold: approvalThreshold })}
          </p>
        </CardContent>
      </Card>

      {/* Promotions from API */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="space-y-1">
            <CardTitle>{t('discounts.promotions')}</CardTitle>
            <p className="text-sm text-muted-foreground">
              {t('discounts.promotionsDesc')}
            </p>
          </div>
          <Dialog open={promoDialogOpen} onOpenChange={setPromoDialogOpen}>
            <DialogTrigger render={<Button onClick={openAddPromo} />}>
              <Plus className="h-4 w-4" />
              {t('discounts.addPromotion')}
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingPromo ? t('discounts.editPromotion') : t('discounts.addNewPromotion')}
                </DialogTitle>
                <DialogDescription>
                  {t('discounts.promoDetail')}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="promo-name">{t('discounts.promoName')}</Label>
                  <Input
                    id="promo-name"
                    placeholder={t('discounts.promoNamePlaceholder')}
                    value={promoName}
                    onChange={(e) => setPromoName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t('common.type')}</Label>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="promo-type"
                        checked={promoType === 'PERCENTAGE'}
                        onChange={() => setPromoType('PERCENTAGE')}
                        className="h-4 w-4 accent-blue-600"
                      />
                      <span className="text-sm">{t('discounts.persen')} (%)</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="promo-type"
                        checked={promoType === 'FIXED_AMOUNT'}
                        onChange={() => setPromoType('FIXED_AMOUNT')}
                        className="h-4 w-4 accent-blue-600"
                      />
                      <span className="text-sm">{t('discounts.nominal')} (Rp)</span>
                    </label>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="promo-value">
                    {promoType === 'PERCENTAGE' ? t('common.percentage') + ' (%)' : t('common.amount') + ' (Rp)'}
                  </Label>
                  <Input
                    id="promo-value"
                    type="number"
                    min={0}
                    value={promoValue}
                    onChange={(e) => setPromoValue(e.target.value)}
                    placeholder={promoType === 'PERCENTAGE' ? '10' : '5000'}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="promo-desc">{t('discounts.promoDesc')}</Label>
                  <Input
                    id="promo-desc"
                    placeholder={t('discounts.promoDescPlaceholder')}
                    value={promoDescription}
                    onChange={(e) => setPromoDescription(e.target.value)}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setPromoDialogOpen(false)}>
                  {t('common.cancel')}
                </Button>
                <Button
                  onClick={handleSavePromo}
                  disabled={!promoName.trim() || !promoValue || createPromotion.isPending || updatePromotion.isPending}
                >
                  {createPromotion.isPending || updatePromotion.isPending ? t('common.saving') : editingPromo ? t('common.save') : t('common.add')}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          {promotions.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">
              {t('discounts.noPromotions')}
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('common.name')}</TableHead>
                  <TableHead>{t('common.type')}</TableHead>
                  <TableHead>{t('common.value')}</TableHead>
                  <TableHead>{t('common.status')}</TableHead>
                  <TableHead className="w-24">{t('common.action')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {promotions.map((promo) => (
                  <TableRow key={promo.id}>
                    <TableCell>
                      <div>
                        <span className="font-medium">{promo.name}</span>
                        {promo.description && (
                          <p className="text-xs text-muted-foreground">{promo.description}</p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {promo.type === 'PERCENTAGE' ? t('discounts.persen') : t('discounts.nominal')}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {promo.type === 'PERCENTAGE' ? `${promo.value}%` : `Rp ${promo.value.toLocaleString('id-ID')}`}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={promo.active}
                          onCheckedChange={(checked) => handleTogglePromo(promo, checked)}
                          size="sm"
                        />
                        <span className="text-sm">
                          {promo.active ? t('common.active') : t('common.inactive')}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon-xs"
                          onClick={() => openEditPromo(promo)}
                        >
                          <Pencil className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon-xs"
                          className="text-destructive hover:text-destructive"
                          onClick={() => handleDeletePromo(promo.id)}
                          disabled={deletePromotion.isPending}
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

      {/* Disable All Discounts */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">{t('discounts.disableAll')}</p>
              <p className="text-xs text-muted-foreground">
                {t('discounts.disableAllDesc')}
              </p>
            </div>
            <Switch
              checked={disableAllDiscounts}
              onCheckedChange={setDisableAllDiscounts}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
