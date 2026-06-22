import { createFileRoute, Outlet, useNavigate, Link, useMatches } from '@tanstack/react-router'
import { useEffect, useState, useRef, useMemo } from 'react'
import { useAuth } from '@/lib/auth-context'
import { useI18n } from '@/lib/i18n-context'
import { useBusinesses } from '@/lib/api-hooks'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import {
  LayoutDashboard,
  UtensilsCrossed,
  BarChart3,
  Settings,
  CreditCard,
  Receipt,
  Printer,
  Percent,
  DollarSign,
  Users,
  Building2,
  Bell,
  Search,
  ChevronDown,
  LogOut,
  User,
  Store,
  ChevronRight,
  Globe,
} from 'lucide-react'

export const Route = createFileRoute('/_app')({
  component: AppLayout,
})

// ─── Navigation Config ───────────────────────────────────────────────────────

interface NavItem {
  titleKey: string
  url: string
  icon: React.ElementType
  children?: { titleKey: string; url: string; icon: React.ElementType }[]
}

const navigation: NavItem[] = [
  {
    titleKey: 'nav.dashboard',
    url: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    titleKey: 'nav.menu',
    url: '/menu',
    icon: UtensilsCrossed,
  },
  {
    titleKey: 'nav.reports',
    url: '/reports',
    icon: BarChart3,
  },
  {
    titleKey: 'nav.settings',
    url: '/settings',
    icon: Settings,
    children: [
      { titleKey: 'nav.payments', url: '/settings/payments', icon: CreditCard },
      { titleKey: 'nav.floors', url: '/settings/floors', icon: Building2 },
      { titleKey: 'nav.receipt', url: '/settings/receipt', icon: Receipt },
      { titleKey: 'nav.kitchenPrint', url: '/settings/kitchen-print', icon: Printer },
      { titleKey: 'nav.discounts', url: '/settings/discounts', icon: Percent },
      { titleKey: 'nav.fees', url: '/settings/fees', icon: DollarSign },
      { titleKey: 'nav.staff', url: '/settings/staff', icon: Users },
      { titleKey: 'nav.business', url: '/settings/business', icon: Building2 },
    ],
  },
]

// ─── Layout Component ────────────────────────────────────────────────────────

function AppLayout() {
  const { isAuthenticated, currentBusiness, scope, user, logout, selectBusiness, selectAllBusinesses } =
    useAuth()
  const { t, locale, setLocale } = useI18n()
  const navigate = useNavigate()
  const { data: businesses = [] } = useBusinesses()

  useEffect(() => {
    if (!isAuthenticated) {
      void navigate({ to: '/login' })
    } else if (!currentBusiness) {
      void navigate({ to: '/select-business' })
    }
  }, [isAuthenticated, currentBusiness, navigate])

  if (!isAuthenticated || !currentBusiness) {
    return null
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="sticky top-0 z-20 flex h-14 items-center gap-2 border-b bg-background px-4">
          <SidebarTrigger />
          <Separator orientation="vertical" className="mx-1 h-5" />
          <span className="text-sm font-semibold lg:hidden">
            <span className="text-primary">Buku</span><span className="text-accent">Kasir</span>
          </span>

          {/* Search + Actions */}
          <div className="ml-auto flex items-center gap-3">
            <GlobalSearch />


            {/* Language Switcher */}
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => setLocale(locale === 'id' ? 'en' : 'id')}
              title={locale === 'id' ? 'English' : 'Indonesia'}
            >
              <Globe className="h-4 w-4" />
              <span className="sr-only">{locale === 'id' ? 'EN' : 'ID'}</span>
            </Button>

            {/* Notifications */}
            <Button variant="ghost" size="icon-sm">
              <Bell className="h-4 w-4" />
            </Button>

            {/* Business Switcher */}
            <DropdownMenu>
              <DropdownMenuTrigger
                className="flex items-center gap-2 rounded-lg border border-input px-3 py-1.5 text-sm transition-colors hover:bg-muted"
              >
                {scope === 'all' ? (
                  <Globe className="h-4 w-4 text-primary" />
                ) : (
                  <Store className="h-4 w-4 text-primary" />
                )}
                <span className="hidden max-w-32 truncate font-medium sm:inline">
                  {scope === 'all' ? t('nav.allBusinesses') : currentBusiness.name}
                </span>
                <ChevronDown className="h-3 w-3 text-muted-foreground" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" sideOffset={8}>
                <DropdownMenuGroup>
                  <DropdownMenuLabel>{t('nav.switchBusiness')}</DropdownMenuLabel>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => selectAllBusinesses()}>
                  <Globe className="mr-2 h-4 w-4" />
                  {t('nav.allBusinesses')}
                  {scope === 'all' && <span className="ml-auto text-xs text-muted-foreground">✓</span>}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                {businesses.map((biz: any) => (
                  <DropdownMenuItem
                    key={biz.id}
                    onClick={() => selectBusiness(biz.id, biz)}
                  >
                    <Building2 className="mr-2 h-4 w-4" />
                    {biz.name}
                    {scope === 'single' && currentBusiness?.id === biz.id && (
                      <span className="ml-auto text-xs text-muted-foreground">✓</span>
                    )}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger className="outline-none">
                <Avatar size="sm">
                  <AvatarFallback>
                    {user?.name
                      .split(' ')
                      .map((n) => n[0])
                      .join('')
                      .slice(0, 2) ?? 'U'}
                  </AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" sideOffset={8}>
                <DropdownMenuGroup>
                  <DropdownMenuLabel>
                    <div>
                      <p className="text-sm font-medium">{user?.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {user?.phone}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <User className="mr-2 h-4 w-4" />
                  {t('nav.profile')}
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Settings className="mr-2 h-4 w-4" />
                  {t('nav.settings')}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => {
                    logout()
                    void navigate({ to: '/login' })
                  }}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  {t('nav.logout')}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>
        <div className="flex-1 p-4 lg:p-6">
          <Outlet />
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}

// ─── Sidebar Component ───────────────────────────────────────────────────────

function AppSidebar() {
  const { currentBusiness, scope } = useAuth()
  const { t } = useI18n()
  const matches = useMatches()
  const currentPath = matches[matches.length - 1]?.fullPath ?? ''

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" tooltip="BukuKasir">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-accent text-accent-foreground">
                <Store className="h-4 w-4" />
              </div>
              <div className="flex flex-col gap-0.5 leading-none">
                <span className="font-semibold"><span className="text-sidebar-foreground">Buku</span><span className="text-accent">Kasir</span></span>
                <span className="text-xs opacity-70">
                  {scope === 'all' ? t('nav.allBusinesses') : currentBusiness?.name ?? 'Back Office'}
                </span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>{t('nav.mainMenu')}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigation.map((item) =>
                item.children ? (
                  <CollapsibleNavItem
                    key={item.titleKey}
                    item={item}
                    currentPath={currentPath}
                  />
                ) : (
                  <SidebarMenuItem key={item.titleKey}>
                    <SidebarMenuButton
                      tooltip={t(item.titleKey as any)}
                      isActive={currentPath === item.url}
                      render={<Link to={item.url} />}
                    >
                      <item.icon className="h-4 w-4" />
                      <span>{t(item.titleKey as any)}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="sm" tooltip="v0.1.0">
              <span className="text-xs text-sidebar-foreground/50">
                v0.1.0
              </span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}

// ─── Collapsible Nav Item ────────────────────────────────────────────────────

function CollapsibleNavItem({
  item,
  currentPath,
}: {
  item: NavItem
  currentPath: string
}) {
  const { t } = useI18n()
  const isChildActive = item.children?.some((c) => currentPath === c.url) ?? false
  const [open, setOpen] = useState(isChildActive)

  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        tooltip={t(item.titleKey as any)}
        isActive={isChildActive}
        onClick={() => setOpen((o) => !o)}
      >
        <item.icon className="h-4 w-4" />
        <span>{t(item.titleKey as any)}</span>
        <ChevronRight
          className={`ml-auto h-4 w-4 transition-transform ${open ? 'rotate-90' : ''}`}
        />
      </SidebarMenuButton>
      {open && item.children && (
        <SidebarMenuSub>
          {item.children.map((child) => (
            <SidebarMenuSubItem key={child.titleKey}>
              <SidebarMenuSubButton
                isActive={currentPath === child.url}
                render={<Link to={child.url} />}
              >
                <child.icon className="h-4 w-4" />
                <span>{t(child.titleKey as any)}</span>
              </SidebarMenuSubButton>
            </SidebarMenuSubItem>
          ))}
        </SidebarMenuSub>
      )}
    </SidebarMenuItem>
  )
}

// ─── Global Search ──────────────────────────────────────────────────────────

function GlobalSearch() {
  const { t } = useI18n()
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // Build searchable items from navigation + flattened children
  const searchItems = useMemo(() => {
    const items: { label: string; url: string; icon: React.ElementType }[] = []
    for (const item of navigation) {
      items.push({ label: t(item.titleKey as any), url: item.url, icon: item.icon })
      if (item.children) {
        for (const child of item.children) {
          items.push({ label: t(child.titleKey as any), url: child.url, icon: child.icon })
        }
      }
    }
    return items
  }, [t])

  const filtered = query.trim()
    ? searchItems.filter((item) =>
        item.label.toLowerCase().includes(query.toLowerCase())
      )
    : searchItems

  const handleSelect = (url: string) => {
    setQuery('')
    setOpen(false)
    void navigate({ to: url })
  }

  // Close dropdown on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setOpen(false)
      inputRef.current?.blur()
    }
    if (e.key === 'Enter' && filtered.length > 0) {
      handleSelect(filtered[0].url)
    }
  }

  return (
    <div ref={containerRef} className="relative hidden md:block">
      <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        ref={inputRef}
        placeholder={t('common.search') + '...'}
        className="h-8 w-64 pl-8"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value)
          setOpen(true)
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={handleKeyDown}
      />
      {open && (
        <div className="absolute top-full left-0 z-50 mt-1 w-full rounded-lg border bg-popover p-1 shadow-lg">
          {filtered.length === 0 ? (
            <p className="px-3 py-2 text-sm text-muted-foreground">
              {t('common.noResults')}
            </p>
          ) : (
            filtered.map((item) => (
              <button
                key={item.url}
                className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground transition-colors"
                onMouseDown={(e) => {
                  e.preventDefault()
                  handleSelect(item.url)
                }}
              >
                <item.icon className="h-4 w-4 text-muted-foreground" />
                {item.label}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  )
}
