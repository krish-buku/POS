package com.bukukasir.common.audit;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface JpaAuditLogRepository extends JpaRepository<DatabaseAuditLogEntity, String> {

    List<DatabaseAuditLogEntity> findByBusinessIdAndCreatedAtBetweenOrderByCreatedAtDesc(
            String businessId, LocalDateTime from, LocalDateTime to);

    List<DatabaseAuditLogEntity> findByEntityTypeAndCreatedAtBetweenOrderByCreatedAtDesc(
            String entityType, LocalDateTime from, LocalDateTime to);

    List<DatabaseAuditLogEntity> findByBusinessIdAndEntityTypeAndCreatedAtBetweenOrderByCreatedAtDesc(
            String businessId, String entityType, LocalDateTime from, LocalDateTime to);

    List<DatabaseAuditLogEntity> findByBusinessIdAndEntityTypeAndEntityIdAndCreatedAtBetweenOrderByCreatedAtDesc(
            String businessId, String entityType, String entityId, LocalDateTime from, LocalDateTime to);

    List<DatabaseAuditLogEntity> findByActorIdAndCreatedAtBetweenOrderByCreatedAtDesc(
            String actorId, LocalDateTime from, LocalDateTime to);

    List<DatabaseAuditLogEntity> findByCreatedAtBetweenOrderByCreatedAtDesc(LocalDateTime from, LocalDateTime to);
}
