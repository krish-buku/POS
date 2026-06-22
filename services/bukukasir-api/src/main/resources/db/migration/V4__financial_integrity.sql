CREATE TABLE IF NOT EXISTS orders (
    id VARCHAR(64) PRIMARY KEY,
    order_number VARCHAR(80),
    table_id VARCHAR(64),
    table_name VARCHAR(80),
    staff_id VARCHAR(64),
    staff_name VARCHAR(160),
    business_id VARCHAR(64),
    items TEXT,
    subtotal DECIMAL(19, 2),
    tax DECIMAL(19, 2),
    total DECIMAL(19, 2),
    tax_breakdown TEXT,
    status VARCHAR(32),
    notes TEXT,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);

CREATE TABLE IF NOT EXISTS order_items (
    id VARCHAR(64) PRIMARY KEY,
    order_id VARCHAR(64),
    menu_item_id VARCHAR(64),
    menu_item_name VARCHAR(160),
    quantity INTEGER,
    unit_price DECIMAL(19, 2),
    subtotal DECIMAL(19, 2),
    notes TEXT,
    modifiers TEXT,
    variant_name VARCHAR(160)
);

CREATE TABLE IF NOT EXISTS payments (
    id VARCHAR(64) PRIMARY KEY,
    order_id VARCHAR(64),
    order_number VARCHAR(80),
    amount DECIMAL(19, 2),
    amount_paid DECIMAL(19, 2),
    change_amount DECIMAL(19, 2),
    payment_method_id VARCHAR(64),
    payment_method_name VARCHAR(160),
    status VARCHAR(32),
    staff_id VARCHAR(64),
    business_id VARCHAR(64),
    splits TEXT,
    ledger_lines TEXT,
    created_at TIMESTAMP
);

ALTER TABLE orders ADD COLUMN IF NOT EXISTS location_id VARCHAR(64);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS channel_id VARCHAR(64);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS service_type VARCHAR(48);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS external_order_id VARCHAR(160);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS pricing_snapshot TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS source_metadata TEXT;

ALTER TABLE order_items ADD COLUMN IF NOT EXISTS variant_id VARCHAR(64);
ALTER TABLE order_items ADD COLUMN IF NOT EXISTS seat_number VARCHAR(32);
ALTER TABLE order_items ADD COLUMN IF NOT EXISTS course_name VARCHAR(80);
ALTER TABLE order_items ADD COLUMN IF NOT EXISTS fire_status VARCHAR(32);
ALTER TABLE order_items ADD COLUMN IF NOT EXISTS fulfillment_status VARCHAR(32);
ALTER TABLE order_items ADD COLUMN IF NOT EXISTS void_reason TEXT;
ALTER TABLE order_items ADD COLUMN IF NOT EXISTS price_snapshot TEXT;

ALTER TABLE payments ADD COLUMN IF NOT EXISTS location_id VARCHAR(64);
ALTER TABLE payments ADD COLUMN IF NOT EXISTS channel_id VARCHAR(64);
ALTER TABLE payments ADD COLUMN IF NOT EXISTS idempotency_key VARCHAR(160);
ALTER TABLE payments ADD COLUMN IF NOT EXISTS reference VARCHAR(180);
ALTER TABLE payments ADD COLUMN IF NOT EXISTS tip_amount DECIMAL(19, 2) DEFAULT 0;
ALTER TABLE payments ADD COLUMN IF NOT EXISTS cash_drawer_id VARCHAR(64);
ALTER TABLE payments ADD COLUMN IF NOT EXISTS settlement_batch_id VARCHAR(64);
ALTER TABLE payments ADD COLUMN IF NOT EXISTS settled_at TIMESTAMP;

CREATE TABLE IF NOT EXISTS refund_items (
    id VARCHAR(64) PRIMARY KEY,
    refund_id VARCHAR(64) NOT NULL,
    order_item_id VARCHAR(64),
    payment_allocation_id VARCHAR(64),
    item_name VARCHAR(160),
    quantity DECIMAL(10, 3) NOT NULL DEFAULT 1,
    subtotal_reversal DECIMAL(19, 2) NOT NULL DEFAULT 0,
    tax_reversal DECIMAL(19, 2) NOT NULL DEFAULT 0,
    fee_reversal DECIMAL(19, 2) NOT NULL DEFAULT 0,
    total_reversal DECIMAL(19, 2) NOT NULL DEFAULT 0,
    reason TEXT,
    CONSTRAINT fk_refund_items_refund FOREIGN KEY (refund_id) REFERENCES refunds(id),
    CONSTRAINT chk_refund_items_quantity CHECK (quantity > 0),
    CONSTRAINT chk_refund_items_amounts CHECK (subtotal_reversal >= 0 AND tax_reversal >= 0 AND fee_reversal >= 0 AND total_reversal >= 0)
);

CREATE TABLE IF NOT EXISTS payment_reversals (
    id VARCHAR(64) PRIMARY KEY,
    payment_id VARCHAR(64) NOT NULL,
    refund_id VARCHAR(64),
    reversal_type VARCHAR(48) NOT NULL,
    amount DECIMAL(19, 2) NOT NULL,
    status VARCHAR(32) NOT NULL DEFAULT 'PENDING',
    created_at TIMESTAMP,
    CONSTRAINT chk_payment_reversals_type CHECK (reversal_type IN ('REFUND', 'VOID', 'CHARGEBACK')),
    CONSTRAINT chk_payment_reversals_amount CHECK (amount >= 0)
);

CREATE TABLE IF NOT EXISTS settlement_batches (
    id VARCHAR(64) PRIMARY KEY,
    business_id VARCHAR(64) NOT NULL,
    location_id VARCHAR(64),
    payment_method_id VARCHAR(64),
    status VARCHAR(32) NOT NULL DEFAULT 'OPEN',
    gross_amount DECIMAL(19, 2) NOT NULL DEFAULT 0,
    refund_amount DECIMAL(19, 2) NOT NULL DEFAULT 0,
    net_amount DECIMAL(19, 2) NOT NULL DEFAULT 0,
    opened_at TIMESTAMP,
    closed_at TIMESTAMP,
    CONSTRAINT chk_settlement_batches_status CHECK (status IN ('OPEN', 'CLOSED', 'RECONCILED')),
    CONSTRAINT chk_settlement_batches_amounts CHECK (gross_amount >= 0 AND refund_amount >= 0)
);

ALTER TABLE check_splits ADD COLUMN IF NOT EXISTS discount_total DECIMAL(19, 2) DEFAULT 0;
ALTER TABLE check_splits ADD COLUMN IF NOT EXISTS fee_total DECIMAL(19, 2) DEFAULT 0;
ALTER TABLE check_splits ADD COLUMN IF NOT EXISTS paid_total DECIMAL(19, 2) DEFAULT 0;

CREATE TABLE IF NOT EXISTS split_item_movements (
    id VARCHAR(64) PRIMARY KEY,
    order_id VARCHAR(64) NOT NULL,
    order_item_id VARCHAR(64) NOT NULL,
    from_split_id VARCHAR(64),
    to_split_id VARCHAR(64),
    quantity DECIMAL(10, 3) NOT NULL,
    staff_id VARCHAR(64),
    reason TEXT,
    created_at TIMESTAMP,
    CONSTRAINT chk_split_item_movements_quantity CHECK (quantity > 0)
);

ALTER TABLE audit_logs ADD COLUMN IF NOT EXISTS actor_role VARCHAR(80);
ALTER TABLE audit_logs ADD COLUMN IF NOT EXISTS location_id VARCHAR(64);
ALTER TABLE audit_logs ADD COLUMN IF NOT EXISTS device_id VARCHAR(120);
ALTER TABLE audit_logs ADD COLUMN IF NOT EXISTS request_id VARCHAR(160);
ALTER TABLE audit_logs ADD COLUMN IF NOT EXISTS previous_hash VARCHAR(128);
ALTER TABLE audit_logs ADD COLUMN IF NOT EXISTS current_hash VARCHAR(128);

CREATE UNIQUE INDEX IF NOT EXISTS uq_payments_idempotency ON payments (business_id, idempotency_key);
CREATE UNIQUE INDEX IF NOT EXISTS uq_payments_reference ON payments (business_id, payment_method_id, reference);
CREATE INDEX IF NOT EXISTS idx_orders_channel ON orders (business_id, channel_id, external_order_id);
CREATE INDEX IF NOT EXISTS idx_payments_settlement ON payments (business_id, settlement_batch_id, status);
CREATE INDEX IF NOT EXISTS idx_refund_items_refund ON refund_items (refund_id);
CREATE INDEX IF NOT EXISTS idx_split_movements_order ON split_item_movements (order_id, created_at);
