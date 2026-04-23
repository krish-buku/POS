package com.bukukasir.table.infrastructure.persistence.repository;

import com.bukukasir.table.infrastructure.persistence.entity.FloorEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface JpaFloorRepository extends JpaRepository<FloorEntity, String> {

    List<FloorEntity> findByBusinessIdOrderBySortOrderAsc(String businessId);
}
