package com.bukukasir.business.infrastructure.persistence.adapter;

import com.bukukasir.business.domain.model.Customer;
import com.bukukasir.business.domain.model.Gender;
import com.bukukasir.business.domain.model.MarketingPreferences;
import com.bukukasir.business.domain.port.out.CustomerRepository;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;

@Component
public class CustomerPersistenceAdapter implements CustomerRepository {

    private final Map<String, Customer> store = new ConcurrentHashMap<>();

    public CustomerPersistenceAdapter() {
        initMockData();
    }

    private void initMockData() {
        // 1. Pak Hendra - 15 orders, Rp 2,400,000 spent
        store.put("cust-001", Customer.builder()
                .id("cust-001")
                .businessId("biz-001")
                .phone("+6281234567001")
                .name("Pak Hendra")
                .email("hendra@email.com")
                .dateOfBirth(null)
                .gender(Gender.MALE)
                .notes("Regular customer, prefers spicy food")
                .totalOrders(15)
                .totalSpent(new BigDecimal("2400000"))
                .lastOrderAt(Instant.parse("2024-06-10T12:30:00Z"))
                .marketingPreferences(MarketingPreferences.builder()
                        .smsOptIn(true).emailOptIn(true).whatsappOptIn(true).build())
                .createdAt(Instant.parse("2024-01-20T08:00:00Z"))
                .updatedAt(Instant.parse("2024-06-10T12:30:00Z"))
                .build());

        // 2. Ibu Sari - 8 orders, Rp 1,200,000 spent
        store.put("cust-002", Customer.builder()
                .id("cust-002")
                .businessId("biz-001")
                .phone("+6281234567002")
                .name("Ibu Sari")
                .email("sari@email.com")
                .dateOfBirth(null)
                .gender(Gender.FEMALE)
                .notes(null)
                .totalOrders(8)
                .totalSpent(new BigDecimal("1200000"))
                .lastOrderAt(Instant.parse("2024-06-08T18:45:00Z"))
                .marketingPreferences(MarketingPreferences.builder()
                        .smsOptIn(true).emailOptIn(false).whatsappOptIn(true).build())
                .createdAt(Instant.parse("2024-02-15T10:00:00Z"))
                .updatedAt(Instant.parse("2024-06-08T18:45:00Z"))
                .build());

        // 3. Mas Dika - 3 orders, Rp 450,000 spent
        store.put("cust-003", Customer.builder()
                .id("cust-003")
                .businessId("biz-001")
                .phone("+6281234567003")
                .name("Mas Dika")
                .email(null)
                .dateOfBirth(null)
                .gender(Gender.MALE)
                .notes(null)
                .totalOrders(3)
                .totalSpent(new BigDecimal("450000"))
                .lastOrderAt(Instant.parse("2024-06-05T13:00:00Z"))
                .marketingPreferences(MarketingPreferences.builder()
                        .smsOptIn(true).emailOptIn(true).whatsappOptIn(true).build())
                .createdAt(Instant.parse("2024-05-01T09:00:00Z"))
                .updatedAt(Instant.parse("2024-06-05T13:00:00Z"))
                .build());

        // 4. Walk-in - no phone, generic walk-in customer
        store.put("cust-004", Customer.builder()
                .id("cust-004")
                .businessId("biz-001")
                .phone(null)
                .name("Walk-in")
                .email(null)
                .dateOfBirth(null)
                .gender(Gender.UNSPECIFIED)
                .notes("Generic walk-in customer for unregistered guests")
                .totalOrders(0)
                .totalSpent(BigDecimal.ZERO)
                .lastOrderAt(null)
                .marketingPreferences(MarketingPreferences.builder()
                        .smsOptIn(false).emailOptIn(false).whatsappOptIn(false).build())
                .createdAt(Instant.parse("2024-01-15T08:00:00Z"))
                .updatedAt(Instant.parse("2024-01-15T08:00:00Z"))
                .build());
    }

    @Override
    public List<Customer> findByBusinessId(String businessId) {
        return store.values().stream()
                .filter(c -> c.getBusinessId().equals(businessId))
                .collect(Collectors.toList());
    }

    @Override
    public Optional<Customer> findById(String id) {
        return Optional.ofNullable(store.get(id));
    }

    @Override
    public Optional<Customer> findByPhoneAndBusinessId(String phone, String businessId) {
        return store.values().stream()
                .filter(c -> c.getBusinessId().equals(businessId)
                        && c.getPhone() != null && c.getPhone().equals(phone))
                .findFirst();
    }

    @Override
    public Customer save(Customer customer) {
        store.put(customer.getId(), customer);
        return customer;
    }

    @Override
    public void deleteById(String id) {
        store.remove(id);
    }
}
