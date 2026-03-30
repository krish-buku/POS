package com.bukukasir.auth.infrastructure.persistence.repository;

import com.bukukasir.auth.infrastructure.persistence.entity.SessionEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

@Repository
public interface JpaSessionRepository extends JpaRepository<SessionEntity, String> {

    Optional<SessionEntity> findBySessionId(String sessionId);

    List<SessionEntity> findByStaffIdAndActiveTrue(String staffId);

    Optional<SessionEntity> findByStaffIdAndActiveTrueAndExpiresAtAfter(String staffId, Instant now);

    @Query("SELECT s FROM SessionEntity s WHERE s.staffId = :staffId AND s.active = true")
    Optional<SessionEntity> findActiveByStaffId(String staffId);

    @Modifying
    @Transactional
    @Query("UPDATE SessionEntity s SET s.active = false WHERE s.sessionId = :sessionId")
    void invalidate(String sessionId);
}
