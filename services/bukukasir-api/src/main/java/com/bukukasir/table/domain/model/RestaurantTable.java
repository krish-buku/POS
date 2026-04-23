package com.bukukasir.table.domain.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RestaurantTable {
    private String id;
    private String number;
    private String name;
    private int capacity;
    private TableStatus status;
    private String areaId;
    private String floorId;
    private String businessId;
    private String currentOrderId;
    private String assignedStaffId;
    private java.math.BigDecimal runningTotal;
}
