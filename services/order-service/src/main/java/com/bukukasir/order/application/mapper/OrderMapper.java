package com.bukukasir.order.application.mapper;

import com.bukukasir.order.application.dto.*;
import com.bukukasir.order.domain.model.*;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Component
public class OrderMapper {

    public OrderResponse toResponse(Order o) {
        return new OrderResponse(o.getId(), o.getOrderNumber(), o.getTableId(), o.getTableName(),
                o.getStaffId(), o.getStaffName(), o.getBusinessId(), o.getItems(),
                o.getSubtotal(), o.getTax(), o.getTotal(), o.getTaxBreakdown(),
                o.getStatus().name(), o.getNotes(), o.getCreatedAt(), o.getUpdatedAt());
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

    public TaxConfig toDomain(TaxConfigRequest r) {
        return TaxConfig.builder()
                .businessId(r.businessId())
                .name(r.name())
                .rate(r.rate())
                .inclusive(r.inclusive())
                .active(r.active())
                .priority(r.priority())
                .build();
    }

    public Promotion toDomain(PromotionRequest r) {
        return Promotion.builder()
                .businessId(r.businessId())
                .name(r.name())
                .description(r.description())
                .type(PromotionType.valueOf(r.type()))
                .discountType(DiscountType.valueOf(r.discountType()))
                .discountValue(r.discountValue())
                .maxDiscount(r.maxDiscount())
                .minOrderAmount(r.minOrderAmount())
                .applicableCategories(r.applicableCategories() != null ? r.applicableCategories() : List.of())
                .applicableItems(r.applicableItems() != null ? r.applicableItems() : List.of())
                .startDate(r.startDate())
                .endDate(r.endDate())
                .activeDays(r.activeDays())
                .startTime(r.startTime())
                .endTime(r.endTime())
                .stackable(r.stackable())
                .priority(r.priority())
                .active(r.active())
                .build();
    }

    public List<OrderItemInfo> toOrderItemInfos(List<CalculatePromotionRequest.OrderItemInfoRequest> items) {
        return items.stream().map(i -> OrderItemInfo.builder()
                .itemId(i.itemId())
                .categoryId(i.categoryId())
                .quantity(i.quantity())
                .price(i.price())
                .build()).collect(Collectors.toList());
    }
}
