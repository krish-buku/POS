package com.bukukasir.order.domain.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TaxConfig {
    private String id;
    private String businessId;
    private String name;          // "PPN", "PB1 Service Charge"
    private BigDecimal rate;      // 0.11 for 11%, 0.05 for 5%
    private boolean inclusive;    // true = price includes tax, false = added on top
    private boolean active;
    private int priority;         // calculation order
}
