package com.bukukasir.order.application.dto;

import com.bukukasir.order.domain.model.OrderItem;
import io.swagger.v3.oas.annotations.media.Schema;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

@Schema(description = "Order response")
public record OrderResponse(
    String id, String orderNumber, String tableId, String tableName,
    String staffId, String staffName, String businessId,
    List<OrderItem> items, BigDecimal subtotal, BigDecimal tax,
    BigDecimal total, String status, String notes,
    Instant createdAt, Instant updatedAt
) {}
