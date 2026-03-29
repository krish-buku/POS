package com.bukukasir.auth.infrastructure.persistence.repository;

import com.bukukasir.auth.infrastructure.persistence.entity.SessionEntity;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;

/**
 * In-memory session repository.
 */
@Repository
public class JpaSessionRepository {

    private final Map<String, SessionEntity> store = new ConcurrentHashMap<>();

    public Optional<SessionEntity> findBySessionId(String sessionId) {
        return Optional.ofNullable(store.get(sessionId));
    }

    public Optional<SessionEntity> findActiveByStaffId(String staffId) {
        return store.values().stream()
                .filter(s -> s.getStaffId().equals(staffId)
                        && s.isActive()
                        && s.getExpiresAt().isAfter(Instant.now()))
                .findFirst();
    }

    public SessionEntity save(SessionEntity entity) {
        store.put(entity.getSessionId(), entity);
        return entity;
    }

    public void invalidate(String sessionId) {
        SessionEntity entity = store.get(sessionId);
        if (entity != null) {
            entity.setActive(false);
        }
    }
}
