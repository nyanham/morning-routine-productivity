/**
 * Tests for deriveInsights — the scoring / mapping logic behind InsightsCard.
 */

import { deriveInsights } from '@/components/dashboard';
import type { AnalyticsSummary } from '@/types';

/** Helper: a full summary with sensible defaults that tests can override. */
function makeSummary(overrides: Partial<AnalyticsSummary> = {}): AnalyticsSummary {
  return {
    avg_productivity: 7,
    avg_sleep: 7.5,
    avg_exercise: 20,
    total_entries: 10,
    best_day: '2026-03-01',
    worst_day: '2026-03-05',
    productivity_trend: 'stable',
    ...overrides,
  };
}

describe('deriveInsights', () => {
  // ── Null / empty input ──

  it('returns an empty array when summary is null', () => {
    expect(deriveInsights(null)).toEqual([]);
  });

  it('returns an empty array when all nullable fields are null', () => {
    const result = deriveInsights(
      makeSummary({
        avg_productivity: null,
        avg_sleep: null,
        avg_exercise: null,
        productivity_trend: null,
      })
    );
    expect(result).toEqual([]);
  });

  // ── Productivity insight ──

  describe('productivity insight', () => {
    it('computes percentage as (value / 10) * 100', () => {
      const [insight] = deriveInsights(
        makeSummary({
          avg_productivity: 8,
          avg_sleep: null,
          avg_exercise: null,
          productivity_trend: null,
        })
      );
      expect(insight.label).toBe('Productivity');
      expect(insight.score).toBe(80);
      expect(insight.detail).toContain('8.0/10');
    });

    it('uses emerald color when score >= 70%', () => {
      const [insight] = deriveInsights(
        makeSummary({
          avg_productivity: 7,
          avg_sleep: null,
          avg_exercise: null,
          productivity_trend: null,
        })
      );
      expect(insight.score).toBe(70);
      expect(insight.color).toBe('stroke-emerald-500');
    });

    it('uses amber color when score is between 40% and 69%', () => {
      const [insight] = deriveInsights(
        makeSummary({
          avg_productivity: 5,
          avg_sleep: null,
          avg_exercise: null,
          productivity_trend: null,
        })
      );
      expect(insight.score).toBe(50);
      expect(insight.color).toBe('stroke-amber-500');
    });

    it('uses red color when score < 40%', () => {
      const [insight] = deriveInsights(
        makeSummary({
          avg_productivity: 3,
          avg_sleep: null,
          avg_exercise: null,
          productivity_trend: null,
        })
      );
      expect(insight.score).toBe(30);
      expect(insight.color).toBe('stroke-red-500');
    });

    it('handles zero productivity', () => {
      const [insight] = deriveInsights(
        makeSummary({
          avg_productivity: 0,
          avg_sleep: null,
          avg_exercise: null,
          productivity_trend: null,
        })
      );
      expect(insight.score).toBe(0);
      expect(insight.color).toBe('stroke-red-500');
    });

    it('handles max productivity (10)', () => {
      const [insight] = deriveInsights(
        makeSummary({
          avg_productivity: 10,
          avg_sleep: null,
          avg_exercise: null,
          productivity_trend: null,
        })
      );
      expect(insight.score).toBe(100);
      expect(insight.color).toBe('stroke-emerald-500');
    });

    it('is omitted when avg_productivity is null', () => {
      const result = deriveInsights(
        makeSummary({
          avg_productivity: null,
          avg_sleep: null,
          avg_exercise: null,
          productivity_trend: null,
        })
      );
      expect(result.find((i) => i.label === 'Productivity')).toBeUndefined();
    });
  });

  // ── Sleep insight ──

  describe('sleep insight', () => {
    it('maps 4–9 hr range to 0–100%', () => {
      const [insight] = deriveInsights(
        makeSummary({
          avg_productivity: null,
          avg_sleep: 6.5,
          avg_exercise: null,
          productivity_trend: null,
        })
      );
      expect(insight.label).toBe('Sleep quality');
      expect(insight.score).toBe(50); // (6.5-4)/5 * 100 = 50
    });

    it('clamps to 0% when sleep <= 4 hrs', () => {
      const [insight] = deriveInsights(
        makeSummary({
          avg_productivity: null,
          avg_sleep: 3,
          avg_exercise: null,
          productivity_trend: null,
        })
      );
      expect(insight.score).toBe(0);
    });

    it('clamps to 100% when sleep >= 9 hrs', () => {
      const [insight] = deriveInsights(
        makeSummary({
          avg_productivity: null,
          avg_sleep: 10,
          avg_exercise: null,
          productivity_trend: null,
        })
      );
      expect(insight.score).toBe(100);
    });

    it('uses emerald when avg_sleep >= 7', () => {
      const [insight] = deriveInsights(
        makeSummary({
          avg_productivity: null,
          avg_sleep: 7,
          avg_exercise: null,
          productivity_trend: null,
        })
      );
      expect(insight.color).toBe('stroke-emerald-500');
    });

    it('uses amber when avg_sleep >= 6 but < 7', () => {
      const [insight] = deriveInsights(
        makeSummary({
          avg_productivity: null,
          avg_sleep: 6.5,
          avg_exercise: null,
          productivity_trend: null,
        })
      );
      expect(insight.color).toBe('stroke-amber-500');
    });

    it('uses red when avg_sleep < 6', () => {
      const [insight] = deriveInsights(
        makeSummary({
          avg_productivity: null,
          avg_sleep: 5,
          avg_exercise: null,
          productivity_trend: null,
        })
      );
      expect(insight.color).toBe('stroke-red-500');
    });

    it('boundary: exactly 4 hrs yields 0%', () => {
      const [insight] = deriveInsights(
        makeSummary({
          avg_productivity: null,
          avg_sleep: 4,
          avg_exercise: null,
          productivity_trend: null,
        })
      );
      expect(insight.score).toBe(0);
    });

    it('boundary: exactly 9 hrs yields 100%', () => {
      const [insight] = deriveInsights(
        makeSummary({
          avg_productivity: null,
          avg_sleep: 9,
          avg_exercise: null,
          productivity_trend: null,
        })
      );
      expect(insight.score).toBe(100);
    });
  });

  // ── Exercise insight ──

  describe('exercise insight', () => {
    it('maps 0–30 min to 0–100%', () => {
      const [insight] = deriveInsights(
        makeSummary({
          avg_productivity: null,
          avg_sleep: null,
          avg_exercise: 15,
          productivity_trend: null,
        })
      );
      expect(insight.label).toBe('Exercise habit');
      expect(insight.score).toBe(50);
    });

    it('clamps at 100% when exercise exceeds 30 min', () => {
      const [insight] = deriveInsights(
        makeSummary({
          avg_productivity: null,
          avg_sleep: null,
          avg_exercise: 60,
          productivity_trend: null,
        })
      );
      expect(insight.score).toBe(100);
    });

    it('handles 0 min of exercise', () => {
      const [insight] = deriveInsights(
        makeSummary({
          avg_productivity: null,
          avg_sleep: null,
          avg_exercise: 0,
          productivity_trend: null,
        })
      );
      expect(insight.score).toBe(0);
      expect(insight.color).toBe('stroke-red-500');
    });

    it('uses emerald color when score >= 70%', () => {
      const [insight] = deriveInsights(
        makeSummary({
          avg_productivity: null,
          avg_sleep: null,
          avg_exercise: 25,
          productivity_trend: null,
        })
      );
      expect(insight.score).toBe(83);
      expect(insight.color).toBe('stroke-emerald-500');
    });

    it('uses amber color when score between 40–69%', () => {
      const [insight] = deriveInsights(
        makeSummary({
          avg_productivity: null,
          avg_sleep: null,
          avg_exercise: 15,
          productivity_trend: null,
        })
      );
      expect(insight.score).toBe(50);
      expect(insight.color).toBe('stroke-amber-500');
    });

    it('uses red color when score < 40%', () => {
      const [insight] = deriveInsights(
        makeSummary({
          avg_productivity: null,
          avg_sleep: null,
          avg_exercise: 5,
          productivity_trend: null,
        })
      );
      expect(insight.score).toBe(17);
      expect(insight.color).toBe('stroke-red-500');
    });
  });

  // ── Trend momentum insight ──

  describe('trend momentum insight', () => {
    it('maps "up" to score 85 and emerald', () => {
      const [insight] = deriveInsights(
        makeSummary({
          avg_productivity: null,
          avg_sleep: null,
          avg_exercise: null,
          productivity_trend: 'up',
        })
      );
      expect(insight.label).toBe('Trend momentum');
      expect(insight.score).toBe(85);
      expect(insight.color).toBe('stroke-emerald-500');
      expect(insight.detail).toBe('Improving this week');
    });

    it('maps "stable" to score 60 and sky', () => {
      const [insight] = deriveInsights(
        makeSummary({
          avg_productivity: null,
          avg_sleep: null,
          avg_exercise: null,
          productivity_trend: 'stable',
        })
      );
      expect(insight.score).toBe(60);
      expect(insight.color).toBe('stroke-sky-500');
      expect(insight.detail).toBe('Holding steady');
    });

    it('maps "down" to score 30 and red', () => {
      const [insight] = deriveInsights(
        makeSummary({
          avg_productivity: null,
          avg_sleep: null,
          avg_exercise: null,
          productivity_trend: 'down',
        })
      );
      expect(insight.score).toBe(30);
      expect(insight.color).toBe('stroke-red-500');
      expect(insight.detail).toBe('Declining — take it easy');
    });

    it('is omitted when productivity_trend is null', () => {
      const result = deriveInsights(
        makeSummary({
          avg_productivity: null,
          avg_sleep: null,
          avg_exercise: null,
          productivity_trend: null,
        })
      );
      expect(result.find((i) => i.label === 'Trend momentum')).toBeUndefined();
    });
  });

  // ── Full summary produces all four insights ──

  it('returns all four insights when every field is present', () => {
    const result = deriveInsights(makeSummary());
    expect(result).toHaveLength(4);

    const labels = result.map((i) => i.label);
    expect(labels).toEqual(['Productivity', 'Sleep quality', 'Exercise habit', 'Trend momentum']);
  });

  // ── Order is stable: productivity → sleep → exercise → trend ──

  it('returns insights in a stable order regardless of values', () => {
    const result = deriveInsights(
      makeSummary({
        avg_productivity: 1,
        avg_sleep: 4,
        avg_exercise: 0,
        productivity_trend: 'down',
      })
    );
    expect(result.map((i) => i.label)).toEqual([
      'Productivity',
      'Sleep quality',
      'Exercise habit',
      'Trend momentum',
    ]);
  });
});
