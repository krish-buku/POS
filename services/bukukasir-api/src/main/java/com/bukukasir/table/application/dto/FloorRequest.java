package com.bukukasir.table.application.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;

@Schema(description = "Floor request")
public record FloorRequest(
    @NotBlank @Schema(example = "Lantai 1") String name,
    @Schema(example = "biz-001") String businessId,
    @Schema(example = "1") int sortOrder
) {}
