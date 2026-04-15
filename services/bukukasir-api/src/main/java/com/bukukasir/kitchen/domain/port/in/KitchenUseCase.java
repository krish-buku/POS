package com.bukukasir.kitchen.domain.port.in;

import com.bukukasir.kitchen.domain.model.KitchenTicket;
import com.bukukasir.kitchen.domain.model.TicketStatus;
import com.bukukasir.order.domain.model.Order;

import java.util.List;

public interface KitchenUseCase {
    List<KitchenTicket> getAllTickets();
    KitchenTicket getTicketById(String id);
    KitchenTicket updateTicketStatus(String id, TicketStatus status);
    KitchenTicket reprintTicket(String id);
    KitchenTicket createTicketFromOrder(Order order);
}
