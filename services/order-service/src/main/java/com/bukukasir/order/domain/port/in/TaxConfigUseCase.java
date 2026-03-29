package com.bukukasir.order.domain.port.in;

import com.bukukasir.order.domain.model.TaxConfig;

import java.util.List;

public interface TaxConfigUseCase {
    List<TaxConfig> getTaxConfigs(String businessId);
    TaxConfig createTaxConfig(TaxConfig taxConfig);
    TaxConfig updateTaxConfig(String id, TaxConfig taxConfig);
    void deleteTaxConfig(String id);
}
