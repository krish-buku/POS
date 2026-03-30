package com.bukukasir.kitchen.infrastructure.persistence.repository;

import com.bukukasir.kitchen.infrastructure.persistence.entity.KitchenTicketEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface JpaKitchenTicketRepository extends JpaRepository<KitchenTicketEntity, String> {

    List<KitchenTicketEntity> findByBusinessId(String businessId);

    List<KitchenTicketEntity> findByOrderId(String orderId);

    List<KitchenTicketEntity> findByBusinessIdAndStatus(String businessId, String status);
}
