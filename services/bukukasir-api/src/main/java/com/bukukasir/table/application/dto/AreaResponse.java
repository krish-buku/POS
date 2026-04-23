package com.bukukasir.table.application.dto;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "Area response")
public record AreaResponse(
    String id, String businessId, String floorId, String name, int sortOrder
) {}
