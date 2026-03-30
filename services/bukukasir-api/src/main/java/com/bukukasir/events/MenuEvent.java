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
public class MenuEvent extends BaseEvent {

    public enum Type {
        MENU_ITEM_CREATED, MENU_ITEM_UPDATED, MENU_ITEM_DELETED, AVAILABILITY_CHANGED
    }

    private String menuItemId;
    private String menuItemName;
    private boolean available;
    private Type type;
}
