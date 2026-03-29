package com.bukukasir.table.application.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Positive;

@Schema(description = "Table request")
public record TableRequest(
    @NotBlank(message = "Name is required") @Schema(example = "T1") String name,
    @Positive @Schema(example = "4") int capacity,
    @Schema(example = "area-001") String areaId,
    @Schema(example = "floor-001") String floorId,
    @Schema(example = "biz-001") String businessId
) {}
