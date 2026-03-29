package com.bukukasir.auth.domain.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

/**
 * Entity representing an active user session.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Session {

    private String sessionId;
    private String staffId;
    private String staffName;
    private Role role;
    private String businessId;
    private Instant createdAt;
    private Instant expiresAt;
    private boolean active;
}
