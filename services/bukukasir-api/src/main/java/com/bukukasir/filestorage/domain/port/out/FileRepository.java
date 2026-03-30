package com.bukukasir.filestorage.domain.port.out;

import com.bukukasir.filestorage.domain.model.FileMetadata;

import java.util.List;
import java.util.Optional;

public interface FileRepository {
    FileMetadata save(FileMetadata metadata);
    Optional<FileMetadata> findById(String id);
    void deleteById(String id);
    List<FileMetadata> findByBusinessId(String businessId);
}
