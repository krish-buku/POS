package com.bukukasir.report.domain.port.in;

import com.bukukasir.report.domain.model.DailySummary;
import com.bukukasir.report.domain.model.PaymentMethodBreakdown;
import com.bukukasir.report.domain.model.SalesReport;

import java.util.List;
import java.util.Map;

public interface ReportUseCase {
    DailySummary getDailySummary(String date);
    SalesReport getSalesReport(String period);
    List<PaymentMethodBreakdown> getPaymentMethodBreakdown();
    List<Map<String, Object>> getTopItems(int limit);
    List<Map<String, Object>> getStaffPerformance();
}
