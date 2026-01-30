/**
 * Tests for utility functions.
 */

import {
  cn,
  formatDate,
  formatTime,
  calculatePercentage,
  getProductivityColor,
  getProductivityBgColor,
} from '@/lib/utils';

describe('cn (className utility)', () => {
  it('merges class names', () => {
    const result = cn('foo', 'bar');
    expect(result).toBe('foo bar');
  });

  it('handles conditional classes', () => {
    const result = cn('base', true && 'included', false && 'excluded');
    expect(result).toContain('base');
    expect(result).toContain('included');
    expect(result).not.toContain('excluded');
  });

  it('merges Tailwind classes correctly', () => {
    const result = cn('px-2 py-1', 'px-4');
    expect(result).toBe('py-1 px-4');
  });

  it('handles arrays of classes', () => {
    const result = cn(['foo', 'bar'], 'baz');
    expect(result).toBe('foo bar baz');
  });

  it('handles undefined and null', () => {
    const result = cn('foo', undefined, null, 'bar');
    expect(result).toBe('foo bar');
  });
});

describe('formatDate', () => {
  it('formats date string correctly', () => {
    const result = formatDate('2024-01-15');
    expect(result).toMatch(/Jan 15, 2024/);
  });

  it('formats Date object correctly', () => {
    const result = formatDate(new Date('2024-06-20'));
    expect(result).toMatch(/Jun 20, 2024/);
  });

  it('handles different months', () => {
    expect(formatDate('2024-03-01')).toMatch(/Mar/);
    expect(formatDate('2024-12-25')).toMatch(/Dec/);
  });
});

describe('formatTime', () => {
  it('formats morning time correctly', () => {
    const result = formatTime('06:30');
    expect(result).toBe('6:30 AM');
  });

  it('formats afternoon time correctly', () => {
    const result = formatTime('14:45');
    expect(result).toBe('2:45 PM');
  });

  it('formats noon correctly', () => {
    const result = formatTime('12:00');
    expect(result).toBe('12:00 PM');
  });

  it('formats midnight correctly', () => {
    const result = formatTime('00:00');
    expect(result).toBe('12:00 AM');
  });

  it('pads minutes correctly', () => {
    const result = formatTime('09:05');
    expect(result).toBe('9:05 AM');
  });
});

describe('calculatePercentage', () => {
  it('calculates percentage correctly', () => {
    expect(calculatePercentage(5, 10)).toBe(50);
    expect(calculatePercentage(3, 4)).toBe(75);
    expect(calculatePercentage(1, 3)).toBe(33);
  });

  it('handles zero total', () => {
    expect(calculatePercentage(5, 0)).toBe(0);
  });

  it('handles zero value', () => {
    expect(calculatePercentage(0, 10)).toBe(0);
  });

  it('rounds to nearest integer', () => {
    expect(calculatePercentage(1, 3)).toBe(33);
    expect(calculatePercentage(2, 3)).toBe(67);
  });

  it('handles 100%', () => {
    expect(calculatePercentage(10, 10)).toBe(100);
  });
});

describe('getProductivityColor', () => {
  it('returns green for high scores (8-10)', () => {
    expect(getProductivityColor(8)).toBe('text-green-600');
    expect(getProductivityColor(9)).toBe('text-green-600');
    expect(getProductivityColor(10)).toBe('text-green-600');
  });

  it('returns yellow for medium-high scores (6-7)', () => {
    expect(getProductivityColor(6)).toBe('text-yellow-600');
    expect(getProductivityColor(7)).toBe('text-yellow-600');
  });

  it('returns orange for medium-low scores (4-5)', () => {
    expect(getProductivityColor(4)).toBe('text-orange-600');
    expect(getProductivityColor(5)).toBe('text-orange-600');
  });

  it('returns red for low scores (1-3)', () => {
    expect(getProductivityColor(1)).toBe('text-red-600');
    expect(getProductivityColor(2)).toBe('text-red-600');
    expect(getProductivityColor(3)).toBe('text-red-600');
  });
});

describe('getProductivityBgColor', () => {
  it('returns green bg for high scores', () => {
    expect(getProductivityBgColor(8)).toBe('bg-green-100');
    expect(getProductivityBgColor(10)).toBe('bg-green-100');
  });

  it('returns yellow bg for medium-high scores', () => {
    expect(getProductivityBgColor(6)).toBe('bg-yellow-100');
    expect(getProductivityBgColor(7)).toBe('bg-yellow-100');
  });

  it('returns orange bg for medium-low scores', () => {
    expect(getProductivityBgColor(4)).toBe('bg-orange-100');
    expect(getProductivityBgColor(5)).toBe('bg-orange-100');
  });

  it('returns red bg for low scores', () => {
    expect(getProductivityBgColor(1)).toBe('bg-red-100');
    expect(getProductivityBgColor(3)).toBe('bg-red-100');
  });
});
