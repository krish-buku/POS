package com.bukukasir.order.domain.port.in;

import com.bukukasir.order.domain.model.Order;
import com.bukukasir.order.domain.model.OrderItem;

import java.util.List;

public interface OrderUseCase {
    Order createOrder(Order order);
    Order getOrderById(String id);
    List<Order> getOrdersByTableId(String tableId);
    List<Order> getAllOrders();
    Order addItems(String orderId, List<OrderItem> items);
    Order voidOrder(String orderId, String reason);
    Order markOrderPaid(String orderId, String paymentMethodName);
}
