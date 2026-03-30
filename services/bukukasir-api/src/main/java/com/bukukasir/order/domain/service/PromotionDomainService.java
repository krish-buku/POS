package com.bukukasir.order.domain.service;

import com.bukukasir.common.exception.ResourceNotFoundException;
import com.bukukasir.common.util.IdGenerator;
import com.bukukasir.order.domain.model.AppliedPromotion;
import com.bukukasir.order.domain.model.OrderItemInfo;
import com.bukukasir.order.domain.model.Promotion;
import com.bukukasir.order.domain.port.in.PromotionUseCase;
import com.bukukasir.order.domain.port.out.PromotionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class PromotionDomainService implements PromotionUseCase {

    private final PromotionRepository promotionRepository;
    private final PromotionEngine promotionEngine;

    @Override
    public List<Promotion> getPromotions(String businessId) {
        return promotionRepository.findByBusinessId(businessId);
    }

    @Override
    public List<Promotion> getActivePromotions(String businessId) {
        LocalDateTime now = LocalDateTime.now();
        return promotionRepository.findByBusinessId(businessId).stream()
                .filter(p -> promotionEngine.isPromotionActive(p, now))
                .toList();
    }

    @Override
    public Promotion createPromotion(Promotion promotion) {
        promotion.setId(IdGenerator.generateId());
        promotion.setActive(true);
        return promotionRepository.save(promotion);
    }

    @Override
    public Promotion updatePromotion(String id, Promotion promotion) {
        Promotion existing = promotionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Promotion", "id", id));
        existing.setName(promotion.getName());
        existing.setDescription(promotion.getDescription());
        existing.setType(promotion.getType());
        existing.setDiscountType(promotion.getDiscountType());
        existing.setDiscountValue(promotion.getDiscountValue());
        existing.setMaxDiscount(promotion.getMaxDiscount());
        existing.setMinOrderAmount(promotion.getMinOrderAmount());
        existing.setApplicableCategories(promotion.getApplicableCategories());
        existing.setApplicableItems(promotion.getApplicableItems());
        existing.setStartDate(promotion.getStartDate());
        existing.setEndDate(promotion.getEndDate());
        existing.setActiveDays(promotion.getActiveDays());
        existing.setStartTime(promotion.getStartTime());
        existing.setEndTime(promotion.getEndTime());
        existing.setStackable(promotion.isStackable());
        existing.setPriority(promotion.getPriority());
        existing.setActive(promotion.isActive());
        return promotionRepository.save(existing);
    }

    @Override
    public void deletePromotion(String id) {
        promotionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Promotion", "id", id));
        promotionRepository.deleteById(id);
    }

    @Override
    public List<AppliedPromotion> calculatePromotions(String businessId, BigDecimal subtotal, List<OrderItemInfo> items) {
        List<Promotion> promos = promotionRepository.findByBusinessId(businessId);
        return promotionEngine.calculatePromotions(promos, subtotal, items, LocalDateTime.now());
    }
}
