import { useMemo, useState } from 'react';

// Validated with the dataviz palette checker against the white surface (CVD ΔE 23.6, both ≥ 3:1 contrast).
const SERIES = [
  { key: 'inquiries', label: 'Inquiries', color: '#1f6fae' },
  { key: 'applications', label: 'Applications', color: '#c47f12' },
];

const W = 640;
const H = 220;
const PAD = { top: 12, right: 8, bottom: 28, left: 32 };
const BAR = 18;
const GAP = 2;

// Monday (UTC) of the week containing `date`, as YYYY-MM-DD — matches the server's WEEKDAY() bucketing.
function weekStart(date) {
  const d = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  d.setUTCDate(d.getUTCDate() - ((d.getUTCDay() + 6) % 7));
  return d;
}

const labelFmt = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', timeZone: 'UTC' });

function niceMax(v) {
  if (v <= 4) return 4;
  const step = 10 ** Math.floor(Math.log10(v));
  return Math.ceil(v / step) * step;
}

// Column with a 4px rounded data-end and a square baseline.
function columnPath(x, y, w, h) {
  if (h <= 0) return '';
  const r = Math.min(4, h, w / 2);
  return `M${x},${y + h}V${y + r}Q${x},${y} ${x + r},${y}H${x + w - r}Q${x + w},${y} ${x + w},${y + r}V${y + h}Z`;
}

export default function WeeklyChart({ weekly = [], weeks = 8 }) {
  const [hover, setHover] = useState(null);
  const [showTable, setShowTable] = useState(false);

  const data = useMemo(() => {
    const byWeek = Object.fromEntries(weekly.map((w) => [w.week, w]));
    const current = weekStart(new Date());
    return Array.from({ length: weeks }, (_, i) => {
      const d = new Date(current);
      d.setUTCDate(d.getUTCDate() - (weeks - 1 - i) * 7);
      const key = d.toISOString().slice(0, 10);
      return { week: key, label: labelFmt.format(d), inquiries: byWeek[key]?.inquiries || 0, applications: byWeek[key]?.applications || 0 };
    });
  }, [weekly, weeks]);

  const max = niceMax(Math.max(1, ...data.flatMap((d) => [d.inquiries, d.applications])));
  const innerW = W - PAD.left - PAD.right;
  const innerH = H - PAD.top - PAD.bottom;
  const band = innerW / data.length;
  const y = (v) => PAD.top + innerH - (v / max) * innerH;
  const ticks = [0, max / 2, max].filter((t, i, a) => Number.isInteger(t) && a.indexOf(t) === i);
  const total = data.reduce((s, d) => s + d.inquiries + d.applications, 0);

  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <ul className="flex gap-4 text-[0.82rem] text-ink-muted" aria-label="Legend">
          {SERIES.map((s) => (
            <li key={s.key} className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-sm" style={{ background: s.color }} aria-hidden="true" />
              {s.label}
            </li>
          ))}
        </ul>
        <button type="button" onClick={() => setShowTable((v) => !v)} className="cursor-pointer text-[0.8rem] font-medium text-navy-700 hover:underline">
          {showTable ? 'Show chart' : 'Show as table'}
        </button>
      </div>

      {showTable ? (
        <table className="w-full text-[0.85rem]">
          <thead>
            <tr className="border-b border-line text-left text-ink-faint">
              <th className="py-1.5 font-medium">Week of</th>
              {SERIES.map((s) => (
                <th key={s.key} className="py-1.5 text-right font-medium">
                  {s.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((d) => (
              <tr key={d.week} className="border-b border-line/70">
                <td className="py-1.5">{d.label}</td>
                <td className="py-1.5 text-right tabular-nums">{d.inquiries}</td>
                <td className="py-1.5 text-right tabular-nums">{d.applications}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <div className="relative">
          <svg
            viewBox={`0 0 ${W} ${H}`}
            className="h-auto w-full"
            role="img"
            aria-label={`Submissions per week over the last ${weeks} weeks: ${total} in total. Use "Show as table" for exact values.`}
            onMouseLeave={() => setHover(null)}
          >
            {ticks.map((t) => (
              <g key={t}>
                <line x1={PAD.left} x2={W - PAD.right} y1={y(t)} y2={y(t)} stroke="var(--line)" strokeWidth="1" />
                <text x={PAD.left - 8} y={y(t)} dy="0.32em" textAnchor="end" fontSize="11" fill="var(--ink-faint)">
                  {t}
                </text>
              </g>
            ))}
            {data.map((d, i) => {
              const cx = PAD.left + band * i + band / 2;
              const groupW = BAR * SERIES.length + GAP;
              return (
                <g key={d.week}>
                  {hover === i && <rect x={PAD.left + band * i + 2} y={PAD.top} width={band - 4} height={innerH} fill="var(--navy-50)" />}
                  {SERIES.map((s, j) => {
                    const v = d[s.key];
                    const x = cx - groupW / 2 + j * (BAR + GAP);
                    return <path key={s.key} d={columnPath(x, y(v), BAR, PAD.top + innerH - y(v))} fill={s.color} />;
                  })}
                  <text x={cx} y={H - 8} textAnchor="middle" fontSize="11" fill="var(--ink-faint)">
                    {d.label}
                  </text>
                  {/* Hit target covers the whole band, larger than the marks. */}
                  <rect x={PAD.left + band * i} y={PAD.top} width={band} height={innerH} fill="transparent" onMouseEnter={() => setHover(i)} />
                </g>
              );
            })}
          </svg>
          {hover !== null && (
            <div
              className="pointer-events-none absolute top-1 z-10 min-w-[150px] -translate-x-1/2 rounded-md border border-line bg-surface px-3 py-2 text-[0.8rem] shadow-md"
              style={{ left: `${((PAD.left + band * hover + band / 2) / W) * 100}%` }}
            >
              <p className="mb-1 font-semibold text-ink">Week of {data[hover].label}</p>
              {SERIES.map((s) => (
                <p key={s.key} className="flex items-center justify-between gap-4 text-ink-muted">
                  <span className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-sm" style={{ background: s.color }} />
                    {s.label}
                  </span>
                  <span className="font-semibold text-ink tabular-nums">{data[hover][s.key]}</span>
                </p>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
