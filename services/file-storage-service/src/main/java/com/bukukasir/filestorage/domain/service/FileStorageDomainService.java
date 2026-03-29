package com.bukukasir.filestorage.domain.service;

import com.bukukasir.common.exception.ResourceNotFoundException;
import com.bukukasir.common.util.IdGenerator;
import com.bukukasir.filestorage.domain.model.FileMetadata;
import com.bukukasir.filestorage.domain.model.FileType;
import com.bukukasir.filestorage.domain.port.in.FileStorageUseCase;
import com.bukukasir.filestorage.domain.port.out.FileRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;

@Service
@RequiredArgsConstructor
public class FileStorageDomainService implements FileStorageUseCase {
    private final FileRepository fileRepository;

    @Override
    public FileMetadata uploadFile(String originalName, String contentType, long fileSize, String fileType, String businessId, String entityId) {
        String id = IdGenerator.generateId();
        FileMetadata metadata = FileMetadata.builder()
                .id(id).fileName(id + "_" + originalName).originalName(originalName)
                .contentType(contentType).fileSize(fileSize)
                .fileType(FileType.valueOf(fileType))
                .url("/api/files/" + id)
                .businessId(businessId).entityId(entityId)
                .createdAt(Instant.now()).build();
        return fileRepository.save(metadata);
    }

    @Override
    public FileMetadata getFileById(String id) {
        return fileRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("File", "id", id));
    }

    @Override
    public void deleteFile(String id) { getFileById(id); fileRepository.deleteById(id); }

    @Override
    public List<FileMetadata> getFilesByBusinessId(String businessId) { return fileRepository.findByBusinessId(businessId); }
}
