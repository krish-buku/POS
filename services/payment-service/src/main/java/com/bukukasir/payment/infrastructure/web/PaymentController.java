package com.bukukasir.payment.infrastructure.web;

import com.bukukasir.common.dto.ApiResponse;
import com.bukukasir.payment.application.dto.*;
import com.bukukasir.payment.application.mapper.PaymentMapper;
import com.bukukasir.payment.domain.model.Payment;
import com.bukukasir.payment.domain.model.PaymentMethod;
import com.bukukasir.payment.domain.port.in.PaymentUseCase;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
@Tag(name = "Payments", description = "Payment management endpoints")
public class PaymentController {

    private final PaymentUseCase paymentUseCase;
    private final PaymentMapper paymentMapper;

    @PostMapping
    @Operation(summary = "Record a payment")
    public ResponseEntity<ApiResponse<Payment>> createPayment(@Valid @RequestBody PaymentRequest request) {
        Payment payment = paymentMapper.toDomain(request);
        Payment created = paymentUseCase.createPayment(payment);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(created, "Payment recorded"));
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
}
