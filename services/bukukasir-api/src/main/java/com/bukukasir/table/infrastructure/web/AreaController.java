package com.bukukasir.table.infrastructure.web;

import com.bukukasir.common.dto.ApiResponse;
import com.bukukasir.table.application.dto.AreaRequest;
import com.bukukasir.table.application.dto.AreaResponse;
import com.bukukasir.table.infrastructure.persistence.entity.AreaEntity;
import com.bukukasir.table.infrastructure.persistence.repository.JpaAreaRepository;
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
@RequestMapping("/api/areas")
@RequiredArgsConstructor
@Tag(name = "Areas", description = "Restaurant area (section within a floor) management")
public class AreaController {

    private final JpaAreaRepository areaRepository;

    @GetMapping
    @Operation(summary = "List areas, optionally filtered by business or floor")
    public ResponseEntity<ApiResponse<List<AreaResponse>>> list(
            @RequestParam(required = false) String businessId,
            @RequestParam(required = false) String floorId) {
        List<AreaEntity> areas;
        if (floorId != null) {
            areas = areaRepository.findByFloorIdOrderBySortOrderAsc(floorId);
        } else if (businessId != null) {
            areas = areaRepository.findByBusinessIdOrderBySortOrderAsc(businessId);
        } else {
            areas = areaRepository.findAll();
        }
        return ResponseEntity.ok(ApiResponse.success(areas.stream().map(this::toResponse).toList()));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get area by ID")
    public ResponseEntity<ApiResponse<AreaResponse>> getById(@PathVariable String id) {
        AreaEntity entity = areaRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Area not found"));
        return ResponseEntity.ok(ApiResponse.success(toResponse(entity)));
    }

    @PostMapping
    @Operation(summary = "Create an area")
    public ResponseEntity<ApiResponse<AreaResponse>> create(@Valid @RequestBody AreaRequest request) {
        AreaEntity entity = AreaEntity.builder()
                .id("area-" + UUID.randomUUID().toString().substring(0, 8))
                .businessId(request.businessId())
                .floorId(request.floorId())
                .name(request.name())
                .sortOrder(request.sortOrder())
                .build();
        AreaEntity saved = areaRepository.save(entity);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(toResponse(saved), "Area created"));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update an area")
    public ResponseEntity<ApiResponse<AreaResponse>> update(
            @PathVariable String id, @Valid @RequestBody AreaRequest request) {
        AreaEntity entity = areaRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Area not found"));
        entity.setName(request.name());
        entity.setFloorId(request.floorId());
        entity.setSortOrder(request.sortOrder());
        if (request.businessId() != null) entity.setBusinessId(request.businessId());
        return ResponseEntity.ok(ApiResponse.success(toResponse(areaRepository.save(entity)), "Area updated"));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete an area")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable String id) {
        areaRepository.deleteById(id);
        return ResponseEntity.ok(ApiResponse.success(null, "Area deleted"));
    }

    private AreaResponse toResponse(AreaEntity e) {
        return new AreaResponse(e.getId(), e.getBusinessId(), e.getFloorId(), e.getName(), e.getSortOrder());
    }
}
