package com.bukukasir.pos.infrastructure.web;

import com.bukukasir.common.audit.AuditAction;
import com.bukukasir.common.audit.AuditLog;
import com.bukukasir.common.audit.AuditLogger;
import com.bukukasir.common.dto.ApiResponse;
import com.bukukasir.common.util.IdGenerator;
import com.bukukasir.receipt.domain.model.PrintJob;
import com.bukukasir.receipt.domain.port.in.ReceiptUseCase;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequiredArgsConstructor
@Tag(name = "Mobile POS compatibility", description = "Contracts used by the redesigned mobile tablet flows")
public class MobilePosController {

    private final ReceiptUseCase receiptUseCase;
    private final AuditLogger auditLogger;
    private final JdbcTemplate jdbc;

    @GetMapping("/api/order-sessions")
    @Operation(summary = "List open order sessions for mobile open-tab flow")
    public ResponseEntity<ApiResponse<List<OpenTabSessionResponse>>> getOrderSessions(
            @RequestParam String businessId,
            @RequestParam(defaultValue = "OPEN") String status) {
        seedSessions(businessId);
        List<OpenTabSessionResponse> sessions = jdbc.query("""
                SELECT id, business_id, table_id, table_name, customer_name, guest_count, total, status, staff_id, opened_at
                FROM order_sessions
                WHERE business_id = ? AND (? = 'ALL' OR UPPER(status) = UPPER(?))
                ORDER BY opened_at DESC
                """, (rs, rowNum) -> new OpenTabSessionResponse(
                rs.getString("id"),
                rs.getString("business_id"),
                rs.getString("table_id"),
                rs.getString("table_name"),
                rs.getString("customer_name"),
                rs.getInt("guest_count"),
                formatTime(rs.getObject("opened_at", LocalDateTime.class)),
                rs.getBigDecimal("total"),
                rs.getString("status"),
                rs.getString("staff_id")), businessId, status, status);
        return ResponseEntity.ok(ApiResponse.success(sessions));
    }

    @PostMapping("/api/order-sessions")
    @Operation(summary = "Create an open-tab session")
    public ResponseEntity<ApiResponse<OpenTabSessionResponse>> createOrderSession(
            @Valid @RequestBody OpenTabSessionRequest request) {
        String id = IdGenerator.generateId();
        LocalDateTime now = LocalDateTime.now();
        jdbc.update("""
                INSERT INTO order_sessions
                (id, business_id, table_id, table_name, customer_name, guest_count, staff_id, status, total, opened_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, 'OPEN', ?, ?)
                """, id, request.businessId(), request.tableId(), request.tableName(), request.customerName(),
                request.guestCount(), request.staffId(), BigDecimal.ZERO, now);
        OpenTabSessionResponse response = new OpenTabSessionResponse(
                id,
                request.businessId(),
                request.tableId(),
                request.tableName(),
                request.customerName(),
                request.guestCount(),
                now.toLocalTime().format(DateTimeFormatter.ofPattern("HH:mm")),
                BigDecimal.ZERO,
                "OPEN",
                request.staffId());
        audit(request.businessId(), request.staffId(), AuditAction.CREATE, "OrderSession", id,
                "Opened tab for " + request.tableName(), Map.of("customerName", request.customerName()));
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(response, "Order session opened"));
    }

    @PostMapping("/api/bill-requests")
    @Operation(summary = "Create a waiter bill request")
    public ResponseEntity<ApiResponse<BillRequestResponse>> createBillRequest(
            @Valid @RequestBody BillRequest request) {
        String id = IdGenerator.generateId();
        Instant createdAt = Instant.now();
        jdbc.update("""
                INSERT INTO bill_requests (id, business_id, table_id, staff_id, status, requested_at)
                VALUES (?, ?, ?, ?, 'PENDING', ?)
                """, id, request.businessId(), request.tableId(), request.staffId(), LocalDateTime.now());
        BillRequestResponse response = new BillRequestResponse(
                id, request.businessId(), request.tableId(), request.staffId(), "PENDING", createdAt);
        audit(request.businessId(), request.staffId(), AuditAction.CREATE, "BillRequest", id,
                "Waiter requested bill for table " + request.tableId(), Map.of("tableId", request.tableId()));
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(response, "Bill request created"));
    }

    @PostMapping("/api/waiter-transfers")
    @Operation(summary = "Create waiter table handoff request")
    public ResponseEntity<ApiResponse<WaiterTransferResponse>> createWaiterTransfer(
            @Valid @RequestBody WaiterTransferRequest request) {
        String id = IdGenerator.generateId();
        Instant createdAt = Instant.now();
        jdbc.update("""
                INSERT INTO waiter_transfers (id, business_id, table_id, from_staff_id, to_staff_name, status, created_at)
                VALUES (?, ?, ?, ?, ?, 'PENDING', ?)
                """, id, request.businessId(), request.tableId(), request.fromStaffId(), request.toStaffName(), LocalDateTime.now());
        WaiterTransferResponse response = new WaiterTransferResponse(
                id,
                request.businessId(),
                request.tableId(),
                request.fromStaffId(),
                request.toStaffName(),
                "PENDING",
                createdAt,
                null);
        audit(request.businessId(), request.fromStaffId(), AuditAction.TRANSFER, "WaiterTransfer", id,
                "Waiter transfer requested for table " + request.tableId(), Map.of("toStaffName", request.toStaffName()));
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(response, "Transfer requested"));
    }

    @PutMapping("/api/waiter-transfers/{id}")
    @Operation(summary = "Accept or reject waiter table handoff")
    public ResponseEntity<ApiResponse<WaiterTransferResponse>> decideWaiterTransfer(
            @PathVariable String id,
            @RequestBody WaiterTransferDecision request) {
        WaiterTransferResponse existing = getWaiterTransfer(id);
        String status = request.accepted() ? "ACCEPTED" : "REJECTED";
        LocalDateTime decidedAt = LocalDateTime.now();
        jdbc.update("UPDATE waiter_transfers SET status = ?, decided_at = ? WHERE id = ?", status, decidedAt, id);
        WaiterTransferResponse response = new WaiterTransferResponse(
                existing.id(),
                existing.businessId(),
                existing.tableId(),
                existing.fromStaffId(),
                existing.toStaffName(),
                status,
                existing.createdAt(),
                decidedAt.atZone(java.time.ZoneId.systemDefault()).toInstant());
        audit(response.businessId(), existing.fromStaffId(), request.accepted() ? AuditAction.APPROVE : AuditAction.REJECT,
                "WaiterTransfer", id, "Waiter transfer " + status.toLowerCase(), Map.of("status", status));
        return ResponseEntity.ok(ApiResponse.success(response, "Transfer " + status.toLowerCase()));
    }

    @GetMapping("/api/print-jobs")
    @Operation(summary = "List print jobs for mobile printer fallback UI")
    public ResponseEntity<ApiResponse<List<PrintJob>>> getPrintJobs(
            @RequestParam(defaultValue = "biz-001") String businessId) {
        List<PrintJob> jobs = receiptUseCase.getPrintQueue().stream()
                .filter(job -> businessId.equals(job.getBusinessId()))
                .toList();
        return ResponseEntity.ok(ApiResponse.success(jobs));
    }

    @PostMapping("/api/print-jobs")
    @Operation(summary = "Create print job from mobile printer fallback UI")
    public ResponseEntity<ApiResponse<PrintJob>> createPrintJob(@Valid @RequestBody PrintJobRequest request) {
        String orderId = request.orderId() == null || request.orderId().isBlank()
                ? "mobile-local-" + Instant.now().toEpochMilli()
                : request.orderId();
        PrintJob job = receiptUseCase.printReceipt(orderId, request.type().toUpperCase() + "-" + orderId, request.businessId());
        audit(request.businessId(), null, AuditAction.PRINT, "PrintJob", job.getId(),
                "Created " + request.type() + " print job", Map.of("printerName", request.printerName() == null ? "" : request.printerName()));
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(job, "Print job created"));
    }

    @PostMapping("/api/businesses/onboarding")
    @Operation(summary = "Save mobile onboarding setup payload")
    public ResponseEntity<ApiResponse<OnboardingResponse>> saveOnboarding(
            @Valid @RequestBody OnboardingRequest request) {
        String businessId = request.businessId() == null || request.businessId().isBlank()
                ? IdGenerator.generateId()
                : request.businessId();
        OnboardingResponse response = new OnboardingResponse(
                businessId,
                request.businessName(),
                request.taxEnabled(),
                request.serviceFeePercent(),
                request.tableCount(),
                request.menuSeed(),
                request.staffInvites(),
                "SAVED",
                Instant.now());
        audit(businessId, null, AuditAction.CREATE, "BusinessOnboarding", businessId,
                "Saved mobile onboarding setup for " + request.businessName(), Map.of("tableCount", request.tableCount()));
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(response, "Onboarding setup saved"));
    }

    @PostMapping("/api/audit-events")
    @Operation(summary = "Record mobile audit/recovery event")
    public ResponseEntity<ApiResponse<AuditEventResponse>> recordAuditEvent(
            @Valid @RequestBody AuditEventRequest request) {
        String id = IdGenerator.generateId();
        audit(request.businessId(), null, AuditAction.CREATE, request.type(), id,
                "Mobile audit event: " + request.type(), request.payload());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(new AuditEventResponse(id, request.businessId(), request.type(), Instant.now()), "Audit event recorded"));
    }

    private void seedSessions(String businessId) {
        Integer count = jdbc.queryForObject("SELECT COUNT(*) FROM order_sessions WHERE business_id = ?", Integer.class, businessId);
        if (count != null && count > 0) {
            return;
        }
        LocalDateTime now = LocalDateTime.now();
        jdbc.update("""
                INSERT INTO order_sessions
                (id, business_id, table_id, table_name, customer_name, guest_count, staff_id, status, total, opened_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, 'OPEN', ?, ?)
                """, "tab-seed-001", businessId, "table-002", "T2", "Sarah Lim", 3, "staff-002", new BigDecimal("78000"), now.minusMinutes(37));
        jdbc.update("""
                INSERT INTO order_sessions
                (id, business_id, table_id, table_name, customer_name, guest_count, staff_id, status, total, opened_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, 'OPEN', ?, ?)
                """, "tab-seed-002", businessId, "table-003", "T3", "Raka Pratama", 4, "staff-002", new BigDecimal("126000"), now.minusMinutes(20));
    }

    private WaiterTransferResponse getWaiterTransfer(String id) {
        List<WaiterTransferResponse> matches = jdbc.query("""
                SELECT id, business_id, table_id, from_staff_id, to_staff_name, status, created_at, decided_at
                FROM waiter_transfers WHERE id = ?
                """, (rs, rowNum) -> new WaiterTransferResponse(
                rs.getString("id"),
                rs.getString("business_id"),
                rs.getString("table_id"),
                rs.getString("from_staff_id"),
                rs.getString("to_staff_name"),
                rs.getString("status"),
                toInstant(rs.getObject("created_at", LocalDateTime.class)),
                toInstant(rs.getObject("decided_at", LocalDateTime.class))), id);
        if (matches.isEmpty()) {
            return new WaiterTransferResponse(id, "biz-001", "table-unknown", null, null, "PENDING", Instant.now(), null);
        }
        return matches.get(0);
    }

    private String formatTime(LocalDateTime time) {
        return time == null ? "" : time.toLocalTime().format(DateTimeFormatter.ofPattern("HH:mm"));
    }

    private Instant toInstant(LocalDateTime time) {
        return time == null ? null : time.atZone(ZoneId.systemDefault()).toInstant();
    }

    private void audit(String businessId, String actorId, AuditAction action, String entityType, String entityId,
                       String description, Map<String, Object> newValues) {
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

    public record OpenTabSessionRequest(
            @NotBlank String businessId,
            @NotBlank String tableId,
            @NotBlank String tableName,
            @NotBlank String customerName,
            int guestCount,
            String staffId
    ) {}

    public record OpenTabSessionResponse(
            String id,
            String businessId,
            String tableId,
            String tableName,
            String customerName,
            int guestCount,
            String openedAt,
            BigDecimal total,
            String status,
            String staffId
    ) {}

    public record BillRequest(
            @NotBlank String businessId,
            @NotBlank String tableId,
            String staffId
    ) {}

    public record BillRequestResponse(
            String id,
            String businessId,
            String tableId,
            String staffId,
            String status,
            Instant createdAt
    ) {}

    public record WaiterTransferRequest(
            @NotBlank String businessId,
            @NotBlank String tableId,
            String fromStaffId,
            @NotBlank String toStaffName
    ) {}

    public record WaiterTransferDecision(boolean accepted) {}

    public record WaiterTransferResponse(
            String id,
            String businessId,
            String tableId,
            String fromStaffId,
            String toStaffName,
            String status,
            Instant createdAt,
            Instant decidedAt
    ) {}

    public record PrintJobRequest(
            @NotBlank String businessId,
            String orderId,
            @NotBlank String type,
            String printerName
    ) {}

    public record OnboardingRequest(
            String businessId,
            @NotBlank String businessName,
            boolean taxEnabled,
            int serviceFeePercent,
            int tableCount,
            @NotNull List<String> menuSeed,
            @NotNull List<String> staffInvites
    ) {}

    public record OnboardingResponse(
            String id,
            String businessName,
            boolean taxEnabled,
            int serviceFeePercent,
            int tableCount,
            List<String> menuSeed,
            List<String> staffInvites,
            String status,
            Instant createdAt
    ) {}

    public record AuditEventRequest(
            @NotBlank String businessId,
            @NotBlank String type,
            Map<String, Object> payload
    ) {}

    public record AuditEventResponse(String id, String businessId, String type, Instant createdAt) {}
}
