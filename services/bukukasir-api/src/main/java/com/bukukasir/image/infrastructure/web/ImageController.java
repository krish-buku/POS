package com.bukukasir.image.infrastructure.web;

import com.bukukasir.common.dto.ApiResponse;
import com.bukukasir.image.application.dto.GenerateImageRequest;
import com.bukukasir.image.domain.model.ImageGenerationJob;
import com.bukukasir.image.domain.port.in.ImageUseCase;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/images")
@RequiredArgsConstructor
@Tag(name = "AI Images", description = "AI image generation endpoints")
public class ImageController {

    private final ImageUseCase imageUseCase;

    @PostMapping("/generate")
    @Operation(summary = "Generate an image for a menu item")
    public ResponseEntity<ApiResponse<ImageGenerationJob>> generateImage(@Valid @RequestBody GenerateImageRequest request) {
        ImageGenerationJob job = imageUseCase.generateImage(request.prompt(), request.menuItemId(), request.menuItemName(), request.businessId());
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(job, "Image generation job created"));
    }

    @GetMapping("/jobs/{id}")
    @Operation(summary = "Get image generation job status")
    public ResponseEntity<ApiResponse<ImageGenerationJob>> getJobById(@PathVariable String id) {
        return ResponseEntity.ok(ApiResponse.success(imageUseCase.getJobById(id)));
    }

    @GetMapping("/jobs")
    @Operation(summary = "List all image generation jobs")
    public ResponseEntity<ApiResponse<List<ImageGenerationJob>>> getAllJobs() {
        return ResponseEntity.ok(ApiResponse.success(imageUseCase.getAllJobs()));
    }
}
