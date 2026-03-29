package com.bukukasir.image.infrastructure.persistence.adapter;

import com.bukukasir.image.domain.model.ImageGenerationJob;
import com.bukukasir.image.domain.model.JobStatus;
import com.bukukasir.image.domain.port.out.ImageJobRepository;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class ImagePersistenceAdapter implements ImageJobRepository {
    private final Map<String, ImageGenerationJob> store = new ConcurrentHashMap<>();

    public ImagePersistenceAdapter() { initMockData(); }

    private void initMockData() {
        store.put("img-001", ImageGenerationJob.builder().id("img-001").prompt("Professional food photo of Nasi Goreng Spesial").menuItemId("menu-001").menuItemName("Nasi Goreng Spesial").status(JobStatus.COMPLETED).resultUrl("https://placeholder.com/nasi-goreng.jpg").businessId("biz-001").createdAt(Instant.now().minusSeconds(86400)).completedAt(Instant.now().minusSeconds(86340)).build());
        store.put("img-002", ImageGenerationJob.builder().id("img-002").prompt("Professional food photo of Ayam Bakar").menuItemId("menu-003").menuItemName("Ayam Bakar").status(JobStatus.COMPLETED).resultUrl("https://placeholder.com/ayam-bakar.jpg").businessId("biz-001").createdAt(Instant.now().minusSeconds(72000)).completedAt(Instant.now().minusSeconds(71940)).build());
    }

    @Override public List<ImageGenerationJob> findAll() { return new ArrayList<>(store.values()); }
    @Override public Optional<ImageGenerationJob> findById(String id) { return Optional.ofNullable(store.get(id)); }
    @Override public ImageGenerationJob save(ImageGenerationJob job) { store.put(job.getId(), job); return job; }
}
