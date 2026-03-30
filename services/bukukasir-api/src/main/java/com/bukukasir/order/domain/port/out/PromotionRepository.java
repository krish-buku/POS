package com.bukukasir.order.domain.port.out;

import com.bukukasir.order.domain.model.Promotion;

import java.util.List;
import java.util.Optional;

public interface PromotionRepository {
    List<Promotion> findByBusinessId(String businessId);
    Optional<Promotion> findById(String id);
    Promotion save(Promotion promotion);
    void deleteById(String id);
}
