package com.bukukasir.staff.infrastructure.persistence.adapter;

import com.bukukasir.staff.domain.model.Permission;
import com.bukukasir.staff.domain.model.Staff;
import com.bukukasir.staff.domain.model.StaffRole;
import com.bukukasir.staff.domain.port.out.StaffRepository;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;

@Component
public class StaffPersistenceAdapter implements StaffRepository {

    private final Map<String, Staff> store = new ConcurrentHashMap<>();

    public StaffPersistenceAdapter() {
        initMockData();
    }

    private void initMockData() {
        store.put("staff-001", Staff.builder()
                .id("staff-001").name("Budi Santoso").email("budi@warung.com")
                .phone("+62-812-3456-7890").role(StaffRole.OWNER).businessId("biz-001").pin("1234")
                .permissions(Set.of(Permission.values())).active(true)
                .createdAt(Instant.parse("2024-01-15T08:00:00Z"))
                .updatedAt(Instant.parse("2024-06-01T10:00:00Z")).build());

        store.put("staff-002", Staff.builder()
                .id("staff-002").name("Siti Rahayu").email("siti@warung.com")
                .phone("+62-813-4567-8901").role(StaffRole.MANAGER).businessId("biz-001").pin("5678")
                .permissions(Set.of(Permission.VIEW_DASHBOARD, Permission.MANAGE_MENU, Permission.MANAGE_ORDERS,
                        Permission.MANAGE_TABLES, Permission.MANAGE_PAYMENTS, Permission.MANAGE_STAFF,
                        Permission.VIEW_REPORTS, Permission.VOID_ORDERS, Permission.APPLY_DISCOUNTS))
                .active(true)
                .createdAt(Instant.parse("2024-02-01T08:00:00Z"))
                .updatedAt(Instant.parse("2024-05-15T10:00:00Z")).build());

        store.put("staff-003", Staff.builder()
                .id("staff-003").name("Ahmad Wijaya").email("ahmad@warung.com")
                .phone("+62-814-5678-9012").role(StaffRole.CASHIER).businessId("biz-001").pin("1111")
                .permissions(Set.of(Permission.VIEW_DASHBOARD, Permission.MANAGE_ORDERS,
                        Permission.MANAGE_PAYMENTS, Permission.APPLY_DISCOUNTS))
                .active(true)
                .createdAt(Instant.parse("2024-03-01T08:00:00Z"))
                .updatedAt(Instant.parse("2024-04-15T10:00:00Z")).build());

        store.put("staff-004", Staff.builder()
                .id("staff-004").name("Dewi Lestari").email("dewi@warung.com")
                .phone("+62-815-6789-0123").role(StaffRole.WAITER).businessId("biz-001").pin("2222")
                .permissions(Set.of(Permission.MANAGE_ORDERS, Permission.MANAGE_TABLES))
                .active(true)
                .createdAt(Instant.parse("2024-03-15T08:00:00Z"))
                .updatedAt(Instant.parse("2024-04-01T10:00:00Z")).build());

        store.put("staff-005", Staff.builder()
                .id("staff-005").name("Rudi Hermawan").email("rudi@warung.com")
                .phone("+62-816-7890-1234").role(StaffRole.KITCHEN).businessId("biz-001").pin("3333")
                .permissions(Set.of(Permission.KITCHEN_DISPLAY))
                .active(true)
                .createdAt(Instant.parse("2024-04-01T08:00:00Z"))
                .updatedAt(Instant.parse("2024-04-01T10:00:00Z")).build());
    }

    @Override
    public List<Staff> findByBusinessId(String businessId) {
        return store.values().stream()
                .filter(s -> s.getBusinessId().equals(businessId))
                .collect(Collectors.toList());
    }

    @Override
    public List<Staff> findAll() {
        return new ArrayList<>(store.values());
    }

    @Override
    public Optional<Staff> findById(String id) {
        return Optional.ofNullable(store.get(id));
    }

    @Override
    public Staff save(Staff staff) {
        store.put(staff.getId(), staff);
        return staff;
    }

    @Override
    public void deleteById(String id) {
        store.remove(id);
    }
}
