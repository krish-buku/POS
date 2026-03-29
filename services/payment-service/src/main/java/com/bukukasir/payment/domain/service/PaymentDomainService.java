package com.bukukasir.payment.domain.service;

import com.bukukasir.common.exception.ResourceNotFoundException;
import com.bukukasir.common.util.IdGenerator;
import com.bukukasir.payment.domain.model.Payment;
import com.bukukasir.payment.domain.model.PaymentMethod;
import com.bukukasir.payment.domain.port.in.PaymentUseCase;
import com.bukukasir.payment.domain.port.out.PaymentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;

@Service
@RequiredArgsConstructor
public class PaymentDomainService implements PaymentUseCase {

    private final PaymentRepository paymentRepository;

    @Override
    public Payment createPayment(Payment payment) {
        payment.setId(IdGenerator.generateId());
        payment.setCreatedAt(Instant.now());
        payment.setChange(payment.getAmountPaid().subtract(payment.getAmount()));
        if (payment.getChange().signum() < 0) {
            payment.setStatus("PARTIAL");
            payment.setChange(java.math.BigDecimal.ZERO);
        } else {
            payment.setStatus("COMPLETED");
        }
        return paymentRepository.savePayment(payment);
    }

    @Override
    public Payment getPaymentById(String id) {
        return paymentRepository.findPaymentById(id).orElseThrow(() -> new ResourceNotFoundException("Payment", "id", id));
    }

    @Override
    public List<Payment> getPaymentsByOrderId(String orderId) {
        return paymentRepository.findPaymentsByOrderId(orderId);
    }

    @Override
    public List<PaymentMethod> getPaymentMethods(String businessId) {
        return paymentRepository.findAllPaymentMethods();
    }

    @Override
    public PaymentMethod createPaymentMethod(PaymentMethod method) {
        method.setId(IdGenerator.generateId());
        method.setActive(true);
        return paymentRepository.savePaymentMethod(method);
    }

    @Override
    public PaymentMethod updatePaymentMethod(String id, PaymentMethod method) {
        PaymentMethod existing = paymentRepository.findPaymentMethodById(id)
                .orElseThrow(() -> new ResourceNotFoundException("PaymentMethod", "id", id));
        existing.setName(method.getName());
        existing.setType(method.getType());
        existing.setActive(method.isActive());
        return paymentRepository.savePaymentMethod(existing);
    }

    @Override
    public void deletePaymentMethod(String id) {
        paymentRepository.findPaymentMethodById(id).orElseThrow(() -> new ResourceNotFoundException("PaymentMethod", "id", id));
        paymentRepository.deletePaymentMethodById(id);
    }
}
