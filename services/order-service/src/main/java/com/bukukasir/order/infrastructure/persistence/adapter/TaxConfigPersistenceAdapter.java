package com.bukukasir.order.infrastructure.persistence.adapter;

import com.bukukasir.order.domain.model.TaxConfig;
import com.bukukasir.order.domain.port.out.TaxConfigRepository;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;

@Component
public class TaxConfigPersistenceAdapter implements TaxConfigRepository {

    private final Map<String, TaxConfig> store = new ConcurrentHashMap<>();

    public TaxConfigPersistenceAdapter() { initMockData(); }

    private void initMockData() {
        // PPN 11% (exclusive, active) for business biz-001
        store.put("tax-001", TaxConfig.builder()
                .id("tax-001").businessId("biz-001").name("PPN")
                .rate(new BigDecimal("0.11")).inclusive(false).active(true).priority(1)
                .build());

        // PB1 Service Charge 5% (exclusive, active) for business biz-001
        store.put("tax-002", TaxConfig.builder()
                .id("tax-002").businessId("biz-001").name("PB1 Service Charge")
                .rate(new BigDecimal("0.05")).inclusive(false).active(true).priority(2)
                .build());

        // PPN 11% (inclusive, active) for business biz-002
        store.put("tax-003", TaxConfig.builder()
                .id("tax-003").businessId("biz-002").name("PPN")
                .rate(new BigDecimal("0.11")).inclusive(true).active(true).priority(1)
                .build());
    }

    @Override
    public List<TaxConfig> findByBusinessId(String businessId) {
        return store.values().stream()
                .filter(t -> t.getBusinessId().equals(businessId))
                .sorted(Comparator.comparingInt(TaxConfig::getPriority))
                .collect(Collectors.toList());
    }

    @Override
    public List<TaxConfig> findActiveByBusinessId(String businessId) {
        return store.values().stream()
                .filter(t -> t.getBusinessId().equals(businessId) && t.isActive())
                .sorted(Comparator.comparingInt(TaxConfig::getPriority))
                .collect(Collectors.toList());
    }

    @Override
    public Optional<TaxConfig> findById(String id) {
        return Optional.ofNullable(store.get(id));
    }

    @Override
    public TaxConfig save(TaxConfig taxConfig) {
        store.put(taxConfig.getId(), taxConfig);
        return taxConfig;
    }

    @Override
    public void deleteById(String id) {
        store.remove(id);
    }
}
