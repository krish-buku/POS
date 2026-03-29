package com.bukukasir.order.domain.service;

import com.bukukasir.order.domain.model.*;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.DayOfWeek;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

@Component
public class PromotionEngine {

    /**
     * Check if a promotion is currently valid (date, day, time).
     */
    public boolean isPromotionActive(Promotion promo, LocalDateTime now) {
        if (!promo.isActive()) {
            return false;
        }

        // Check date range
        if (promo.getStartDate() != null && now.toLocalDate().isBefore(promo.getStartDate())) {
            return false;
        }
        if (promo.getEndDate() != null && now.toLocalDate().isAfter(promo.getEndDate())) {
            return false;
        }

        // Check day of week
        if (promo.getActiveDays() != null && !promo.getActiveDays().isEmpty()) {
            DayOfWeek currentDay = now.getDayOfWeek();
            if (!promo.getActiveDays().contains(currentDay)) {
                return false;
            }
        }

        // Check time of day
        if (promo.getStartTime() != null && now.toLocalTime().isBefore(promo.getStartTime())) {
            return false;
        }
        if (promo.getEndTime() != null && now.toLocalTime().isAfter(promo.getEndTime())) {
            return false;
        }

        return true;
    }

    /**
     * Calculate applicable promotions for an order.
     */
    public List<AppliedPromotion> calculatePromotions(
            List<Promotion> availablePromotions,
            BigDecimal subtotal,
            List<OrderItemInfo> items,
            LocalDateTime orderTime
    ) {
        List<AppliedPromotion> results = new ArrayList<>();

        // Filter active promotions and sort by priority (lower = first)
        List<Promotion> activePromos = availablePromotions.stream()
                .filter(p -> isPromotionActive(p, orderTime))
                .sorted(Comparator.comparingInt(Promotion::getPriority))
                .toList();

        for (Promotion promo : activePromos) {
            // Check minOrderAmount
            if (promo.getMinOrderAmount() != null && subtotal.compareTo(promo.getMinOrderAmount()) < 0) {
                continue;
            }

            BigDecimal discountAmount = BigDecimal.ZERO;
            String appliedTo;

            if (promo.getType() == PromotionType.ITEM_DISCOUNT) {
                appliedTo = "ITEM";
                discountAmount = calculateItemDiscount(promo, items);
            } else {
                // ORDER_DISCOUNT or BUY_X_GET_Y treated as order-level
                appliedTo = "ORDER";
                discountAmount = calculateOrderDiscount(promo, subtotal);
            }

            // Apply maxDiscount cap
            if (promo.getMaxDiscount() != null && discountAmount.compareTo(promo.getMaxDiscount()) > 0) {
                discountAmount = promo.getMaxDiscount();
            }

            if (discountAmount.compareTo(BigDecimal.ZERO) > 0) {
                results.add(AppliedPromotion.builder()
                        .promotionId(promo.getId())
                        .promotionName(promo.getName())
                        .discountAmount(discountAmount)
                        .appliedTo(appliedTo)
                        .build());

                // If not stackable, stop after first applied promotion
                if (!promo.isStackable()) {
                    break;
                }
            }
        }

        return results;
    }

    private BigDecimal calculateOrderDiscount(Promotion promo, BigDecimal subtotal) {
        if (promo.getDiscountType() == DiscountType.PERCENTAGE) {
            return subtotal.multiply(promo.getDiscountValue())
                    .divide(BigDecimal.valueOf(100), 0, RoundingMode.HALF_UP);
        } else {
            // FIXED_AMOUNT - discount cannot exceed subtotal
            return promo.getDiscountValue().min(subtotal);
        }
    }

    private BigDecimal calculateItemDiscount(Promotion promo, List<OrderItemInfo> items) {
        BigDecimal totalDiscount = BigDecimal.ZERO;

        for (OrderItemInfo item : items) {
            if (!isItemApplicable(promo, item)) {
                continue;
            }
            BigDecimal itemTotal = item.getPrice().multiply(BigDecimal.valueOf(item.getQuantity()));

            BigDecimal discount;
            if (promo.getDiscountType() == DiscountType.PERCENTAGE) {
                discount = itemTotal.multiply(promo.getDiscountValue())
                        .divide(BigDecimal.valueOf(100), 0, RoundingMode.HALF_UP);
            } else {
                // FIXED_AMOUNT per item unit
                discount = promo.getDiscountValue().multiply(BigDecimal.valueOf(item.getQuantity()));
                discount = discount.min(itemTotal);
            }
            totalDiscount = totalDiscount.add(discount);
        }

        return totalDiscount;
    }

    private boolean isItemApplicable(Promotion promo, OrderItemInfo item) {
        boolean categoryMatch = promo.getApplicableCategories() == null
                || promo.getApplicableCategories().isEmpty()
                || (item.getCategoryId() != null && promo.getApplicableCategories().contains(item.getCategoryId()));

        boolean itemMatch = promo.getApplicableItems() == null
                || promo.getApplicableItems().isEmpty()
                || (item.getItemId() != null && promo.getApplicableItems().contains(item.getItemId()));

        // If both lists are specified, item must match at least one
        if (promo.getApplicableCategories() != null && !promo.getApplicableCategories().isEmpty()
                && promo.getApplicableItems() != null && !promo.getApplicableItems().isEmpty()) {
            return categoryMatch || itemMatch;
        }

        return categoryMatch && itemMatch;
    }
}
