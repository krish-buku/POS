package com.bukukasir.shift.domain.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Shift {

    private String id;
    private String businessId;
    private String staffId;
    private String staffName;
    private LocalDateTime openedAt;
    private LocalDateTime closedAt;
    private BigDecimal openingCash;
    private BigDecimal closingCash;
    private BigDecimal expectedCash;
    private BigDecimal variance;
    private ShiftStatus status;
    private BigDecimal totalSales;
    private int totalOrders;
    private BigDecimal cashPayments;
    private BigDecimal qrisPayments;
    private BigDecimal edcPayments;
    private BigDecimal otherPayments;
    @Builder.Default
    private List<CashMovement> cashMovements = new ArrayList<>();
    private String notes;
}
