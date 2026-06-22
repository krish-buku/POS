package com.bukukasir.common.audit;

import com.bukukasir.common.util.IdGenerator;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Component
@RequiredArgsConstructor
@Slf4j
public class DatabaseAuditLogger implements AuditLogger {

    private static final LocalDateTime FLOOR = LocalDateTime.of(1970, 1, 1, 0, 0);
    private static final LocalDateTime CEILING = LocalDateTime.of(2999, 12, 31, 23, 59);

    private final JpaAuditLogRepository repository;
    private final ObjectMapper objectMapper;

    @Override
    public void log(AuditLog entry) {
        try {
            LocalDateTime timestamp = entry.getTimestamp() != null ? entry.getTimestamp() : LocalDateTime.now();
            String id = entry.getId() != null && !entry.getId().isBlank() ? entry.getId() : IdGenerator.generateId();
            repository.save(DatabaseAuditLogEntity.builder()
                    .id(id)
                    .businessId(entry.getBusinessId())
                    .actorId(entry.getActorId())
                    .actorName(entry.getActorName())
                    .action(entry.getAction() != null ? entry.getAction().name() : AuditAction.CREATE.name())
                    .entityType(entry.getEntityType())
                    .entityId(entry.getEntityId())
                    .description(entry.getDescription())
                    .oldValues(writeMap(entry.getOldValues()))
                    .newValues(writeMap(entry.getNewValues()))
                    .ipAddress(entry.getIpAddress())
                    .createdAt(timestamp)
                    .build());
        } catch (RuntimeException ex) {
            log.warn("Audit log persistence failed for {} {}: {}", entry.getEntityType(), entry.getEntityId(), ex.getMessage());
        }
    }

    @Override
    public List<AuditLog> query(String businessId, String entityType, String entityId,
                                LocalDateTime from, LocalDateTime to, int limit) {
        LocalDateTime start = from != null ? from : FLOOR;
        LocalDateTime end = to != null ? to : CEILING;
        List<DatabaseAuditLogEntity> rows;
        if (businessId != null && entityType != null && entityId != null) {
            rows = repository.findByBusinessIdAndEntityTypeAndEntityIdAndCreatedAtBetweenOrderByCreatedAtDesc(
                    businessId, entityType, entityId, start, end);
        } else if (businessId != null && entityType != null) {
            rows = repository.findByBusinessIdAndEntityTypeAndCreatedAtBetweenOrderByCreatedAtDesc(
                    businessId, entityType, start, end);
        } else if (businessId != null) {
            rows = repository.findByBusinessIdAndCreatedAtBetweenOrderByCreatedAtDesc(businessId, start, end);
        } else if (entityType != null) {
            rows = repository.findByEntityTypeAndCreatedAtBetweenOrderByCreatedAtDesc(entityType, start, end);
        } else {
            rows = repository.findByCreatedAtBetweenOrderByCreatedAtDesc(start, end);
        }
        return rows.stream().limit(Math.max(1, limit)).map(this::toDomain).toList();
    }

    @Override
    public List<AuditLog> queryByActor(String actorId, LocalDateTime from, LocalDateTime to, int limit) {
        LocalDateTime start = from != null ? from : FLOOR;
        LocalDateTime end = to != null ? to : CEILING;
        return repository.findByActorIdAndCreatedAtBetweenOrderByCreatedAtDesc(actorId, start, end)
                .stream().limit(Math.max(1, limit)).map(this::toDomain).toList();
    }

    private AuditLog toDomain(DatabaseAuditLogEntity entity) {
        return AuditLog.builder()
                .id(entity.getId())
                .businessId(entity.getBusinessId())
                .actorId(entity.getActorId())
                .actorName(entity.getActorName())
                .action(parseAction(entity.getAction()))
                .entityType(entity.getEntityType())
                .entityId(entity.getEntityId())
                .description(entity.getDescription())
                .oldValues(readMap(entity.getOldValues()))
                .newValues(readMap(entity.getNewValues()))
                .ipAddress(entity.getIpAddress())
                .timestamp(entity.getCreatedAt())
                .build();
    }

    private AuditAction parseAction(String raw) {
        try {
            return raw == null ? AuditAction.CREATE : AuditAction.valueOf(raw);
        } catch (IllegalArgumentException ex) {
            return AuditAction.CREATE;
        }
    }

    private String writeMap(Map<String, Object> value) {
        if (value == null || value.isEmpty()) {
            return "{}";
        }
        try {
            return objectMapper.writeValueAsString(value);
        } catch (Exception ex) {
            return "{}";
        }
    }

    private Map<String, Object> readMap(String value) {
        if (value == null || value.isBlank()) {
            return Map.of();
        }
        try {
            return objectMapper.readValue(value, new TypeReference<Map<String, Object>>() {});
        } catch (Exception ex) {
            return Map.of();
        }
    }
}
