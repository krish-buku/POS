package com.bukukasir.order.infrastructure.persistence.adapter;

import com.bukukasir.order.domain.model.*;
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
        // biz-001 has PPN 11% (exclusive) + PB1 5% (exclusive)
        // tax on subtotal: PPN = subtotal * 0.11, PB1 = subtotal * 0.05, total tax = subtotal * 0.16

        // order-001: subtotal=66000, PPN=7260, PB1=3300, totalTax=10560, total=76560
        store.put("order-001", Order.builder().id("order-001").orderNumber("ORD-001").tableId("table-001").tableName("T1")
                .staffId("staff-003").staffName("Ahmad Wijaya").businessId("biz-001")
                .items(List.of(
                        OrderItem.builder().id("oi-001").menuItemId("menu-001").menuItemName("Nasi Goreng Spesial").quantity(2).unitPrice(new BigDecimal("25000")).subtotal(new BigDecimal("50000")).build(),
                        OrderItem.builder().id("oi-002").menuItemId("menu-005").menuItemName("Es Teh Manis").quantity(2).unitPrice(new BigDecimal("8000")).subtotal(new BigDecimal("16000")).build()
                ))
                .subtotal(new BigDecimal("66000")).tax(new BigDecimal("10560")).total(new BigDecimal("76560"))
                .taxBreakdown(List.of(
                        TaxCalculation.builder().taxConfigId("tax-001").taxName("PPN").rate(new BigDecimal("0.11")).inclusive(false).taxableAmount(new BigDecimal("66000")).taxAmount(new BigDecimal("7260")).build(),
                        TaxCalculation.builder().taxConfigId("tax-002").taxName("PB1 Service Charge").rate(new BigDecimal("0.05")).inclusive(false).taxableAmount(new BigDecimal("66000")).taxAmount(new BigDecimal("3300")).build()
                ))
                .status(OrderStatus.CONFIRMED).createdAt(Instant.now().minusSeconds(3600)).updatedAt(Instant.now()).build());

        // order-002: subtotal=53000, PPN=5830, PB1=2650, totalTax=8480, total=61480
        store.put("order-002", Order.builder().id("order-002").orderNumber("ORD-002").tableId("table-003").tableName("T3")
                .staffId("staff-004").staffName("Dewi Lestari").businessId("biz-001")
                .items(List.of(
                        OrderItem.builder().id("oi-003").menuItemId("menu-003").menuItemName("Ayam Bakar").quantity(1).unitPrice(new BigDecimal("35000")).subtotal(new BigDecimal("35000")).build(),
                        OrderItem.builder().id("oi-004").menuItemId("menu-007").menuItemName("Kopi Susu").quantity(1).unitPrice(new BigDecimal("18000")).subtotal(new BigDecimal("18000")).variantName("Iced").build()
                ))
                .subtotal(new BigDecimal("53000")).tax(new BigDecimal("8480")).total(new BigDecimal("61480"))
                .taxBreakdown(List.of(
                        TaxCalculation.builder().taxConfigId("tax-001").taxName("PPN").rate(new BigDecimal("0.11")).inclusive(false).taxableAmount(new BigDecimal("53000")).taxAmount(new BigDecimal("5830")).build(),
                        TaxCalculation.builder().taxConfigId("tax-002").taxName("PB1 Service Charge").rate(new BigDecimal("0.05")).inclusive(false).taxableAmount(new BigDecimal("53000")).taxAmount(new BigDecimal("2650")).build()
                ))
                .status(OrderStatus.PREPARING).createdAt(Instant.now().minusSeconds(1800)).updatedAt(Instant.now()).build());

        // order-003: subtotal=114000, PPN=12540, PB1=5700, totalTax=18240, total=132240
        store.put("order-003", Order.builder().id("order-003").orderNumber("ORD-003").tableId("table-006").tableName("T6")
                .staffId("staff-003").staffName("Ahmad Wijaya").businessId("biz-001")
                .items(List.of(
                        OrderItem.builder().id("oi-005").menuItemId("menu-004").menuItemName("Soto Ayam").quantity(3).unitPrice(new BigDecimal("20000")).subtotal(new BigDecimal("60000")).build(),
                        OrderItem.builder().id("oi-006").menuItemId("menu-008").menuItemName("Pisang Goreng").quantity(2).unitPrice(new BigDecimal("12000")).subtotal(new BigDecimal("24000")).build(),
                        OrderItem.builder().id("oi-007").menuItemId("menu-006").menuItemName("Es Jeruk").quantity(3).unitPrice(new BigDecimal("10000")).subtotal(new BigDecimal("30000")).build()
                ))
                .subtotal(new BigDecimal("114000")).tax(new BigDecimal("18240")).total(new BigDecimal("132240"))
                .taxBreakdown(List.of(
                        TaxCalculation.builder().taxConfigId("tax-001").taxName("PPN").rate(new BigDecimal("0.11")).inclusive(false).taxableAmount(new BigDecimal("114000")).taxAmount(new BigDecimal("12540")).build(),
                        TaxCalculation.builder().taxConfigId("tax-002").taxName("PB1 Service Charge").rate(new BigDecimal("0.05")).inclusive(false).taxableAmount(new BigDecimal("114000")).taxAmount(new BigDecimal("5700")).build()
                ))
                .status(OrderStatus.READY).createdAt(Instant.now().minusSeconds(7200)).updatedAt(Instant.now()).build());

        // order-004: subtotal=22000, PPN=2420, PB1=1100, totalTax=3520, total=25520
        store.put("order-004", Order.builder().id("order-004").orderNumber("ORD-004").tableId("table-002").tableName("T2")
                .staffId("staff-004").staffName("Dewi Lestari").businessId("biz-001")
                .items(List.of(
                        OrderItem.builder().id("oi-008").menuItemId("menu-002").menuItemName("Mie Goreng").quantity(1).unitPrice(new BigDecimal("22000")).subtotal(new BigDecimal("22000")).build()
                ))
                .subtotal(new BigDecimal("22000")).tax(new BigDecimal("3520")).total(new BigDecimal("25520"))
                .taxBreakdown(List.of(
                        TaxCalculation.builder().taxConfigId("tax-001").taxName("PPN").rate(new BigDecimal("0.11")).inclusive(false).taxableAmount(new BigDecimal("22000")).taxAmount(new BigDecimal("2420")).build(),
                        TaxCalculation.builder().taxConfigId("tax-002").taxName("PB1 Service Charge").rate(new BigDecimal("0.05")).inclusive(false).taxableAmount(new BigDecimal("22000")).taxAmount(new BigDecimal("1100")).build()
                ))
                .status(OrderStatus.COMPLETED).createdAt(Instant.now().minusSeconds(14400)).updatedAt(Instant.now().minusSeconds(10800)).build());

        // order-005: subtotal=36000, PPN=3960, PB1=1800, totalTax=5760, total=41760
        store.put("order-005", Order.builder().id("order-005").orderNumber("ORD-005").tableId("table-005").tableName("T5")
                .staffId("staff-003").staffName("Ahmad Wijaya").businessId("biz-001")
                .items(List.of(
                        OrderItem.builder().id("oi-009").menuItemId("menu-010").menuItemName("Es Campur").quantity(2).unitPrice(new BigDecimal("18000")).subtotal(new BigDecimal("36000")).build()
                ))
                .subtotal(new BigDecimal("36000")).tax(new BigDecimal("5760")).total(new BigDecimal("41760"))
                .taxBreakdown(List.of(
                        TaxCalculation.builder().taxConfigId("tax-001").taxName("PPN").rate(new BigDecimal("0.11")).inclusive(false).taxableAmount(new BigDecimal("36000")).taxAmount(new BigDecimal("3960")).build(),
                        TaxCalculation.builder().taxConfigId("tax-002").taxName("PB1 Service Charge").rate(new BigDecimal("0.05")).inclusive(false).taxableAmount(new BigDecimal("36000")).taxAmount(new BigDecimal("1800")).build()
                ))
                .status(OrderStatus.VOIDED).notes("Customer cancelled").createdAt(Instant.now().minusSeconds(21600)).updatedAt(Instant.now().minusSeconds(18000)).build());
    }

    @Override public List<Order> findAll() { return new ArrayList<>(store.values()); }
    @Override public Optional<Order> findById(String id) { return Optional.ofNullable(store.get(id)); }
    @Override public List<Order> findByTableId(String tableId) {
        return store.values().stream().filter(o -> tableId.equals(o.getTableId())).collect(Collectors.toList());
    }
    @Override public Order save(Order order) { store.put(order.getId(), order); return order; }
}
