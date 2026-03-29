package com.bukukasir.auth.infrastructure.persistence.repository;

import com.bukukasir.auth.infrastructure.persistence.entity.PinEntity;
import org.springframework.stereotype.Repository;

import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;

/**
 * In-memory PIN repository with mock data.
 */
@Repository
public class JpaPinRepository {

    private final Map<String, PinEntity> store = new ConcurrentHashMap<>();

    public JpaPinRepository() {
        initMockData();
    }

    private void initMockData() {
        // 5 staff PINs matching frontend mock data
        store.put("staff-001", PinEntity.builder()
                .staffId("staff-001").staffName("Budi Santoso").hashedPin("1234")
                .role("OWNER").businessId("biz-001").active(true).build());
        store.put("staff-002", PinEntity.builder()
                .staffId("staff-002").staffName("Siti Rahayu").hashedPin("5678")
                .role("MANAGER").businessId("biz-001").active(true).build());
        store.put("staff-003", PinEntity.builder()
                .staffId("staff-003").staffName("Ahmad Wijaya").hashedPin("1111")
                .role("CASHIER").businessId("biz-001").active(true).build());
        store.put("staff-004", PinEntity.builder()
                .staffId("staff-004").staffName("Dewi Lestari").hashedPin("2222")
                .role("WAITER").businessId("biz-001").active(true).build());
        store.put("staff-005", PinEntity.builder()
                .staffId("staff-005").staffName("Rudi Hermawan").hashedPin("3333")
                .role("KITCHEN").businessId("biz-001").active(true).build());
    }

    public Optional<PinEntity> findByStaffId(String staffId) {
        return Optional.ofNullable(store.get(staffId));
    }

    public Optional<PinEntity> findByBusinessIdAndHashedPin(String businessId, String hashedPin) {
        return store.values().stream()
                .filter(p -> p.getBusinessId().equals(businessId) && p.getHashedPin().equals(hashedPin))
                .findFirst();
    }

    public List<PinEntity> findByBusinessId(String businessId) {
        return store.values().stream()
                .filter(p -> p.getBusinessId().equals(businessId))
                .collect(Collectors.toList());
    }

    public PinEntity save(PinEntity entity) {
        store.put(entity.getStaffId(), entity);
        return entity;
    }
}
