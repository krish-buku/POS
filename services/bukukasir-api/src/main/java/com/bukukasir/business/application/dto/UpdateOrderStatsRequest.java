package com.bukukasir.business.application.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;

@Schema(description = "Request to update customer order stats")
public record UpdateOrderStatsRequest(
    @NotNull @Schema(example = "1") int orderCount,
    @NotNull @Schema(example = "150000") BigDecimal totalSpent
) {}
