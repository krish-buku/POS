package com.bukukasir.notification.infrastructure.persistence.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "notifications")
public class NotificationEntity {

    @Id
    private String id;

    @Column(nullable = false)
    private String type;

    private String title;
    private String message;
    private String targetStaffId;
    private String businessId;
    @Column(name = "is_read")
    private boolean read;
    private Instant createdAt;
}
