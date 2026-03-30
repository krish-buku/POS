package com.bukukasir.shift.application.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;

@Schema(description = "Request to close a shift")
public record CloseShiftRequest(

    @NotNull
    @Schema(description = "Actual cash counted at end of shift", example = "1250000")
    BigDecimal closingCash,

    @Schema(description = "Optional notes for the shift", example = "Smooth shift, no issues")
    String notes
) {}
