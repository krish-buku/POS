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
public class TaxCalculation {
    private String taxConfigId;
    private String taxName;
    private BigDecimal rate;
    private boolean inclusive;
    private BigDecimal taxableAmount;
    private BigDecimal taxAmount;
}
