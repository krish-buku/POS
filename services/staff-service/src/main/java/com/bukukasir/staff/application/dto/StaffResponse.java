package com.bukukasir.staff.application.dto;

import io.swagger.v3.oas.annotations.media.Schema;

import java.time.Instant;
import java.util.Set;

@Schema(description = "Staff response")
public record StaffResponse(
    @Schema(description = "Staff ID") String id,
    @Schema(description = "Name") String name,
    @Schema(description = "Email") String email,
    @Schema(description = "Phone") String phone,
    @Schema(description = "Role") String role,
    @Schema(description = "Business ID") String businessId,
    @Schema(description = "Permissions") Set<String> permissions,
    @Schema(description = "Active") boolean active,
    @Schema(description = "Created at") Instant createdAt,
    @Schema(description = "Updated at") Instant updatedAt
) {}
