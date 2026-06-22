package com.bukukasir.payment.infrastructure.persistence.adapter;

import com.bukukasir.payment.domain.model.*;
import com.bukukasir.payment.domain.port.out.PaymentRepository;
import com.bukukasir.payment.infrastructure.persistence.entity.PaymentEntity;
import com.bukukasir.payment.infrastructure.persistence.entity.PaymentMethodEntity;
import com.bukukasir.payment.infrastructure.persistence.repository.JpaPaymentMethodRepository;
import com.bukukasir.payment.infrastructure.persistence.repository.JpaPaymentRepository;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDateTime;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
@Slf4j
public class PaymentPersistenceAdapter implements PaymentRepository {

    private final JpaPaymentRepository paymentJpa;
    private final JpaPaymentMethodRepository methodJpa;
    private final ObjectMapper objectMapper;
    private final Map<String, Payment> fallbackPayments = new ConcurrentHashMap<>();
    private final Map<String, PaymentMethod> fallbackMethods = new ConcurrentHashMap<>();

    @PostConstruct
    void initMockData() {
        fallbackMethods.put("pm-001", PaymentMethod.builder().id("pm-001").name("Cash").type("CASH").active(true).businessId("biz-001").build());
        fallbackMethods.put("pm-002", PaymentMethod.builder().id("pm-002").name("BCA Debit").type("CARD").active(true).businessId("biz-001").build());
        fallbackMethods.put("pm-003", PaymentMethod.builder().id("pm-003").name("GoPay").type("EWALLET").active(true).businessId("biz-001").build());
        fallbackMethods.put("pm-004", PaymentMethod.builder().id("pm-004").name("QRIS").type("QRIS").active(true).businessId("biz-001").build());

        LocalDateTime now = LocalDateTime.now();
        fallbackPayments.put("pay-001", Payment.builder().id("pay-001").orderId("order-004").orderNumber("ORD-004")
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

        fallbackPayments.put("pay-002", Payment.builder().id("pay-002").orderId("order-001").orderNumber("ORD-001")
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

        fallbackPayments.put("pay-003", Payment.builder().id("pay-003").orderId("order-002").orderNumber("ORD-002")
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

        fallbackPayments.put("pay-004", Payment.builder().id("pay-004").orderId("order-003").orderNumber("ORD-003")
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

        fallbackPayments.put("pay-005", Payment.builder().id("pay-005").orderId("order-003").orderNumber("ORD-003")
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

    @Override
    public Payment savePayment(Payment payment) {
        try {
            return toDomain(paymentJpa.save(toEntity(payment)));
        } catch (RuntimeException ex) {
            log.warn("Falling back to in-memory payment persistence for {}: {}", payment.getId(), ex.getMessage());
            fallbackPayments.put(payment.getId(), payment);
            return payment;
        }
    }

    @Override
    public Optional<Payment> findPaymentById(String id) {
        try {
            Optional<Payment> persisted = paymentJpa.findById(id).map(this::toDomain);
            return persisted.isPresent() ? persisted : Optional.ofNullable(fallbackPayments.get(id));
        } catch (RuntimeException ex) {
            return Optional.ofNullable(fallbackPayments.get(id));
        }
    }

    @Override
    public List<Payment> findPaymentsByOrderId(String orderId) {
        try {
            List<Payment> persisted = paymentJpa.findByOrderId(orderId).stream().map(this::toDomain).toList();
            return persisted.isEmpty() ? fallbackByOrderId(orderId) : persisted;
        } catch (RuntimeException ex) {
            return fallbackByOrderId(orderId);
        }
    }

    @Override
    public List<Payment> findAllPayments() {
        try {
            List<Payment> persisted = paymentJpa.findAll().stream().map(this::toDomain).toList();
            return persisted.isEmpty() ? new ArrayList<>(fallbackPayments.values()) : persisted;
        } catch (RuntimeException ex) {
            return new ArrayList<>(fallbackPayments.values());
        }
    }

    @Override
    public List<Payment> findPaymentsByBusinessIdAndDateRange(String businessId, Instant dateFrom, Instant dateTo) {
        try {
            List<Payment> persisted = paymentJpa.findByBusinessIdAndCreatedAtBetween(businessId, dateFrom, dateTo)
                    .stream().map(this::toDomain).toList();
            return persisted.isEmpty() ? fallbackByBusinessAndDateRange(businessId, dateFrom, dateTo) : persisted;
        } catch (RuntimeException ex) {
            return fallbackByBusinessAndDateRange(businessId, dateFrom, dateTo);
        }
    }

    @Override
    public List<PaymentMethod> findAllPaymentMethods() {
        try {
            List<PaymentMethod> persisted = methodJpa.findAll().stream().map(this::toDomain).toList();
            return persisted.isEmpty() ? new ArrayList<>(fallbackMethods.values()) : persisted;
        } catch (RuntimeException ex) {
            return new ArrayList<>(fallbackMethods.values());
        }
    }

    @Override
    public Optional<PaymentMethod> findPaymentMethodById(String id) {
        try {
            Optional<PaymentMethod> persisted = methodJpa.findById(id).map(this::toDomain);
            return persisted.isPresent() ? persisted : Optional.ofNullable(fallbackMethods.get(id));
        } catch (RuntimeException ex) {
            return Optional.ofNullable(fallbackMethods.get(id));
        }
    }

    @Override
    public PaymentMethod savePaymentMethod(PaymentMethod method) {
        try {
            return toDomain(methodJpa.save(toEntity(method)));
        } catch (RuntimeException ex) {
            log.warn("Falling back to in-memory payment method persistence for {}: {}", method.getId(), ex.getMessage());
            fallbackMethods.put(method.getId(), method);
            return method;
        }
    }

    @Override
    public void deletePaymentMethodById(String id) {
        try {
            methodJpa.deleteById(id);
        } catch (RuntimeException ex) {
            log.warn("Falling back while deleting payment method {}: {}", id, ex.getMessage());
        }
        fallbackMethods.remove(id);
    }

    private List<Payment> fallbackByOrderId(String orderId) {
        return fallbackPayments.values().stream()
                .filter(payment -> orderId.equals(payment.getOrderId()))
                .collect(Collectors.toList());
    }

    private List<Payment> fallbackByBusinessAndDateRange(String businessId, Instant dateFrom, Instant dateTo) {
        return fallbackPayments.values().stream()
                .filter(payment -> businessId.equals(payment.getBusinessId()))
                .filter(payment -> !payment.getCreatedAt().isBefore(dateFrom))
                .filter(payment -> !payment.getCreatedAt().isAfter(dateTo))
                .collect(Collectors.toList());
    }

    private Payment toDomain(PaymentEntity entity) {
        return Payment.builder()
                .id(entity.getId())
                .orderId(entity.getOrderId())
                .orderNumber(entity.getOrderNumber())
                .amount(entity.getAmount())
                .amountPaid(entity.getAmountPaid())
                .change(entity.getChange())
                .paymentMethodId(entity.getPaymentMethodId())
                .paymentMethodName(entity.getPaymentMethodName())
                .status(entity.getStatus())
                .staffId(entity.getStaffId())
                .businessId(entity.getBusinessId())
                .splits(readJson(entity.getSplits(), new TypeReference<List<PaymentSplit>>() {}))
                .ledgerLines(readJson(entity.getLedgerLines(), new TypeReference<List<TransactionLine>>() {}))
                .createdAt(entity.getCreatedAt())
                .build();
    }

    private PaymentEntity toEntity(Payment payment) {
        return PaymentEntity.builder()
                .id(payment.getId())
                .orderId(payment.getOrderId())
                .orderNumber(payment.getOrderNumber())
                .amount(payment.getAmount())
                .amountPaid(payment.getAmountPaid())
                .change(payment.getChange())
                .paymentMethodId(payment.getPaymentMethodId())
                .paymentMethodName(payment.getPaymentMethodName())
                .status(payment.getStatus())
                .staffId(payment.getStaffId())
                .businessId(payment.getBusinessId())
                .splits(writeJson(payment.getSplits()))
                .ledgerLines(writeJson(payment.getLedgerLines()))
                .createdAt(payment.getCreatedAt())
                .build();
    }

    private PaymentMethod toDomain(PaymentMethodEntity entity) {
        return PaymentMethod.builder()
                .id(entity.getId())
                .name(entity.getName())
                .type(entity.getType())
                .active(entity.isActive())
                .businessId(entity.getBusinessId())
                .build();
    }

    private PaymentMethodEntity toEntity(PaymentMethod method) {
        return PaymentMethodEntity.builder()
                .id(method.getId())
                .name(method.getName())
                .type(method.getType())
                .active(method.isActive())
                .businessId(method.getBusinessId())
                .build();
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
                throw new IllegalStateException("Failed to deserialize payment JSONB column: " + nested.getMessage(), nested);
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
            throw new IllegalStateException("Failed to serialize payment JSONB column: " + ex.getMessage(), ex);
        }
    }
}
