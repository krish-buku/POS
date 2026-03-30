package com.bukukasir.kitchen.domain.port.out;

import com.bukukasir.kitchen.domain.model.KitchenTicket;

import java.util.List;
import java.util.Optional;

public interface KitchenTicketRepository {
    List<KitchenTicket> findAll();
    Optional<KitchenTicket> findById(String id);
    KitchenTicket save(KitchenTicket ticket);
}
