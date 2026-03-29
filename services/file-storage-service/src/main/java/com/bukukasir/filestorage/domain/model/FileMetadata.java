package com.bukukasir.filestorage.domain.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FileMetadata {
    private String id;
    private String fileName;
    private String originalName;
    private String contentType;
    private long fileSize;
    private FileType fileType;
    private String url;
    private String businessId;
    private String entityId; // menu item id, etc.
    private Instant createdAt;
}
