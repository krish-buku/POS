import { createFileRoute } from '@tanstack/react-router'
import { useMemo, useState } from 'react'
import { toast } from 'sonner'
import { useAuth } from '@/lib/auth-context'
import {
  useFloors,
  useAreas,
  useCreateFloor,
  useUpdateFloor,
  useDeleteFloor,
  useCreateArea,
  useUpdateArea,
  useDeleteArea,
} from '@/lib/api-hooks'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Building2, Plus, Pencil, Trash2, MapPin } from 'lucide-react'

export const Route = createFileRoute('/_app/settings/floors')({
  component: FloorsPage,
})

interface FloorRow {
  id: string
  name: string
  sortOrder: number
}

interface AreaRow {
  id: string
  name: string
  floorId: string
  sortOrder: number
}

function FloorsPage() {
  const { currentBusiness } = useAuth()
  const businessId = currentBusiness?.id ?? 'biz-001'

  const { data: floors = [], isLoading: floorsLoading } = useFloors(businessId)
  const { data: areas = [], isLoading: areasLoading } = useAreas(businessId)

  const createFloor = useCreateFloor()
  const updateFloor = useUpdateFloor()
  const deleteFloor = useDeleteFloor()
  const createArea = useCreateArea()
  const updateArea = useUpdateArea()
  const deleteArea = useDeleteArea()

  const [floorDialog, setFloorDialog] = useState<{ open: boolean; edit?: FloorRow | null }>({
    open: false,
  })
  const [areaDialog, setAreaDialog] = useState<{ open: boolean; edit?: AreaRow | null }>({
    open: false,
  })

  const [floorForm, setFloorForm] = useState({ name: '', sortOrder: 1 })
  const [areaForm, setAreaForm] = useState({ name: '', floorId: '', sortOrder: 1 })

  const areasByFloor = useMemo(() => {
    const m: Record<string, AreaRow[]> = {}
    for (const a of areas as AreaRow[]) {
      if (!m[a.floorId]) m[a.floorId] = []
      m[a.floorId].push(a)
    }
    return m
  }, [areas])

  const openFloorDialog = (edit?: FloorRow) => {
    setFloorForm({ name: edit?.name ?? '', sortOrder: edit?.sortOrder ?? floors.length + 1 })
    setFloorDialog({ open: true, edit })
  }

  const submitFloor = async () => {
    if (!floorForm.name.trim()) {
      toast.error('Nama lantai wajib diisi')
      return
    }
    try {
      if (floorDialog.edit) {
        await updateFloor.mutateAsync({
          id: floorDialog.edit.id,
          data: { name: floorForm.name, businessId, sortOrder: floorForm.sortOrder },
        })
        toast.success('Lantai diperbarui')
      } else {
        await createFloor.mutateAsync({
          name: floorForm.name,
          businessId,
          sortOrder: floorForm.sortOrder,
        })
        toast.success('Lantai dibuat')
      }
      setFloorDialog({ open: false })
    } catch (e: any) {
      toast.error(e.message ?? 'Gagal menyimpan')
    }
  }

  const removeFloor = async (id: string) => {
    if (!confirm('Hapus lantai ini beserta area di dalamnya?')) return
    try {
      await deleteFloor.mutateAsync({ id, businessId })
      toast.success('Lantai dihapus')
    } catch (e: any) {
      toast.error(e.message ?? 'Gagal menghapus')
    }
  }

  const openAreaDialog = (edit?: AreaRow, floorId?: string) => {
    setAreaForm({
      name: edit?.name ?? '',
      floorId: edit?.floorId ?? floorId ?? (floors[0]?.id ?? ''),
      sortOrder: edit?.sortOrder ?? 1,
    })
    setAreaDialog({ open: true, edit })
  }

  const submitArea = async () => {
    if (!areaForm.name.trim()) {
      toast.error('Nama area wajib diisi')
      return
    }
    if (!areaForm.floorId) {
      toast.error('Pilih lantai')
      return
    }
    try {
      if (areaDialog.edit) {
        await updateArea.mutateAsync({
          id: areaDialog.edit.id,
          data: {
            name: areaForm.name,
            floorId: areaForm.floorId,
            businessId,
            sortOrder: areaForm.sortOrder,
          },
        })
        toast.success('Area diperbarui')
      } else {
        await createArea.mutateAsync({
          name: areaForm.name,
          floorId: areaForm.floorId,
          businessId,
          sortOrder: areaForm.sortOrder,
        })
        toast.success('Area dibuat')
      }
      setAreaDialog({ open: false })
    } catch (e: any) {
      toast.error(e.message ?? 'Gagal menyimpan')
    }
  }

  const removeArea = async (id: string) => {
    if (!confirm('Hapus area ini?')) return
    try {
      await deleteArea.mutateAsync({ id, businessId })
      toast.success('Area dihapus')
    } catch (e: any) {
      toast.error(e.message ?? 'Gagal menghapus')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-xl font-semibold">Lantai & Area</h2>
          <p className="text-sm text-muted-foreground">
            Atur lantai (storey) dan area (section) untuk mengelompokkan meja restoran
          </p>
        </div>
      </div>

      {/* Floors */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <div className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-primary" />
            <CardTitle>Lantai</CardTitle>
          </div>
          <Dialog
            open={floorDialog.open}
            onOpenChange={(open) => setFloorDialog({ open, edit: open ? floorDialog.edit : null })}
          >
            <DialogTrigger render={<Button size="sm" onClick={() => openFloorDialog()} />}>
              <Plus className="h-4 w-4 mr-1" /> Tambah Lantai
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{floorDialog.edit ? 'Edit Lantai' : 'Tambah Lantai'}</DialogTitle>
                <DialogDescription>
                  Lantai adalah unit terluar dari tata letak meja (mis. Lantai 1, Lantai 2).
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-3">
                <div>
                  <Label htmlFor="floor-name">Nama</Label>
                  <Input
                    id="floor-name"
                    value={floorForm.name}
                    onChange={(e) => setFloorForm({ ...floorForm, name: e.target.value })}
                    placeholder="Lantai 1"
                  />
                </div>
                <div>
                  <Label htmlFor="floor-order">Urutan</Label>
                  <Input
                    id="floor-order"
                    type="number"
                    value={floorForm.sortOrder}
                    onChange={(e) =>
                      setFloorForm({ ...floorForm, sortOrder: Number(e.target.value) || 0 })
                    }
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setFloorDialog({ open: false })}>
                  Batal
                </Button>
                <Button onClick={submitFloor} disabled={createFloor.isPending || updateFloor.isPending}>
                  Simpan
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          {floorsLoading ? (
            <p className="text-sm text-muted-foreground">Memuat...</p>
          ) : floors.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Belum ada lantai. Tambahkan lantai pertama Anda.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nama</TableHead>
                  <TableHead>Urutan</TableHead>
                  <TableHead>Area</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(floors as FloorRow[])
                  .slice()
                  .sort((a, b) => a.sortOrder - b.sortOrder)
                  .map((f) => (
                    <TableRow key={f.id}>
                      <TableCell className="font-medium">{f.name}</TableCell>
                      <TableCell>{f.sortOrder}</TableCell>
                      <TableCell>{areasByFloor[f.id]?.length ?? 0} area</TableCell>
                      <TableCell className="text-right space-x-2">
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => openFloorDialog(f)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => removeFloor(f.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Areas */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <div className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-primary" />
            <CardTitle>Area</CardTitle>
          </div>
          <Dialog
            open={areaDialog.open}
            onOpenChange={(open) => setAreaDialog({ open, edit: open ? areaDialog.edit : null })}
          >
            <DialogTrigger
              render={
                <Button
                  size="sm"
                  onClick={() => openAreaDialog()}
                  disabled={floors.length === 0}
                />
              }
            >
              <Plus className="h-4 w-4 mr-1" /> Tambah Area
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{areaDialog.edit ? 'Edit Area' : 'Tambah Area'}</DialogTitle>
                <DialogDescription>
                  Area mengelompokkan meja dalam satu lantai (mis. Indoor, Teras, VIP).
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-3">
                <div>
                  <Label htmlFor="area-floor">Lantai</Label>
                  <Select
                    value={areaForm.floorId}
                    onValueChange={(v) => {
                      if (v) setAreaForm({ ...areaForm, floorId: v })
                    }}
                  >
                    <SelectTrigger id="area-floor">
                      <SelectValue placeholder="Pilih lantai" />
                    </SelectTrigger>
                    <SelectContent>
                      {(floors as FloorRow[]).map((f) => (
                        <SelectItem key={f.id} value={f.id}>
                          {f.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="area-name">Nama</Label>
                  <Input
                    id="area-name"
                    value={areaForm.name}
                    onChange={(e) => setAreaForm({ ...areaForm, name: e.target.value })}
                    placeholder="Indoor"
                  />
                </div>
                <div>
                  <Label htmlFor="area-order">Urutan</Label>
                  <Input
                    id="area-order"
                    type="number"
                    value={areaForm.sortOrder}
                    onChange={(e) =>
                      setAreaForm({ ...areaForm, sortOrder: Number(e.target.value) || 0 })
                    }
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setAreaDialog({ open: false })}>
                  Batal
                </Button>
                <Button onClick={submitArea} disabled={createArea.isPending || updateArea.isPending}>
                  Simpan
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          {areasLoading ? (
            <p className="text-sm text-muted-foreground">Memuat...</p>
          ) : areas.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Belum ada area. Tambahkan lantai terlebih dulu lalu buat area di dalamnya.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nama</TableHead>
                  <TableHead>Lantai</TableHead>
                  <TableHead>Urutan</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(areas as AreaRow[])
                  .slice()
                  .sort((a, b) => a.sortOrder - b.sortOrder)
                  .map((a) => (
                    <TableRow key={a.id}>
                      <TableCell className="font-medium">{a.name}</TableCell>
                      <TableCell>
                        {(floors as FloorRow[]).find((f) => f.id === a.floorId)?.name ?? '—'}
                      </TableCell>
                      <TableCell>{a.sortOrder}</TableCell>
                      <TableCell className="text-right space-x-2">
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => openAreaDialog(a)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => removeArea(a.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
