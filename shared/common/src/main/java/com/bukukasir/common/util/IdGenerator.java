package com.bukukasir.common.util;

import java.util.UUID;

public final class IdGenerator {

    private IdGenerator() {
        // Utility class
    }

    public static String generateId() {
        return UUID.randomUUID().toString();
    }

    public static String generateShortId() {
        return UUID.randomUUID().toString().substring(0, 8);
    }

    public static String generateOrderNumber() {
        return "ORD-" + System.currentTimeMillis() % 100000;
    }

    public static String generateTicketNumber() {
        return "TKT-" + System.currentTimeMillis() % 10000;
    }
}
