package com.bukukasir.report.domain.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SalesReport {
    private String period;
    private BigDecimal totalSales;
    private int totalTransactions;
    private List<DailySummary> dailyBreakdown;
}
