package com.bukukasir.receipt.infrastructure.persistence.repository;

import com.bukukasir.receipt.infrastructure.persistence.entity.ReceiptTemplateEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface JpaReceiptTemplateRepository extends JpaRepository<ReceiptTemplateEntity, String> {

    Optional<ReceiptTemplateEntity> findByBusinessId(String businessId);
}
