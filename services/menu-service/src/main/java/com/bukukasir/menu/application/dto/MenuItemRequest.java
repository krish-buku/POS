package com.bukukasir.menu.application.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.math.BigDecimal;

@Schema(description = "Menu item request")
public record MenuItemRequest(
    @NotBlank(message = "Name is required") @Schema(example = "Nasi Goreng Spesial") String name,
    @Schema(example = "Nasi goreng dengan telur, ayam, dan sayuran") String description,
    @NotNull(message = "Price is required") @Positive @Schema(example = "25000") BigDecimal price,
    @NotBlank(message = "Category ID is required") @Schema(example = "cat-001") String categoryId,
    @Schema(example = "biz-001") String businessId,
    @Schema(description = "Image URL") String imageUrl
) {}
