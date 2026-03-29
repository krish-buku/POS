package com.bukukasir.business.domain.port.in;

import com.bukukasir.business.domain.model.Business;
import com.bukukasir.business.domain.model.OwnershipTransfer;

import java.util.List;

public interface BusinessUseCase {

    List<Business> getAllBusinesses();

    Business getBusinessById(String id);

    Business createBusiness(Business business);

    Business updateBusiness(String id, Business business);

    OwnershipTransfer transferOwnership(String businessId, String fromOwnerId, String toOwnerId);
}
