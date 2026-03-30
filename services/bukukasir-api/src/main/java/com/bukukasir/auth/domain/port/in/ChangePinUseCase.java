package com.bukukasir.auth.domain.port.in;

public interface ChangePinUseCase {

    void changePin(String staffId, String currentPin, String newPin);
}
