package com.bukukasir.table.domain.port.in;

import com.bukukasir.table.domain.model.RestaurantTable;
import com.bukukasir.table.domain.model.TableStatus;

import java.util.List;

public interface TableUseCase {
    List<RestaurantTable> getAllTables(String businessId);
    RestaurantTable getTableById(String id);
    RestaurantTable createTable(RestaurantTable table);
    RestaurantTable updateTable(String id, RestaurantTable table);
    void deleteTable(String id);
    RestaurantTable updateStatus(String id, TableStatus status);
    void transferTable(String fromTableId, String toTableId);
    RestaurantTable mergeTables(List<String> tableIds, String targetTableId);
}
