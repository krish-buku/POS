package com.bukukasir.order.infrastructure.persistence.adapter;

import com.bukukasir.order.domain.model.Order;
import com.bukukasir.order.domain.model.OrderItem;
import com.bukukasir.order.domain.model.OrderStatus;
import com.bukukasir.order.domain.model.TaxCalculation;
import com.bukukasir.order.domain.port.out.OrderRepository;
import com.bukukasir.order.infrastructure.persistence.entity.OrderEntity;
import com.bukukasir.order.infrastructure.persistence.repository.JpaOrderRepository;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

@Component
@RequiredArgsConstructor
public class OrderPersistenceAdapter implements OrderRepository {

    private final JpaOrderRepository jpa;
    private final ObjectMapper objectMapper;

    @Override
    public List<Order> findAll() {
        return jpa.findAll().stream().map(this::toDomain).toList();
    }

    @Override
    public Optional<Order> findById(String id) {
        return jpa.findById(id).map(this::toDomain);
    }

    @Override
    public List<Order> findByTableId(String tableId) {
        return jpa.findByTableId(tableId).stream().map(this::toDomain).toList();
    }

    @Override
    public Order save(Order order) {
        OrderEntity saved = jpa.save(toEntity(order));
        return toDomain(saved);
    }

    private Order toDomain(OrderEntity e) {
        return Order.builder()
                .id(e.getId())
                .orderNumber(e.getOrderNumber())
                .tableId(e.getTableId())
                .tableName(e.getTableName())
                .staffId(e.getStaffId())
                .staffName(e.getStaffName())
                .businessId(e.getBusinessId())
                .items(readJson(e.getItems(), new TypeReference<List<OrderItem>>() {}))
                .subtotal(e.getSubtotal() != null ? e.getSubtotal() : BigDecimal.ZERO)
                .tax(e.getTax() != null ? e.getTax() : BigDecimal.ZERO)
                .total(e.getTotal() != null ? e.getTotal() : BigDecimal.ZERO)
                .taxBreakdown(readJson(e.getTaxBreakdown(), new TypeReference<List<TaxCalculation>>() {}))
                .status(parseStatus(e.getStatus()))
                .notes(e.getNotes())
                .createdAt(e.getCreatedAt())
                .updatedAt(e.getUpdatedAt())
                .build();
    }

    private OrderEntity toEntity(Order o) {
        return OrderEntity.builder()
                .id(o.getId())
                .orderNumber(o.getOrderNumber())
                .tableId(o.getTableId())
                .tableName(o.getTableName())
                .staffId(o.getStaffId())
                .staffName(o.getStaffName())
                .businessId(o.getBusinessId())
                .items(writeJson(o.getItems()))
                .subtotal(o.getSubtotal())
                .tax(o.getTax())
                .total(o.getTotal())
                .taxBreakdown(writeJson(o.getTaxBreakdown()))
                .status(o.getStatus() != null ? o.getStatus().name() : OrderStatus.PENDING.name())
                .notes(o.getNotes())
                .createdAt(o.getCreatedAt())
                .updatedAt(o.getUpdatedAt())
                .build();
    }

    private OrderStatus parseStatus(String raw) {
        if (raw == null || raw.isBlank()) return OrderStatus.PENDING;
        String s = raw.trim().toUpperCase();
        // Map DB aliases to enum values
        switch (s) {
            case "NEW": return OrderStatus.PENDING;
            case "CANCELLED":
            case "CANCELED":
            case "VOID":
                return OrderStatus.VOIDED;
            case "PAID": return OrderStatus.COMPLETED;
            default:
                try { return OrderStatus.valueOf(s); }
                catch (IllegalArgumentException ex) { return OrderStatus.PENDING; }
        }
    }

    private <T> List<T> readJson(String json, TypeReference<List<T>> ref) {
        if (json == null || json.isBlank()) {
            return Collections.emptyList();
        }
        try {
            List<T> result = objectMapper.readValue(json, ref);
            return result != null ? result : Collections.emptyList();
        } catch (Exception ex) {
            try {
                String unquoted = objectMapper.readValue(json, String.class);
                List<T> result = objectMapper.readValue(unquoted, ref);
                return result != null ? result : Collections.emptyList();
            } catch (Exception nested) {
                throw new IllegalStateException("Failed to deserialize JSONB column: " + nested.getMessage(), nested);
            }
        }
    }

    private String writeJson(Object value) {
        if (value == null) {
            return "[]";
        }
        try {
            return objectMapper.writeValueAsString(value);
        } catch (Exception ex) {
            throw new IllegalStateException("Failed to serialize JSONB column: " + ex.getMessage(), ex);
        }
    }
}
