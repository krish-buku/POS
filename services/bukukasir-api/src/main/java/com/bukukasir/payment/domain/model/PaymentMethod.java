package com.bukukasir.payment.domain.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PaymentMethod {
    private String id;
    private String name;
    private String type; // CASH, CARD, EWALLET, QRIS
    private boolean active;
    private String businessId;
}
