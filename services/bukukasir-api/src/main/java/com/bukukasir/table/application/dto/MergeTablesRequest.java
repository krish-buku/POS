package com.bukukasir.table.application.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;

import java.util.List;

@Schema(description = "Merge tables request")
public record MergeTablesRequest(
    @NotEmpty @Schema(description = "Table IDs to merge") List<String> tableIds,
    @NotBlank @Schema(description = "Target table ID") String targetTableId
) {}
