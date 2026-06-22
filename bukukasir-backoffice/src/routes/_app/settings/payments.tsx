import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { toast } from 'sonner'
import { useAuth } from '@/lib/auth-context'
import { useTranslate } from '@/lib/i18n-context'
import { usePaymentMethods, useCreatePaymentMethod, useUpdatePaymentMethod, useDeletePaymentMethod } from '@/lib/api-hooks'
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
import {
  Plus,
  CreditCard,
  Trash2,
} from 'lucide-react'

export const Route = createFileRoute('/_app/settings/payments')({
  component: PaymentMethodsPage,
})

interface PaymentMethodItem {
  id: string
  name: string
  type: 'cash' | 'digital' | 'card'
  isActive: boolean
}

function PaymentMethodsPage() {
  const { currentBusiness } = useAuth()
  const businessId = currentBusiness?.id ?? 'biz-001'
  const { data: apiMethods = [], isLoading } = usePaymentMethods(businessId)

  const createPaymentMethod = useCreatePaymentMethod()
  const updatePaymentMethod = useUpdatePaymentMethod()
  const deletePaymentMethod = useDeletePaymentMethod()

  const t = useTranslate()

  const methods: PaymentMethodItem[] = apiMethods.map((m: any) => ({
    id: m.id,
    name: m.name,
    type: m.type ?? 'digital',
    isActive: m.isActive ?? m.active ?? true,
  }))

  const [addDialogOpen, setAddDialogOpen] = useState(false)
  const [newMethodName, setNewMethodName] = useState('')
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null)

  const handleToggle = (method: PaymentMethodItem, checked: boolean) => {
    updatePaymentMethod.mutate({
      id: method.id,
      name: method.name,
      type: method.type,
      active: checked,
      businessId,
    }, {
      onSuccess: () => toast.success(t('toast.updated')),
      onError: (e: any) => toast.error(e?.message || t('toast.error')),
    })
  }

  const handleAddMethod = () => {
    if (!newMethodName.trim()) return
    createPaymentMethod.mutate(
      { name: newMethodName.trim(), type: 'EWALLET', active: true, businessId },
      {
        onSuccess: () => {
          setNewMethodName('')
          setAddDialogOpen(false)
          toast.success(t('toast.created'))
        },
        onError: (e: any) => toast.error(e?.message || t('toast.error')),
      },
    )
  }

  const handleDelete = () => {
    if (!deleteTargetId) return
    deletePaymentMethod.mutate(deleteTargetId, {
      onSuccess: () => { setDeleteTargetId(null); toast.success(t('toast.deleted')) },
      onError: (e: any) => toast.error(e?.message || t('toast.error')),
    })
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-sm text-muted-foreground">{t('payments.loading')}</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="space-y-1">
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-blue-600" />
              {t('payments.title')}
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              {t('payments.subtitle')}
            </p>
          </div>
          <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
            <DialogTrigger render={<Button />}>
              <Plus className="h-4 w-4" />
              {t('payments.addMethod')}
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{t('payments.addTitle')}</DialogTitle>
                <DialogDescription>
                  {t('payments.addDesc')}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-3">
                <div className="space-y-2">
                  <Label htmlFor="method-name">{t('payments.methodName')}</Label>
                  <Input
                    id="method-name"
                    placeholder={t('payments.methodPlaceholder')}
                    value={newMethodName}
                    onChange={(e) => setNewMethodName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleAddMethod()
                    }}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setAddDialogOpen(false)}>
                  {t('common.cancel')}
                </Button>
                <Button onClick={handleAddMethod} disabled={!newMethodName.trim() || createPaymentMethod.isPending}>
                  {createPaymentMethod.isPending ? t('common.saving') : t('common.add')}
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
                <TableHead>{t('common.type')}</TableHead>
                <TableHead>{t('common.status')}</TableHead>
                <TableHead className="w-24">{t('common.action')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {methods.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground py-6">
                    {t('payments.noMethods')}
                  </TableCell>
                </TableRow>
              ) : (
                methods.map((method) => (
                  <TableRow key={method.id}>
                    <TableCell>
                      <span className="font-medium">{method.name}</span>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{method.type}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={method.isActive}
                          onCheckedChange={(checked) =>
                            handleToggle(method, checked)
                          }
                        />
                        <span className="text-sm">
                          {method.isActive ? t('common.active') : t('common.inactive')}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        className="text-destructive hover:text-destructive"
                        onClick={() => setDeleteTargetId(method.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteTargetId} onOpenChange={(open) => { if (!open) setDeleteTargetId(null) }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('payments.deleteTitle' as any)}</DialogTitle>
            <DialogDescription>{t('payments.deleteConfirm' as any)}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTargetId(null)}>
              {t('common.cancel')}
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={deletePaymentMethod.isPending}>
              {deletePaymentMethod.isPending ? t('common.loading') : t('common.delete')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
