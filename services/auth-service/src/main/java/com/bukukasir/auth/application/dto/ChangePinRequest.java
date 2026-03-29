package com.bukukasir.auth.application.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

@Schema(description = "Request to change a staff PIN")
public record ChangePinRequest(

    @NotBlank(message = "Staff ID is required")
    @Schema(description = "Staff ID", example = "staff-001")
    String staffId,

    @NotBlank(message = "Current PIN is required")
    @Pattern(regexp = "\\d{4,6}", message = "PIN must be 4-6 digits")
    @Schema(description = "Current PIN", example = "1234")
    String currentPin,

    @NotBlank(message = "New PIN is required")
    @Pattern(regexp = "\\d{4,6}", message = "PIN must be 4-6 digits")
    @Schema(description = "New PIN (4-6 digits)", example = "5678")
    String newPin
) {}
