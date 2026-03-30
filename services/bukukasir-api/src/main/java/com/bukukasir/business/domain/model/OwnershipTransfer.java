package com.bukukasir.business.domain.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OwnershipTransfer {

    private String id;
    private String businessId;
    private String fromOwnerId;
    private String toOwnerId;
    private String status; // PENDING, COMPLETED, CANCELLED
    private Instant requestedAt;
    private Instant completedAt;
}
