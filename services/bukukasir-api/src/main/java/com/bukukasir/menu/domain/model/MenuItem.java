package com.bukukasir.menu.domain.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MenuItem {
    private String id;
    private String name;
    private String description;
    private BigDecimal price;
    private String categoryId;
    private String businessId;
    private String imageUrl;
    private boolean available;
    private List<Variant> variants;
    private List<ModifierGroup> modifierGroups;
}
