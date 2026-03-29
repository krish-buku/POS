package com.bukukasir.report.domain.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PaymentMethodBreakdown {
    private String paymentMethod;
    private BigDecimal totalAmount;
    private int transactionCount;
    private double percentage;
}
