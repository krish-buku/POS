package com.bukukasir.receipt.domain.service;

import com.bukukasir.common.exception.ResourceNotFoundException;
import com.bukukasir.common.util.IdGenerator;
import com.bukukasir.receipt.domain.model.PrintJob;
import com.bukukasir.receipt.domain.model.PrintStatus;
import com.bukukasir.receipt.domain.model.ReceiptTemplate;
import com.bukukasir.receipt.domain.port.in.ReceiptUseCase;
import com.bukukasir.receipt.domain.port.out.ReceiptRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ReceiptDomainService implements ReceiptUseCase {
    private final ReceiptRepository receiptRepository;

    @Override
    public ReceiptTemplate getTemplate(String businessId) {
        return receiptRepository.findTemplateByBusinessId(businessId)
                .orElseThrow(() -> new ResourceNotFoundException("ReceiptTemplate", "businessId", businessId));
    }

    @Override
    public ReceiptTemplate updateTemplate(ReceiptTemplate template) {
        return receiptRepository.saveTemplate(template);
    }

    @Override
    public PrintJob printReceipt(String orderId, String orderNumber, String businessId) {
        PrintJob job = PrintJob.builder()
                .id(IdGenerator.generateId()).orderId(orderId).orderNumber(orderNumber)
                .status(PrintStatus.PENDING).printerName("Default Printer").copies(1)
                .businessId(businessId).createdAt(Instant.now()).build();
        return receiptRepository.savePrintJob(job);
    }

    @Override
    public List<PrintJob> getPrintQueue() { return receiptRepository.findAllPrintJobs(); }
}
