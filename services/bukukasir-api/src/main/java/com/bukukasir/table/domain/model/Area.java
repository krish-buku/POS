package com.bukukasir.table.domain.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Area {
    private String id;
    private String name;
    private String floorId;
    private String businessId;
}
