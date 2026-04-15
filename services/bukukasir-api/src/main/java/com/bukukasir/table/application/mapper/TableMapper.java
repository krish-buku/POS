package com.bukukasir.table.application.mapper;

import com.bukukasir.table.application.dto.TableRequest;
import com.bukukasir.table.application.dto.TableResponse;
import com.bukukasir.table.domain.model.RestaurantTable;
import org.springframework.stereotype.Component;

@Component
public class TableMapper {
    public TableResponse toResponse(RestaurantTable t) {
        return new TableResponse(t.getId(), t.getName(), t.getCapacity(),
                t.getStatus().name(), t.getAreaId(), t.getFloorId(),
                t.getBusinessId(), t.getCurrentOrderId(), t.getAssignedStaffId());
    }
    public RestaurantTable toDomain(TableRequest r) {
        return RestaurantTable.builder().name(r.name()).capacity(r.capacity())
                .areaId(r.areaId()).floorId(r.floorId()).businessId(r.businessId()).build();
    }
}
