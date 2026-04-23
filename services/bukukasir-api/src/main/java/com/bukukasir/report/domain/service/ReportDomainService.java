package com.bukukasir.report.domain.service;

import com.bukukasir.order.domain.model.Order;
import com.bukukasir.order.domain.model.OrderItem;
import com.bukukasir.order.domain.model.OrderStatus;
import com.bukukasir.order.domain.port.out.OrderRepository;
import com.bukukasir.report.domain.model.DailySummary;
import com.bukukasir.report.domain.model.PaymentMethodBreakdown;
import com.bukukasir.report.domain.model.SalesReport;
import com.bukukasir.report.domain.port.in.ReportUseCase;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ReportDomainService implements ReportUseCase {

    private final OrderRepository orderRepository;

    private List<Order> ordersFor(String businessId) {
        return orderRepository.findAll().stream()
                .filter(o -> businessId == null || businessId.equals(o.getBusinessId()))
                .filter(o -> o.getStatus() != OrderStatus.VOIDED)
                .toList();
    }

    @Override
    public DailySummary getDailySummary(String date, String businessId) {
        LocalDate target = date != null ? LocalDate.parse(date) : LocalDate.now();
        List<Order> orders = ordersFor(businessId).stream()
                .filter(o -> {
                    if (o.getCreatedAt() == null) return false;
                    LocalDate d = LocalDate.ofInstant(o.getCreatedAt(), ZoneId.systemDefault());
                    return d.equals(target);
                })
                .toList();

        BigDecimal revenue = orders.stream()
                .map(Order::getTotal)
                .filter(Objects::nonNull)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal tax = orders.stream()
                .map(Order::getTax)
                .filter(Objects::nonNull)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        int totalItems = orders.stream()
                .flatMap(o -> o.getItems() == null ? java.util.stream.Stream.<OrderItem>empty() : o.getItems().stream())
                .mapToInt(OrderItem::getQuantity)
                .sum();
        BigDecimal avg = orders.isEmpty()
                ? BigDecimal.ZERO
                : revenue.divide(BigDecimal.valueOf(orders.size()), 0, RoundingMode.HALF_UP);
        int voidCount = (int) orderRepository.findAll().stream()
                .filter(o -> businessId == null || businessId.equals(o.getBusinessId()))
                .filter(o -> o.getStatus() == OrderStatus.VOIDED)
                .count();

        return DailySummary.builder()
                .date(target)
                .totalRevenue(revenue)
                .totalOrders(orders.size())
                .totalItems(totalItems)
                .averageOrderValue(avg)
                .voidedOrders(voidCount)
                .taxCollected(tax)
                .build();
    }

    @Override
    public SalesReport getSalesReport(String period, String businessId) {
        DailySummary today = getDailySummary(null, businessId);
        return SalesReport.builder()
                .period(period != null ? period : "today")
                .totalSales(today.getTotalRevenue())
                .totalTransactions(today.getTotalOrders())
                .dailyBreakdown(List.of(today))
                .build();
    }

    @Override
    public List<PaymentMethodBreakdown> getPaymentMethodBreakdown(String businessId) {
        // Order domain doesn't carry paymentMethod (it lives in the Payment aggregate).
        // Client derives this from the orders list; server returns empty for now.
        return List.of();
    }

    @Override
    public List<Map<String, Object>> getTopItems(int limit, String businessId) {
        Map<String, int[]> qtyById = new HashMap<>();
        Map<String, BigDecimal> revById = new HashMap<>();
        Map<String, String> nameById = new HashMap<>();

        for (Order o : ordersFor(businessId)) {
            if (o.getItems() == null) continue;
            for (OrderItem it : o.getItems()) {
                String key = it.getMenuItemId() != null ? it.getMenuItemId() : it.getMenuItemName();
                if (key == null) continue;
                nameById.putIfAbsent(key, it.getMenuItemName() != null ? it.getMenuItemName() : key);
                qtyById.computeIfAbsent(key, k -> new int[]{0})[0] += it.getQuantity();
                revById.merge(key, it.getSubtotal() != null ? it.getSubtotal() : BigDecimal.ZERO, BigDecimal::add);
            }
        }

        return qtyById.entrySet().stream()
                .sorted((a, b) -> Integer.compare(b.getValue()[0], a.getValue()[0]))
                .limit(limit > 0 ? limit : 5)
                .map(e -> {
                    Map<String, Object> row = new LinkedHashMap<>();
                    row.put("menuItemId", e.getKey());
                    row.put("menuItemName", nameById.get(e.getKey()));
                    row.put("quantitySold", e.getValue()[0]);
                    row.put("revenue", revById.getOrDefault(e.getKey(), BigDecimal.ZERO));
                    return row;
                })
                .collect(Collectors.toList());
    }

    @Override
    public List<Map<String, Object>> getStaffPerformance(String businessId) {
        Map<String, int[]> countByStaff = new HashMap<>();
        Map<String, BigDecimal> salesByStaff = new HashMap<>();
        Map<String, String> nameByStaff = new HashMap<>();

        for (Order o : ordersFor(businessId)) {
            String sid = o.getStaffId();
            if (sid == null) continue;
            nameByStaff.putIfAbsent(sid, o.getStaffName() != null ? o.getStaffName() : sid);
            countByStaff.computeIfAbsent(sid, k -> new int[]{0})[0] += 1;
            salesByStaff.merge(sid, o.getTotal() != null ? o.getTotal() : BigDecimal.ZERO, BigDecimal::add);
        }

        return countByStaff.entrySet().stream()
                .sorted((a, b) -> salesByStaff.getOrDefault(b.getKey(), BigDecimal.ZERO)
                        .compareTo(salesByStaff.getOrDefault(a.getKey(), BigDecimal.ZERO)))
                .map(e -> {
                    Map<String, Object> row = new LinkedHashMap<>();
                    row.put("staffId", e.getKey());
                    row.put("staffName", nameByStaff.get(e.getKey()));
                    row.put("ordersHandled", e.getValue()[0]);
                    row.put("totalSales", salesByStaff.getOrDefault(e.getKey(), BigDecimal.ZERO));
                    return row;
                })
                .collect(Collectors.toList());
    }
}
