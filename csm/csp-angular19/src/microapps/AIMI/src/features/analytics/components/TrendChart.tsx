import { useEffect, useId, useRef, useState } from 'react';
import { Box, Typography } from '@mui/material';
import type { ScoreSeries } from '../services/analyticsService';
import { formatScore, monthLabel } from '../utils/scoreStats';

interface TrendChartProps {
  series: ScoreSeries;
  /** yyyy-MM, oldest first */
  months: string[];
}

const HEIGHT = 190;
const PAD = { left: 30, right: 18, top: 14, bottom: 26 };
const ACCENT = '#0066FF';
const MUTED = '#6e6e73';
const FAINT = '#b4b4bb';
const GRID = '#eeeef1';
const BAD = '#c9302c';

interface Pt {
  x: number;
  y: number;
  i: number;
}

interface Seg {
  d: string;
  /** true when the months between the two points have no snapshot */
  gap: boolean;
  /** just the cubic part, used to build the filled area */
  c: string;
  from: Pt;
  to: Pt;
}

/** Smooth curve through the points that never overshoots (monotone cubic). */
const buildSegments = (pts: Pt[]): Seg[] => {
  const n = pts.length;
  if (n < 2) return [];
  const dk: number[] = [];
  for (let k = 0; k < n - 1; k++) {
    dk.push((pts[k + 1].y - pts[k].y) / (pts[k + 1].x - pts[k].x));
  }
  const m: number[] = new Array(n).fill(0);
  m[0] = dk[0];
  m[n - 1] = dk[n - 2];
  for (let k = 1; k < n - 1; k++) {
    m[k] = dk[k - 1] * dk[k] > 0 ? (dk[k - 1] + dk[k]) / 2 : 0;
  }
  for (let k = 0; k < n - 1; k++) {
    if (dk[k] === 0) {
      m[k] = 0;
      m[k + 1] = 0;
    } else {
      const a = m[k] / dk[k];
      const b = m[k + 1] / dk[k];
      const s = a * a + b * b;
      if (s > 9) {
        const t = 3 / Math.sqrt(s);
        m[k] = t * a * dk[k];
        m[k + 1] = t * b * dk[k];
      }
    }
  }
  return pts.slice(0, -1).map((p0, k) => {
    const p1 = pts[k + 1];
    const dx = (p1.x - p0.x) / 3;
    const c = `C${(p0.x + dx).toFixed(1)},${(p0.y + m[k] * dx).toFixed(1)} ${(p1.x - dx).toFixed(1)},${(p1.y - m[k + 1] * dx).toFixed(1)} ${p1.x.toFixed(1)},${p1.y.toFixed(1)}`;
    return {
      d: `M${p0.x.toFixed(1)},${p0.y.toFixed(1)} ${c}`,
      c,
      gap: p1.i - p0.i > 1,
      from: p0,
      to: p1,
    };
  });
};

export const TrendChart = ({ series, months }: TrendChartProps) => {
  const uid = useId().replace(/:/g, '');
  const wrapRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(640);
  const [hover, setHover] = useState<number | null>(null);

  // Draw at the real pixel width so text and strokes keep their size on wide screens.
  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const update = () => setWidth(Math.max(280, Math.round(el.clientWidth)));
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const byMonth = new Map(series.points.map((p) => [p.month, p]));
  const cur = months.map((m) => byMonth.get(m)?.current ?? null);
  const acc = months.map((m) => byMonth.get(m)?.accepted ?? null);
  const values = [...cur, ...acc].filter((v): v is number => v !== null);

  if (values.length === 0) {
    return (
      <Box sx={{ py: 6, textAlign: 'center' }}>
        <Typography color="text.secondary">
          No score history for this selection yet.
        </Typography>
      </Box>
    );
  }

  const W = width;
  const lo = Math.max(0, Math.floor(Math.min(...values) - 0.5));
  const hi = Math.min(5, Math.max(lo + 1, Math.ceil(Math.max(...values) + 0.5)));
  const n = months.length;
  const X = (i: number) =>
    n === 1
      ? (PAD.left + W - PAD.right) / 2
      : PAD.left + (i * (W - PAD.left - PAD.right)) / (n - 1);
  const Y = (v: number) =>
    PAD.top + ((hi - v) / (hi - lo)) * (HEIGHT - PAD.top - PAD.bottom);
  const baseY = HEIGHT - PAD.bottom;

  const toPts = (arr: (number | null)[]): Pt[] =>
    arr.flatMap((v, i) => (v === null ? [] : [{ x: X(i), y: Y(v), i }]));
  const curPts = toPts(cur);
  const accPts = toPts(acc);
  const curSegs = buildSegments(curPts);
  const accSegs = buildSegments(accPts);

  // A month is "down" when its score is below the previous scored month.
  const down = new Set<number>();
  curPts.forEach((p, k) => {
    if (k > 0 && (cur[p.i] as number) < (cur[curPts[k - 1].i] as number)) down.add(p.i);
  });

  const lastIdx = curPts.length ? curPts[curPts.length - 1].i : -1;
  const active = hover ?? lastIdx;
  const step = (W - PAD.left - PAD.right) / Math.max(1, n - 1);
  const ticks: number[] = [];
  for (let t = lo; t <= hi + 1e-9; t += 1) ticks.push(t);

  const areaPath =
    curSegs.length > 0
      ? `M${curPts[0].x.toFixed(1)},${baseY} L${curPts[0].x.toFixed(1)},${curPts[0].y.toFixed(1)} ${curSegs
          .map((s) => s.c)
          .join(' ')} L${curPts[curPts.length - 1].x.toFixed(1)},${baseY} Z`
      : '';

  const tipW = 168;
  const tipH = 46;
  const ax = active >= 0 ? X(active) : 0;
  const tipX = Math.min(Math.max(ax - tipW / 2, PAD.left), W - PAD.right - tipW);
  const hasActive = active >= 0;
  const activeCur = hasActive ? cur[active] : null;
  const activeAcc = hasActive ? acc[active] : null;
  const activeDown = hasActive && down.has(active);
  const showEvery = W < 520 ? 2 : 1;
  const sig = `${series.points.length}-${months[0]}-${months.length}-${values.join(',')}`;

  return (
    <Box ref={wrapRef} sx={{ width: '100%' }}>
      <svg
        key={sig}
        width={W}
        height={HEIGHT}
        viewBox={`0 0 ${W} ${HEIGHT}`}
        role="img"
        aria-label="Monthly current and accepted score"
        style={{ display: 'block', touchAction: 'pan-y' }}
        onPointerLeave={() => setHover(null)}
      >
        <style>{`
          @keyframes ${uid}draw { from { stroke-dashoffset: 1 } to { stroke-dashoffset: 0 } }
          @keyframes ${uid}fade { from { opacity: 0 } to { opacity: 1 } }
          @keyframes ${uid}pop { from { transform: scale(0); opacity: 0 } to { transform: scale(1); opacity: 1 } }
          .${uid}line { stroke-dasharray: 1; stroke-dashoffset: 1; animation: ${uid}draw .7s cubic-bezier(.4,0,.2,1) forwards }
          .${uid}fade { opacity: 0; animation: ${uid}fade .6s ease-out .35s forwards }
          .${uid}pop { transform-box: fill-box; transform-origin: center; transform: scale(0); animation: ${uid}pop .35s cubic-bezier(.3,1.6,.5,1) forwards }
          @media (prefers-reduced-motion: reduce) {
            .${uid}line, .${uid}fade, .${uid}pop { animation: none; stroke-dashoffset: 0; opacity: 1; transform: none }
          }
        `}</style>
        <defs>
          <linearGradient id={`${uid}g`} x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor={ACCENT} stopOpacity="0.22" />
            <stop offset="100%" stopColor={ACCENT} stopOpacity="0" />
          </linearGradient>
        </defs>

        {ticks.map((t) => (
          <g key={t}>
            <line x1={PAD.left} x2={W - PAD.right} y1={Y(t)} y2={Y(t)} stroke={GRID} />
            <text x={PAD.left - 8} y={Y(t) + 4} textAnchor="end" fontSize="11" fill={FAINT}>
              {t}
            </text>
          </g>
        ))}

        {areaPath && <path className={`${uid}fade`} d={areaPath} fill={`url(#${uid}g)`} />}

        {accSegs.map((s, k) => (
          <path
            key={`a${k}`}
            className={`${uid}fade`}
            d={s.d}
            fill="none"
            stroke={MUTED}
            strokeOpacity={s.gap ? 0.45 : 0.9}
            strokeWidth={1.8}
            strokeDasharray="4 4"
            strokeLinecap="round"
          />
        ))}

        {curSegs.map((s, k) =>
          s.gap ? (
            <path
              key={`s${k}`}
              className={`${uid}fade`}
              d={s.d}
              fill="none"
              stroke={ACCENT}
              strokeOpacity={0.55}
              strokeWidth={2.5}
              strokeDasharray="2 6"
              strokeLinecap="round"
              style={{ animationDelay: `${0.3 + k * 0.2}s` }}
            />
          ) : (
            <path
              key={`s${k}`}
              className={`${uid}line`}
              d={s.d}
              pathLength={1}
              fill="none"
              stroke={ACCENT}
              strokeWidth={3}
              strokeLinecap="round"
              style={{ animationDelay: `${k * 0.2}s` }}
            />
          )
        )}

        {months.map((m, i) => {
          const has = cur[i] !== null;
          return (
            <g key={m}>
              {has && (
                <circle
                  className={`${uid}pop`}
                  cx={X(i)}
                  cy={Y(cur[i] as number)}
                  r={down.has(i) ? 4.5 : 3.5}
                  fill={down.has(i) ? BAD : ACCENT}
                  stroke="#fff"
                  strokeWidth={2}
                  style={{ animationDelay: `${0.25 + i * 0.04}s` }}
                />
              )}
              {i % showEvery === 0 && (
                <text
                  x={X(i)}
                  y={HEIGHT - 8}
                  textAnchor="middle"
                  fontSize="11"
                  fill={has ? MUTED : FAINT}
                  fontWeight={has ? 600 : 400}
                >
                  {monthLabel(m)}
                </text>
              )}
            </g>
          );
        })}

        {hasActive && (
          <g pointerEvents="none">
            <line x1={ax} x2={ax} y1={PAD.top} y2={baseY} stroke={MUTED} strokeOpacity={0.25} strokeDasharray="3 3" />
            {activeAcc !== null && (
              <circle cx={ax} cy={Y(activeAcc)} r={4} fill="#fff" stroke={MUTED} strokeWidth={2} />
            )}
            {activeCur !== null && (
              <circle
                cx={ax}
                cy={Y(activeCur)}
                r={6}
                fill={activeDown ? BAD : ACCENT}
                stroke="#fff"
                strokeWidth={2.5}
              />
            )}
            <rect
              x={tipX}
              y={PAD.top - 8}
              width={tipW}
              height={tipH}
              rx={10}
              fill="#fff"
              stroke={GRID}
              style={{ filter: 'drop-shadow(0 4px 10px rgba(0,0,0,.08))' }}
            />
            <text x={tipX + 12} y={PAD.top + 8} fontSize="11" fill={MUTED}>
              {monthLabel(months[active], true)}
            </text>
            <text
              x={tipX + 12}
              y={PAD.top + 26}
              fontSize="12.5"
              fontWeight={600}
              fill={activeCur === null ? MUTED : activeDown ? BAD : '#1d1d1f'}
            >
              {activeCur === null
                ? 'No snapshot this month'
                : `${formatScore(activeCur)} current · ${formatScore(activeAcc)} acc.`}
            </text>
          </g>
        )}

        {months.map((m, i) => (
          <rect
            key={`h${m}`}
            x={X(i) - step / 2}
            y={0}
            width={step}
            height={HEIGHT}
            fill="transparent"
            onPointerEnter={() => setHover(i)}
            onPointerMove={() => setHover(i)}
          />
        ))}
      </svg>
    </Box>
  );
};
