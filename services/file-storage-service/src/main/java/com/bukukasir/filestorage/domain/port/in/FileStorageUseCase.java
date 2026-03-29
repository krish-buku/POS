package com.bukukasir.filestorage.domain.port.in;

import com.bukukasir.filestorage.domain.model.FileMetadata;

import java.util.List;

public interface FileStorageUseCase {
    FileMetadata uploadFile(String originalName, String contentType, long fileSize, String fileType, String businessId, String entityId);
    FileMetadata getFileById(String id);
    void deleteFile(String id);
    List<FileMetadata> getFilesByBusinessId(String businessId);
}
