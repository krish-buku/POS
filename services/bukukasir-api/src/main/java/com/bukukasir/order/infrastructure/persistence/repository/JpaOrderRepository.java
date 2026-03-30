package com.bukukasir.order.infrastructure.persistence.repository;

import com.bukukasir.order.infrastructure.persistence.entity.OrderEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface JpaOrderRepository extends JpaRepository<OrderEntity, String> {

    List<OrderEntity> findByTableId(String tableId);

    List<OrderEntity> findByBusinessId(String businessId);

    List<OrderEntity> findByBusinessIdAndStatus(String businessId, String status);

    List<OrderEntity> findByStaffId(String staffId);
}
