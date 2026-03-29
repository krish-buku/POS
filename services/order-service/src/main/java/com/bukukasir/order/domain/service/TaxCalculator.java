package com.bukukasir.order.domain.service;

import com.bukukasir.order.domain.model.TaxCalculation;
import com.bukukasir.order.domain.model.TaxConfig;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

@Component
public class TaxCalculator {

    /**
     * Calculates taxes for a given subtotal after discount.
     * Exclusive: tax = subtotal * rate (added on top)
     * Inclusive: tax = price - (price / (1 + rate)) (already included in price)
     *
     * @param subtotalAfterDiscount the amount to calculate taxes on
     * @param activeTaxes           list of active tax configurations, sorted by priority
     * @return list of tax calculations
     */
    public List<TaxCalculation> calculateTaxes(
            BigDecimal subtotalAfterDiscount,
            List<TaxConfig> activeTaxes
    ) {
        List<TaxCalculation> results = new ArrayList<>();

        // Sort by priority
        List<TaxConfig> sorted = activeTaxes.stream()
                .sorted(Comparator.comparingInt(TaxConfig::getPriority))
                .toList();

        for (TaxConfig tax : sorted) {
            BigDecimal taxAmount;
            if (tax.isInclusive()) {
                // Back-calculate: tax is already in the price
                taxAmount = subtotalAfterDiscount.subtract(
                        subtotalAfterDiscount.divide(
                                BigDecimal.ONE.add(tax.getRate()),
                                2, RoundingMode.HALF_UP
                        )
                );
            } else {
                // Forward-calculate: add tax on top
                taxAmount = subtotalAfterDiscount.multiply(tax.getRate())
                        .setScale(0, RoundingMode.HALF_UP); // Round to whole IDR
            }
            results.add(TaxCalculation.builder()
                    .taxConfigId(tax.getId())
                    .taxName(tax.getName())
                    .rate(tax.getRate())
                    .inclusive(tax.isInclusive())
                    .taxableAmount(subtotalAfterDiscount)
                    .taxAmount(taxAmount)
                    .build());
        }
        return results;
    }
}
