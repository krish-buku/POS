package com.bukukasir.table.application.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;

@Schema(description = "Transfer table request")
public record TransferTableRequest(
    @NotBlank @Schema(example = "table-001") String fromTableId,
    @NotBlank @Schema(example = "table-005") String toTableId
) {}
