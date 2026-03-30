package com.bukukasir.payment.domain.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Payment {
    private String id;
    private String orderId;
    private String orderNumber;
    private BigDecimal amount;
    private BigDecimal amountPaid;
    private BigDecimal change;
    private String paymentMethodId;
    private String paymentMethodName;
    private String status; // COMPLETED, PARTIAL, REFUNDED
    private String staffId;
    private String businessId;
    private List<PaymentSplit> splits;
    private List<TransactionLine> ledgerLines;
    private Instant createdAt;
}
