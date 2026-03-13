/**
 * Lightweight holiday detection utility.
 *
 * Extracts the country code from the user's locale string and
 * returns a Set of 'YYYY-MM-DD' date strings for national holidays.
 * Currently supports US, GB, BR, and CA — extend the switch in
 * `getHolidays` to add more countries.
 */

/** Easter Sunday via the Anonymous Gregorian algorithm. */
function easter(year: number): Date {
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31) - 1;
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  return new Date(year, month, day);
}

function fmt(d: Date): string {
  const y = d.getFullYear();
  const mo = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${y}-${mo}-${dd}`;
}

function addDays(d: Date, n: number): Date {
  const r = new Date(d);
  r.setDate(r.getDate() + n);
  return r;
}

/** Nth occurrence of a weekday in a month (1-indexed). */
function nthWeekday(year: number, month: number, weekday: number, nth: number): Date {
  const first = new Date(year, month, 1);
  let offset = weekday - first.getDay();
  if (offset < 0) offset += 7;
  return new Date(year, month, 1 + offset + (nth - 1) * 7);
}

/** Last occurrence of a weekday in a month. */
function lastWeekday(year: number, month: number, weekday: number): Date {
  const last = new Date(year, month + 1, 0);
  let offset = last.getDay() - weekday;
  if (offset < 0) offset += 7;
  return new Date(year, month, last.getDate() - offset);
}

function usHolidays(year: number): Set<string> {
  const s = new Set<string>();
  s.add(`${year}-01-01`);
  s.add(fmt(nthWeekday(year, 0, 1, 3)));
  s.add(fmt(nthWeekday(year, 1, 1, 3)));
  s.add(fmt(lastWeekday(year, 4, 1)));
  s.add(`${year}-06-19`);
  s.add(`${year}-07-04`);
  s.add(fmt(nthWeekday(year, 8, 1, 1)));
  s.add(fmt(nthWeekday(year, 9, 1, 2)));
  s.add(`${year}-11-11`);
  s.add(fmt(nthWeekday(year, 10, 4, 4)));
  s.add(`${year}-12-25`);
  return s;
}

function gbHolidays(year: number): Set<string> {
  const s = new Set<string>();
  const e = easter(year);
  s.add(`${year}-01-01`);
  s.add(fmt(addDays(e, -2)));
  s.add(fmt(addDays(e, 1)));
  s.add(fmt(nthWeekday(year, 4, 1, 1)));
  s.add(fmt(lastWeekday(year, 4, 1)));
  s.add(fmt(lastWeekday(year, 7, 1)));
  s.add(`${year}-12-25`);
  s.add(`${year}-12-26`);
  return s;
}

function brHolidays(year: number): Set<string> {
  const s = new Set<string>();
  const e = easter(year);
  s.add(`${year}-01-01`);
  s.add(fmt(addDays(e, -48))); // Carnival Monday
  s.add(fmt(addDays(e, -47))); // Carnival Tuesday
  s.add(fmt(addDays(e, -2)));
  s.add(`${year}-04-21`);
  s.add(`${year}-05-01`);
  s.add(fmt(addDays(e, 60)));
  s.add(`${year}-09-07`);
  s.add(`${year}-10-12`);
  s.add(`${year}-11-02`);
  s.add(`${year}-11-15`);
  s.add(`${year}-12-25`);
  return s;
}

function caHolidays(year: number): Set<string> {
  const s = new Set<string>();
  const e = easter(year);
  s.add(`${year}-01-01`);
  s.add(fmt(addDays(e, -2)));
  s.add(`${year}-07-01`);
  s.add(fmt(nthWeekday(year, 8, 1, 1)));
  s.add(fmt(nthWeekday(year, 9, 1, 2)));
  s.add(`${year}-12-25`);
  s.add(`${year}-12-26`);
  return s;
}

/**
 * Returns a Set of holiday date strings for the given year based on
 * the user's locale (e.g. 'en-US', 'pt-BR', 'en-GB', 'en-CA').
 */
export function getHolidays(year: number, locale?: string): Set<string> {
  if (!locale) return new Set();

  const parts = locale.split(/[-_]/);
  const country = (parts.length > 1 ? parts[parts.length - 1] : '').toUpperCase();

  switch (country) {
    case 'US':
      return usHolidays(year);
    case 'GB':
    case 'UK':
      return gbHolidays(year);
    case 'BR':
      return brHolidays(year);
    case 'CA':
      return caHolidays(year);
    default:
      return new Set();
  }
}
