# Backoffice — 4-Task Implementation Plan

## Task 1 — Business-scoped dashboard + "All businesses" toggle

### Problem
`src/routes/_app/dashboard.tsx` calls business-agnostic report endpoints:
- `useSalesReport('week' | 'month')` → `/api/reports/sales?period=...` (no businessId)
- `useTopItems(1)` → `/api/reports/top-items?limit=1` (no businessId)
- `useOrders(businessId)` is scoped, but defaults to `'biz-001'` when `currentBusiness` is missing.

Result: dashboard always reflects the same global aggregate regardless of which business is selected.

### Approach
1. **API layer** (`src/lib/api.ts`):
   - Add optional `businessId` to `getDailySummary`, `getSalesReport`, `getTopItems`, `getPaymentMethodReport`, `getStaffPerformance`. Forward through `qs({...})`.
2. **Hooks** (`src/lib/api-hooks.ts`):
   - Thread `businessId` through each report hook, include it in `queryKey`, and gate with `enabled: businessId !== undefined` (undefined = not yet selected; `null` = all-businesses sentinel, enabled).
3. **Auth context** (`src/lib/auth-context.tsx`):
   - Introduce an "all businesses" sentinel. Option A (chosen): keep `currentBusiness: Business | null` and add `scope: 'single' | 'all'` to the state. Persist `scope`. `selectBusiness(id)` sets `scope:'single'`. New `selectAllBusinesses()` sets `scope:'all'` and keeps `currentBusiness` as a synthesized `{ id: '__all__', name: t('nav.allBusinesses') }` or just exposes `scope` separately — we'll store `scope` explicitly and leave `currentBusiness` = first business so existing consumers don't break.
   - Export a helper `useActiveBusinessId()` that returns `null` when `scope==='all'`, else `currentBusiness?.id`.
4. **Dashboard** (`src/routes/_app/dashboard.tsx`):
   - Replace the `businessId = currentBusiness?.id ?? 'biz-001'` fallback with the new hook.
   - When `scope==='all'`, pass `undefined` to `useOrders` and aggregate per-business results. Simpler path for v1: add `api.getOrders()` with no businessId (already supported server-side? check) → if not, loop over `businesses` and `Promise.all` their `/api/orders?businessId=...`. Plan: call `useQueries` over each business and merge.
   - All stats (todayRevenue, todayOrderCount, weekRevenue, monthRevenue, revenueTrend, topSellingItem) already derive from orders → they'll work automatically once the merged orders array is populated.
   - Add a sub-header strip showing the active scope ("Showing: <business name>" or "Showing: All businesses").
5. **Header business switcher** (`src/routes/_app.tsx`):
   - Add an "All businesses" item at the top of the dropdown with a Globe icon; clicking it calls `selectAllBusinesses()`.
   - Label the trigger with the scope ("All businesses" vs business name).
   - Add a subtle check icon next to the active entry.
6. **i18n** (`src/locales/{id,en}.ts`):
   - `nav.allBusinesses`, `dashboard.showingAll`, `dashboard.showingFor`.
7. **Guards**:
   - `/settings/*`, `/menu` stay business-scoped. If `scope==='all'`, redirect these routes to `/dashboard` OR force-select the first business before navigating. Plan: force-select first business on nav from dashboard (simplest). Dashboard is the only multi-scope route.

### Files
- `src/lib/api.ts` (thread businessId through 5 report endpoints)
- `src/lib/api-hooks.ts` (update 5 hooks)
- `src/lib/auth-context.tsx` (add `scope`, `selectAllBusinesses`, export `useActiveBusinessId`)
- `src/routes/_app.tsx` (switcher: add "All businesses" entry, label)
- `src/routes/_app/dashboard.tsx` (use scope, aggregate orders across businesses when all)
- `src/locales/id.ts`, `src/locales/en.ts`

---

## Task 2 — Bulk-import template

### Problem
- Template exists at `public/menu-import-template.csv` with only 2 rows — fine as a minimum but thin.
- No XLSX option; the import dialog advertises "CSV or XLSX" but template is CSV-only.

### Approach
1. **Expand CSV template** `public/menu-import-template.csv` — 10–12 rows across 4 categories (Minuman, Makanan, Makanan Ringan, Paket) in Indonesian + a couple in English, covering full description column and price ranges typical for F&B.
2. **On-the-fly XLSX generation** in `src/components/onboarding/MenuImportDialog.tsx`:
   - Replace the `<a href="/menu-import-template.csv" download>` with a small `DropdownMenu` offering "Download CSV" and "Download XLSX (.xlsx)".
   - XLSX path: dynamic import `xlsx` (already a dep), build a workbook from the same seed rows, `XLSX.writeFile(wb, 'menu-import-template.xlsx')`.
   - Extract seed rows to `src/lib/menu-import-template.ts` shared by both paths so there's one source of truth.
3. **Discoverability**: add a short "Required columns: category, name, price. Optional: description." hint under the buttons.

### Files
- `public/menu-import-template.csv` (rewrite)
- `src/lib/menu-import-template.ts` (new — seed rows + helpers `buildCsv()`, `downloadXlsx()`)
- `src/components/onboarding/MenuImportDialog.tsx` (swap download link → split button)
- `src/locales/{id,en}.ts` (`onboarding.menu.import.downloadCsv`, `.downloadXlsx`, `.requiredColumns`)

---

## Task 3 — Unify `/menu` page with onboarding two-column layout

### Current state
`src/routes/_app/menu.tsx` uses `Tabs` with separate "Categories" and "Menu Items" panels (~1223 lines).

### Target layout — **three-column master/detail** (generalizes onboarding's 2-col)
```
┌──────────────────────────────────────────────────────────────────────────────┐
│  Menu                                                         [Bulk import]   │
│  Manage categories, items, and modifiers.                                     │
├────────────────┬───────────────────────────────┬─────────────────────────────┤
│ Categories   + │ Items — <selected category> + │ Details                     │
│ ───────────── │ ─────────────────────────────  │ ─────────────────────────── │
│ • Minuman      │ ● Es Teh Manis   Rp 8.000     │ [Image]                     │
│ • Makanan ●    │ ○ Nasi Goreng    Rp 25.000    │ Name: Nasi Goreng Spesial   │
│ + add          │ + add item                    │ Price: Rp 25.000            │
│                │                               │ Category: Makanan           │
│                │                               │ Available: [toggle]         │
│                │                               │ Description: …              │
│                │                               │                             │
│                │                               │ Modifiers                +  │
│                │                               │ • Extra cheese  +Rp 5.000 × │
│                │                               │ • Pedas         +Rp 0     × │
│                │                               │                             │
│                │                               │ [Save]  [Delete]            │
└────────────────┴───────────────────────────────┴─────────────────────────────┘
```
On narrow screens (< lg): collapse to 2 columns (cats|items) with an overlay `Sheet` on the right for details. On mobile (< md): cats picker becomes a dropdown above the item list.

### Approach
1. **Remove `Tabs`** and restructure into `grid lg:grid-cols-[240px_minmax(320px,1fr)_420px]` (3-col desktop), `md:grid-cols-[240px_1fr]` + Sheet for details (2-col tablet), stacked on mobile.
2. **Column 1 — Categories**:
   - Card with header ("Categories" + `+` icon button).
   - Selectable list: each row shows name + item count badge. Click → select; pencil icon for rename (inline input on hover / on focus); trash → shadcn `AlertDialog` confirm. Active row gets `border-primary bg-accent/50`.
   - Wire to `useCreateCategory / useUpdateCategory / useDeleteCategory`.
3. **Column 2 — Items**:
   - Header: "Items — {selectedCategory.name}" + "+ Add item" button (disabled if no category selected).
   - Search input at top filtering items in the selected category.
   - List of compact item rows: thumbnail, name, price, availability dot/badge. Click row → selects for details panel. Row also has a kebab `DropdownMenu` (Edit, Duplicate, Delete).
   - Empty states: "No categories yet" / "Select a category first" / "No items in this category yet".
4. **Column 3 — Details / editor**:
   - Shown when an item is selected (or when "+ Add item" is clicked, in create mode).
   - Fields: image upload, name, description, price, category (Select), availability (Switch), modifiers editor.
   - **Modifiers editor** (today stored client-side in localStorage `bukukasir_item_modifiers_v1` via `ItemModifier[]`):
     - Repeater: rows of { name, priceDelta }, `+ Add modifier`, delete per row.
     - Persisted on Save along with the item mutation (still client-side until backend supports modifiers natively — keep the existing `loadItemMods/saveItemMods` helpers, just move them into a small `useItemModifiers(itemId)` hook).
   - Footer actions: `Save`, `Cancel`, and `Delete` (AlertDialog confirm) aligned to the right.
5. **Top bar**:
   - Page title, subtitle, and "Bulk import" button (reuse `MenuImportDialog` — parameterize it to take `businessId` prop directly rather than from `useOnboarding`).
6. **Responsive fallback**: on `<lg`, replace column 3 with a right-anchored `Sheet` that opens when an item is selected or when creating. Existing Add/Edit dialog flow can be removed once the details panel + Sheet cover both modes.
7. **State model**:
   - `selectedCategoryId: string | null`
   - `selectedItemId: string | 'new' | null` — `'new'` means create mode; details panel binds to a local draft, commits via `useCreateMenuItem`/`useUpdateMenuItem` on Save.
   - Modifiers state is local to the details panel, synced from `useItemModifiers(selectedItemId)`.

### Refactor notes
- `MenuImportDialog` currently depends on `useOnboarding()` context — refactor to accept `businessId` prop and an optional `onImported` callback so it's reusable from both onboarding and `/menu`. Onboarding keeps wrapping it with context-derived props.
- Extract a small `useItemModifiers(itemId)` hook in `src/lib/item-modifiers.ts` that wraps the existing localStorage map — so both the details panel (and any future KDS screen) share the same source of truth.

### Files
- `src/routes/_app/menu.tsx` (major restructure — target ~600 lines by replacing tabs + inline dialog forms with 3-col master/detail; Sheet fallback on narrow screens)
- `src/components/onboarding/MenuImportDialog.tsx` (prop-ify; keep back-compat)
- `src/lib/item-modifiers.ts` (new — hook + helpers extracted from current inline code)
- `src/locales/{id,en}.ts` (`menu.pageTitle`, `menu.pageSubtitle`, `menu.modifiers`, `menu.addModifier`, `menu.selectItemHint`)

---

## Task 4 — shadcn UI migration pass

### Audit findings
- ✅ Already using shadcn: `button, card, dialog, dropdown-menu, input, label, select, sheet, sidebar, skeleton, switch, table, tabs, textarea, tooltip, badge, avatar, checkbox, separator`.
- ❌ Missing (needed by tasks 1–3 and general polish): `popover`, `command`, `alert-dialog`, `scroll-area`.
- 🎨 Inline hex colors everywhere (`#1E3A6B`, `#D4A726`, `#FDF8E8`, …) — bypass the theme tokens. The project already exposes shadcn CSS vars (`--primary`, `--accent`, etc. in `index.css`). Convert to token classes (`bg-primary`, `text-primary-foreground`, `bg-accent`) where it doesn't change meaning; keep literal hex only where the hex is the brand mark (logo).

### Changes
1. **Add components** via shadcn CLI patterns (manual add to `src/components/ui/`):
   - `popover.tsx`, `command.tsx`, `alert-dialog.tsx`, `scroll-area.tsx`.
2. **Business switcher** (`src/routes/_app.tsx`): convert the `DropdownMenu` list to a `Popover` + `Command` combobox — searchable business list, keyboard nav out of the box. Pin "All businesses" as the first command item.
3. **Destructive confirms**: replace `deleteTarget` modal pattern in `/menu` (and any analogous `confirm()`/Dialog-based delete confirms) with shadcn `AlertDialog` — semantically correct and accessible.
4. **Long lists in Popover / Sidebar**: wrap in `ScrollArea` for consistent scrollbar styling.
5. **Color tokens**: sweep `text-[#1E3A6B]` → `text-primary`, `bg-[#D4A726]` → `bg-accent` (brand gold), `hover:bg-[#C0961F]` → `hover:bg-accent/90`, `bg-[#FDF8E8]` → `bg-accent/10`, etc. Update `tailwind.config` / `index.css` only if the current tokens don't map cleanly.
6. **Skeletons for loading states**: dashboard, menu, reports currently show raw text "Loading…" — replace with `Skeleton` cards (component already exists).

### Files
- `src/components/ui/popover.tsx` (new)
- `src/components/ui/command.tsx` (new — depends on `cmdk` package; check if present, add if not)
- `src/components/ui/alert-dialog.tsx` (new)
- `src/components/ui/scroll-area.tsx` (new — depends on `@radix-ui/react-scroll-area`)
- `src/routes/_app.tsx` (switcher → Popover+Command)
- `src/routes/_app/menu.tsx` (AlertDialog for delete confirm, Skeletons)
- `src/routes/_app/dashboard.tsx` (Skeletons)
- Color token sweep across `src/routes/_app/*` and onboarding screens (largely a find-replace)

### Dependencies to add (if not present)
- `cmdk` (for Command)
- `@radix-ui/react-scroll-area`
- `@radix-ui/react-alert-dialog`
- `@radix-ui/react-popover`

---

## Execution order
1. **Task 4 scaffolding** first — add missing shadcn components (popover, command, alert-dialog, scroll-area) since Tasks 1 & 3 use them.
2. **Task 1** — business scoping + All businesses toggle (uses new Popover+Command switcher).
3. **Task 3** — /menu layout rebuild (uses AlertDialog for deletes).
4. **Task 2** — template enrichment + XLSX download (smallest surface).
5. **Task 4 polish pass** — color token sweep + Skeletons across remaining screens.

## Verification
- `npm run lint` and `npm run build` green.
- Manual: switch business → dashboard numbers change; pick "All businesses" → aggregate appears. Download template in CSV + XLSX; import works. `/menu` shows two-column layout; category selection drives item list; add/edit/delete via AlertDialog. Switcher is keyboard-searchable.
