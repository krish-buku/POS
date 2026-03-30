package com.bukukasir.receipt.infrastructure.persistence.entity;

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
@Table(name = "printer_assignments")
public class PrinterAssignmentEntity {

    @Id
    private String id;

    @Column(nullable = false)
    private String printerId;

    @Column(nullable = false)
    private String businessId;

    private String routingType;
    private String routingValue;
    private int priority;
    @Builder.Default
    private int copies = 1;
}
