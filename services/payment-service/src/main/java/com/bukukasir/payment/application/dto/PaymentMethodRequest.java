package com.bukukasir.payment.application.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;

@Schema(description = "Payment method request")
public record PaymentMethodRequest(
    @NotBlank String name,
    @NotBlank String type,
    boolean active,
    @Schema(example = "biz-001") String businessId
) {}
