CREATE TABLE IF NOT EXISTS locations (
    id VARCHAR(64) PRIMARY KEY,
    business_id VARCHAR(64) NOT NULL,
    name VARCHAR(160) NOT NULL,
    code VARCHAR(64),
    address TEXT,
    phone VARCHAR(64),
    timezone VARCHAR(80),
    currency VARCHAR(16),
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);

CREATE TABLE IF NOT EXISTS menus (
    id VARCHAR(64) PRIMARY KEY,
    business_id VARCHAR(64) NOT NULL,
    location_id VARCHAR(64),
    name VARCHAR(160) NOT NULL,
    description TEXT,
    status VARCHAR(32) NOT NULL DEFAULT 'DRAFT',
    effective_from TIMESTAMP,
    effective_to TIMESTAMP,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);

CREATE TABLE IF NOT EXISTS menu_sections (
    id VARCHAR(64) PRIMARY KEY,
    menu_id VARCHAR(64) NOT NULL,
    category_id VARCHAR(64),
    name VARCHAR(160) NOT NULL,
    description TEXT,
    sort_order INTEGER NOT NULL DEFAULT 0,
    active BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS menu_item_variants (
    id VARCHAR(64) PRIMARY KEY,
    menu_item_id VARCHAR(64) NOT NULL,
    business_id VARCHAR(64) NOT NULL,
    name VARCHAR(160) NOT NULL,
    sku VARCHAR(120),
    price_delta DECIMAL(19, 2) NOT NULL DEFAULT 0,
    absolute_price DECIMAL(19, 2),
    default_variant BOOLEAN NOT NULL DEFAULT FALSE,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);

CREATE TABLE IF NOT EXISTS modifier_groups (
    id VARCHAR(64) PRIMARY KEY,
    business_id VARCHAR(64) NOT NULL,
    location_id VARCHAR(64),
    name VARCHAR(160) NOT NULL,
    description TEXT,
    required BOOLEAN NOT NULL DEFAULT FALSE,
    min_select INTEGER NOT NULL DEFAULT 0,
    max_select INTEGER NOT NULL DEFAULT 1,
    allow_quantity BOOLEAN NOT NULL DEFAULT FALSE,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);

CREATE TABLE IF NOT EXISTS modifier_options (
    id VARCHAR(64) PRIMARY KEY,
    modifier_group_id VARCHAR(64) NOT NULL,
    business_id VARCHAR(64) NOT NULL,
    name VARCHAR(160) NOT NULL,
    kitchen_name VARCHAR(160),
    sku VARCHAR(120),
    price_delta DECIMAL(19, 2) NOT NULL DEFAULT 0,
    cost_delta DECIMAL(19, 2),
    default_quantity INTEGER NOT NULL DEFAULT 0,
    max_quantity INTEGER,
    affects_inventory BOOLEAN NOT NULL DEFAULT FALSE,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);

CREATE TABLE IF NOT EXISTS menu_item_modifier_groups (
    id VARCHAR(64) PRIMARY KEY,
    menu_item_id VARCHAR(64) NOT NULL,
    modifier_group_id VARCHAR(64) NOT NULL,
    required_override BOOLEAN,
    min_select_override INTEGER,
    max_select_override INTEGER,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    sort_order INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS combo_groups (
    id VARCHAR(64) PRIMARY KEY,
    business_id VARCHAR(64) NOT NULL,
    menu_item_id VARCHAR(64) NOT NULL,
    name VARCHAR(160) NOT NULL,
    min_select INTEGER NOT NULL DEFAULT 1,
    max_select INTEGER NOT NULL DEFAULT 1,
    included_quantity INTEGER NOT NULL DEFAULT 1,
    sort_order INTEGER NOT NULL DEFAULT 0,
    active BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS combo_group_options (
    id VARCHAR(64) PRIMARY KEY,
    combo_group_id VARCHAR(64) NOT NULL,
    child_menu_item_id VARCHAR(64) NOT NULL,
    variant_id VARCHAR(64),
    price_delta DECIMAL(19, 2) NOT NULL DEFAULT 0,
    sort_order INTEGER NOT NULL DEFAULT 0,
    active BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS menu_availability_windows (
    id VARCHAR(64) PRIMARY KEY,
    business_id VARCHAR(64) NOT NULL,
    menu_id VARCHAR(64),
    menu_item_id VARCHAR(64),
    day_of_week INTEGER,
    start_time VARCHAR(16),
    end_time VARCHAR(16),
    active BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS tax_categories (
    id VARCHAR(64) PRIMARY KEY,
    business_id VARCHAR(64) NOT NULL,
    name VARCHAR(120) NOT NULL,
    rate DECIMAL(9, 6) NOT NULL DEFAULT 0,
    inclusive BOOLEAN NOT NULL DEFAULT FALSE,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    priority INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS service_charges (
    id VARCHAR(64) PRIMARY KEY,
    business_id VARCHAR(64) NOT NULL,
    name VARCHAR(120) NOT NULL,
    charge_type VARCHAR(32) NOT NULL DEFAULT 'PERCENTAGE',
    charge_value DECIMAL(19, 2) NOT NULL DEFAULT 0,
    taxable BOOLEAN NOT NULL DEFAULT TRUE,
    auto_apply BOOLEAN NOT NULL DEFAULT FALSE,
    active BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS kitchen_stations (
    id VARCHAR(64) PRIMARY KEY,
    business_id VARCHAR(64) NOT NULL,
    location_id VARCHAR(64),
    name VARCHAR(120) NOT NULL,
    printer_id VARCHAR(64),
    active BOOLEAN NOT NULL DEFAULT TRUE,
    sort_order INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS kitchen_routing_rules (
    id VARCHAR(64) PRIMARY KEY,
    business_id VARCHAR(64) NOT NULL,
    station_id VARCHAR(64) NOT NULL,
    category_id VARCHAR(64),
    menu_item_id VARCHAR(64),
    modifier_option_id VARCHAR(64),
    course_name VARCHAR(80),
    priority INTEGER NOT NULL DEFAULT 0,
    active BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS order_sessions (
    id VARCHAR(64) PRIMARY KEY,
    business_id VARCHAR(64) NOT NULL,
    location_id VARCHAR(64),
    table_id VARCHAR(64),
    table_name VARCHAR(80),
    customer_id VARCHAR(64),
    customer_name VARCHAR(160),
    guest_count INTEGER NOT NULL DEFAULT 0,
    staff_id VARCHAR(64),
    status VARCHAR(32) NOT NULL DEFAULT 'OPEN',
    total DECIMAL(19, 2) NOT NULL DEFAULT 0,
    opened_at TIMESTAMP,
    closed_at TIMESTAMP,
    metadata TEXT
);

CREATE TABLE IF NOT EXISTS held_orders (
    id VARCHAR(64) PRIMARY KEY,
    business_id VARCHAR(64) NOT NULL,
    order_id VARCHAR(64),
    session_id VARCHAR(64),
    staff_id VARCHAR(64),
    reason TEXT,
    status VARCHAR(32) NOT NULL DEFAULT 'HELD',
    held_at TIMESTAMP,
    resumed_at TIMESTAMP
);

CREATE TABLE IF NOT EXISTS bill_requests (
    id VARCHAR(64) PRIMARY KEY,
    business_id VARCHAR(64) NOT NULL,
    table_id VARCHAR(64) NOT NULL,
    order_id VARCHAR(64),
    staff_id VARCHAR(64),
    status VARCHAR(32) NOT NULL DEFAULT 'PENDING',
    requested_at TIMESTAMP,
    resolved_at TIMESTAMP,
    metadata TEXT
);

CREATE TABLE IF NOT EXISTS waiter_transfers (
    id VARCHAR(64) PRIMARY KEY,
    business_id VARCHAR(64) NOT NULL,
    table_id VARCHAR(64) NOT NULL,
    from_staff_id VARCHAR(64),
    to_staff_id VARCHAR(64),
    to_staff_name VARCHAR(160),
    status VARCHAR(32) NOT NULL DEFAULT 'PENDING',
    created_at TIMESTAMP,
    decided_at TIMESTAMP,
    metadata TEXT
);

CREATE TABLE IF NOT EXISTS order_item_modifiers (
    id VARCHAR(64) PRIMARY KEY,
    order_item_id VARCHAR(64) NOT NULL,
    order_id VARCHAR(64) NOT NULL,
    modifier_group_id VARCHAR(64),
    modifier_group_name VARCHAR(160),
    modifier_option_id VARCHAR(64),
    modifier_option_name VARCHAR(160) NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 1,
    price_delta_snapshot DECIMAL(19, 2) NOT NULL DEFAULT 0,
    total_delta DECIMAL(19, 2) NOT NULL DEFAULT 0,
    kitchen_name VARCHAR(160),
    created_at TIMESTAMP
);

CREATE TABLE IF NOT EXISTS order_adjustments (
    id VARCHAR(64) PRIMARY KEY,
    order_id VARCHAR(64) NOT NULL,
    order_item_id VARCHAR(64),
    adjustment_type VARCHAR(32) NOT NULL,
    name VARCHAR(120) NOT NULL,
    amount_type VARCHAR(32) NOT NULL DEFAULT 'FIXED',
    amount_value DECIMAL(19, 2) NOT NULL DEFAULT 0,
    applied_amount DECIMAL(19, 2) NOT NULL DEFAULT 0,
    staff_id VARCHAR(64),
    reason TEXT,
    created_at TIMESTAMP
);

CREATE TABLE IF NOT EXISTS order_fees (
    id VARCHAR(64) PRIMARY KEY,
    order_id VARCHAR(64) NOT NULL,
    service_charge_id VARCHAR(64),
    name VARCHAR(120) NOT NULL,
    amount DECIMAL(19, 2) NOT NULL DEFAULT 0,
    taxable BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP
);

CREATE TABLE IF NOT EXISTS check_splits (
    id VARCHAR(64) PRIMARY KEY,
    order_id VARCHAR(64) NOT NULL,
    split_number INTEGER NOT NULL DEFAULT 1,
    customer_id VARCHAR(64),
    status VARCHAR(32) NOT NULL DEFAULT 'OPEN',
    subtotal DECIMAL(19, 2) NOT NULL DEFAULT 0,
    tax DECIMAL(19, 2) NOT NULL DEFAULT 0,
    total DECIMAL(19, 2) NOT NULL DEFAULT 0,
    created_at TIMESTAMP,
    closed_at TIMESTAMP
);

CREATE TABLE IF NOT EXISTS check_split_items (
    id VARCHAR(64) PRIMARY KEY,
    check_split_id VARCHAR(64) NOT NULL,
    order_item_id VARCHAR(64) NOT NULL,
    quantity DECIMAL(10, 3) NOT NULL DEFAULT 1
);

CREATE TABLE IF NOT EXISTS payment_allocations (
    id VARCHAR(64) PRIMARY KEY,
    payment_id VARCHAR(64) NOT NULL,
    order_id VARCHAR(64) NOT NULL,
    check_split_id VARCHAR(64),
    order_item_id VARCHAR(64),
    amount DECIMAL(19, 2) NOT NULL DEFAULT 0,
    created_at TIMESTAMP
);

CREATE TABLE IF NOT EXISTS refunds (
    id VARCHAR(64) PRIMARY KEY,
    business_id VARCHAR(64) NOT NULL,
    payment_id VARCHAR(64),
    order_id VARCHAR(64),
    amount DECIMAL(19, 2) NOT NULL DEFAULT 0,
    reason TEXT,
    status VARCHAR(32) NOT NULL DEFAULT 'COMPLETED',
    staff_id VARCHAR(64),
    created_at TIMESTAMP
);

CREATE TABLE IF NOT EXISTS digital_receipts (
    id VARCHAR(64) PRIMARY KEY,
    business_id VARCHAR(64) NOT NULL,
    order_id VARCHAR(64),
    payment_id VARCHAR(64),
    recipient VARCHAR(180),
    channel VARCHAR(32),
    status VARCHAR(32) NOT NULL DEFAULT 'PENDING',
    sent_at TIMESTAMP,
    metadata TEXT
);

CREATE TABLE IF NOT EXISTS kitchen_ticket_items (
    id VARCHAR(64) PRIMARY KEY,
    kitchen_ticket_id VARCHAR(64) NOT NULL,
    order_item_id VARCHAR(64),
    menu_item_name VARCHAR(160) NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 1,
    course_name VARCHAR(80),
    production_notes TEXT,
    status VARCHAR(32) NOT NULL DEFAULT 'NEW',
    fired_at TIMESTAMP,
    bumped_at TIMESTAMP
);

CREATE TABLE IF NOT EXISTS kitchen_ticket_events (
    id VARCHAR(64) PRIMARY KEY,
    kitchen_ticket_id VARCHAR(64) NOT NULL,
    event_type VARCHAR(48) NOT NULL,
    from_status VARCHAR(32),
    to_status VARCHAR(32),
    staff_id VARCHAR(64),
    created_at TIMESTAMP,
    metadata TEXT
);

CREATE TABLE IF NOT EXISTS cash_drawers (
    id VARCHAR(64) PRIMARY KEY,
    business_id VARCHAR(64) NOT NULL,
    location_id VARCHAR(64),
    name VARCHAR(120) NOT NULL,
    active BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS day_closes (
    id VARCHAR(64) PRIMARY KEY,
    business_id VARCHAR(64) NOT NULL,
    location_id VARCHAR(64),
    business_date VARCHAR(16) NOT NULL,
    status VARCHAR(32) NOT NULL DEFAULT 'OPEN',
    gross_sales DECIMAL(19, 2) NOT NULL DEFAULT 0,
    net_sales DECIMAL(19, 2) NOT NULL DEFAULT 0,
    tax_total DECIMAL(19, 2) NOT NULL DEFAULT 0,
    payment_total DECIMAL(19, 2) NOT NULL DEFAULT 0,
    closed_by_staff_id VARCHAR(64),
    closed_at TIMESTAMP,
    metadata TEXT
);

CREATE TABLE IF NOT EXISTS audit_logs (
    id VARCHAR(64) PRIMARY KEY,
    business_id VARCHAR(64),
    actor_id VARCHAR(64),
    actor_name VARCHAR(160),
    action VARCHAR(48) NOT NULL,
    entity_type VARCHAR(120),
    entity_id VARCHAR(64),
    description TEXT,
    old_values TEXT,
    new_values TEXT,
    ip_address VARCHAR(80),
    created_at TIMESTAMP NOT NULL
);

CREATE TABLE IF NOT EXISTS outbox_events (
    id VARCHAR(64) PRIMARY KEY,
    business_id VARCHAR(64),
    aggregate_type VARCHAR(120) NOT NULL,
    aggregate_id VARCHAR(64) NOT NULL,
    event_type VARCHAR(120) NOT NULL,
    payload TEXT,
    status VARCHAR(32) NOT NULL DEFAULT 'PENDING',
    created_at TIMESTAMP,
    processed_at TIMESTAMP
);

CREATE TABLE IF NOT EXISTS sync_queue (
    id VARCHAR(64) PRIMARY KEY,
    business_id VARCHAR(64) NOT NULL,
    device_id VARCHAR(120),
    operation_type VARCHAR(80) NOT NULL,
    entity_type VARCHAR(120) NOT NULL,
    entity_id VARCHAR(64),
    payload TEXT,
    status VARCHAR(32) NOT NULL DEFAULT 'PENDING',
    retry_count INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP,
    processed_at TIMESTAMP,
    last_error TEXT
);

CREATE TABLE IF NOT EXISTS device_states (
    id VARCHAR(64) PRIMARY KEY,
    business_id VARCHAR(64) NOT NULL,
    device_id VARCHAR(120) NOT NULL,
    device_name VARCHAR(160),
    role VARCHAR(64),
    last_seen_at TIMESTAMP,
    sync_cursor VARCHAR(160),
    metadata TEXT
);

CREATE TABLE IF NOT EXISTS recovery_drafts (
    id VARCHAR(64) PRIMARY KEY,
    business_id VARCHAR(64) NOT NULL,
    device_id VARCHAR(120),
    staff_id VARCHAR(64),
    draft_type VARCHAR(80) NOT NULL,
    payload TEXT NOT NULL,
    status VARCHAR(32) NOT NULL DEFAULT 'OPEN',
    created_at TIMESTAMP,
    recovered_at TIMESTAMP
);

CREATE TABLE IF NOT EXISTS roles (
    id VARCHAR(64) PRIMARY KEY,
    business_id VARCHAR(64),
    name VARCHAR(120) NOT NULL,
    code VARCHAR(80) NOT NULL,
    active BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS permissions (
    id VARCHAR(64) PRIMARY KEY,
    code VARCHAR(120) NOT NULL,
    description TEXT
);

CREATE TABLE IF NOT EXISTS role_permissions (
    role_id VARCHAR(64) NOT NULL,
    permission_id VARCHAR(64) NOT NULL,
    PRIMARY KEY (role_id, permission_id)
);

CREATE TABLE IF NOT EXISTS staff_roles (
    staff_id VARCHAR(64) NOT NULL,
    role_id VARCHAR(64) NOT NULL,
    PRIMARY KEY (staff_id, role_id)
);

CREATE INDEX IF NOT EXISTS idx_modifier_groups_business ON modifier_groups (business_id);
CREATE INDEX IF NOT EXISTS idx_modifier_options_group ON modifier_options (modifier_group_id);
CREATE INDEX IF NOT EXISTS idx_item_modifier_groups_item ON menu_item_modifier_groups (menu_item_id);
CREATE INDEX IF NOT EXISTS idx_order_sessions_business_status ON order_sessions (business_id, status);
CREATE INDEX IF NOT EXISTS idx_bill_requests_business_status ON bill_requests (business_id, status);
CREATE INDEX IF NOT EXISTS idx_waiter_transfers_business_status ON waiter_transfers (business_id, status);
CREATE INDEX IF NOT EXISTS idx_order_item_modifiers_order ON order_item_modifiers (order_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_lookup ON audit_logs (business_id, entity_type, entity_id, created_at);
CREATE INDEX IF NOT EXISTS idx_sync_queue_status ON sync_queue (business_id, status, created_at);
