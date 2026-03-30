package com.bukukasir.order.infrastructure.persistence.repository;

import com.bukukasir.order.infrastructure.persistence.entity.OrderItemEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface JpaOrderItemRepository extends JpaRepository<OrderItemEntity, String> {

    List<OrderItemEntity> findByOrderId(String orderId);

    List<OrderItemEntity> findByMenuItemId(String menuItemId);
}
