package com.uyirgene.course.payment;

import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class PaymentCurrencyTest {

    @Test
    void standardCurrenciesUseTwoDecimals() {
        assertThat(PaymentCurrency.toSmallestUnit(899.0, "INR")).isEqualTo(89900L);
        assertThat(PaymentCurrency.toSmallestUnit(79.0, "USD")).isEqualTo(7900L);
        assertThat(PaymentCurrency.toSmallestUnit(19.99, "eur")).isEqualTo(1999L);
    }

    @Test
    void threeDecimalCurrenciesUseThousand() {
        assertThat(PaymentCurrency.toSmallestUnit(5.0, "KWD")).isEqualTo(5000L);
        assertThat(PaymentCurrency.toSmallestUnit(12.345, "BHD")).isEqualTo(12345L);
        assertThat(PaymentCurrency.toSmallestUnit(3.0, "omr")).isEqualTo(3000L);
        assertThat(PaymentCurrency.toSmallestUnit(7.0, "JOD")).isEqualTo(7000L);
    }

    @Test
    void zeroDecimalCurrenciesUseOne() {
        assertThat(PaymentCurrency.toSmallestUnit(12000.0, "JPY")).isEqualTo(12000L);
        assertThat(PaymentCurrency.toSmallestUnit(95000.0, "KRW")).isEqualTo(95000L);
        assertThat(PaymentCurrency.toSmallestUnit(1500000.0, "VND")).isEqualTo(1500000L);
        assertThat(PaymentCurrency.toSmallestUnit(1200000.0, "IDR")).isEqualTo(1200000L);
    }

    @Test
    void rejectedCurrenciesAreNotSupported() {
        for (String c : new String[] {"AFN", "ARS", "BGN", "BYN", "GEL", "IRR", "LBP", "PAB", "ZWL", "irr"}) {
            assertThat(PaymentCurrency.isSupported(c)).as(c).isFalse();
        }
    }

    @Test
    void otherCurrenciesAreSupported() {
        for (String c : new String[] {"INR", "USD", "EUR", "KWD", "AED", "BDT", "LKR", "MYR"}) {
            assertThat(PaymentCurrency.isSupported(c)).as(c).isTrue();
        }
        assertThat(PaymentCurrency.isSupported(null)).isFalse();
    }

    @Test
    void unsupportedCountriesFallBackToUs() {
        for (String cc : new String[] {"IR", "ir", "AF", "AR", "BY", "BG", "GE", "LB", "PA", "ZW", " IR "}) {
            assertThat(PaymentCurrency.normalizeCountry(cc)).as(cc).isEqualTo("US");
        }
    }

    @Test
    void otherPseudoCountryIsPricedAsUs() {
        assertThat(PaymentCurrency.normalizeCountry("OTHER")).isEqualTo("US");
        assertThat(PaymentCurrency.normalizeCountry("other")).isEqualTo("US");
    }

    @Test
    void otherCountriesAreUnchanged() {
        assertThat(PaymentCurrency.normalizeCountry("IN")).isEqualTo("IN");
        assertThat(PaymentCurrency.normalizeCountry("KW")).isEqualTo("KW");
        assertThat(PaymentCurrency.normalizeCountry(null)).isNull();
        assertThat(PaymentCurrency.normalizeCountry("")).isEmpty();
    }
}
