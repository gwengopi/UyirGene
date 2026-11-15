import { describe, it, expect } from 'vitest';
import {
  buildCountryOptions,
  fromSmallestUnit,
  toPricingCountry,
  formatCurrency,
} from '../../utils/formatters';
import { PAYMENT_UNSUPPORTED_COUNTRY_CODES } from '../../utils/constants';

describe('toPricingCountry', () => {
  it('prices "Other countries" as the US (USD) price', () => {
    expect(toPricingCountry('OTHER')).toBe('US');
  });

  it('leaves every real country code unchanged', () => {
    for (const code of ['IN', 'US', 'KW', 'TH', 'IR', 'GB']) {
      expect(toPricingCountry(code)).toBe(code);
    }
    expect(toPricingCountry(undefined)).toBeUndefined();
  });
});

describe('buildCountryOptions', () => {
  it('never offers the countries whose currency Razorpay rejects', () => {
    const codes = buildCountryOptions().map((c) => c.code);
    for (const rejected of PAYMENT_UNSUPPORTED_COUNTRY_CODES) {
      expect(codes).not.toContain(rejected);
    }
  });

  it('ends with "Other countries" priced in USD', () => {
    const options = buildCountryOptions();
    expect(options[options.length - 1]).toMatchObject({ code: 'OTHER', currency: 'USD' });
  });

  it('with prices, keeps India plus countries that have a price', () => {
    const codes = buildCountryOptions([{ countryCode: 'US' }, { countryCode: 'KW' }]).map((c) => c.code);
    expect(codes).toEqual(['IN', 'KW', 'US', 'OTHER']);
  });

  it('without prices, offers every supported country', () => {
    const codes = buildCountryOptions([]).map((c) => c.code);
    expect(codes).toContain('IN');
    expect(codes).toContain('TH');
    expect(codes.length).toBeGreaterThan(90);
  });
});

describe('fromSmallestUnit mirrors the backend conversion', () => {
  it('uses 100 for standard currencies', () => {
    expect(fromSmallestUnit(15000, 'USD')).toBe(150);
    expect(fromSmallestUnit(89900, 'INR')).toBe(899);
    expect(fromSmallestUnit(490003, 'thb')).toBe(4900.03);
  });

  it('uses 1000 for 3-decimal currencies', () => {
    expect(fromSmallestUnit(46289, 'KWD')).toBe(46.289);
    expect(fromSmallestUnit(5000, 'BHD')).toBe(5);
  });

  it('uses 1 for zero-decimal currencies', () => {
    expect(fromSmallestUnit(11800, 'JPY')).toBe(11800);
    expect(fromSmallestUnit(95000, 'KRW')).toBe(95000);
  });
});

describe('formatCurrency for 3-decimal currencies', () => {
  it('does not round KWD to 2 decimals', () => {
    // KWD is formatted with the ar-KW locale, which uses Arabic-Indic digits and a "٫" decimal mark
    const latin = formatCurrency(46.289, 'KWD')
      .replace(/[٠-٩]/g, (d) => String(d.charCodeAt(0) - 0x0660))
      .replace('٫', '.');
    expect(latin).toContain('46.289');
  });

  it('still shows 2 decimals at most for standard currencies', () => {
    expect(formatCurrency(150, 'USD')).toBe('$150');
    expect(formatCurrency(19.999, 'USD')).toBe('$20');
  });

  it('still says Free for zero or missing amounts', () => {
    expect(formatCurrency(0, 'USD')).toBe('Free');
    expect(formatCurrency(null, 'INR')).toBe('Free');
  });
});
