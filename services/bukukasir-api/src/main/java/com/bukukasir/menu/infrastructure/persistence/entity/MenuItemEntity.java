package com.bukukasir.menu.infrastructure.persistence.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "menu_items")
public class MenuItemEntity {

    @Id
    private String id;

    @Column(nullable = false)
    private String name;

    private String description;
    private BigDecimal price;
    private String categoryId;
    private String businessId;
    private String imageUrl;
    @Column(name = "is_available")
    private boolean available;
}
