import type { Dashboard } from "@/types/api";

const SERIES = [
  { key: "ROOM", label: "Rooms", color: "#4f6bff" },
  { key: "RESTAURANT", label: "Restaurant", color: "#10b981" },
  { key: "BANQUET", label: "Banquets", color: "#f59e0b" },
  { key: "CONFERENCE", label: "Conference", color: "#8b5cf6" },
] as const;

const monthLabel = (m: string) => new Date(`${m}-01T00:00:00Z`).toLocaleDateString("en-IN", { month: "short", timeZone: "UTC" });
const lakh = (p: number) => p / 100 / 100000;

/** Stacked monthly revenue (taxable value) by service, in ₹ lakh. Accessible table fallback included. */
export function RevenueChart({ data }: { data: Dashboard["revenue"] }) {
  const W = 600, H = 250, pad = { l: 40, r: 8, t: 10, b: 28 };
  const totals = data.map((d) => SERIES.reduce((s, x) => s + Math.max(0, lakh(d[x.key])), 0));
  const rawMax = Math.max(1, ...totals);
  const step = rawMax <= 2 ? 0.5 : rawMax <= 5 ? 1 : rawMax <= 12 ? 2 : 5;
  const max = Math.ceil(rawMax / step) * step;
  const iw = W - pad.l - pad.r, ih = H - pad.t - pad.b;
  const bw = iw / data.length;
  const y = (v: number) => pad.t + ih - (v / max) * ih;
  const ticks = Array.from({ length: Math.floor(max / step) + 1 }, (_, i) => i * step);

  return (
    <figure>
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`Revenue by service over the last ${data.length} months, in lakh rupees`} className="h-auto w-full">
        {ticks.map((t) => (
          <g key={t}>
            <line x1={pad.l} x2={W - pad.r} y1={y(t)} y2={y(t)} stroke="#e8ebf3" />
            <text x={pad.l - 8} y={y(t) + 4} textAnchor="end" fontSize="11" fill="#64748b">{t}</text>
          </g>
        ))}
        {data.map((d, i) => {
          let acc = 0;
          const x = pad.l + i * bw + bw * 0.2;
          return (
            <g key={d.month}>
              {SERIES.map((s) => {
                const v = Math.max(0, lakh(d[s.key]));
                const rect = v > 0 && (
                  <rect key={s.key} x={x} width={bw * 0.6} y={y(acc + v)} height={(v / max) * ih} fill={s.color}>
                    <title>{`${monthLabel(d.month)} · ${s.label}: ₹${v.toFixed(2)} lakh`}</title>
                  </rect>
                );
                acc += v;
                return rect;
              })}
              <text x={x + bw * 0.3} y={H - 8} textAnchor="middle" fontSize="12" fill="#475569">{monthLabel(d.month)}</text>
            </g>
          );
        })}
      </svg>
      <figcaption className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-xs text-slate-600">
        {SERIES.map((s) => <span key={s.key} className="flex items-center gap-1.5"><span className="size-2.5 rounded-sm" style={{ background: s.color }} aria-hidden /> {s.label}</span>)}
        <span className="ml-auto text-slate-400">₹ lakh · taxable value, net of credit notes</span>
      </figcaption>
      <table className="sr-only">
        <caption>Revenue by service (₹ lakh)</caption>
        <thead><tr><th>Month</th>{SERIES.map((s) => <th key={s.key}>{s.label}</th>)}</tr></thead>
        <tbody>{data.map((d) => <tr key={d.month}><td>{monthLabel(d.month)}</td>{SERIES.map((s) => <td key={s.key}>{lakh(d[s.key]).toFixed(2)}</td>)}</tr>)}</tbody>
      </table>
    </figure>
  );
}
