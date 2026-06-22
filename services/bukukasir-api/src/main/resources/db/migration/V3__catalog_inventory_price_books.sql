CREATE TABLE IF NOT EXISTS categories (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(160) NOT NULL,
    description TEXT,
    business_id VARCHAR(64),
    sort_order INTEGER DEFAULT 0,
    active BOOLEAN DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS menu_items (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(160) NOT NULL,
    description TEXT,
    price DECIMAL(19, 2),
    category_id VARCHAR(64),
    business_id VARCHAR(64),
    image_url TEXT,
    is_available BOOLEAN DEFAULT TRUE
);

ALTER TABLE menu_items ADD COLUMN IF NOT EXISTS sku VARCHAR(120);
ALTER TABLE menu_items ADD COLUMN IF NOT EXISTS barcode VARCHAR(120);
ALTER TABLE menu_items ADD COLUMN IF NOT EXISTS cost DECIMAL(19, 2) DEFAULT 0;
ALTER TABLE menu_items ADD COLUMN IF NOT EXISTS archived BOOLEAN DEFAULT FALSE;
ALTER TABLE menu_items ADD COLUMN IF NOT EXISTS archive_reason TEXT;
ALTER TABLE menu_items ADD COLUMN IF NOT EXISTS tax_category_id VARCHAR(64);
ALTER TABLE menu_items ADD COLUMN IF NOT EXISTS kitchen_station_id VARCHAR(64);
ALTER TABLE menu_items ADD COLUMN IF NOT EXISTS prep_time_minutes INTEGER;
ALTER TABLE menu_items ADD COLUMN IF NOT EXISTS track_inventory BOOLEAN DEFAULT FALSE;
ALTER TABLE menu_items ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP;

ALTER TABLE menu_item_variants ADD COLUMN IF NOT EXISTS sku VARCHAR(120);
ALTER TABLE menu_item_variants ADD COLUMN IF NOT EXISTS barcode VARCHAR(120);
ALTER TABLE menu_item_variants ADD COLUMN IF NOT EXISTS cost DECIMAL(19, 2) DEFAULT 0;
ALTER TABLE menu_item_variants ADD COLUMN IF NOT EXISTS archived BOOLEAN DEFAULT FALSE;

ALTER TABLE modifier_options ADD COLUMN IF NOT EXISTS unavailable BOOLEAN DEFAULT FALSE;
ALTER TABLE modifier_options ADD COLUMN IF NOT EXISTS unavailable_reason TEXT;

CREATE TABLE IF NOT EXISTS price_books (
    id VARCHAR(64) PRIMARY KEY,
    business_id VARCHAR(64) NOT NULL,
    location_id VARCHAR(64),
    channel_id VARCHAR(64),
    name VARCHAR(160) NOT NULL,
    service_type VARCHAR(48),
    daypart_name VARCHAR(80),
    start_time VARCHAR(16),
    end_time VARCHAR(16),
    days_of_week VARCHAR(80),
    priority INTEGER NOT NULL DEFAULT 0,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);

CREATE TABLE IF NOT EXISTS price_book_entries (
    id VARCHAR(64) PRIMARY KEY,
    price_book_id VARCHAR(64) NOT NULL,
    business_id VARCHAR(64) NOT NULL,
    item_type VARCHAR(32) NOT NULL,
    item_id VARCHAR(64) NOT NULL,
    variant_id VARCHAR(64),
    modifier_option_id VARCHAR(64),
    price DECIMAL(19, 2) NOT NULL,
    compare_at_price DECIMAL(19, 2),
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    CONSTRAINT fk_price_book_entries_book FOREIGN KEY (price_book_id) REFERENCES price_books(id),
    CONSTRAINT chk_price_book_entries_type CHECK (item_type IN ('MENU_ITEM', 'VARIANT', 'MODIFIER')),
    CONSTRAINT chk_price_book_entries_price CHECK (price >= 0),
    CONSTRAINT uq_price_book_entry UNIQUE (price_book_id, item_type, item_id, variant_id, modifier_option_id)
);

CREATE TABLE IF NOT EXISTS item_channel_availability (
    id VARCHAR(64) PRIMARY KEY,
    business_id VARCHAR(64) NOT NULL,
    location_id VARCHAR(64),
    channel_id VARCHAR(64),
    menu_item_id VARCHAR(64),
    variant_id VARCHAR(64),
    modifier_option_id VARCHAR(64),
    available BOOLEAN NOT NULL DEFAULT TRUE,
    unavailable_reason TEXT,
    starts_at TIMESTAMP,
    ends_at TIMESTAMP,
    updated_by_staff_id VARCHAR(64),
    updated_at TIMESTAMP,
    CONSTRAINT uq_item_channel_availability UNIQUE (location_id, channel_id, menu_item_id, variant_id, modifier_option_id)
);

CREATE TABLE IF NOT EXISTS inventory_locations (
    id VARCHAR(64) PRIMARY KEY,
    business_id VARCHAR(64) NOT NULL,
    location_id VARCHAR(64),
    name VARCHAR(160) NOT NULL,
    location_type VARCHAR(48) NOT NULL DEFAULT 'STORAGE',
    active BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS ingredients (
    id VARCHAR(64) PRIMARY KEY,
    business_id VARCHAR(64) NOT NULL,
    name VARCHAR(160) NOT NULL,
    sku VARCHAR(120),
    unit VARCHAR(32) NOT NULL,
    cost_per_unit DECIMAL(19, 4) NOT NULL DEFAULT 0,
    par_level DECIMAL(19, 4),
    reorder_level DECIMAL(19, 4),
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    CONSTRAINT chk_ingredients_cost CHECK (cost_per_unit >= 0)
);

CREATE TABLE IF NOT EXISTS recipes (
    id VARCHAR(64) PRIMARY KEY,
    business_id VARCHAR(64) NOT NULL,
    menu_item_id VARCHAR(64) NOT NULL,
    variant_id VARCHAR(64),
    name VARCHAR(160) NOT NULL,
    yield_quantity DECIMAL(19, 4) NOT NULL DEFAULT 1,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    CONSTRAINT chk_recipes_yield CHECK (yield_quantity > 0)
);

CREATE TABLE IF NOT EXISTS recipe_items (
    id VARCHAR(64) PRIMARY KEY,
    recipe_id VARCHAR(64) NOT NULL,
    ingredient_id VARCHAR(64) NOT NULL,
    quantity DECIMAL(19, 4) NOT NULL,
    waste_percent DECIMAL(9, 4) NOT NULL DEFAULT 0,
    CONSTRAINT fk_recipe_items_recipe FOREIGN KEY (recipe_id) REFERENCES recipes(id),
    CONSTRAINT fk_recipe_items_ingredient FOREIGN KEY (ingredient_id) REFERENCES ingredients(id),
    CONSTRAINT chk_recipe_items_quantity CHECK (quantity > 0 AND waste_percent >= 0)
);

CREATE TABLE IF NOT EXISTS stock_movements (
    id VARCHAR(64) PRIMARY KEY,
    business_id VARCHAR(64) NOT NULL,
    inventory_location_id VARCHAR(64) NOT NULL,
    ingredient_id VARCHAR(64) NOT NULL,
    movement_type VARCHAR(48) NOT NULL,
    quantity DECIMAL(19, 4) NOT NULL,
    unit_cost DECIMAL(19, 4),
    reference_type VARCHAR(80),
    reference_id VARCHAR(64),
    reason TEXT,
    staff_id VARCHAR(64),
    created_at TIMESTAMP,
    CONSTRAINT fk_stock_movements_location FOREIGN KEY (inventory_location_id) REFERENCES inventory_locations(id),
    CONSTRAINT fk_stock_movements_ingredient FOREIGN KEY (ingredient_id) REFERENCES ingredients(id),
    CONSTRAINT chk_stock_movements_type CHECK (movement_type IN ('RECEIVE', 'SALE', 'VOID_REVERSAL', 'WASTE', 'COUNT_ADJUSTMENT', 'TRANSFER_IN', 'TRANSFER_OUT')),
    CONSTRAINT chk_stock_movements_quantity CHECK (quantity <> 0)
);

CREATE TABLE IF NOT EXISTS inventory_counts (
    id VARCHAR(64) PRIMARY KEY,
    business_id VARCHAR(64) NOT NULL,
    inventory_location_id VARCHAR(64) NOT NULL,
    status VARCHAR(32) NOT NULL DEFAULT 'DRAFT',
    counted_by_staff_id VARCHAR(64),
    started_at TIMESTAMP,
    completed_at TIMESTAMP,
    CONSTRAINT chk_inventory_counts_status CHECK (status IN ('DRAFT', 'COMPLETED', 'VOIDED'))
);

CREATE TABLE IF NOT EXISTS inventory_count_items (
    id VARCHAR(64) PRIMARY KEY,
    inventory_count_id VARCHAR(64) NOT NULL,
    ingredient_id VARCHAR(64) NOT NULL,
    expected_quantity DECIMAL(19, 4),
    counted_quantity DECIMAL(19, 4) NOT NULL,
    variance_quantity DECIMAL(19, 4),
    CONSTRAINT fk_inventory_count_items_count FOREIGN KEY (inventory_count_id) REFERENCES inventory_counts(id)
);

CREATE INDEX IF NOT EXISTS idx_menu_items_sku ON menu_items (business_id, sku);
CREATE INDEX IF NOT EXISTS idx_menu_items_barcode ON menu_items (business_id, barcode);
CREATE INDEX IF NOT EXISTS idx_price_books_lookup ON price_books (business_id, channel_id, location_id, service_type, active, priority);
CREATE INDEX IF NOT EXISTS idx_price_book_entries_lookup ON price_book_entries (business_id, item_type, item_id, active);
CREATE INDEX IF NOT EXISTS idx_item_channel_availability_lookup ON item_channel_availability (business_id, channel_id, location_id, available);
CREATE INDEX IF NOT EXISTS idx_stock_movements_lookup ON stock_movements (business_id, ingredient_id, created_at);
