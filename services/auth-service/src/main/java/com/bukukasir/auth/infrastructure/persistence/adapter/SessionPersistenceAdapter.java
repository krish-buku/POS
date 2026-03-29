package com.bukukasir.auth.infrastructure.persistence.adapter;

import com.bukukasir.auth.domain.model.Role;
import com.bukukasir.auth.domain.model.Session;
import com.bukukasir.auth.domain.port.out.SessionRepository;
import com.bukukasir.auth.infrastructure.persistence.entity.SessionEntity;
import com.bukukasir.auth.infrastructure.persistence.repository.JpaSessionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.Optional;

@Component
@RequiredArgsConstructor
public class SessionPersistenceAdapter implements SessionRepository {

    private final JpaSessionRepository jpaSessionRepository;

    @Override
    public Optional<Session> findBySessionId(String sessionId) {
        return jpaSessionRepository.findBySessionId(sessionId).map(this::toDomain);
    }

    @Override
    public Optional<Session> findActiveByStaffId(String staffId) {
        return jpaSessionRepository.findActiveByStaffId(staffId).map(this::toDomain);
    }

    @Override
    public Session save(Session session) {
        SessionEntity entity = toEntity(session);
        jpaSessionRepository.save(entity);
        return session;
    }

    @Override
    public void invalidate(String sessionId) {
        jpaSessionRepository.invalidate(sessionId);
    }

    private Session toDomain(SessionEntity entity) {
        return Session.builder()
                .sessionId(entity.getSessionId())
                .staffId(entity.getStaffId())
                .staffName(entity.getStaffName())
                .role(Role.valueOf(entity.getRole()))
                .businessId(entity.getBusinessId())
                .createdAt(entity.getCreatedAt())
                .expiresAt(entity.getExpiresAt())
                .active(entity.isActive())
                .build();
    }

    private SessionEntity toEntity(Session session) {
        return SessionEntity.builder()
                .sessionId(session.getSessionId())
                .staffId(session.getStaffId())
                .staffName(session.getStaffName())
                .role(session.getRole().name())
                .businessId(session.getBusinessId())
                .createdAt(session.getCreatedAt())
                .expiresAt(session.getExpiresAt())
                .active(session.isActive())
                .build();
    }
}
