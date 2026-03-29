package com.bukukasir.order.infrastructure.persistence.adapter;

import com.bukukasir.order.domain.model.DiscountType;
import com.bukukasir.order.domain.model.Promotion;
import com.bukukasir.order.domain.model.PromotionType;
import com.bukukasir.order.domain.port.out.PromotionRepository;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.DayOfWeek;
import java.time.LocalTime;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;

@Component
public class PromotionPersistenceAdapter implements PromotionRepository {

    private final Map<String, Promotion> store = new ConcurrentHashMap<>();

    public PromotionPersistenceAdapter() {
        initMockData();
    }

    private void initMockData() {
        // 1. "Happy Hour" - ORDER_DISCOUNT, 20% off, 15:00-18:00 Mon-Fri, max Rp 50,000
        store.put("promo-001", Promotion.builder()
                .id("promo-001")
                .businessId("biz-001")
                .name("Happy Hour")
                .description("20% off all orders between 15:00-18:00 on weekdays, max discount Rp 50,000")
                .type(PromotionType.ORDER_DISCOUNT)
                .discountType(DiscountType.PERCENTAGE)
                .discountValue(new BigDecimal("20"))
                .maxDiscount(new BigDecimal("50000"))
                .minOrderAmount(null)
                .applicableCategories(List.of())
                .applicableItems(List.of())
                .startDate(null)
                .endDate(null)
                .activeDays(List.of(DayOfWeek.MONDAY, DayOfWeek.TUESDAY, DayOfWeek.WEDNESDAY,
                        DayOfWeek.THURSDAY, DayOfWeek.FRIDAY))
                .startTime(LocalTime.of(15, 0))
                .endTime(LocalTime.of(18, 0))
                .stackable(false)
                .priority(1)
                .active(true)
                .build());

        // 2. "Member Diskon" - ORDER_DISCOUNT, 10% off, always active, stackable
        store.put("promo-002", Promotion.builder()
                .id("promo-002")
                .businessId("biz-001")
                .name("Member Diskon")
                .description("10% discount for members, can be combined with other promotions")
                .type(PromotionType.ORDER_DISCOUNT)
                .discountType(DiscountType.PERCENTAGE)
                .discountValue(new BigDecimal("10"))
                .maxDiscount(null)
                .minOrderAmount(null)
                .applicableCategories(List.of())
                .applicableItems(List.of())
                .startDate(null)
                .endDate(null)
                .activeDays(null)
                .startTime(null)
                .endTime(null)
                .stackable(true)
                .priority(2)
                .active(true)
                .build());

        // 3. "Promo Nasi Goreng" - ITEM_DISCOUNT, Rp 5,000 off, applicable to Nasi Goreng items only
        store.put("promo-003", Promotion.builder()
                .id("promo-003")
                .businessId("biz-001")
                .name("Promo Nasi Goreng")
                .description("Rp 5,000 off each Nasi Goreng item")
                .type(PromotionType.ITEM_DISCOUNT)
                .discountType(DiscountType.FIXED_AMOUNT)
                .discountValue(new BigDecimal("5000"))
                .maxDiscount(null)
                .minOrderAmount(null)
                .applicableCategories(List.of())
                .applicableItems(List.of("menu-001"))
                .startDate(null)
                .endDate(null)
                .activeDays(null)
                .startTime(null)
                .endTime(null)
                .stackable(true)
                .priority(3)
                .active(true)
                .build());
    }

    @Override
    public List<Promotion> findByBusinessId(String businessId) {
        return store.values().stream()
                .filter(p -> p.getBusinessId().equals(businessId))
                .sorted(Comparator.comparingInt(Promotion::getPriority))
                .collect(Collectors.toList());
    }

    @Override
    public Optional<Promotion> findById(String id) {
        return Optional.ofNullable(store.get(id));
    }

    @Override
    public Promotion save(Promotion promotion) {
        store.put(promotion.getId(), promotion);
        return promotion;
    }

    @Override
    public void deleteById(String id) {
        store.remove(id);
    }
}
