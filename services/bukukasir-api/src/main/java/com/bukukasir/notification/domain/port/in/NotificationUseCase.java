package com.bukukasir.notification.domain.port.in;

import com.bukukasir.notification.domain.model.Notification;

import java.util.List;

public interface NotificationUseCase {
    List<Notification> getAllNotifications();
    Notification sendNotification(Notification notification);
    Notification markAsRead(String id);
}
