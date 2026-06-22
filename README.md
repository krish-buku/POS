# BukuKasir Backend

Spring Boot backend for BukuKasir POS. The consolidated API used by the mobile and backoffice apps is `services:bukukasir-api`.

## Requirements

- Java 21
- Gradle wrapper from this repo
- Optional: PostgreSQL/Supabase-compatible database

If Homebrew Java 25 is first on your PATH, pin Java 21 when running Gradle:

```bash
export JAVA_HOME=/opt/homebrew/opt/openjdk@21/libexec/openjdk.jdk/Contents/Home
```

## Run Locally Without Supabase

The `localdb` profile uses an H2 file database and Flyway migrations.

```bash
cd bukukasir-backend
export JAVA_HOME=/opt/homebrew/opt/openjdk@21/libexec/openjdk.jdk/Contents/Home
./gradlew :services:bukukasir-api:bootRun --args='--spring.profiles.active=localdb'
```

Local API:

- API base: `http://localhost:8095`
- H2 console: `http://localhost:8095/h2-console`
- JDBC URL: `jdbc:h2:file:./build/localdb/bukukasir;MODE=PostgreSQL;DATABASE_TO_LOWER=TRUE;DEFAULT_NULL_ORDERING=HIGH`
- Username: `sa`
- Password: blank

## Run With PostgreSQL / Supabase

```bash
export JAVA_HOME=/opt/homebrew/opt/openjdk@21/libexec/openjdk.jdk/Contents/Home
export SUPABASE_DB_URL='jdbc:postgresql://HOST:PORT/postgres?prepareThreshold=0'
export SUPABASE_DB_USER='postgres.xxx'
export SUPABASE_DB_PASSWORD='...'
./gradlew :services:bukukasir-api:bootRun
```

Flyway is enabled with `baseline-on-migrate=true` so existing databases can adopt versioned migrations.

## Test And Build

```bash
export JAVA_HOME=/opt/homebrew/opt/openjdk@21/libexec/openjdk.jdk/Contents/Home
./gradlew :services:bukukasir-api:test :services:bukukasir-api:bootJar
```

The focused enterprise POS tests verify:

- Flyway creates the F&B foundation tables.
- Constraints reject invalid modifier/payment data.
- Backoffice can configure a channel, price book, inventory ingredient, and marketplace order webhook.
- Modifier groups/options can enforce required selections.
- Pricing quotes calculate modifier deltas, channel price overrides, and totals.

## Enterprise POS Foundation

Flyway migrations `V1` through `V5` add durable backend support for:

- Locations and menus
- Item variants
- Modifier groups/options and item modifier rules
- Combos and availability windows
- Tax categories and service charges
- Kitchen stations/routing, ticket items, and ticket events
- Order sessions, held orders, bill requests, waiter transfers
- Order item modifiers, discounts/adjustments, fees, split checks
- Payment allocations, refunds, digital receipts
- Cash drawers, day close/Z-report foundation
- Persistent audit logs, outbox events, sync queue, device state, recovery drafts
- Roles, permissions, and staff role mappings
- Constraints, foreign keys, and reporting indexes for the enterprise extension tables
- Inventory ingredients, recipes, stock locations, stock movements, counts, waste/adjustment support
- Sales channels, channel store mappings, webhook ingestion, catalog sync jobs, and marketplace orders
- Price books and channel/location/service/daypart price overrides for POS, takeaway, delivery, Grab, Gojek, or custom channels
- Reporting snapshots for channel sales and product mix

Useful endpoints:

- `GET /api/fnb/schema-health`
- `POST /api/menu/modifier-groups`
- `POST /api/menu/modifier-groups/{groupId}/options`
- `POST /api/menu/items/{itemId}/modifier-groups/{groupId}`
- `POST /api/menu/items/{itemId}/variants`
- `POST /api/pricing/quote`
- `POST /api/sync-queue`
- `POST /api/recovery-drafts`
- `POST /api/refunds`
- `GET/POST /api/channels`
- `GET/POST /api/channels/{channelId}/stores`
- `GET/POST /api/price-books`
- `POST /api/price-books/{priceBookId}/entries`
- `GET/POST /api/inventory/ingredients`
- `POST /api/inventory/locations`
- `POST /api/inventory/recipes`
- `POST /api/inventory/recipes/{recipeId}/items`
- `POST /api/inventory/stock-movements`
- `POST /api/menu/availability`
- `POST /api/channels/{channelId}/catalog-sync`
- `POST /api/channels/{channelId}/webhooks/orders`
- `POST /api/channels/{channelId}/orders/{orderId}/accept`
- `POST /api/channels/{channelId}/orders/{orderId}/reject`
- `POST /api/channels/{channelId}/orders/{orderId}/status`
- `GET /api/reports/channel-sales`

Pricing quote supports `channelId`, `locationId`, `serviceType`, and `orderTime`. Price book precedence is exact channel/location/daypart first, then channel/location, channel default, location POS, and finally the base item, variant, or modifier price.

Existing mobile and backoffice endpoints are additive-compatible with these backend changes.

Note: this pushed repo currently contains the backend services. The mobile and backoffice clients can consume the settings endpoints above, but their source folders are not present in this repository snapshot.
