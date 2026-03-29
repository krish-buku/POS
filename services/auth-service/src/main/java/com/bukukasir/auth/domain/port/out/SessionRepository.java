package com.bukukasir.auth.domain.port.out;

import com.bukukasir.auth.domain.model.Session;

import java.util.Optional;

public interface SessionRepository {

    Optional<Session> findBySessionId(String sessionId);

    Optional<Session> findActiveByStaffId(String staffId);

    Session save(Session session);

    void invalidate(String sessionId);
}
