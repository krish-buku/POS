package com.bukukasir.table.infrastructure.web;

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

import java.time.Instant;
import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@RestController
@RequestMapping("/api/waiter-transfers")
@RequiredArgsConstructor
@Tag(name = "Waiter transfers", description = "Waiter handoff contracts for mobile POS")
public class WaiterTransferController {
    private final AuditLogger auditLogger;
    private final Map<String, WaiterTransferResponse> transfers = new ConcurrentHashMap<>();

    @PostMapping
    @Operation(summary = "Create waiter table handoff request")
    public ResponseEntity<ApiResponse<WaiterTransferResponse>> createTransfer(
            @Valid @RequestBody WaiterTransferRequest request) {
        String id = IdGenerator.generateId();
        WaiterTransferResponse response = new WaiterTransferResponse(
                id, request.businessId(), request.tableId(), request.fromStaffId(), request.toStaffName(),
                "PENDING", Instant.now(), null);
        transfers.put(id, response);
        audit(request.businessId(), request.fromStaffId(), AuditAction.TRANSFER, id,
                "Waiter transfer requested for table " + request.tableId(), Map.of("toStaffName", request.toStaffName()));
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(response, "Transfer requested"));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Accept or reject waiter handoff")
    public ResponseEntity<ApiResponse<WaiterTransferResponse>> decideTransfer(
            @PathVariable String id,
            @RequestBody WaiterTransferDecision request) {
        WaiterTransferResponse existing = transfers.getOrDefault(id,
                new WaiterTransferResponse(id, "biz-001", "table-unknown", null, null, "PENDING", Instant.now(), null));
        String status = request.accepted() ? "ACCEPTED" : "REJECTED";
        WaiterTransferResponse response = new WaiterTransferResponse(
                existing.id(), existing.businessId(), existing.tableId(), existing.fromStaffId(),
                existing.toStaffName(), status, existing.createdAt(), Instant.now());
        transfers.put(id, response);
        audit(response.businessId(), response.fromStaffId(), request.accepted() ? AuditAction.APPROVE : AuditAction.REJECT,
                id, "Waiter transfer " + status.toLowerCase(), Map.of("status", status));
        return ResponseEntity.ok(ApiResponse.success(response, "Transfer " + status.toLowerCase()));
    }

    private void audit(String businessId, String actorId, AuditAction action, String entityId, String description, Map<String, Object> newValues) {
        auditLogger.log(AuditLog.builder()
                .actorId(actorId == null || actorId.isBlank() ? "mobile" : actorId)
                .actorName("Mobile POS")
                .businessId(businessId)
                .action(action)
                .entityType("WaiterTransfer")
                .entityId(entityId)
                .description(description)
                .newValues(newValues == null ? new LinkedHashMap<>() : new LinkedHashMap<>(newValues))
                .timestamp(LocalDateTime.now())
                .build());
    }

    public record WaiterTransferRequest(@NotBlank String businessId, @NotBlank String tableId, String fromStaffId, @NotBlank String toStaffName) {}
    public record WaiterTransferDecision(boolean accepted) {}
    public record WaiterTransferResponse(String id, String businessId, String tableId, String fromStaffId, String toStaffName, String status, Instant createdAt, Instant decidedAt) {}
}
