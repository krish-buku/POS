package com.bukukasir.report.domain.service;

import com.bukukasir.report.domain.model.DailySummary;
import com.bukukasir.report.domain.model.PaymentMethodBreakdown;
import com.bukukasir.report.domain.model.SalesReport;
import com.bukukasir.report.domain.port.in.ReportUseCase;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@Service
public class ReportDomainService implements ReportUseCase {

    @Override
    public DailySummary getDailySummary(String date) {
        return DailySummary.builder()
                .date(date != null ? LocalDate.parse(date) : LocalDate.now())
                .totalRevenue(new BigDecimal("2850000"))
                .totalOrders(47)
                .totalItems(156)
                .averageOrderValue(new BigDecimal("60638"))
                .voidedOrders(2)
                .taxCollected(new BigDecimal("313500"))
                .build();
    }

    @Override
    public SalesReport getSalesReport(String period) {
        return SalesReport.builder()
                .period(period != null ? period : "today")
                .totalSales(new BigDecimal("2850000"))
                .totalTransactions(47)
                .dailyBreakdown(List.of(getDailySummary(null)))
                .build();
    }

    @Override
    public List<PaymentMethodBreakdown> getPaymentMethodBreakdown() {
        return List.of(
                PaymentMethodBreakdown.builder().paymentMethod("Cash").totalAmount(new BigDecimal("1140000")).transactionCount(22).percentage(40.0).build(),
                PaymentMethodBreakdown.builder().paymentMethod("QRIS").totalAmount(new BigDecimal("855000")).transactionCount(15).percentage(30.0).build(),
                PaymentMethodBreakdown.builder().paymentMethod("GoPay").totalAmount(new BigDecimal("570000")).transactionCount(7).percentage(20.0).build(),
                PaymentMethodBreakdown.builder().paymentMethod("BCA Debit").totalAmount(new BigDecimal("285000")).transactionCount(3).percentage(10.0).build()
        );
    }

    @Override
    public List<Map<String, Object>> getTopItems(int limit) {
        return List.of(
                Map.of("rank", 1, "menuItemName", "Nasi Goreng Spesial", "quantitySold", 28, "revenue", new BigDecimal("700000")),
                Map.of("rank", 2, "menuItemName", "Es Teh Manis", "quantitySold", 35, "revenue", new BigDecimal("280000")),
                Map.of("rank", 3, "menuItemName", "Ayam Bakar", "quantitySold", 15, "revenue", new BigDecimal("525000")),
                Map.of("rank", 4, "menuItemName", "Kopi Susu", "quantitySold", 20, "revenue", new BigDecimal("300000")),
                Map.of("rank", 5, "menuItemName", "Soto Ayam", "quantitySold", 12, "revenue", new BigDecimal("240000"))
        );
    }

    @Override
    public List<Map<String, Object>> getStaffPerformance() {
        return List.of(
                Map.of("staffId", "staff-003", "staffName", "Ahmad Wijaya", "ordersHandled", 25, "totalSales", new BigDecimal("1425000")),
                Map.of("staffId", "staff-004", "staffName", "Dewi Lestari", "ordersHandled", 22, "totalSales", new BigDecimal("1425000"))
        );
    }
}
