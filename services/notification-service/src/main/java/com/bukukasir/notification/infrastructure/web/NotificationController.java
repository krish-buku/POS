package com.bukukasir.notification.infrastructure.web;

import com.bukukasir.common.dto.ApiResponse;
import com.bukukasir.notification.application.dto.SendNotificationRequest;
import com.bukukasir.notification.domain.model.Notification;
import com.bukukasir.notification.domain.model.NotificationType;
import com.bukukasir.notification.domain.port.in.NotificationUseCase;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
@Tag(name = "Notifications", description = "Notification management endpoints")
public class NotificationController {

    private final NotificationUseCase notificationUseCase;

    @GetMapping
    @Operation(summary = "List all notifications")
    public ResponseEntity<ApiResponse<List<Notification>>> getAllNotifications() {
        return ResponseEntity.ok(ApiResponse.success(notificationUseCase.getAllNotifications()));
    }

    @PostMapping("/send")
    @Operation(summary = "Send a notification")
    public ResponseEntity<ApiResponse<Notification>> sendNotification(@Valid @RequestBody SendNotificationRequest request) {
        Notification notification = Notification.builder()
                .type(NotificationType.valueOf(request.type()))
                .title(request.title())
                .message(request.message())
                .targetStaffId(request.targetStaffId())
                .businessId(request.businessId())
                .build();
        Notification sent = notificationUseCase.sendNotification(notification);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(sent, "Notification sent"));
    }

    @PutMapping("/{id}/read")
    @Operation(summary = "Mark notification as read")
    public ResponseEntity<ApiResponse<Notification>> markAsRead(@PathVariable String id) {
        return ResponseEntity.ok(ApiResponse.success(notificationUseCase.markAsRead(id), "Marked as read"));
    }
}
