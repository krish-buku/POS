package com.bukukasir.common.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
@Schema(description = "Error response")
public class ErrorResponse {

    @Schema(description = "Error code", example = "RESOURCE_NOT_FOUND")
    private String code;

    @Schema(description = "Error message", example = "Resource not found")
    private String message;

    @Schema(description = "HTTP status code", example = "404")
    private int status;

    @Schema(description = "Request path", example = "/api/auth/verify-pin")
    private String path;

    @Schema(description = "Timestamp of the error")
    @Builder.Default
    private Instant timestamp = Instant.now();

    @Schema(description = "Validation errors (field -> error messages)")
    private Map<String, List<String>> validationErrors;
}
