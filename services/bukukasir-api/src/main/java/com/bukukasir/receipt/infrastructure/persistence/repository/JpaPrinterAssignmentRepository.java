package com.bukukasir.receipt.infrastructure.persistence.repository;

import com.bukukasir.receipt.infrastructure.persistence.entity.PrinterAssignmentEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface JpaPrinterAssignmentRepository extends JpaRepository<PrinterAssignmentEntity, String> {

    List<PrinterAssignmentEntity> findByPrinterId(String printerId);

    List<PrinterAssignmentEntity> findByBusinessId(String businessId);
}
