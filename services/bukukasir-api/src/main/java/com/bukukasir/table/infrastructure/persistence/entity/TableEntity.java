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
@Table(name = "restaurant_tables")
public class TableEntity {

    @Id
    private String id;

    @Column(nullable = false)
    private String name;

    private int capacity;
    private String status;
    private String areaId;
    private String floorId;
    private String businessId;
    private String currentOrderId;
}
