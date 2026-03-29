package com.bukukasir.payment.domain.port.in;

import com.bukukasir.payment.domain.model.Payment;
import com.bukukasir.payment.domain.model.PaymentMethod;
import com.bukukasir.payment.domain.model.TransactionLine;

import java.time.Instant;
import java.util.List;

public interface PaymentUseCase {
    Payment createPayment(Payment payment);
    Payment getPaymentById(String id);
    List<Payment> getPaymentsByOrderId(String orderId);
    List<PaymentMethod> getPaymentMethods(String businessId);
    PaymentMethod createPaymentMethod(PaymentMethod method);
    PaymentMethod updatePaymentMethod(String id, PaymentMethod method);
    void deletePaymentMethod(String id);
    List<TransactionLine> getLedgerLines(String paymentId);
    List<TransactionLine> queryLedgerLines(String businessId, Instant dateFrom, Instant dateTo);
    Payment voidPayment(String paymentId);
}
