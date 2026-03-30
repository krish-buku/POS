package com.bukukasir.receipt.domain.service;

import com.bukukasir.common.exception.ResourceNotFoundException;
import com.bukukasir.common.util.IdGenerator;
import com.bukukasir.receipt.domain.model.*;
import com.bukukasir.receipt.domain.port.in.ReceiptUseCase;
import com.bukukasir.receipt.domain.port.out.ReceiptRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class ReceiptDomainService implements ReceiptUseCase {

    private final ReceiptRepository receiptRepository;
    private final PrintRoutingService printRoutingService;

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
    public List<PrintJob> getPrintQueue() {
        return receiptRepository.findAllPrintJobs();
    }

    @Override
    public List<Printer> listPrinters(String businessId) {
        return receiptRepository.findPrintersByBusinessId(businessId);
    }

    @Override
    public Printer createPrinter(Printer printer) {
        if (printer.getId() == null || printer.getId().isBlank()) {
            printer.setId(IdGenerator.generateId());
        }
        return receiptRepository.savePrinter(printer);
    }

    @Override
    public Printer updatePrinter(Printer printer) {
        receiptRepository.findPrinterById(printer.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Printer", "id", printer.getId()));
        return receiptRepository.savePrinter(printer);
    }

    @Override
    public void deletePrinter(String printerId) {
        receiptRepository.findPrinterById(printerId)
                .orElseThrow(() -> new ResourceNotFoundException("Printer", "id", printerId));
        receiptRepository.deletePrinter(printerId);
    }

    @Override
    public List<PrinterAssignment> getAssignments(String printerId) {
        return receiptRepository.findAssignmentsByPrinterId(printerId);
    }

    @Override
    public PrinterAssignment createAssignment(PrinterAssignment assignment) {
        if (assignment.getId() == null || assignment.getId().isBlank()) {
            assignment.setId(IdGenerator.generateId());
        }
        return receiptRepository.saveAssignment(assignment);
    }

    @Override
    public void deleteAssignment(String assignmentId) {
        receiptRepository.deleteAssignment(assignmentId);
    }

    @Override
    public Map<String, List<OrderItem>> routeItems(List<OrderItem> items, String businessId) {
        List<Printer> printers = receiptRepository.findPrintersByBusinessId(businessId);
        List<PrinterAssignment> assignments = receiptRepository.findAssignmentsByBusinessId(businessId);
        return printRoutingService.routeItems(items, assignments, printers);
    }
}
