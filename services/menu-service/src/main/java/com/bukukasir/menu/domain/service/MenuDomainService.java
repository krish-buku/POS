package com.bukukasir.menu.domain.service;

import com.bukukasir.common.exception.ResourceNotFoundException;
import com.bukukasir.common.util.IdGenerator;
import com.bukukasir.menu.domain.model.Category;
import com.bukukasir.menu.domain.model.MenuItem;
import com.bukukasir.menu.domain.port.in.MenuUseCase;
import com.bukukasir.menu.domain.port.out.MenuRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class MenuDomainService implements MenuUseCase {

    private final MenuRepository menuRepository;

    @Override
    public List<Category> getAllCategories(String businessId) {
        return menuRepository.findAllCategories();
    }

    @Override
    public Category getCategoryById(String id) {
        return menuRepository.findCategoryById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category", "id", id));
    }

    @Override
    public Category createCategory(Category category) {
        category.setId(IdGenerator.generateId());
        category.setActive(true);
        return menuRepository.saveCategory(category);
    }

    @Override
    public Category updateCategory(String id, Category category) {
        Category existing = getCategoryById(id);
        existing.setName(category.getName());
        existing.setDescription(category.getDescription());
        existing.setSortOrder(category.getSortOrder());
        return menuRepository.saveCategory(existing);
    }

    @Override
    public void deleteCategory(String id) {
        getCategoryById(id);
        menuRepository.deleteCategoryById(id);
    }

    @Override
    public List<MenuItem> getAllMenuItems(String businessId) {
        return menuRepository.findAllMenuItems();
    }

    @Override
    public List<MenuItem> getMenuItemsByCategory(String categoryId) {
        return menuRepository.findMenuItemsByCategoryId(categoryId);
    }

    @Override
    public MenuItem getMenuItemById(String id) {
        return menuRepository.findMenuItemById(id)
                .orElseThrow(() -> new ResourceNotFoundException("MenuItem", "id", id));
    }

    @Override
    public MenuItem createMenuItem(MenuItem menuItem) {
        menuItem.setId(IdGenerator.generateId());
        menuItem.setAvailable(true);
        return menuRepository.saveMenuItem(menuItem);
    }

    @Override
    public MenuItem updateMenuItem(String id, MenuItem menuItem) {
        MenuItem existing = getMenuItemById(id);
        existing.setName(menuItem.getName());
        existing.setDescription(menuItem.getDescription());
        existing.setPrice(menuItem.getPrice());
        existing.setCategoryId(menuItem.getCategoryId());
        existing.setImageUrl(menuItem.getImageUrl());
        existing.setVariants(menuItem.getVariants());
        existing.setModifierGroups(menuItem.getModifierGroups());
        return menuRepository.saveMenuItem(existing);
    }

    @Override
    public void deleteMenuItem(String id) {
        getMenuItemById(id);
        menuRepository.deleteMenuItemById(id);
    }

    @Override
    public MenuItem updateAvailability(String id, boolean available) {
        MenuItem item = getMenuItemById(id);
        item.setAvailable(available);
        return menuRepository.saveMenuItem(item);
    }
}
