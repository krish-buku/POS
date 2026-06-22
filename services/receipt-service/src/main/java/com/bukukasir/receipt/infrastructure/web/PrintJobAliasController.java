package com.bukukasir.receipt.infrastructure.web;

import com.bukukasir.common.dto.ApiResponse;
import com.bukukasir.receipt.domain.model.PrintJob;
import com.bukukasir.receipt.domain.port.in.ReceiptUseCase;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.List;

@RestController
@RequestMapping("/api/print-jobs")
@RequiredArgsConstructor
@Tag(name = "Print jobs", description = "Mobile printer fallback aliases")
public class PrintJobAliasController {
    private final ReceiptUseCase receiptUseCase;

    @GetMapping
    @Operation(summary = "List print jobs for a business")
    public ResponseEntity<ApiResponse<List<PrintJob>>> getPrintJobs(
            @RequestParam(defaultValue = "biz-001") String businessId) {
        List<PrintJob> jobs = receiptUseCase.getPrintQueue().stream()
                .filter(job -> businessId.equals(job.getBusinessId()))
                .toList();
        return ResponseEntity.ok(ApiResponse.success(jobs));
    }

    @PostMapping
    @Operation(summary = "Create a print job")
    public ResponseEntity<ApiResponse<PrintJob>> createPrintJob(
            @Valid @RequestBody PrintJobRequest request) {
        String orderId = request.orderId() == null || request.orderId().isBlank()
                ? "mobile-local-" + Instant.now().toEpochMilli()
                : request.orderId();
        PrintJob job = receiptUseCase.printReceipt(orderId, request.type().toUpperCase() + "-" + orderId, request.businessId());
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(job, "Print job created"));
    }

    public record PrintJobRequest(@NotBlank String businessId, String orderId, @NotBlank String type, String printerName) {}
}
