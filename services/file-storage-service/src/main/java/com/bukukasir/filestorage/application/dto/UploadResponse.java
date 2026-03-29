package com.bukukasir.filestorage.application.dto;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "Upload response")
public record UploadResponse(
    String id, String fileName, String url, String contentType, long fileSize
) {}
