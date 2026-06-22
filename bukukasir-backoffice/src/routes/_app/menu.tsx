import { createFileRoute } from '@tanstack/react-router'
import { useEffect, useMemo, useRef, useState } from 'react'
import { toast } from 'sonner'
import { useTranslate } from '@/lib/i18n-context'
import {
  formatRupiah,
  type MenuCategory,
  type MenuItem,
} from '@/lib/mock-data'
import { useAuth } from '@/lib/auth-context'
import {
  useCategories,
  useMenuItems,
  useCreateCategory,
  useUpdateCategory,
  useDeleteCategory,
  useCreateMenuItem,
  useUpdateMenuItem,
  useDeleteMenuItem,
  useToggleMenuItemAvailability,
} from '@/lib/api-hooks'
import { parseMenuFile, type ParseResult } from '@/lib/menu-import'
import { api } from '@/lib/api'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'
import {
  Plus,
  Pencil,
  Trash2,
  Search,
  UtensilsCrossed,
  ImagePlus,
  X,
  Upload,
  Download,
  AlertCircle,
  FileText,
  MoreHorizontal,
} from 'lucide-react'

// ─── Per-item modifiers (client-side persistence) ──────────────────────────

interface ItemModifier {
  id: string
  name: string
  priceDelta: number
}

type ItemModifiersMap = Record<string, ItemModifier[]>

const ITEM_MODS_KEY = 'bukukasir_item_modifiers_v1'

function loadItemMods(): ItemModifiersMap {
  try {
    const raw = localStorage.getItem(ITEM_MODS_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

function saveItemMods(map: ItemModifiersMap) {
  try {
    localStorage.setItem(ITEM_MODS_KEY, JSON.stringify(map))
  } catch {
    /* ignore */
  }
}

function getItemMods(itemId: string): ItemModifier[] {
  return loadItemMods()[itemId] ?? []
}

function setItemMods(itemId: string, mods: ItemModifier[]) {
  const map = loadItemMods()
  if (mods.length === 0) delete map[itemId]
  else map[itemId] = mods
  saveItemMods(map)
}

// ─── Route ──────────────────────────────────────────────────────────────────

export const Route = createFileRoute('/_app/menu')({
  component: MenuPage,
})

type Selection = { kind: 'none' } | { kind: 'item'; id: string } | { kind: 'new' }

function MenuPage() {
  const t = useTranslate()
  const { currentBusiness } = useAuth()
  const businessId = currentBusiness?.id ?? 'biz-001'

  const { data: categories = [], isLoading: categoriesLoading } = useCategories(businessId)
  const { data: items = [], isLoading: itemsLoading } = useMenuItems(businessId)

  const createCategory = useCreateCategory()
  const updateCategory = useUpdateCategory()
  const deleteCategory = useDeleteCategory()
  const createMenuItem = useCreateMenuItem()
  const updateMenuItem = useUpdateMenuItem()
  const deleteMenuItem = useDeleteMenuItem()
  const toggleAvailability = useToggleMenuItemAvailability()

  const [selectedCatId, setSelectedCatId] = useState<string | null>(null)
  const [selection, setSelection] = useState<Selection>({ kind: 'none' })
  const [search, setSearch] = useState('')
  const [importOpen, setImportOpen] = useState(false)

  const [deleteCatTarget, setDeleteCatTarget] = useState<MenuCategory | null>(null)
  const [deleteItemTarget, setDeleteItemTarget] = useState<MenuItem | null>(null)

  // Auto-select the first category when they load.
  useEffect(() => {
    if (!selectedCatId && categories.length > 0) {
      setSelectedCatId(categories[0].id)
    }
  }, [categories, selectedCatId])

  // Items in the currently selected category, filtered by search.
  const visibleItems = useMemo(() => {
    if (!selectedCatId) return []
    const q = search.trim().toLowerCase()
    return items
      .filter((i) => i.categoryId === selectedCatId)
      .filter((i) => !q || i.name.toLowerCase().includes(q) || i.description?.toLowerCase().includes(q))
  }, [items, selectedCatId, search])

  const selectedItem = useMemo(() => {
    if (selection.kind !== 'item') return null
    return items.find((i) => i.id === selection.id) ?? null
  }, [selection, items])

  const itemCounts = useMemo(() => {
    const counts: Record<string, number> = {}
    for (const item of items) counts[item.categoryId] = (counts[item.categoryId] ?? 0) + 1
    return counts
  }, [items])

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{t('menu.title')}</h1>
          <p className="text-sm text-muted-foreground">{t('menu.subtitle')}</p>
        </div>
        <Button variant="outline" onClick={() => setImportOpen(true)}>
          <Upload className="h-4 w-4" data-icon="inline-start" />
          {t('onboarding.menu.import.button')}
        </Button>
      </div>

      {/* 3-column layout (collapses on narrow screens) */}
      <div className="grid gap-4 lg:grid-cols-[260px_minmax(320px,1fr)_440px]">
        {/* Categories column */}
        <CategoriesColumn
          categories={categories}
          isLoading={categoriesLoading}
          selectedCatId={selectedCatId}
          onSelect={(id) => {
            setSelectedCatId(id)
            setSelection({ kind: 'none' })
          }}
          itemCounts={itemCounts}
          onAdd={(name) => {
            if (!name.trim()) return
            createCategory.mutate(
              { name: name.trim(), description: '', businessId, sortOrder: categories.length },
              {
                onSuccess: (res: any) => {
                  toast.success(t('toast.created'))
                  if (res?.id) setSelectedCatId(res.id)
                },
                onError: (e: any) => toast.error(e?.message || t('toast.error')),
              },
            )
          }}
          onRename={(cat, name) => {
            if (!name.trim() || name === cat.name) return
            updateCategory.mutate(
              { id: cat.id, name: name.trim(), description: cat.description ?? '', businessId, imageUrl: cat.imageUrl },
              {
                onSuccess: () => toast.success(t('toast.updated')),
                onError: (e: any) => toast.error(e?.message || t('toast.error')),
              },
            )
          }}
          onDelete={(cat) => setDeleteCatTarget(cat)}
        />

        {/* Items column */}
        <ItemsColumn
          category={categories.find((c) => c.id === selectedCatId) ?? null}
          items={visibleItems}
          isLoading={itemsLoading || categoriesLoading}
          search={search}
          onSearchChange={setSearch}
          selectedItemId={selection.kind === 'item' ? selection.id : null}
          isCreating={selection.kind === 'new'}
          onSelect={(id) => setSelection({ kind: 'item', id })}
          onCreate={() => setSelection({ kind: 'new' })}
          onDelete={(it) => setDeleteItemTarget(it)}
          onToggleAvailability={(it, checked) =>
            toggleAvailability.mutate({ id: it.id, available: checked })
          }
          togglingId={
            toggleAvailability.isPending ? toggleAvailability.variables?.id : undefined
          }
        />

        {/* Details column */}
        <DetailsColumn
          key={selection.kind === 'item' ? selection.id : selection.kind}
          businessId={businessId}
          categories={categories}
          selectedCatId={selectedCatId}
          selectedItem={selectedItem}
          isCreating={selection.kind === 'new'}
          onCreated={(id) => setSelection({ kind: 'item', id })}
          onClose={() => setSelection({ kind: 'none' })}
          onRequestDelete={(it) => setDeleteItemTarget(it)}
          createMut={createMenuItem}
          updateMut={updateMenuItem}
        />
      </div>

      {/* Delete category confirm */}
      <Dialog
        open={deleteCatTarget !== null}
        onOpenChange={(open) => !open && setDeleteCatTarget(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('menu.deleteCategory')}</DialogTitle>
            <DialogDescription>
              {deleteCatTarget
                ? t('menu.deleteCategoryConfirm', { name: deleteCatTarget.name })
                : ''}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose render={<Button variant="outline" />}>{t('common.cancel')}</DialogClose>
            <Button
              variant="destructive"
              disabled={deleteCategory.isPending}
              onClick={() => {
                if (!deleteCatTarget) return
                deleteCategory.mutate(deleteCatTarget.id, {
                  onSuccess: () => {
                    if (selectedCatId === deleteCatTarget.id) setSelectedCatId(null)
                    setDeleteCatTarget(null)
                    setSelection({ kind: 'none' })
                    toast.success(t('toast.deleted'))
                  },
                  onError: (e: any) => toast.error(e?.message || t('toast.error')),
                })
              }}
            >
              {deleteCategory.isPending ? t('common.loading') : t('common.delete')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete item confirm */}
      <Dialog
        open={deleteItemTarget !== null}
        onOpenChange={(open) => !open && setDeleteItemTarget(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('menu.deleteItem')}</DialogTitle>
            <DialogDescription>
              {deleteItemTarget ? t('menu.deleteItemConfirm', { name: deleteItemTarget.name }) : ''}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose render={<Button variant="outline" />}>{t('common.cancel')}</DialogClose>
            <Button
              variant="destructive"
              disabled={deleteMenuItem.isPending}
              onClick={() => {
                if (!deleteItemTarget) return
                deleteMenuItem.mutate(deleteItemTarget.id, {
                  onSuccess: () => {
                    setItemMods(deleteItemTarget.id, [])
                    if (selection.kind === 'item' && selection.id === deleteItemTarget.id) {
                      setSelection({ kind: 'none' })
                    }
                    setDeleteItemTarget(null)
                    toast.success(t('toast.deleted'))
                  },
                  onError: (e: any) => toast.error(e?.message || t('toast.error')),
                })
              }}
            >
              {deleteMenuItem.isPending ? t('common.loading') : t('common.delete')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bulk import */}
      <BulkImportDialog
        open={importOpen}
        onOpenChange={setImportOpen}
        businessId={businessId}
        existingCategories={categories}
      />
    </div>
  )
}

// ─── Categories Column ─────────────────────────────────────────────────────

function CategoriesColumn({
  categories,
  isLoading,
  selectedCatId,
  itemCounts,
  onSelect,
  onAdd,
  onRename,
  onDelete,
}: {
  categories: MenuCategory[]
  isLoading: boolean
  selectedCatId: string | null
  itemCounts: Record<string, number>
  onSelect: (id: string) => void
  onAdd: (name: string) => void
  onRename: (cat: MenuCategory, name: string) => void
  onDelete: (cat: MenuCategory) => void
}) {
  const t = useTranslate()
  const [adding, setAdding] = useState(false)
  const [newName, setNewName] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingName, setEditingName] = useState('')

  function commitAdd() {
    if (!newName.trim()) {
      setAdding(false)
      return
    }
    onAdd(newName)
    setNewName('')
    setAdding(false)
  }

  function commitRename(cat: MenuCategory) {
    if (editingName.trim() && editingName !== cat.name) onRename(cat, editingName)
    setEditingId(null)
  }

  return (
    <div className="flex flex-col overflow-hidden rounded-xl border bg-card">
      <div className="flex items-center justify-between border-b px-4 py-3">
        <h3 className="text-sm font-semibold">{t('menu.categories')}</h3>
        <Button variant="ghost" size="icon-sm" onClick={() => setAdding(true)}>
          <Plus className="h-4 w-4" />
        </Button>
      </div>
      <div className="max-h-[70vh] space-y-1 overflow-y-auto p-2">
        {isLoading && (
          <p className="p-4 text-center text-xs text-muted-foreground">{t('menu.loadingCategories')}</p>
        )}
        {!isLoading && categories.length === 0 && !adding && (
          <p className="p-4 text-center text-xs text-muted-foreground">{t('menu.noCategories')}</p>
        )}
        {categories.map((cat) => {
          const isSelected = cat.id === selectedCatId
          const isEditing = editingId === cat.id
          return (
            <div
              key={cat.id}
              className={cn(
                'group flex items-center gap-1 rounded-lg border p-2 text-sm transition-colors',
                isSelected
                  ? 'border-accent bg-accent/10'
                  : 'border-transparent hover:bg-muted/50',
              )}
            >
              {isEditing ? (
                <Input
                  autoFocus
                  value={editingName}
                  onChange={(e) => setEditingName(e.target.value)}
                  onBlur={() => commitRename(cat)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') commitRename(cat)
                    if (e.key === 'Escape') setEditingId(null)
                  }}
                  className="h-7 border-0 bg-transparent px-1 shadow-none focus-visible:ring-0"
                />
              ) : (
                <button
                  type="button"
                  onClick={() => onSelect(cat.id)}
                  className="flex min-w-0 flex-1 items-center gap-2 text-left"
                >
                  <span className="flex-1 truncate font-medium">{cat.name}</span>
                  <Badge variant="secondary" className="h-5 px-1.5 text-[10px]">
                    {itemCounts[cat.id] ?? 0}
                  </Badge>
                </button>
              )}
              {!isEditing && (
                <div className="flex opacity-0 transition-opacity group-hover:opacity-100">
                  <Button
                    variant="ghost"
                    size="icon-xs"
                    onClick={() => {
                      setEditingId(cat.id)
                      setEditingName(cat.name)
                    }}
                  >
                    <Pencil className="h-3 w-3" />
                  </Button>
                  <Button variant="ghost" size="icon-xs" onClick={() => onDelete(cat)}>
                    <Trash2 className="h-3 w-3 text-destructive" />
                  </Button>
                </div>
              )}
            </div>
          )
        })}
        {adding && (
          <div className="rounded-lg border p-2">
            <Input
              autoFocus
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onBlur={commitAdd}
              onKeyDown={(e) => {
                if (e.key === 'Enter') commitAdd()
                if (e.key === 'Escape') {
                  setAdding(false)
                  setNewName('')
                }
              }}
              placeholder={t('menu.categoryPlaceholder')}
              className="h-7 border-0 bg-transparent px-1 shadow-none focus-visible:ring-0"
            />
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Items Column ──────────────────────────────────────────────────────────

function ItemsColumn({
  category,
  items,
  isLoading,
  search,
  onSearchChange,
  selectedItemId,
  isCreating,
  onSelect,
  onCreate,
  onDelete,
  onToggleAvailability,
  togglingId,
}: {
  category: MenuCategory | null
  items: MenuItem[]
  isLoading: boolean
  search: string
  onSearchChange: (v: string) => void
  selectedItemId: string | null
  isCreating: boolean
  onSelect: (id: string) => void
  onCreate: () => void
  onDelete: (item: MenuItem) => void
  onToggleAvailability: (item: MenuItem, checked: boolean) => void
  togglingId?: string
}) {
  const t = useTranslate()

  return (
    <div className="flex flex-col overflow-hidden rounded-xl border bg-card">
      <div className="flex items-center justify-between gap-2 border-b px-4 py-3">
        <h3 className="truncate text-sm font-semibold">
          {category
            ? t('menu.menuItemsFor', { name: category.name })
            : t('menu.menuItems')}
        </h3>
        <Button variant="outline" size="sm" onClick={onCreate} disabled={!category}>
          <Plus className="h-4 w-4" data-icon="inline-start" />
          {t('menu.addItem')}
        </Button>
      </div>
      <div className="border-b px-4 py-2">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder={t('menu.searchPlaceholder')}
            className="h-9 pl-8"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
      </div>
      <div className="max-h-[60vh] divide-y overflow-y-auto">
        {isLoading && (
          <p className="p-6 text-center text-sm text-muted-foreground">
            {t('menu.loadingItems')}
          </p>
        )}
        {!isLoading && !category && (
          <p className="p-6 text-center text-sm text-muted-foreground">
            {t('onboarding.menu.selectCategoryFirst')}
          </p>
        )}
        {!isLoading && category && items.length === 0 && !isCreating && (
          <div className="flex flex-col items-center gap-2 p-10 text-sm text-muted-foreground">
            <UtensilsCrossed className="h-8 w-8 text-muted-foreground/40" />
            <p>{t('menu.noItems')}</p>
          </div>
        )}
        {items.map((item) => {
          const isSelected = item.id === selectedItemId
          return (
            <div
              key={item.id}
              role="button"
              tabIndex={0}
              onClick={() => onSelect(item.id)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') onSelect(item.id)
              }}
              className={cn(
                'flex cursor-pointer items-center gap-3 px-4 py-3 text-sm transition-colors',
                isSelected ? 'bg-accent/10' : 'hover:bg-muted/40',
              )}
            >
              <Thumbnail src={item.imageUrl} alt={item.name} size={40} />
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium">{item.name}</p>
                <p className="truncate text-xs text-muted-foreground">{formatRupiah(item.price)}</p>
              </div>
              <Switch
                checked={item.isAvailable}
                onCheckedChange={(checked) => onToggleAvailability(item, checked)}
                onClick={(e) => e.stopPropagation()}
                disabled={togglingId === item.id}
              />
              <DropdownMenu>
                <DropdownMenuTrigger
                  render={<Button variant="ghost" size="icon-xs" />}
                  onClick={(e) => e.stopPropagation()}
                >
                  <MoreHorizontal className="h-3.5 w-3.5" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => onSelect(item.id)}>
                    <Pencil className="h-3.5 w-3.5" />
                    {t('common.edit')}
                  </DropdownMenuItem>
                  <DropdownMenuItem variant="destructive" onClick={() => onDelete(item)}>
                    <Trash2 className="h-3.5 w-3.5" />
                    {t('common.delete')}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ─── Details Column ────────────────────────────────────────────────────────

function DetailsColumn({
  businessId,
  categories,
  selectedCatId,
  selectedItem,
  isCreating,
  onCreated,
  onClose,
  onRequestDelete,
  createMut,
  updateMut,
}: {
  businessId: string
  categories: MenuCategory[]
  selectedCatId: string | null
  selectedItem: MenuItem | null
  isCreating: boolean
  onCreated: (id: string) => void
  onClose: () => void
  onRequestDelete: (item: MenuItem) => void
  createMut: ReturnType<typeof useCreateMenuItem>
  updateMut: ReturnType<typeof useUpdateMenuItem>
}) {
  const t = useTranslate()

  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [price, setPrice] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [available, setAvailable] = useState(true)
  const [imageUrl, setImageUrl] = useState('')
  const [modifiers, setModifiers] = useState<ItemModifier[]>([])

  // Hydrate form from selection.
  useEffect(() => {
    if (selectedItem) {
      setName(selectedItem.name)
      setDescription(selectedItem.description ?? '')
      setPrice(selectedItem.price.toString())
      setCategoryId(selectedItem.categoryId)
      setAvailable(selectedItem.isAvailable)
      setImageUrl(selectedItem.imageUrl ?? '')
      setModifiers(getItemMods(selectedItem.id))
    } else if (isCreating) {
      setName('')
      setDescription('')
      setPrice('')
      setCategoryId(selectedCatId ?? categories[0]?.id ?? '')
      setAvailable(true)
      setImageUrl('')
      setModifiers([])
    }
  }, [selectedItem, isCreating, selectedCatId, categories])

  if (!selectedItem && !isCreating) {
    return (
      <div className="flex min-h-[320px] flex-col items-center justify-center rounded-xl border border-dashed bg-muted/30 p-10 text-center">
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-background shadow-sm ring-1 ring-border">
          <UtensilsCrossed className="h-6 w-6 text-muted-foreground" />
        </div>
        <p className="text-base font-medium text-foreground">{t('menu.selectItemHint')}</p>
        <p className="mt-1.5 max-w-xs text-sm text-muted-foreground">
          {t('menu.selectItemHintSub')}
        </p>
      </div>
    )
  }

  const isPending = createMut.isPending || updateMut.isPending

  function handleSave() {
    if (!name.trim()) {
      toast.error(t('menu.validation.nameRequired' as any) || 'Name is required')
      return
    }
    const priceNum = parseInt(price, 10)
    if (!price || isNaN(priceNum) || priceNum <= 0) {
      toast.error(t('menu.validation.priceRequired' as any) || 'Price must be greater than 0')
      return
    }
    if (!categoryId) {
      toast.error(t('menu.validation.categoryRequired' as any) || 'Category is required')
      return
    }
    const payload = {
      name: name.trim(),
      description: description.trim(),
      price: priceNum,
      categoryId,
      businessId,
      imageUrl: imageUrl || undefined,
    }
    if (selectedItem) {
      updateMut.mutate(
        { id: selectedItem.id, ...payload },
        {
          onSuccess: () => {
            setItemMods(selectedItem.id, modifiers)
            toast.success(t('toast.updated'))
          },
          onError: (e: any) => toast.error(e?.message || t('toast.error')),
        },
      )
    } else {
      createMut.mutate(payload, {
        onSuccess: (res: any) => {
          if (res?.id) {
            setItemMods(res.id, modifiers)
            onCreated(res.id)
          }
          toast.success(t('toast.created'))
        },
        onError: (e: any) => toast.error(e?.message || t('toast.error')),
      })
    }
  }

  return (
    <div className="flex flex-col overflow-hidden rounded-xl border bg-card">
      <div className="flex items-center justify-between border-b px-4 py-3">
        <h3 className="text-sm font-semibold">
          {isCreating ? t('menu.addItem') : t('menu.editItem')}
        </h3>
        <Button variant="ghost" size="icon-sm" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>
      <div className="max-h-[70vh] space-y-4 overflow-y-auto p-4">
        <ImagePickerField label={t('menu.image')} value={imageUrl} onChange={setImageUrl} />

        <div className="space-y-2">
          <Label htmlFor="detail-name">{t('common.name')}</Label>
          <Input
            id="detail-name"
            placeholder={t('menu.menuNamePlaceholder')}
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="detail-desc">{t('common.description')}</Label>
          <Textarea
            id="detail-desc"
            placeholder={t('menu.menuDescPlaceholder')}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label htmlFor="detail-price">{t('menu.priceLabel')}</Label>
            <Input
              id="detail-price"
              type="number"
              min={0}
              placeholder="0"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>{t('menu.category')}</Label>
            <Select value={categoryId} onValueChange={(v) => setCategoryId(v ?? '')}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder={t('menu.selectCategory')} />
              </SelectTrigger>
              <SelectContent>
                {categories.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex items-center justify-between rounded-lg border p-3">
          <div>
            <p className="text-sm font-medium">{t('menu.availableToggle')}</p>
            <p className="text-xs text-muted-foreground">{t('menu.availableDesc')}</p>
          </div>
          <Switch checked={available} onCheckedChange={setAvailable} />
        </div>

        <ModifiersEditor modifiers={modifiers} onChange={setModifiers} />
      </div>
      <div className="flex items-center justify-between gap-2 border-t bg-muted/30 p-3">
        {selectedItem ? (
          <Button
            type="button"
            variant="ghost"
            className="text-destructive hover:text-destructive"
            onClick={() => onRequestDelete(selectedItem)}
          >
            <Trash2 className="h-4 w-4" data-icon="inline-start" />
            {t('common.delete')}
          </Button>
        ) : (
          <span />
        )}
        <div className="flex gap-2">
          <Button type="button" variant="outline" onClick={onClose}>
            {t('common.cancel')}
          </Button>
          <Button type="button" onClick={handleSave} disabled={isPending}>
            {isPending ? t('common.saving') : t('common.save')}
          </Button>
        </div>
      </div>
    </div>
  )
}

// ─── Modifiers Editor ──────────────────────────────────────────────────────

function ModifiersEditor({
  modifiers,
  onChange,
}: {
  modifiers: ItemModifier[]
  onChange: (m: ItemModifier[]) => void
}) {
  const t = useTranslate()

  function add() {
    onChange([
      ...modifiers,
      { id: `mod-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`, name: '', priceDelta: 0 },
    ])
  }

  function update(id: string, patch: Partial<ItemModifier>) {
    onChange(modifiers.map((m) => (m.id === id ? { ...m, ...patch } : m)))
  }

  function remove(id: string) {
    onChange(modifiers.filter((m) => m.id !== id))
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label>{t('menu.modifiersSection')}</Label>
        <Button type="button" variant="outline" size="sm" onClick={add}>
          <Plus className="h-3 w-3" data-icon="inline-start" />
          {t('menu.addModifier')}
        </Button>
      </div>
      {modifiers.length === 0 ? (
        <p className="rounded-lg border border-dashed py-4 text-center text-xs text-muted-foreground">
          {t('menu.noModifiersForItem')}
        </p>
      ) : (
        <div className="space-y-2">
          {modifiers.map((mod) => (
            <div key={mod.id} className="flex items-center gap-2 rounded-lg border p-2">
              <Input
                placeholder={t('menu.modifierNamePlaceholder')}
                className="flex-1"
                value={mod.name}
                onChange={(e) => update(mod.id, { name: e.target.value })}
              />
              <Input
                type="number"
                min={0}
                placeholder="0"
                className="w-28"
                value={mod.priceDelta === 0 ? '' : mod.priceDelta.toString()}
                onChange={(e) => {
                  const v = parseInt(e.target.value, 10)
                  update(mod.id, { priceDelta: isNaN(v) || v < 0 ? 0 : v })
                }}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon-xs"
                className="text-destructive hover:text-destructive"
                onClick={() => remove(mod.id)}
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Bulk Import Dialog (standalone — no onboarding context) ───────────────

function BulkImportDialog({
  open,
  onOpenChange,
  businessId,
  existingCategories,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  businessId: string
  existingCategories: MenuCategory[]
}) {
  const t = useTranslate()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [parsing, setParsing] = useState(false)
  const [importing, setImporting] = useState(false)
  const [result, setResult] = useState<ParseResult | null>(null)
  const [fileName, setFileName] = useState('')

  const createCategory = useCreateCategory()
  const createMenuItem = useCreateMenuItem()

  function reset() {
    setResult(null)
    setFileName('')
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  function handleClose() {
    if (importing) return
    reset()
    onOpenChange(false)
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setFileName(file.name)
    setParsing(true)
    try {
      setResult(await parseMenuFile(file))
    } catch (err: any) {
      toast.error(err?.message || t('toast.error'))
    } finally {
      setParsing(false)
    }
  }

  async function handleConfirm() {
    if (!result) return
    setImporting(true)

    // Build name → categoryId map (existing categories first).
    const nameToId: Map<string, string> = new Map(
      existingCategories.map((c) => [c.name.trim().toLowerCase(), c.id]),
    )

    let created = 0
    let failed = 0

    // Ensure every unique category in the import exists.
    const uniqueCats = Array.from(new Set(result.valid.map((r) => r.category.trim())))
    for (const catName of uniqueCats) {
      const key = catName.toLowerCase()
      if (nameToId.has(key)) continue
      try {
        const res: any = await createCategory.mutateAsync({
          name: catName,
          description: '',
          businessId,
          sortOrder: nameToId.size,
        })
        if (res?.id) nameToId.set(key, res.id)
      } catch (err: any) {
        failed += 1
        toast.error(`Category "${catName}": ${err?.message || 'failed'}`)
      }
    }

    for (const row of result.valid) {
      const catId = nameToId.get(row.category.trim().toLowerCase())
      if (!catId) {
        failed += 1
        continue
      }
      try {
        await createMenuItem.mutateAsync({
          name: row.name,
          description: row.description ?? '',
          price: row.price,
          categoryId: catId,
          businessId,
        })
        created += 1
      } catch {
        failed += 1
      }
    }

    setImporting(false)
    if (created > 0) {
      toast.success(
        t('onboarding.menu.import.done', { created, failed: failed + result.errors.length }),
      )
    } else if (failed + result.errors.length > 0) {
      toast.error(
        t('onboarding.menu.import.done', { created, failed: failed + result.errors.length }),
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
          <div className="flex flex-wrap items-center gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              disabled={parsing || importing}
            >
              <Upload className="h-4 w-4" />
              {t('onboarding.menu.import.button')}
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <Button type="button" variant="ghost" size="sm">
                    <Download className="h-4 w-4" data-icon="inline-start" />
                    {t('onboarding.menu.import.downloadTemplate')}
                  </Button>
                }
              />
              <DropdownMenuContent align="start">
                <DropdownMenuItem
                  onClick={() => {
                    const a = document.createElement('a')
                    a.href = '/menu-import-template.csv'
                    a.download = 'menu-import-template.csv'
                    a.click()
                  }}
                >
                  <FileText className="h-3.5 w-3.5" />
                  CSV (.csv)
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => void downloadXlsxTemplate()}>
                  <FileText className="h-3.5 w-3.5" />
                  Excel (.xlsx)
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
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
                          <td className="px-3 py-1.5 text-right tabular-nums">
                            {row.price.toLocaleString()}
                          </td>
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
            className="bg-accent text-accent-foreground hover:bg-accent/90"
          >
            {importing ? t('common.saving') : t('onboarding.menu.import.confirm')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

async function downloadXlsxTemplate() {
  const XLSX = await import('xlsx')
  const { TEMPLATE_ROWS } = await import('@/lib/menu-import-template')
  const ws = XLSX.utils.json_to_sheet(TEMPLATE_ROWS)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'menu')
  XLSX.writeFile(wb, 'menu-import-template.xlsx')
}

// ─── Shared helpers ────────────────────────────────────────────────────────

function Thumbnail({
  src,
  alt,
  size = 40,
}: {
  src?: string
  alt: string
  size?: number
}) {
  const dim = { width: `${size}px`, height: `${size}px` }
  const resolvedSrc = src?.startsWith('/')
    ? `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'}${src}`
    : src
  if (resolvedSrc) {
    return (
      <div className="shrink-0 overflow-hidden rounded-lg border" style={dim}>
        <img src={resolvedSrc} alt={alt} className="h-full w-full object-cover" />
      </div>
    )
  }
  return (
    <div
      className="flex shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground"
      style={dim}
    >
      <UtensilsCrossed className="h-4 w-4" />
    </div>
  )
}

function ImagePickerField({
  label,
  value,
  onChange,
}: {
  label: string
  value: string
  onChange: (v: string) => void
}) {
  const t = useTranslate()
  const inputRef = useRef<HTMLInputElement>(null)

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 2 * 1024 * 1024) {
      toast.error(t('menu.imageTooLarge' as any) || 'File too large (max 2MB)')
      return
    }
    if (!file.type.startsWith('image/')) {
      toast.error(t('menu.imageInvalidType' as any) || 'Invalid file type')
      return
    }
    const reader = new FileReader()
    reader.onload = () => onChange(reader.result as string)
    reader.readAsDataURL(file)
  }

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/jpg,image/webp"
        className="hidden"
        onChange={handleUpload}
      />
      {value ? (
        <div className="relative overflow-hidden rounded-lg border">
          <img src={value} alt="Preview" className="h-40 w-full object-cover" />
          <button
            type="button"
            className="absolute right-2 top-2 rounded-full bg-black/60 p-1 text-white hover:bg-black/80"
            onClick={() => onChange('')}
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="flex w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/25 bg-muted/30 px-4 py-6 text-center transition-colors hover:border-muted-foreground/50"
        >
          <ImagePlus className="mb-2 h-8 w-8 text-muted-foreground/50" />
          <p className="text-sm text-muted-foreground">{t('menu.uploadImage')}</p>
          <p className="mt-1 text-xs text-muted-foreground/60">{t('menu.maxFileSize')}</p>
        </button>
      )}
    </div>
  )
}

// Ensure `api` import remains (used by future direct calls).
void api
