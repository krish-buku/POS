package com.bukukasir.order.infrastructure.persistence.adapter;

import com.bukukasir.order.domain.model.Order;
import com.bukukasir.order.domain.model.OrderItem;
import com.bukukasir.order.domain.model.OrderStatus;
import com.bukukasir.order.domain.port.out.OrderRepository;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;

@Component
public class OrderPersistenceAdapter implements OrderRepository {

    private final Map<String, Order> store = new ConcurrentHashMap<>();

    public OrderPersistenceAdapter() { initMockData(); }

    private void initMockData() {
        store.put("order-001", Order.builder().id("order-001").orderNumber("ORD-001").tableId("table-001").tableName("T1")
                .staffId("staff-003").staffName("Ahmad Wijaya").businessId("biz-001")
                .items(List.of(
                        OrderItem.builder().id("oi-001").menuItemId("menu-001").menuItemName("Nasi Goreng Spesial").quantity(2).unitPrice(new BigDecimal("25000")).subtotal(new BigDecimal("50000")).build(),
                        OrderItem.builder().id("oi-002").menuItemId("menu-005").menuItemName("Es Teh Manis").quantity(2).unitPrice(new BigDecimal("8000")).subtotal(new BigDecimal("16000")).build()
                ))
                .subtotal(new BigDecimal("66000")).tax(new BigDecimal("7260")).total(new BigDecimal("73260"))
                .status(OrderStatus.CONFIRMED).createdAt(Instant.now().minusSeconds(3600)).updatedAt(Instant.now()).build());

        store.put("order-002", Order.builder().id("order-002").orderNumber("ORD-002").tableId("table-003").tableName("T3")
                .staffId("staff-004").staffName("Dewi Lestari").businessId("biz-001")
                .items(List.of(
                        OrderItem.builder().id("oi-003").menuItemId("menu-003").menuItemName("Ayam Bakar").quantity(1).unitPrice(new BigDecimal("35000")).subtotal(new BigDecimal("35000")).build(),
                        OrderItem.builder().id("oi-004").menuItemId("menu-007").menuItemName("Kopi Susu").quantity(1).unitPrice(new BigDecimal("18000")).subtotal(new BigDecimal("18000")).variantName("Iced").build()
                ))
                .subtotal(new BigDecimal("53000")).tax(new BigDecimal("5830")).total(new BigDecimal("58830"))
                .status(OrderStatus.PREPARING).createdAt(Instant.now().minusSeconds(1800)).updatedAt(Instant.now()).build());

        store.put("order-003", Order.builder().id("order-003").orderNumber("ORD-003").tableId("table-006").tableName("T6")
                .staffId("staff-003").staffName("Ahmad Wijaya").businessId("biz-001")
                .items(List.of(
                        OrderItem.builder().id("oi-005").menuItemId("menu-004").menuItemName("Soto Ayam").quantity(3).unitPrice(new BigDecimal("20000")).subtotal(new BigDecimal("60000")).build(),
                        OrderItem.builder().id("oi-006").menuItemId("menu-008").menuItemName("Pisang Goreng").quantity(2).unitPrice(new BigDecimal("12000")).subtotal(new BigDecimal("24000")).build(),
                        OrderItem.builder().id("oi-007").menuItemId("menu-006").menuItemName("Es Jeruk").quantity(3).unitPrice(new BigDecimal("10000")).subtotal(new BigDecimal("30000")).build()
                ))
                .subtotal(new BigDecimal("114000")).tax(new BigDecimal("12540")).total(new BigDecimal("126540"))
                .status(OrderStatus.READY).createdAt(Instant.now().minusSeconds(7200)).updatedAt(Instant.now()).build());

        store.put("order-004", Order.builder().id("order-004").orderNumber("ORD-004").tableId("table-002").tableName("T2")
                .staffId("staff-004").staffName("Dewi Lestari").businessId("biz-001")
                .items(List.of(
                        OrderItem.builder().id("oi-008").menuItemId("menu-002").menuItemName("Mie Goreng").quantity(1).unitPrice(new BigDecimal("22000")).subtotal(new BigDecimal("22000")).build()
                ))
                .subtotal(new BigDecimal("22000")).tax(new BigDecimal("2420")).total(new BigDecimal("24420"))
                .status(OrderStatus.COMPLETED).createdAt(Instant.now().minusSeconds(14400)).updatedAt(Instant.now().minusSeconds(10800)).build());

        store.put("order-005", Order.builder().id("order-005").orderNumber("ORD-005").tableId("table-005").tableName("T5")
                .staffId("staff-003").staffName("Ahmad Wijaya").businessId("biz-001")
                .items(List.of(
                        OrderItem.builder().id("oi-009").menuItemId("menu-010").menuItemName("Es Campur").quantity(2).unitPrice(new BigDecimal("18000")).subtotal(new BigDecimal("36000")).build()
                ))
                .subtotal(new BigDecimal("36000")).tax(new BigDecimal("3960")).total(new BigDecimal("39960"))
                .status(OrderStatus.VOIDED).notes("Customer cancelled").createdAt(Instant.now().minusSeconds(21600)).updatedAt(Instant.now().minusSeconds(18000)).build());
    }

    @Override public List<Order> findAll() { return new ArrayList<>(store.values()); }
    @Override public Optional<Order> findById(String id) { return Optional.ofNullable(store.get(id)); }
    @Override public List<Order> findByTableId(String tableId) {
        return store.values().stream().filter(o -> o.getTableId().equals(tableId)).collect(Collectors.toList());
    }
    @Override public Order save(Order order) { store.put(order.getId(), order); return order; }
}
