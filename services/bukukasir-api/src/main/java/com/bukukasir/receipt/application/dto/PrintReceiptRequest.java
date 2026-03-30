package com.bukukasir.receipt.application.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;

@Schema(description = "Print receipt request")
public record PrintReceiptRequest(
    @NotBlank String orderId,
    String orderNumber,
    @Schema(example = "biz-001") String businessId
) {}
