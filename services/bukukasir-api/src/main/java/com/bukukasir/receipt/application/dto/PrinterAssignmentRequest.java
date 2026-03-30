package com.bukukasir.receipt.application.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

@Schema(description = "Request to create a printer routing assignment")
public record PrinterAssignmentRequest(

    @NotBlank
    @Schema(description = "Business ID", example = "biz-001")
    String businessId,

    @NotNull
    @Schema(description = "Routing type: FLAG, CATEGORY, ALL", example = "FLAG")
    String routingType,

    @Schema(description = "Routing value (flag name or category ID)", example = "KITCHEN")
    String routingValue,

    @Schema(description = "Priority (lower = higher priority)", example = "1")
    int priority,

    @Schema(description = "Number of copies to print", example = "1")
    int copies
) {}
