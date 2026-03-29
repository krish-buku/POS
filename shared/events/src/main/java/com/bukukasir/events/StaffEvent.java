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
public class StaffEvent extends BaseEvent {

    public enum Type {
        STAFF_CREATED, STAFF_UPDATED, STAFF_DELETED, STAFF_PIN_RESET
    }

    private String staffId;
    private String staffName;
    private String role;
    private Type type;
}
