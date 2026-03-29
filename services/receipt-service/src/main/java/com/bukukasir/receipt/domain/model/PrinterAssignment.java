package com.bukukasir.receipt.domain.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PrinterAssignment {

    private String id;
    private String printerId;
    private String businessId;
    private RoutingType routingType;
    private String routingValue;
    private int priority;
    @Builder.Default
    private int copies = 1;
}
