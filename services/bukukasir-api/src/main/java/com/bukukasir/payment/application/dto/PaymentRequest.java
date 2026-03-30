package com.bukukasir.payment.application.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;

@Schema(description = "Payment request")
public record PaymentRequest(
    @NotBlank String orderId,
    @Schema(example = "ORD-001") String orderNumber,
    @NotNull BigDecimal amount,
    @NotNull BigDecimal amountPaid,
    @NotBlank String paymentMethodId,
    @Schema(example = "Cash") String paymentMethodName,
    @Schema(example = "staff-003") String staffId,
    @Schema(example = "biz-001") String businessId
) {}
