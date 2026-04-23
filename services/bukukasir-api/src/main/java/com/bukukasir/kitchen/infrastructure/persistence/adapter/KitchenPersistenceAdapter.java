package com.bukukasir.kitchen.infrastructure.persistence.adapter;

import com.bukukasir.kitchen.domain.model.KitchenTicket;
import com.bukukasir.kitchen.domain.model.TicketItem;
import com.bukukasir.kitchen.domain.model.TicketStatus;
import com.bukukasir.kitchen.domain.port.out.KitchenTicketRepository;
import com.bukukasir.kitchen.infrastructure.persistence.entity.KitchenTicketEntity;
import com.bukukasir.kitchen.infrastructure.persistence.repository.JpaKitchenTicketRepository;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.Collections;
import java.util.List;
import java.util.Optional;

@Component
@RequiredArgsConstructor
public class KitchenPersistenceAdapter implements KitchenTicketRepository {

    private final JpaKitchenTicketRepository jpa;
    private final ObjectMapper objectMapper;

    @Override
    public List<KitchenTicket> findAll() {
        return jpa.findAll().stream().map(this::toDomain).toList();
    }

    @Override
    public Optional<KitchenTicket> findById(String id) {
        return jpa.findById(id).map(this::toDomain);
    }

    @Override
    public KitchenTicket save(KitchenTicket ticket) {
        KitchenTicketEntity saved = jpa.save(toEntity(ticket));
        return toDomain(saved);
    }

    private KitchenTicket toDomain(KitchenTicketEntity e) {
        return KitchenTicket.builder()
                .id(e.getId())
                .ticketNumber(e.getTicketNumber())
                .orderId(e.getOrderId())
                .orderNumber(e.getOrderNumber())
                .tableName(e.getTableName())
                .status(e.getStatus() != null ? TicketStatus.valueOf(e.getStatus().toUpperCase()) : TicketStatus.NEW)
                .items(readItems(e.getItems()))
                .businessId(e.getBusinessId())
                .createdAt(e.getCreatedAt())
                .updatedAt(e.getUpdatedAt())
                .build();
    }

    private KitchenTicketEntity toEntity(KitchenTicket t) {
        return KitchenTicketEntity.builder()
                .id(t.getId())
                .ticketNumber(t.getTicketNumber())
                .orderId(t.getOrderId())
                .orderNumber(t.getOrderNumber())
                .tableName(t.getTableName())
                .status(t.getStatus() != null ? t.getStatus().name() : TicketStatus.NEW.name())
                .items(writeItems(t.getItems()))
                .businessId(t.getBusinessId())
                .createdAt(t.getCreatedAt())
                .updatedAt(t.getUpdatedAt())
                .build();
    }

    private List<TicketItem> readItems(String json) {
        if (json == null || json.isBlank()) {
            return Collections.emptyList();
        }
        try {
            List<TicketItem> items = objectMapper.readValue(json, new TypeReference<List<TicketItem>>() {});
            return items != null ? items : Collections.emptyList();
        } catch (Exception ex) {
            throw new IllegalStateException("Failed to deserialize kitchen ticket items: " + ex.getMessage(), ex);
        }
    }

    private String writeItems(List<TicketItem> items) {
        if (items == null) {
            return "[]";
        }
        try {
            return objectMapper.writeValueAsString(items);
        } catch (Exception ex) {
            throw new IllegalStateException("Failed to serialize kitchen ticket items: " + ex.getMessage(), ex);
        }
    }
}
