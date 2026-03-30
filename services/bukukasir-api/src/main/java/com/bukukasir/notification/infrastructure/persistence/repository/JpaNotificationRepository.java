package com.bukukasir.notification.infrastructure.persistence.repository;

import com.bukukasir.notification.infrastructure.persistence.entity.NotificationEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface JpaNotificationRepository extends JpaRepository<NotificationEntity, String> {

    List<NotificationEntity> findByBusinessId(String businessId);

    List<NotificationEntity> findByTargetStaffId(String targetStaffId);

    List<NotificationEntity> findByTargetStaffIdAndReadFalse(String targetStaffId);

    List<NotificationEntity> findByBusinessIdAndReadFalse(String businessId);
}
