"use client";

type Point = { wpm: number; ok: boolean; date: number };

/** Simple line chart of words-per-minute over attempts (invalid attempts shown as hollow dots). */
export function WpmChart({ points, label }: { points: Point[]; label: string }) {
  const W = 640;
  const H = 240;
  const pad = { l: 52, r: 16, t: 16, b: 28 };
  const shown = points.slice(-20);
  const max = Math.max(60, ...shown.map((p) => p.wpm));
  const top = Math.ceil(max / 20) * 20;
  const x = (i: number) => pad.l + (shown.length === 1 ? (W - pad.l - pad.r) / 2 : (i * (W - pad.l - pad.r)) / (shown.length - 1));
  const y = (v: number) => pad.t + (1 - v / top) * (H - pad.t - pad.b);
  const valid = shown.map((p, i) => ({ ...p, i })).filter((p) => p.ok);
  const path = valid.map((p, k) => `${k ? "L" : "M"}${x(p.i).toFixed(1)},${y(p.wpm).toFixed(1)}`).join(" ");
  const ticks = [0, top / 2, top];

  return (
    <figure className="rounded-blob bg-paper p-3 ring-1 ring-line">
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label={label}>
        {ticks.map((v) => (
          <g key={v}>
            <line x1={pad.l} x2={W - pad.r} y1={y(v)} y2={y(v)} stroke="var(--color-line)" strokeWidth={1.5} />
            <text x={pad.l - 8} y={y(v) + 5} textAnchor="end" fontSize={14} fill="var(--color-muted)">
              {v}
            </text>
          </g>
        ))}
        <path d={path} fill="none" stroke="var(--color-sky-strong)" strokeWidth={4} strokeLinejoin="round" strokeLinecap="round" />
        {shown.map((p, i) => (
          <circle
            key={i}
            cx={x(i)}
            cy={y(p.wpm)}
            r={7}
            fill={p.ok ? "var(--color-sky-strong)" : "var(--color-paper)"}
            stroke={p.ok ? "var(--color-paper)" : "var(--color-rose-strong)"}
            strokeWidth={3}
          >
            <title>{`${p.wpm} · ${new Date(p.date).toLocaleDateString()}`}</title>
          </circle>
        ))}
      </svg>
      <figcaption className="px-2 text-center text-sm text-muted">{label}</figcaption>
    </figure>
  );
}
