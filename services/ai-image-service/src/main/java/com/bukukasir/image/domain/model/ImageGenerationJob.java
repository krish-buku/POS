package com.bukukasir.image.domain.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ImageGenerationJob {
    private String id;
    private String prompt;
    private String menuItemId;
    private String menuItemName;
    private JobStatus status;
    private String resultUrl;
    private String businessId;
    private Instant createdAt;
    private Instant completedAt;
}
