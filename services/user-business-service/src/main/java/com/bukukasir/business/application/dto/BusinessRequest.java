package com.bukukasir.business.application.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;

@Schema(description = "Request to create or update a business")
public record BusinessRequest(

    @NotBlank(message = "Business name is required")
    @Schema(description = "Business name", example = "Warung Nusantara")
    String name,

    @NotBlank(message = "Business type is required")
    @Schema(description = "Business type", example = "restaurant")
    String type,

    @Schema(description = "Business address", example = "Jl. Sudirman No. 123, Jakarta")
    String address,

    @Schema(description = "Business phone", example = "+62-21-5551234")
    String phone,

    @Schema(description = "Owner ID", example = "user-001")
    String ownerId,

    @Schema(description = "Logo URL")
    String logoUrl
) {}
