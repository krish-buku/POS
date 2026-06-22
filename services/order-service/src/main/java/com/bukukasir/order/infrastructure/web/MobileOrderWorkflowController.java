package com.bukukasir.order.infrastructure.web;

import com.bukukasir.common.audit.AuditAction;
import com.bukukasir.common.audit.AuditLog;
import com.bukukasir.common.audit.AuditLogger;
import com.bukukasir.common.dto.ApiResponse;
import com.bukukasir.common.util.IdGenerator;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@RestController
@RequiredArgsConstructor
@Tag(name = "Mobile order workflows", description = "Open-tab, bill request, and recovery contracts for mobile POS")
public class MobileOrderWorkflowController {
    private final AuditLogger auditLogger;
    private final Map<String, OpenTabSessionResponse> orderSessions = new ConcurrentHashMap<>();
    private final Map<String, BillRequestResponse> billRequests = new ConcurrentHashMap<>();

    @GetMapping("/api/order-sessions")
    @Operation(summary = "List open order sessions")
    public ResponseEntity<ApiResponse<List<OpenTabSessionResponse>>> getOrderSessions(
            @RequestParam String businessId,
            @RequestParam(defaultValue = "OPEN") String status) {
        seedSessions(businessId);
        List<OpenTabSessionResponse> sessions = orderSessions.values().stream()
                .filter(session -> businessId.equals(session.businessId()))
                .filter(session -> "ALL".equalsIgnoreCase(status) || status.equalsIgnoreCase(session.status()))
                .sorted(Comparator.comparing(OpenTabSessionResponse::openedAt).reversed())
                .toList();
        return ResponseEntity.ok(ApiResponse.success(sessions));
    }

    @PostMapping("/api/order-sessions")
    @Operation(summary = "Create open-tab session")
    public ResponseEntity<ApiResponse<OpenTabSessionResponse>> createOrderSession(
            @Valid @RequestBody OpenTabSessionRequest request) {
        String id = IdGenerator.generateId();
        OpenTabSessionResponse response = new OpenTabSessionResponse(
                id,
                request.businessId(),
                request.tableId(),
                request.tableName(),
                request.customerName(),
                request.guestCount(),
                LocalTime.now().format(DateTimeFormatter.ofPattern("HH:mm")),
                BigDecimal.ZERO,
                "OPEN",
                request.staffId());
        orderSessions.put(id, response);
        audit(request.businessId(), request.staffId(), AuditAction.CREATE, "OrderSession", id,
                "Opened tab for " + request.tableName(), Map.of("customerName", request.customerName()));
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(response, "Order session opened"));
    }

    @PostMapping("/api/bill-requests")
    @Operation(summary = "Create waiter bill request")
    public ResponseEntity<ApiResponse<BillRequestResponse>> createBillRequest(
            @Valid @RequestBody BillRequest request) {
        String id = IdGenerator.generateId();
        BillRequestResponse response = new BillRequestResponse(id, request.businessId(), request.tableId(), request.staffId(), "PENDING", Instant.now());
        billRequests.put(id, response);
        audit(request.businessId(), request.staffId(), AuditAction.CREATE, "BillRequest", id,
                "Waiter requested bill for table " + request.tableId(), Map.of("tableId", request.tableId()));
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(response, "Bill request created"));
    }

    @PostMapping("/api/audit-events")
    @Operation(summary = "Record mobile audit/recovery event")
    public ResponseEntity<ApiResponse<AuditEventResponse>> recordAuditEvent(
            @Valid @RequestBody AuditEventRequest request) {
        String id = IdGenerator.generateId();
        audit(request.businessId(), "mobile", AuditAction.CREATE, request.type(), id,
                "Mobile audit event: " + request.type(), request.payload());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(new AuditEventResponse(id, request.businessId(), request.type(), Instant.now()), "Audit event recorded"));
    }

    private void seedSessions(String businessId) {
        if (orderSessions.values().stream().anyMatch(session -> businessId.equals(session.businessId()))) return;
        List<OpenTabSessionResponse> seeds = List.of(
                new OpenTabSessionResponse("tab-seed-001", businessId, "table-002", "T2", "Sarah Lim", 3, "10:24", new BigDecimal("78000"), "OPEN", "staff-002"),
                new OpenTabSessionResponse("tab-seed-002", businessId, "table-003", "T3", "Raka Pratama", 4, "10:41", new BigDecimal("126000"), "OPEN", "staff-002"));
        seeds.forEach(session -> orderSessions.put(session.id(), session));
    }

    private void audit(String businessId, String actorId, AuditAction action, String entityType, String entityId, String description, Map<String, Object> newValues) {
        auditLogger.log(AuditLog.builder()
                .actorId(actorId == null || actorId.isBlank() ? "mobile" : actorId)
                .actorName("Mobile POS")
                .businessId(businessId)
                .action(action)
                .entityType(entityType)
                .entityId(entityId)
                .description(description)
                .newValues(newValues == null ? new LinkedHashMap<>() : new LinkedHashMap<>(newValues))
                .timestamp(LocalDateTime.now())
                .build());
    }

    public record OpenTabSessionRequest(@NotBlank String businessId, @NotBlank String tableId, @NotBlank String tableName, @NotBlank String customerName, int guestCount, String staffId) {}
    public record OpenTabSessionResponse(String id, String businessId, String tableId, String tableName, String customerName, int guestCount, String openedAt, BigDecimal total, String status, String staffId) {}
    public record BillRequest(@NotBlank String businessId, @NotBlank String tableId, String staffId) {}
    public record BillRequestResponse(String id, String businessId, String tableId, String staffId, String status, Instant createdAt) {}
    public record AuditEventRequest(@NotBlank String businessId, @NotBlank String type, Map<String, Object> payload) {}
    public record AuditEventResponse(String id, String businessId, String type, Instant createdAt) {}
}
