package com.bukukasir.order.domain.port.out;

import com.bukukasir.order.domain.model.TaxConfig;

import java.util.List;
import java.util.Optional;

public interface TaxConfigRepository {
    List<TaxConfig> findByBusinessId(String businessId);
    List<TaxConfig> findActiveByBusinessId(String businessId);
    Optional<TaxConfig> findById(String id);
    TaxConfig save(TaxConfig taxConfig);
    void deleteById(String id);
}
