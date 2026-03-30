package com.bukukasir.table.infrastructure.persistence.repository;

import com.bukukasir.table.infrastructure.persistence.entity.TableEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface JpaTableRepository extends JpaRepository<TableEntity, String> {

    List<TableEntity> findByBusinessId(String businessId);

    List<TableEntity> findByBusinessIdAndStatus(String businessId, String status);

    List<TableEntity> findByAreaId(String areaId);

    List<TableEntity> findByFloorId(String floorId);
}
