package com.bukukasir.menu.infrastructure.persistence.repository;

import com.bukukasir.menu.infrastructure.persistence.entity.MenuItemEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface JpaMenuItemRepository extends JpaRepository<MenuItemEntity, String> {

    List<MenuItemEntity> findByCategoryId(String categoryId);

    List<MenuItemEntity> findByBusinessId(String businessId);

    List<MenuItemEntity> findByBusinessIdAndAvailableTrue(String businessId);
}
