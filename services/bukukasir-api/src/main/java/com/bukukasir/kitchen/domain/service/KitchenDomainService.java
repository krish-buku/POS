package com.bukukasir.kitchen.domain.service;

import com.bukukasir.common.exception.ResourceNotFoundException;
import com.bukukasir.common.util.IdGenerator;
import com.bukukasir.kitchen.domain.model.KitchenTicket;
import com.bukukasir.kitchen.domain.model.TicketItem;
import com.bukukasir.kitchen.domain.model.TicketStatus;
import com.bukukasir.kitchen.domain.port.in.KitchenUseCase;
import com.bukukasir.kitchen.domain.port.out.KitchenTicketRepository;
import com.bukukasir.order.domain.model.Order;
import com.bukukasir.order.domain.model.OrderItem;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class KitchenDomainService implements KitchenUseCase {

    private final KitchenTicketRepository ticketRepository;

    @Override public List<KitchenTicket> getAllTickets() { return ticketRepository.findAll(); }

    @Override public KitchenTicket getTicketById(String id) {
        return ticketRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("KitchenTicket", "id", id));
    }

    @Override public KitchenTicket updateTicketStatus(String id, TicketStatus status) {
        KitchenTicket ticket = getTicketById(id);
        ticket.setStatus(status);
        ticket.setUpdatedAt(Instant.now());
        return ticketRepository.save(ticket);
    }

    @Override public KitchenTicket reprintTicket(String id) {
        return getTicketById(id); // Just return the ticket for reprint
    }

    @Override public KitchenTicket createTicketFromOrder(Order order) {
        List<TicketItem> ticketItems = new ArrayList<>();
        if (order.getItems() != null) {
            for (OrderItem oi : order.getItems()) {
                ticketItems.add(TicketItem.builder()
                        .id(IdGenerator.generateId())
                        .menuItemName(oi.getMenuItemName())
                        .quantity(oi.getQuantity())
                        .notes(oi.getNotes())
                        .modifiers(oi.getModifiers())
                        .build());
            }
        }
        Instant now = Instant.now();
        KitchenTicket ticket = KitchenTicket.builder()
                .id(IdGenerator.generateId())
                .ticketNumber("TKT-" + (order.getOrderNumber() != null ? order.getOrderNumber() : order.getId()))
                .orderId(order.getId())
                .orderNumber(order.getOrderNumber())
                .tableName(order.getTableName())
                .status(TicketStatus.NEW)
                .items(ticketItems)
                .businessId(order.getBusinessId())
                .createdAt(now)
                .updatedAt(now)
                .build();
        return ticketRepository.save(ticket);
    }
}
