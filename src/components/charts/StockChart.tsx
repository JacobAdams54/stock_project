// src/components/charts/StockChart.tsx
import * as React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';

export type Range = '1W' | '1M' | '3M' | '1Y' | '5Y';
export type Point = { date: string; price: number };

type Props = {
  ticker: string;
  data: Point[]; // Daily points for selected range
  range: Range;
  height?: number;
  // eslint-disable-next-line no-unused-vars
  onRangeChange?: (next: Range) => void;
};

/** Parse YYYY-MM-DD as UTC */
function parseUTC(dateStr: string): Date {
  return new Date(dateStr + 'T00:00:00Z');
}

/** Format timestamps (ms) into axis labels like Google/Yahoo Finance */
function formatLabelFromMs(ms: number, range: Range): string {
  const d = new Date(ms);
  const baseOpts = { timeZone: 'UTC' as const };

  switch (range) {
    case '1W':
    case '1M':
    case '3M':
      return new Intl.DateTimeFormat('en-US', {
        ...baseOpts,
        month: 'short',
        day: 'numeric',
      }).format(d);

    case '1Y':
      return new Intl.DateTimeFormat('en-US', {
        ...baseOpts,
        month: 'short',
        year: 'numeric',
      }).format(d);

    case '5Y':
      return new Intl.DateTimeFormat('en-US', {
        ...baseOpts,
        year: 'numeric',
      }).format(d);
  }
}

/** Compute dynamic X-axis ticks based on actual dates (ms) */
function computeTicksMs(
  data: Array<Point & { time: number }>,
  range: Range
): number[] {
  if (!data.length) return [];

  const n = data.length;

  // Target tick counts like Google Finance
  const approxCount =
    range === '1W'
      ? Math.min(7, n)
      : range === '1M'
        ? 6
        : range === '3M'
          ? 6
          : range === '1Y'
            ? 6
            : 5; // 5Y

  const step = Math.max(1, Math.floor(n / approxCount));
  const ticks: number[] = [];

  for (let i = 0; i < n; i += step) {
    ticks.push(data[i].time);
  }

  // Always include last point
  const last = data[n - 1].time;
  if (ticks[ticks.length - 1] !== last) ticks.push(last);

  return ticks;
}

const RANGE_OPTIONS: Range[] = ['1W', '1M', '3M', '1Y', '5Y'];

export default function StockChart({
  ticker,
  data,
  range,
  height = 360,
  onRangeChange,
}: Props) {
  // Precompute ms timestamps for the X-axis
  const chartData = React.useMemo(
    () =>
      (data || []).map((p) => ({
        ...p,
        time: parseUTC(p.date).getTime(),
      })),
    [data]
  );

  const ticks = React.useMemo(
    () => computeTicksMs(chartData, range),
    [chartData, range]
  );

  /** Dynamic Y-axis domain so short ranges don't look flat. Adjusts it so that way instead of the graph including the value 0
      on the graph. Visually speaking since most stocks prices within a week are not likely to hit 0. Instead it will display the values that are necessary.
      Allowing the flow of the graph to be more dynamic and easier to read. While still giving out the correct values. 
  */
  const [minPrice, maxPrice] = React.useMemo(() => {
    if (!chartData.length) return [0, 0];

    let min = chartData[0].price;
    let max = chartData[0].price;

    for (const p of chartData) {
      if (p.price < min) min = p.price;
      if (p.price > max) max = p.price;
    }

    if (min === max) {
      // Completely flat data – give a tiny band so the line is visible
      const pad = min === 0 ? 1 : Math.abs(min) * 0.02;
      return [min - pad, max + pad];
    }

    const span = max - min;
    const pad = span * 0.1; // 10% padding above/below

    return [min - pad, max + pad];
  }, [chartData]);

  const chartHeight = height - 70;

  return (
    <div
      style={{
        width: '100%',
        height,
        padding: '16px',
        boxSizing: 'border-box',
        fontFamily: 'Inter, sans-serif',
      }}
    >
      {/* HEADER + RANGE BUTTONS */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 12,
        }}
      >
        <h2
          style={{
            margin: 0,
            fontSize: 18,
            fontWeight: 'bold',
            color: '#1f2937',
          }}
        >
          {ticker.toUpperCase()} Stock Performance ({range})
        </h2>

        <ToggleButtonGroup
          size="small"
          value={range}
          exclusive
          onChange={(_, next: Range | null) => {
            if (next) onRangeChange?.(next);
          }}
          aria-label="Time range"
        >
          {RANGE_OPTIONS.map((r) => (
            <ToggleButton
              key={r}
              value={r}
              aria-current={r === range ? 'true' : undefined}
              style={{
                borderRadius: '8px',
                textTransform: 'none',
                backgroundColor: r === range ? '#10b981' : '#f3f4f6',
                color: r === range ? 'white' : '#4b5563',
                borderColor: r === range ? '#059669' : '#e5e7eb',
              }}
            >
              {r}
            </ToggleButton>
          ))}
        </ToggleButtonGroup>
      </div>

      {/* MAIN CHART */}
      {chartData.length > 0 ? (
        <div style={{ height: chartHeight }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData}
              margin={{ top: 8, right: 8, bottom: 8, left: 20 }}
            >
              <XAxis
                dataKey="time"
                type="number"
                domain={['dataMin', 'dataMax']}
                ticks={ticks}
                tickFormatter={(ms) => formatLabelFromMs(Number(ms), range)}
                stroke="#6b7280"
                tickMargin={6}
              />

              <YAxis
                domain={[minPrice, maxPrice]} // <<< dynamic Y-axis
                tickFormatter={(v) => `$${Number(v).toFixed(2)}`}
                stroke="#6b7280"
              />

              <Tooltip
                formatter={(value: any) => [
                  `$${Number(value).toFixed(2)}`,
                  'Price',
                ]}
                labelFormatter={(_, payload) => {
                  const first = payload?.[0]?.payload as
                    | (Point & { time: number })
                    | undefined;
                  return first ? `Date: ${first.date}` : '';
                }}
                contentStyle={{
                  background: '#fff',
                  border: '1px solid #e5e7eb',
                  borderRadius: 8,
                  boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
                }}
              />

              <Line
                type="monotone"
                dataKey="price"
                stroke="#0d9488"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: chartHeight,
            color: '#9ca3af',
            fontSize: '1rem',
          }}
        >
          No data available for this range.
        </div>
      )}
    </div>
  );
}
