package com.bukukasir.receipt.domain.port.out;

import com.bukukasir.receipt.domain.model.PrintJob;
import com.bukukasir.receipt.domain.model.ReceiptTemplate;

import java.util.List;
import java.util.Optional;

public interface ReceiptRepository {
    Optional<ReceiptTemplate> findTemplateByBusinessId(String businessId);
    ReceiptTemplate saveTemplate(ReceiptTemplate template);
    PrintJob savePrintJob(PrintJob job);
    List<PrintJob> findAllPrintJobs();
}
