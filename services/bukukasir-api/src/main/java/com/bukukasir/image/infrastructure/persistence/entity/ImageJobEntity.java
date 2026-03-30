package com.bukukasir.image.infrastructure.persistence.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "image_jobs")
public class ImageJobEntity {

    @Id
    private String id;

    private String prompt;
    private String menuItemId;
    private String menuItemName;
    private String status;
    private String resultUrl;
    private String businessId;
    private Instant createdAt;
    private Instant completedAt;
}
