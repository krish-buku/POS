package com.bukukasir.business.infrastructure.persistence.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "customers")
public class CustomerEntity {

    @Id
    private String id;

    @Column(nullable = false)
    private String businessId;

    private String phone;
    private String name;
    private String email;
    private LocalDate dateOfBirth;
    private String gender;
    private String notes;
    private int totalOrders;
    private BigDecimal totalSpent;
    private Instant lastOrderAt;
    private boolean smsOptIn;
    private boolean emailOptIn;
    private boolean whatsappOptIn;
    private Instant createdAt;
    private Instant updatedAt;
}
