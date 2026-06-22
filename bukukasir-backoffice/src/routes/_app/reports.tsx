import { createFileRoute } from '@tanstack/react-router'
import { useState, useMemo } from 'react'
import { useI18n, useTranslate } from '@/lib/i18n-context'
import { formatRupiah } from '@/lib/mock-data'
import { useAuth } from '@/lib/auth-context'
import { useOrders, useCategories, useMenuItems, useTables, usePaymentMethodReport, usePayments, useTopItems } from '@/lib/api-hooks'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DollarSign,
  ShoppingCart,
  TrendingUp,
  XCircle,
  Calendar,
  Clock,
  Receipt,
  AlertCircle,
  X,
} from 'lucide-react'
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  Cell,
  BarChart,
  Bar,
  Legend,
} from 'recharts'

export const Route = createFileRoute('/_app/reports')({
  component: ReportsPage,
})

const PIE_COLORS = ['#2563eb', '#059669', '#d97706', '#7c3aed', '#dc2626', '#0891b2', '#db2777', '#65a30d']

// ─── Trend Bucket Builder ───────────────────────────────────────────────────
//
// Walks orders once and produces the data for every trend chart on the page:
//   - buckets: array of { date, <Category1>: n, <Category2>: n, ... }
//   - categoryNames: sorted desc by total revenue in range
//   - orderCountByBucket: { date, orders }[] for the Sales tab chart
//   - unpaidCountByBucket: { date, count }[] for the Unpaid tab chart
//
// Bucket spec matches the prior revenueTrend closure (hourly for `today`,
// daily for week/month/custom).

function isUnpaidOrder(o: any): boolean {
  return !o.paymentMethod && o.status !== 'cancelled'
}

function buildTrendByCategory(
  allOrders: any[],
  apiMenuItems: any[],
  apiCategories: any[],
  dateRange: string,
  locale: 'en' | 'id',
): {
  buckets: Array<Record<string, any>>
  categoryNames: string[]
  orderCountByBucket: Array<{ date: string; orders: number }>
  unpaidCountByBucket: Array<{ date: string; count: number }>
} {
  const now = new Date()

  // Build bucket spec: list of { label, start, end } in chronological order.
  type BucketSpec = { label: string; start: number; end: number }
  const specs: BucketSpec[] = []

  if (dateRange === 'today') {
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()
    for (let h = 0; h <= now.getHours(); h++) {
      const start = startOfDay + h * 3600000
      specs.push({
        label: `${h.toString().padStart(2, '0')}:00`,
        start,
        end: start + 3600000,
      })
    }
  } else {
    let numDays = 7
    if (dateRange === 'week') numDays = 7
    else if (dateRange === 'month') numDays = now.getDate()
    else numDays = 30 // custom
    for (let i = numDays - 1; i >= 0; i--) {
      const d = new Date()
      d.setDate(d.getDate() - i)
      const start = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime()
      specs.push({
        label: d.toLocaleDateString(locale === 'id' ? 'id-ID' : 'en-US', {
          day: '2-digit',
          month: 'short',
        }),
        start,
        end: start + 86400000,
      })
    }
  }

  // Build category id → name map once
  const categoryIdToName = new Map<string, string>()
  apiCategories.forEach((c) => categoryIdToName.set(c.id, c.name))

  // Build menuItem id → category name map once
  const menuItemIdToCategory = new Map<string, string>()
  apiMenuItems.forEach((m) => {
    menuItemIdToCategory.set(m.id, categoryIdToName.get(m.categoryId) ?? 'Others')
  })

  // Accumulator
  const totalsByCategory: Record<string, number> = {}
  const buckets: Array<Record<string, any>> = specs.map((s) => ({ date: s.label }))
  const orderCountByBucket = specs.map((s) => ({ date: s.label, orders: 0 }))
  const unpaidCountByBucket = specs.map((s) => ({ date: s.label, count: 0 }))

  // Walk orders once — use `allOrders` for the trend (so week/month ranges
  // see historic orders), and the same walk also populates counts.
  allOrders.forEach((order: any) => {
    const ts = new Date(order.createdAt).getTime()
    const bucketIdx = specs.findIndex((s) => ts >= s.start && ts < s.end)
    if (bucketIdx === -1) return

    orderCountByBucket[bucketIdx].orders += 1
    if (isUnpaidOrder(order)) {
      unpaidCountByBucket[bucketIdx].count += 1
    }

    ;(order.items ?? []).forEach((item: any) => {
      const catName = menuItemIdToCategory.get(item.menuItemId) ?? 'Others'
      const revenue = item.subtotal ?? (item.unitPrice ?? 0) * (item.quantity ?? 0)
      buckets[bucketIdx][catName] = (buckets[bucketIdx][catName] ?? 0) + revenue
      totalsByCategory[catName] = (totalsByCategory[catName] ?? 0) + revenue
    })
  })

  // Deterministic stack order: biggest category first (renders at bottom).
  const categoryNames = Object.entries(totalsByCategory)
    .sort(([, a], [, b]) => b - a)
    .map(([name]) => name)

  // Fill zero for every category key in every bucket so recharts stacks align.
  buckets.forEach((b) => {
    categoryNames.forEach((cat) => {
      if (b[cat] === undefined) b[cat] = 0
    })
  })

  return { buckets, categoryNames, orderCountByBucket, unpaidCountByBucket }
}

// ─── Category Drill-down ───────────────────────────────────────────────────

function computeCategoryDetail(
  categoryName: string,
  orders: any[],
  apiMenuItems: any[],
  apiCategories: any[],
): {
  revenue: number
  orderCount: number
  itemsSold: number
  topItems: Array<{ name: string; qty: number; revenue: number }>
  paymentBreakdown: Array<{ name: string; value: number }>
} {
  // Set of menu-item ids that belong to the selected category
  const menuItemsInCat = new Set<string>()
  apiMenuItems.forEach((m) => {
    const catName = apiCategories.find((c: any) => c.id === m.categoryId)?.name
    if (catName === categoryName) menuItemsInCat.add(m.id)
  })

  let revenue = 0
  let itemsSold = 0
  const itemMap: Record<string, { name: string; qty: number; revenue: number }> = {}
  const paymentMap: Record<string, number> = {}
  const touchingOrders = new Set<string>()

  orders.forEach((order: any) => {
    let orderCategoryRevenue = 0
    ;(order.items ?? []).forEach((item: any) => {
      if (!menuItemsInCat.has(item.menuItemId)) return
      const sub = item.subtotal ?? (item.unitPrice ?? 0) * (item.quantity ?? 0)
      revenue += sub
      itemsSold += item.quantity ?? 0
      orderCategoryRevenue += sub
      const id = item.menuItemId
      if (!itemMap[id]) {
        itemMap[id] = { name: item.menuItemName ?? item.name ?? '-', qty: 0, revenue: 0 }
      }
      itemMap[id].qty += item.quantity ?? 0
      itemMap[id].revenue += sub
    })
    if (orderCategoryRevenue > 0) {
      touchingOrders.add(order.id)
      const pm = order.paymentMethod ?? 'Unpaid'
      paymentMap[pm] = (paymentMap[pm] ?? 0) + orderCategoryRevenue
    }
  })

  const topItems = Object.values(itemMap)
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5)

  const paymentBreakdown = Object.entries(paymentMap)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)

  return {
    revenue,
    orderCount: touchingOrders.size,
    itemsSold,
    topItems,
    paymentBreakdown,
  }
}

// ─── Main Page ──────────────────────────────────────────────────────────────

function ReportsPage() {
  const { currentBusiness, scope } = useAuth()
  const businessId = currentBusiness?.id ?? 'biz-001'
  // When scope === 'all', pass null so backend aggregates across all businesses.
  const reportBusinessId = scope === 'all' ? null : businessId
  const [dateRange, setDateRange] = useState<string>('today')
  const [activeTab, setActiveTab] = useState<string>('sales')
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

  const { data: fetchedOrders = [] } = useOrders(businessId)
  const { data: fetchedPayments = [] } = usePayments(reportBusinessId ?? '')
  const paymentsByOrder = useMemo(() => {
    const map = new Map<string, any>()
    ;(fetchedPayments as any[]).forEach((payment: any) => {
      if (!payment.orderId) return
      const existing = map.get(payment.orderId)
      if (!existing || new Date(payment.createdAt ?? 0).getTime() > new Date(existing.createdAt ?? 0).getTime()) {
        map.set(payment.orderId, payment)
      }
    })
    return map
  }, [fetchedPayments])
  const enrichedFetchedOrders = useMemo(
    () =>
      (fetchedOrders as any[]).map((order: any) => {
        const payment = paymentsByOrder.get(order.id)
        const paid = payment?.status === 'COMPLETED'
        return {
          ...order,
          paymentMethod: order.paymentMethod ?? payment?.paymentMethodName,
          paymentStatus: order.paymentStatus ?? payment?.status,
          status: paid && order.status !== 'VOIDED' ? 'COMPLETED' : order.status,
        }
      }),
    [fetchedOrders, paymentsByOrder],
  )
  // Client-side safety net: filter by businessId since backend historically ignored the param.
  const allOrders = useMemo(
    () =>
      scope === 'all'
        ? enrichedFetchedOrders
        : enrichedFetchedOrders.filter((o: any) => o.businessId === businessId),
    [enrichedFetchedOrders, businessId, scope],
  )
  const { data: apiCategories = [] } = useCategories(businessId)
  const { data: apiMenuItems = [] } = useMenuItems(businessId)
  const { data: apiTables = [] } = useTables(businessId)
  const { data: apiPaymentMethods = [] } = usePaymentMethodReport(reportBusinessId)
  const { data: apiTopItems = [] } = useTopItems(10, reportBusinessId)
  const { locale, t } = useI18n()

  // Filter orders by date range
  const orders = (() => {
    const now = new Date()
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()
    if (dateRange === 'today') {
      return allOrders.filter((o: any) => new Date(o.createdAt).getTime() >= startOfDay)
    }
    if (dateRange === 'week') {
      const day = now.getDay()
      const startOfWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate() - (day === 0 ? 6 : day - 1)).getTime()
      return allOrders.filter((o: any) => new Date(o.createdAt).getTime() >= startOfWeek)
    }
    if (dateRange === 'month') {
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).getTime()
      return allOrders.filter((o: any) => new Date(o.createdAt).getTime() >= startOfMonth)
    }
    return allOrders // 'custom' shows all
  })()

  // Derived data from API
  const todayRevenue = orders.reduce((sum: number, o: any) => sum + (o.total ?? 0), 0)
  const todayOrderCount = orders.length
  const averageOrderValue = todayOrderCount > 0 ? Math.round(todayRevenue / todayOrderCount) : 0
  const voidOrders = orders.filter((o: any) => o.status === 'cancelled').length

  // Single-pass trend builder: revenue by category + order count + unpaid count
  const trend = buildTrendByCategory(
    allOrders,
    apiMenuItems,
    apiCategories,
    dateRange,
    locale as 'en' | 'id',
  )
  const revenueTrendBuckets = trend.buckets
  const trendCategoryNames = trend.categoryNames
  const trendHasData =
    revenueTrendBuckets.length > 0 &&
    revenueTrendBuckets.some((b) =>
      trendCategoryNames.some((cat) => (b[cat] ?? 0) > 0),
    )
  const salesVolume = trend.orderCountByBucket
  const unpaidTrend = trend.unpaidCountByBucket

  // Payment method pie chart data — always derive from filtered orders for accuracy
  const paymentMethodData = (() => {
    const counts: Record<string, number> = {}
    orders.forEach((order: any) => {
      const method = order.paymentMethod ?? t('reports.unpaid')
      counts[method] = (counts[method] ?? 0) + (order.total ?? 0)
    })
    const derived = Object.entries(counts).map(([name, value]) => ({ name, value }))
    if (derived.length > 0) return derived
    // Fall back to API report if no filtered orders
    if (apiPaymentMethods.length > 0) {
      return apiPaymentMethods.map((pm: any) => ({ name: pm.name ?? pm.method, value: pm.total ?? pm.amount ?? 0 }))
    }
    return []
  })()

  // Drill-down details for the currently selected category (null = no drill-down)
  const categoryDetail = selectedCategory
    ? computeCategoryDetail(selectedCategory, orders, apiMenuItems, apiCategories)
    : null

  // Top selling items
  const topSellingItems = (() => {
    if (apiTopItems.length > 0) {
      return apiTopItems.map((item: any) => ({
        name: item.name ?? item.menuItemName ?? '-',
        qty: item.quantity ?? item.totalQuantity ?? 0,
        revenue: item.revenue ?? item.totalRevenue ?? 0,
      }))
    }
    const itemMap: Record<string, { name: string; qty: number; revenue: number }> = {}
    orders.forEach((order: any) => {
      (order.items ?? []).forEach((item: any) => {
        const id = item.menuItemId ?? item.id
        if (!itemMap[id]) {
          itemMap[id] = { name: item.menuItemName ?? item.name, qty: 0, revenue: 0 }
        }
        itemMap[id].qty += item.quantity ?? 0
        itemMap[id].revenue += item.subtotal ?? 0
      })
    })
    return Object.values(itemMap).sort((a, b) => b.qty - a.qty)
  })()

  // Active tables
  const activeTables = apiTables
    .filter((tbl: any) => tbl.status === 'occupied' || tbl.status === 'OCCUPIED')
    .map((tbl: any) => {
      const order = orders.find((o: any) => o.tableId === tbl.id)
      const createdAt = order ? new Date(order.createdAt) : new Date()
      const now = new Date()
      const durationMs = now.getTime() - createdAt.getTime()
      const durationMin = Math.floor(durationMs / 60000)
      const hours = Math.floor(durationMin / 60)
      const minutes = durationMin % 60
      return {
        id: tbl.id,
        number: tbl.number ?? tbl.name,
        capacity: tbl.capacity,
        duration: hours > 0 ? `${hours}${locale === 'id' ? 'j' : 'h'} ${minutes}m` : `${minutes}m`,
        durationMin,
        runningTotal: order?.total ?? 0,
        orderNumber: order?.orderNumber ?? '-',
        staffName: order?.staffName ?? '-',
        customerName: order?.customerName,
        status: order?.status ?? 'pending',
      }
    })

  // Unpaid orders (no payment method assigned, not cancelled)
  const unpaidOrders = orders.filter(isUnpaidOrder)
  const unpaidTotal = unpaidOrders.reduce(
    (sum: number, o: any) => sum + (o.total ?? 0),
    0,
  )

  // Per-table running total (for Open Tables chart)
  const tableRevenueData = apiTables
    .filter((tbl: any) => tbl.status === 'occupied' || tbl.status === 'OCCUPIED')
    .map((tbl: any) => {
      const order = orders.find((o: any) => o.tableId === tbl.id)
      return {
        name: t('reports.table', { number: tbl.number ?? tbl.name }),
        revenue: order?.total ?? 0,
      }
    })
    .sort((a, b) => b.revenue - a.revenue)

  // Top 10 items sorted by revenue (for Menu tab chart — table uses qty order)
  const top10ByRevenue = [...topSellingItems]
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 10)

  // Financial summary
  const financialSummary = (() => {
    const completedOrders = orders.filter(
      (o: any) => o.status === 'completed' || o.status === 'served'
    )
    const grossRevenue = completedOrders.reduce((sum: number, o: any) => sum + (o.subtotal ?? o.total ?? 0), 0)
    const totalTax = completedOrders.reduce((sum: number, o: any) => sum + (o.tax ?? 0), 0)
    const totalDiscount = completedOrders.reduce((sum: number, o: any) => sum + (o.discount ?? 0), 0)
    const netRevenue = completedOrders.reduce((sum: number, o: any) => sum + (o.total ?? 0), 0)
    return { grossRevenue, totalTax, totalDiscount, netRevenue }
  })()

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{t('reports.title')}</h1>
          <p className="text-sm text-muted-foreground">
            {t('reports.subtitle')}
          </p>
        </div>

        {/* Date Range Picker */}
        <div className="flex flex-wrap items-center gap-2">
          <DateRangeButton
            label={t('reports.today')}
            value="today"
            active={dateRange}
            onClick={setDateRange}
          />
          <DateRangeButton
            label={t('reports.thisWeek')}
            value="week"
            active={dateRange}
            onClick={setDateRange}
          />
          <DateRangeButton
            label={t('reports.thisMonth')}
            value="month"
            active={dateRange}
            onClick={setDateRange}
          />
          <DateRangeButton
            label={t('reports.custom')}
            value="custom"
            active={dateRange}
            onClick={setDateRange}
            icon
          />
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <SummaryCard
          title={t('reports.totalRevenue')}
          value={formatRupiah(todayRevenue)}
          icon={DollarSign}
        />
        <SummaryCard
          title={t('reports.orderCount')}
          value={todayOrderCount.toString()}
          icon={ShoppingCart}
          description={t('reports.transactions', { count: orders.length })}
        />
        <SummaryCard
          title={t('reports.avgOrder')}
          value={formatRupiah(averageOrderValue)}
          icon={TrendingUp}
          description={t('reports.aov')}
        />
        <SummaryCard
          title={t('reports.voidOrders')}
          value={voidOrders.toString()}
          icon={XCircle}
          description={t('reports.cancelledToday')}
          destructive={voidOrders > 0}
        />
      </div>

      {/* Unified Revenue Breakdown — click a category (bar or legend) to drill down */}
      <Card>
        <CardHeader className="flex flex-row items-start justify-between gap-4">
          <div>
            <CardTitle>{t('reports.revenueTrend')}</CardTitle>
            <p className="text-xs text-muted-foreground mt-1">
              {t('reports.revenueBreakdown')} - {t('reports.clickCategoryToDrill')}
            </p>
          </div>
          {selectedCategory && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSelectedCategory(null)}
            >
              <X className="h-3.5 w-3.5" data-icon="inline-start" />
              {t('reports.clearSelection')}
            </Button>
          )}
        </CardHeader>
        <CardContent>
          <div className="h-80">
            {!trendHasData ? (
              <div className="flex h-full items-center justify-center">
                <p className="text-sm text-muted-foreground">{t('reports.noCategoryData')}</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={revenueTrendBuckets}>
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
                    formatter={(value, name) => [formatRupiah(Number(value)), name as string]}
                    contentStyle={{
                      borderRadius: '8px',
                      border: '1px solid var(--border)',
                      fontSize: '13px',
                    }}
                  />
                  <Legend
                    wrapperStyle={{ fontSize: '12px', cursor: 'pointer' }}
                    onClick={(entry: any) => {
                      const name = (entry?.dataKey ?? entry?.value) as string
                      if (!name) return
                      setSelectedCategory((cur) => (cur === name ? null : name))
                    }}
                  />
                  {trendCategoryNames.map((cat, i) => (
                    <Bar
                      key={cat}
                      dataKey={cat}
                      stackId="revenue"
                      name={cat}
                      fill={PIE_COLORS[i % PIE_COLORS.length]}
                      fillOpacity={
                        selectedCategory && selectedCategory !== cat ? 0.25 : 1
                      }
                      cursor="pointer"
                      onClick={() =>
                        setSelectedCategory((cur) => (cur === cat ? null : cat))
                      }
                      radius={
                        i === trendCategoryNames.length - 1
                          ? [4, 4, 0, 0]
                          : undefined
                      }
                    />
                  ))}
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          <div className="mt-4 border-t pt-4">
            <div className="mb-3 flex items-center justify-between gap-3">
              <p className="text-sm font-semibold">{t('reports.paymentMethods')}</p>
              <p className="text-xs text-muted-foreground">
                {formatRupiah(paymentMethodData.reduce((sum, method) => sum + method.value, 0))}
              </p>
            </div>
            {paymentMethodData.length === 0 ? (
              <p className="text-sm text-muted-foreground">{t('reports.noPaymentData')}</p>
            ) : (
              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                {paymentMethodData.slice(0, 4).map((method, index) => (
                  <div key={method.name} className="rounded-md border bg-muted/20 p-3">
                    <div className="flex items-center gap-2">
                      <span
                        className="h-2.5 w-2.5 rounded-full"
                        style={{ backgroundColor: PIE_COLORS[index % PIE_COLORS.length] }}
                      />
                      <span className="truncate text-sm font-medium">{method.name}</span>
                    </div>
                    <p className="mt-2 text-sm font-semibold">{formatRupiah(method.value)}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Drill-down Panel */}
          {selectedCategory && categoryDetail && (
            <div className="mt-6 border-t pt-6 space-y-6">
              <div className="flex items-center gap-2">
                <div
                  className="h-3 w-3 rounded-full"
                  style={{
                    backgroundColor:
                      PIE_COLORS[
                        trendCategoryNames.indexOf(selectedCategory) %
                          PIE_COLORS.length
                      ],
                  }}
                />
                <h3 className="text-base font-semibold">{selectedCategory}</h3>
              </div>

              {/* Key stats */}
              <div className="grid gap-4 md:grid-cols-3">
                <div className="rounded-lg border bg-muted/30 p-4">
                  <p className="text-xs text-muted-foreground">
                    {t('dashboard.revenue')}
                  </p>
                  <p className="text-xl font-bold">
                    {formatRupiah(categoryDetail.revenue)}
                  </p>
                </div>
                <div className="rounded-lg border bg-muted/30 p-4">
                  <p className="text-xs text-muted-foreground">
                    {t('reports.orderCount')}
                  </p>
                  <p className="text-xl font-bold">
                    {categoryDetail.orderCount}
                  </p>
                </div>
                <div className="rounded-lg border bg-muted/30 p-4">
                  <p className="text-xs text-muted-foreground">
                    {t('reports.itemsSold')}
                  </p>
                  <p className="text-xl font-bold">
                    {categoryDetail.itemsSold}
                  </p>
                </div>
              </div>

              <div className="grid gap-6 lg:grid-cols-2">
                {/* Top items */}
                <div>
                  <h4 className="text-sm font-semibold mb-3">
                    {t('reports.topSelling')}
                  </h4>
                  {categoryDetail.topItems.length === 0 ? (
                    <p className="text-xs text-muted-foreground">
                      {t('common.noData')}
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {categoryDetail.topItems.map((item, idx) => (
                        <div
                          key={item.name}
                          className="flex items-center justify-between gap-3 text-sm"
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="text-xs font-mono text-muted-foreground w-4">
                              {idx + 1}
                            </span>
                            <span className="truncate">{item.name}</span>
                            <Badge variant="secondary" className="text-[10px]">
                              {t('reports.portions', { count: item.qty })}
                            </Badge>
                          </div>
                          <span className="font-medium shrink-0">
                            {formatRupiah(item.revenue)}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Payment breakdown as proportional bars */}
                <div>
                  <h4 className="text-sm font-semibold mb-3">
                    {t('reports.paymentMethods')}
                  </h4>
                  {categoryDetail.paymentBreakdown.length === 0 ? (
                    <p className="text-xs text-muted-foreground">
                      {t('reports.noPaymentData')}
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {categoryDetail.paymentBreakdown.map((pm, idx) => {
                        const total = categoryDetail.revenue || 1
                        const pct = Math.round((pm.value / total) * 100)
                        const color = PIE_COLORS[idx % PIE_COLORS.length]
                        return (
                          <div key={pm.name} className="space-y-1.5">
                            <div className="flex items-center justify-between text-sm">
                              <span className="flex items-center gap-2">
                                <div
                                  className="h-2 w-2 rounded-full"
                                  style={{ backgroundColor: color }}
                                />
                                {pm.name}
                                <span className="text-xs text-muted-foreground">
                                  {pct}%
                                </span>
                              </span>
                              <span className="font-medium">
                                {formatRupiah(pm.value)}
                              </span>
                            </div>
                            <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                              <div
                                className="h-full rounded-full"
                                style={{
                                  width: `${pct}%`,
                                  backgroundColor: color,
                                }}
                              />
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Detail Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList variant="line">
          <TabsTrigger value="sales">{t('reports.sales')}</TabsTrigger>
          <TabsTrigger value="financial">{t('reports.financial')}</TabsTrigger>
          <TabsTrigger value="menu">{t('reports.menuTab')}</TabsTrigger>
          <TabsTrigger value="open-table">{t('reports.openTable')}</TabsTrigger>
          <TabsTrigger value="unpaid">{t('reports.unpaidTab')}</TabsTrigger>
        </TabsList>

        <TabsContent value="sales">
          <SalesTab orders={orders} salesVolume={salesVolume} />
        </TabsContent>

        <TabsContent value="financial">
          <FinancialTab
            summary={financialSummary}
            paymentMethodData={paymentMethodData}
            locale={locale as 'en' | 'id'}
          />
        </TabsContent>

        <TabsContent value="menu">
          <MenuTab
            topSellingItems={topSellingItems}
            top10ByRevenue={top10ByRevenue}
            locale={locale as 'en' | 'id'}
          />
        </TabsContent>

        <TabsContent value="open-table">
          <OpenTableTab activeTables={activeTables} tableRevenueData={tableRevenueData} />
        </TabsContent>

        <TabsContent value="unpaid">
          <UnpaidTab
            unpaidOrders={unpaidOrders}
            unpaidTotal={unpaidTotal}
            unpaidTrend={unpaidTrend}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}

// ─── Date Range Button ──────────────────────────────────────────────────────

function DateRangeButton({
  label,
  value,
  active,
  onClick,
  icon,
}: {
  label: string
  value: string
  active: string
  onClick: (value: string) => void
  icon?: boolean
}) {
  return (
    <Button
      variant={active === value ? 'default' : 'outline'}
      size="sm"
      onClick={() => onClick(value)}
    >
      {icon && <Calendar className="h-3.5 w-3.5" data-icon="inline-start" />}
      {label}
    </Button>
  )
}

// ─── Summary Card ───────────────────────────────────────────────────────────

function SummaryCard({
  title,
  value,
  icon: Icon,
  description,
  trend,
  destructive,
}: {
  title: string
  value: string
  icon: React.ElementType
  description?: string
  trend?: string
  destructive?: boolean
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <Icon
          className={`h-4 w-4 ${
            destructive ? 'text-destructive' : 'text-muted-foreground'
          }`}
        />
      </CardHeader>
      <CardContent>
        <div className={`text-2xl font-bold ${destructive ? 'text-destructive' : ''}`}>
          {value}
        </div>
        <div className="flex items-center gap-1">
          {description && (
            <p className="text-xs text-muted-foreground">{description}</p>
          )}
          {trend && (
            <span className="text-xs font-medium text-emerald-600">{trend}</span>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

// ─── Sales Tab ──────────────────────────────────────────────────────────────

function SalesTab({
  orders,
  salesVolume,
}: {
  orders: any[]
  salesVolume: Array<{ date: string; orders: number }>
}) {
  const t = useTranslate()
  const hasVolume = salesVolume.some((b) => b.orders > 0)
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{t('reports.transactionVolume')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-56">
            {!hasVolume ? (
              <div className="flex h-full items-center justify-center">
                <p className="text-sm text-muted-foreground">
                  {t('reports.noTransactions')}
                </p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={salesVolume}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 12 }}
                    stroke="var(--muted-foreground)"
                  />
                  <YAxis
                    allowDecimals={false}
                    tick={{ fontSize: 12 }}
                    stroke="var(--muted-foreground)"
                  />
                  <RechartsTooltip
                    formatter={(value) => [value, t('reports.orderCount')]}
                    contentStyle={{
                      borderRadius: '8px',
                      border: '1px solid var(--border)',
                      fontSize: '13px',
                    }}
                  />
                  <Bar dataKey="orders" fill="#2563eb" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>{t('reports.transactionHistory')}</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('common.date')}</TableHead>
              <TableHead>{t('table.orderNumber')}</TableHead>
              <TableHead>{t('table.table')}</TableHead>
              <TableHead>{t('table.cashier')}</TableHead>
              <TableHead>{t('common.total')}</TableHead>
              <TableHead>{t('table.payment')}</TableHead>
              <TableHead>{t('common.status')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                  {t('reports.noTransactions')}
                </TableCell>
              </TableRow>
            ) : (
              orders.map((order: any) => (
                <TableRow key={order.id}>
                  <TableCell className="text-muted-foreground">
                    {formatDate(order.createdAt)}
                  </TableCell>
                  <TableCell className="font-mono text-xs font-medium">
                    {order.orderNumber}
                  </TableCell>
                  <TableCell>{order.tableNumber ?? order.tableName ?? '-'}</TableCell>
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
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
    </div>
  )
}

// ─── Financial Tab ──────────────────────────────────────────────────────────

function FinancialTab({
  summary,
  paymentMethodData,
  locale,
}: {
  summary: { grossRevenue: number; totalTax: number; totalDiscount: number; netRevenue: number }
  paymentMethodData: { name: string; value: number }[]
  locale: 'en' | 'id'
}) {
  const { grossRevenue, totalTax, totalDiscount, netRevenue } = summary
  const t = useTranslate()
  const paymentTotal = paymentMethodData.reduce((sum, pm) => sum + pm.value, 0)

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>{t('reports.financialSummary')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <FinancialRow label={t('reports.grossRevenue')} value={formatRupiah(grossRevenue)} />
          <FinancialRow
            label={t('reports.discount')}
            value={`-${formatRupiah(totalDiscount)}`}
            muted
          />
          <FinancialRow
            label={t('reports.tax')}
            value={`+${formatRupiah(totalTax)}`}
            muted
          />
          <div className="border-t pt-4">
            <FinancialRow
              label={t('reports.netRevenue')}
              value={formatRupiah(netRevenue)}
              bold
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t('reports.revenueByPaymentMethod')}</CardTitle>
        </CardHeader>
        <CardContent>
          {paymentMethodData.length === 0 ? (
            <div className="flex h-64 items-center justify-center">
              <p className="text-sm text-muted-foreground">{t('reports.noPaymentData')}</p>
            </div>
          ) : (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={paymentMethodData} layout="vertical" margin={{ left: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis
                    type="number"
                    tick={{ fontSize: 12 }}
                    stroke="var(--muted-foreground)"
                    tickFormatter={(value: number) =>
                      `${(value / 1000).toFixed(0)}${locale === 'id' ? 'rb' : 'K'}`
                    }
                  />
                  <YAxis
                    type="category"
                    dataKey="name"
                    tick={{ fontSize: 12 }}
                    stroke="var(--muted-foreground)"
                    width={100}
                  />
                  <RechartsTooltip
                    formatter={(value) => [formatRupiah(Number(value)), t('common.total')]}
                    contentStyle={{
                      borderRadius: '8px',
                      border: '1px solid var(--border)',
                      fontSize: '13px',
                    }}
                  />
                  <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                    {paymentMethodData.map((_entry, index) => (
                      <Cell
                        key={`pm-cell-${index}`}
                        fill={PIE_COLORS[index % PIE_COLORS.length]}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
          <div className="border-t pt-3 mt-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">{t('common.total')}</span>
              <span className="text-sm font-bold">{formatRupiah(paymentTotal)}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function FinancialRow({
  label,
  value,
  muted,
  bold,
}: {
  label: string
  value: string
  muted?: boolean
  bold?: boolean
}) {
  return (
    <div className="flex items-center justify-between">
      <span className={`text-sm ${muted ? 'text-muted-foreground' : bold ? 'font-semibold' : ''}`}>
        {label}
      </span>
      <span className={`text-sm ${bold ? 'text-lg font-bold' : 'font-medium'}`}>
        {value}
      </span>
    </div>
  )
}

// ─── Menu Tab ───────────────────────────────────────────────────────────────

function MenuTab({
  topSellingItems,
  top10ByRevenue,
  locale,
}: {
  topSellingItems: { name: string; qty: number; revenue: number }[]
  top10ByRevenue: { name: string; qty: number; revenue: number }[]
  locale: 'en' | 'id'
}) {
  const t = useTranslate()
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{t('reports.topItemsByRevenue')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            {top10ByRevenue.length === 0 ? (
              <div className="flex h-full items-center justify-center">
                <p className="text-sm text-muted-foreground">{t('common.noData')}</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={top10ByRevenue} layout="vertical" margin={{ left: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis
                    type="number"
                    tick={{ fontSize: 12 }}
                    stroke="var(--muted-foreground)"
                    tickFormatter={(value: number) =>
                      `${(value / 1000).toFixed(0)}${locale === 'id' ? 'rb' : 'K'}`
                    }
                  />
                  <YAxis
                    type="category"
                    dataKey="name"
                    tick={{ fontSize: 11 }}
                    stroke="var(--muted-foreground)"
                    width={140}
                  />
                  <RechartsTooltip
                    formatter={(value) => [formatRupiah(Number(value)), t('dashboard.revenue')]}
                    contentStyle={{
                      borderRadius: '8px',
                      border: '1px solid var(--border)',
                      fontSize: '13px',
                    }}
                  />
                  <Bar dataKey="revenue" fill="#059669" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>{t('reports.topSelling')}</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-16">#</TableHead>
              <TableHead>{t('reports.itemName')}</TableHead>
              <TableHead>{t('reports.quantitySold')}</TableHead>
              <TableHead>{t('dashboard.revenue')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {topSellingItems.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                  {t('common.noData')}
                </TableCell>
              </TableRow>
            ) : (
              topSellingItems.map((item, index) => (
                <TableRow key={item.name}>
                  <TableCell>
                    <div
                      className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${
                        index === 0
                          ? 'bg-yellow-100 text-yellow-700'
                          : index === 1
                            ? 'bg-gray-100 text-gray-600'
                            : index === 2
                              ? 'bg-orange-100 text-orange-700'
                              : 'bg-muted text-muted-foreground'
                      }`}
                    >
                      {index + 1}
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">{item.name}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">{t('reports.portions', { count: item.qty })}</Badge>
                  </TableCell>
                  <TableCell className="font-medium">
                    {formatRupiah(item.revenue)}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
    </div>
  )
}

// ─── Open Table Tab ─────────────────────────────────────────────────────────

function OpenTableTab({
  activeTables,
  tableRevenueData,
}: {
  activeTables: any[]
  tableRevenueData: { name: string; revenue: number }[]
}) {
  const t = useTranslate()
  if (activeTables.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <Clock className="mb-3 h-10 w-10 text-muted-foreground/40" />
          <p className="text-sm font-medium text-muted-foreground">
            {t('reports.noOpenTables')}
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{t('reports.openTableRevenue')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={tableRevenueData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 12 }}
                  stroke="var(--muted-foreground)"
                />
                <YAxis
                  tick={{ fontSize: 12 }}
                  stroke="var(--muted-foreground)"
                  tickFormatter={(value: number) => `${(value / 1000).toFixed(0)}K`}
                />
                <RechartsTooltip
                  formatter={(value) => [formatRupiah(Number(value)), t('reports.runningTotal')]}
                  contentStyle={{
                    borderRadius: '8px',
                    border: '1px solid var(--border)',
                    fontSize: '13px',
                  }}
                />
                <Bar dataKey="revenue" fill="#d97706" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {activeTables.map((table) => (
        <Card key={table.id}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg">{t('reports.table', { number: table.number })}</CardTitle>
            <Badge variant="outline">{t('reports.seats', { count: table.capacity })}</Badge>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">{t('reports.duration')}</span>
              <div className="flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 text-orange-500" />
                <span className="text-sm font-medium text-orange-600">
                  {table.duration}
                </span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">{t('reports.runningTotal')}</span>
              <span className="text-sm font-bold">{formatRupiah(table.runningTotal)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">{t('table.orderNumber')}</span>
              <span className="font-mono text-xs">{table.orderNumber}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">{t('table.cashier')}</span>
              <span className="text-sm">{table.staffName}</span>
            </div>
            {table.customerName && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">{t('table.customer')}</span>
                <span className="text-sm">{table.customerName}</span>
              </div>
            )}
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">{t('common.status')}</span>
              <OrderStatusBadge status={table.status} />
            </div>
          </CardContent>
        </Card>
        ))}
      </div>
    </div>
  )
}

// ─── Unpaid Tab ─────────────────────────────────────────────────────────────

function UnpaidTab({
  unpaidOrders,
  unpaidTotal,
  unpaidTrend,
}: {
  unpaidOrders: any[]
  unpaidTotal: number
  unpaidTrend: Array<{ date: string; count: number }>
}) {
  const t = useTranslate()
  const hasTrend = unpaidTrend.some((b) => b.count > 0)

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {t('reports.unpaidCount')}
            </CardTitle>
            <AlertCircle className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{unpaidOrders.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {t('reports.totalUnpaid')}
            </CardTitle>
            <Receipt className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatRupiah(unpaidTotal)}</div>
          </CardContent>
        </Card>
      </div>

      {/* Trend Chart */}
      <Card>
        <CardHeader>
          <CardTitle>{t('reports.unpaidTrend')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-56">
            {!hasTrend ? (
              <div className="flex h-full items-center justify-center">
                <p className="text-sm text-muted-foreground">{t('reports.noUnpaidOrders')}</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={unpaidTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 12 }}
                    stroke="var(--muted-foreground)"
                  />
                  <YAxis
                    allowDecimals={false}
                    tick={{ fontSize: 12 }}
                    stroke="var(--muted-foreground)"
                  />
                  <RechartsTooltip
                    formatter={(value) => [value, t('reports.unpaidCount')]}
                    contentStyle={{
                      borderRadius: '8px',
                      border: '1px solid var(--border)',
                      fontSize: '13px',
                    }}
                  />
                  <Bar dataKey="count" fill="#dc2626" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Unpaid Orders Table */}
      <Card>
        <CardHeader>
          <CardTitle>{t('reports.unpaidOrders')}</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('common.date')}</TableHead>
                <TableHead>{t('table.orderNumber')}</TableHead>
                <TableHead>{t('table.table')}</TableHead>
                <TableHead>{t('table.cashier')}</TableHead>
                <TableHead>{t('common.total')}</TableHead>
                <TableHead>{t('common.status')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {unpaidOrders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                    <div className="flex flex-col items-center gap-2">
                      <AlertCircle className="h-6 w-6 text-muted-foreground/40" />
                      <span>{t('reports.noUnpaidOrders')}</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                unpaidOrders.map((order: any) => (
                  <TableRow key={order.id}>
                    <TableCell className="text-muted-foreground">
                      {formatDate(order.createdAt)}
                    </TableCell>
                    <TableCell className="font-mono text-xs font-medium">
                      {order.orderNumber}
                    </TableCell>
                    <TableCell>{order.tableNumber ?? order.tableName ?? '-'}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {order.staffName ?? '-'}
                    </TableCell>
                    <TableCell className="font-medium">
                      {formatRupiah(order.total)}
                    </TableCell>
                    <TableCell>
                      <OrderStatusBadge status={order.status} />
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}

// ─── Shared Sub-components ──────────────────────────────────────────────────

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

function formatDate(isoDate: string): string {
  const d = new Date(isoDate)
  return d.toLocaleDateString(undefined, {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}
