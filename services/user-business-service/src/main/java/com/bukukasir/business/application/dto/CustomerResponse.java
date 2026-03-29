package com.bukukasir.business.application.dto;

import com.bukukasir.business.domain.model.MarketingPreferences;
import io.swagger.v3.oas.annotations.media.Schema;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;

@Schema(description = "Customer response")
public record CustomerResponse(
    @Schema(description = "Customer ID") String id,
    @Schema(description = "Business ID") String businessId,
    @Schema(description = "Phone number") String phone,
    @Schema(description = "Customer name") String name,
    @Schema(description = "Email address") String email,
    @Schema(description = "Date of birth") LocalDate dateOfBirth,
    @Schema(description = "Gender") String gender,
    @Schema(description = "Notes") String notes,
    @Schema(description = "Total number of orders") int totalOrders,
    @Schema(description = "Total amount spent") BigDecimal totalSpent,
    @Schema(description = "Last order timestamp") Instant lastOrderAt,
    @Schema(description = "Marketing preferences") MarketingPreferences marketingPreferences,
    @Schema(description = "Created at") Instant createdAt,
    @Schema(description = "Updated at") Instant updatedAt
) {}
