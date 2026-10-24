import { useEffect, useId, useState, type MouseEvent, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { formatCount } from '../lib/format';

const reducedMotion = () => typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

/** Counts a number up from zero once, easing out; jumps straight to the value when motion is reduced. */
export function useCountUp(target: number, duration = 1100, delay = 200) {
  const [value, setValue] = useState(() => (reducedMotion() ? target : 0));
  useEffect(() => {
    if (reducedMotion()) {
      setValue(target);
      return;
    }
    let raf = 0;
    const start = performance.now() + delay;
    const from = 0;
    const step = (t: number) => {
      const p = Math.min(1, Math.max(0, (t - start) / duration));
      const e = 1 - Math.pow(1 - p, 3);
      setValue(from + (target - from) * e);
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [target, duration, delay]);
  return value;
}

/** Round, even steps with the top tick above the maximum. */
export function niceTicks(max: number, target = 3) {
  const raw = Math.max(max, 1) / target;
  const mag = Math.pow(10, Math.floor(Math.log10(raw)));
  const step = Math.max(1, [1, 2, 5, 10].map((m) => m * mag).find((s) => s >= raw) ?? 10 * mag);
  let top = Math.ceil(max / step) * step;
  if (top <= max) top += step;
  return Array.from({ length: top / step + 1 }, (_, i) => i * step);
}

function smoothPath(pts: [number, number][]) {
  if (!pts.length) return '';
  let d = `M${pts[0][0].toFixed(1)},${pts[0][1].toFixed(1)}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] ?? pts[i];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[i + 2] ?? p2;
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += ` C${c1[0].toFixed(1)},${c1[1].toFixed(1)} ${c2[0].toFixed(1)},${c2[1].toFixed(1)} ${p2[0].toFixed(1)},${p2[1].toFixed(1)}`;
  }
  return d;
}

function movingAverage(values: number[], w: number) {
  if (w <= 1) return values;
  return values.map((_, i) => {
    let s = 0;
    let c = 0;
    for (let k = Math.max(0, i - w + 1); k <= i; k++) {
      s += values[k];
      c++;
    }
    return s / c;
  });
}

export interface AreaSeries {
  label: string;
  /** A CSS colour, e.g. var(--c1). */
  color: string;
  values: number[];
}

interface AreaChartProps {
  /** Stacked bottom to top in the order given. */
  series: AreaSeries[];
  /** One label per point, shown in the tooltip ("12 Oct"). */
  pointLabels: string[];
  /** Points averaged for the drawn line; the tooltip always shows the raw figures. */
  smoothing?: number;
  height?: number;
  ariaLabel: string;
  /** Changing this replays the draw-in animation. */
  animationKey?: string | number;
}

const W = 1000;

/** A stacked area chart: smooth lines, gradient fills, a crosshair and a tooltip on hover. */
export function AreaChart({ series, pointLabels, smoothing = 1, height = 240, ariaLabel, animationKey }: AreaChartProps) {
  const gid = useId().replace(/:/g, '');
  const [hover, setHover] = useState<number | null>(null);
  const n = pointLabels.length;
  const smoothed = series.map((s) => movingAverage(s.values, smoothing));
  const stacked = smoothed.map((_, si) => smoothed[0].map((__, i) => smoothed.slice(0, si + 1).reduce((a, s) => a + s[i], 0)));
  const rawTotals = pointLabels.map((_, i) => series.reduce((a, s) => a + (s.values[i] ?? 0), 0));
  const ticks = niceTicks(Math.max(0, ...stacked[stacked.length - 1] ?? [0], ...rawTotals.map((v) => v * 0.6)));
  const top = ticks[ticks.length - 1];
  const x = (i: number) => (n <= 1 ? W / 2 : (i * W) / (n - 1));
  const y = (v: number) => height - (v / top) * height;
  const lines = stacked.map((vals) => vals.map((v, i) => [x(i), y(v)] as [number, number]));

  const onMove = (e: MouseEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    const f = Math.min(1, Math.max(0, (e.clientX - r.left) / r.width));
    setHover(Math.round(f * (n - 1)));
  };

  const hx = hover === null ? 0 : (x(hover) / W) * 100;

  return (
    <div className="area-chart">
      <div className="area-plot" style={{ height }} onMouseMove={onMove} onMouseLeave={() => setHover(null)}>
        {ticks.map((t) => (
          <div key={t} className={`area-grid${t === 0 ? ' is-base' : ''}`} style={{ top: `${(1 - t / top) * 100}%` }}>
            <span>{t}</span>
          </div>
        ))}
        <svg key={animationKey} className="area-svg" viewBox={`0 0 ${W} ${height}`} preserveAspectRatio="none" role="img" aria-label={ariaLabel}>
          <defs>
            {series.map((s, si) => (
              <linearGradient key={si} id={`${gid}-g${si}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" style={{ stopColor: s.color, stopOpacity: si === 0 ? 0.6 : 0.42 }} />
                <stop offset="100%" style={{ stopColor: s.color, stopOpacity: 0.03 }} />
              </linearGradient>
            ))}
          </defs>
          {lines.map((pts, si) => {
            const line = smoothPath(pts);
            return <path key={`a${si}`} d={`${line} L${W},${height} L0,${height} Z`} fill={`url(#${gid}-g${si})`} />;
          }).reverse()}
          {lines.map((pts, si) => (
            <path key={`l${si}`} d={smoothPath(pts)} fill="none" style={{ stroke: series[si].color }} strokeWidth={si === lines.length - 1 ? 2.25 : 1.75} vectorEffect="non-scaling-stroke" />
          ))}
        </svg>
        {hover !== null && (
          <>
            <div className="area-cross" style={{ left: `${hx}%` }} />
            {lines.map((pts, si) => (
              <span key={si} className="area-dot" style={{ left: `${hx}%`, top: `${(pts[hover][1] / height) * 100}%`, background: series[si].color }} />
            ))}
            <div className="area-tip" style={{ left: `${hx}%`, transform: hx > 70 ? 'translateX(calc(-100% - 14px))' : 'translateX(14px)' }}>
              <div className="area-tip-date">{pointLabels[hover]}</div>
              {[...series].reverse().map((s) => (
                <div key={s.label} className="area-tip-row"><i style={{ background: s.color }} />{s.label}<b className="num">{s.values[hover] ?? 0}</b></div>
              ))}
              <div className="area-tip-row is-total">Total<b className="num">{rawTotals[hover]}</b></div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export function ChartLegend({ items }: { items: { label: string; color: string }[] }) {
  return (
    <div className="chart-legend">
      {items.map((i) => <span key={i.label}><i style={{ background: i.color }} />{i.label}</span>)}
    </div>
  );
}

export interface BarRow {
  label: string;
  value: number;
  href?: string;
  lead?: ReactNode;
}

/** A ranked list: label and figure, then a rounded bar that grows in, the leader in the brand colour. */
export function BarList({ rows, caption, valueLabel }: { rows: BarRow[]; caption: string; valueLabel?: (v: number) => ReactNode }) {
  const max = rows[0]?.value || 1;
  return (
    <ol className="bar-list stagger" aria-label={caption}>
      {rows.map((r, i) => (
        <li key={r.label}>
          {r.lead}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="bar-list-line">
              {r.href ? <Link to={r.href} className="bar-list-label truncate">{r.label}</Link> : <span className="bar-list-label truncate">{r.label}</span>}
              <span className="num">{valueLabel ? valueLabel(r.value) : formatCount(r.value)}</span>
            </div>
            <div className="bar-list-track" aria-hidden="true">
              <span style={{ width: `${(r.value / max) * 100}%`, opacity: i === 0 ? 1 : Math.max(0.35, 1 - i * 0.15) }} />
            </div>
          </div>
        </li>
      ))}
    </ol>
  );
}
