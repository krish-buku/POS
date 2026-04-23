package com.bukukasir.table.infrastructure.persistence.entity;

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
@Table(name = "areas")
public class AreaEntity {

    @Id
    private String id;

    @Column(name = "business_id", nullable = false)
    private String businessId;

    @Column(name = "floor_id", nullable = false)
    private String floorId;

    @Column(nullable = false)
    private String name;

    @Column(name = "sort_order")
    private int sortOrder;
}
