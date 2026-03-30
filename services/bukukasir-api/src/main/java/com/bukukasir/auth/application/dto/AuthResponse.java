package com.bukukasir.auth.application.dto;

import io.swagger.v3.oas.annotations.media.Schema;

import java.time.Instant;

@Schema(description = "Authentication response with session details")
public record AuthResponse(

    @Schema(description = "Session ID", example = "550e8400-e29b-41d4-a716-446655440000")
    String sessionId,

    @Schema(description = "Staff ID", example = "staff-001")
    String staffId,

    @Schema(description = "Staff name", example = "Budi Santoso")
    String staffName,

    @Schema(description = "Staff role", example = "OWNER")
    String role,

    @Schema(description = "Business ID", example = "biz-001")
    String businessId,

    @Schema(description = "Session expiration time")
    Instant expiresAt
) {}
