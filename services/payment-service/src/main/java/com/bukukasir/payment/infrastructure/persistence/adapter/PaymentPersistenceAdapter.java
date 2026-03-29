package com.bukukasir.payment.infrastructure.persistence.adapter;

import com.bukukasir.payment.domain.model.*;
import com.bukukasir.payment.domain.port.out.PaymentRepository;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDateTime;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;

@Component
public class PaymentPersistenceAdapter implements PaymentRepository {

    private final Map<String, Payment> payments = new ConcurrentHashMap<>();
    private final Map<String, PaymentMethod> methods = new ConcurrentHashMap<>();

    public PaymentPersistenceAdapter() { initMockData(); }

    private void initMockData() {
        methods.put("pm-001", PaymentMethod.builder().id("pm-001").name("Cash").type("CASH").active(true).businessId("biz-001").build());
        methods.put("pm-002", PaymentMethod.builder().id("pm-002").name("BCA Debit").type("CARD").active(true).businessId("biz-001").build());
        methods.put("pm-003", PaymentMethod.builder().id("pm-003").name("GoPay").type("EWALLET").active(true).businessId("biz-001").build());
        methods.put("pm-004", PaymentMethod.builder().id("pm-004").name("QRIS").type("QRIS").active(true).businessId("biz-001").build());

        LocalDateTime now = LocalDateTime.now();

        // pay-001: amount 24420 = subtotal 22000 + tax 2420
        payments.put("pay-001", Payment.builder().id("pay-001").orderId("order-004").orderNumber("ORD-004")
                .amount(new BigDecimal("24420")).amountPaid(new BigDecimal("25000")).change(new BigDecimal("580"))
                .paymentMethodId("pm-001").paymentMethodName("Cash").status("COMPLETED")
                .staffId("staff-003").businessId("biz-001").createdAt(Instant.now().minusSeconds(10800))
                .ledgerLines(List.of(
                        TransactionLine.builder().id("tl-001").transactionId("pay-001").lineType(LineType.ORDER_ITEM)
                                .description("Order subtotal for ORD-004").amount(new BigDecimal("22000"))
                                .referenceId("order-004").createdAt(now).build(),
                        TransactionLine.builder().id("tl-002").transactionId("pay-001").lineType(LineType.TAX_PPN)
                                .description("PPN 11%").amount(new BigDecimal("2420"))
                                .referenceId("order-004").createdAt(now).build()
                )).build());

        // pay-002: amount 73260 = subtotal 66000 + tax 7260
        payments.put("pay-002", Payment.builder().id("pay-002").orderId("order-001").orderNumber("ORD-001")
                .amount(new BigDecimal("73260")).amountPaid(new BigDecimal("73260")).change(BigDecimal.ZERO)
                .paymentMethodId("pm-003").paymentMethodName("GoPay").status("COMPLETED")
                .staffId("staff-003").businessId("biz-001").createdAt(Instant.now().minusSeconds(3600))
                .ledgerLines(List.of(
                        TransactionLine.builder().id("tl-003").transactionId("pay-002").lineType(LineType.ORDER_ITEM)
                                .description("Order subtotal for ORD-001").amount(new BigDecimal("66000"))
                                .referenceId("order-001").createdAt(now).build(),
                        TransactionLine.builder().id("tl-004").transactionId("pay-002").lineType(LineType.TAX_PPN)
                                .description("PPN 11%").amount(new BigDecimal("7260"))
                                .referenceId("order-001").createdAt(now).build()
                )).build());

        // pay-003: amount 58830 = subtotal 53000 + tax 5830
        payments.put("pay-003", Payment.builder().id("pay-003").orderId("order-002").orderNumber("ORD-002")
                .amount(new BigDecimal("58830")).amountPaid(new BigDecimal("60000")).change(new BigDecimal("1170"))
                .paymentMethodId("pm-001").paymentMethodName("Cash").status("COMPLETED")
                .staffId("staff-003").businessId("biz-001").createdAt(Instant.now().minusSeconds(1800))
                .ledgerLines(List.of(
                        TransactionLine.builder().id("tl-005").transactionId("pay-003").lineType(LineType.ORDER_ITEM)
                                .description("Order subtotal for ORD-002").amount(new BigDecimal("53000"))
                                .referenceId("order-002").createdAt(now).build(),
                        TransactionLine.builder().id("tl-006").transactionId("pay-003").lineType(LineType.TAX_PPN)
                                .description("PPN 11%").amount(new BigDecimal("5830"))
                                .referenceId("order-002").createdAt(now).build()
                )).build());

        // pay-004: amount 126540 = subtotal 114000 + tax 12540
        payments.put("pay-004", Payment.builder().id("pay-004").orderId("order-003").orderNumber("ORD-003")
                .amount(new BigDecimal("126540")).amountPaid(new BigDecimal("126540")).change(BigDecimal.ZERO)
                .paymentMethodId("pm-004").paymentMethodName("QRIS").status("COMPLETED")
                .staffId("staff-003").businessId("biz-001").createdAt(Instant.now().minusSeconds(900))
                .ledgerLines(List.of(
                        TransactionLine.builder().id("tl-007").transactionId("pay-004").lineType(LineType.ORDER_ITEM)
                                .description("Order subtotal for ORD-003").amount(new BigDecimal("114000"))
                                .referenceId("order-003").createdAt(now).build(),
                        TransactionLine.builder().id("tl-008").transactionId("pay-004").lineType(LineType.TAX_PPN)
                                .description("PPN 11%").amount(new BigDecimal("12540"))
                                .referenceId("order-003").createdAt(now).build()
                )).build());

        // pay-005: partial payment
        payments.put("pay-005", Payment.builder().id("pay-005").orderId("order-003").orderNumber("ORD-003")
                .amount(new BigDecimal("126540")).amountPaid(new BigDecimal("50000")).change(BigDecimal.ZERO)
                .paymentMethodId("pm-002").paymentMethodName("BCA Debit").status("PARTIAL")
                .staffId("staff-003").businessId("biz-001").createdAt(Instant.now().minusSeconds(600))
                .ledgerLines(List.of(
                        TransactionLine.builder().id("tl-009").transactionId("pay-005").lineType(LineType.ORDER_ITEM)
                                .description("Order subtotal for ORD-003").amount(new BigDecimal("114000"))
                                .referenceId("order-003").createdAt(now).build(),
                        TransactionLine.builder().id("tl-010").transactionId("pay-005").lineType(LineType.TAX_PPN)
                                .description("PPN 11%").amount(new BigDecimal("12540"))
                                .referenceId("order-003").createdAt(now).build()
                )).build());
    }

    @Override public Payment savePayment(Payment p) { payments.put(p.getId(), p); return p; }
    @Override public Optional<Payment> findPaymentById(String id) { return Optional.ofNullable(payments.get(id)); }
    @Override public List<Payment> findPaymentsByOrderId(String orderId) {
        return payments.values().stream().filter(p -> p.getOrderId().equals(orderId)).collect(Collectors.toList());
    }
    @Override public List<Payment> findAllPayments() { return new ArrayList<>(payments.values()); }
    @Override public List<Payment> findPaymentsByBusinessIdAndDateRange(String businessId, Instant dateFrom, Instant dateTo) {
        return payments.values().stream()
                .filter(p -> p.getBusinessId().equals(businessId))
                .filter(p -> !p.getCreatedAt().isBefore(dateFrom))
                .filter(p -> !p.getCreatedAt().isAfter(dateTo))
                .collect(Collectors.toList());
    }
    @Override public List<PaymentMethod> findAllPaymentMethods() { return new ArrayList<>(methods.values()); }
    @Override public Optional<PaymentMethod> findPaymentMethodById(String id) { return Optional.ofNullable(methods.get(id)); }
    @Override public PaymentMethod savePaymentMethod(PaymentMethod m) { methods.put(m.getId(), m); return m; }
    @Override public void deletePaymentMethodById(String id) { methods.remove(id); }
}
