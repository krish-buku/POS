package com.bukukasir.payment.infrastructure.persistence.adapter;

import com.bukukasir.payment.domain.model.Payment;
import com.bukukasir.payment.domain.model.PaymentMethod;
import com.bukukasir.payment.domain.port.out.PaymentRepository;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.Instant;
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

        payments.put("pay-001", Payment.builder().id("pay-001").orderId("order-004").orderNumber("ORD-004").amount(new BigDecimal("24420")).amountPaid(new BigDecimal("25000")).change(new BigDecimal("580")).paymentMethodId("pm-001").paymentMethodName("Cash").status("COMPLETED").staffId("staff-003").businessId("biz-001").createdAt(Instant.now().minusSeconds(10800)).build());
        payments.put("pay-002", Payment.builder().id("pay-002").orderId("order-001").orderNumber("ORD-001").amount(new BigDecimal("73260")).amountPaid(new BigDecimal("73260")).change(BigDecimal.ZERO).paymentMethodId("pm-003").paymentMethodName("GoPay").status("COMPLETED").staffId("staff-003").businessId("biz-001").createdAt(Instant.now().minusSeconds(3600)).build());
        payments.put("pay-003", Payment.builder().id("pay-003").orderId("order-002").orderNumber("ORD-002").amount(new BigDecimal("58830")).amountPaid(new BigDecimal("60000")).change(new BigDecimal("1170")).paymentMethodId("pm-001").paymentMethodName("Cash").status("COMPLETED").staffId("staff-003").businessId("biz-001").createdAt(Instant.now().minusSeconds(1800)).build());
        payments.put("pay-004", Payment.builder().id("pay-004").orderId("order-003").orderNumber("ORD-003").amount(new BigDecimal("126540")).amountPaid(new BigDecimal("126540")).change(BigDecimal.ZERO).paymentMethodId("pm-004").paymentMethodName("QRIS").status("COMPLETED").staffId("staff-003").businessId("biz-001").createdAt(Instant.now().minusSeconds(900)).build());
        payments.put("pay-005", Payment.builder().id("pay-005").orderId("order-003").orderNumber("ORD-003").amount(new BigDecimal("126540")).amountPaid(new BigDecimal("50000")).change(BigDecimal.ZERO).paymentMethodId("pm-002").paymentMethodName("BCA Debit").status("PARTIAL").staffId("staff-003").businessId("biz-001").createdAt(Instant.now().minusSeconds(600)).build());
    }

    @Override public Payment savePayment(Payment p) { payments.put(p.getId(), p); return p; }
    @Override public Optional<Payment> findPaymentById(String id) { return Optional.ofNullable(payments.get(id)); }
    @Override public List<Payment> findPaymentsByOrderId(String orderId) {
        return payments.values().stream().filter(p -> p.getOrderId().equals(orderId)).collect(Collectors.toList());
    }
    @Override public List<Payment> findAllPayments() { return new ArrayList<>(payments.values()); }
    @Override public List<PaymentMethod> findAllPaymentMethods() { return new ArrayList<>(methods.values()); }
    @Override public Optional<PaymentMethod> findPaymentMethodById(String id) { return Optional.ofNullable(methods.get(id)); }
    @Override public PaymentMethod savePaymentMethod(PaymentMethod m) { methods.put(m.getId(), m); return m; }
    @Override public void deletePaymentMethodById(String id) { methods.remove(id); }
}
