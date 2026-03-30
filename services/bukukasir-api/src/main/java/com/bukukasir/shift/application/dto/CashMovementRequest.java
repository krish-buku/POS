package com.bukukasir.shift.application.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;

@Schema(description = "Request to add a cash movement to a shift")
public record CashMovementRequest(

    @NotBlank
    @Schema(description = "Movement type: CASH_IN or CASH_OUT", example = "CASH_IN")
    String type,

    @NotNull
    @Schema(description = "Amount of cash movement", example = "200000")
    BigDecimal amount,

    @NotBlank
    @Schema(description = "Reason for the cash movement", example = "Additional change for register")
    String reason,

    @NotBlank
    @Schema(description = "Staff ID performing the movement", example = "staff-003")
    String staffId
) {}
