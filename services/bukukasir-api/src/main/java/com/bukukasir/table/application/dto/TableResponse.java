package com.bukukasir.table.application.dto;

import io.swagger.v3.oas.annotations.media.Schema;

import java.math.BigDecimal;

@Schema(description = "Table response")
public record TableResponse(
    String id,
    String number,
    String name,
    int capacity,
    String status,
    String areaId,
    String floorId,
    String businessId,
    String currentOrderId,
    String assignedStaffId,
    BigDecimal runningTotal
) {}
