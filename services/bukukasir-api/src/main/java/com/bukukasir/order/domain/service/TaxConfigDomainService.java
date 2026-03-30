package com.bukukasir.order.domain.service;

import com.bukukasir.common.exception.ResourceNotFoundException;
import com.bukukasir.common.util.IdGenerator;
import com.bukukasir.order.domain.model.TaxConfig;
import com.bukukasir.order.domain.port.in.TaxConfigUseCase;
import com.bukukasir.order.domain.port.out.TaxConfigRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class TaxConfigDomainService implements TaxConfigUseCase {

    private final TaxConfigRepository taxConfigRepository;

    @Override
    public List<TaxConfig> getTaxConfigs(String businessId) {
        return taxConfigRepository.findByBusinessId(businessId);
    }

    @Override
    public TaxConfig createTaxConfig(TaxConfig taxConfig) {
        taxConfig.setId(IdGenerator.generateId());
        taxConfig.setActive(true);
        return taxConfigRepository.save(taxConfig);
    }

    @Override
    public TaxConfig updateTaxConfig(String id, TaxConfig taxConfig) {
        TaxConfig existing = taxConfigRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("TaxConfig", "id", id));
        existing.setName(taxConfig.getName());
        existing.setRate(taxConfig.getRate());
        existing.setInclusive(taxConfig.isInclusive());
        existing.setActive(taxConfig.isActive());
        existing.setPriority(taxConfig.getPriority());
        return taxConfigRepository.save(existing);
    }

    @Override
    public void deleteTaxConfig(String id) {
        taxConfigRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("TaxConfig", "id", id));
        taxConfigRepository.deleteById(id);
    }
}
