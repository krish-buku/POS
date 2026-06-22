package com.bukukasir.config;

import com.bukukasir.business.infrastructure.persistence.entity.BusinessEntity;
import com.bukukasir.business.infrastructure.persistence.repository.JpaBusinessRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;

import java.time.Instant;
import java.util.List;

@Configuration
@Profile("localdb")
@RequiredArgsConstructor
public class LocalDbSeedConfig {

    private final JpaBusinessRepository businessRepository;

    @Bean
    ApplicationRunner seedLocalBusinesses() {
        return args -> {
            if (businessRepository.count() > 0) {
                return;
            }

            Instant now = Instant.now();
            businessRepository.saveAll(List.of(
                    BusinessEntity.builder()
                            .id("biz-001")
                            .name("Warung Nusantara")
                            .type("restaurant")
                            .address("Jl. Merdeka No. 45, Jakarta Selatan")
                            .phone("+6281234567890")
                            .ownerId("usr-001")
                            .logoUrl("/api/files/file-003")
                            .currency("IDR")
                            .timezone("Asia/Jakarta")
                            .active(true)
                            .createdAt(Instant.parse("2024-01-15T08:00:00Z"))
                            .updatedAt(now)
                            .build(),
                    BusinessEntity.builder()
                            .id("biz-002")
                            .name("Kopi Kenangan Senja")
                            .type("cafe")
                            .address("Jl. Sudirman No. 12, Jakarta Pusat")
                            .phone("+6281298765432")
                            .ownerId("usr-001")
                            .logoUrl("/api/files/file-003")
                            .currency("IDR")
                            .timezone("Asia/Jakarta")
                            .active(true)
                            .createdAt(Instant.parse("2024-06-01T10:00:00Z"))
                            .updatedAt(now)
                            .build()));
        };
    }
}
