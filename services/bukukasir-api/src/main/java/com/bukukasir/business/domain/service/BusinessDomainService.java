package com.bukukasir.business.domain.service;

import com.bukukasir.business.domain.model.Business;
import com.bukukasir.business.domain.model.OwnershipTransfer;
import com.bukukasir.business.domain.port.in.BusinessUseCase;
import com.bukukasir.business.domain.port.out.BusinessRepository;
import com.bukukasir.common.exception.ResourceNotFoundException;
import com.bukukasir.common.util.IdGenerator;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;

@Service
@RequiredArgsConstructor
public class BusinessDomainService implements BusinessUseCase {

    private final BusinessRepository businessRepository;

    @Override
    public List<Business> getAllBusinesses() {
        return businessRepository.findAll();
    }

    @Override
    public Business getBusinessById(String id) {
        return businessRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Business", "id", id));
    }

    @Override
    public Business createBusiness(Business business) {
        business.setId(IdGenerator.generateId());
        business.setActive(true);
        business.setCreatedAt(Instant.now());
        business.setUpdatedAt(Instant.now());
        return businessRepository.save(business);
    }

    @Override
    public Business updateBusiness(String id, Business business) {
        Business existing = getBusinessById(id);
        existing.setName(business.getName());
        existing.setType(business.getType());
        existing.setAddress(business.getAddress());
        existing.setPhone(business.getPhone());
        existing.setLogoUrl(business.getLogoUrl());
        existing.setUpdatedAt(Instant.now());
        return businessRepository.save(existing);
    }

    @Override
    public OwnershipTransfer transferOwnership(String businessId, String fromOwnerId, String toOwnerId) {
        Business business = getBusinessById(businessId);
        business.setOwnerId(toOwnerId);
        business.setUpdatedAt(Instant.now());
        businessRepository.save(business);

        return OwnershipTransfer.builder()
                .id(IdGenerator.generateId())
                .businessId(businessId)
                .fromOwnerId(fromOwnerId)
                .toOwnerId(toOwnerId)
                .status("COMPLETED")
                .requestedAt(Instant.now())
                .completedAt(Instant.now())
                .build();
    }
}
