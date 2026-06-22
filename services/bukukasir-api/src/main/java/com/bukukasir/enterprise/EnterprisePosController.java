package com.bukukasir.enterprise;

import com.bukukasir.common.audit.AuditAction;
import com.bukukasir.common.audit.AuditLog;
import com.bukukasir.common.audit.AuditLogger;
import com.bukukasir.common.dto.ApiResponse;
import com.bukukasir.common.exception.BusinessException;
import com.bukukasir.common.exception.ResourceNotFoundException;
import com.bukukasir.common.util.IdGenerator;
import com.bukukasir.menu.domain.model.MenuItem;
import com.bukukasir.menu.domain.port.in.MenuUseCase;
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
import java.time.DayOfWeek;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.*;

@RestController
@RequiredArgsConstructor
@Tag(name = "Enterprise POS foundation", description = "Durable F&B POS catalog, pricing, and workflow foundations")
public class EnterprisePosController {

    private final JdbcTemplate jdbc;
    private final MenuUseCase menuUseCase;
    private final AuditLogger auditLogger;

    @GetMapping("/api/menu/modifier-groups")
    @Operation(summary = "List modifier groups")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> listModifierGroups(
            @RequestParam String businessId,
            @RequestParam(required = false) String itemId) {
        if (itemId != null && !itemId.isBlank()) {
            return ResponseEntity.ok(ApiResponse.success(jdbc.queryForList("""
                    SELECT mg.* FROM modifier_groups mg
                    JOIN menu_item_modifier_groups link ON link.modifier_group_id = mg.id
                    WHERE mg.business_id = ? AND link.menu_item_id = ? AND mg.active = TRUE AND link.active = TRUE
                    ORDER BY link.sort_order, mg.sort_order, mg.name
                    """, businessId, itemId)));
        }
        return ResponseEntity.ok(ApiResponse.success(jdbc.queryForList("""
                SELECT * FROM modifier_groups
                WHERE business_id = ? AND active = TRUE
                ORDER BY sort_order, name
                """, businessId)));
    }

    @PostMapping("/api/menu/modifier-groups")
    @Operation(summary = "Create a modifier group")
    public ResponseEntity<ApiResponse<Map<String, Object>>> createModifierGroup(
            @Valid @RequestBody ModifierGroupRequest request) {
        validateModifierBounds(request.minSelect(), request.maxSelect());
        String id = IdGenerator.generateId();
        LocalDateTime now = LocalDateTime.now();
        jdbc.update("""
                INSERT INTO modifier_groups
                (id, business_id, location_id, name, description, required, min_select, max_select, allow_quantity, active, sort_order, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """, id, request.businessId(), request.locationId(), request.name(), request.description(), request.required(),
                request.minSelect(), request.maxSelect(), request.allowQuantity(), request.active(), request.sortOrder(), now, now);
        audit(request.businessId(), AuditAction.CREATE, "ModifierGroup", id, Map.of("name", request.name()));
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(findById("modifier_groups", id), "Modifier group created"));
    }

    @PostMapping("/api/menu/modifier-groups/{groupId}/options")
    @Operation(summary = "Create a modifier option")
    public ResponseEntity<ApiResponse<Map<String, Object>>> createModifierOption(
            @PathVariable String groupId,
            @Valid @RequestBody ModifierOptionRequest request) {
        requireExists("modifier_groups", groupId, "ModifierGroup");
        String id = IdGenerator.generateId();
        LocalDateTime now = LocalDateTime.now();
        jdbc.update("""
                INSERT INTO modifier_options
                (id, modifier_group_id, business_id, name, kitchen_name, sku, price_delta, cost_delta, default_quantity, max_quantity,
                 affects_inventory, active, sort_order, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """, id, groupId, request.businessId(), request.name(), request.kitchenName(), request.sku(),
                nvl(request.priceDelta()), request.costDelta(), request.defaultQuantity(), request.maxQuantity(),
                request.affectsInventory(), request.active(), request.sortOrder(), now, now);
        audit(request.businessId(), AuditAction.CREATE, "ModifierOption", id, Map.of("groupId", groupId, "name", request.name()));
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(findById("modifier_options", id), "Modifier option created"));
    }

    @GetMapping("/api/menu/modifier-groups/{groupId}/options")
    @Operation(summary = "List modifier options for a group")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> listModifierOptions(@PathVariable String groupId) {
        return ResponseEntity.ok(ApiResponse.success(jdbc.queryForList("""
                SELECT * FROM modifier_options
                WHERE modifier_group_id = ? AND active = TRUE
                ORDER BY sort_order, name
                """, groupId)));
    }

    @PostMapping("/api/menu/items/{itemId}/modifier-groups/{groupId}")
    @Operation(summary = "Attach a modifier group to a menu item")
    public ResponseEntity<ApiResponse<Map<String, Object>>> attachModifierGroup(
            @PathVariable String itemId,
            @PathVariable String groupId,
            @RequestBody(required = false) ItemModifierRuleRequest request) {
        requireExists("modifier_groups", groupId, "ModifierGroup");
        String id = IdGenerator.generateId();
        ItemModifierRuleRequest body = request == null ? new ItemModifierRuleRequest(null, null, null, true, 0) : request;
        jdbc.update("""
                INSERT INTO menu_item_modifier_groups
                (id, menu_item_id, modifier_group_id, required_override, min_select_override, max_select_override, active, sort_order)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                """, id, itemId, groupId, body.requiredOverride(), body.minSelectOverride(), body.maxSelectOverride(),
                body.active(), body.sortOrder());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(findById("menu_item_modifier_groups", id), "Modifier group attached"));
    }

    @PostMapping("/api/menu/items/{itemId}/variants")
    @Operation(summary = "Create a menu item variant")
    public ResponseEntity<ApiResponse<Map<String, Object>>> createVariant(
            @PathVariable String itemId,
            @Valid @RequestBody VariantRequest request) {
        String id = IdGenerator.generateId();
        LocalDateTime now = LocalDateTime.now();
        jdbc.update("""
                INSERT INTO menu_item_variants
                (id, menu_item_id, business_id, name, sku, price_delta, absolute_price, default_variant, active, sort_order, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """, id, itemId, request.businessId(), request.name(), request.sku(), nvl(request.priceDelta()),
                request.absolutePrice(), request.defaultVariant(), request.active(), request.sortOrder(), now, now);
        audit(request.businessId(), AuditAction.CREATE, "MenuItemVariant", id, Map.of("itemId", itemId, "name", request.name()));
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(findById("menu_item_variants", id), "Variant created"));
    }

    @GetMapping("/api/menu/items/{itemId}/variants")
    @Operation(summary = "List variants for a menu item")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> listVariants(@PathVariable String itemId) {
        return ResponseEntity.ok(ApiResponse.success(jdbc.queryForList("""
                SELECT * FROM menu_item_variants
                WHERE menu_item_id = ? AND active = TRUE
                ORDER BY sort_order, name
                """, itemId)));
    }

    @PostMapping("/api/pricing/quote")
    @Operation(summary = "Validate modifiers and quote item/order totals")
    public ResponseEntity<ApiResponse<PricingQuoteResponse>> quote(@Valid @RequestBody PricingQuoteRequest request) {
        BigDecimal subtotal = BigDecimal.ZERO;
        List<PricingLineResponse> lines = new ArrayList<>();
        for (PricingLineRequest line : request.items()) {
            MenuItem item = menuUseCase.getMenuItemById(line.menuItemId());
            validateModifierSelection(item.getId(), line.modifiers());
            BigDecimal base = item.getPrice() != null ? item.getPrice() : BigDecimal.ZERO;
            BigDecimal pricedBase = resolvePrice(request, "MENU_ITEM", item.getId(), null, null, base);
            BigDecimal variantDelta = variantDelta(request, line.variantId(), pricedBase);
            BigDecimal modifierDelta = modifierDelta(request, line.modifiers());
            BigDecimal unit = pricedBase.add(variantDelta).add(modifierDelta);
            int quantity = Math.max(1, line.quantity());
            BigDecimal lineTotal = unit.multiply(BigDecimal.valueOf(quantity));
            subtotal = subtotal.add(lineTotal);
            lines.add(new PricingLineResponse(item.getId(), item.getName(), quantity, pricedBase, variantDelta, modifierDelta, unit, lineTotal));
        }
        BigDecimal discount = request.orderDiscount() == null ? BigDecimal.ZERO : request.orderDiscount();
        BigDecimal service = request.serviceCharge() == null ? BigDecimal.ZERO : request.serviceCharge();
        BigDecimal taxableBase = subtotal.subtract(discount).add(service).max(BigDecimal.ZERO);
        BigDecimal tax = taxTotal(request.businessId(), taxableBase);
        return ResponseEntity.ok(ApiResponse.success(new PricingQuoteResponse(
                request.businessId(), request.channelId(), request.locationId(), request.serviceType(),
                lines, subtotal, discount, service, tax, taxableBase.add(tax))));
    }

    @PostMapping("/api/refunds")
    @Operation(summary = "Record a manual refund")
    public ResponseEntity<ApiResponse<Map<String, Object>>> createRefund(@Valid @RequestBody RefundRequest request) {
        String id = IdGenerator.generateId();
        jdbc.update("""
                INSERT INTO refunds (id, business_id, payment_id, order_id, amount, reason, status, staff_id, created_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                """, id, request.businessId(), request.paymentId(), request.orderId(), request.amount(), request.reason(),
                request.status() == null ? "COMPLETED" : request.status(), request.staffId(), LocalDateTime.now());
        audit(request.businessId(), AuditAction.CREATE, "Refund", id, Map.of("amount", request.amount()));
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(findById("refunds", id), "Refund recorded"));
    }

    @GetMapping("/api/fnb/schema-health")
    @Operation(summary = "Verify enterprise F&B POS schema tables are present")
    public ResponseEntity<ApiResponse<Map<String, Object>>> schemaHealth() {
        List<String> required = List.of("modifier_groups", "modifier_options", "menu_item_variants", "order_sessions",
                "bill_requests", "waiter_transfers", "order_item_modifiers", "check_splits", "payment_allocations",
                "refunds", "audit_logs", "sync_queue", "recovery_drafts", "sales_channels", "channel_stores",
                "price_books", "price_book_entries", "ingredients", "recipes", "stock_movements",
                "marketplace_orders", "catalog_sync_jobs", "sales_daily_summaries");
        List<String> missing = required.stream().filter(table -> !tableExists(table)).toList();
        return ResponseEntity.ok(ApiResponse.success(Map.of(
                "status", missing.isEmpty() ? "READY" : "MISSING_TABLES",
                "missing", missing,
                "checkedTables", required.size())));
    }

    @PostMapping("/api/sync-queue")
    @Operation(summary = "Persist an offline sync operation")
    public ResponseEntity<ApiResponse<Map<String, Object>>> enqueueSyncOperation(@Valid @RequestBody SyncQueueRequest request) {
        String id = IdGenerator.generateId();
        jdbc.update("""
                INSERT INTO sync_queue
                (id, business_id, device_id, operation_type, entity_type, entity_id, payload, status, retry_count, created_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, 'PENDING', 0, ?)
                """, id, request.businessId(), request.deviceId(), request.operationType(), request.entityType(),
                request.entityId(), request.payload(), LocalDateTime.now());
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(findById("sync_queue", id), "Sync operation queued"));
    }

    @GetMapping("/api/sync-queue")
    @Operation(summary = "List pending sync operations")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> listSyncQueue(
            @RequestParam String businessId,
            @RequestParam(defaultValue = "PENDING") String status) {
        return ResponseEntity.ok(ApiResponse.success(jdbc.queryForList("""
                SELECT * FROM sync_queue
                WHERE business_id = ? AND (? = 'ALL' OR UPPER(status) = UPPER(?))
                ORDER BY created_at ASC
                """, businessId, status, status)));
    }

    @PostMapping("/api/recovery-drafts")
    @Operation(summary = "Persist a crash recovery draft")
    public ResponseEntity<ApiResponse<Map<String, Object>>> saveRecoveryDraft(@Valid @RequestBody RecoveryDraftRequest request) {
        String id = IdGenerator.generateId();
        jdbc.update("""
                INSERT INTO recovery_drafts
                (id, business_id, device_id, staff_id, draft_type, payload, status, created_at)
                VALUES (?, ?, ?, ?, ?, ?, 'OPEN', ?)
                """, id, request.businessId(), request.deviceId(), request.staffId(), request.draftType(),
                request.payload(), LocalDateTime.now());
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(findById("recovery_drafts", id), "Recovery draft saved"));
    }

    @PutMapping("/api/recovery-drafts/{id}/recover")
    @Operation(summary = "Mark a recovery draft recovered")
    public ResponseEntity<ApiResponse<Map<String, Object>>> recoverDraft(@PathVariable String id) {
        jdbc.update("UPDATE recovery_drafts SET status = 'RECOVERED', recovered_at = ? WHERE id = ?", LocalDateTime.now(), id);
        return ResponseEntity.ok(ApiResponse.success(findById("recovery_drafts", id), "Recovery draft marked recovered"));
    }

    private void validateModifierSelection(String itemId, List<PricingModifierRequest> selected) {
        List<Map<String, Object>> groups = jdbc.queryForList("""
                SELECT mg.id, mg.name, mg.required, mg.min_select, mg.max_select,
                       COALESCE(link.required_override, mg.required) AS effective_required,
                       COALESCE(link.min_select_override, mg.min_select) AS effective_min,
                       COALESCE(link.max_select_override, mg.max_select) AS effective_max
                FROM modifier_groups mg
                JOIN menu_item_modifier_groups link ON link.modifier_group_id = mg.id
                WHERE link.menu_item_id = ? AND mg.active = TRUE AND link.active = TRUE
                """, itemId);
        Map<String, Integer> selectedCounts = new HashMap<>();
        if (selected != null) {
            for (PricingModifierRequest modifier : selected) {
                Map<String, Object> option = optionById(modifier.optionId());
                String groupId = String.valueOf(value(option, "modifier_group_id"));
                selectedCounts.merge(groupId, Math.max(1, modifier.quantity()), Integer::sum);
            }
        }
        for (Map<String, Object> group : groups) {
            String id = String.valueOf(value(group, "id"));
            int count = selectedCounts.getOrDefault(id, 0);
            int min = number(value(group, "effective_min")).intValue();
            int max = number(value(group, "effective_max")).intValue();
            boolean required = Boolean.TRUE.equals(value(group, "effective_required")) || min > 0;
            if (required && count < Math.max(1, min)) {
                throw new BusinessException("REQUIRED_MODIFIER_MISSING", "Required modifier group missing: " + value(group, "name"));
            }
            if (max > 0 && count > max) {
                throw new BusinessException("TOO_MANY_MODIFIERS", "Too many modifiers selected for: " + value(group, "name"));
            }
        }
    }

    private BigDecimal variantDelta(PricingQuoteRequest request, String variantId, BigDecimal basePrice) {
        if (variantId == null || variantId.isBlank()) {
            return BigDecimal.ZERO;
        }
        Map<String, Object> row = findById("menu_item_variants", variantId);
        BigDecimal fallback;
        Object absolute = value(row, "absolute_price");
        if (absolute != null) {
            fallback = number(absolute).subtract(basePrice);
        } else {
            fallback = number(value(row, "price_delta"));
        }
        BigDecimal variantPrice = resolvePrice(request, "VARIANT", String.valueOf(value(row, "menu_item_id")), variantId, null, null);
        return variantPrice != null ? variantPrice.subtract(basePrice) : fallback;
    }

    private BigDecimal modifierDelta(PricingQuoteRequest request, List<PricingModifierRequest> modifiers) {
        if (modifiers == null || modifiers.isEmpty()) {
            return BigDecimal.ZERO;
        }
        BigDecimal total = BigDecimal.ZERO;
        for (PricingModifierRequest modifier : modifiers) {
            Map<String, Object> option = optionById(modifier.optionId());
            BigDecimal fallback = number(value(option, "price_delta"));
            BigDecimal channelPrice = resolvePrice(request, "MODIFIER", null, null, modifier.optionId(), null);
            BigDecimal delta = channelPrice != null ? channelPrice : fallback;
            total = total.add(delta.multiply(BigDecimal.valueOf(Math.max(1, modifier.quantity()))));
        }
        return total;
    }

    private BigDecimal resolvePrice(PricingQuoteRequest request, String itemType, String itemId, String variantId,
                                    String modifierOptionId, BigDecimal fallback) {
        List<Map<String, Object>> rows = jdbc.queryForList("""
                SELECT pbe.price, pb.channel_id, pb.location_id, pb.service_type, pb.start_time, pb.end_time, pb.days_of_week, pb.priority
                FROM price_book_entries pbe
                JOIN price_books pb ON pb.id = pbe.price_book_id
                WHERE pbe.business_id = ?
                  AND pbe.item_type = ?
                  AND pbe.active = TRUE
                  AND pb.active = TRUE
                  AND (? IS NULL OR pbe.item_id = ?)
                  AND (? IS NULL OR pbe.variant_id = ?)
                  AND (? IS NULL OR pbe.modifier_option_id = ?)
                  AND (? IS NULL OR pb.channel_id = ? OR pb.channel_id IS NULL)
                  AND (? IS NULL OR pb.location_id = ? OR pb.location_id IS NULL)
                  AND (? IS NULL OR pb.service_type = ? OR pb.service_type IS NULL)
                """, request.businessId(), itemType,
                itemId, itemId,
                variantId, variantId,
                modifierOptionId, modifierOptionId,
                request.channelId(), request.channelId(),
                request.locationId(), request.locationId(),
                request.serviceType(), request.serviceType());
        Optional<Map<String, Object>> best = rows.stream()
                .filter(row -> daypartMatches(row, request.orderTime()))
                .min(Comparator
                        .comparingInt((Map<String, Object> row) -> specificity(row, request))
                        .thenComparing((Map<String, Object> row) -> number(value(row, "priority")), Comparator.reverseOrder()));
        if (best.isEmpty()) {
            return fallback;
        }
        return number(value(best.get(), "price"));
    }

    private int specificity(Map<String, Object> row, PricingQuoteRequest request) {
        int score = 0;
        if (request.channelId() != null && Objects.equals(value(row, "channel_id"), request.channelId())) {
            score -= 4;
        }
        if (request.locationId() != null && Objects.equals(value(row, "location_id"), request.locationId())) {
            score -= 2;
        }
        if (request.serviceType() != null && Objects.equals(value(row, "service_type"), request.serviceType())) {
            score -= 1;
        }
        if (value(row, "start_time") != null || value(row, "end_time") != null || value(row, "days_of_week") != null) {
            score -= 8;
        }
        return score;
    }

    private boolean daypartMatches(Map<String, Object> row, String orderTime) {
        Object start = value(row, "start_time");
        Object end = value(row, "end_time");
        Object days = value(row, "days_of_week");
        if (start == null && end == null && days == null) {
            return true;
        }
        LocalDateTime timestamp = parseOrderTime(orderTime);
        if (days != null && !String.valueOf(days).isBlank()) {
            String dayName = timestamp.getDayOfWeek().name();
            String shortName = shortDay(timestamp.getDayOfWeek());
            String configured = String.valueOf(days).toUpperCase(Locale.ROOT);
            if (!configured.contains(dayName) && !configured.contains(shortName)) {
                return false;
            }
        }
        if (start == null || end == null || String.valueOf(start).isBlank() || String.valueOf(end).isBlank()) {
            return true;
        }
        LocalTime current = timestamp.toLocalTime();
        LocalTime startTime = LocalTime.parse(String.valueOf(start));
        LocalTime endTime = LocalTime.parse(String.valueOf(end));
        if (endTime.isBefore(startTime)) {
            return !current.isBefore(startTime) || !current.isAfter(endTime);
        }
        return !current.isBefore(startTime) && !current.isAfter(endTime);
    }

    private LocalDateTime parseOrderTime(String orderTime) {
        if (orderTime == null || orderTime.isBlank()) {
            return LocalDateTime.now();
        }
        return LocalDateTime.parse(orderTime);
    }

    private String shortDay(DayOfWeek day) {
        return switch (day) {
            case MONDAY -> "MON";
            case TUESDAY -> "TUE";
            case WEDNESDAY -> "WED";
            case THURSDAY -> "THU";
            case FRIDAY -> "FRI";
            case SATURDAY -> "SAT";
            case SUNDAY -> "SUN";
        };
    }

    private BigDecimal taxTotal(String businessId, BigDecimal taxableBase) {
        List<Map<String, Object>> taxes = jdbc.queryForList("""
                SELECT rate FROM tax_categories WHERE business_id = ? AND active = TRUE ORDER BY priority, name
                """, businessId);
        if (taxes.isEmpty()) {
            return BigDecimal.ZERO;
        }
        return taxes.stream()
                .map(row -> taxableBase.multiply(number(value(row, "rate"))))
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    private Map<String, Object> optionById(String optionId) {
        if (optionId == null || optionId.isBlank()) {
            throw new BusinessException("MODIFIER_OPTION_REQUIRED", "Modifier option ID is required");
        }
        return findById("modifier_options", optionId);
    }

    private Map<String, Object> findById(String table, String id) {
        List<Map<String, Object>> rows = jdbc.queryForList("SELECT * FROM " + table + " WHERE id = ?", id);
        if (rows.isEmpty()) {
            throw new ResourceNotFoundException(table, "id", id);
        }
        return rows.get(0);
    }

    private void requireExists(String table, String id, String resource) {
        if (jdbc.queryForObject("SELECT COUNT(*) FROM " + table + " WHERE id = ?", Integer.class, id) == 0) {
            throw new ResourceNotFoundException(resource, "id", id);
        }
    }

    private boolean tableExists(String tableName) {
        Integer count = jdbc.queryForObject("""
                SELECT COUNT(*) FROM INFORMATION_SCHEMA.TABLES WHERE LOWER(TABLE_NAME) = LOWER(?)
                """, Integer.class, tableName);
        return count != null && count > 0;
    }

    private void validateModifierBounds(int min, int max) {
        if (min < 0 || max < 0 || (max > 0 && min > max)) {
            throw new BusinessException("INVALID_MODIFIER_BOUNDS", "Modifier min/max selection bounds are invalid");
        }
    }

    private BigDecimal nvl(BigDecimal value) {
        return value == null ? BigDecimal.ZERO : value;
    }

    private BigDecimal number(Object value) {
        if (value == null) {
            return BigDecimal.ZERO;
        }
        if (value instanceof BigDecimal bd) {
            return bd;
        }
        if (value instanceof Number number) {
            return BigDecimal.valueOf(number.doubleValue());
        }
        return new BigDecimal(String.valueOf(value));
    }

    private Object value(Map<String, Object> row, String key) {
        if (row.containsKey(key)) {
            return row.get(key);
        }
        String upper = key.toUpperCase(Locale.ROOT);
        if (row.containsKey(upper)) {
            return row.get(upper);
        }
        String lower = key.toLowerCase(Locale.ROOT);
        return row.get(lower);
    }

    private void audit(String businessId, AuditAction action, String entityType, String entityId, Map<String, Object> values) {
        auditLogger.log(AuditLog.builder()
                .actorId("system")
                .actorName("Enterprise POS API")
                .businessId(businessId)
                .action(action)
                .entityType(entityType)
                .entityId(entityId)
                .newValues(values)
                .timestamp(LocalDateTime.now())
                .build());
    }

    public record ModifierGroupRequest(
            @NotBlank String businessId,
            String locationId,
            @NotBlank String name,
            String description,
            boolean required,
            int minSelect,
            int maxSelect,
            boolean allowQuantity,
            boolean active,
            int sortOrder
    ) {}

    public record ModifierOptionRequest(
            @NotBlank String businessId,
            @NotBlank String name,
            String kitchenName,
            String sku,
            BigDecimal priceDelta,
            BigDecimal costDelta,
            int defaultQuantity,
            Integer maxQuantity,
            boolean affectsInventory,
            boolean active,
            int sortOrder
    ) {}

    public record ItemModifierRuleRequest(
            Boolean requiredOverride,
            Integer minSelectOverride,
            Integer maxSelectOverride,
            boolean active,
            int sortOrder
    ) {}

    public record VariantRequest(
            @NotBlank String businessId,
            @NotBlank String name,
            String sku,
            BigDecimal priceDelta,
            BigDecimal absolutePrice,
            boolean defaultVariant,
            boolean active,
            int sortOrder
    ) {}

    public record PricingQuoteRequest(
            @NotBlank String businessId,
            String channelId,
            String locationId,
            String serviceType,
            String orderTime,
            @NotNull List<PricingLineRequest> items,
            BigDecimal orderDiscount,
            BigDecimal serviceCharge
    ) {}

    public record PricingLineRequest(
            @NotBlank String menuItemId,
            String variantId,
            int quantity,
            List<PricingModifierRequest> modifiers
    ) {}

    public record PricingModifierRequest(@NotBlank String optionId, int quantity) {}

    public record PricingLineResponse(
            String menuItemId,
            String menuItemName,
            int quantity,
            BigDecimal basePrice,
            BigDecimal variantDelta,
            BigDecimal modifierDelta,
            BigDecimal unitPrice,
            BigDecimal lineTotal
    ) {}

    public record PricingQuoteResponse(
            String businessId,
            String channelId,
            String locationId,
            String serviceType,
            List<PricingLineResponse> lines,
            BigDecimal subtotal,
            BigDecimal discount,
            BigDecimal serviceCharge,
            BigDecimal tax,
            BigDecimal total
    ) {}

    public record RefundRequest(
            @NotBlank String businessId,
            String paymentId,
            String orderId,
            @NotNull BigDecimal amount,
            String reason,
            String status,
            String staffId
    ) {}

    public record SyncQueueRequest(
            @NotBlank String businessId,
            String deviceId,
            @NotBlank String operationType,
            @NotBlank String entityType,
            String entityId,
            String payload
    ) {}

    public record RecoveryDraftRequest(
            @NotBlank String businessId,
            String deviceId,
            String staffId,
            @NotBlank String draftType,
            @NotBlank String payload
    ) {}
}
