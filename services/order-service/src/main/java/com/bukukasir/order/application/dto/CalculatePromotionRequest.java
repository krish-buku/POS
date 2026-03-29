package com.bukukasir.order.application.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.util.List;

@Schema(description = "Request to calculate applicable promotions for given items")
public record CalculatePromotionRequest(
    @NotBlank @Schema(example = "biz-001") String businessId,
    @NotNull @Schema(example = "100000") BigDecimal subtotal,
    @NotNull List<OrderItemInfoRequest> items
) {
    @Schema(description = "Order item info for promotion calculation")
    public record OrderItemInfoRequest(
        @NotBlank @Schema(example = "menu-001") String itemId,
        @Schema(example = "cat-001") String categoryId,
        @Schema(example = "2") int quantity,
        @NotNull @Schema(example = "25000") BigDecimal price
    ) {}
}
