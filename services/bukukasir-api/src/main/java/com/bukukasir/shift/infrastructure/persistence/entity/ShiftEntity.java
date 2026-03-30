package com.bukukasir.shift.infrastructure.persistence.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "shifts")
public class ShiftEntity {

    @Id
    @Column(name = "id")
    private String id;

    @Column(name = "business_id")
    private String businessId;

    @Column(name = "staff_id")
    private String staffId;

    @Column(name = "staff_name")
    private String staffName;

    @Column(name = "opened_at")
    private LocalDateTime openedAt;

    @Column(name = "closed_at")
    private LocalDateTime closedAt;

    @Column(name = "opening_cash")
    private BigDecimal openingCash;

    @Column(name = "closing_cash")
    private BigDecimal closingCash;

    @Column(name = "expected_cash")
    private BigDecimal expectedCash;

    @Column(name = "variance")
    private BigDecimal variance;

    @Column(name = "status")
    private String status;

    @Column(name = "total_sales")
    private BigDecimal totalSales;

    @Column(name = "total_orders")
    private int totalOrders;

    @Column(name = "cash_payments")
    private BigDecimal cashPayments;

    @Column(name = "qris_payments")
    private BigDecimal qrisPayments;

    @Column(name = "edc_payments")
    private BigDecimal edcPayments;

    @Column(name = "other_payments")
    private BigDecimal otherPayments;

    @Column(name = "cash_movements", columnDefinition = "jsonb")
    private String cashMovements;

    @Column(name = "notes")
    private String notes;
}
