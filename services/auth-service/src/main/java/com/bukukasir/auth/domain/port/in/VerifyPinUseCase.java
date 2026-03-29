package com.bukukasir.auth.domain.port.in;

import com.bukukasir.auth.domain.model.Session;

public interface VerifyPinUseCase {

    Session verifyPin(String businessId, String pin);
}
