package com.bukukasir.menu.domain.port.in;

import com.bukukasir.menu.domain.model.Category;
import com.bukukasir.menu.domain.model.MenuItem;

import java.util.List;

public interface MenuUseCase {
    List<Category> getAllCategories(String businessId);
    Category getCategoryById(String id);
    Category createCategory(Category category);
    Category updateCategory(String id, Category category);
    void deleteCategory(String id);

    List<MenuItem> getAllMenuItems(String businessId);
    List<MenuItem> getMenuItemsByCategory(String categoryId);
    MenuItem getMenuItemById(String id);
    MenuItem createMenuItem(MenuItem menuItem);
    MenuItem updateMenuItem(String id, MenuItem menuItem);
    void deleteMenuItem(String id);
    MenuItem updateAvailability(String id, boolean available);
}
