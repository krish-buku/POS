package com.bukukasir.common.audit;

import java.time.LocalDateTime;
import java.util.List;

public interface AuditLogger {

    void log(AuditLog entry);

    List<AuditLog> query(String businessId, String entityType, String entityId,
                         LocalDateTime from, LocalDateTime to, int limit);

    List<AuditLog> queryByActor(String actorId, LocalDateTime from, LocalDateTime to, int limit);
}
