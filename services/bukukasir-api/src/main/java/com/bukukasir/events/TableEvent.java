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
public class TableEvent extends BaseEvent {

    public enum Type {
        TABLE_STATUS_CHANGED, TABLE_TRANSFERRED, TABLE_MERGED
    }

    private String tableId;
    private String tableName;
    private String previousStatus;
    private String newStatus;
    private Type type;
}
