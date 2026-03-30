package com.bukukasir.kitchen.domain.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TicketItem {
    private String id;
    private String menuItemName;
    private int quantity;
    private String notes;
    private List<String> modifiers;
}
