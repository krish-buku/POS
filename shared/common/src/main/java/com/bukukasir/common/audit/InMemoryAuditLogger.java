package com.bukukasir.common.audit;

import com.bukukasir.common.util.IdGenerator;

import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;

public class InMemoryAuditLogger implements AuditLogger {

    private final Map<String, AuditLog> store = new ConcurrentHashMap<>();

    @Override
    public void log(AuditLog entry) {
        if (entry.getId() == null || entry.getId().isBlank()) {
            entry.setId(IdGenerator.generateId());
        }
        if (entry.getTimestamp() == null) {
            entry.setTimestamp(LocalDateTime.now());
        }
        store.put(entry.getId(), entry);
    }

    @Override
    public List<AuditLog> query(String businessId, String entityType, String entityId,
                                LocalDateTime from, LocalDateTime to, int limit) {
        return store.values().stream()
                .filter(e -> businessId == null || businessId.equals(e.getBusinessId()))
                .filter(e -> entityType == null || entityType.equals(e.getEntityType()))
                .filter(e -> entityId == null || entityId.equals(e.getEntityId()))
                .filter(e -> from == null || !e.getTimestamp().isBefore(from))
                .filter(e -> to == null || !e.getTimestamp().isAfter(to))
                .sorted(Comparator.comparing(AuditLog::getTimestamp).reversed())
                .limit(limit > 0 ? limit : 50)
                .collect(Collectors.toList());
    }

    @Override
    public List<AuditLog> queryByActor(String actorId, LocalDateTime from, LocalDateTime to, int limit) {
        return store.values().stream()
                .filter(e -> actorId == null || actorId.equals(e.getActorId()))
                .filter(e -> from == null || !e.getTimestamp().isBefore(from))
                .filter(e -> to == null || !e.getTimestamp().isAfter(to))
                .sorted(Comparator.comparing(AuditLog::getTimestamp).reversed())
                .limit(limit > 0 ? limit : 50)
                .collect(Collectors.toList());
    }
}
