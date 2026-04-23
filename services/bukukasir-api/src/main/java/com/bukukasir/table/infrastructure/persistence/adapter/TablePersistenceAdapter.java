package com.bukukasir.table.infrastructure.persistence.adapter;

import com.bukukasir.table.domain.model.RestaurantTable;
import com.bukukasir.table.domain.model.TableStatus;
import com.bukukasir.table.domain.port.out.TableRepository;
import com.bukukasir.table.infrastructure.persistence.entity.TableEntity;
import com.bukukasir.table.infrastructure.persistence.repository.JpaTableRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Component
@RequiredArgsConstructor
public class TablePersistenceAdapter implements TableRepository {

    private final JpaTableRepository jpa;

    @Override
    public List<RestaurantTable> findAll() {
        return jpa.findAll().stream().map(this::toDomain).toList();
    }

    @Override
    public Optional<RestaurantTable> findById(String id) {
        return jpa.findById(id).map(this::toDomain);
    }

    @Override
    public RestaurantTable save(RestaurantTable table) {
        TableEntity saved = jpa.save(toEntity(table));
        return toDomain(saved);
    }

    @Override
    public void deleteById(String id) {
        jpa.deleteById(id);
    }

    private RestaurantTable toDomain(TableEntity e) {
        return RestaurantTable.builder()
                .id(e.getId())
                .number(e.getNumber())
                .name(e.getName())
                .capacity(e.getCapacity())
                .status(e.getStatus() != null ? TableStatus.valueOf(e.getStatus().toUpperCase()) : TableStatus.AVAILABLE)
                .areaId(e.getAreaId())
                .floorId(e.getFloorId())
                .businessId(e.getBusinessId())
                .currentOrderId(e.getCurrentOrderId())
                .assignedStaffId(e.getAssignedStaffId())
                .runningTotal(e.getRunningTotal() != null ? e.getRunningTotal() : BigDecimal.ZERO)
                .build();
    }

    private TableEntity toEntity(RestaurantTable t) {
        return TableEntity.builder()
                .id(t.getId())
                .number(t.getNumber())
                .name(t.getName())
                .capacity(t.getCapacity())
                .status(t.getStatus() != null ? t.getStatus().name() : TableStatus.AVAILABLE.name())
                .areaId(t.getAreaId())
                .floorId(t.getFloorId())
                .businessId(t.getBusinessId())
                .currentOrderId(t.getCurrentOrderId())
                .assignedStaffId(t.getAssignedStaffId())
                .runningTotal(t.getRunningTotal() != null ? t.getRunningTotal() : BigDecimal.ZERO)
                .build();
    }
}
