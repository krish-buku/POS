import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { toast } from 'sonner'
import { formatRupiah } from '@/lib/mock-data'
import type { StaffRole } from '@/lib/mock-data'
import { useAuth } from '@/lib/auth-context'
import { useTranslate } from '@/lib/i18n-context'
import { useStaff, useOrders, useCreateStaff, useUpdateStaff, useResetStaffPin } from '@/lib/api-hooks'
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
import { Users, Plus, KeyRound, Pencil, UserX } from 'lucide-react'

export const Route = createFileRoute('/_app/settings/staff')({
  component: StaffPage,
})

interface StaffMember {
  id: string
  name: string
  phone: string
  role: StaffRole
  isActive: boolean
}

const roleVariants: Record<StaffRole, 'default' | 'secondary' | 'outline'> = {
  owner: 'default',
  manager: 'secondary',
  cashier: 'outline',
  waiter: 'outline',
}

function StaffPage() {
  const { currentBusiness } = useAuth()
  const businessId = currentBusiness?.id ?? 'biz-001'
  const { data: apiStaff = [], isLoading: staffLoading } = useStaff(businessId)
  const { data: apiOrders = [] } = useOrders(businessId)

  const createStaff = useCreateStaff()
  const updateStaff = useUpdateStaff()
  const resetStaffPin = useResetStaffPin()

  const t = useTranslate()

  const roleLabels: Record<StaffRole, string> = {
    owner: t('role.owner'),
    manager: t('role.manager'),
    cashier: t('role.cashier'),
    waiter: t('role.waiter'),
  }

  const staffList: StaffMember[] = apiStaff.map((s: any) => ({
    id: s.id,
    name: s.name,
    phone: s.phone ?? '',
    role: (s.role?.toLowerCase() ?? 'cashier') as StaffRole,
    isActive: s.isActive ?? s.active ?? true,
  }))

  const [addDialogOpen, setAddDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [resetPinDialogOpen, setResetPinDialogOpen] = useState(false)
  const [selectedStaff, setSelectedStaff] = useState<StaffMember | null>(null)
  const [resetPinResult, setResetPinResult] = useState<string | null>(null)

  const [newName, setNewName] = useState('')
  const [newPhone, setNewPhone] = useState('')
  const [newRole, setNewRole] = useState<StaffRole>('cashier')
  const [newPin, setNewPin] = useState('')

  // Staff performance data (from API orders)
  const staffPerformance = staffList.map((staff) => {
    const staffOrders = apiOrders.filter((o: any) => o.staffName === staff.name)
    return {
      ...staff,
      ordersCount: staffOrders.length,
      totalSales: staffOrders.reduce((sum: number, o: any) => sum + (o.total ?? 0), 0),
    }
  })

  const handleAddStaff = () => {
    if (!newName.trim() || !newPhone.trim() || !newPin.trim()) return
    if (newPin.length < 4 || newPin.length > 6) {
      toast.error(t('staff.pinLength'))
      return
    }
    createStaff.mutate(
      { name: newName.trim(), phone: newPhone.trim(), role: newRole, businessId, pin: newPin.trim(), active: true },
      {
        onSuccess: () => {
          setNewName('')
          setNewPhone('')
          setNewRole('cashier')
          setNewPin('')
          setAddDialogOpen(false)
          toast.success(t('toast.created'))
        },
        onError: (e: any) => toast.error(e?.message || t('toast.error')),
      },
    )
  }

  const handleEditStaff = () => {
    if (!selectedStaff || !newName.trim() || !newPhone.trim()) return
    updateStaff.mutate(
      { id: selectedStaff.id, name: newName.trim(), phone: newPhone.trim(), role: newRole, businessId, active: selectedStaff.isActive },
      {
        onSuccess: () => {
          setEditDialogOpen(false)
          setSelectedStaff(null)
          toast.success(t('toast.updated'))
        },
        onError: (e: any) => toast.error(e?.message || t('toast.error')),
      },
    )
  }

  const openEditDialog = (staff: StaffMember) => {
    setSelectedStaff(staff)
    setNewName(staff.name)
    setNewPhone(staff.phone)
    setNewRole(staff.role)
    setEditDialogOpen(true)
  }

  const handleToggleActive = (staff: StaffMember, active: boolean) => {
    updateStaff.mutate({
      id: staff.id,
      name: staff.name,
      phone: staff.phone,
      role: staff.role,
      businessId,
      active,
    }, {
      onSuccess: () => toast.success(t('toast.updated')),
      onError: (e: any) => toast.error(e?.message || t('toast.error')),
    })
  }

  const openResetPinDialog = (staff: StaffMember) => {
    setSelectedStaff(staff)
    setResetPinResult(null)
    setResetPinDialogOpen(true)
  }

  const handleResetPin = () => {
    if (!selectedStaff) return
    resetStaffPin.mutate(selectedStaff.id, {
      onSuccess: (data: any) => {
        setResetPinResult(data?.newPin ?? t('staff.pinCreated'))
        toast.success(t('toast.updated'))
      },
      onError: (e: any) => toast.error(e?.message || t('toast.error')),
    })
  }

  if (staffLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-sm text-muted-foreground">{t('staff.loadingStaff')}</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Staff Directory */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="space-y-1">
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-600" />
              {t('staff.directory')}
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              {t('staff.directoryDesc')}
            </p>
          </div>
          <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
            <DialogTrigger render={<Button />}>
              <Plus className="h-4 w-4" />
              {t('staff.addStaff')}
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{t('staff.addNew')}</DialogTitle>
                <DialogDescription>
                  {t('staff.addNewDesc')}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="staff-name">{t('common.name')}</Label>
                  <Input
                    id="staff-name"
                    placeholder={t('staff.fullName')}
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="staff-phone">{t('common.phone')}</Label>
                  <Input
                    id="staff-phone"
                    placeholder="+62..."
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t('common.role')}</Label>
                  <Select value={newRole} onValueChange={(v) => { if (v) setNewRole(v as StaffRole) }}>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="manager">{t('role.manager')}</SelectItem>
                      <SelectItem value="cashier">{t('role.cashier')}</SelectItem>
                      <SelectItem value="waiter">{t('role.waiter')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="staff-pin">PIN</Label>
                  <Input
                    id="staff-pin"
                    type="password"
                    inputMode="numeric"
                    placeholder={t('staff.pinPlaceholder')}
                    maxLength={6}
                    value={newPin}
                    onChange={(e) => setNewPin(e.target.value.replace(/\D/g, ''))}
                  />
                  <p className="text-xs text-muted-foreground">{t('staff.pinHint')}</p>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setAddDialogOpen(false)}>
                  {t('common.cancel')}
                </Button>
                <Button onClick={handleAddStaff} disabled={!newName.trim() || !newPhone.trim() || !newPin.trim() || newPin.length < 4 || createStaff.isPending}>
                  {createStaff.isPending ? t('common.saving') : t('common.add')}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('common.name')}</TableHead>
                <TableHead>{t('common.role')}</TableHead>
                <TableHead>{t('common.phone')}</TableHead>
                <TableHead>{t('common.status')}</TableHead>
                <TableHead className="w-40">{t('common.action')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {staffList.map((staff) => (
                <TableRow key={staff.id}>
                  <TableCell className="font-medium">{staff.name}</TableCell>
                  <TableCell>
                    <Badge variant={roleVariants[staff.role] ?? 'outline'}>
                      {roleLabels[staff.role] ?? staff.role}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {staff.phone}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={staff.isActive}
                        onCheckedChange={(checked) =>
                          handleToggleActive(staff, checked)
                        }
                        disabled={staff.role === 'owner'}
                        size="sm"
                      />
                      <span className="text-sm">
                        {staff.isActive ? t('common.active') : t('common.inactive')}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon-xs"
                        onClick={() => openEditDialog(staff)}
                        disabled={staff.role === 'owner'}
                      >
                        <Pencil className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-xs"
                        onClick={() => openResetPinDialog(staff)}
                        disabled={staff.role === 'owner'}
                      >
                        <KeyRound className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-xs"
                        className="text-destructive hover:text-destructive"
                        onClick={() => handleToggleActive(staff, false)}
                        disabled={staff.role === 'owner' || !staff.isActive}
                      >
                        <UserX className="h-3 w-3" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('staff.editStaff')}</DialogTitle>
            <DialogDescription>
              {t('staff.editStaffDesc')}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-staff-name">{t('common.name')}</Label>
              <Input
                id="edit-staff-name"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-staff-phone">{t('common.phone')}</Label>
              <Input
                id="edit-staff-phone"
                value={newPhone}
                onChange={(e) => setNewPhone(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>{t('common.role')}</Label>
              <Select value={newRole} onValueChange={(v) => { if (v) setNewRole(v as StaffRole) }}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="manager">{t('role.manager')}</SelectItem>
                  <SelectItem value="cashier">{t('role.cashier')}</SelectItem>
                  <SelectItem value="waiter">{t('role.waiter')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              {t('common.cancel')}
            </Button>
            <Button onClick={handleEditStaff} disabled={!newName.trim() || !newPhone.trim() || updateStaff.isPending}>
              {updateStaff.isPending ? t('common.saving') : t('common.save')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reset PIN Confirmation Dialog */}
      <Dialog open={resetPinDialogOpen} onOpenChange={setResetPinDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('staff.resetPin')}</DialogTitle>
            <DialogDescription>
              {resetPinResult ? (
                <>{t('staff.newPin')} <strong>{selectedStaff?.name}</strong>: <code className="bg-muted px-2 py-1 rounded text-lg font-bold">{resetPinResult}</code></>
              ) : (
                <>{t('staff.resetPinConfirm')}{' '}
                <strong>{selectedStaff?.name}</strong>?</>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setResetPinDialogOpen(false)}>
              {resetPinResult ? t('common.close') : t('common.cancel')}
            </Button>
            {!resetPinResult && (
              <Button onClick={handleResetPin} disabled={resetStaffPin.isPending}>
                <KeyRound className="h-4 w-4" />
                {resetStaffPin.isPending ? t('staff.resetting') : t('staff.resetPin')}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Staff Performance Summary */}
      <Card>
        <CardHeader>
          <CardTitle>{t('staff.performance')}</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('common.name')}</TableHead>
                <TableHead>{t('common.role')}</TableHead>
                <TableHead>{t('staff.ordersProcessed')}</TableHead>
                <TableHead>{t('staff.totalSales')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {staffPerformance
                .filter((s) => s.ordersCount > 0)
                .sort((a, b) => b.totalSales - a.totalSales)
                .map((staff) => (
                  <TableRow key={staff.id}>
                    <TableCell className="font-medium">{staff.name}</TableCell>
                    <TableCell>
                      <Badge variant={roleVariants[staff.role] ?? 'outline'}>
                        {roleLabels[staff.role] ?? staff.role}
                      </Badge>
                    </TableCell>
                    <TableCell>{t('staff.orders', { count: staff.ordersCount })}</TableCell>
                    <TableCell className="font-medium">
                      {formatRupiah(staff.totalSales)}
                    </TableCell>
                  </TableRow>
                ))}
              {staffPerformance.filter((s) => s.ordersCount > 0).length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground py-6">
                    {t('reports.noPerformance')}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
