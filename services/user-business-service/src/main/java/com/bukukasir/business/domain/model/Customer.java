package com.bukukasir.business.domain.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Customer {
    private String id;
    private String businessId;
    private String phone;       // primary identifier, +62 format
    private String name;
    private String email;       // nullable
    private LocalDate dateOfBirth;  // nullable
    private Gender gender;
    private String notes;       // nullable
    private int totalOrders;
    private BigDecimal totalSpent;
    private Instant lastOrderAt;    // nullable
    private MarketingPreferences marketingPreferences;
    private Instant createdAt;
    private Instant updatedAt;
}
