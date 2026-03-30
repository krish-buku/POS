package com.bukukasir.notification.infrastructure.persistence.adapter;

import com.bukukasir.notification.domain.model.Notification;
import com.bukukasir.notification.domain.model.NotificationType;
import com.bukukasir.notification.domain.port.out.NotificationRepository;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class NotificationPersistenceAdapter implements NotificationRepository {
    private final Map<String, Notification> store = new ConcurrentHashMap<>();

    public NotificationPersistenceAdapter() { initMockData(); }

    private void initMockData() {
        store.put("notif-001", Notification.builder().id("notif-001").type(NotificationType.KITCHEN_READY).title("Order Ready").message("Order ORD-003 for Table T6 is ready to serve").targetStaffId("staff-004").businessId("biz-001").read(false).createdAt(Instant.now().minusSeconds(300)).build());
        store.put("notif-002", Notification.builder().id("notif-002").type(NotificationType.TABLE_TRANSFER).title("Table Transfer").message("Table T7 transferred to T8 by Dewi").targetStaffId("staff-002").businessId("biz-001").read(false).createdAt(Instant.now().minusSeconds(600)).build());
        store.put("notif-003", Notification.builder().id("notif-003").type(NotificationType.ORDER_VOID).title("Order Voided").message("Order ORD-005 was voided by Ahmad").targetStaffId("staff-001").businessId("biz-001").read(true).createdAt(Instant.now().minusSeconds(3600)).build());
        store.put("notif-004", Notification.builder().id("notif-004").type(NotificationType.PAYMENT_RECEIVED).title("Payment Received").message("Payment of Rp 73.260 received for ORD-001").targetStaffId("staff-001").businessId("biz-001").read(true).createdAt(Instant.now().minusSeconds(7200)).build());
        store.put("notif-005", Notification.builder().id("notif-005").type(NotificationType.STAFF_LOGIN).title("Staff Login").message("Rudi Hermawan logged in at Kitchen").targetStaffId("staff-001").businessId("biz-001").read(true).createdAt(Instant.now().minusSeconds(14400)).build());
    }

    @Override public List<Notification> findAll() { return new ArrayList<>(store.values()); }
    @Override public Optional<Notification> findById(String id) { return Optional.ofNullable(store.get(id)); }
    @Override public Notification save(Notification n) { store.put(n.getId(), n); return n; }
}
