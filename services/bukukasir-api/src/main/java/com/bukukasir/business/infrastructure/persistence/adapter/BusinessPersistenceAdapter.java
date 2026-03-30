package com.bukukasir.business.infrastructure.persistence.adapter;

import com.bukukasir.business.domain.model.Business;
import com.bukukasir.business.domain.port.out.BusinessRepository;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class BusinessPersistenceAdapter implements BusinessRepository {

    private final Map<String, Business> store = new ConcurrentHashMap<>();

    public BusinessPersistenceAdapter() {
        initMockData();
    }

    private void initMockData() {
        store.put("biz-001", Business.builder()
                .id("biz-001").name("Warung Nusantara").type("restaurant")
                .address("Jl. Sudirman No. 123, Jakarta Selatan")
                .phone("+62-21-5551234").ownerId("user-001")
                .logoUrl(null).currency("IDR").timezone("Asia/Jakarta")
                .active(true).createdAt(Instant.parse("2024-01-15T08:00:00Z"))
                .updatedAt(Instant.parse("2024-06-01T10:00:00Z")).build());

        store.put("biz-002", Business.builder()
                .id("biz-002").name("Kopi Kenangan Senja").type("cafe")
                .address("Jl. Gatot Subroto No. 45, Jakarta Selatan")
                .phone("+62-21-5559876").ownerId("user-001")
                .logoUrl(null).currency("IDR").timezone("Asia/Jakarta")
                .active(true).createdAt(Instant.parse("2024-03-20T08:00:00Z"))
                .updatedAt(Instant.parse("2024-05-15T10:00:00Z")).build());
    }

    @Override
    public List<Business> findAll() {
        return new ArrayList<>(store.values());
    }

    @Override
    public Optional<Business> findById(String id) {
        return Optional.ofNullable(store.get(id));
    }

    @Override
    public Business save(Business business) {
        store.put(business.getId(), business);
        return business;
    }

    @Override
    public void deleteById(String id) {
        store.remove(id);
    }
}
