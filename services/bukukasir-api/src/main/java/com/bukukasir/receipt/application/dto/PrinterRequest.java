package com.bukukasir.receipt.application.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

@Schema(description = "Request to create or update a printer")
public record PrinterRequest(

    @Schema(description = "Printer ID (optional for create)", example = "printer-001")
    String id,

    @NotBlank
    @Schema(description = "Business ID", example = "biz-001")
    String businessId,

    @NotBlank
    @Schema(description = "Printer name", example = "Kasir Utama")
    String name,

    @NotNull
    @Schema(description = "Printer type: RECEIPT, KITCHEN, BAR, LABEL", example = "RECEIPT")
    String type,

    @NotNull
    @Schema(description = "Connection type: NETWORK, USB, BLUETOOTH", example = "USB")
    String connectionType,

    @Schema(description = "IP address (for network printers)", example = "192.168.1.100")
    String ipAddress,

    @Schema(description = "Port (for network printers)", example = "9100")
    Integer port,

    @Schema(description = "MAC address (for bluetooth printers)", example = "AA:BB:CC:DD:EE:FF")
    String macAddress,

    @NotNull
    @Schema(description = "Paper width: MM_58, MM_80", example = "MM_80")
    String paperWidth,

    @Schema(description = "Whether printer has auto-cutter", example = "true")
    boolean hasCutter,

    @Schema(description = "Whether printer has cash drawer", example = "true")
    boolean hasCashDrawer,

    @Schema(description = "Whether this is the default printer", example = "true")
    boolean isDefault,

    @Schema(description = "Whether this printer is active", example = "true")
    boolean isActive
) {}
