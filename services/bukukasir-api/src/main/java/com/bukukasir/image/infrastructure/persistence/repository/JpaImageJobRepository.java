package com.bukukasir.image.infrastructure.persistence.repository;

import com.bukukasir.image.infrastructure.persistence.entity.ImageJobEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface JpaImageJobRepository extends JpaRepository<ImageJobEntity, String> {

    List<ImageJobEntity> findByBusinessId(String businessId);

    List<ImageJobEntity> findByMenuItemId(String menuItemId);

    List<ImageJobEntity> findByStatus(String status);
}
