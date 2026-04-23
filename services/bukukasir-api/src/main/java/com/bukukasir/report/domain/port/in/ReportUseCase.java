package com.bukukasir.report.domain.port.in;

import com.bukukasir.report.domain.model.DailySummary;
import com.bukukasir.report.domain.model.PaymentMethodBreakdown;
import com.bukukasir.report.domain.model.SalesReport;

import java.util.List;
import java.util.Map;

public interface ReportUseCase {
    DailySummary getDailySummary(String date, String businessId);
    SalesReport getSalesReport(String period, String businessId);
    List<PaymentMethodBreakdown> getPaymentMethodBreakdown(String businessId);
    List<Map<String, Object>> getTopItems(int limit, String businessId);
    List<Map<String, Object>> getStaffPerformance(String businessId);
}
