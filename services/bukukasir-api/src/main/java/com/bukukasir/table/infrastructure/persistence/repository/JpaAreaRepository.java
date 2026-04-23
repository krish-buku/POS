package com.bukukasir.table.infrastructure.persistence.repository;

import com.bukukasir.table.infrastructure.persistence.entity.AreaEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface JpaAreaRepository extends JpaRepository<AreaEntity, String> {

    List<AreaEntity> findByBusinessIdOrderBySortOrderAsc(String businessId);

    List<AreaEntity> findByFloorIdOrderBySortOrderAsc(String floorId);
}
