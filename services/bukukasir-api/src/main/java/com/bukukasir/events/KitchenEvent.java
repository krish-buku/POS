package com.bukukasir.events;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;

@Data
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true)
public class KitchenEvent extends BaseEvent {

    public enum Type {
        TICKET_CREATED, TICKET_PREPARING, TICKET_READY, TICKET_REPRINTED
    }

    private String ticketId;
    private String ticketNumber;
    private String orderId;
    private String status;
    private Type type;
}
