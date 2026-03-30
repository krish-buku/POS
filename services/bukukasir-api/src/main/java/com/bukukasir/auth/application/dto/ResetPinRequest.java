package com.bukukasir.auth.application.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;

@Schema(description = "Request to reset a staff PIN (manager action)")
public record ResetPinRequest(

    @NotBlank(message = "Staff ID is required")
    @Schema(description = "Staff ID to reset PIN for", example = "staff-003")
    String staffId,

    @NotBlank(message = "Manager staff ID is required")
    @Schema(description = "Manager's staff ID (for authorization)", example = "staff-001")
    String managerStaffId
) {}
