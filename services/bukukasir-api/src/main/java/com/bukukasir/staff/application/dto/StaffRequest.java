package com.bukukasir.staff.application.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;

import java.util.Set;

@Schema(description = "Request to create or update staff")
public record StaffRequest(
    @NotBlank(message = "Name is required")
    @Schema(description = "Staff name", example = "Budi Santoso") String name,
    @Schema(description = "Email", example = "budi@warung.com") String email,
    @Schema(description = "Phone", example = "+62-812-3456-7890") String phone,
    @NotBlank(message = "Role is required")
    @Schema(description = "Role", example = "CASHIER") String role,
    @NotBlank(message = "Business ID is required")
    @Schema(description = "Business ID", example = "biz-001") String businessId,
    @Schema(description = "PIN (4-6 digits)") String pin,
    @Schema(description = "Permissions") Set<String> permissions,
    @Schema(description = "Active status", example = "true") boolean active
) {}
