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
public class AppliedPromotion {
    private String promotionId;
    private String promotionName;
    private BigDecimal discountAmount;
    private String appliedTo; // "ITEM" or "ORDER"
}
