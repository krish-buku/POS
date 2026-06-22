CREATE TABLE IF NOT EXISTS sales_channels (
    id VARCHAR(64) PRIMARY KEY,
    business_id VARCHAR(64) NOT NULL,
    code VARCHAR(80) NOT NULL,
    name VARCHAR(160) NOT NULL,
    channel_type VARCHAR(48) NOT NULL,
    enabled BOOLEAN NOT NULL DEFAULT TRUE,
    auto_accept BOOLEAN NOT NULL DEFAULT FALSE,
    default_price_book_id VARCHAR(64),
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    CONSTRAINT chk_sales_channels_type CHECK (channel_type IN ('POS', 'DINE_IN', 'TAKEAWAY', 'DELIVERY', 'GRAB', 'GOJEK', 'CUSTOM')),
    CONSTRAINT uq_sales_channels_business_code UNIQUE (business_id, code)
);

CREATE TABLE IF NOT EXISTS channel_stores (
    id VARCHAR(64) PRIMARY KEY,
    channel_id VARCHAR(64) NOT NULL,
    business_id VARCHAR(64) NOT NULL,
    location_id VARCHAR(64),
    external_store_id VARCHAR(160),
    external_store_name VARCHAR(160),
    status VARCHAR(32) NOT NULL DEFAULT 'ACTIVE',
    webhook_url TEXT,
    last_catalog_sync_at TIMESTAMP,
    metadata TEXT,
    CONSTRAINT fk_channel_stores_channel FOREIGN KEY (channel_id) REFERENCES sales_channels(id),
    CONSTRAINT chk_channel_stores_status CHECK (status IN ('ACTIVE', 'PAUSED', 'DISCONNECTED')),
    CONSTRAINT uq_channel_store_external UNIQUE (channel_id, external_store_id)
);

CREATE TABLE IF NOT EXISTS channel_credentials_metadata (
    id VARCHAR(64) PRIMARY KEY,
    channel_id VARCHAR(64) NOT NULL,
    business_id VARCHAR(64) NOT NULL,
    credential_type VARCHAR(80) NOT NULL,
    display_name VARCHAR(160),
    secret_ref VARCHAR(240),
    expires_at TIMESTAMP,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP,
    CONSTRAINT fk_channel_credentials_channel FOREIGN KEY (channel_id) REFERENCES sales_channels(id)
);

CREATE TABLE IF NOT EXISTS channel_webhook_subscriptions (
    id VARCHAR(64) PRIMARY KEY,
    channel_id VARCHAR(64) NOT NULL,
    channel_store_id VARCHAR(64),
    event_type VARCHAR(120) NOT NULL,
    callback_url TEXT NOT NULL,
    status VARCHAR(32) NOT NULL DEFAULT 'ACTIVE',
    external_subscription_id VARCHAR(160),
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    CONSTRAINT fk_channel_webhooks_channel FOREIGN KEY (channel_id) REFERENCES sales_channels(id),
    CONSTRAINT chk_channel_webhooks_status CHECK (status IN ('ACTIVE', 'PAUSED', 'DELETED'))
);

CREATE TABLE IF NOT EXISTS webhook_events (
    id VARCHAR(64) PRIMARY KEY,
    business_id VARCHAR(64) NOT NULL,
    channel_id VARCHAR(64),
    channel_store_id VARCHAR(64),
    external_event_id VARCHAR(180),
    event_type VARCHAR(120) NOT NULL,
    payload TEXT NOT NULL,
    status VARCHAR(32) NOT NULL DEFAULT 'RECEIVED',
    received_at TIMESTAMP,
    processed_at TIMESTAMP,
    error_message TEXT,
    CONSTRAINT chk_webhook_events_status CHECK (status IN ('RECEIVED', 'PROCESSED', 'DUPLICATE', 'FAILED')),
    CONSTRAINT uq_webhook_events_external UNIQUE (channel_id, external_event_id)
);

CREATE TABLE IF NOT EXISTS marketplace_orders (
    id VARCHAR(64) PRIMARY KEY,
    business_id VARCHAR(64) NOT NULL,
    channel_id VARCHAR(64) NOT NULL,
    channel_store_id VARCHAR(64),
    order_id VARCHAR(64),
    external_order_id VARCHAR(180) NOT NULL,
    external_order_number VARCHAR(180),
    status VARCHAR(48) NOT NULL DEFAULT 'RECEIVED',
    service_type VARCHAR(48) NOT NULL DEFAULT 'DELIVERY',
    customer_name VARCHAR(180),
    customer_phone VARCHAR(80),
    delivery_address TEXT,
    courier_name VARCHAR(180),
    courier_phone VARCHAR(80),
    pickup_time TIMESTAMP,
    delivery_time TIMESTAMP,
    subtotal DECIMAL(19, 2) NOT NULL DEFAULT 0,
    discount_total DECIMAL(19, 2) NOT NULL DEFAULT 0,
    fee_total DECIMAL(19, 2) NOT NULL DEFAULT 0,
    tax_total DECIMAL(19, 2) NOT NULL DEFAULT 0,
    total DECIMAL(19, 2) NOT NULL DEFAULT 0,
    raw_payload TEXT,
    received_at TIMESTAMP,
    updated_at TIMESTAMP,
    CONSTRAINT fk_marketplace_orders_channel FOREIGN KEY (channel_id) REFERENCES sales_channels(id),
    CONSTRAINT chk_marketplace_orders_status CHECK (status IN ('RECEIVED', 'ACCEPTED', 'REJECTED', 'PREPARING', 'READY', 'PICKED_UP', 'COMPLETED', 'CANCELLED', 'FAILED')),
    CONSTRAINT uq_marketplace_orders_external UNIQUE (channel_id, external_order_id)
);

CREATE TABLE IF NOT EXISTS marketplace_order_items (
    id VARCHAR(64) PRIMARY KEY,
    marketplace_order_id VARCHAR(64) NOT NULL,
    menu_item_id VARCHAR(64),
    external_item_id VARCHAR(180),
    name VARCHAR(180) NOT NULL,
    quantity INTEGER NOT NULL,
    unit_price DECIMAL(19, 2) NOT NULL DEFAULT 0,
    modifier_total DECIMAL(19, 2) NOT NULL DEFAULT 0,
    total DECIMAL(19, 2) NOT NULL DEFAULT 0,
    modifiers_payload TEXT,
    notes TEXT,
    CONSTRAINT fk_marketplace_items_order FOREIGN KEY (marketplace_order_id) REFERENCES marketplace_orders(id),
    CONSTRAINT chk_marketplace_items_quantity CHECK (quantity > 0)
);

CREATE TABLE IF NOT EXISTS catalog_sync_jobs (
    id VARCHAR(64) PRIMARY KEY,
    business_id VARCHAR(64) NOT NULL,
    channel_id VARCHAR(64) NOT NULL,
    channel_store_id VARCHAR(64),
    requested_by_staff_id VARCHAR(64),
    status VARCHAR(32) NOT NULL DEFAULT 'QUEUED',
    request_payload TEXT,
    response_payload TEXT,
    error_message TEXT,
    created_at TIMESTAMP,
    completed_at TIMESTAMP,
    CONSTRAINT fk_catalog_sync_jobs_channel FOREIGN KEY (channel_id) REFERENCES sales_channels(id),
    CONSTRAINT chk_catalog_sync_jobs_status CHECK (status IN ('QUEUED', 'SENT', 'SUCCESS', 'FAILED'))
);

ALTER TABLE sync_queue ADD COLUMN IF NOT EXISTS client_timestamp TIMESTAMP;
ALTER TABLE sync_queue ADD COLUMN IF NOT EXISTS base_revision VARCHAR(160);
ALTER TABLE sync_queue ADD COLUMN IF NOT EXISTS server_revision VARCHAR(160);
ALTER TABLE sync_queue ADD COLUMN IF NOT EXISTS conflict_status VARCHAR(48);
ALTER TABLE sync_queue ADD COLUMN IF NOT EXISTS merge_strategy VARCHAR(80);
ALTER TABLE sync_queue ADD COLUMN IF NOT EXISTS resolved_by VARCHAR(64);
ALTER TABLE sync_queue ADD COLUMN IF NOT EXISTS resolved_at TIMESTAMP;

CREATE TABLE IF NOT EXISTS sales_daily_summaries (
    id VARCHAR(64) PRIMARY KEY,
    business_id VARCHAR(64) NOT NULL,
    location_id VARCHAR(64),
    channel_id VARCHAR(64),
    business_date VARCHAR(16) NOT NULL,
    gross_sales DECIMAL(19, 2) NOT NULL DEFAULT 0,
    discount_total DECIMAL(19, 2) NOT NULL DEFAULT 0,
    refund_total DECIMAL(19, 2) NOT NULL DEFAULT 0,
    tax_total DECIMAL(19, 2) NOT NULL DEFAULT 0,
    net_sales DECIMAL(19, 2) NOT NULL DEFAULT 0,
    order_count INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    CONSTRAINT uq_sales_daily_summary UNIQUE (business_id, location_id, channel_id, business_date)
);

CREATE TABLE IF NOT EXISTS product_mix_summaries (
    id VARCHAR(64) PRIMARY KEY,
    business_id VARCHAR(64) NOT NULL,
    location_id VARCHAR(64),
    channel_id VARCHAR(64),
    business_date VARCHAR(16) NOT NULL,
    menu_item_id VARCHAR(64),
    menu_item_name VARCHAR(180),
    quantity DECIMAL(19, 3) NOT NULL DEFAULT 0,
    gross_sales DECIMAL(19, 2) NOT NULL DEFAULT 0,
    modifier_sales DECIMAL(19, 2) NOT NULL DEFAULT 0,
    net_sales DECIMAL(19, 2) NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_sales_channels_lookup ON sales_channels (business_id, channel_type, enabled);
CREATE INDEX IF NOT EXISTS idx_channel_stores_lookup ON channel_stores (business_id, channel_id, status);
CREATE INDEX IF NOT EXISTS idx_webhook_events_lookup ON webhook_events (business_id, channel_id, status, received_at);
CREATE INDEX IF NOT EXISTS idx_marketplace_orders_lookup ON marketplace_orders (business_id, channel_id, status, received_at);
CREATE INDEX IF NOT EXISTS idx_catalog_sync_jobs_lookup ON catalog_sync_jobs (business_id, channel_id, status, created_at);
CREATE INDEX IF NOT EXISTS idx_sales_daily_lookup ON sales_daily_summaries (business_id, business_date, channel_id);
CREATE INDEX IF NOT EXISTS idx_product_mix_lookup ON product_mix_summaries (business_id, business_date, menu_item_id);
