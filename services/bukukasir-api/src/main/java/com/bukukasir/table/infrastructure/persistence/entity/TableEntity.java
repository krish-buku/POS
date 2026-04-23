package com.bukukasir.table.infrastructure.persistence.entity;

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
@Table(name = "restaurant_tables")
public class TableEntity {

    @Id
    private String id;

    @Column(name = "business_id")
    private String businessId;

    @Column(name = "number")
    private String number;

    @Column(nullable = false)
    private String name;

    private int capacity;

    private String status;

    @Column(name = "area_id")
    private String areaId;

    @Column(name = "floor_id")
    private String floorId;

    @Column(name = "current_order_id")
    private String currentOrderId;

    @Column(name = "assigned_staff_id")
    private String assignedStaffId;

    @Column(name = "running_total")
    private BigDecimal runningTotal;
}
