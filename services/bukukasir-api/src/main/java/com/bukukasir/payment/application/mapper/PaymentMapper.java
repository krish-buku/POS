package com.bukukasir.payment.application.mapper;

import com.bukukasir.payment.application.dto.PaymentMethodRequest;
import com.bukukasir.payment.application.dto.PaymentRequest;
import com.bukukasir.payment.domain.model.Payment;
import com.bukukasir.payment.domain.model.PaymentMethod;
import org.springframework.stereotype.Component;

@Component
public class PaymentMapper {
    public Payment toDomain(PaymentRequest r) {
        return Payment.builder().orderId(r.orderId()).orderNumber(r.orderNumber())
                .amount(r.amount()).amountPaid(r.amountPaid())
                .paymentMethodId(r.paymentMethodId()).paymentMethodName(r.paymentMethodName())
                .staffId(r.staffId()).businessId(r.businessId()).build();
    }
    public PaymentMethod toDomain(PaymentMethodRequest r) {
        return PaymentMethod.builder().name(r.name()).type(r.type()).active(r.active()).businessId(r.businessId()).build();
    }
}
