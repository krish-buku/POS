package com.bukukasir.common.audit;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuditLog {
    private String id;
    private String actorId;        // staff/user who performed action
    private String actorName;
    private String businessId;
    private AuditAction action;    // CREATE, UPDATE, DELETE, VOID, APPROVE, LOGIN, LOGOUT
    private String entityType;     // "Order", "Payment", "MenuItem", "Staff", etc.
    private String entityId;
    private String description;    // Human-readable: "Budi created order ORD-006 for table T5"
    private Map<String, Object> oldValues;  // JSON of previous state (null for CREATE)
    private Map<String, Object> newValues;  // JSON of new state (null for DELETE)
    private String ipAddress;
    private LocalDateTime timestamp;
}
