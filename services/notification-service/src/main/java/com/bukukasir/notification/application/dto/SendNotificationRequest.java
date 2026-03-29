package com.bukukasir.notification.application.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;

@Schema(description = "Send notification request")
public record SendNotificationRequest(
    @NotBlank String type,
    @NotBlank String title,
    @NotBlank String message,
    String targetStaffId,
    @Schema(example = "biz-001") String businessId
) {}
