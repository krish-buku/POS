package com.bukukasir.receipt.application.dto;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "Receipt template update request")
public record TemplateRequest(
    String id,
    String businessId,
    String headerText,
    String footerText,
    boolean showLogo,
    boolean showAddress,
    boolean showTaxDetails,
    String paperWidth
) {}
