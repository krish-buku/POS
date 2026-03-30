package com.bukukasir.image.domain.port.out;

import com.bukukasir.image.domain.model.ImageGenerationJob;

import java.util.List;
import java.util.Optional;

public interface ImageJobRepository {
    List<ImageGenerationJob> findAll();
    Optional<ImageGenerationJob> findById(String id);
    ImageGenerationJob save(ImageGenerationJob job);
}
