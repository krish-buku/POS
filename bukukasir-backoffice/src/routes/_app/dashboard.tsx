import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'
import { formatRupiah } from '@/lib/mock-data'
import { useAuth } from '@/lib/auth-context'
import { useI18n, useTranslate } from '@/lib/i18n-context'
import { api } from '@/lib/api'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  TrendingUp,
  ShoppingCart,
  DollarSign,
  Clock,
  Plus,
  FileText,
  Users,
  Settings,
} from 'lucide-react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
} from 'recharts'

export const Route = createFileRoute('/_app/dashboard')({
  component: DashboardPage,
})

function DashboardPage() {
  const { currentBusiness, scope } = useAuth()
  const { locale, t } = useI18n()

  const activeBusinessId = scope === 'all' ? null : currentBusiness?.id ?? null
  const isAll = scope === 'all'

  // Backend /api/orders ignores the businessId query param, so fetch once and
  // filter client-side by each order's businessId field. This guarantees the
  // header scope toggle (single business / all) drives every derived stat.
  const { data: allOrders = [], isLoading: ordersLoading } = useQuery({
    queryKey: ['orders', 'all'],
    queryFn: () => api.getOrders(''),
    staleTime: 30_000,
  })
  const { data: allPayments = [] } = useQuery({
    queryKey: ['payments', 'all'],
    queryFn: () => api.getPayments(''),
    staleTime: 30_000,
  })
  const paymentsByOrder = useMemo(() => {
    const map = new Map<string, any>()
    ;(allPayments as any[]).forEach((payment: any) => {
      if (!payment.orderId) return
      const existing = map.get(payment.orderId)
      if (!existing || new Date(payment.createdAt ?? 0).getTime() > new Date(existing.createdAt ?? 0).getTime()) {
        map.set(payment.orderId, payment)
      }
    })
    return map
  }, [allPayments])
  const enrichedOrders = useMemo(
    () =>
      (allOrders as any[]).map((order: any) => {
        const payment = paymentsByOrder.get(order.id)
        const paid = payment?.status === 'COMPLETED'
        return {
          ...order,
          paymentMethod: order.paymentMethod ?? payment?.paymentMethodName,
          paymentStatus: order.paymentStatus ?? payment?.status,
          status: paid && order.status !== 'VOIDED' ? 'COMPLETED' : order.status,
        }
      }),
    [allOrders, paymentsByOrder],
  )
  const orders = isAll
    ? enrichedOrders
    : enrichedOrders.filter((o: any) => o.businessId === activeBusinessId)

  // Today bucket (for today's revenue / active / avg).
  const now = new Date()
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()
  const endOfToday = startOfToday + 86400000
  const todayOrders = orders.filter((o: any) => {
    const ts = new Date(o.createdAt).getTime()
    return ts >= startOfToday && ts < endOfToday
  })

  const todayRevenue = todayOrders.reduce((sum: number, o: any) => sum + (o.total ?? 0), 0)
  const todayOrderCount = todayOrders.length
  const averageOrderValue = todayOrderCount > 0 ? Math.round(todayRevenue / todayOrderCount) : 0
  const activeOrders = orders.filter(
    (o: any) => o.status === 'pending' || o.status === 'preparing' || o.status === 'PENDING' || o.status === 'PREPARING',
  ).length

  // Top-selling today: aggregate item quantities across filtered scope.
  const topSellingItem = (() => {
    const tally = new Map<string, number>()
    for (const o of todayOrders) {
      for (const it of o.items ?? []) {
        const name = it.menuItemName ?? it.name ?? '—'
        tally.set(name, (tally.get(name) ?? 0) + (it.quantity ?? 1))
      }
    }
    let best = '-'
    let bestQty = 0
    for (const [name, qty] of tally) {
      if (qty > bestQty) {
        best = name
        bestQty = qty
      }
    }
    return best
  })()

  const day = now.getDay()
  const startOfWeek = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate() - (day === 0 ? 6 : day - 1),
  ).getTime()
  const weekRevenue = orders
    .filter((o: any) => new Date(o.createdAt).getTime() >= startOfWeek)
    .reduce((sum: number, o: any) => sum + (o.total ?? 0), 0)
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).getTime()
  const monthRevenue = orders
    .filter((o: any) => new Date(o.createdAt).getTime() >= startOfMonth)
    .reduce((sum: number, o: any) => sum + (o.total ?? 0), 0)

  // Derive 7-day revenue trend from orders
  const revenueTrend = (() => {
    const days: { date: string; revenue: number }[] = []
    for (let i = 6; i >= 0; i--) {
      const d = new Date()
      d.setDate(d.getDate() - i)
      const dateStr = d.toLocaleDateString(locale === 'id' ? 'id-ID' : 'en-US', { day: '2-digit', month: 'short' })
      const dayStart = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime()
      const dayEnd = dayStart + 86400000
      const dayRevenue = orders
        .filter((o: any) => {
          const ts = new Date(o.createdAt).getTime()
          return ts >= dayStart && ts < dayEnd
        })
        .reduce((sum: number, o: any) => sum + (o.total ?? 0), 0)
      days.push({ date: dateStr, revenue: dayRevenue })
    }
    return days
  })()

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{t('dashboard.title')}</h1>
          <p className="text-sm text-muted-foreground">
            {t('dashboard.subtitle')}
          </p>
        </div>
        <Badge variant={isAll ? 'secondary' : 'outline'} className="gap-1.5">
          {isAll
            ? t('dashboard.showingAll')
            : t('dashboard.showingFor', { name: currentBusiness?.name ?? '-' })}
        </Badge>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title={t('dashboard.todayRevenue')}
          value={formatRupiah(todayRevenue)}
          icon={DollarSign}
          description={t('dashboard.fromOrders', { count: todayOrderCount })}
        />
        <StatsCard
          title={t('dashboard.weekRevenue')}
          value={formatRupiah(weekRevenue)}
          icon={TrendingUp}
          description={t('dashboard.last7Days')}
        />
        <StatsCard
          title={t('dashboard.orderCount')}
          value={todayOrderCount.toString()}
          icon={ShoppingCart}
          description={t('dashboard.avgOrder', { value: formatRupiah(averageOrderValue) })}
        />
        <StatsCard
          title={t('dashboard.activeOrders')}
          value={activeOrders.toString()}
          icon={Clock}
          description={t('dashboard.processing')}
          highlight
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Revenue Trend Chart */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>{t('dashboard.revenueTrend')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={revenueTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 12 }}
                    stroke="var(--muted-foreground)"
                  />
                  <YAxis
                    tick={{ fontSize: 12 }}
                    stroke="var(--muted-foreground)"
                    tickFormatter={(value: number) =>
                      `${(value / 1000000).toFixed(1)}${locale === 'id' ? 'jt' : 'M'}`
                    }
                  />
                  <RechartsTooltip
                    formatter={(value) => [
                      formatRupiah(Number(value)),
                      t('dashboard.revenue'),
                    ]}
                    contentStyle={{
                      borderRadius: '8px',
                      border: '1px solid var(--border)',
                      fontSize: '13px',
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="revenue"
                    stroke="var(--primary)"
                    strokeWidth={2}
                    dot={{ fill: 'var(--accent)', r: 4 }}
                    activeDot={{ r: 6, fill: 'var(--accent)' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>{t('dashboard.quickActions')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <QuickActionButton
              icon={Plus}
              label={t('dashboard.addOrder')}
              color="gold"
              to="/menu"
            />
            <QuickActionButton
              icon={FileText}
              label={t('dashboard.viewReport')}
              color="navy"
              to="/reports"
            />
            <QuickActionButton
              icon={Users}
              label={t('dashboard.manageStaff')}
              color="navy"
              to="/settings/staff"
            />
            <QuickActionButton
              icon={Settings}
              label={t('dashboard.posSettings')}
              color="gold"
              to="/settings/payments"
            />
          </CardContent>
          <div className="px-4 pb-4">
            <div className="rounded-lg bg-primary/10 p-3">
              <p className="text-xs font-medium text-primary">
                {t('dashboard.topSellingToday')}
              </p>
              <p className="mt-1 text-sm font-semibold text-foreground">
                {topSellingItem}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Recent Transactions */}
      <Card>
        <CardHeader>
          <CardTitle>{t('dashboard.recentTransactions')}</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('table.orderNumber')}</TableHead>
                <TableHead>{t('table.table')}</TableHead>
                <TableHead>{t('table.customer')}</TableHead>
                <TableHead>{t('table.items')}</TableHead>
                <TableHead>{t('table.cashier')}</TableHead>
                <TableHead>{t('common.total')}</TableHead>
                <TableHead>{t('table.payment')}</TableHead>
                <TableHead>{t('common.status')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {ordersLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={`sk-${i}`}>
                    {Array.from({ length: 8 }).map((__, j) => (
                      <TableCell key={j}>
                        <Skeleton className="h-4 w-full" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : orders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="h-24 text-center text-muted-foreground">
                    {t('dashboard.noOrders')}
                  </TableCell>
                </TableRow>
              ) : null}
              {orders.slice(0, 10).map((order: any) => (
                <TableRow key={order.id}>
                  <TableCell className="font-mono text-xs font-medium">
                    {order.orderNumber}
                  </TableCell>
                  <TableCell>{order.tableNumber ?? order.tableName ?? '-'}</TableCell>
                  <TableCell>{order.customerName ?? '-'}</TableCell>
                  <TableCell>
                    {order.items?.length ?? 0} item
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {order.staffName}
                  </TableCell>
                  <TableCell className="font-medium">
                    {formatRupiah(order.total)}
                  </TableCell>
                  <TableCell>{order.paymentMethod ?? '-'}</TableCell>
                  <TableCell>
                    <OrderStatusBadge status={order.status} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Monthly Revenue Card */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>{t('dashboard.monthRevenue')}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-foreground">
              {formatRupiah(monthRevenue)}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              {t('dashboard.target', { value: formatRupiah(15000000) })}
            </p>
            <div className="mt-3 h-2 rounded-full bg-muted">
              <div
                className="h-2 rounded-full bg-primary"
                style={{
                  width: `${Math.min(((monthRevenue || 0) / 15000000) * 100, 100)}%`,
                }}
              />
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              {t('dashboard.ofTarget', { percent: (((monthRevenue || 0) / 15000000) * 100).toFixed(1) })}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t('dashboard.todaySummary')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <SummaryRow
                label={t('dashboard.totalOrders')}
                value={todayOrderCount.toString()}
              />
              <SummaryRow
                label={t('dashboard.avgOrderValue')}
                value={formatRupiah(averageOrderValue)}
              />
              <SummaryRow
                label={t('dashboard.activeOrders')}
                value={activeOrders.toString()}
              />
              <SummaryRow
                label={t('dashboard.topSelling')}
                value={topSellingItem}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function StatsCard({
  title,
  value,
  icon: Icon,
  description,
  trend,
  highlight,
}: {
  title: string
  value: string
  icon: React.ElementType
  description: string
  trend?: string
  highlight?: boolean
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <Icon
          className={`h-4 w-4 ${
            highlight ? 'text-orange-500' : 'text-muted-foreground'
          }`}
        />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <div className="flex items-center gap-1">
          <p className="text-xs text-muted-foreground">{description}</p>
          {trend && (
            <span className="text-xs font-medium text-emerald-600">
              {trend}
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

function QuickActionButton({
  icon: Icon,
  label,
  color,
  to,
}: {
  icon: React.ElementType
  label: string
  color: string
  to: string
}) {
  const navigate = useNavigate()
  const colorClasses: Record<string, string> = {
    gold: 'bg-accent/15 text-accent hover:bg-accent/25',
    navy: 'bg-primary/10 text-primary hover:bg-primary/20',
  }

  return (
    <Button
      variant="ghost"
      className={`h-10 w-full justify-start gap-3 ${colorClasses[color] ?? ''}`}
      onClick={() => void navigate({ to })}
    >
      <Icon className="h-4 w-4" />
      {label}
    </Button>
  )
}

function OrderStatusBadge({ status }: { status: string }) {
  const t = useTranslate()
  const variantMap: Record<string, 'default' | 'secondary' | 'outline' | 'destructive'> = {
    pending: 'outline',
    preparing: 'secondary',
    ready: 'default',
    served: 'default',
    completed: 'secondary',
    cancelled: 'destructive',
  }

  return (
    <Badge variant={variantMap[status] ?? 'secondary'}>
      {t(('order.' + status) as any)}
    </Badge>
  )
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm font-medium text-foreground">{value}</span>
    </div>
  )
}
