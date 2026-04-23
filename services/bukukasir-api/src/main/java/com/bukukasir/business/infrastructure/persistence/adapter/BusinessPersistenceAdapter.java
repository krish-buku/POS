package com.bukukasir.business.infrastructure.persistence.adapter;

import com.bukukasir.business.domain.model.Business;
import com.bukukasir.business.domain.port.out.BusinessRepository;
import com.bukukasir.business.infrastructure.persistence.entity.BusinessEntity;
import com.bukukasir.business.infrastructure.persistence.repository.JpaBusinessRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

@Component
@RequiredArgsConstructor
public class BusinessPersistenceAdapter implements BusinessRepository {

    private final JpaBusinessRepository jpa;

    @Override
    public List<Business> findAll() {
        return jpa.findAll().stream().map(this::toDomain).toList();
    }

    @Override
    public Optional<Business> findById(String id) {
        return jpa.findById(id).map(this::toDomain);
    }

    @Override
    public Business save(Business business) {
        return toDomain(jpa.save(toEntity(business)));
    }

    @Override
    public void deleteById(String id) {
        jpa.deleteById(id);
    }

    private Business toDomain(BusinessEntity e) {
        return Business.builder()
                .id(e.getId())
                .name(e.getName())
                .type(e.getType())
                .address(e.getAddress())
                .phone(e.getPhone())
                .ownerId(e.getOwnerId())
                .logoUrl(e.getLogoUrl())
                .currency(e.getCurrency() != null ? e.getCurrency() : "IDR")
                .timezone(e.getTimezone() != null ? e.getTimezone() : "Asia/Jakarta")
                .active(e.isActive())
                .createdAt(e.getCreatedAt() != null ? e.getCreatedAt() : Instant.now())
                .updatedAt(e.getUpdatedAt() != null ? e.getUpdatedAt() : Instant.now())
                .build();
    }

    private BusinessEntity toEntity(Business b) {
        return BusinessEntity.builder()
                .id(b.getId())
                .name(b.getName())
                .type(b.getType())
                .address(b.getAddress())
                .phone(b.getPhone())
                .ownerId(b.getOwnerId())
                .logoUrl(b.getLogoUrl())
                .currency(b.getCurrency())
                .timezone(b.getTimezone())
                .active(b.isActive())
                .createdAt(b.getCreatedAt())
                .updatedAt(b.getUpdatedAt() != null ? b.getUpdatedAt() : Instant.now())
                .build();
    }
}
