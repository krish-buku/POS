package com.bukukasir.notification.domain.port.out;

import com.bukukasir.notification.domain.model.Notification;

import java.util.List;
import java.util.Optional;

public interface NotificationRepository {
    List<Notification> findAll();
    Optional<Notification> findById(String id);
    Notification save(Notification notification);
}
