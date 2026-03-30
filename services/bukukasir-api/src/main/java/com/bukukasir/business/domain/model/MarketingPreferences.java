package com.bukukasir.business.domain.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MarketingPreferences {
    @Builder.Default
    private boolean smsOptIn = true;
    @Builder.Default
    private boolean emailOptIn = true;
    @Builder.Default
    private boolean whatsappOptIn = true;
}
