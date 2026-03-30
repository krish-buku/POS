package com.bukukasir.events;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;

import java.math.BigDecimal;

@Data
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true)
public class PaymentEvent extends BaseEvent {

    public enum Type {
        PAYMENT_RECORDED, PAYMENT_PARTIAL, PAYMENT_REFUNDED
    }

    private String paymentId;
    private String orderId;
    private BigDecimal amount;
    private String paymentMethod;
    private Type type;
}
