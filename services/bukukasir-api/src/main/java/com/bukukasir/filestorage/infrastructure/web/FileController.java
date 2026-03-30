package com.bukukasir.filestorage.infrastructure.web;

import com.bukukasir.common.dto.ApiResponse;
import com.bukukasir.filestorage.domain.model.FileMetadata;
import com.bukukasir.filestorage.domain.port.in.FileStorageUseCase;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/files")
@RequiredArgsConstructor
@Tag(name = "File Storage", description = "File upload and management endpoints")
public class FileController {

    private final FileStorageUseCase fileStorageUseCase;

    @PostMapping("/upload")
    @Operation(summary = "Upload a file")
    public ResponseEntity<ApiResponse<FileMetadata>> uploadFile(
            @RequestParam String originalName,
            @RequestParam(defaultValue = "image/jpeg") String contentType,
            @RequestParam(defaultValue = "0") long fileSize,
            @RequestParam(defaultValue = "THUMBNAIL") String fileType,
            @RequestParam(defaultValue = "biz-001") String businessId,
            @RequestParam(required = false) String entityId) {
        FileMetadata metadata = fileStorageUseCase.uploadFile(originalName, contentType, fileSize, fileType, businessId, entityId);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(metadata, "File uploaded"));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get file metadata by ID")
    public ResponseEntity<ApiResponse<FileMetadata>> getFileById(@PathVariable String id) {
        return ResponseEntity.ok(ApiResponse.success(fileStorageUseCase.getFileById(id)));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete a file")
    public ResponseEntity<ApiResponse<Void>> deleteFile(@PathVariable String id) {
        fileStorageUseCase.deleteFile(id);
        return ResponseEntity.ok(ApiResponse.success(null, "File deleted"));
    }

    @GetMapping("/business/{businessId}")
    @Operation(summary = "List files by business")
    public ResponseEntity<ApiResponse<List<FileMetadata>>> getFilesByBusiness(@PathVariable String businessId) {
        return ResponseEntity.ok(ApiResponse.success(fileStorageUseCase.getFilesByBusinessId(businessId)));
    }
}
