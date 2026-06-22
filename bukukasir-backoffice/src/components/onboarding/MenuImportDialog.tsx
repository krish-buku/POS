import { useRef, useState } from 'react'
import { toast } from 'sonner'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { parseMenuFile, type ParseResult } from '@/lib/menu-import'
import { useTranslate } from '@/lib/i18n-context'
import { useCreateCategory, useCreateMenuItem } from '@/lib/api-hooks'
import { useOnboarding } from '@/lib/onboarding-context'
import { Upload, FileText, Download, AlertCircle } from 'lucide-react'

interface MenuImportDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function MenuImportDialog({ open, onOpenChange }: MenuImportDialogProps) {
  const t = useTranslate()
  const { draft, patch } = useOnboarding()
  const createCategory = useCreateCategory()
  const createMenuItem = useCreateMenuItem()

  const fileInputRef = useRef<HTMLInputElement>(null)
  const [parsing, setParsing] = useState(false)
  const [importing, setImporting] = useState(false)
  const [result, setResult] = useState<ParseResult | null>(null)
  const [fileName, setFileName] = useState('')

  const reset = () => {
    setResult(null)
    setFileName('')
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleClose = () => {
    if (importing) return
    reset()
    onOpenChange(false)
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setFileName(file.name)
    setParsing(true)
    try {
      const parsed = await parseMenuFile(file)
      setResult(parsed)
    } catch (err: any) {
      toast.error(err?.message || t('toast.error'))
    } finally {
      setParsing(false)
    }
  }

  const handleConfirm = async () => {
    if (!result || !draft.businessId) return
    setImporting(true)

    const existingCategories = [...(draft.menu.categories ?? [])]
    const existingItems = [...(draft.menu.items ?? [])]
    const existingCreatedCategoryIds: Record<string, string> = { ...(draft.createdCategoryIds ?? {}) }
    const existingCreatedItemIds: string[] = [...(draft.createdMenuItemIds ?? [])]

    // Find existing category tempKey by name (case-insensitive) if available.
    const findCategoryTempKey = (name: string): string | undefined => {
      return existingCategories.find(
        (c) => c.name.trim().toLowerCase() === name.trim().toLowerCase()
      )?.tempKey
    }

    let created = 0
    let failed = 0
    const rowErrors: Array<{ row: number; message: string }> = []

    // Group by category name to avoid redundant creates
    const uniqueCategoriesInImport = new Map<string, string>() // nameLower -> tempKey
    for (const row of result.valid) {
      const key = row.category.trim().toLowerCase()
      if (!uniqueCategoriesInImport.has(key)) {
        const existingKey = findCategoryTempKey(row.category)
        if (existingKey) {
          uniqueCategoriesInImport.set(key, existingKey)
        } else {
          const tempKey = `cat-${Date.now()}-${Math.random().toString(36).slice(2, 6)}-${uniqueCategoriesInImport.size}`
          uniqueCategoriesInImport.set(key, tempKey)
          existingCategories.push({
            tempKey,
            name: row.category.trim(),
            sortOrder: existingCategories.length,
          })
        }
      }
    }

    // Persist new categories locally first
    patch('menu', {
      categories: existingCategories,
      items: existingItems,
      skipped: false,
    })

    // Create categories that don't yet have a server id
    for (const cat of existingCategories) {
      if (existingCreatedCategoryIds[cat.tempKey]) continue
      try {
        const serverCat = await createCategory.mutateAsync({
          name: cat.name,
          description: cat.description ?? '',
          businessId: draft.businessId,
          sortOrder: cat.sortOrder,
        })
        if (serverCat?.id) {
          existingCreatedCategoryIds[cat.tempKey] = serverCat.id
          patch('createdCategoryIds', { ...existingCreatedCategoryIds })
        }
      } catch (err: any) {
        rowErrors.push({ row: 0, message: `Category "${cat.name}": ${err?.message || 'failed'}` })
      }
    }

    // Create items
    for (const row of result.valid) {
      const catTempKey = uniqueCategoriesInImport.get(row.category.trim().toLowerCase())
      if (!catTempKey) {
        failed += 1
        rowErrors.push({ row: row.rowNumber, message: 'Category not resolvable' })
        continue
      }
      const catServerId = existingCreatedCategoryIds[catTempKey]
      if (!catServerId) {
        failed += 1
        rowErrors.push({ row: row.rowNumber, message: 'Category creation failed' })
        continue
      }
      try {
        const serverItem = await createMenuItem.mutateAsync({
          name: row.name,
          description: row.description ?? '',
          price: row.price,
          categoryId: catServerId,
          businessId: draft.businessId,
        })
        if (serverItem?.id) {
          existingCreatedItemIds.push(serverItem.id)
          existingItems.push({
            tempKey: `itm-${Date.now()}-${Math.random().toString(36).slice(2, 6)}-${existingItems.length}`,
            name: row.name,
            price: row.price,
            categoryTempKey: catTempKey,
            description: row.description,
          })
          created += 1
        }
      } catch (err: any) {
        failed += 1
        rowErrors.push({ row: row.rowNumber, message: err?.message || 'failed' })
      }
    }

    patch('createdMenuItemIds', existingCreatedItemIds)
    patch('menu', {
      categories: existingCategories,
      items: existingItems,
      skipped: false,
    })

    setImporting(false)

    if (created > 0) {
      toast.success(
        t('onboarding.menu.import.done', {
          created,
          failed: failed + result.errors.length,
        })
      )
    } else if (failed + result.errors.length > 0) {
      toast.error(
        t('onboarding.menu.import.done', {
          created,
          failed: failed + result.errors.length,
        })
      )
    }

    reset()
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{t('onboarding.menu.import.dialogTitle')}</DialogTitle>
          <DialogDescription>{t('onboarding.menu.import.description')}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              disabled={parsing || importing}
            >
              <Upload className="h-4 w-4" />
              {t('onboarding.menu.import.button')}
            </Button>
            <a
              href="/menu-import-template.csv"
              download
              className="inline-flex items-center gap-1.5 text-sm text-[#1E3A6B] hover:underline"
            >
              <Download className="h-4 w-4" />
              {t('onboarding.menu.import.downloadTemplate')}
            </a>
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,.xlsx"
              className="hidden"
              onChange={handleFileChange}
            />
          </div>

          {fileName && (
            <div className="flex items-center gap-2 rounded-lg border bg-muted/50 p-3 text-sm">
              <FileText className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">{fileName}</span>
              {parsing && <span className="text-muted-foreground">…</span>}
            </div>
          )}

          {result && (
            <div className="space-y-3">
              <div className="flex gap-4 text-sm">
                <span className="rounded-full bg-emerald-50 px-3 py-1 font-medium text-emerald-700">
                  {t('onboarding.menu.import.validCount', { count: result.valid.length })}
                </span>
                {result.errors.length > 0 && (
                  <span className="rounded-full bg-red-50 px-3 py-1 font-medium text-red-700">
                    {t('onboarding.menu.import.errorCount', { count: result.errors.length })}
                  </span>
                )}
              </div>

              {result.valid.length > 0 && (
                <div className="max-h-56 overflow-auto rounded-lg border">
                  <table className="w-full text-sm">
                    <thead className="sticky top-0 bg-muted/70">
                      <tr className="text-left">
                        <th className="px-3 py-1.5 font-medium">#</th>
                        <th className="px-3 py-1.5 font-medium">Category</th>
                        <th className="px-3 py-1.5 font-medium">Name</th>
                        <th className="px-3 py-1.5 font-medium text-right">Price</th>
                      </tr>
                    </thead>
                    <tbody>
                      {result.valid.slice(0, 10).map((row) => (
                        <tr key={row.rowNumber} className="border-t">
                          <td className="px-3 py-1.5 text-muted-foreground">{row.rowNumber}</td>
                          <td className="px-3 py-1.5">{row.category}</td>
                          <td className="px-3 py-1.5">{row.name}</td>
                          <td className="px-3 py-1.5 text-right tabular-nums">{row.price.toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {result.errors.length > 0 && (
                <details className="rounded-lg border bg-red-50/50 p-3 text-sm">
                  <summary className="flex cursor-pointer items-center gap-2 font-medium text-red-700">
                    <AlertCircle className="h-4 w-4" />
                    {t('onboarding.menu.import.errorCount', { count: result.errors.length })}
                  </summary>
                  <ul className="mt-2 space-y-1 text-xs text-red-700">
                    {result.errors.map((e, idx) => (
                      <li key={idx}>
                        Row {e.rowNumber}: {e.message}
                      </li>
                    ))}
                  </ul>
                </details>
              )}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={handleClose} disabled={importing}>
            {t('common.cancel')}
          </Button>
          <Button
            type="button"
            onClick={handleConfirm}
            disabled={!result || result.valid.length === 0 || importing}
            className="bg-[#D4A726] text-white hover:bg-[#C0961F]"
          >
            {importing ? t('common.saving') : t('onboarding.menu.import.confirm')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
