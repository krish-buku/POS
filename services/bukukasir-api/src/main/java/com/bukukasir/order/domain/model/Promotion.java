package com.bukukasir.order.domain.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Promotion {
    private String id;
    private String businessId;
    private String name;
    private String description;
    private PromotionType type;
    private DiscountType discountType;
    private BigDecimal discountValue;      // e.g., 10 for 10% or 5000 for Rp 5,000
    private BigDecimal maxDiscount;        // cap for percentage discounts (nullable)
    private BigDecimal minOrderAmount;     // minimum subtotal to apply (nullable)
    private List<String> applicableCategories; // category IDs (empty = all)
    private List<String> applicableItems;      // item IDs (empty = all)
    private LocalDate startDate;           // nullable
    private LocalDate endDate;             // nullable
    private List<DayOfWeek> activeDays;    // nullable, e.g., [MONDAY, TUESDAY]
    private LocalTime startTime;           // nullable, e.g., 15:00 for happy hour
    private LocalTime endTime;             // nullable, e.g., 18:00
    private boolean stackable;
    private int priority;                  // lower = applied first
    private boolean active;
}
