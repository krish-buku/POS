package com.bukukasir.kitchen.infrastructure.persistence.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "kitchen_tickets")
public class KitchenTicketEntity {

    @Id
    @Column(name = "id")
    private String id;

    @Column(name = "ticket_number")
    private String ticketNumber;

    @Column(name = "order_id")
    private String orderId;

    @Column(name = "order_number")
    private String orderNumber;

    @Column(name = "table_name")
    private String tableName;

    @Column(name = "status")
    private String status;

    @Column(name = "items", columnDefinition = "jsonb")
    private String items;

    @Column(name = "business_id")
    private String businessId;

    @Column(name = "created_at")
    private Instant createdAt;

    @Column(name = "updated_at")
    private Instant updatedAt;
}
