package com.bukukasir.order.domain.port.in;

import com.bukukasir.order.domain.model.AppliedPromotion;
import com.bukukasir.order.domain.model.OrderItemInfo;
import com.bukukasir.order.domain.model.Promotion;

import java.math.BigDecimal;
import java.util.List;

public interface PromotionUseCase {
    List<Promotion> getPromotions(String businessId);
    List<Promotion> getActivePromotions(String businessId);
    Promotion createPromotion(Promotion promotion);
    Promotion updatePromotion(String id, Promotion promotion);
    void deletePromotion(String id);
    List<AppliedPromotion> calculatePromotions(String businessId, BigDecimal subtotal, List<OrderItemInfo> items);
}
