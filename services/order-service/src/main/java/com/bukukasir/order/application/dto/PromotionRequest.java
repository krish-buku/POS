package com.bukukasir.order.application.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@Schema(description = "Promotion create/update request")
public record PromotionRequest(
    @NotBlank @Schema(example = "biz-001") String businessId,
    @NotBlank @Schema(example = "Happy Hour") String name,
    @Schema(example = "20% off all orders during happy hour") String description,
    @NotNull @Schema(example = "ORDER_DISCOUNT") String type,
    @NotNull @Schema(example = "PERCENTAGE") String discountType,
    @NotNull @Schema(example = "20") BigDecimal discountValue,
    @Schema(example = "50000") BigDecimal maxDiscount,
    @Schema(example = "0") BigDecimal minOrderAmount,
    @Schema(description = "Category IDs (empty = all)") List<String> applicableCategories,
    @Schema(description = "Item IDs (empty = all)") List<String> applicableItems,
    @Schema(example = "2024-01-01") LocalDate startDate,
    @Schema(example = "2025-12-31") LocalDate endDate,
    @Schema(description = "Active days of week") List<DayOfWeek> activeDays,
    @Schema(example = "15:00") LocalTime startTime,
    @Schema(example = "18:00") LocalTime endTime,
    @Schema(example = "false") boolean stackable,
    @Schema(example = "1") int priority,
    @Schema(example = "true") boolean active
) {}
