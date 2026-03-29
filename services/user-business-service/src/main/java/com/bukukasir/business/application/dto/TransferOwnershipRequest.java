package com.bukukasir.business.application.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;

@Schema(description = "Request to transfer business ownership")
public record TransferOwnershipRequest(

    @NotBlank(message = "Business ID is required")
    @Schema(description = "Business ID", example = "biz-001")
    String businessId,

    @NotBlank(message = "Current owner ID is required")
    @Schema(description = "Current owner ID", example = "user-001")
    String fromOwnerId,

    @NotBlank(message = "New owner ID is required")
    @Schema(description = "New owner ID", example = "user-002")
    String toOwnerId
) {}
