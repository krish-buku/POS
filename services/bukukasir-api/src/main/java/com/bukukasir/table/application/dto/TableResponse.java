package com.bukukasir.table.application.dto;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "Table response")
public record TableResponse(
    String id, String name, int capacity, String status,
    String areaId, String floorId, String businessId, String currentOrderId,
    String assignedStaffId
) {}
