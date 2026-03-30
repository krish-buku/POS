package com.bukukasir.auth.application.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

@Schema(description = "Request to verify a staff PIN")
public record VerifyPinRequest(

    @NotBlank(message = "Business ID is required")
    @Schema(description = "Business ID", example = "biz-001")
    String businessId,

    @NotBlank(message = "PIN is required")
    @Pattern(regexp = "\\d{4,6}", message = "PIN must be 4-6 digits")
    @Schema(description = "Staff PIN (4-6 digits)", example = "1234")
    String pin
) {}
