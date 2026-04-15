package com.bukukasir.table.domain.service;

import com.bukukasir.common.audit.AuditAction;
import com.bukukasir.common.audit.AuditLog;
import com.bukukasir.common.audit.AuditLogger;
import com.bukukasir.common.exception.BusinessException;
import com.bukukasir.common.exception.ResourceNotFoundException;
import com.bukukasir.common.util.IdGenerator;
import com.bukukasir.table.domain.model.RestaurantTable;
import com.bukukasir.table.domain.model.TableStatus;
import com.bukukasir.table.domain.port.in.TableUseCase;
import com.bukukasir.table.domain.port.out.TableRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class TableDomainService implements TableUseCase {

    private final TableRepository tableRepository;
    private final AuditLogger auditLogger;

    @Override
    public List<RestaurantTable> getAllTables(String businessId) { return tableRepository.findAll(); }

    @Override
    public RestaurantTable getTableById(String id) {
        return tableRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Table", "id", id));
    }

    @Override
    public RestaurantTable createTable(RestaurantTable table) {
        table.setId(IdGenerator.generateId());
        table.setStatus(TableStatus.AVAILABLE);
        return tableRepository.save(table);
    }

    @Override
    public RestaurantTable updateTable(String id, RestaurantTable table) {
        RestaurantTable existing = getTableById(id);
        existing.setName(table.getName());
        existing.setCapacity(table.getCapacity());
        existing.setAreaId(table.getAreaId());
        existing.setFloorId(table.getFloorId());
        return tableRepository.save(existing);
    }

    @Override
    public void deleteTable(String id) { getTableById(id); tableRepository.deleteById(id); }

    @Override
    public RestaurantTable updateStatus(String id, TableStatus status) {
        RestaurantTable table = getTableById(id);
        TableStatus oldStatus = table.getStatus();

        table.setStatus(status);
        if (status == TableStatus.AVAILABLE) { table.setCurrentOrderId(null); }
        RestaurantTable saved = tableRepository.save(table);

        Map<String, Object> oldValues = new LinkedHashMap<>();
        oldValues.put("status", oldStatus != null ? oldStatus.name() : null);
        Map<String, Object> newValues = new LinkedHashMap<>();
        newValues.put("status", status.name());

        auditLogger.log(AuditLog.builder()
                .actorId("staff-001").actorName("System")
                .businessId(saved.getBusinessId())
                .action(AuditAction.STATUS_CHANGE)
                .entityType("Table").entityId(saved.getId())
                .description("Changed table " + saved.getName() + " status from " + oldStatus + " to " + status)
                .oldValues(oldValues)
                .newValues(newValues)
                .timestamp(LocalDateTime.now())
                .build());

        return saved;
    }

    @Override
    public RestaurantTable assignStaff(String tableId, String staffId) {
        RestaurantTable table = getTableById(tableId);
        table.setAssignedStaffId(staffId);
        return tableRepository.save(table);
    }

    @Override
    public RestaurantTable setCurrentOrder(String tableId, String orderId) {
        RestaurantTable table = getTableById(tableId);
        table.setCurrentOrderId(orderId);
        if (orderId != null && table.getStatus() != TableStatus.OCCUPIED) {
            table.setStatus(TableStatus.OCCUPIED);
        }
        return tableRepository.save(table);
    }

    @Override
    public void transferTable(String fromTableId, String toTableId) {
        RestaurantTable from = getTableById(fromTableId);
        RestaurantTable to = getTableById(toTableId);
        if (to.getStatus() != TableStatus.AVAILABLE) {
            throw new BusinessException("TABLE_NOT_AVAILABLE", "Target table is not available");
        }
        to.setStatus(TableStatus.OCCUPIED);
        to.setCurrentOrderId(from.getCurrentOrderId());
        from.setStatus(TableStatus.CLEANING);
        from.setCurrentOrderId(null);
        tableRepository.save(from);
        tableRepository.save(to);

        Map<String, Object> oldValues = new LinkedHashMap<>();
        oldValues.put("fromTable", from.getName());
        oldValues.put("fromTableId", fromTableId);
        Map<String, Object> newValues = new LinkedHashMap<>();
        newValues.put("toTable", to.getName());
        newValues.put("toTableId", toTableId);

        auditLogger.log(AuditLog.builder()
                .actorId("staff-001").actorName("System")
                .businessId(from.getBusinessId())
                .action(AuditAction.TRANSFER)
                .entityType("Table").entityId(fromTableId)
                .description("Transferred order from table " + from.getName() + " to table " + to.getName())
                .oldValues(oldValues)
                .newValues(newValues)
                .timestamp(LocalDateTime.now())
                .build());
    }

    @Override
    public RestaurantTable mergeTables(List<String> tableIds, String targetTableId) {
        RestaurantTable target = getTableById(targetTableId);
        for (String tid : tableIds) {
            if (!tid.equals(targetTableId)) {
                RestaurantTable t = getTableById(tid);
                target.setCapacity(target.getCapacity() + t.getCapacity());
                t.setStatus(TableStatus.OCCUPIED);
                tableRepository.save(t);
            }
        }
        target.setStatus(TableStatus.OCCUPIED);
        return tableRepository.save(target);
    }
}
