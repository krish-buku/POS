package com.bukukasir.auth.infrastructure.persistence.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SessionEntity {

    private String sessionId;
    private String staffId;
    private String staffName;
    private String role;
    private String businessId;
    private Instant createdAt;
    private Instant expiresAt;
    private boolean active;
}
