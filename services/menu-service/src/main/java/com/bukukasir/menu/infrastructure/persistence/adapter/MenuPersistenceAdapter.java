package com.bukukasir.menu.infrastructure.persistence.adapter;

import com.bukukasir.menu.domain.model.*;
import com.bukukasir.menu.domain.port.out.MenuRepository;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;

@Component
public class MenuPersistenceAdapter implements MenuRepository {

    private final Map<String, Category> categories = new ConcurrentHashMap<>();
    private final Map<String, MenuItem> menuItems = new ConcurrentHashMap<>();

    public MenuPersistenceAdapter() {
        initMockData();
    }

    private void initMockData() {
        categories.put("cat-001", Category.builder().id("cat-001").name("Makanan").description("Hidangan utama").businessId("biz-001").sortOrder(1).active(true).build());
        categories.put("cat-002", Category.builder().id("cat-002").name("Minuman").description("Aneka minuman").businessId("biz-001").sortOrder(2).active(true).build());
        categories.put("cat-003", Category.builder().id("cat-003").name("Snack").description("Makanan ringan").businessId("biz-001").sortOrder(3).active(true).build());
        categories.put("cat-004", Category.builder().id("cat-004").name("Dessert").description("Pencuci mulut").businessId("biz-001").sortOrder(4).active(true).build());

        List<Modifier> spiceModifiers = List.of(
                Modifier.builder().id("mod-001").name("Tidak Pedas").price(BigDecimal.ZERO).build(),
                Modifier.builder().id("mod-002").name("Pedas").price(BigDecimal.ZERO).build(),
                Modifier.builder().id("mod-003").name("Ekstra Pedas").price(new BigDecimal("2000")).build()
        );
        ModifierGroup spiceGroup = ModifierGroup.builder().id("mg-001").name("Level Kepedasan").required(false).maxSelections(1).modifiers(spiceModifiers).build();

        List<Modifier> drinkModifiers = List.of(
                Modifier.builder().id("mod-004").name("Gula Normal").price(BigDecimal.ZERO).build(),
                Modifier.builder().id("mod-005").name("Kurang Gula").price(BigDecimal.ZERO).build(),
                Modifier.builder().id("mod-006").name("Tanpa Gula").price(BigDecimal.ZERO).build()
        );
        ModifierGroup sugarGroup = ModifierGroup.builder().id("mg-002").name("Level Gula").required(false).maxSelections(1).modifiers(drinkModifiers).build();

        menuItems.put("menu-001", MenuItem.builder().id("menu-001").name("Nasi Goreng Spesial").description("Nasi goreng dengan telur, ayam, dan sayuran")
                .price(new BigDecimal("25000")).categoryId("cat-001").businessId("biz-001").imageUrl("/menu-images/nasi-goreng.png").available(true)
                .modifierGroups(List.of(spiceGroup)).variants(List.of()).build());
        menuItems.put("menu-002", MenuItem.builder().id("menu-002").name("Mie Goreng").description("Mie goreng dengan sayuran segar")
                .price(new BigDecimal("22000")).categoryId("cat-001").businessId("biz-001").imageUrl("/menu-images/mie-goreng.png").available(true)
                .modifierGroups(List.of(spiceGroup)).variants(List.of()).build());
        menuItems.put("menu-003", MenuItem.builder().id("menu-003").name("Ayam Bakar").description("Ayam bakar bumbu kecap")
                .price(new BigDecimal("35000")).categoryId("cat-001").businessId("biz-001").imageUrl("/menu-images/ayam-bakar.png").available(true)
                .modifierGroups(List.of(spiceGroup)).variants(List.of()).build());
        menuItems.put("menu-004", MenuItem.builder().id("menu-004").name("Soto Ayam").description("Soto ayam dengan kuah bening")
                .price(new BigDecimal("20000")).categoryId("cat-001").businessId("biz-001").imageUrl("/menu-images/soto-ayam.png").available(true)
                .modifierGroups(List.of(spiceGroup)).variants(List.of()).build());
        menuItems.put("menu-005", MenuItem.builder().id("menu-005").name("Es Teh Manis").description("Teh manis dingin")
                .price(new BigDecimal("8000")).categoryId("cat-002").businessId("biz-001").imageUrl("/menu-images/es-teh-manis.png").available(true)
                .modifierGroups(List.of(sugarGroup)).variants(List.of()).build());
        menuItems.put("menu-006", MenuItem.builder().id("menu-006").name("Es Jeruk").description("Jeruk peras segar")
                .price(new BigDecimal("10000")).categoryId("cat-002").businessId("biz-001").imageUrl("/menu-images/es-jeruk.png").available(true)
                .modifierGroups(List.of(sugarGroup)).variants(List.of()).build());
        menuItems.put("menu-007", MenuItem.builder().id("menu-007").name("Kopi Susu").description("Kopi susu ala warung")
                .price(new BigDecimal("15000")).categoryId("cat-002").businessId("biz-001").imageUrl("/menu-images/kopi-susu.png").available(true)
                .modifierGroups(List.of(sugarGroup)).variants(List.of(
                        Variant.builder().id("var-001").name("Hot").priceAdjustment(BigDecimal.ZERO).build(),
                        Variant.builder().id("var-002").name("Iced").priceAdjustment(new BigDecimal("3000")).build()
                )).build());
        menuItems.put("menu-008", MenuItem.builder().id("menu-008").name("Pisang Goreng").description("Pisang goreng crispy")
                .price(new BigDecimal("12000")).categoryId("cat-003").businessId("biz-001").imageUrl("/menu-images/pisang-goreng.png").available(true)
                .modifierGroups(List.of()).variants(List.of()).build());
        menuItems.put("menu-009", MenuItem.builder().id("menu-009").name("Tahu Crispy").description("Tahu goreng crispy dengan sambal")
                .price(new BigDecimal("10000")).categoryId("cat-003").businessId("biz-001").imageUrl("/menu-images/tahu-goreng.png").available(false)
                .modifierGroups(List.of()).variants(List.of()).build());
        menuItems.put("menu-010", MenuItem.builder().id("menu-010").name("Es Campur").description("Es campur dengan aneka topping")
                .price(new BigDecimal("18000")).categoryId("cat-004").businessId("biz-001").imageUrl("/menu-images/es-campur.png").available(true)
                .modifierGroups(List.of()).variants(List.of()).build());
    }

    @Override public List<Category> findAllCategories() { return new ArrayList<>(categories.values()); }
    @Override public Optional<Category> findCategoryById(String id) { return Optional.ofNullable(categories.get(id)); }
    @Override public Category saveCategory(Category category) { categories.put(category.getId(), category); return category; }
    @Override public void deleteCategoryById(String id) { categories.remove(id); }
    @Override public List<MenuItem> findAllMenuItems() { return new ArrayList<>(menuItems.values()); }
    @Override public List<MenuItem> findMenuItemsByCategoryId(String categoryId) {
        return menuItems.values().stream().filter(m -> m.getCategoryId().equals(categoryId)).collect(Collectors.toList());
    }
    @Override public Optional<MenuItem> findMenuItemById(String id) { return Optional.ofNullable(menuItems.get(id)); }
    @Override public MenuItem saveMenuItem(MenuItem menuItem) { menuItems.put(menuItem.getId(), menuItem); return menuItem; }
    @Override public void deleteMenuItemById(String id) { menuItems.remove(id); }
}
