package com.bukukasir.payment.domain.port.out;

import com.bukukasir.payment.domain.model.Payment;
import com.bukukasir.payment.domain.model.PaymentMethod;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

public interface PaymentRepository {
    Payment savePayment(Payment payment);
    Optional<Payment> findPaymentById(String id);
    List<Payment> findPaymentsByOrderId(String orderId);
    List<Payment> findAllPayments();
    List<Payment> findPaymentsByBusinessIdAndDateRange(String businessId, Instant dateFrom, Instant dateTo);
    List<PaymentMethod> findAllPaymentMethods();
    Optional<PaymentMethod> findPaymentMethodById(String id);
    PaymentMethod savePaymentMethod(PaymentMethod method);
    void deletePaymentMethodById(String id);
}
