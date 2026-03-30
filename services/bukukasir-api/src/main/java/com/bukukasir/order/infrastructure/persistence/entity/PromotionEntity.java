package com.bukukasir.order.infrastructure.persistence.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "promotions")
public class PromotionEntity {

    @Id
    @Column(name = "id")
    private String id;

    @Column(name = "business_id")
    private String businessId;

    @Column(name = "name")
    private String name;

    @Column(name = "description")
    private String description;

    @Column(name = "type")
    private String type;

    @Column(name = "discount_type")
    private String discountType;

    @Column(name = "discount_value")
    private BigDecimal discountValue;

    @Column(name = "max_discount")
    private BigDecimal maxDiscount;

    @Column(name = "min_order_amount")
    private BigDecimal minOrderAmount;

    @Column(name = "applicable_categories", columnDefinition = "jsonb")
    private String applicableCategories;

    @Column(name = "applicable_items", columnDefinition = "jsonb")
    private String applicableItems;

    @Column(name = "start_date")
    private LocalDate startDate;

    @Column(name = "end_date")
    private LocalDate endDate;

    @Column(name = "active_days", columnDefinition = "jsonb")
    private String activeDays;

    @Column(name = "start_time")
    private LocalTime startTime;

    @Column(name = "end_time")
    private LocalTime endTime;

    @Column(name = "stackable")
    private boolean stackable;

    @Column(name = "priority")
    private int priority;

    @Column(name = "active")
    private boolean active;
}
