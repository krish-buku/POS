package com.bukukasir.menu.infrastructure.web;

import com.bukukasir.common.dto.ApiResponse;
import com.bukukasir.menu.application.dto.*;
import com.bukukasir.menu.application.mapper.MenuMapper;
import com.bukukasir.menu.domain.model.Category;
import com.bukukasir.menu.domain.model.MenuItem;
import com.bukukasir.menu.domain.port.in.MenuUseCase;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/menu")
@RequiredArgsConstructor
@Tag(name = "Menu", description = "Menu management endpoints")
public class MenuController {

    private final MenuUseCase menuUseCase;
    private final MenuMapper menuMapper;

    // --- Categories ---

    @GetMapping("/categories")
    @Operation(summary = "List categories", description = "Returns all menu categories")
    @ApiResponses(value = {
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Categories retrieved")
    })
    public ResponseEntity<ApiResponse<List<Category>>> getCategories(
            @RequestParam(required = false) String businessId) {
        return ResponseEntity.ok(ApiResponse.success(menuUseCase.getAllCategories(businessId)));
    }

    @PostMapping("/categories")
    @Operation(summary = "Create category")
    public ResponseEntity<ApiResponse<Category>> createCategory(@Valid @RequestBody CategoryRequest request) {
        Category category = menuMapper.toDomain(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(menuUseCase.createCategory(category), "Category created"));
    }

    @PutMapping("/categories/{id}")
    @Operation(summary = "Update category")
    public ResponseEntity<ApiResponse<Category>> updateCategory(
            @PathVariable String id, @Valid @RequestBody CategoryRequest request) {
        Category category = menuMapper.toDomain(request);
        return ResponseEntity.ok(ApiResponse.success(menuUseCase.updateCategory(id, category), "Category updated"));
    }

    @DeleteMapping("/categories/{id}")
    @Operation(summary = "Delete category")
    public ResponseEntity<ApiResponse<Void>> deleteCategory(@PathVariable String id) {
        menuUseCase.deleteCategory(id);
        return ResponseEntity.ok(ApiResponse.success(null, "Category deleted"));
    }

    // --- Menu Items ---

    @GetMapping("/items")
    @Operation(summary = "List menu items", description = "Returns all menu items, optionally filtered by category")
    @ApiResponses(value = {
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Menu items retrieved")
    })
    public ResponseEntity<ApiResponse<List<MenuItemResponse>>> getMenuItems(
            @RequestParam(required = false) String businessId,
            @RequestParam(required = false) String categoryId) {
        List<MenuItem> items;
        if (categoryId != null) {
            items = menuUseCase.getMenuItemsByCategory(categoryId);
        } else {
            items = menuUseCase.getAllMenuItems(businessId);
        }
        List<MenuItemResponse> responses = items.stream().map(menuMapper::toResponse).toList();
        return ResponseEntity.ok(ApiResponse.success(responses));
    }

    @GetMapping("/items/{id}")
    @Operation(summary = "Get menu item by ID")
    public ResponseEntity<ApiResponse<MenuItemResponse>> getMenuItem(@PathVariable String id) {
        return ResponseEntity.ok(ApiResponse.success(menuMapper.toResponse(menuUseCase.getMenuItemById(id))));
    }

    @PostMapping("/items")
    @Operation(summary = "Create menu item")
    public ResponseEntity<ApiResponse<MenuItemResponse>> createMenuItem(
            @Valid @RequestBody MenuItemRequest request) {
        MenuItem item = menuMapper.toDomain(request);
        MenuItem created = menuUseCase.createMenuItem(item);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(menuMapper.toResponse(created), "Menu item created"));
    }

    @PutMapping("/items/{id}")
    @Operation(summary = "Update menu item")
    public ResponseEntity<ApiResponse<MenuItemResponse>> updateMenuItem(
            @PathVariable String id, @Valid @RequestBody MenuItemRequest request) {
        MenuItem item = menuMapper.toDomain(request);
        MenuItem updated = menuUseCase.updateMenuItem(id, item);
        return ResponseEntity.ok(ApiResponse.success(menuMapper.toResponse(updated), "Menu item updated"));
    }

    @DeleteMapping("/items/{id}")
    @Operation(summary = "Delete menu item")
    public ResponseEntity<ApiResponse<Void>> deleteMenuItem(@PathVariable String id) {
        menuUseCase.deleteMenuItem(id);
        return ResponseEntity.ok(ApiResponse.success(null, "Menu item deleted"));
    }

    @PatchMapping("/items/{id}/availability")
    @Operation(summary = "Toggle menu item availability")
    public ResponseEntity<ApiResponse<MenuItemResponse>> updateAvailability(
            @PathVariable String id, @RequestBody Map<String, Boolean> body) {
        boolean available = body.getOrDefault("available", true);
        MenuItem updated = menuUseCase.updateAvailability(id, available);
        return ResponseEntity.ok(ApiResponse.success(menuMapper.toResponse(updated), "Availability updated"));
    }
}
