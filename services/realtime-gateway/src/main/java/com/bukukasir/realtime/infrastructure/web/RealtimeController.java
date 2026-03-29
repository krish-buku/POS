package com.bukukasir.realtime.infrastructure.web;

import com.bukukasir.common.dto.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.Instant;
import java.util.Map;

@RestController
@RequestMapping("/api/realtime")
@Tag(name = "Realtime", description = "Realtime gateway status endpoints")
public class RealtimeController {

    @GetMapping("/status")
    @Operation(summary = "Get realtime gateway status")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getStatus() {
        Map<String, Object> status = Map.of(
                "status", "running",
                "websocketEndpoint", "/ws",
                "connectedClients", 0,
                "uptime", Instant.now().toString()
        );
        return ResponseEntity.ok(ApiResponse.success(status));
    }
}
