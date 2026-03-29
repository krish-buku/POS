package com.bukukasir.auth.domain.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Value object representing a staff member's PIN for authentication.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Pin {

    private String staffId;
    private String staffName;
    private String hashedPin;
    private Role role;
    private String businessId;
    private boolean active;

    /**
     * Simple PIN hashing (in production, use BCrypt or similar).
     * For mock purposes, we just store the plain PIN.
     */
    public static String hashPin(String rawPin) {
        // In production: return BCrypt.hashpw(rawPin, BCrypt.gensalt());
        return rawPin;
    }

    public boolean verifyPin(String rawPin) {
        // In production: return BCrypt.checkpw(rawPin, this.hashedPin);
        return this.hashedPin.equals(rawPin);
    }
}
