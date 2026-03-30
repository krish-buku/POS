package com.bukukasir.shift.application.dto;

import io.swagger.v3.oas.annotations.media.Schema;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Schema(description = "Shift response with details")
public record ShiftResponse(

    @Schema(description = "Shift ID", example = "shift-001")
    String id,

    @Schema(description = "Business ID", example = "biz-001")
    String businessId,

    @Schema(description = "Staff ID", example = "staff-003")
    String staffId,

    @Schema(description = "Staff name", example = "Budi Kasir")
    String staffName,

    @Schema(description = "When the shift was opened")
    LocalDateTime openedAt,

    @Schema(description = "When the shift was closed (null if still open)")
    LocalDateTime closedAt,

    @Schema(description = "Opening cash amount", example = "500000")
    BigDecimal openingCash,

    @Schema(description = "Closing cash amount (actual counted)", example = "1250000")
    BigDecimal closingCash,

    @Schema(description = "Expected cash (calculated)", example = "1245000")
    BigDecimal expectedCash,

    @Schema(description = "Variance: closingCash - expectedCash", example = "5000")
    BigDecimal variance,

    @Schema(description = "Shift status", example = "OPEN")
    String status,

    @Schema(description = "Total sales during shift", example = "3500000")
    BigDecimal totalSales,

    @Schema(description = "Total number of orders", example = "25")
    int totalOrders,

    @Schema(description = "Cash payment total", example = "750000")
    BigDecimal cashPayments,

    @Schema(description = "QRIS payment total", example = "1500000")
    BigDecimal qrisPayments,

    @Schema(description = "EDC payment total", example = "1000000")
    BigDecimal edcPayments,

    @Schema(description = "Other payment total", example = "250000")
    BigDecimal otherPayments,

    @Schema(description = "Cash movements during shift")
    List<CashMovementResponse> cashMovements,

    @Schema(description = "Optional notes")
    String notes
) {

    @Schema(description = "Cash movement entry")
    public record CashMovementResponse(
        String id,
        String shiftId,
        String type,
        BigDecimal amount,
        String reason,
        String staffId,
        LocalDateTime createdAt
    ) {}
}
