package com.bukukasir.staff.domain.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.Set;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Staff {

    private String id;
    private String name;
    private String email;
    private String phone;
    private StaffRole role;
    private String businessId;
    private String pin;
    private Set<Permission> permissions;
    private boolean active;
    private Instant createdAt;
    private Instant updatedAt;
}
