package com.bukukasir.table.domain.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Floor {
    private String id;
    private String name;
    private String businessId;
    private int sortOrder;
}
