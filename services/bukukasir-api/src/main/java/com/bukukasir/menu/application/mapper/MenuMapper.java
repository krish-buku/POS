package com.bukukasir.menu.application.mapper;

import com.bukukasir.menu.application.dto.MenuItemRequest;
import com.bukukasir.menu.application.dto.MenuItemResponse;
import com.bukukasir.menu.application.dto.CategoryRequest;
import com.bukukasir.menu.domain.model.Category;
import com.bukukasir.menu.domain.model.MenuItem;
import org.springframework.stereotype.Component;

@Component
public class MenuMapper {

    public MenuItemResponse toResponse(MenuItem item) {
        return new MenuItemResponse(item.getId(), item.getName(), item.getDescription(),
                item.getPrice(), item.getCategoryId(), item.getBusinessId(), item.getImageUrl(),
                item.isAvailable(), item.getVariants(), item.getModifierGroups());
    }

    public MenuItem toDomain(MenuItemRequest request) {
        return MenuItem.builder()
                .name(request.name()).description(request.description())
                .price(request.price()).categoryId(request.categoryId())
                .businessId(request.businessId()).imageUrl(request.imageUrl())
                .build();
    }

    public Category toDomain(CategoryRequest request) {
        return Category.builder()
                .name(request.name()).description(request.description())
                .businessId(request.businessId()).sortOrder(request.sortOrder())
                .build();
    }
}
