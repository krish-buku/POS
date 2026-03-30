package com.bukukasir.menu.domain.service;

import com.bukukasir.common.audit.AuditAction;
import com.bukukasir.common.audit.AuditLog;
import com.bukukasir.common.audit.AuditLogger;
import com.bukukasir.common.exception.ResourceNotFoundException;
import com.bukukasir.common.util.IdGenerator;
import com.bukukasir.menu.domain.model.Category;
import com.bukukasir.menu.domain.model.MenuItem;
import com.bukukasir.menu.domain.port.in.MenuUseCase;
import com.bukukasir.menu.domain.port.out.MenuRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class MenuDomainService implements MenuUseCase {

    private final MenuRepository menuRepository;
    private final AuditLogger auditLogger;

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
        MenuItem saved = menuRepository.saveMenuItem(menuItem);

        auditLogger.log(AuditLog.builder()
                .actorId("staff-001").actorName("System")
                .businessId(saved.getBusinessId())
                .action(AuditAction.CREATE)
                .entityType("MenuItem").entityId(saved.getId())
                .description("Created menu item: " + saved.getName() + " (Rp " + saved.getPrice() + ")")
                .newValues(menuItemToMap(saved))
                .timestamp(LocalDateTime.now())
                .build());

        return saved;
    }

    @Override
    public MenuItem updateMenuItem(String id, MenuItem menuItem) {
        MenuItem existing = getMenuItemById(id);
        Map<String, Object> oldValues = menuItemToMap(existing);

        existing.setName(menuItem.getName());
        existing.setDescription(menuItem.getDescription());
        existing.setPrice(menuItem.getPrice());
        existing.setCategoryId(menuItem.getCategoryId());
        existing.setImageUrl(menuItem.getImageUrl());
        existing.setVariants(menuItem.getVariants());
        existing.setModifierGroups(menuItem.getModifierGroups());
        MenuItem saved = menuRepository.saveMenuItem(existing);

        auditLogger.log(AuditLog.builder()
                .actorId("staff-001").actorName("System")
                .businessId(saved.getBusinessId())
                .action(AuditAction.UPDATE)
                .entityType("MenuItem").entityId(saved.getId())
                .description("Updated menu item: " + saved.getName())
                .oldValues(oldValues)
                .newValues(menuItemToMap(saved))
                .timestamp(LocalDateTime.now())
                .build());

        return saved;
    }

    @Override
    public void deleteMenuItem(String id) {
        MenuItem existing = getMenuItemById(id);

        auditLogger.log(AuditLog.builder()
                .actorId("staff-001").actorName("System")
                .businessId(existing.getBusinessId())
                .action(AuditAction.DELETE)
                .entityType("MenuItem").entityId(id)
                .description("Deleted menu item: " + existing.getName())
                .oldValues(menuItemToMap(existing))
                .timestamp(LocalDateTime.now())
                .build());

        menuRepository.deleteMenuItemById(id);
    }

    @Override
    public MenuItem updateAvailability(String id, boolean available) {
        MenuItem item = getMenuItemById(id);
        boolean oldAvailable = item.isAvailable();
        item.setAvailable(available);
        MenuItem saved = menuRepository.saveMenuItem(item);

        Map<String, Object> oldValues = new LinkedHashMap<>();
        oldValues.put("available", oldAvailable);
        Map<String, Object> newValues = new LinkedHashMap<>();
        newValues.put("available", available);

        auditLogger.log(AuditLog.builder()
                .actorId("staff-001").actorName("System")
                .businessId(saved.getBusinessId())
                .action(AuditAction.STATUS_CHANGE)
                .entityType("MenuItem").entityId(saved.getId())
                .description("Changed availability of " + saved.getName() + " to " + (available ? "available" : "unavailable"))
                .oldValues(oldValues)
                .newValues(newValues)
                .timestamp(LocalDateTime.now())
                .build());

        return saved;
    }

    private Map<String, Object> menuItemToMap(MenuItem item) {
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("name", item.getName());
        map.put("description", item.getDescription());
        map.put("price", item.getPrice());
        map.put("categoryId", item.getCategoryId());
        map.put("available", item.isAvailable());
        return map;
    }
}
