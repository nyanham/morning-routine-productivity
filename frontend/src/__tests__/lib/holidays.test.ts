/**
 * Tests for the holiday detection utility.
 *
 * Covers locale parsing, fixed-date holidays, and Easter-derived
 * movable holidays for each supported country (US, GB, BR, CA).
 */

import { getHolidays } from '@/lib/holidays';

describe('getHolidays', () => {
  describe('locale parsing', () => {
    it('returns empty set when locale is undefined', () => {
      expect(getHolidays(2026)).toEqual(new Set());
    });

    it('returns empty set for unsupported locale', () => {
      expect(getHolidays(2026, 'ja-JP')).toEqual(new Set());
    });

    it('handles hyphenated locale (en-US)', () => {
      const holidays = getHolidays(2026, 'en-US');
      expect(holidays.size).toBeGreaterThan(0);
    });

    it('handles underscore locale (pt_BR)', () => {
      const holidays = getHolidays(2026, 'pt_BR');
      expect(holidays.size).toBeGreaterThan(0);
    });

    it('is case-insensitive for country code', () => {
      const upper = getHolidays(2026, 'en-US');
      const lower = getHolidays(2026, 'en-us');
      // Both should resolve  EUS holidays are identified by uppercase conversion
      expect(upper).toEqual(lower);
    });

    it('supports UK as alias for GB', () => {
      const uk = getHolidays(2026, 'en-UK');
      const gb = getHolidays(2026, 'en-GB');
      expect(uk).toEqual(gb);
    });
  });

  describe('US holidays (2026)', () => {
    const holidays = getHolidays(2026, 'en-US');

    it("includes New Year's Day (Jan 1)", () => {
      expect(holidays.has('2026-01-01')).toBe(true);
    });

    it('includes MLK Day (3rd Monday of January)', () => {
      // 2026-01-19 is the 3rd Monday of January
      expect(holidays.has('2026-01-19')).toBe(true);
    });

    it("includes Presidents' Day (3rd Monday of February)", () => {
      // 2026-02-16 is the 3rd Monday of February
      expect(holidays.has('2026-02-16')).toBe(true);
    });

    it('includes Memorial Day (last Monday of May)', () => {
      // 2026-05-25 is the last Monday of May
      expect(holidays.has('2026-05-25')).toBe(true);
    });

    it('includes Juneteenth (Jun 19)', () => {
      expect(holidays.has('2026-06-19')).toBe(true);
    });

    it('includes Independence Day (Jul 4)', () => {
      expect(holidays.has('2026-07-04')).toBe(true);
    });

    it('includes Labor Day (1st Monday of September)', () => {
      // 2026-09-07 is the 1st Monday of September
      expect(holidays.has('2026-09-07')).toBe(true);
    });

    it('includes Columbus Day (2nd Monday of October)', () => {
      // 2026-10-12 is the 2nd Monday of October
      expect(holidays.has('2026-10-12')).toBe(true);
    });

    it('includes Veterans Day (Nov 11)', () => {
      expect(holidays.has('2026-11-11')).toBe(true);
    });

    it('includes Thanksgiving (4th Thursday of November)', () => {
      // 2026-11-26 is the 4th Thursday of November
      expect(holidays.has('2026-11-26')).toBe(true);
    });

    it('includes Christmas Day (Dec 25)', () => {
      expect(holidays.has('2026-12-25')).toBe(true);
    });

    it('returns exactly 11 holidays', () => {
      expect(holidays.size).toBe(11);
    });
  });

  describe('GB holidays (2026)', () => {
    const holidays = getHolidays(2026, 'en-GB');

    it("includes New Year's Day", () => {
      expect(holidays.has('2026-01-01')).toBe(true);
    });

    it('includes Good Friday (Easter - 2 days)', () => {
      // Easter 2026 is April 5, Good Friday is April 3
      expect(holidays.has('2026-04-03')).toBe(true);
    });

    it('includes Easter Monday', () => {
      // Easter Monday 2026 is April 6
      expect(holidays.has('2026-04-06')).toBe(true);
    });

    it('includes Early May bank holiday (1st Monday of May)', () => {
      // 2026-05-04 is the 1st Monday of May
      expect(holidays.has('2026-05-04')).toBe(true);
    });

    it('includes Spring bank holiday (last Monday of May)', () => {
      // 2026-05-25 is the last Monday of May
      expect(holidays.has('2026-05-25')).toBe(true);
    });

    it('includes Summer bank holiday (last Monday of August)', () => {
      // 2026-08-31 is the last Monday of August
      expect(holidays.has('2026-08-31')).toBe(true);
    });

    it('includes Christmas Day', () => {
      expect(holidays.has('2026-12-25')).toBe(true);
    });

    it('includes Boxing Day', () => {
      expect(holidays.has('2026-12-26')).toBe(true);
    });

    it('returns exactly 8 holidays', () => {
      expect(holidays.size).toBe(8);
    });
  });

  describe('BR holidays (2026)', () => {
    const holidays = getHolidays(2026, 'pt-BR');

    it("includes New Year's Day", () => {
      expect(holidays.has('2026-01-01')).toBe(true);
    });

    it('includes Carnival (Easter - 47 and - 46 days)', () => {
      // Easter 2026 is April 5
      // Carnival Monday: Feb 16, Carnival Tuesday: Feb 17
      expect(holidays.has('2026-02-17')).toBe(true);
      expect(holidays.has('2026-02-18')).toBe(true);
    });

    it('includes Good Friday', () => {
      expect(holidays.has('2026-04-03')).toBe(true);
    });

    it('includes Tiradentes Day (Apr 21)', () => {
      expect(holidays.has('2026-04-21')).toBe(true);
    });

    it('includes Labour Day (May 1)', () => {
      expect(holidays.has('2026-05-01')).toBe(true);
    });

    it('includes Corpus Christi (Easter + 60)', () => {
      // Easter 2026 April 5 + 60 = June 4
      expect(holidays.has('2026-06-04')).toBe(true);
    });

    it('includes Independence Day (Sep 7)', () => {
      expect(holidays.has('2026-09-07')).toBe(true);
    });

    it('includes Our Lady of Aparecida (Oct 12)', () => {
      expect(holidays.has('2026-10-12')).toBe(true);
    });

    it("includes All Souls' Day (Nov 2)", () => {
      expect(holidays.has('2026-11-02')).toBe(true);
    });

    it('includes Republic Day (Nov 15)', () => {
      expect(holidays.has('2026-11-15')).toBe(true);
    });

    it('includes Christmas Day', () => {
      expect(holidays.has('2026-12-25')).toBe(true);
    });

    it('returns exactly 12 holidays', () => {
      expect(holidays.size).toBe(12);
    });
  });

  describe('CA holidays (2026)', () => {
    const holidays = getHolidays(2026, 'en-CA');

    it("includes New Year's Day", () => {
      expect(holidays.has('2026-01-01')).toBe(true);
    });

    it('includes Good Friday (Easter - 2)', () => {
      expect(holidays.has('2026-04-03')).toBe(true);
    });

    it('includes Canada Day (Jul 1)', () => {
      expect(holidays.has('2026-07-01')).toBe(true);
    });

    it('includes Labour Day (1st Monday of September)', () => {
      expect(holidays.has('2026-09-07')).toBe(true);
    });

    it('includes Thanksgiving (2nd Monday of October)', () => {
      expect(holidays.has('2026-10-12')).toBe(true);
    });

    it('includes Christmas Day', () => {
      expect(holidays.has('2026-12-25')).toBe(true);
    });

    it('includes Boxing Day', () => {
      expect(holidays.has('2026-12-26')).toBe(true);
    });

    it('returns exactly 7 holidays', () => {
      expect(holidays.size).toBe(7);
    });
  });

  describe('Easter-derived holidays across years', () => {
    it('computes correct Easter for 2024 (March 31)', () => {
      const gb = getHolidays(2024, 'en-GB');
      // Good Friday 2024 = March 29
      expect(gb.has('2024-03-29')).toBe(true);
      // Easter Monday 2024 = April 1
      expect(gb.has('2024-04-01')).toBe(true);
    });

    it('computes correct Easter for 2025 (April 20)', () => {
      const gb = getHolidays(2025, 'en-GB');
      // Good Friday 2025 = April 18
      expect(gb.has('2025-04-18')).toBe(true);
      // Easter Monday 2025 = April 21
      expect(gb.has('2025-04-21')).toBe(true);
    });

    it('computes correct Easter for 2030 (April 21)', () => {
      const br = getHolidays(2030, 'pt-BR');
      // Good Friday 2030 = April 19
      expect(br.has('2030-04-19')).toBe(true);
    });
  });
});
