package com.bukukasir.business.application.dto;

import io.swagger.v3.oas.annotations.media.Schema;

import java.time.Instant;

@Schema(description = "Business response")
public record BusinessResponse(
    @Schema(description = "Business ID") String id,
    @Schema(description = "Business name") String name,
    @Schema(description = "Business type") String type,
    @Schema(description = "Address") String address,
    @Schema(description = "Phone") String phone,
    @Schema(description = "Owner ID") String ownerId,
    @Schema(description = "Logo URL") String logoUrl,
    @Schema(description = "Currency") String currency,
    @Schema(description = "Timezone") String timezone,
    @Schema(description = "Active") boolean active,
    @Schema(description = "Created at") Instant createdAt,
    @Schema(description = "Updated at") Instant updatedAt
) {}
