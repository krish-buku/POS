# BUKU POS Database Schema

This schema is based on the current Spring/JPA backend entities in `services/bukukasir-api`.
Local development currently runs on an H2 file database, while production-compatible columns should be treated as PostgreSQL-friendly types.

## Enterprise F&B POS Foundation

The backend now uses Flyway migration `V1__enterprise_fnb_pos_foundation.sql` for the restaurant POS expansion layer. The migration is additive and preserves the current mobile/backoffice contracts while introducing durable tables for functionality that was previously mock, JSON-only, or in-memory.

Primary additions:

- `locations`, `menus`, `menu_sections`
- `menu_item_variants`, `modifier_groups`, `modifier_options`, `menu_item_modifier_groups`
- `combo_groups`, `combo_group_options`, `menu_availability_windows`
- `tax_categories`, `service_charges`
- `kitchen_stations`, `kitchen_routing_rules`, `kitchen_ticket_items`, `kitchen_ticket_events`
- `order_sessions`, `held_orders`, `bill_requests`, `waiter_transfers`
- `order_item_modifiers`, `order_adjustments`, `order_fees`, `check_splits`, `check_split_items`
- `payment_allocations`, `refunds`, `digital_receipts`
- `cash_drawers`, `day_closes`
- `audit_logs`, `outbox_events`, `sync_queue`, `device_states`, `recovery_drafts`
- `roles`, `permissions`, `role_permissions`, `staff_roles`

Backend API coverage added with the schema:

- Modifier group/option creation and item linking under `/api/menu/modifier-groups`.
- Item variant creation under `/api/menu/items/{itemId}/variants`.
- Modifier validation and order quote calculation under `/api/pricing/quote`.
- Persistent mobile open tabs, bill requests, waiter transfers, audit events, sync queue, and recovery drafts.
- Schema readiness probe under `/api/fnb/schema-health`.

Run migrations and tests with Java 21:

```bash
export JAVA_HOME=/opt/homebrew/opt/openjdk@21/libexec/openjdk.jdk/Contents/Home
./gradlew :services:bukukasir-api:test :services:bukukasir-api:bootJar
```

## Current Persisted Tables

### Business, Customer, Staff, Auth

`businesses`
- `id` text primary key
- `name` text not null
- `type` text
- `address` text
- `phone` text
- `owner_id` text
- `logo_url` text
- `currency` text
- `timezone` text
- `active` boolean
- `created_at` timestamp
- `updated_at` timestamp

`customers`
- `id` text primary key
- `business_id` text not null
- `phone` text
- `name` text
- `email` text
- `date_of_birth` date
- `gender` text
- `notes` text
- `total_orders` integer
- `total_spent` numeric
- `last_order_at` timestamp
- `sms_opt_in` boolean
- `email_opt_in` boolean
- `whatsapp_opt_in` boolean
- `created_at` timestamp
- `updated_at` timestamp

`staff`
- `id` text primary key
- `name` text not null
- `email` text
- `phone` text
- `role` text
- `business_id` text
- `pin` text
- `permissions` text/json
- `is_active` boolean
- `created_at` timestamp
- `updated_at` timestamp

`pins`
- `staff_id` text primary key
- `staff_name` text
- `hashed_pin` text
- `role` text
- `business_id` text
- `active` boolean

`sessions`
- `session_id` text primary key
- `staff_id` text
- `staff_name` text
- `role` text
- `business_id` text
- `created_at` timestamp
- `expires_at` timestamp
- `active` boolean

### Menu

`categories`
- `id` text primary key
- `name` text not null
- `description` text
- `business_id` text
- `sort_order` integer
- `active` boolean

`menu_items`
- `id` text primary key
- `name` text not null
- `description` text
- `price` numeric
- `category_id` text
- `business_id` text
- `image_url` text
- `is_available` boolean

### Floor, Area, Table

`floors`
- `id` text primary key
- `business_id` text not null
- `name` text not null
- `sort_order` integer

`areas`
- `id` text primary key
- `business_id` text not null
- `floor_id` text not null
- `name` text not null
- `sort_order` integer

`restaurant_tables`
- `id` text primary key
- `business_id` text
- `number` text
- `name` text not null
- `capacity` integer
- `status` text
- `area_id` text
- `floor_id` text
- `current_order_id` text
- `assigned_staff_id` text
- `running_total` numeric

### Orders, Items, Discounts, Tax

`orders`
- `id` text primary key
- `order_number` text
- `table_id` text
- `table_name` text
- `staff_id` text
- `staff_name` text
- `business_id` text
- `items` jsonb
- `subtotal` numeric
- `tax` numeric
- `total` numeric
- `tax_breakdown` jsonb
- `status` text
- `notes` text
- `created_at` timestamp
- `updated_at` timestamp

`order_items`
- `id` text primary key
- `order_id` text
- `menu_item_id` text
- `menu_item_name` text
- `quantity` integer
- `unit_price` numeric
- `subtotal` numeric
- `notes` text
- `modifiers` jsonb
- `variant_name` text

`promotions`
- `id` text primary key
- `business_id` text
- `name` text
- `description` text
- `type` text
- `discount_type` text
- `discount_value` numeric
- `max_discount` numeric
- `min_order_amount` numeric
- `applicable_categories` jsonb
- `applicable_items` jsonb
- `start_date` date
- `end_date` date
- `active_days` jsonb
- `start_time` time
- `end_time` time
- `stackable` boolean
- `priority` integer
- `active` boolean

`tax_configs`
- `id` text primary key
- `business_id` text
- `name` text
- `rate` numeric
- `inclusive` boolean
- `active` boolean
- `priority` integer

### Payment

`payments`
- `id` text primary key
- `order_id` text
- `order_number` text
- `amount` numeric
- `amount_paid` numeric
- `change_amount` numeric
- `payment_method_id` text
- `payment_method_name` text
- `status` text
- `staff_id` text
- `business_id` text
- `splits` jsonb
- `ledger_lines` jsonb
- `created_at` timestamp

`payment_methods`
- `id` text primary key
- `name` text
- `type` text
- `is_active` boolean
- `business_id` text

### Kitchen

`kitchen_tickets`
- `id` text primary key
- `ticket_number` text
- `order_id` text
- `order_number` text
- `table_name` text
- `status` text
- `items` jsonb
- `business_id` text
- `created_at` timestamp
- `updated_at` timestamp

### Printer And Receipt

`printers`
- `id` text primary key
- `business_id` text not null
- `name` text not null
- `type` text
- `connection_type` text
- `ip_address` text
- `port` integer
- `mac_address` text
- `paper_width` text
- `has_cutter` boolean
- `has_cash_drawer` boolean
- `is_default` boolean
- `is_active` boolean

`printer_assignments`
- `id` text primary key
- `printer_id` text not null
- `business_id` text not null
- `routing_type` text
- `routing_value` text
- `priority` integer
- `copies` integer default 1

`print_jobs`
- `id` text primary key
- `order_id` text not null
- `order_number` text
- `status` text
- `printer_name` text
- `copies` integer
- `business_id` text
- `created_at` timestamp
- `completed_at` timestamp

`receipt_templates`
- `id` text primary key
- `business_id` text not null
- `header_text` text
- `footer_text` text
- `show_logo` boolean
- `show_address` boolean
- `show_tax_details` boolean
- `paper_width` text

### Shifts And Cash

`shifts`
- `id` text primary key
- `business_id` text
- `staff_id` text
- `staff_name` text
- `opened_at` timestamp
- `closed_at` timestamp
- `opening_cash` numeric
- `closing_cash` numeric
- `expected_cash` numeric
- `variance` numeric
- `status` text
- `total_sales` numeric
- `total_orders` integer
- `cash_payments` numeric
- `qris_payments` numeric
- `edc_payments` numeric
- `other_payments` numeric
- `cash_movements` jsonb
- `notes` text

`cash_movements`
- `id` text primary key
- `shift_id` text
- `type` text
- `amount` numeric
- `reason` text
- `staff_id` text
- `created_at` timestamp

### Files, Images, Notifications

`file_metadata`
- `id` text primary key
- `file_name` text
- `original_name` text
- `content_type` text
- `file_size` bigint
- `file_type` text
- `url` text
- `business_id` text
- `entity_id` text
- `created_at` timestamp

`image_jobs`
- `id` text primary key
- `prompt` text
- `menu_item_id` text
- `menu_item_name` text
- `status` text
- `result_url` text
- `business_id` text
- `created_at` timestamp
- `completed_at` timestamp

`notifications`
- `id` text primary key
- `type` text not null
- `title` text
- `message` text
- `target_staff_id` text
- `business_id` text
- `is_read` boolean
- `created_at` timestamp

## Current Mobile Compatibility State

These updated mobile endpoints exist, but are not fully backed by dedicated database tables yet:

- `order_sessions` / open tabs are stored in an in-memory map in `MobilePosController`.
- `bill_requests` are stored in an in-memory map in `MobilePosController`.
- `waiter_transfers` are stored in an in-memory map in `MobilePosController`.
- mobile onboarding saves only an audit event response, not full persisted setup records.
- audit events use the current in-memory audit logger.

That is acceptable for simulator/demo behavior, but it is not enough for production or clean local DB testing.

## Recommended Additions For The Updated Mobile Redesign

`order_sessions`
- `id` text primary key
- `business_id` text not null
- `table_id` text
- `table_name` text
- `customer_id` text
- `customer_name` text
- `guest_count` integer default 1
- `opened_by_staff_id` text
- `opened_at` timestamp not null
- `closed_at` timestamp
- `status` text not null
- `total` numeric default 0
- `metadata` jsonb

`held_orders`
- `id` text primary key
- `business_id` text not null
- `order_id` text
- `session_id` text
- `cart_snapshot` jsonb not null
- `held_by_staff_id` text
- `reason` text
- `created_at` timestamp not null
- `resumed_at` timestamp
- `status` text not null

`bill_requests`
- `id` text primary key
- `business_id` text not null
- `table_id` text not null
- `order_id` text
- `session_id` text
- `requested_by_staff_id` text
- `status` text not null
- `created_at` timestamp not null
- `resolved_at` timestamp
- `resolved_by_staff_id` text

`waiter_transfers`
- `id` text primary key
- `business_id` text not null
- `table_id` text not null
- `from_staff_id` text
- `to_staff_id` text
- `to_staff_name` text
- `status` text not null
- `created_at` timestamp not null
- `decided_at` timestamp

`order_adjustments`
- `id` text primary key
- `business_id` text not null
- `order_id` text not null
- `order_item_id` text
- `type` text not null
- `label` text
- `amount` numeric not null
- `percent` numeric
- `reason` text
- `staff_id` text
- `created_at` timestamp not null

`order_fees`
- `id` text primary key
- `business_id` text not null
- `order_id` text not null
- `label` text not null
- `amount` numeric not null
- `taxable` boolean default false
- `created_at` timestamp not null

`payment_splits`
- `id` text primary key
- `business_id` text not null
- `payment_id` text
- `order_id` text not null
- `method_id` text
- `method_name` text
- `amount` numeric not null
- `reference` text
- `status` text not null
- `created_at` timestamp not null

`digital_receipts`
- `id` text primary key
- `business_id` text not null
- `order_id` text not null
- `payment_id` text
- `customer_id` text
- `channel` text
- `recipient` text
- `receipt_url` text
- `status` text not null
- `sent_at` timestamp
- `created_at` timestamp not null

`sync_queue`
- `id` text primary key
- `business_id` text not null
- `device_id` text
- `entity_type` text not null
- `entity_id` text
- `operation` text not null
- `payload` jsonb not null
- `status` text not null
- `attempts` integer default 0
- `last_error` text
- `created_at` timestamp not null
- `updated_at` timestamp

`recovery_drafts`
- `id` text primary key
- `business_id` text not null
- `device_id` text
- `staff_id` text
- `flow` text not null
- `payload` jsonb not null
- `status` text not null
- `created_at` timestamp not null
- `updated_at` timestamp

`audit_logs`
- `id` text primary key
- `business_id` text
- `actor_id` text
- `actor_name` text
- `action` text not null
- `entity_type` text
- `entity_id` text
- `description` text
- `old_values` jsonb
- `new_values` jsonb
- `created_at` timestamp not null

`business_onboarding`
- `id` text primary key
- `business_id` text not null
- `business_name` text not null
- `tax_enabled` boolean
- `service_fee_percent` integer
- `table_count` integer
- `menu_seed` jsonb
- `staff_invites` jsonb
- `status` text not null
- `created_at` timestamp not null
- `updated_at` timestamp

## Indexes To Add

- `customers (business_id, phone)`
- `customers (business_id, name)`
- `menu_items (business_id, category_id, is_available)`
- `restaurant_tables (business_id, floor_id, area_id, status)`
- `orders (business_id, status, created_at)`
- `orders (business_id, table_id, status)`
- `order_items (order_id)`
- `payments (business_id, order_id, created_at)`
- `kitchen_tickets (business_id, status, created_at)`
- `print_jobs (business_id, status, created_at)`
- `order_sessions (business_id, status, opened_at)`
- `bill_requests (business_id, status, created_at)`
- `waiter_transfers (business_id, status, created_at)`
- `sync_queue (business_id, device_id, status, created_at)`
- `audit_logs (business_id, entity_type, entity_id, created_at)`
