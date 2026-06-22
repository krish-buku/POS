ALTER TABLE locations
    ADD CONSTRAINT fk_locations_business_soft CHECK (business_id <> '');

ALTER TABLE menus
    ADD CONSTRAINT fk_menus_location FOREIGN KEY (location_id) REFERENCES locations(id);

ALTER TABLE menu_sections
    ADD CONSTRAINT fk_menu_sections_menu FOREIGN KEY (menu_id) REFERENCES menus(id);

ALTER TABLE menu_item_variants
    ADD CONSTRAINT chk_menu_item_variants_price_delta CHECK (price_delta >= 0 OR absolute_price IS NOT NULL);

ALTER TABLE modifier_groups
    ADD CONSTRAINT chk_modifier_groups_bounds CHECK (min_select >= 0 AND max_select >= 0 AND (max_select = 0 OR min_select <= max_select));

ALTER TABLE modifier_options
    ADD CONSTRAINT fk_modifier_options_group FOREIGN KEY (modifier_group_id) REFERENCES modifier_groups(id);

ALTER TABLE modifier_options
    ADD CONSTRAINT chk_modifier_options_quantities CHECK (default_quantity >= 0 AND (max_quantity IS NULL OR max_quantity >= default_quantity));

ALTER TABLE menu_item_modifier_groups
    ADD CONSTRAINT fk_item_modifier_groups_group FOREIGN KEY (modifier_group_id) REFERENCES modifier_groups(id);

ALTER TABLE menu_item_modifier_groups
    ADD CONSTRAINT uq_item_modifier_group UNIQUE (menu_item_id, modifier_group_id);

ALTER TABLE combo_group_options
    ADD CONSTRAINT fk_combo_options_group FOREIGN KEY (combo_group_id) REFERENCES combo_groups(id);

ALTER TABLE tax_categories
    ADD CONSTRAINT chk_tax_categories_rate CHECK (rate >= 0 AND rate <= 1);

ALTER TABLE service_charges
    ADD CONSTRAINT chk_service_charges_type CHECK (charge_type IN ('PERCENTAGE', 'FIXED'));

ALTER TABLE service_charges
    ADD CONSTRAINT chk_service_charges_value CHECK (charge_value >= 0);

ALTER TABLE kitchen_routing_rules
    ADD CONSTRAINT fk_kitchen_routing_station FOREIGN KEY (station_id) REFERENCES kitchen_stations(id);

ALTER TABLE order_sessions
    ADD CONSTRAINT chk_order_sessions_status CHECK (status IN ('OPEN', 'HELD', 'CLOSED', 'VOIDED'));

ALTER TABLE order_sessions
    ADD CONSTRAINT chk_order_sessions_money CHECK (guest_count >= 0 AND total >= 0);

ALTER TABLE bill_requests
    ADD CONSTRAINT chk_bill_requests_status CHECK (status IN ('PENDING', 'ACKNOWLEDGED', 'RESOLVED', 'CANCELLED'));

ALTER TABLE waiter_transfers
    ADD CONSTRAINT chk_waiter_transfers_status CHECK (status IN ('PENDING', 'ACCEPTED', 'REJECTED', 'CANCELLED'));

ALTER TABLE order_item_modifiers
    ADD CONSTRAINT chk_order_item_modifiers_qty CHECK (quantity > 0);

ALTER TABLE order_adjustments
    ADD CONSTRAINT chk_order_adjustments_type CHECK (adjustment_type IN ('DISCOUNT', 'COMP', 'SURCHARGE', 'VOID'));

ALTER TABLE order_adjustments
    ADD CONSTRAINT chk_order_adjustments_amount_type CHECK (amount_type IN ('FIXED', 'PERCENTAGE'));

ALTER TABLE order_fees
    ADD CONSTRAINT chk_order_fees_amount CHECK (amount >= 0);

ALTER TABLE check_splits
    ADD CONSTRAINT chk_check_splits_status CHECK (status IN ('OPEN', 'PARTIALLY_PAID', 'PAID', 'VOIDED'));

ALTER TABLE check_splits
    ADD CONSTRAINT chk_check_splits_totals CHECK (subtotal >= 0 AND tax >= 0 AND total >= 0);

ALTER TABLE check_split_items
    ADD CONSTRAINT fk_check_split_items_split FOREIGN KEY (check_split_id) REFERENCES check_splits(id);

ALTER TABLE check_split_items
    ADD CONSTRAINT chk_check_split_items_qty CHECK (quantity > 0);

ALTER TABLE payment_allocations
    ADD CONSTRAINT chk_payment_allocations_amount CHECK (amount >= 0);

ALTER TABLE refunds
    ADD CONSTRAINT chk_refunds_status CHECK (status IN ('PENDING', 'APPROVED', 'COMPLETED', 'REJECTED', 'VOIDED'));

ALTER TABLE refunds
    ADD CONSTRAINT chk_refunds_amount CHECK (amount >= 0);

ALTER TABLE digital_receipts
    ADD CONSTRAINT chk_digital_receipts_status CHECK (status IN ('PENDING', 'SENT', 'FAILED', 'CANCELLED'));

ALTER TABLE kitchen_ticket_items
    ADD CONSTRAINT chk_kitchen_ticket_items_status CHECK (status IN ('NEW', 'FIRED', 'PREPARING', 'READY', 'BUMPED', 'VOIDED'));

ALTER TABLE kitchen_ticket_items
    ADD CONSTRAINT chk_kitchen_ticket_items_qty CHECK (quantity > 0);

ALTER TABLE kitchen_ticket_events
    ADD CONSTRAINT chk_kitchen_ticket_events_type CHECK (event_type IN ('CREATED', 'FIRED', 'ADVANCED', 'MOVED_BACK', 'BUMPED', 'REPRINTED', 'VOIDED'));

ALTER TABLE day_closes
    ADD CONSTRAINT chk_day_closes_status CHECK (status IN ('OPEN', 'CLOSING', 'CLOSED', 'REOPENED'));

ALTER TABLE sync_queue
    ADD CONSTRAINT chk_sync_queue_status CHECK (status IN ('PENDING', 'PROCESSING', 'SYNCED', 'FAILED', 'CONFLICT', 'CANCELLED'));

ALTER TABLE recovery_drafts
    ADD CONSTRAINT chk_recovery_drafts_status CHECK (status IN ('OPEN', 'RECOVERED', 'DISCARDED'));

ALTER TABLE roles
    ADD CONSTRAINT uq_roles_business_code UNIQUE (business_id, code);

ALTER TABLE permissions
    ADD CONSTRAINT uq_permissions_code UNIQUE (code);

CREATE INDEX IF NOT EXISTS idx_menu_item_variants_item ON menu_item_variants (menu_item_id, active);
CREATE INDEX IF NOT EXISTS idx_tax_categories_business ON tax_categories (business_id, active);
CREATE INDEX IF NOT EXISTS idx_service_charges_business ON service_charges (business_id, active);
CREATE INDEX IF NOT EXISTS idx_check_splits_order ON check_splits (order_id, status);
CREATE INDEX IF NOT EXISTS idx_payment_allocations_order ON payment_allocations (order_id, check_split_id);
CREATE INDEX IF NOT EXISTS idx_refunds_business_order ON refunds (business_id, order_id, created_at);
CREATE INDEX IF NOT EXISTS idx_kitchen_ticket_items_ticket ON kitchen_ticket_items (kitchen_ticket_id, status);
