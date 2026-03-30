package com.bukukasir.kitchen.infrastructure.persistence.adapter;

import com.bukukasir.kitchen.domain.model.KitchenTicket;
import com.bukukasir.kitchen.domain.model.TicketItem;
import com.bukukasir.kitchen.domain.model.TicketStatus;
import com.bukukasir.kitchen.domain.port.out.KitchenTicketRepository;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class KitchenPersistenceAdapter implements KitchenTicketRepository {

    private final Map<String, KitchenTicket> store = new ConcurrentHashMap<>();

    public KitchenPersistenceAdapter() { initMockData(); }

    private void initMockData() {
        store.put("tkt-001", KitchenTicket.builder().id("tkt-001").ticketNumber("TKT-001").orderId("order-001").orderNumber("ORD-001").tableName("T1").status(TicketStatus.PREPARING).businessId("biz-001")
                .items(List.of(
                        TicketItem.builder().id("ti-001").menuItemName("Nasi Goreng Spesial").quantity(2).notes("Pedas").modifiers(List.of("Ekstra Pedas")).build(),
                        TicketItem.builder().id("ti-002").menuItemName("Es Teh Manis").quantity(2).build()
                )).createdAt(Instant.now().minusSeconds(1200)).updatedAt(Instant.now().minusSeconds(600)).build());

        store.put("tkt-002", KitchenTicket.builder().id("tkt-002").ticketNumber("TKT-002").orderId("order-002").orderNumber("ORD-002").tableName("T3").status(TicketStatus.NEW).businessId("biz-001")
                .items(List.of(
                        TicketItem.builder().id("ti-003").menuItemName("Ayam Bakar").quantity(1).build(),
                        TicketItem.builder().id("ti-004").menuItemName("Kopi Susu").quantity(1).notes("Iced, kurang gula").build()
                )).createdAt(Instant.now().minusSeconds(300)).updatedAt(Instant.now().minusSeconds(300)).build());

        store.put("tkt-003", KitchenTicket.builder().id("tkt-003").ticketNumber("TKT-003").orderId("order-003").orderNumber("ORD-003").tableName("T6").status(TicketStatus.READY).businessId("biz-001")
                .items(List.of(
                        TicketItem.builder().id("ti-005").menuItemName("Soto Ayam").quantity(3).build(),
                        TicketItem.builder().id("ti-006").menuItemName("Pisang Goreng").quantity(2).build(),
                        TicketItem.builder().id("ti-007").menuItemName("Es Jeruk").quantity(3).build()
                )).createdAt(Instant.now().minusSeconds(3600)).updatedAt(Instant.now().minusSeconds(600)).build());
    }

    @Override public List<KitchenTicket> findAll() { return new ArrayList<>(store.values()); }
    @Override public Optional<KitchenTicket> findById(String id) { return Optional.ofNullable(store.get(id)); }
    @Override public KitchenTicket save(KitchenTicket ticket) { store.put(ticket.getId(), ticket); return ticket; }
}
