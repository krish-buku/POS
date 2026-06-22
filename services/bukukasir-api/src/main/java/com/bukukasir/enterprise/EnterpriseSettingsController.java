package com.bukukasir.enterprise;

import com.bukukasir.common.dto.ApiResponse;
import com.bukukasir.common.exception.ResourceNotFoundException;
import com.bukukasir.common.util.IdGenerator;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequiredArgsConstructor
@Tag(name = "Enterprise settings", description = "Backoffice configuration APIs for channels, price books, inventory, finance, and reports")
public class EnterpriseSettingsController {

    private final JdbcTemplate jdbc;

    @GetMapping("/api/channels")
    @Operation(summary = "List sales channels")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> listChannels(@RequestParam String businessId) {
        return ResponseEntity.ok(ApiResponse.success(jdbc.queryForList(
                "SELECT * FROM sales_channels WHERE business_id = ? ORDER BY channel_type, name", businessId)));
    }

    @PostMapping("/api/channels")
    @Operation(summary = "Create or enable a sales channel")
    public ResponseEntity<ApiResponse<Map<String, Object>>> createChannel(@Valid @RequestBody ChannelRequest request) {
        String id = IdGenerator.generateId();
        LocalDateTime now = LocalDateTime.now();
        jdbc.update("""
                INSERT INTO sales_channels
                (id, business_id, code, name, channel_type, enabled, auto_accept, default_price_book_id, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """, id, request.businessId(), request.code(), request.name(), request.channelType(),
                request.enabled(), request.autoAccept(), request.defaultPriceBookId(), now, now);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(findById("sales_channels", id), "Channel created"));
    }

    @GetMapping("/api/channels/{channelId}/stores")
    @Operation(summary = "List channel outlet/store mappings")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> listChannelStores(@PathVariable String channelId) {
        return ResponseEntity.ok(ApiResponse.success(jdbc.queryForList(
                "SELECT * FROM channel_stores WHERE channel_id = ? ORDER BY external_store_name", channelId)));
    }

    @PostMapping("/api/channels/{channelId}/stores")
    @Operation(summary = "Create channel outlet/store mapping")
    public ResponseEntity<ApiResponse<Map<String, Object>>> createChannelStore(
            @PathVariable String channelId,
            @Valid @RequestBody ChannelStoreRequest request) {
        String id = IdGenerator.generateId();
        jdbc.update("""
                INSERT INTO channel_stores
                (id, channel_id, business_id, location_id, external_store_id, external_store_name, status, webhook_url, metadata)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                """, id, channelId, request.businessId(), request.locationId(), request.externalStoreId(),
                request.externalStoreName(), request.statusOrDefault(), request.webhookUrl(), request.metadata());
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(findById("channel_stores", id), "Channel store created"));
    }

    @GetMapping("/api/price-books")
    @Operation(summary = "List price books")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> listPriceBooks(
            @RequestParam String businessId,
            @RequestParam(required = false) String channelId) {
        if (channelId == null || channelId.isBlank()) {
            return ResponseEntity.ok(ApiResponse.success(jdbc.queryForList(
                    "SELECT * FROM price_books WHERE business_id = ? ORDER BY priority DESC, name", businessId)));
        }
        return ResponseEntity.ok(ApiResponse.success(jdbc.queryForList(
                "SELECT * FROM price_books WHERE business_id = ? AND channel_id = ? ORDER BY priority DESC, name",
                businessId, channelId)));
    }

    @PostMapping("/api/price-books")
    @Operation(summary = "Create price book")
    public ResponseEntity<ApiResponse<Map<String, Object>>> createPriceBook(@Valid @RequestBody PriceBookRequest request) {
        String id = IdGenerator.generateId();
        LocalDateTime now = LocalDateTime.now();
        jdbc.update("""
                INSERT INTO price_books
                (id, business_id, location_id, channel_id, name, service_type, daypart_name, start_time, end_time,
                 days_of_week, priority, active, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """, id, request.businessId(), request.locationId(), request.channelId(), request.name(), request.serviceType(),
                request.daypartName(), request.startTime(), request.endTime(), request.daysOfWeek(), request.priority(),
                request.active(), now, now);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(findById("price_books", id), "Price book created"));
    }

    @PostMapping("/api/price-books/{priceBookId}/entries")
    @Operation(summary = "Create price override entry")
    public ResponseEntity<ApiResponse<Map<String, Object>>> createPriceBookEntry(
            @PathVariable String priceBookId,
            @Valid @RequestBody PriceBookEntryRequest request) {
        String id = IdGenerator.generateId();
        LocalDateTime now = LocalDateTime.now();
        jdbc.update("""
                INSERT INTO price_book_entries
                (id, price_book_id, business_id, item_type, item_id, variant_id, modifier_option_id, price, compare_at_price, active, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """, id, priceBookId, request.businessId(), request.itemType(), request.itemId(), request.variantId(),
                request.modifierOptionId(), request.price(), request.compareAtPrice(), request.active(), now, now);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(findById("price_book_entries", id), "Price override created"));
    }

    @GetMapping("/api/inventory/ingredients")
    @Operation(summary = "List ingredients")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> listIngredients(@RequestParam String businessId) {
        return ResponseEntity.ok(ApiResponse.success(jdbc.queryForList(
                "SELECT * FROM ingredients WHERE business_id = ? ORDER BY name", businessId)));
    }

    @PostMapping("/api/inventory/ingredients")
    @Operation(summary = "Create ingredient")
    public ResponseEntity<ApiResponse<Map<String, Object>>> createIngredient(@Valid @RequestBody IngredientRequest request) {
        String id = IdGenerator.generateId();
        LocalDateTime now = LocalDateTime.now();
        jdbc.update("""
                INSERT INTO ingredients
                (id, business_id, name, sku, unit, cost_per_unit, par_level, reorder_level, active, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """, id, request.businessId(), request.name(), request.sku(), request.unit(), request.costPerUnit(),
                request.parLevel(), request.reorderLevel(), request.active(), now, now);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(findById("ingredients", id), "Ingredient created"));
    }

    @PostMapping("/api/inventory/locations")
    @Operation(summary = "Create inventory location")
    public ResponseEntity<ApiResponse<Map<String, Object>>> createInventoryLocation(@Valid @RequestBody InventoryLocationRequest request) {
        String id = IdGenerator.generateId();
        jdbc.update("""
                INSERT INTO inventory_locations (id, business_id, location_id, name, location_type, active)
                VALUES (?, ?, ?, ?, ?, ?)
                """, id, request.businessId(), request.locationId(), request.name(), request.locationTypeOrDefault(), request.active());
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(findById("inventory_locations", id), "Inventory location created"));
    }

    @PostMapping("/api/inventory/recipes")
    @Operation(summary = "Create recipe")
    public ResponseEntity<ApiResponse<Map<String, Object>>> createRecipe(@Valid @RequestBody RecipeRequest request) {
        String id = IdGenerator.generateId();
        LocalDateTime now = LocalDateTime.now();
        jdbc.update("""
                INSERT INTO recipes (id, business_id, menu_item_id, variant_id, name, yield_quantity, active, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                """, id, request.businessId(), request.menuItemId(), request.variantId(), request.name(),
                request.yieldQuantity(), request.active(), now, now);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(findById("recipes", id), "Recipe created"));
    }

    @PostMapping("/api/inventory/recipes/{recipeId}/items")
    @Operation(summary = "Add ingredient to recipe")
    public ResponseEntity<ApiResponse<Map<String, Object>>> createRecipeItem(
            @PathVariable String recipeId,
            @Valid @RequestBody RecipeItemRequest request) {
        String id = IdGenerator.generateId();
        jdbc.update("""
                INSERT INTO recipe_items (id, recipe_id, ingredient_id, quantity, waste_percent)
                VALUES (?, ?, ?, ?, ?)
                """, id, recipeId, request.ingredientId(), request.quantity(), request.wastePercent());
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(findById("recipe_items", id), "Recipe item created"));
    }

    @PostMapping("/api/inventory/stock-movements")
    @Operation(summary = "Record stock movement")
    public ResponseEntity<ApiResponse<Map<String, Object>>> createStockMovement(@Valid @RequestBody StockMovementRequest request) {
        String id = IdGenerator.generateId();
        jdbc.update("""
                INSERT INTO stock_movements
                (id, business_id, inventory_location_id, ingredient_id, movement_type, quantity, unit_cost, reference_type, reference_id, reason, staff_id, created_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """, id, request.businessId(), request.inventoryLocationId(), request.ingredientId(), request.movementType(),
                request.quantity(), request.unitCost(), request.referenceType(), request.referenceId(), request.reason(),
                request.staffId(), LocalDateTime.now());
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(findById("stock_movements", id), "Stock movement recorded"));
    }

    @PostMapping("/api/menu/availability")
    @Operation(summary = "Set item, variant, or modifier availability by channel/location")
    public ResponseEntity<ApiResponse<Map<String, Object>>> setAvailability(@Valid @RequestBody AvailabilityRequest request) {
        String id = IdGenerator.generateId();
        jdbc.update("""
                INSERT INTO item_channel_availability
                (id, business_id, location_id, channel_id, menu_item_id, variant_id, modifier_option_id, available,
                 unavailable_reason, starts_at, ends_at, updated_by_staff_id, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """, id, request.businessId(), request.locationId(), request.channelId(), request.menuItemId(), request.variantId(),
                request.modifierOptionId(), request.available(), request.unavailableReason(), request.startsAt(), request.endsAt(),
                request.updatedByStaffId(), LocalDateTime.now());
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(findById("item_channel_availability", id), "Availability saved"));
    }

    @PostMapping("/api/channels/{channelId}/catalog-sync")
    @Operation(summary = "Queue catalog sync for a marketplace channel")
    public ResponseEntity<ApiResponse<Map<String, Object>>> queueCatalogSync(
            @PathVariable String channelId,
            @Valid @RequestBody CatalogSyncRequest request) {
        String id = IdGenerator.generateId();
        jdbc.update("""
                INSERT INTO catalog_sync_jobs
                (id, business_id, channel_id, channel_store_id, requested_by_staff_id, status, request_payload, created_at)
                VALUES (?, ?, ?, ?, ?, 'QUEUED', ?, ?)
                """, id, request.businessId(), channelId, request.channelStoreId(), request.requestedByStaffId(),
                request.requestPayload(), LocalDateTime.now());
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(findById("catalog_sync_jobs", id), "Catalog sync queued"));
    }

    @PostMapping("/api/channels/{channelId}/webhooks/orders")
    @Operation(summary = "Receive marketplace order webhook")
    public ResponseEntity<ApiResponse<Map<String, Object>>> ingestMarketplaceOrder(
            @PathVariable String channelId,
            @Valid @RequestBody MarketplaceOrderRequest request) {
        String webhookId = IdGenerator.generateId();
        jdbc.update("""
                INSERT INTO webhook_events
                (id, business_id, channel_id, channel_store_id, external_event_id, event_type, payload, status, received_at)
                VALUES (?, ?, ?, ?, ?, 'ORDER_CREATED', ?, 'RECEIVED', ?)
                """, webhookId, request.businessId(), channelId, request.channelStoreId(), request.externalEventId(),
                request.rawPayload(), LocalDateTime.now());

        String orderId = IdGenerator.generateId();
        jdbc.update("""
                INSERT INTO marketplace_orders
                (id, business_id, channel_id, channel_store_id, external_order_id, external_order_number, status, service_type,
                 customer_name, customer_phone, delivery_address, courier_name, courier_phone, pickup_time, delivery_time,
                 subtotal, discount_total, fee_total, tax_total, total, raw_payload, received_at, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, 'RECEIVED', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """, orderId, request.businessId(), channelId, request.channelStoreId(), request.externalOrderId(),
                request.externalOrderNumber(), request.serviceTypeOrDefault(), request.customerName(), request.customerPhone(),
                request.deliveryAddress(), request.courierName(), request.courierPhone(), request.pickupTime(), request.deliveryTime(),
                request.subtotal(), request.discountTotal(), request.feeTotal(), request.taxTotal(), request.total(),
                request.rawPayload(), LocalDateTime.now(), LocalDateTime.now());
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(findById("marketplace_orders", orderId), "Marketplace order received"));
    }

    @PostMapping("/api/channels/{channelId}/orders/{orderId}/accept")
    @Operation(summary = "Accept marketplace order")
    public ResponseEntity<ApiResponse<Map<String, Object>>> acceptMarketplaceOrder(@PathVariable String channelId, @PathVariable String orderId) {
        return updateMarketplaceStatus(orderId, "ACCEPTED", "Marketplace order accepted");
    }

    @PostMapping("/api/channels/{channelId}/orders/{orderId}/reject")
    @Operation(summary = "Reject marketplace order")
    public ResponseEntity<ApiResponse<Map<String, Object>>> rejectMarketplaceOrder(@PathVariable String channelId, @PathVariable String orderId) {
        return updateMarketplaceStatus(orderId, "REJECTED", "Marketplace order rejected");
    }

    @PostMapping("/api/channels/{channelId}/orders/{orderId}/status")
    @Operation(summary = "Update marketplace order status")
    public ResponseEntity<ApiResponse<Map<String, Object>>> updateMarketplaceOrderStatus(
            @PathVariable String channelId,
            @PathVariable String orderId,
            @RequestBody Map<String, String> body) {
        return updateMarketplaceStatus(orderId, body.getOrDefault("status", "PREPARING"), "Marketplace order status updated");
    }

    @GetMapping("/api/reports/channel-sales")
    @Operation(summary = "List channel sales summaries")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> channelSales(
            @RequestParam String businessId,
            @RequestParam(required = false) String businessDate) {
        if (businessDate == null || businessDate.isBlank()) {
            return ResponseEntity.ok(ApiResponse.success(jdbc.queryForList(
                    "SELECT * FROM sales_daily_summaries WHERE business_id = ? ORDER BY business_date DESC", businessId)));
        }
        return ResponseEntity.ok(ApiResponse.success(jdbc.queryForList(
                "SELECT * FROM sales_daily_summaries WHERE business_id = ? AND business_date = ? ORDER BY channel_id",
                businessId, businessDate)));
    }

    private ResponseEntity<ApiResponse<Map<String, Object>>> updateMarketplaceStatus(String orderId, String status, String message) {
        jdbc.update("UPDATE marketplace_orders SET status = ?, updated_at = ? WHERE id = ?", status, LocalDateTime.now(), orderId);
        return ResponseEntity.ok(ApiResponse.success(findById("marketplace_orders", orderId), message));
    }

    private Map<String, Object> findById(String table, String id) {
        List<Map<String, Object>> rows = jdbc.queryForList("SELECT * FROM " + table + " WHERE id = ?", id);
        if (rows.isEmpty()) {
            throw new ResourceNotFoundException(table, "id", id);
        }
        return rows.get(0);
    }

    public record ChannelRequest(@NotBlank String businessId, @NotBlank String code, @NotBlank String name,
                                 @NotBlank String channelType, boolean enabled, boolean autoAccept, String defaultPriceBookId) {}

    public record ChannelStoreRequest(@NotBlank String businessId, String locationId, String externalStoreId,
                                      String externalStoreName, String status, String webhookUrl, String metadata) {
        String statusOrDefault() { return status == null || status.isBlank() ? "ACTIVE" : status; }
    }

    public record PriceBookRequest(@NotBlank String businessId, String locationId, String channelId, @NotBlank String name,
                                   String serviceType, String daypartName, String startTime, String endTime,
                                   String daysOfWeek, int priority, boolean active) {}

    public record PriceBookEntryRequest(@NotBlank String businessId, @NotBlank String itemType, @NotBlank String itemId,
                                        String variantId, String modifierOptionId, @NotNull BigDecimal price,
                                        BigDecimal compareAtPrice, boolean active) {}

    public record IngredientRequest(@NotBlank String businessId, @NotBlank String name, String sku, @NotBlank String unit,
                                    @NotNull BigDecimal costPerUnit, BigDecimal parLevel, BigDecimal reorderLevel, boolean active) {}

    public record InventoryLocationRequest(@NotBlank String businessId, String locationId, @NotBlank String name,
                                           String locationType, boolean active) {
        String locationTypeOrDefault() { return locationType == null || locationType.isBlank() ? "STORAGE" : locationType; }
    }

    public record RecipeRequest(@NotBlank String businessId, @NotBlank String menuItemId, String variantId,
                                @NotBlank String name, @NotNull BigDecimal yieldQuantity, boolean active) {}

    public record RecipeItemRequest(@NotBlank String ingredientId, @NotNull BigDecimal quantity, BigDecimal wastePercent) {}

    public record StockMovementRequest(@NotBlank String businessId, @NotBlank String inventoryLocationId,
                                       @NotBlank String ingredientId, @NotBlank String movementType,
                                       @NotNull BigDecimal quantity, BigDecimal unitCost, String referenceType,
                                       String referenceId, String reason, String staffId) {}

    public record AvailabilityRequest(@NotBlank String businessId, String locationId, String channelId, String menuItemId,
                                      String variantId, String modifierOptionId, boolean available, String unavailableReason,
                                      LocalDateTime startsAt, LocalDateTime endsAt, String updatedByStaffId) {}

    public record CatalogSyncRequest(@NotBlank String businessId, String channelStoreId, String requestedByStaffId, String requestPayload) {}

    public record MarketplaceOrderRequest(@NotBlank String businessId, String channelStoreId, String externalEventId,
                                          @NotBlank String externalOrderId, String externalOrderNumber, String serviceType,
                                          String customerName, String customerPhone, String deliveryAddress,
                                          String courierName, String courierPhone, LocalDateTime pickupTime,
                                          LocalDateTime deliveryTime, BigDecimal subtotal, BigDecimal discountTotal,
                                          BigDecimal feeTotal, BigDecimal taxTotal, BigDecimal total, String rawPayload) {
        String serviceTypeOrDefault() { return serviceType == null || serviceType.isBlank() ? "DELIVERY" : serviceType; }
    }
}
