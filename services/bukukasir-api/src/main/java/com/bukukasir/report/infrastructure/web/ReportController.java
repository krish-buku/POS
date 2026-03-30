package com.bukukasir.report.infrastructure.web;

import com.bukukasir.common.dto.ApiResponse;
import com.bukukasir.report.domain.model.DailySummary;
import com.bukukasir.report.domain.model.PaymentMethodBreakdown;
import com.bukukasir.report.domain.model.SalesReport;
import com.bukukasir.report.domain.port.in.ReportUseCase;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/reports")
@RequiredArgsConstructor
@Tag(name = "Reports", description = "Reporting and analytics endpoints")
public class ReportController {

    private final ReportUseCase reportUseCase;

    @GetMapping("/daily-summary")
    @Operation(summary = "Get daily summary")
    public ResponseEntity<ApiResponse<DailySummary>> getDailySummary(
            @RequestParam(required = false) String date) {
        return ResponseEntity.ok(ApiResponse.success(reportUseCase.getDailySummary(date)));
    }

    @GetMapping("/sales")
    @Operation(summary = "Get sales report")
    public ResponseEntity<ApiResponse<SalesReport>> getSalesReport(
            @RequestParam(required = false, defaultValue = "today") String period) {
        return ResponseEntity.ok(ApiResponse.success(reportUseCase.getSalesReport(period)));
    }

    @GetMapping("/payment-methods")
    @Operation(summary = "Get payment method breakdown")
    public ResponseEntity<ApiResponse<List<PaymentMethodBreakdown>>> getPaymentMethodBreakdown() {
        return ResponseEntity.ok(ApiResponse.success(reportUseCase.getPaymentMethodBreakdown()));
    }

    @GetMapping("/top-items")
    @Operation(summary = "Get top selling items")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getTopItems(
            @RequestParam(required = false, defaultValue = "5") int limit) {
        return ResponseEntity.ok(ApiResponse.success(reportUseCase.getTopItems(limit)));
    }

    @GetMapping("/staff-performance")
    @Operation(summary = "Get staff performance report")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getStaffPerformance() {
        return ResponseEntity.ok(ApiResponse.success(reportUseCase.getStaffPerformance()));
    }
}
