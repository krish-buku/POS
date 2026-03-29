package com.bukukasir.order.domain.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Order {
    private String id;
    private String orderNumber;
    private String tableId;
    private String tableName;
    private String staffId;
    private String staffName;
    private String businessId;
    private List<OrderItem> items;
    private BigDecimal subtotal;
    private BigDecimal tax;
    private BigDecimal total;
    private List<TaxCalculation> taxBreakdown;
    private OrderStatus status;
    private String notes;
    private Instant createdAt;
    private Instant updatedAt;
}
