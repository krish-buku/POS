package com.bukukasir.shift.application.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;

@Schema(description = "Request to open a new shift")
public record OpenShiftRequest(

    @NotBlank
    @Schema(description = "Staff ID", example = "staff-003")
    String staffId,

    @NotBlank
    @Schema(description = "Staff name", example = "Budi Kasir")
    String staffName,

    @NotBlank
    @Schema(description = "Business ID", example = "biz-001")
    String businessId,

    @NotNull
    @Schema(description = "Opening cash amount in drawer", example = "500000")
    BigDecimal openingCash
) {}
