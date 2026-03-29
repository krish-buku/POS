package com.bukukasir.receipt.domain.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PrintJob {
    private String id;
    private String orderId;
    private String orderNumber;
    private PrintStatus status;
    private String printerName;
    private int copies;
    private String businessId;
    private Instant createdAt;
    private Instant completedAt;
}
