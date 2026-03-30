package com.bukukasir.receipt.domain.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReceiptTemplate {
    private String id;
    private String businessId;
    private String headerText;
    private String footerText;
    private boolean showLogo;
    private boolean showAddress;
    private boolean showTaxDetails;
    private String paperWidth; // 58mm, 80mm
}
