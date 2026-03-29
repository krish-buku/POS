package com.bukukasir.common.audit;

import io.swagger.v3.oas.annotations.media.Schema;

import java.time.LocalDateTime;
import java.util.Map;

@Schema(description = "Audit log entry")
public record AuditLogDTO(
        @Schema(description = "Audit log ID", example = "audit-001")
        String id,

        @Schema(description = "ID of the actor who performed the action", example = "staff-001")
        String actorId,

        @Schema(description = "Name of the actor", example = "Budi Santoso")
        String actorName,

        @Schema(description = "Business ID", example = "biz-001")
        String businessId,

        @Schema(description = "Action performed", example = "CREATE")
        AuditAction action,

        @Schema(description = "Entity type", example = "Order")
        String entityType,

        @Schema(description = "Entity ID", example = "order-001")
        String entityId,

        @Schema(description = "Human-readable description", example = "Budi created order ORD-001 for table T1")
        String description,

        @Schema(description = "Previous state (null for CREATE)")
        Map<String, Object> oldValues,

        @Schema(description = "New state (null for DELETE)")
        Map<String, Object> newValues,

        @Schema(description = "IP address of the request")
        String ipAddress,

        @Schema(description = "Timestamp of the action")
        LocalDateTime timestamp
) {
    public static AuditLogDTO from(AuditLog log) {
        return new AuditLogDTO(
                log.getId(),
                log.getActorId(),
                log.getActorName(),
                log.getBusinessId(),
                log.getAction(),
                log.getEntityType(),
                log.getEntityId(),
                log.getDescription(),
                log.getOldValues(),
                log.getNewValues(),
                log.getIpAddress(),
                log.getTimestamp()
        );
    }
}
