package com.bukukasir.common.util;

import java.math.BigDecimal;
import java.text.NumberFormat;
import java.util.Locale;

public final class CurrencyUtil {

    private static final Locale LOCALE_ID = new Locale("id", "ID");

    private CurrencyUtil() {
        // Utility class
    }

    /**
     * Format a BigDecimal amount to IDR currency string.
     * Example: 25000 -> "Rp 25.000"
     */
    public static String formatIdr(BigDecimal amount) {
        if (amount == null) {
            return "Rp 0";
        }
        NumberFormat formatter = NumberFormat.getCurrencyInstance(LOCALE_ID);
        return formatter.format(amount).replace(",00", "");
    }

    /**
     * Format a long amount to IDR currency string.
     * Example: 25000 -> "Rp 25.000"
     */
    public static String formatIdr(long amount) {
        return formatIdr(BigDecimal.valueOf(amount));
    }

    /**
     * Parse an IDR formatted string to BigDecimal.
     */
    public static BigDecimal parseIdr(String idrString) {
        if (idrString == null || idrString.isBlank()) {
            return BigDecimal.ZERO;
        }
        String cleaned = idrString.replaceAll("[^\\d]", "");
        return new BigDecimal(cleaned);
    }
}
