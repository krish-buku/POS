package com.bukukasir.events;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;

import java.math.BigDecimal;

@Data
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true)
public class OrderEvent extends BaseEvent {

    public enum Type {
        ORDER_CREATED, ORDER_UPDATED, ORDER_VOIDED, ORDER_COMPLETED
    }

    private String orderId;
    private String orderNumber;
    private String tableId;
    private String staffId;
    private BigDecimal totalAmount;
    private Type type;
}
