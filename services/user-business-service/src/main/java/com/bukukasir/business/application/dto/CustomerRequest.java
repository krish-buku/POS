package com.bukukasir.business.application.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;

import java.time.LocalDate;

@Schema(description = "Customer create/update request")
public record CustomerRequest(
    @NotBlank @Schema(example = "biz-001") String businessId,
    @Schema(example = "+6281234567001") String phone,
    @NotBlank @Schema(example = "Pak Hendra") String name,
    @Schema(example = "hendra@email.com") String email,
    @Schema(example = "1990-05-15") LocalDate dateOfBirth,
    @Schema(example = "MALE") String gender,
    @Schema(example = "Regular customer") String notes,
    @Schema(description = "Marketing preferences") MarketingPreferencesRequest marketingPreferences
) {
    @Schema(description = "Marketing preferences")
    public record MarketingPreferencesRequest(
        @Schema(example = "true") boolean smsOptIn,
        @Schema(example = "true") boolean emailOptIn,
        @Schema(example = "true") boolean whatsappOptIn
    ) {}
}
