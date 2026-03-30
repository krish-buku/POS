package com.bukukasir.order.domain.model;

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
public class OrderSession {
    private String id;
    private String orderId;
    private int sessionNumber;
    private List<OrderItem> items;
    private Instant createdAt;
}
