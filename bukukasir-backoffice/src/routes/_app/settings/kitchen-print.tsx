import { createFileRoute } from '@tanstack/react-router'
import { useState, useCallback, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Printer, Save, Plus, Trash2 } from 'lucide-react'
import { useTranslate } from '@/lib/i18n-context'
import { useAuth } from '@/lib/auth-context'
import { useCategories } from '@/lib/api-hooks'
import { toast } from 'sonner'

export const Route = createFileRoute('/_app/settings/kitchen-print')({
  component: KitchenPrintPage,
})

const KITCHEN_PRINT_STORAGE_KEY = 'bukukasir_kitchen_print_settings'

interface KitchenPrintSettings {
  showTable: boolean
  showSession: boolean
  showStaff: boolean
  showNotes: boolean
  autoPrintOnSend: boolean
  reprintMarker: boolean
}

function loadSettings(): Partial<KitchenPrintSettings> {
  try {
    const stored = localStorage.getItem(KITCHEN_PRINT_STORAGE_KEY)
    if (stored) return JSON.parse(stored)
  } catch { /* ignore */ }
  return {}
}

function KitchenPrintPage() {
  const t = useTranslate()
  const saved = loadSettings()
  const [showTable, setShowTable] = useState(saved.showTable ?? true)
  const [showSession, setShowSession] = useState(saved.showSession ?? true)
  const [showStaff, setShowStaff] = useState(saved.showStaff ?? true)
  const [showNotes, setShowNotes] = useState(saved.showNotes ?? true)
  const [autoPrintOnSend, setAutoPrintOnSend] = useState(saved.autoPrintOnSend ?? true)
  const [reprintMarker, setReprintMarker] = useState(saved.reprintMarker ?? false)

  const handleSave = useCallback(() => {
    try {
      const settings: KitchenPrintSettings = { showTable, showSession, showStaff, showNotes, autoPrintOnSend, reprintMarker }
      localStorage.setItem(KITCHEN_PRINT_STORAGE_KEY, JSON.stringify(settings))
      toast.success(t('toast.saved'))
    } catch {
      toast.error(t('toast.error'))
    }
  }, [showTable, showSession, showStaff, showNotes, autoPrintOnSend, reprintMarker, t])

  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        {/* Settings */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Printer className="h-5 w-5 text-blue-600" />
                {t('kitchen.title')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                {t('kitchen.subtitle')}
              </p>

              <Separator />

              <div className="space-y-4">
                <ToggleRow
                  label={t('kitchen.showTable')}
                  description={t('kitchen.showTableDesc')}
                  checked={showTable}
                  onCheckedChange={setShowTable}
                />
                <ToggleRow
                  label={t('kitchen.showSession')}
                  description={t('kitchen.showSessionDesc')}
                  checked={showSession}
                  onCheckedChange={setShowSession}
                />
                <ToggleRow
                  label={t('kitchen.showStaff')}
                  description={t('kitchen.showStaffDesc')}
                  checked={showStaff}
                  onCheckedChange={setShowStaff}
                />
                <ToggleRow
                  label={t('kitchen.showNotes')}
                  description={t('kitchen.showNotesDesc')}
                  checked={showNotes}
                  onCheckedChange={setShowNotes}
                />
              </div>

              <Separator />

              <div className="space-y-4">
                <ToggleRow
                  label={t('kitchen.autoPrint')}
                  description={t('kitchen.autoPrintDesc')}
                  checked={autoPrintOnSend}
                  onCheckedChange={setAutoPrintOnSend}
                />
                <ToggleRow
                  label={t('kitchen.reprint')}
                  description={t('kitchen.reprintDesc')}
                  checked={reprintMarker}
                  onCheckedChange={setReprintMarker}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Ticket Preview */}
        <div className="lg:sticky lg:top-20">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">{t('kitchen.preview')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mx-auto max-w-[240px] rounded-md border bg-white p-4 font-mono text-[10px] leading-tight text-black shadow-inner">
                {/* Ticket Header */}
                <div className="text-center space-y-0.5">
                  <div className="font-bold text-sm">{t('kitchen.ticketTitle')}</div>
                  {reprintMarker && (
                    <div className="font-bold text-[11px] border border-black px-1 inline-block">
                      {t('kitchen.reprintLabel')}
                    </div>
                  )}
                </div>

                <div className="my-2 border-t border-dashed border-gray-400" />

                {/* Order Info */}
                <div className="space-y-0.5">
                  <div className="flex justify-between font-bold text-[11px]">
                    <span>ORD-20260328-002</span>
                  </div>
                  <div className="flex justify-between">
                    <span>{t('kitchen.previewTime')}:</span>
                    <span>28/03/2026 12:15</span>
                  </div>
                  {showTable && (
                    <div className="flex justify-between font-bold text-xs">
                      <span>{t('kitchen.previewTable')}:</span>
                      <span>T3</span>
                    </div>
                  )}
                  {showSession && (
                    <div className="flex justify-between">
                      <span>{t('kitchen.previewSession')}:</span>
                      <span>#1</span>
                    </div>
                  )}
                  {showStaff && (
                    <div className="flex justify-between">
                      <span>{t('kitchen.previewStaff')}:</span>
                      <span>Dewi Lestari</span>
                    </div>
                  )}
                </div>

                <div className="my-2 border-t border-dashed border-gray-400" />

                {/* Items */}
                <div className="space-y-2">
                  <div>
                    <div className="flex justify-between font-bold">
                      <span>1x</span>
                      <span className="flex-1 ml-2">Ayam Bakar Madu</span>
                    </div>
                    <div className="text-gray-500 pl-4">- Paha</div>
                    <div className="text-gray-500 pl-4">+ Nasi Putih</div>
                  </div>
                  <div>
                    <div className="flex justify-between font-bold">
                      <span>1x</span>
                      <span className="flex-1 ml-2">Kopi Susu Gula Aren</span>
                    </div>
                    <div className="text-gray-500 pl-4">- Iced</div>
                  </div>
                </div>

                {showNotes && (
                  <>
                    <div className="my-2 border-t border-dashed border-gray-400" />
                    <div className="space-y-0.5">
                      <div className="font-bold">{t('kitchen.previewNotes')}:</div>
                      <div className="text-gray-600">
                        Ayam jangan terlalu pedas
                      </div>
                    </div>
                  </>
                )}

                <div className="my-2 border-t border-dashed border-gray-400" />

                <div className="text-center text-gray-500">
                  {t('kitchen.previewCustomer')}: Pak Joko
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <PrinterRoutingCard />

      <Separator />

      <div className="flex justify-end">
        <Button onClick={handleSave}>
          <Save className="h-4 w-4" />
          {t('common.save')}
        </Button>
      </div>
    </div>
  )
}

// ─── Printer Routing (localStorage-backed) ─────────────────────────────────────

interface PrinterConfig {
  id: string
  name: string
  location: string
  categoryIds: string[]
}

const PRINTER_ROUTING_KEY = 'bukukasir_printer_routing'

function loadPrinters(): PrinterConfig[] {
  try {
    const stored = localStorage.getItem(PRINTER_ROUTING_KEY)
    if (stored) return JSON.parse(stored)
  } catch { /* ignore */ }
  return [
    { id: 'printer-kitchen', name: 'Printer Dapur', location: 'Kitchen', categoryIds: [] },
  ]
}

function savePrinters(list: PrinterConfig[]) {
  try {
    localStorage.setItem(PRINTER_ROUTING_KEY, JSON.stringify(list))
  } catch { /* ignore */ }
}

function PrinterRoutingCard() {
  const { currentBusiness } = useAuth()
  const businessId = currentBusiness?.id ?? 'biz-001'
  const { data: categories = [] } = useCategories(businessId)
  const [printers, setPrinters] = useState<PrinterConfig[]>(loadPrinters)
  const [newName, setNewName] = useState('')
  const [newLocation, setNewLocation] = useState('')

  useEffect(() => {
    savePrinters(printers)
  }, [printers])

  const addPrinter = () => {
    if (!newName.trim()) return
    setPrinters((curr) => [
      ...curr,
      {
        id: `printer-${Date.now()}`,
        name: newName.trim(),
        location: newLocation.trim() || '—',
        categoryIds: [],
      },
    ])
    setNewName('')
    setNewLocation('')
    toast.success('Printer ditambahkan')
  }

  const removePrinter = (id: string) => {
    setPrinters((curr) => curr.filter((p) => p.id !== id))
  }

  const toggleCategory = (printerId: string, categoryId: string) => {
    setPrinters((curr) =>
      curr.map((p) => {
        if (p.id !== printerId) return p
        const has = p.categoryIds.includes(categoryId)
        return {
          ...p,
          categoryIds: has
            ? p.categoryIds.filter((c) => c !== categoryId)
            : [...p.categoryIds, categoryId],
        }
      }),
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Printer className="h-5 w-5 text-primary" />
          Printer Routing
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Assign menu categories to specific kitchen printers (bar / grill / dapur utama).
          Items get routed to the matching printer when the order is sent.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2 items-end">
          <div className="flex-1">
            <Label htmlFor="printer-name">Nama Printer</Label>
            <Input
              id="printer-name"
              placeholder="Printer Bar"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
            />
          </div>
          <div className="flex-1">
            <Label htmlFor="printer-location">Lokasi</Label>
            <Input
              id="printer-location"
              placeholder="Bar"
              value={newLocation}
              onChange={(e) => setNewLocation(e.target.value)}
            />
          </div>
          <Button onClick={addPrinter} disabled={!newName.trim()}>
            <Plus className="h-4 w-4" /> Tambah
          </Button>
        </div>

        {printers.length === 0 ? (
          <p className="text-sm text-muted-foreground italic">Belum ada printer.</p>
        ) : (
          <div className="space-y-3">
            {printers.map((p) => (
              <div key={p.id} className="rounded-lg border p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-sm">{p.name}</p>
                    <p className="text-xs text-muted-foreground">{p.location}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => removePrinter(p.id)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {(categories as any[]).length === 0 ? (
                    <span className="text-xs text-muted-foreground italic">
                      Tidak ada kategori
                    </span>
                  ) : (
                    (categories as any[]).map((c: any) => {
                      const active = p.categoryIds.includes(c.id)
                      return (
                        <Badge
                          key={c.id}
                          variant={active ? 'default' : 'outline'}
                          className="cursor-pointer select-none"
                          onClick={() => toggleCategory(p.id, c.id)}
                        >
                          {c.name}
                        </Badge>
                      )
                    })
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
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
