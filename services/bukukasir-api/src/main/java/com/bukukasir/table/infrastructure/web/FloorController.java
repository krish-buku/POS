package com.bukukasir.table.infrastructure.web;

import com.bukukasir.common.dto.ApiResponse;
import com.bukukasir.table.application.dto.FloorRequest;
import com.bukukasir.table.application.dto.FloorResponse;
import com.bukukasir.table.infrastructure.persistence.entity.FloorEntity;
import com.bukukasir.table.infrastructure.persistence.repository.JpaFloorRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/floors")
@RequiredArgsConstructor
@Tag(name = "Floors", description = "Restaurant floor (storey) management")
public class FloorController {

    private final JpaFloorRepository floorRepository;

    @GetMapping
    @Operation(summary = "List floors for a business")
    public ResponseEntity<ApiResponse<List<FloorResponse>>> list(
            @RequestParam(required = false) String businessId) {
        List<FloorEntity> floors = businessId != null
                ? floorRepository.findByBusinessIdOrderBySortOrderAsc(businessId)
                : floorRepository.findAll();
        return ResponseEntity.ok(ApiResponse.success(floors.stream().map(this::toResponse).toList()));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get floor by ID")
    public ResponseEntity<ApiResponse<FloorResponse>> getById(@PathVariable String id) {
        FloorEntity entity = floorRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Floor not found"));
        return ResponseEntity.ok(ApiResponse.success(toResponse(entity)));
    }

    @PostMapping
    @Operation(summary = "Create a floor")
    public ResponseEntity<ApiResponse<FloorResponse>> create(@Valid @RequestBody FloorRequest request) {
        FloorEntity entity = FloorEntity.builder()
                .id("floor-" + UUID.randomUUID().toString().substring(0, 8))
                .businessId(request.businessId())
                .name(request.name())
                .sortOrder(request.sortOrder())
                .build();
        FloorEntity saved = floorRepository.save(entity);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(toResponse(saved), "Floor created"));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update a floor")
    public ResponseEntity<ApiResponse<FloorResponse>> update(
            @PathVariable String id, @Valid @RequestBody FloorRequest request) {
        FloorEntity entity = floorRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Floor not found"));
        entity.setName(request.name());
        entity.setSortOrder(request.sortOrder());
        if (request.businessId() != null) entity.setBusinessId(request.businessId());
        return ResponseEntity.ok(ApiResponse.success(toResponse(floorRepository.save(entity)), "Floor updated"));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete a floor")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable String id) {
        floorRepository.deleteById(id);
        return ResponseEntity.ok(ApiResponse.success(null, "Floor deleted"));
    }

    private FloorResponse toResponse(FloorEntity e) {
        return new FloorResponse(e.getId(), e.getBusinessId(), e.getName(), e.getSortOrder());
    }
}
