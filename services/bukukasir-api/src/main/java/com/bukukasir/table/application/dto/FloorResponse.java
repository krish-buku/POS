package com.bukukasir.table.application.dto;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "Floor response")
public record FloorResponse(
    String id, String businessId, String name, int sortOrder
) {}
