package com.bukukasir.receipt.domain.service;

import com.bukukasir.receipt.domain.model.*;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class PrintRoutingService {

    /**
     * Routes order items to printers based on printer assignments.
     * For each item:
     *   1. Check item flags against FLAG assignments
     *   2. Check item category against CATEGORY assignments
     *   3. Fall back to ALL/default printer
     * Group items by target printer.
     *
     * @return Map of printerId to List of OrderItems routed to that printer
     */
    public Map<String, List<OrderItem>> routeItems(
            List<OrderItem> items,
            List<PrinterAssignment> assignments,
            List<Printer> printers) {

        Map<String, List<OrderItem>> result = new LinkedHashMap<>();

        // Sort assignments by priority (lower number = higher priority)
        List<PrinterAssignment> sortedAssignments = assignments.stream()
                .sorted(Comparator.comparingInt(PrinterAssignment::getPriority))
                .toList();

        // Find the default/ALL printer assignment
        Optional<PrinterAssignment> allAssignment = sortedAssignments.stream()
                .filter(a -> a.getRoutingType() == RoutingType.ALL)
                .findFirst();

        // Build a set of active printer IDs for quick lookup
        Set<String> activePrinterIds = printers.stream()
                .filter(Printer::isActive)
                .map(Printer::getId)
                .collect(Collectors.toSet());

        for (OrderItem item : items) {
            String targetPrinterId = null;

            // 1. Check item flags against FLAG assignments
            if (item.getFlags() != null && !item.getFlags().isEmpty()) {
                for (PrinterAssignment assignment : sortedAssignments) {
                    if (assignment.getRoutingType() == RoutingType.FLAG
                            && activePrinterIds.contains(assignment.getPrinterId())
                            && item.getFlags().contains(assignment.getRoutingValue())) {
                        targetPrinterId = assignment.getPrinterId();
                        break;
                    }
                }
            }

            // 2. Check item category against CATEGORY assignments
            if (targetPrinterId == null && item.getCategoryId() != null) {
                for (PrinterAssignment assignment : sortedAssignments) {
                    if (assignment.getRoutingType() == RoutingType.CATEGORY
                            && activePrinterIds.contains(assignment.getPrinterId())
                            && item.getCategoryId().equals(assignment.getRoutingValue())) {
                        targetPrinterId = assignment.getPrinterId();
                        break;
                    }
                }
            }

            // 3. Fall back to ALL/default printer
            if (targetPrinterId == null && allAssignment.isPresent()
                    && activePrinterIds.contains(allAssignment.get().getPrinterId())) {
                targetPrinterId = allAssignment.get().getPrinterId();
            }

            // 4. Final fallback: any default printer
            if (targetPrinterId == null) {
                targetPrinterId = printers.stream()
                        .filter(p -> p.isDefault() && p.isActive())
                        .map(Printer::getId)
                        .findFirst()
                        .orElse("unrouted");
            }

            result.computeIfAbsent(targetPrinterId, k -> new ArrayList<>()).add(item);
        }

        return result;
    }
}
