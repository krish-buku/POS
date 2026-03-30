package com.bukukasir.menu.infrastructure.persistence.repository;

import com.bukukasir.menu.infrastructure.persistence.entity.CategoryEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface JpaCategoryRepository extends JpaRepository<CategoryEntity, String> {

    List<CategoryEntity> findByBusinessId(String businessId);

    List<CategoryEntity> findByBusinessIdOrderBySortOrderAsc(String businessId);
}
