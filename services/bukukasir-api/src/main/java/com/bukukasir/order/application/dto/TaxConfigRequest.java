package com.bukukasir.order.application.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;

@Schema(description = "Tax configuration request")
public record TaxConfigRequest(
    @NotBlank @Schema(example = "biz-001") String businessId,
    @NotBlank @Schema(example = "PPN") String name,
    @NotNull @Schema(example = "0.11") BigDecimal rate,
    @Schema(example = "false") boolean inclusive,
    @Schema(example = "true") boolean active,
    @Schema(example = "1") int priority
) {}
