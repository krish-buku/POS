package com.bukukasir.menu.domain.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ModifierGroup {
    private String id;
    private String name;
    private boolean required;
    private int maxSelections;
    private List<Modifier> modifiers;
}
