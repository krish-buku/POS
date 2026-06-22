package com.bukukasir.payment.infrastructure.web;

import com.bukukasir.common.audit.AuditLogDTO;
import com.bukukasir.common.audit.AuditLogger;
import com.bukukasir.common.dto.ApiResponse;
import com.bukukasir.payment.application.dto.*;
import com.bukukasir.payment.application.mapper.PaymentMapper;
import com.bukukasir.payment.domain.model.Payment;
import com.bukukasir.payment.domain.model.PaymentMethod;
import com.bukukasir.payment.domain.model.TransactionLine;
import com.bukukasir.payment.domain.port.in.PaymentUseCase;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
@Tag(name = "Payments", description = "Payment management endpoints")
public class PaymentController {

    private final PaymentUseCase paymentUseCase;
    private final PaymentMapper paymentMapper;
    private final AuditLogger auditLogger;

    @PostMapping
    @Operation(summary = "Record a payment")
    public ResponseEntity<ApiResponse<Payment>> createPayment(@Valid @RequestBody PaymentRequest request) {
        Payment payment = paymentMapper.toDomain(request);
        Payment created = paymentUseCase.createPayment(payment);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(created, "Payment recorded"));
    }

    @GetMapping
    @Operation(summary = "List payments, optionally filtered by business")
    public ResponseEntity<ApiResponse<List<Payment>>> getPayments(
            @RequestParam(required = false) String businessId) {
        return ResponseEntity.ok(ApiResponse.success(paymentUseCase.getPayments(businessId)));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get payment by ID")
    public ResponseEntity<ApiResponse<Payment>> getPaymentById(@PathVariable String id) {
        return ResponseEntity.ok(ApiResponse.success(paymentUseCase.getPaymentById(id)));
    }

    @GetMapping("/order/{orderId}")
    @Operation(summary = "Get payments by order")
    public ResponseEntity<ApiResponse<List<Payment>>> getPaymentsByOrder(@PathVariable String orderId) {
        return ResponseEntity.ok(ApiResponse.success(paymentUseCase.getPaymentsByOrderId(orderId)));
    }

    @GetMapping("/{id}/ledger")
    @Operation(summary = "Get ledger lines for a payment")
    public ResponseEntity<ApiResponse<List<TransactionLine>>> getLedgerLines(
            @Parameter(description = "Payment ID") @PathVariable String id) {
        return ResponseEntity.ok(ApiResponse.success(paymentUseCase.getLedgerLines(id)));
    }

    @GetMapping("/ledger")
    @Operation(summary = "Query ledger lines with filters")
    public ResponseEntity<ApiResponse<List<TransactionLine>>> queryLedgerLines(
            @Parameter(description = "Business ID") @RequestParam String businessId,
            @Parameter(description = "Start date (ISO-8601 instant)") @RequestParam Instant dateFrom,
            @Parameter(description = "End date (ISO-8601 instant)") @RequestParam Instant dateTo) {
        return ResponseEntity.ok(ApiResponse.success(paymentUseCase.queryLedgerLines(businessId, dateFrom, dateTo)));
    }

    @PostMapping("/{id}/void")
    @Operation(summary = "Void a payment and generate reversal ledger lines")
    public ResponseEntity<ApiResponse<Payment>> voidPayment(
            @Parameter(description = "Payment ID") @PathVariable String id) {
        Payment voided = paymentUseCase.voidPayment(id);
        return ResponseEntity.ok(ApiResponse.success(voided, "Payment voided"));
    }

    @GetMapping("/methods")
    @Operation(summary = "List payment methods")
    public ResponseEntity<ApiResponse<List<PaymentMethod>>> getPaymentMethods(
            @RequestParam(required = false) String businessId) {
        return ResponseEntity.ok(ApiResponse.success(paymentUseCase.getPaymentMethods(businessId)));
    }

    @PostMapping("/methods")
    @Operation(summary = "Create payment method")
    public ResponseEntity<ApiResponse<PaymentMethod>> createPaymentMethod(@Valid @RequestBody PaymentMethodRequest request) {
        PaymentMethod method = paymentMapper.toDomain(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(paymentUseCase.createPaymentMethod(method), "Payment method created"));
    }

    @PutMapping("/methods/{id}")
    @Operation(summary = "Update payment method")
    public ResponseEntity<ApiResponse<PaymentMethod>> updatePaymentMethod(@PathVariable String id, @Valid @RequestBody PaymentMethodRequest request) {
        PaymentMethod method = paymentMapper.toDomain(request);
        return ResponseEntity.ok(ApiResponse.success(paymentUseCase.updatePaymentMethod(id, method), "Payment method updated"));
    }

    @DeleteMapping("/methods/{id}")
    @Operation(summary = "Delete payment method")
    public ResponseEntity<ApiResponse<Void>> deletePaymentMethod(@PathVariable String id) {
        paymentUseCase.deletePaymentMethod(id);
        return ResponseEntity.ok(ApiResponse.success(null, "Payment method deleted"));
    }

    @GetMapping("/audit")
    @Operation(summary = "Query payment audit logs", description = "Returns audit trail for payment-related actions")
    @io.swagger.v3.oas.annotations.responses.ApiResponses(value = {
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Audit logs retrieved")
    })
    public ResponseEntity<ApiResponse<List<AuditLogDTO>>> getAuditLogs(
            @RequestParam(required = false) String businessId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime to,
            @RequestParam(defaultValue = "50") int limit) {
        List<AuditLogDTO> logs = auditLogger.query(businessId, null, null, from, to, limit)
                .stream().map(AuditLogDTO::from).toList();
        return ResponseEntity.ok(ApiResponse.success(logs, "Audit logs retrieved"));
    }
}
