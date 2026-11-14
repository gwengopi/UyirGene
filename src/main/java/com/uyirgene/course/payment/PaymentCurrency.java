package com.uyirgene.course.payment;

import java.util.Locale;
import java.util.Set;

/**
 * Single source of truth for currency handling when creating Razorpay orders.
 *
 * <ul>
 *   <li>{@link #toSmallestUnit} converts a price to the smallest currency unit Razorpay expects.</li>
 *   <li>{@link #isSupported} / {@link #normalizeCountry} keep out currencies Razorpay rejects.</li>
 * </ul>
 */
public final class PaymentCurrency {

    /**
     * Currencies Razorpay rejected on our merchant account with BAD_REQUEST_INVALID_CURRENCY.
     * Verified by creating a test order per currency on 2026-11-14 (91 currencies tested, these 9 failed).
     * Re-run that test before changing this list.
     */
    private static final Set<String> UNSUPPORTED_CURRENCIES =
            Set.of("AFN", "ARS", "BGN", "BYN", "GEL", "IRR", "LBP", "PAB", "ZWL");

    /** Countries whose price currency is in {@link #UNSUPPORTED_CURRENCIES}. */
    private static final Set<String> UNSUPPORTED_COUNTRIES =
            Set.of("AF", "AR", "BG", "BY", "GE", "IR", "LB", "PA", "ZW");

    /** Countries in {@link #UNSUPPORTED_COUNTRIES} are priced as this country (USD). */
    public static final String FALLBACK_COUNTRY = "US";

    /** Pseudo-country sent by the frontend's "Other countries" option; priced as {@link #FALLBACK_COUNTRY}. */
    public static final String OTHER_COUNTRY = "OTHER";

    private PaymentCurrency() {}

    /**
     * Converts a price to the smallest currency unit (paise, cents, fils...).
     * 3-decimal currencies use 1000, zero-decimal currencies use 1, all others use 100.
     */
    public static long toSmallestUnit(double amount, String currency) {
        return switch (currency.toUpperCase(Locale.ROOT)) {
            case "KWD", "BHD", "OMR", "JOD" -> Math.round(amount * 1000);
            case "JPY", "KRW", "VND", "IDR" -> Math.round(amount);
            default -> Math.round(amount * 100);
        };
    }

    /** True unless Razorpay is known to reject this currency on our account. */
    public static boolean isSupported(String currency) {
        return currency != null && !UNSUPPORTED_CURRENCIES.contains(currency.toUpperCase(Locale.ROOT));
    }

    /**
     * Maps a country whose currency Razorpay rejects, or the "OTHER" pseudo-country, to
     * {@link #FALLBACK_COUNTRY}, so the customer is priced in USD. Other values (including null/blank) are returned unchanged.
     */
    public static String normalizeCountry(String countryCode) {
        if (countryCode != null) {
            String cc = countryCode.trim().toUpperCase(Locale.ROOT);
            if (UNSUPPORTED_COUNTRIES.contains(cc) || OTHER_COUNTRY.equals(cc)) {
                return FALLBACK_COUNTRY;
            }
        }
        return countryCode;
    }
}
