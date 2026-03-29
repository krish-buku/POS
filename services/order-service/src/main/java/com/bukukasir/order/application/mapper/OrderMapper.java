package com.bukukasir.order.application.mapper;

import com.bukukasir.order.application.dto.CreateOrderRequest;
import com.bukukasir.order.application.dto.OrderResponse;
import com.bukukasir.order.domain.model.Order;
import com.bukukasir.order.domain.model.OrderItem;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Component
public class OrderMapper {

    public OrderResponse toResponse(Order o) {
        return new OrderResponse(o.getId(), o.getOrderNumber(), o.getTableId(), o.getTableName(),
                o.getStaffId(), o.getStaffName(), o.getBusinessId(), o.getItems(),
                o.getSubtotal(), o.getTax(), o.getTotal(), o.getStatus().name(),
                o.getNotes(), o.getCreatedAt(), o.getUpdatedAt());
    }

    public Order toDomain(CreateOrderRequest r) {
        List<OrderItem> items = r.items().stream().map(i -> OrderItem.builder()
                .menuItemId(i.menuItemId()).menuItemName(i.menuItemName())
                .quantity(i.quantity()).unitPrice(i.unitPrice())
                .subtotal(i.unitPrice().multiply(BigDecimal.valueOf(i.quantity())))
                .notes(i.notes()).modifiers(i.modifiers()).variantName(i.variantName())
                .build()).collect(Collectors.toList());

        return Order.builder().tableId(r.tableId()).tableName(r.tableName())
                .staffId(r.staffId()).staffName(r.staffName())
                .businessId(r.businessId()).items(items).notes(r.notes()).build();
    }

    public List<OrderItem> toOrderItems(List<CreateOrderRequest.OrderItemRequest> items) {
        return items.stream().map(i -> OrderItem.builder()
                .menuItemId(i.menuItemId()).menuItemName(i.menuItemName())
                .quantity(i.quantity()).unitPrice(i.unitPrice())
                .subtotal(i.unitPrice().multiply(BigDecimal.valueOf(i.quantity())))
                .notes(i.notes()).modifiers(i.modifiers()).variantName(i.variantName())
                .build()).collect(Collectors.toList());
    }
}
