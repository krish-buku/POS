package com.bukukasir.payment.infrastructure.persistence.repository;

import com.bukukasir.payment.infrastructure.persistence.entity.PaymentMethodEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface JpaPaymentMethodRepository extends JpaRepository<PaymentMethodEntity, String> {

    List<PaymentMethodEntity> findByBusinessId(String businessId);

    List<PaymentMethodEntity> findByBusinessIdAndActiveTrue(String businessId);
}
