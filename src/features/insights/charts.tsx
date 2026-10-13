'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';

import type { Bucket } from './compute';
import styles from './insights.module.css';

/**
 * Chart colours, validated for the dark surface (#111213) with the dataviz
 * palette checker: the current period in the accent, earlier ones in a
 * recessive gray (the "emphasis" form). Both clear 3:1 against the surface.
 */
const ACCENT = '#5b8def';
const MUTED = '#5f636b';
const GRID = '#232528';

function useWidth<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [width, setWidth] = useState(0);
  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const observer = new ResizeObserver(([entry]) => setWidth(entry?.contentRect.width ?? 0));
    observer.observe(element);
    return () => observer.disconnect();
  }, []);
  return { ref, width };
}

/** 0 / 2 / 4 / 6 … with at most four steps above zero. */
function niceTicks(max: number): number[] {
  if (max <= 0) return [0, 1];
  const rough = max / 4;
  const magnitude = 10 ** Math.floor(Math.log10(rough));
  const step = [1, 2, 5, 10].map((m) => m * magnitude).find((candidate) => candidate >= rough) ?? rough;
  const top = Math.ceil(max / step) * step;
  const ticks: number[] = [];
  for (let value = 0; value <= top + 1e-9; value += step) ticks.push(Math.round(value * 100) / 100);
  return ticks;
}

/** A column with a 4px rounded top and a square foot on the baseline. */
function columnPath(x: number, y: number, width: number, base: number) {
  const r = Math.min(4, width / 2, Math.max(0, base - y));
  return `M${x},${base} V${y + r} Q${x},${y} ${x + r},${y} H${x + width - r} Q${x + width},${y} ${x + width},${y + r} V${base} Z`;
}

export function ColumnChart({
  buckets,
  unit,
  periodLabel,
  height = 200,
}: {
  buckets: Bucket[];
  /** "new leads", "follow-ups" */
  unit: string;
  /** How a bucket is named in the tooltip: "Week of", "" */
  periodLabel: (bucket: Bucket) => string;
  height?: number;
}) {
  const { ref, width } = useWidth<HTMLDivElement>();
  const [hover, setHover] = useState<number | null>(null);
  const max = Math.max(...buckets.map((bucket) => bucket.value), 0);
  const ticks = niceTicks(max);
  const top = ticks[ticks.length - 1] || 1;

  const padLeft = 28;
  const padBottom = 24;
  const padTop = 18;
  const plotWidth = Math.max(0, width - padLeft);
  const plotHeight = height - padBottom - padTop;
  const band = buckets.length ? plotWidth / buckets.length : 0;
  const barWidth = Math.min(24, Math.max(4, band * 0.6));
  const base = padTop + plotHeight;
  const y = (value: number) => padTop + plotHeight - (value / top) * plotHeight;
  // Every label needs about 56px ("28 Sept" plus air) or they collide.
  const labelEvery = Math.max(1, Math.ceil(56 / Math.max(band, 1)));
  const hovered = hover === null ? null : buckets[hover];

  return (
    <div className={styles.chart} ref={ref}>
      {width > 0 ? (
        <svg width={width} height={height} role="img" aria-label={`Column chart of ${unit}`} className={styles.svg}>
          {ticks.map((tick) => (
            <g key={tick}>
              <line x1={padLeft} x2={width} y1={y(tick)} y2={y(tick)} stroke={GRID} strokeWidth={1} />
              <text x={padLeft - 8} y={y(tick) + 4} textAnchor="end" className={styles.axis}>
                {tick}
              </text>
            </g>
          ))}
          {buckets.map((bucket, index) => {
            const center = padLeft + band * index + band / 2;
            const x = center - barWidth / 2;
            const valueY = y(bucket.value);
            return (
              <g key={bucket.start.getTime()}>
                {bucket.value > 0 ? (
                  <path
                    d={columnPath(x, valueY, barWidth, base)}
                    fill={bucket.current ? ACCENT : MUTED}
                    opacity={hover === null || hover === index ? 1 : 0.55}
                  />
                ) : null}
                {bucket.current && bucket.value > 0 ? (
                  <text x={center} y={valueY - 6} textAnchor="middle" className={styles.capLabel}>
                    {bucket.value}
                  </text>
                ) : null}
                {(buckets.length - 1 - index) % labelEvery === 0 ? (
                  <text x={center} y={height - 6} textAnchor="middle" className={styles.axis}>
                    {bucket.label}
                  </text>
                ) : null}
                {/* The hit target is the whole column slot, not just the painted bar. */}
                <rect
                  x={padLeft + band * index}
                  y={padTop}
                  width={band}
                  height={plotHeight}
                  fill="transparent"
                  tabIndex={0}
                  aria-label={`${periodLabel(bucket)}: ${bucket.value} ${unit}`}
                  onPointerEnter={() => setHover(index)}
                  onPointerLeave={() => setHover(null)}
                  onFocus={() => setHover(index)}
                  onBlur={() => setHover(null)}
                  className={styles.hit}
                />
              </g>
            );
          })}
          <line x1={padLeft} x2={width} y1={base} y2={base} stroke="#2b2d30" strokeWidth={1} />
        </svg>
      ) : (
        <div style={{ height }} />
      )}
      {hovered && hover !== null ? (
        <div
          className={styles.tooltip}
          style={{
            left: Math.min(Math.max(padLeft + band * hover + band / 2, 70), Math.max(width - 70, 70)),
            top: Math.max(y(hovered.value) - 12, 0),
          }}
          role="status">
          <span className={styles.tooltipValue}>
            {hovered.value} {unit}
          </span>
          <span className={styles.tooltipLabel}>{periodLabel(hovered)}</span>
        </div>
      ) : null}
      <NumbersTable
        headers={['Period', unit[0]!.toUpperCase() + unit.slice(1)]}
        rows={buckets.map((bucket) => [periodLabel(bucket), String(bucket.value)])}
      />
    </div>
  );
}

/** Labelled horizontal bars in one colour: every value written next to its bar. */
export function BarList({ items, total }: { items: { label: ReactNode; count: number; key: string }[]; total?: number }) {
  const max = Math.max(...items.map((item) => item.count), 1);
  const sum = total ?? items.reduce((acc, item) => acc + item.count, 0);
  return (
    <ul className={styles.barList}>
      {items.map((item) => (
        <li key={item.key} className={styles.barRow}>
          <span className={styles.barLabel}>{item.label}</span>
          <span className={styles.barTrack} aria-hidden="true">
            {item.count > 0 ? <span className={styles.barFill} style={{ width: `${(item.count / max) * 100}%` }} /> : null}
          </span>
          <span className={styles.barValue}>
            {item.count}
            {sum > 0 ? <span className={styles.barShare}>{Math.round((item.count / sum) * 100)}%</span> : null}
          </span>
        </li>
      ))}
    </ul>
  );
}

/** Every value the chart shows, as a table, for screen readers and for checking. */
export function NumbersTable({ headers, rows }: { headers: string[]; rows: string[][] }) {
  return (
    <details className={styles.numbers}>
      <summary>Show numbers</summary>
      <table>
        <thead>
          <tr>
            {headers.map((header) => (
              <th key={header} scope="col">
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row[0]}>
              {row.map((cell, index) => (
                <td key={index}>{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </details>
  );
}
