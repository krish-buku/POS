package com.bukukasir.report.domain.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DailySummary {
    private LocalDate date;
    private BigDecimal totalRevenue;
    private int totalOrders;
    private int totalItems;
    private BigDecimal averageOrderValue;
    private int voidedOrders;
    private BigDecimal taxCollected;
}
