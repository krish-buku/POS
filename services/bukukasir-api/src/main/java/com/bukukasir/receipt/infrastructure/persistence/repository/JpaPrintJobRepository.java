package com.bukukasir.receipt.infrastructure.persistence.repository;

import com.bukukasir.receipt.infrastructure.persistence.entity.PrintJobEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface JpaPrintJobRepository extends JpaRepository<PrintJobEntity, String> {

    List<PrintJobEntity> findByBusinessId(String businessId);

    List<PrintJobEntity> findByOrderId(String orderId);

    List<PrintJobEntity> findByStatus(String status);
}
