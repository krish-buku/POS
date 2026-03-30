package com.bukukasir.menu.application.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;

@Schema(description = "Category request")
public record CategoryRequest(
    @NotBlank(message = "Name is required") @Schema(example = "Makanan") String name,
    @Schema(example = "Hidangan utama") String description,
    @Schema(example = "biz-001") String businessId,
    @Schema(example = "1") int sortOrder
) {}
