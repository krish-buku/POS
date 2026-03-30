package com.bukukasir.payment.domain.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PaymentSplit {
    private String id;
    private String paymentMethodId;
    private String paymentMethodName;
    private BigDecimal amount;
}
