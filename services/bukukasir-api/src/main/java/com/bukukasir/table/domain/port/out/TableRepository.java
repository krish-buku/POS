package com.bukukasir.table.domain.port.out;

import com.bukukasir.table.domain.model.RestaurantTable;

import java.util.List;
import java.util.Optional;

public interface TableRepository {
    List<RestaurantTable> findAll();
    Optional<RestaurantTable> findById(String id);
    RestaurantTable save(RestaurantTable table);
    void deleteById(String id);
}
