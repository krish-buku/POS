package com.bukukasir.kitchen.domain.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class KitchenTicket {
    private String id;
    private String ticketNumber;
    private String orderId;
    private String orderNumber;
    private String tableName;
    private TicketStatus status;
    private List<TicketItem> items;
    private String businessId;
    private Instant createdAt;
    private Instant updatedAt;
}
