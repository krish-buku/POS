package com.bukukasir.kitchen.domain.service;

import com.bukukasir.common.exception.ResourceNotFoundException;
import com.bukukasir.common.util.IdGenerator;
import com.bukukasir.kitchen.domain.model.KitchenTicket;
import com.bukukasir.kitchen.domain.model.TicketItem;
import com.bukukasir.kitchen.domain.model.TicketStatus;
import com.bukukasir.kitchen.domain.port.in.KitchenUseCase;
import com.bukukasir.kitchen.domain.port.out.KitchenTicketRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.Instant;
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

    @Override
    public KitchenTicket createTicket(KitchenTicket ticket) {
        Instant now = Instant.now();
        ticket.setId(IdGenerator.generateId());
        if (ticket.getTicketNumber() == null || ticket.getTicketNumber().isBlank()) {
            ticket.setTicketNumber("TKT-" + (ticket.getOrderNumber() != null ? ticket.getOrderNumber() : ticket.getId()));
        }
        ticket.setStatus(TicketStatus.NEW);
        if (ticket.getItems() != null) {
            for (TicketItem item : ticket.getItems()) {
                if (item.getId() == null || item.getId().isBlank()) {
                    item.setId(IdGenerator.generateId());
                }
            }
        }
        ticket.setCreatedAt(now);
        ticket.setUpdatedAt(now);
        return ticketRepository.save(ticket);
    }
}
