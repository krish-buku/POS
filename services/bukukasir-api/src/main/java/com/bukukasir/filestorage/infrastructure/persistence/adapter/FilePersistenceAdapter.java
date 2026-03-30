package com.bukukasir.filestorage.infrastructure.persistence.adapter;

import com.bukukasir.filestorage.domain.model.FileMetadata;
import com.bukukasir.filestorage.domain.model.FileType;
import com.bukukasir.filestorage.domain.port.out.FileRepository;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;

@Component
public class FilePersistenceAdapter implements FileRepository {
    private final Map<String, FileMetadata> store = new ConcurrentHashMap<>();

    public FilePersistenceAdapter() { initMockData(); }

    private void initMockData() {
        store.put("file-001", FileMetadata.builder().id("file-001").fileName("nasi-goreng.jpg").originalName("nasi-goreng.jpg").contentType("image/jpeg").fileSize(245000).fileType(FileType.THUMBNAIL).url("/api/files/file-001").businessId("biz-001").entityId("menu-001").createdAt(Instant.now().minusSeconds(86400)).build());
        store.put("file-002", FileMetadata.builder().id("file-002").fileName("ayam-bakar.jpg").originalName("ayam-bakar.jpg").contentType("image/jpeg").fileSize(310000).fileType(FileType.THUMBNAIL).url("/api/files/file-002").businessId("biz-001").entityId("menu-003").createdAt(Instant.now().minusSeconds(72000)).build());
        store.put("file-003", FileMetadata.builder().id("file-003").fileName("warung-logo.png").originalName("warung-logo.png").contentType("image/png").fileSize(52000).fileType(FileType.LOGO).url("/api/files/file-003").businessId("biz-001").createdAt(Instant.now().minusSeconds(172800)).build());
        store.put("file-004", FileMetadata.builder().id("file-004").fileName("kopi-susu.jpg").originalName("kopi-susu.jpg").contentType("image/jpeg").fileSize(198000).fileType(FileType.THUMBNAIL).url("/api/files/file-004").businessId("biz-001").entityId("menu-007").createdAt(Instant.now().minusSeconds(43200)).build());
        store.put("file-005", FileMetadata.builder().id("file-005").fileName("receipt-001.pdf").originalName("receipt-001.pdf").contentType("application/pdf").fileSize(15000).fileType(FileType.RECEIPT).url("/api/files/file-005").businessId("biz-001").entityId("order-001").createdAt(Instant.now().minusSeconds(3600)).build());
    }

    @Override public FileMetadata save(FileMetadata m) { store.put(m.getId(), m); return m; }
    @Override public Optional<FileMetadata> findById(String id) { return Optional.ofNullable(store.get(id)); }
    @Override public void deleteById(String id) { store.remove(id); }
    @Override public List<FileMetadata> findByBusinessId(String businessId) {
        return store.values().stream().filter(f -> f.getBusinessId().equals(businessId)).collect(Collectors.toList());
    }
}
