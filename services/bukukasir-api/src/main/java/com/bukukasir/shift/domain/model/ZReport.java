package com.bukukasir.shift.domain.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.Duration;
import java.time.LocalDateTime;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ZReport {

    private String shiftId;
    private String businessId;
    private String staffName;
    private LocalDateTime openedAt;
    private LocalDateTime closedAt;
    private String duration;
    private BigDecimal openingCash;
    private BigDecimal closingCash;
    private BigDecimal expectedCash;
    private BigDecimal variance;
    private BigDecimal totalSales;
    private int totalOrders;
    private BigDecimal averageOrderValue;
    private Map<String, BigDecimal> paymentBreakdown;
    private BigDecimal cashMovementTotalIn;
    private BigDecimal cashMovementTotalOut;
}
