package com.bukukasir.order.domain.service;

import com.bukukasir.common.exception.BusinessException;
import com.bukukasir.common.exception.ResourceNotFoundException;
import com.bukukasir.common.util.IdGenerator;
import com.bukukasir.order.domain.model.Order;
import com.bukukasir.order.domain.model.OrderItem;
import com.bukukasir.order.domain.model.OrderStatus;
import com.bukukasir.order.domain.port.in.OrderUseCase;
import com.bukukasir.order.domain.port.out.OrderRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class OrderDomainService implements OrderUseCase {

    private final OrderRepository orderRepository;

    @Override
    public Order createOrder(Order order) {
        order.setId(IdGenerator.generateId());
        order.setOrderNumber(IdGenerator.generateOrderNumber());
        order.setStatus(OrderStatus.PENDING);
        order.setCreatedAt(Instant.now());
        order.setUpdatedAt(Instant.now());
        recalculateTotal(order);
        return orderRepository.save(order);
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
        order.setStatus(OrderStatus.VOIDED);
        order.setNotes(reason);
        order.setUpdatedAt(Instant.now());
        return orderRepository.save(order);
    }

    private void recalculateTotal(Order order) {
        if (order.getItems() == null || order.getItems().isEmpty()) {
            order.setSubtotal(BigDecimal.ZERO);
            order.setTax(BigDecimal.ZERO);
            order.setTotal(BigDecimal.ZERO);
            return;
        }
        BigDecimal subtotal = order.getItems().stream()
                .map(OrderItem::getSubtotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal tax = subtotal.multiply(new BigDecimal("0.11")); // PPN 11%
        order.setSubtotal(subtotal);
        order.setTax(tax);
        order.setTotal(subtotal.add(tax));
    }
}
