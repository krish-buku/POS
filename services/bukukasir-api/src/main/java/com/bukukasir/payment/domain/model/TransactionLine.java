package com.bukukasir.payment.domain.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TransactionLine {
    private String id;
    private String transactionId;  // links to Payment
    private LineType lineType;     // enum
    private String description;
    private BigDecimal amount;     // positive for charges, negative for discounts/reversals
    private String referenceId;    // e.g., order item ID, discount reason
    private LocalDateTime createdAt;
}
