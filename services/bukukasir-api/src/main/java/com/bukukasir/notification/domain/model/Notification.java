package com.bukukasir.notification.domain.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Notification {
    private String id;
    private NotificationType type;
    private String title;
    private String message;
    private String targetStaffId;
    private String businessId;
    private boolean read;
    private Instant createdAt;
}
