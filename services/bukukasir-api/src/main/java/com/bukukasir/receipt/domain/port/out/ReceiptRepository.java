package com.bukukasir.receipt.domain.port.out;

import com.bukukasir.receipt.domain.model.*;

import java.util.List;
import java.util.Optional;

public interface ReceiptRepository {
    Optional<ReceiptTemplate> findTemplateByBusinessId(String businessId);
    ReceiptTemplate saveTemplate(ReceiptTemplate template);
    PrintJob savePrintJob(PrintJob job);
    List<PrintJob> findAllPrintJobs();

    // Printer management
    List<Printer> findPrintersByBusinessId(String businessId);
    Optional<Printer> findPrinterById(String printerId);
    Printer savePrinter(Printer printer);
    void deletePrinter(String printerId);

    // Assignment management
    List<PrinterAssignment> findAssignmentsByPrinterId(String printerId);
    List<PrinterAssignment> findAssignmentsByBusinessId(String businessId);
    PrinterAssignment saveAssignment(PrinterAssignment assignment);
    void deleteAssignment(String assignmentId);
}
