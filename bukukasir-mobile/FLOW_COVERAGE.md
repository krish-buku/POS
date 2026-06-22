# BukuKasir Mobile Flow Coverage

This checklist tracks what the mobile-only redesign covers, what remains pending, and what requires the iPad simulator gate. `Local pending` means the UI is implemented with isolated mobile state because the current gateway does not expose a full contract yet.

Design reference applied from `design_POS`: `src/tokens.jsx`, `src/chrome.jsx`, `src/components-table.jsx`, `src/screens-auth.jsx`, `src/screens-cashier-v2.jsx`, `src/screens-cashier-3.jsx`, `src/screens-cashier-4.jsx`, `src/screens-extra-cashier.jsx`, `src/screens-waiter.jsx`, and `src/screens-kitchen.jsx`.

| PRD area | Implementation status | Automated check | iPad manual check | Notes |
| --- | --- | --- | --- | --- |
| Auth/security: phone login, OTP/PIN, business selection | Implemented | Playwright auth/login | Verified on iPad Pro 13-inch 26.4 | Dev mode still accepts any valid 6-digit OTP/PIN. |
| Auth/security: first-time PIN, auto-lock, change PIN entry | Partial/local pending | TypeScript only | Pending iPad | PIN setup exists; auto-lock/change-PIN entry is shown as pending local work. |
| Onboarding: business profile, tax, floor/tables, menu, staff, printer | Local pending | TypeScript only | Pending iPad | Mobile surfaces setup checklist; persistence belongs to future backend/backoffice contracts. |
| Cashier: table status icon + text + color | Implemented | Cashier tables spec | Verified on iPad Pro 13-inch 26.4 | SVG `TableTile` follows the `design_POS` chair/shape/status visual. |
| Cashier: takeaway, seating sheet, menu search, modifiers, notes | Implemented | Cashier order spec | Pending deeper iPad walkthrough | Modifier groups from backend are normalized and selectable. Generated food images render from backend URLs with local asset fallback. |
| Cashier: send to kitchen, open table sessions, add more | Implemented/partial | Cashier order spec | Pending iPad | Existing create-order API used; open-table timeline is derived from orders. |
| Cashier: partial payment, full close | Implemented | Payment spec | Pending iPad | Existing payment API used for single payment; split uses visible local pending state. |
| Transaction controls: discount, fees, void line, full void PIN, fire item | Partial/local pending | TypeScript only | Pending iPad | UI affordances and manager PIN copy are present; some mutations remain local. |
| Payment split by amount and by item | Partial/local pending | Payment spec | Pending iPad | Split-by-amount UI exists; split-by-item is tracked as local pending. |
| Receipt/printer: preview, retry/print later/skip, reprint, digital receipt | Local pending | Payment spec | Pending full iPad walkthrough | Payment completion is not rolled back by printer states. |
| Waiter: assigned tables, own orders only, add order, send to kitchen | Implemented | Waiter tables spec | Pending iPad | Waiter screens hide payment controls. |
| Waiter: bill request, transfer request/accept/reject | Local pending | TypeScript only | Pending iPad | Transfer UI remains mobile-local until notification contract exists. |
| Kitchen: queue columns, detail, start/ready/move back, reprint, elapsed time | Implemented/partial | Kitchen queue spec | Pending iPad | Status updates use gateway; reprint shown as local pending. |
| Resilience: offline banner, queue warning, retry, conflict, crash recovery | Local pending | TypeScript only | Pending iPad | Visible pending/local states added; durable queue implementation remains pending. |
| Accessibility/localization: Indonesian-first, IDR, large targets, no color-only status | Implemented | Playwright text checks | Verified on iPad floor view | Status surfaces use icon + label + color; English toggle is covered for cashier chrome and waiter order controls. Empty/error states now use real recovery buttons instead of text-only dead ends. |
| Menu image data: generated item photos visible in app | Implemented | Cashier order spec | Verified on iPad Pro 13-inch 26.4 | Mobile has one local generated PNG per menu item; backend seed returns `/menu-images/...` for all 10 seeded items; gateway serves image assets at port 8080. |

## Latest validation

- `npx tsc --noEmit`: passed on 2026-05-21.
- Full Playwright regression: 34/34 passed on 2026-05-21 for auth, cashier history/order/payment/tables, i18n, kitchen queue, and waiter tables.
- Dead-end recovery pass: cashier table empty states reset to the populated floor or start a walk-in order; cashier/waiter menu empty states can clear filters/refresh or go back; history and transfer empty states can refresh or return to tables.
- Focused image regression: passed; `menu-001`, `menu-002`, `menu-003`, and `menu-004` each render a separate generated food image element.
- Backend smoke through `http://localhost:8080`: health, businesses, tables, menu items, kitchen tickets, payment methods, and `/menu-images/nasi-goreng.png` all return 200.
- Backend menu seed validation: `biz-001` returns 10 menu items and 0 missing `imageUrl` values.
- iPad Pro 13-inch (iOS 26.4) is open through Metro port `8099` on the cashier order screen; generated food images are visible in the running app.

## Design parity audit

| Design reference | Mobile implementation | Current result | Remaining gap |
| --- | --- | --- | --- |
| `screens-auth.jsx`, `screens-extra-auth.jsx` | Phone login, business picker, role picker, PIN keypad, Indonesian/English labels | Auth tests 4/4 passed | Auto-lock/change-PIN remain local/pending surfaces. |
| `screens-cashier-1.jsx` | Floor/table status, seating sheet, menu grid, order panel, modifier sheet | Cashier table/order tests passed; icon + text + color status retained | Manual iPad pass still needed after current reload. |
| `screens-cashier-3.jsx` | Payment, receipt preview, split toggle, printer fallback actions | Payment tests passed | Printer actions are local pending until printer/backend contracts exist. |
| `screens-cashier-4.jsx` | Open-table continuation, partial payment, table transfer affordances | UI and payment path covered | Some open-table/session mutations are derived or local pending. |
| `screens-waiter.jsx` | My tables dashboard, waiter order entry, no-payment panel, bill request, transfer pending UI | Waiter tests passed; payment controls hidden | Transfer notification accept/reject remains local pending. |
| `screens-kitchen.jsx` | KDS three-column queue, ticket detail, elapsed bands, start/ready/reprint controls | Kitchen tests passed | Reprint remains explicitly `pending/local`. |
| `chrome.jsx`, `tokens.jsx` | Shared tablet header, role chips, live/sync status, restrained POS palette | Used across redesigned role surfaces | Some legacy history screens are functional but less exact visually than the primary POS/KDS/waiter flows. |

## Current simulator gate

Target command after local Xcode runtime is fixed:

```bash
EXPO_PUBLIC_API_BASE_URL=http://localhost:8080 npx expo run:ios -p 8099
```

Result on 2026-05-20:

- iOS 26.4 iPad Pro 13-inch simulator booted.
- `expo run:ios -d 7724B448-4BCF-4E15-A208-A2EBEF62CA4F -p 8099` still fails because Xcode 26.5 only exposes the iOS 26.5 simulator SDK and reports iOS 26.5 is not installed.
- Existing installed native build can load the redesigned JS bundle through Metro on port 8099 after setting `RCT_jsLocation=localhost:8099`.
- Because the installed binary is missing current Worklets/AsyncStorage/Haptics native modules, Metro uses local native-safe development shims until a fresh iOS build is possible.

If Xcode still asks for iOS 26.5, install the matching iOS simulator runtime from Xcode Settings > Components, then rerun the target command above.
