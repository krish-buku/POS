package com.bukukasir.table.application.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;

@Schema(description = "Area request")
public record AreaRequest(
    @NotBlank @Schema(example = "Indoor") String name,
    @NotBlank @Schema(example = "floor-001") String floorId,
    @Schema(example = "biz-001") String businessId,
    @Schema(example = "1") int sortOrder
) {}
