package com.bukukasir.receipt.domain.port.in;

import com.bukukasir.receipt.domain.model.PrintJob;
import com.bukukasir.receipt.domain.model.ReceiptTemplate;

import java.util.List;

public interface ReceiptUseCase {
    ReceiptTemplate getTemplate(String businessId);
    ReceiptTemplate updateTemplate(ReceiptTemplate template);
    PrintJob printReceipt(String orderId, String orderNumber, String businessId);
    List<PrintJob> getPrintQueue();
}
