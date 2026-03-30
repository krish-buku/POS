package com.bukukasir.order.infrastructure.persistence.repository;

import com.bukukasir.order.infrastructure.persistence.entity.PromotionEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface JpaPromotionRepository extends JpaRepository<PromotionEntity, String> {

    List<PromotionEntity> findByBusinessId(String businessId);

    List<PromotionEntity> findByBusinessIdOrderByPriorityAsc(String businessId);

    List<PromotionEntity> findByBusinessIdAndActiveTrueOrderByPriorityAsc(String businessId);
}
