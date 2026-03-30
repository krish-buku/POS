package com.bukukasir.auth.domain.port.in;

public interface ResetPinUseCase {

    String resetPin(String staffId, String managerStaffId);
}
