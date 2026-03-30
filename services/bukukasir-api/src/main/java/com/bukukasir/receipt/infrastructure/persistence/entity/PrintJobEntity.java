package com.bukukasir.receipt.infrastructure.persistence.entity;

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
@Table(name = "print_jobs")
public class PrintJobEntity {

    @Id
    private String id;

    @Column(nullable = false)
    private String orderId;

    private String orderNumber;
    private String status;
    private String printerName;
    private int copies;
    private String businessId;
    private Instant createdAt;
    private Instant completedAt;
}
