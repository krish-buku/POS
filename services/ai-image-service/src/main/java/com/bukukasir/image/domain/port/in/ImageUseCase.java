package com.bukukasir.image.domain.port.in;

import com.bukukasir.image.domain.model.ImageGenerationJob;

import java.util.List;

public interface ImageUseCase {
    ImageGenerationJob generateImage(String prompt, String menuItemId, String menuItemName, String businessId);
    ImageGenerationJob getJobById(String id);
    List<ImageGenerationJob> getAllJobs();
}
