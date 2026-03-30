package com.bukukasir.receipt.infrastructure.persistence.repository;

import com.bukukasir.receipt.infrastructure.persistence.entity.PrinterEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface JpaPrinterRepository extends JpaRepository<PrinterEntity, String> {

    List<PrinterEntity> findByBusinessId(String businessId);

    List<PrinterEntity> findByBusinessIdAndIsActiveTrue(String businessId);
}
