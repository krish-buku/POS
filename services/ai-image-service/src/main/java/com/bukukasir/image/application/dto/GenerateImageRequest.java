package com.bukukasir.image.application.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;

@Schema(description = "Generate image request")
public record GenerateImageRequest(
    @NotBlank String prompt,
    @NotBlank String menuItemId,
    String menuItemName,
    @Schema(example = "biz-001") String businessId
) {}
