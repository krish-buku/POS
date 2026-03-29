package com.bukukasir.image.domain.service;

import com.bukukasir.common.exception.ResourceNotFoundException;
import com.bukukasir.common.util.IdGenerator;
import com.bukukasir.image.domain.model.ImageGenerationJob;
import com.bukukasir.image.domain.model.JobStatus;
import com.bukukasir.image.domain.port.in.ImageUseCase;
import com.bukukasir.image.domain.port.out.ImageJobRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ImageDomainService implements ImageUseCase {
    private final ImageJobRepository imageJobRepository;

    @Override
    public ImageGenerationJob generateImage(String prompt, String menuItemId, String menuItemName, String businessId) {
        ImageGenerationJob job = ImageGenerationJob.builder()
                .id(IdGenerator.generateId()).prompt(prompt).menuItemId(menuItemId)
                .menuItemName(menuItemName).status(JobStatus.PENDING)
                .businessId(businessId).createdAt(Instant.now()).build();
        return imageJobRepository.save(job);
    }

    @Override public ImageGenerationJob getJobById(String id) {
        return imageJobRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("ImageJob", "id", id));
    }

    @Override public List<ImageGenerationJob> getAllJobs() { return imageJobRepository.findAll(); }
}
