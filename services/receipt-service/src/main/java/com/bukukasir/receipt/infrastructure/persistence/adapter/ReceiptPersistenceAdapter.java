package com.bukukasir.receipt.infrastructure.persistence.adapter;

import com.bukukasir.receipt.domain.model.PrintJob;
import com.bukukasir.receipt.domain.model.PrintStatus;
import com.bukukasir.receipt.domain.model.ReceiptTemplate;
import com.bukukasir.receipt.domain.port.out.ReceiptRepository;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class ReceiptPersistenceAdapter implements ReceiptRepository {
    private final Map<String, ReceiptTemplate> templates = new ConcurrentHashMap<>();
    private final Map<String, PrintJob> printJobs = new ConcurrentHashMap<>();

    public ReceiptPersistenceAdapter() { initMockData(); }

    private void initMockData() {
        templates.put("biz-001", ReceiptTemplate.builder().id("tmpl-001").businessId("biz-001")
                .headerText("Warung Nusantara\nJl. Sudirman No. 123\nTelp: +62-21-5551234")
                .footerText("Terima kasih atas kunjungan Anda!\nSelamat menikmati")
                .showLogo(true).showAddress(true).showTaxDetails(true).paperWidth("80mm").build());

        printJobs.put("pj-001", PrintJob.builder().id("pj-001").orderId("order-001").orderNumber("ORD-001").status(PrintStatus.COMPLETED).printerName("Kitchen Printer").copies(1).businessId("biz-001").createdAt(Instant.now().minusSeconds(3600)).completedAt(Instant.now().minusSeconds(3590)).build());
        printJobs.put("pj-002", PrintJob.builder().id("pj-002").orderId("order-002").orderNumber("ORD-002").status(PrintStatus.COMPLETED).printerName("Default Printer").copies(1).businessId("biz-001").createdAt(Instant.now().minusSeconds(1800)).completedAt(Instant.now().minusSeconds(1795)).build());
        printJobs.put("pj-003", PrintJob.builder().id("pj-003").orderId("order-003").orderNumber("ORD-003").status(PrintStatus.PENDING).printerName("Default Printer").copies(1).businessId("biz-001").createdAt(Instant.now().minusSeconds(60)).build());
    }

    @Override public Optional<ReceiptTemplate> findTemplateByBusinessId(String businessId) { return Optional.ofNullable(templates.get(businessId)); }
    @Override public ReceiptTemplate saveTemplate(ReceiptTemplate t) { templates.put(t.getBusinessId(), t); return t; }
    @Override public PrintJob savePrintJob(PrintJob j) { printJobs.put(j.getId(), j); return j; }
    @Override public List<PrintJob> findAllPrintJobs() { return new ArrayList<>(printJobs.values()); }
}
