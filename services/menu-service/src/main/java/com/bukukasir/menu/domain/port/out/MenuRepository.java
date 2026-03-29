package com.bukukasir.menu.domain.port.out;

import com.bukukasir.menu.domain.model.Category;
import com.bukukasir.menu.domain.model.MenuItem;

import java.util.List;
import java.util.Optional;

public interface MenuRepository {
    List<Category> findAllCategories();
    Optional<Category> findCategoryById(String id);
    Category saveCategory(Category category);
    void deleteCategoryById(String id);

    List<MenuItem> findAllMenuItems();
    List<MenuItem> findMenuItemsByCategoryId(String categoryId);
    Optional<MenuItem> findMenuItemById(String id);
    MenuItem saveMenuItem(MenuItem menuItem);
    void deleteMenuItemById(String id);
}
