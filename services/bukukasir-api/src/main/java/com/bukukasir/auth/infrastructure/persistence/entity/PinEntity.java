package com.bukukasir.auth.infrastructure.persistence.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "pins")
public class PinEntity {

    @Id
    @Column(name = "staff_id")
    private String staffId;

    @Column(name = "staff_name")
    private String staffName;

    @Column(name = "hashed_pin")
    private String hashedPin;

    @Column(name = "role")
    private String role;

    @Column(name = "business_id")
    private String businessId;

    @Column(name = "active")
    private boolean active;
}
