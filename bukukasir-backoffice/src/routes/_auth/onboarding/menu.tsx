import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'
import { useTranslate } from '@/lib/i18n-context'
import {
  useOnboarding,
  type DraftCategory,
  type DraftMenuItem,
} from '@/lib/onboarding-context'
import { useCreateCategory, useCreateMenuItem } from '@/lib/api-hooks'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Plus, Trash2, Upload } from 'lucide-react'
import { MenuImportDialog } from '@/components/onboarding/MenuImportDialog'
import { cn } from '@/lib/utils'

export const Route = createFileRoute('/_auth/onboarding/menu')({
  component: OnboardingMenuStep,
})

function genKey(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
}

function OnboardingMenuStep() {
  const t = useTranslate()
  const navigate = useNavigate()
  const { draft, patch, setStep } = useOnboarding()
  const createCategory = useCreateCategory()
  const createMenuItem = useCreateMenuItem()

  const [categories, setCategories] = useState<DraftCategory[]>(() => draft.menu.categories)
  const [items, setItems] = useState<DraftMenuItem[]>(() => draft.menu.items)
  const [selectedCatKey, setSelectedCatKey] = useState<string | null>(
    () => draft.menu.categories[0]?.tempKey ?? null
  )
  const [importOpen, setImportOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    setStep('menu')
  }, [setStep])

  // Refresh local state from context after import dialog closes
  useEffect(() => {
    if (!importOpen) {
      setCategories(draft.menu.categories)
      setItems(draft.menu.items)
      if (!selectedCatKey && draft.menu.categories[0]) {
        setSelectedCatKey(draft.menu.categories[0].tempKey)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [importOpen, draft.menu.categories, draft.menu.items])

  const addCategory = () => {
    const tempKey = genKey('cat')
    const newCat: DraftCategory = { tempKey, name: '', sortOrder: categories.length }
    const next = [...categories, newCat]
    setCategories(next)
    setSelectedCatKey(tempKey)
    patch('menu', { categories: next, items, skipped: false })
  }

  const updateCategory = (key: string, partial: Partial<DraftCategory>) => {
    const next = categories.map((c) => (c.tempKey === key ? { ...c, ...partial } : c))
    setCategories(next)
    patch('menu', { categories: next, items, skipped: false })
  }

  const removeCategory = (key: string) => {
    const nextCats = categories.filter((c) => c.tempKey !== key)
    const nextItems = items.filter((i) => i.categoryTempKey !== key)
    setCategories(nextCats)
    setItems(nextItems)
    if (selectedCatKey === key) setSelectedCatKey(nextCats[0]?.tempKey ?? null)
    patch('menu', { categories: nextCats, items: nextItems, skipped: false })
  }

  const addItem = () => {
    if (!selectedCatKey) {
      toast.error(t('onboarding.menu.selectCategoryFirst'))
      return
    }
    const tempKey = genKey('itm')
    const newItem: DraftMenuItem = {
      tempKey,
      name: '',
      price: 0,
      categoryTempKey: selectedCatKey,
    }
    const next = [...items, newItem]
    setItems(next)
    patch('menu', { categories, items: next, skipped: false })
  }

  const updateItem = (key: string, partial: Partial<DraftMenuItem>) => {
    const next = items.map((i) => (i.tempKey === key ? { ...i, ...partial } : i))
    setItems(next)
    patch('menu', { categories, items: next, skipped: false })
  }

  const removeItem = (key: string) => {
    const next = items.filter((i) => i.tempKey !== key)
    setItems(next)
    patch('menu', { categories, items: next, skipped: false })
  }

  const visibleItems = useMemo(
    () => (selectedCatKey ? items.filter((i) => i.categoryTempKey === selectedCatKey) : []),
    [items, selectedCatKey]
  )

  const commit = async (skipMode: boolean) => {
    if (!draft.businessId) {
      toast.error(t('onboarding.review.missingBusiness'))
      return
    }
    setSubmitting(true)
    try {
      if (skipMode) {
        patch('menu', { categories, items, skipped: true })
        void navigate({ to: '/onboarding/payments' })
        return
      }

      const createdCategoryIds: Record<string, string> = { ...(draft.createdCategoryIds ?? {}) }
      const createdItemIds: string[] = [...(draft.createdMenuItemIds ?? [])]

      for (let i = 0; i < categories.length; i += 1) {
        const cat = categories[i]
        if (!cat.name.trim()) continue
        if (createdCategoryIds[cat.tempKey]) continue
        try {
          const res = await createCategory.mutateAsync({
            name: cat.name.trim(),
            description: cat.description ?? '',
            businessId: draft.businessId,
            sortOrder: i,
          })
          if (res?.id) {
            createdCategoryIds[cat.tempKey] = res.id
            patch('createdCategoryIds', { ...createdCategoryIds })
          }
        } catch (err: any) {
          toast.error(err?.message || t('toast.error'))
          setSubmitting(false)
          return
        }
      }

      for (const item of items) {
        if (!item.name.trim() || item.price < 0) continue
        // Skip items already created: we have no stable tempKey→server id map, so
        // we only rely on the createdMenuItemIds list being preserved across retries
        // for new entries added after a partial failure.
        const catServerId = createdCategoryIds[item.categoryTempKey]
        if (!catServerId) continue
        try {
          const res = await createMenuItem.mutateAsync({
            name: item.name.trim(),
            description: item.description ?? '',
            price: item.price,
            categoryId: catServerId,
            businessId: draft.businessId,
          })
          if (res?.id) createdItemIds.push(res.id)
        } catch (err: any) {
          toast.error(err?.message || t('toast.error'))
          setSubmitting(false)
          return
        }
      }

      patch('createdMenuItemIds', createdItemIds)
      patch('menu', { categories, items, skipped: false })
      void navigate({ to: '/onboarding/payments' })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">{t('onboarding.menu.title')}</h2>
          <p className="mt-1 text-muted-foreground">{t('onboarding.menu.subtitle')}</p>
        </div>
        <Button
          type="button"
          variant="outline"
          onClick={() => setImportOpen(true)}
          disabled={submitting}
        >
          <Upload className="h-4 w-4" />
          {t('onboarding.menu.import.button')}
        </Button>
      </div>

      <div className="grid gap-4 lg:grid-cols-[260px_1fr]">
        {/* Categories column */}
        <div className="rounded-xl border bg-card">
          <div className="flex items-center justify-between border-b px-4 py-3">
            <h3 className="text-sm font-semibold">{t('menu.categories')}</h3>
            <Button type="button" variant="ghost" size="icon-sm" onClick={addCategory}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          <div className="space-y-1 p-2">
            {categories.length === 0 && (
              <p className="p-3 text-center text-xs text-muted-foreground">
                {t('menu.noCategories')}
              </p>
            )}
            {categories.map((cat) => (
              <div
                key={cat.tempKey}
                className={cn(
                  'flex items-center gap-2 rounded-lg border p-2 transition-colors',
                  selectedCatKey === cat.tempKey
                    ? 'border-[#D4A726] bg-[#FDF8E8]'
                    : 'border-transparent bg-background hover:bg-muted/50'
                )}
              >
                <button
                  type="button"
                  className="flex-1 text-left"
                  onClick={() => setSelectedCatKey(cat.tempKey)}
                >
                  <Input
                    value={cat.name}
                    onChange={(e) => updateCategory(cat.tempKey, { name: e.target.value })}
                    placeholder={t('onboarding.menu.categoryNameLabel')}
                    className="border-0 bg-transparent px-1 shadow-none focus-visible:ring-0"
                  />
                </button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => removeCategory(cat.tempKey)}
                >
                  <Trash2 className="h-3.5 w-3.5 text-muted-foreground" />
                </Button>
              </div>
            ))}
          </div>
        </div>

        {/* Items column */}
        <div className="rounded-xl border bg-card">
          <div className="flex items-center justify-between border-b px-4 py-3">
            <h3 className="text-sm font-semibold">{t('menu.menuItems')}</h3>
            <Button type="button" variant="outline" size="sm" onClick={addItem} disabled={!selectedCatKey}>
              <Plus className="h-4 w-4" />
              {t('onboarding.menu.addItem')}
            </Button>
          </div>
          <div className="divide-y">
            {!selectedCatKey && (
              <p className="p-6 text-center text-sm text-muted-foreground">
                {t('onboarding.menu.selectCategoryFirst')}
              </p>
            )}
            {selectedCatKey && visibleItems.length === 0 && (
              <p className="p-6 text-center text-sm text-muted-foreground">{t('menu.noItems')}</p>
            )}
            {visibleItems.map((item) => (
              <div
                key={item.tempKey}
                className="grid gap-3 p-4 md:grid-cols-[2fr_1fr_auto]"
              >
                <div>
                  <Label className="text-xs">{t('onboarding.menu.itemNameLabel')}</Label>
                  <Input
                    value={item.name}
                    onChange={(e) => updateItem(item.tempKey, { name: e.target.value })}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label className="text-xs">{t('onboarding.menu.itemPriceLabel')}</Label>
                  <Input
                    type="number"
                    inputMode="numeric"
                    min={0}
                    value={item.price === 0 ? '' : item.price}
                    onChange={(e) =>
                      updateItem(item.tempKey, {
                        price: e.target.value ? Number(e.target.value) : 0,
                      })
                    }
                    className="mt-1"
                  />
                </div>
                <div className="flex items-end">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeItem(item.tempKey)}
                  >
                    <Trash2 className="h-4 w-4 text-muted-foreground" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <p className="text-sm text-muted-foreground">{t('onboarding.menu.skipHint')}</p>

      <div className="flex items-center justify-between">
        <Button
          type="button"
          variant="outline"
          onClick={() => void navigate({ to: '/onboarding/business' })}
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

      <MenuImportDialog open={importOpen} onOpenChange={setImportOpen} />
    </div>
  )
}
