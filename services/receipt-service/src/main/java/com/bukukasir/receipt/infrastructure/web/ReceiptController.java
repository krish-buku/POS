package com.bukukasir.receipt.infrastructure.web;

import com.bukukasir.common.dto.ApiResponse;
import com.bukukasir.receipt.application.dto.PrintReceiptRequest;
import com.bukukasir.receipt.application.dto.TemplateRequest;
import com.bukukasir.receipt.domain.model.PrintJob;
import com.bukukasir.receipt.domain.model.ReceiptTemplate;
import com.bukukasir.receipt.domain.port.in.ReceiptUseCase;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/receipts")
@RequiredArgsConstructor
@Tag(name = "Receipts", description = "Receipt and printing endpoints")
public class ReceiptController {

    private final ReceiptUseCase receiptUseCase;

    @GetMapping("/template")
    @Operation(summary = "Get receipt template")
    public ResponseEntity<ApiResponse<ReceiptTemplate>> getTemplate(
            @RequestParam(defaultValue = "biz-001") String businessId) {
        return ResponseEntity.ok(ApiResponse.success(receiptUseCase.getTemplate(businessId)));
    }

    @PutMapping("/template")
    @Operation(summary = "Update receipt template")
    public ResponseEntity<ApiResponse<ReceiptTemplate>> updateTemplate(@RequestBody TemplateRequest request) {
        ReceiptTemplate template = ReceiptTemplate.builder()
                .id(request.id()).businessId(request.businessId())
                .headerText(request.headerText()).footerText(request.footerText())
                .showLogo(request.showLogo()).showAddress(request.showAddress())
                .showTaxDetails(request.showTaxDetails()).paperWidth(request.paperWidth())
                .build();
        return ResponseEntity.ok(ApiResponse.success(receiptUseCase.updateTemplate(template), "Template updated"));
    }

    @PostMapping("/print")
    @Operation(summary = "Print a receipt")
    public ResponseEntity<ApiResponse<PrintJob>> printReceipt(@Valid @RequestBody PrintReceiptRequest request) {
        PrintJob job = receiptUseCase.printReceipt(request.orderId(), request.orderNumber(), request.businessId());
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(job, "Print job created"));
    }

    @GetMapping("/print-queue")
    @Operation(summary = "Get print queue")
    public ResponseEntity<ApiResponse<List<PrintJob>>> getPrintQueue() {
        return ResponseEntity.ok(ApiResponse.success(receiptUseCase.getPrintQueue()));
    }
}
