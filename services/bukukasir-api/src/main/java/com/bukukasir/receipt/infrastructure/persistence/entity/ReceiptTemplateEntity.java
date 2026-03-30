package com.bukukasir.receipt.infrastructure.persistence.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "receipt_templates")
public class ReceiptTemplateEntity {

    @Id
    private String id;

    @Column(nullable = false)
    private String businessId;

    private String headerText;
    private String footerText;
    private boolean showLogo;
    private boolean showAddress;
    private boolean showTaxDetails;
    private String paperWidth;
}
