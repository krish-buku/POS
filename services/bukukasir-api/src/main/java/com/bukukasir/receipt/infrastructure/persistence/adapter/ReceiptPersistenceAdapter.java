package com.bukukasir.receipt.infrastructure.persistence.adapter;

import com.bukukasir.receipt.domain.model.*;
import com.bukukasir.receipt.domain.port.out.ReceiptRepository;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;

@Component
public class ReceiptPersistenceAdapter implements ReceiptRepository {

    private final Map<String, ReceiptTemplate> templates = new ConcurrentHashMap<>();
    private final Map<String, PrintJob> printJobs = new ConcurrentHashMap<>();
    private final Map<String, Printer> printers = new ConcurrentHashMap<>();
    private final Map<String, PrinterAssignment> assignments = new ConcurrentHashMap<>();

    public ReceiptPersistenceAdapter() {
        initMockData();
    }

    private void initMockData() {
        templates.put("biz-001", ReceiptTemplate.builder().id("tmpl-001").businessId("biz-001")
                .headerText("Warung Nusantara\nJl. Sudirman No. 123\nTelp: +62-21-5551234")
                .footerText("Terima kasih atas kunjungan Anda!\nSelamat menikmati")
                .showLogo(true).showAddress(true).showTaxDetails(true).paperWidth("80mm").build());

        printJobs.put("pj-001", PrintJob.builder().id("pj-001").orderId("order-001").orderNumber("ORD-001").status(PrintStatus.COMPLETED).printerName("Kitchen Printer").copies(1).businessId("biz-001").createdAt(Instant.now().minusSeconds(3600)).completedAt(Instant.now().minusSeconds(3590)).build());
        printJobs.put("pj-002", PrintJob.builder().id("pj-002").orderId("order-002").orderNumber("ORD-002").status(PrintStatus.COMPLETED).printerName("Default Printer").copies(1).businessId("biz-001").createdAt(Instant.now().minusSeconds(1800)).completedAt(Instant.now().minusSeconds(1795)).build());
        printJobs.put("pj-003", PrintJob.builder().id("pj-003").orderId("order-003").orderNumber("ORD-003").status(PrintStatus.PENDING).printerName("Default Printer").copies(1).businessId("biz-001").createdAt(Instant.now().minusSeconds(60)).build());

        // Mock printers
        printers.put("printer-001", Printer.builder()
                .id("printer-001").businessId("biz-001").name("Kasir Utama")
                .type(PrinterType.RECEIPT).connectionType(ConnectionType.USB)
                .paperWidth(PaperWidth.MM_80).hasCutter(true).hasCashDrawer(true)
                .isDefault(true).isActive(true).build());

        printers.put("printer-002", Printer.builder()
                .id("printer-002").businessId("biz-001").name("Dapur")
                .type(PrinterType.KITCHEN).connectionType(ConnectionType.NETWORK)
                .ipAddress("192.168.1.100").port(9100)
                .paperWidth(PaperWidth.MM_80).hasCutter(true).hasCashDrawer(false)
                .isDefault(false).isActive(true).build());

        printers.put("printer-003", Printer.builder()
                .id("printer-003").businessId("biz-001").name("Bar")
                .type(PrinterType.BAR).connectionType(ConnectionType.BLUETOOTH)
                .macAddress("AA:BB:CC:DD:EE:FF")
                .paperWidth(PaperWidth.MM_58).hasCutter(false).hasCashDrawer(false)
                .isDefault(false).isActive(true).build());

        // Mock assignments
        assignments.put("assign-001", PrinterAssignment.builder()
                .id("assign-001").printerId("printer-002").businessId("biz-001")
                .routingType(RoutingType.FLAG).routingValue("KITCHEN")
                .priority(1).copies(1).build());

        assignments.put("assign-002", PrinterAssignment.builder()
                .id("assign-002").printerId("printer-003").businessId("biz-001")
                .routingType(RoutingType.FLAG).routingValue("BAR")
                .priority(1).copies(1).build());

        assignments.put("assign-003", PrinterAssignment.builder()
                .id("assign-003").printerId("printer-001").businessId("biz-001")
                .routingType(RoutingType.ALL).routingValue(null)
                .priority(99).copies(1).build());
    }

    @Override
    public Optional<ReceiptTemplate> findTemplateByBusinessId(String businessId) {
        return Optional.ofNullable(templates.get(businessId));
    }

    @Override
    public ReceiptTemplate saveTemplate(ReceiptTemplate t) {
        templates.put(t.getBusinessId(), t);
        return t;
    }

    @Override
    public PrintJob savePrintJob(PrintJob j) {
        printJobs.put(j.getId(), j);
        return j;
    }

    @Override
    public List<PrintJob> findAllPrintJobs() {
        return new ArrayList<>(printJobs.values());
    }

    @Override
    public List<Printer> findPrintersByBusinessId(String businessId) {
        return printers.values().stream()
                .filter(p -> p.getBusinessId().equals(businessId))
                .collect(Collectors.toList());
    }

    @Override
    public Optional<Printer> findPrinterById(String printerId) {
        return Optional.ofNullable(printers.get(printerId));
    }

    @Override
    public Printer savePrinter(Printer printer) {
        printers.put(printer.getId(), printer);
        return printer;
    }

    @Override
    public void deletePrinter(String printerId) {
        printers.remove(printerId);
    }

    @Override
    public List<PrinterAssignment> findAssignmentsByPrinterId(String printerId) {
        return assignments.values().stream()
                .filter(a -> a.getPrinterId().equals(printerId))
                .collect(Collectors.toList());
    }

    @Override
    public List<PrinterAssignment> findAssignmentsByBusinessId(String businessId) {
        return assignments.values().stream()
                .filter(a -> a.getBusinessId().equals(businessId))
                .collect(Collectors.toList());
    }

    @Override
    public PrinterAssignment saveAssignment(PrinterAssignment assignment) {
        assignments.put(assignment.getId(), assignment);
        return assignment;
    }

    @Override
    public void deleteAssignment(String assignmentId) {
        assignments.remove(assignmentId);
    }
}
