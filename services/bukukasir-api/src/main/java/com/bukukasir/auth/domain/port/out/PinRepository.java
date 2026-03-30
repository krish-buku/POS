package com.bukukasir.auth.domain.port.out;

import com.bukukasir.auth.domain.model.Pin;

import java.util.List;
import java.util.Optional;

public interface PinRepository {

    Optional<Pin> findByStaffId(String staffId);

    Optional<Pin> findByBusinessIdAndHashedPin(String businessId, String hashedPin);

    List<Pin> findByBusinessId(String businessId);

    Pin save(Pin pin);
}
