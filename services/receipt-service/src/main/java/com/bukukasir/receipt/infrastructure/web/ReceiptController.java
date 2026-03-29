package com.bukukasir.receipt.infrastructure.web;

import com.bukukasir.common.dto.ApiResponse;
import com.bukukasir.receipt.application.dto.*;
import com.bukukasir.receipt.domain.model.*;
import com.bukukasir.receipt.domain.port.in.ReceiptUseCase;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/receipts")
@RequiredArgsConstructor
@Tag(name = "Receipts", description = "Receipt, printing, and printer routing endpoints")
public class ReceiptController {

    private final ReceiptUseCase receiptUseCase;

    // ==================== Template endpoints ====================

    @GetMapping("/template")
    @Operation(summary = "Get receipt template")
    @ApiResponses(value = {
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Template retrieved"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Template not found")
    })
    public ResponseEntity<ApiResponse<ReceiptTemplate>> getTemplate(
            @RequestParam(defaultValue = "biz-001") String businessId) {
        return ResponseEntity.ok(ApiResponse.success(receiptUseCase.getTemplate(businessId)));
    }

    @PutMapping("/template")
    @Operation(summary = "Update receipt template")
    @ApiResponses(value = {
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Template updated")
    })
    public ResponseEntity<ApiResponse<ReceiptTemplate>> updateTemplate(@RequestBody TemplateRequest request) {
        ReceiptTemplate template = ReceiptTemplate.builder()
                .id(request.id()).businessId(request.businessId())
                .headerText(request.headerText()).footerText(request.footerText())
                .showLogo(request.showLogo()).showAddress(request.showAddress())
                .showTaxDetails(request.showTaxDetails()).paperWidth(request.paperWidth())
                .build();
        return ResponseEntity.ok(ApiResponse.success(receiptUseCase.updateTemplate(template), "Template updated"));
    }

    // ==================== Print endpoints ====================

    @PostMapping("/print")
    @Operation(summary = "Print a receipt")
    @ApiResponses(value = {
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "201", description = "Print job created")
    })
    public ResponseEntity<ApiResponse<PrintJob>> printReceipt(@Valid @RequestBody PrintReceiptRequest request) {
        PrintJob job = receiptUseCase.printReceipt(request.orderId(), request.orderNumber(), request.businessId());
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(job, "Print job created"));
    }

    @GetMapping("/print-queue")
    @Operation(summary = "Get print queue")
    @ApiResponses(value = {
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Print queue retrieved")
    })
    public ResponseEntity<ApiResponse<List<PrintJob>>> getPrintQueue() {
        return ResponseEntity.ok(ApiResponse.success(receiptUseCase.getPrintQueue()));
    }

    // ==================== Printer management endpoints ====================

    @GetMapping("/printers")
    @Operation(summary = "List printers", description = "Lists all printers for a business")
    @ApiResponses(value = {
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Printers listed")
    })
    public ResponseEntity<ApiResponse<List<Printer>>> listPrinters(
            @RequestParam(defaultValue = "biz-001") String businessId) {
        return ResponseEntity.ok(ApiResponse.success(receiptUseCase.listPrinters(businessId)));
    }

    @PostMapping("/printers")
    @Operation(summary = "Create printer", description = "Creates a new printer configuration")
    @ApiResponses(value = {
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "201", description = "Printer created")
    })
    public ResponseEntity<ApiResponse<Printer>> createPrinter(@Valid @RequestBody PrinterRequest request) {
        Printer printer = toPrinterDomain(request);
        Printer created = receiptUseCase.createPrinter(printer);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(created, "Printer created"));
    }

    @PutMapping("/printers/{id}")
    @Operation(summary = "Update printer", description = "Updates an existing printer configuration")
    @ApiResponses(value = {
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Printer updated"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Printer not found")
    })
    public ResponseEntity<ApiResponse<Printer>> updatePrinter(
            @PathVariable String id,
            @Valid @RequestBody PrinterRequest request) {
        Printer printer = toPrinterDomain(request);
        printer.setId(id);
        Printer updated = receiptUseCase.updatePrinter(printer);
        return ResponseEntity.ok(ApiResponse.success(updated, "Printer updated"));
    }

    @DeleteMapping("/printers/{id}")
    @Operation(summary = "Delete printer", description = "Deletes a printer configuration")
    @ApiResponses(value = {
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Printer deleted"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Printer not found")
    })
    public ResponseEntity<ApiResponse<Void>> deletePrinter(@PathVariable String id) {
        receiptUseCase.deletePrinter(id);
        return ResponseEntity.ok(ApiResponse.success(null, "Printer deleted"));
    }

    // ==================== Assignment endpoints ====================

    @GetMapping("/printers/{id}/assignments")
    @Operation(summary = "Get printer assignments", description = "Gets routing assignments for a specific printer")
    @ApiResponses(value = {
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Assignments retrieved")
    })
    public ResponseEntity<ApiResponse<List<PrinterAssignment>>> getAssignments(@PathVariable String id) {
        return ResponseEntity.ok(ApiResponse.success(receiptUseCase.getAssignments(id)));
    }

    @PostMapping("/printers/{id}/assignments")
    @Operation(summary = "Create printer assignment", description = "Creates a new routing assignment for a printer")
    @ApiResponses(value = {
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "201", description = "Assignment created")
    })
    public ResponseEntity<ApiResponse<PrinterAssignment>> createAssignment(
            @PathVariable String id,
            @Valid @RequestBody PrinterAssignmentRequest request) {
        PrinterAssignment assignment = PrinterAssignment.builder()
                .printerId(id)
                .businessId(request.businessId())
                .routingType(RoutingType.valueOf(request.routingType()))
                .routingValue(request.routingValue())
                .priority(request.priority())
                .copies(request.copies() > 0 ? request.copies() : 1)
                .build();
        PrinterAssignment created = receiptUseCase.createAssignment(assignment);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(created, "Assignment created"));
    }

    @DeleteMapping("/assignments/{id}")
    @Operation(summary = "Delete assignment", description = "Deletes a routing assignment")
    @ApiResponses(value = {
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Assignment deleted")
    })
    public ResponseEntity<ApiResponse<Void>> deleteAssignment(@PathVariable String id) {
        receiptUseCase.deleteAssignment(id);
        return ResponseEntity.ok(ApiResponse.success(null, "Assignment deleted"));
    }

    // ==================== Routing endpoint ====================

    @PostMapping("/route")
    @Operation(summary = "Route items to printers", description = "Routes order items to appropriate printers based on flags, categories, and assignments")
    @ApiResponses(value = {
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Items routed successfully")
    })
    public ResponseEntity<ApiResponse<Map<String, List<OrderItem>>>> routeItems(
            @Valid @RequestBody RouteItemsRequest request) {
        List<OrderItem> items = request.items().stream()
                .map(dto -> OrderItem.builder()
                        .id(dto.id())
                        .name(dto.name())
                        .quantity(dto.quantity())
                        .price(dto.price())
                        .categoryId(dto.categoryId())
                        .flags(dto.flags())
                        .notes(dto.notes())
                        .build())
                .collect(Collectors.toList());
        Map<String, List<OrderItem>> routed = receiptUseCase.routeItems(items, request.businessId());
        return ResponseEntity.ok(ApiResponse.success(routed, "Items routed to printers"));
    }

    // ==================== Helper methods ====================

    private Printer toPrinterDomain(PrinterRequest request) {
        return Printer.builder()
                .id(request.id())
                .businessId(request.businessId())
                .name(request.name())
                .type(PrinterType.valueOf(request.type()))
                .connectionType(ConnectionType.valueOf(request.connectionType()))
                .ipAddress(request.ipAddress())
                .port(request.port())
                .macAddress(request.macAddress())
                .paperWidth(PaperWidth.valueOf(request.paperWidth()))
                .hasCutter(request.hasCutter())
                .hasCashDrawer(request.hasCashDrawer())
                .isDefault(request.isDefault())
                .isActive(request.isActive())
                .build();
    }
}
