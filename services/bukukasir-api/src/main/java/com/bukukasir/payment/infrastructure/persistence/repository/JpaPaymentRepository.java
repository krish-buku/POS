package com.bukukasir.payment.infrastructure.persistence.repository;

import com.bukukasir.payment.infrastructure.persistence.entity.PaymentEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;

@Repository
public interface JpaPaymentRepository extends JpaRepository<PaymentEntity, String> {

    List<PaymentEntity> findByOrderId(String orderId);

    List<PaymentEntity> findByBusinessId(String businessId);

    List<PaymentEntity> findByBusinessIdAndCreatedAtBetween(String businessId, Instant dateFrom, Instant dateTo);

    List<PaymentEntity> findByStaffId(String staffId);
}
