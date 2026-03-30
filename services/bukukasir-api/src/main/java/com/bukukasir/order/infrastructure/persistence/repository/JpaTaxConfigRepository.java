package com.bukukasir.order.infrastructure.persistence.repository;

import com.bukukasir.order.infrastructure.persistence.entity.TaxConfigEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface JpaTaxConfigRepository extends JpaRepository<TaxConfigEntity, String> {

    List<TaxConfigEntity> findByBusinessId(String businessId);

    List<TaxConfigEntity> findByBusinessIdOrderByPriorityAsc(String businessId);

    List<TaxConfigEntity> findByBusinessIdAndActiveTrueOrderByPriorityAsc(String businessId);
}
