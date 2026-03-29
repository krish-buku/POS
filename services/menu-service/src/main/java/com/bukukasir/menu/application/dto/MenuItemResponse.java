package com.bukukasir.menu.application.dto;

import com.bukukasir.menu.domain.model.ModifierGroup;
import com.bukukasir.menu.domain.model.Variant;
import io.swagger.v3.oas.annotations.media.Schema;

import java.math.BigDecimal;
import java.util.List;

@Schema(description = "Menu item response")
public record MenuItemResponse(
    String id, String name, String description, BigDecimal price,
    String categoryId, String businessId, String imageUrl, boolean available,
    List<Variant> variants, List<ModifierGroup> modifierGroups
) {}
