package com.bukukasir.staff.infrastructure.persistence.entity;

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
@Table(name = "staff")
public class StaffEntity {

    @Id
    private String id;

    @Column(nullable = false)
    private String name;

    private String email;
    private String phone;
    private String role;
    private String businessId;
    private String pin;
    private String permissions;
    @Column(name = "is_active")
    private boolean active;
    private Instant createdAt;
    private Instant updatedAt;
}
