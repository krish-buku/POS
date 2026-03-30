package com.bukukasir.order.domain.port.out;

import com.bukukasir.order.domain.model.Order;

import java.util.List;
import java.util.Optional;

public interface OrderRepository {
    List<Order> findAll();
    Optional<Order> findById(String id);
    List<Order> findByTableId(String tableId);
    Order save(Order order);
}
