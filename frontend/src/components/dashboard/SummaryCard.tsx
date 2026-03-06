'use client';

import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

interface SummaryCardProps {
  totalEntries: number;
  routineCount: number;
  productivityCount: number;
  avgMood: number | null;
  avgSleep: number | null;
}

/**
 * Right-sidebar summary card with a donut chart.
 *
 * Mirrors the "Total tests (N)" card from the reference design:
 * a compact donut chart with a color-coded legend, plus quick
 * numerical highlights for mood and sleep.
 */
export default function SummaryCard({
  totalEntries,
  routineCount,
  productivityCount,
  avgMood,
  avgSleep,
}: SummaryCardProps) {
  const data = [
    { name: 'Routines', value: routineCount, color: '#42d4c8' },
    { name: 'Productivity', value: productivityCount, color: '#5ab4ca' },
  ].filter((d) => d.value > 0);

  if (data.length === 0) {
    data.push({ name: 'No data', value: 1, color: '#d0d5db' });
  }

  return (
    <div className="rounded-2xl bg-white/65 p-5 backdrop-blur-md">
      <h3 className="text-lg font-bold text-slate-800">
        Total entries <span className="font-normal text-slate-400">({totalEntries})</span>
      </h3>

      <div className="mt-4 flex items-center gap-4">
        {/* Legend */}
        <div className="flex-1 space-y-2.5">
          {data.map((d) => (
            <div key={d.name} className="flex items-center gap-2">
              <span
                className="h-4 w-1 rounded-full"
                style={{ backgroundColor: d.color }}
                aria-hidden="true"
              />
              <span className="text-sm text-slate-600">{d.name}</span>
              <span className="ml-auto text-sm font-semibold text-slate-700">{d.value}</span>
            </div>
          ))}
        </div>

        {/* Donut */}
        <div className="h-28 w-28 shrink-0" aria-hidden="true">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={30}
                outerRadius={50}
                paddingAngle={3}
                dataKey="value"
                stroke="none"
              >
                {data.map((entry, i) => (
                  <Cell key={`cell-${i}`} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Quick highlights */}
      {(avgMood !== null || avgSleep !== null) && (
        <div className="mt-4 flex gap-4 border-t border-slate-200/30 pt-4">
          {avgMood !== null && (
            <div className="flex-1 text-center">
              <p className="text-2xl font-bold text-slate-800">{avgMood.toFixed(1)}</p>
              <p className="text-xs text-slate-500">Avg Mood</p>
            </div>
          )}
          {avgSleep !== null && (
            <div className="flex-1 text-center">
              <p className="text-2xl font-bold text-slate-800">{avgSleep.toFixed(1)}</p>
              <p className="text-xs text-slate-500">Avg Sleep (hrs)</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
