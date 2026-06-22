package com.bukukasir.payment.domain.service;

import com.bukukasir.common.audit.AuditAction;
import com.bukukasir.common.audit.AuditLog;
import com.bukukasir.common.audit.AuditLogger;
import com.bukukasir.common.exception.BusinessException;
import com.bukukasir.common.exception.ResourceNotFoundException;
import com.bukukasir.common.util.IdGenerator;
import com.bukukasir.payment.domain.model.Payment;
import com.bukukasir.payment.domain.model.PaymentMethod;
import com.bukukasir.payment.domain.model.TransactionLine;
import com.bukukasir.payment.domain.port.in.PaymentUseCase;
import com.bukukasir.payment.domain.port.out.PaymentRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class PaymentDomainService implements PaymentUseCase {

    private final PaymentRepository paymentRepository;
    private final LedgerLineGenerator ledgerLineGenerator;
    private final AuditLogger auditLogger;
    private final RestTemplate restTemplate = new RestTemplate();

    @Override
    public Payment createPayment(Payment payment) {
        payment.setId(IdGenerator.generateId());
        payment.setCreatedAt(Instant.now());
        payment.setChange(payment.getAmountPaid().subtract(payment.getAmount()));
        if (payment.getChange().signum() < 0) {
            payment.setStatus("PARTIAL");
            payment.setChange(BigDecimal.ZERO);
        } else {
            payment.setStatus("COMPLETED");
        }
        // Auto-generate ledger lines
        List<TransactionLine> ledgerLines = ledgerLineGenerator.generateLedgerLines(payment);
        payment.setLedgerLines(ledgerLines);
        Payment saved = paymentRepository.savePayment(payment);

        if ("COMPLETED".equals(saved.getStatus()) && saved.getOrderId() != null && !saved.getOrderId().isBlank()) {
            try {
                restTemplate.postForObject(
                        "http://localhost:8086/api/orders/{orderId}/paid",
                        Map.of("paymentMethodName", saved.getPaymentMethodName()),
                        Object.class,
                        saved.getOrderId());
            } catch (Exception e) {
                log.warn("Payment {} was recorded, but order {} could not be marked paid: {}", saved.getId(), saved.getOrderId(), e.getMessage());
            }
        }

        Map<String, Object> newValues = new LinkedHashMap<>();
        newValues.put("orderId", saved.getOrderId());
        newValues.put("amount", saved.getAmount());
        newValues.put("amountPaid", saved.getAmountPaid());
        newValues.put("change", saved.getChange());
        newValues.put("paymentMethod", saved.getPaymentMethodName());
        newValues.put("status", saved.getStatus());

        auditLogger.log(AuditLog.builder()
                .actorId("staff-001").actorName("System")
                .businessId(saved.getBusinessId())
                .action(AuditAction.CREATE)
                .entityType("Payment").entityId(saved.getId())
                .description("Recorded payment for order " + saved.getOrderNumber() + " via " + saved.getPaymentMethodName())
                .newValues(newValues)
                .timestamp(LocalDateTime.now())
                .build());

        return saved;
    }

    @Override
    public Payment getPaymentById(String id) {
        return paymentRepository.findPaymentById(id).orElseThrow(() -> new ResourceNotFoundException("Payment", "id", id));
    }

    @Override
    public List<Payment> getPayments(String businessId) {
        return paymentRepository.findAllPayments().stream()
                .filter(payment -> businessId == null || businessId.isBlank() || businessId.equals(payment.getBusinessId()))
                .toList();
    }

    @Override
    public List<Payment> getPaymentsByOrderId(String orderId) {
        return paymentRepository.findPaymentsByOrderId(orderId);
    }

    @Override
    public List<PaymentMethod> getPaymentMethods(String businessId) {
        return paymentRepository.findAllPaymentMethods().stream()
                .filter(method -> businessId == null || businessId.isBlank() || businessId.equals(method.getBusinessId()))
                .toList();
    }

    @Override
    public PaymentMethod createPaymentMethod(PaymentMethod method) {
        method.setId(IdGenerator.generateId());
        method.setActive(true);
        PaymentMethod saved = paymentRepository.savePaymentMethod(method);

        auditLogger.log(AuditLog.builder()
                .actorId("staff-001").actorName("System")
                .businessId(saved.getBusinessId())
                .action(AuditAction.CREATE)
                .entityType("PaymentMethod").entityId(saved.getId())
                .description("Created payment method: " + saved.getName() + " (" + saved.getType() + ")")
                .newValues(paymentMethodToMap(saved))
                .timestamp(LocalDateTime.now())
                .build());

        return saved;
    }

    @Override
    public PaymentMethod updatePaymentMethod(String id, PaymentMethod method) {
        PaymentMethod existing = paymentRepository.findPaymentMethodById(id)
                .orElseThrow(() -> new ResourceNotFoundException("PaymentMethod", "id", id));
        Map<String, Object> oldValues = paymentMethodToMap(existing);

        existing.setName(method.getName());
        existing.setType(method.getType());
        existing.setActive(method.isActive());
        PaymentMethod saved = paymentRepository.savePaymentMethod(existing);

        auditLogger.log(AuditLog.builder()
                .actorId("staff-001").actorName("System")
                .businessId(saved.getBusinessId())
                .action(AuditAction.UPDATE)
                .entityType("PaymentMethod").entityId(saved.getId())
                .description("Updated payment method: " + saved.getName())
                .oldValues(oldValues)
                .newValues(paymentMethodToMap(saved))
                .timestamp(LocalDateTime.now())
                .build());

        return saved;
    }

    @Override
    public void deletePaymentMethod(String id) {
        PaymentMethod existing = paymentRepository.findPaymentMethodById(id)
                .orElseThrow(() -> new ResourceNotFoundException("PaymentMethod", "id", id));

        auditLogger.log(AuditLog.builder()
                .actorId("staff-001").actorName("System")
                .businessId(existing.getBusinessId())
                .action(AuditAction.DELETE)
                .entityType("PaymentMethod").entityId(id)
                .description("Deleted payment method: " + existing.getName())
                .oldValues(paymentMethodToMap(existing))
                .timestamp(LocalDateTime.now())
                .build());

        paymentRepository.deletePaymentMethodById(id);
    }

    private Map<String, Object> paymentMethodToMap(PaymentMethod method) {
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("name", method.getName());
        map.put("type", method.getType());
        map.put("active", method.isActive());
        return map;
    }

    @Override
    public List<TransactionLine> getLedgerLines(String paymentId) {
        Payment payment = getPaymentById(paymentId);
        return payment.getLedgerLines() != null ? payment.getLedgerLines() : List.of();
    }

    @Override
    public List<TransactionLine> queryLedgerLines(String businessId, Instant dateFrom, Instant dateTo) {
        List<Payment> payments = paymentRepository.findPaymentsByBusinessIdAndDateRange(businessId, dateFrom, dateTo);
        return payments.stream()
                .filter(p -> p.getLedgerLines() != null)
                .flatMap(p -> p.getLedgerLines().stream())
                .collect(Collectors.toList());
    }

    @Override
    public Payment voidPayment(String paymentId) {
        Payment payment = getPaymentById(paymentId);
        if ("VOIDED".equals(payment.getStatus())) {
            throw new BusinessException("PAYMENT_ALREADY_VOIDED", "Payment sudah divoid");
        }
        // Generate void reversal lines
        List<TransactionLine> reversalLines = ledgerLineGenerator.generateVoidReversalLines(payment);
        if (payment.getLedgerLines() == null) {
            payment.setLedgerLines(new ArrayList<>());
        }
        payment.getLedgerLines().addAll(reversalLines);
        payment.setStatus("VOIDED");
        return paymentRepository.savePayment(payment);
    }
}
