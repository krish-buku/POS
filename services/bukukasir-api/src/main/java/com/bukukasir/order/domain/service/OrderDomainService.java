package com.bukukasir.order.domain.service;

import com.bukukasir.common.audit.AuditAction;
import com.bukukasir.common.audit.AuditLog;
import com.bukukasir.common.audit.AuditLogger;
import com.bukukasir.common.exception.BusinessException;
import com.bukukasir.common.exception.ResourceNotFoundException;
import com.bukukasir.common.util.IdGenerator;
import com.bukukasir.order.domain.model.*;
import com.bukukasir.order.domain.port.in.OrderUseCase;
import com.bukukasir.order.domain.port.out.OrderRepository;
import com.bukukasir.order.domain.port.out.TaxConfigRepository;
import com.bukukasir.kitchen.domain.port.in.KitchenUseCase;
import com.bukukasir.table.domain.port.in.TableUseCase;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class OrderDomainService implements OrderUseCase {

    private final OrderRepository orderRepository;
    private final TaxConfigRepository taxConfigRepository;
    private final TaxCalculator taxCalculator;
    private final AuditLogger auditLogger;
    private final KitchenUseCase kitchenUseCase;
    private final TableUseCase tableUseCase;

    @Override
    public Order createOrder(Order order) {
        order.setId(IdGenerator.generateId());
        order.setOrderNumber(IdGenerator.generateOrderNumber());
        order.setStatus(OrderStatus.PENDING);
        order.setCreatedAt(Instant.now());
        order.setUpdatedAt(Instant.now());
        recalculateTotal(order);
        Order saved = orderRepository.save(order);

        try {
            kitchenUseCase.createTicketFromOrder(saved);
            log.info("Kitchen ticket created for order {} (business {})", saved.getOrderNumber(), saved.getBusinessId());
        } catch (Exception e) {
            log.error("Failed to create kitchen ticket for order {}: {}", saved.getOrderNumber(), e.getMessage(), e);
        }

        if (saved.getTableId() != null && !saved.getTableId().isBlank()) {
            try {
                tableUseCase.setCurrentOrder(saved.getTableId(), saved.getId());
            } catch (Exception e) {
                log.warn("Failed to set current order on table {}: {}", saved.getTableId(), e.getMessage());
            }
            if (saved.getStaffId() != null && !saved.getStaffId().isBlank()) {
                try {
                    tableUseCase.assignStaff(saved.getTableId(), saved.getStaffId());
                } catch (Exception e) {
                    log.warn("Failed to assign staff {} to table {}: {}", saved.getStaffId(), saved.getTableId(), e.getMessage());
                }
            }
        }

        auditLogger.log(AuditLog.builder()
                .actorId("staff-001").actorName("System")
                .businessId(saved.getBusinessId())
                .action(AuditAction.CREATE)
                .entityType("Order").entityId(saved.getId())
                .description("Created order " + saved.getOrderNumber() + " for table " + saved.getTableName())
                .newValues(orderToMap(saved))
                .timestamp(LocalDateTime.now())
                .build());

        return saved;
    }

    @Override
    public Order getOrderById(String id) {
        return orderRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Order", "id", id));
    }

    @Override
    public List<Order> getOrdersByTableId(String tableId) {
        return orderRepository.findByTableId(tableId);
    }

    @Override
    public List<Order> getAllOrders() { return orderRepository.findAll(); }

    @Override
    public Order addItems(String orderId, List<OrderItem> items) {
        Order order = getOrderById(orderId);
        if (order.getStatus() == OrderStatus.VOIDED || order.getStatus() == OrderStatus.COMPLETED) {
            throw new BusinessException("ORDER_CLOSED", "Cannot add items to a closed order");
        }
        if (order.getItems() == null) order.setItems(new ArrayList<>());
        for (OrderItem item : items) {
            item.setId(IdGenerator.generateId());
            item.setSubtotal(item.getUnitPrice().multiply(BigDecimal.valueOf(item.getQuantity())));
        }
        order.getItems().addAll(items);
        recalculateTotal(order);
        order.setUpdatedAt(Instant.now());
        return orderRepository.save(order);
    }

    @Override
    public Order voidOrder(String orderId, String reason) {
        Order order = getOrderById(orderId);
        if (order.getStatus() == OrderStatus.VOIDED) {
            throw new BusinessException("ORDER_ALREADY_VOIDED", "Order sudah divoid");
        }
        Map<String, Object> oldValues = orderToMap(order);

        order.setStatus(OrderStatus.VOIDED);
        order.setNotes(reason);
        order.setUpdatedAt(Instant.now());
        Order saved = orderRepository.save(order);

        Map<String, Object> newValues = new LinkedHashMap<>();
        newValues.put("status", "VOIDED");
        newValues.put("voidReason", reason);

        auditLogger.log(AuditLog.builder()
                .actorId("staff-001").actorName("System")
                .businessId(saved.getBusinessId())
                .action(AuditAction.VOID)
                .entityType("Order").entityId(saved.getId())
                .description("Voided order " + saved.getOrderNumber() + " - reason: " + reason)
                .oldValues(oldValues)
                .newValues(newValues)
                .timestamp(LocalDateTime.now())
                .build());

        return saved;
    }

    @Override
    public Order markOrderPaid(String orderId, String paymentMethodName) {
        Order order = getOrderById(orderId);
        if (order.getStatus() == OrderStatus.VOIDED) {
            throw new BusinessException("ORDER_VOIDED", "Cannot mark a voided order as paid");
        }
        Map<String, Object> oldValues = orderToMap(order);

        order.setStatus(OrderStatus.COMPLETED);
        order.setUpdatedAt(Instant.now());
        Order saved = orderRepository.save(order);

        if (saved.getTableId() != null && !saved.getTableId().isBlank()) {
            try {
                tableUseCase.updateStatus(saved.getTableId(), com.bukukasir.table.domain.model.TableStatus.AVAILABLE);
            } catch (Exception e) {
                log.warn("Failed to release table {} after payment for order {}: {}", saved.getTableId(), saved.getOrderNumber(), e.getMessage());
            }
        }

        Map<String, Object> newValues = orderToMap(saved);
        newValues.put("paymentMethod", paymentMethodName);

        auditLogger.log(AuditLog.builder()
                .actorId("staff-001").actorName("System")
                .businessId(saved.getBusinessId())
                .action(AuditAction.STATUS_CHANGE)
                .entityType("Order").entityId(saved.getId())
                .description("Marked order " + saved.getOrderNumber() + " as paid via " + paymentMethodName)
                .oldValues(oldValues)
                .newValues(newValues)
                .timestamp(LocalDateTime.now())
                .build());

        return saved;
    }

    private void recalculateTotal(Order order) {
        if (order.getItems() == null || order.getItems().isEmpty()) {
            order.setSubtotal(BigDecimal.ZERO);
            order.setTax(BigDecimal.ZERO);
            order.setTotal(BigDecimal.ZERO);
            order.setTaxBreakdown(List.of());
            return;
        }
        BigDecimal subtotal = order.getItems().stream()
                .map(OrderItem::getSubtotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        order.setSubtotal(subtotal);

        // Use TaxCalculator with business's active tax configs
        String businessId = order.getBusinessId();
        List<TaxConfig> activeTaxes = (businessId != null)
                ? taxConfigRepository.findActiveByBusinessId(businessId)
                : List.of();

        if (activeTaxes.isEmpty()) {
            // Fallback to hardcoded PPN 11% if no tax configs found
            BigDecimal tax = subtotal.multiply(new BigDecimal("0.11"));
            order.setTax(tax);
            order.setTotal(subtotal.add(tax));
            order.setTaxBreakdown(List.of());
        } else {
            List<TaxCalculation> taxBreakdown = taxCalculator.calculateTaxes(subtotal, activeTaxes);
            order.setTaxBreakdown(taxBreakdown);

            // Sum up all exclusive taxes for the total
            BigDecimal totalTax = taxBreakdown.stream()
                    .filter(tc -> !tc.isInclusive())
                    .map(TaxCalculation::getTaxAmount)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);
            order.setTax(totalTax);
            order.setTotal(subtotal.add(totalTax));
        }
    }

    private Map<String, Object> orderToMap(Order order) {
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("orderNumber", order.getOrderNumber());
        map.put("tableId", order.getTableId());
        map.put("tableName", order.getTableName());
        map.put("status", order.getStatus() != null ? order.getStatus().name() : null);
        map.put("subtotal", order.getSubtotal());
        map.put("tax", order.getTax());
        map.put("total", order.getTotal());
        map.put("itemCount", order.getItems() != null ? order.getItems().size() : 0);
        return map;
    }
}
