package com.bukukasir.receipt.domain.port.in;

import com.bukukasir.receipt.domain.model.*;

import java.util.List;
import java.util.Map;

public interface ReceiptUseCase {
    ReceiptTemplate getTemplate(String businessId);
    ReceiptTemplate updateTemplate(ReceiptTemplate template);
    PrintJob printReceipt(String orderId, String orderNumber, String businessId);
    List<PrintJob> getPrintQueue();

    // Printer management
    List<Printer> listPrinters(String businessId);
    Printer createPrinter(Printer printer);
    Printer updatePrinter(Printer printer);
    void deletePrinter(String printerId);

    // Printer assignment management
    List<PrinterAssignment> getAssignments(String printerId);
    PrinterAssignment createAssignment(PrinterAssignment assignment);
    void deleteAssignment(String assignmentId);

    // Routing
    Map<String, List<OrderItem>> routeItems(List<OrderItem> items, String businessId);
}
