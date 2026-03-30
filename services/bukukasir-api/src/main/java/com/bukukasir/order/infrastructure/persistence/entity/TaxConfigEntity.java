package com.bukukasir.order.infrastructure.persistence.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "tax_configs")
public class TaxConfigEntity {

    @Id
    @Column(name = "id")
    private String id;

    @Column(name = "business_id")
    private String businessId;

    @Column(name = "name")
    private String name;

    @Column(name = "rate")
    private BigDecimal rate;

    @Column(name = "inclusive")
    private boolean inclusive;

    @Column(name = "active")
    private boolean active;

    @Column(name = "priority")
    private int priority;
}
