package com.bukukasir.notification.domain.service;

import com.bukukasir.common.exception.ResourceNotFoundException;
import com.bukukasir.common.util.IdGenerator;
import com.bukukasir.notification.domain.model.Notification;
import com.bukukasir.notification.domain.port.in.NotificationUseCase;
import com.bukukasir.notification.domain.port.out.NotificationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;

@Service
@RequiredArgsConstructor
public class NotificationDomainService implements NotificationUseCase {
    private final NotificationRepository notificationRepository;

    @Override public List<Notification> getAllNotifications() { return notificationRepository.findAll(); }

    @Override public Notification sendNotification(Notification notification) {
        notification.setId(IdGenerator.generateId());
        notification.setRead(false);
        notification.setCreatedAt(Instant.now());
        return notificationRepository.save(notification);
    }

    @Override public Notification markAsRead(String id) {
        Notification n = notificationRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Notification", "id", id));
        n.setRead(true);
        return notificationRepository.save(n);
    }
}
