package com.bukukasir.business.domain.port.out;

import com.bukukasir.business.domain.model.Business;

import java.util.List;
import java.util.Optional;

public interface BusinessRepository {

    List<Business> findAll();

    Optional<Business> findById(String id);

    Business save(Business business);

    void deleteById(String id);
}
