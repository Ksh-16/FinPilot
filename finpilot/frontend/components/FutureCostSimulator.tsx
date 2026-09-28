'use client';

import { useEffect, useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, IndianRupee } from 'lucide-react';
import GlassCard, { CardHeader } from './GlassCard';
import { api, FutureCostResponse } from '@/lib/api';
import { formatCurrency } from '@/lib/format';

export default function FutureCostSimulator() {
  const [cost, setCost] = useState(1000000);
  const [years, setYears] = useState(10);
  const [inflation, setInflation] = useState(6);
  const [result, setResult] = useState<FutureCostResponse | null>(null);

  useEffect(() => {
    const timeout = setTimeout(async () => {
     try {
  const res = await api.getFutureCost({ cost, years, inflation });
  setResult(res);
} catch (e) {
  console.error("Future cost API error:", e);
}
    }, 300);
    return () => clearTimeout(timeout);
  }, [cost, years, inflation]);

  return (
    <GlassCard className="p-6 md:p-10" id="future-cost">
      <CardHeader
        eyebrow="Section 03"
        title="Future Cost Simulator"
        description="See how inflation quietly reshapes the price of your goals over time."
        icon={<TrendingUp className="h-5 w-5 text-accent-purple" />}
      />

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Controls */}
        <div className="space-y-6 lg:col-span-1">
          <div>
            <label className="field-label">Today&apos;s cost</label>
            <div className="relative">
              <IndianRupee className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-faint" />
              <input
                type="number"
                min={0}
                value={cost}
                onChange={(e) => setCost(Number(e.target.value) || 0)}
                className="input-field pl-10"
              />
            </div>
          </div>

          <SliderField label="Time horizon" value={years} setValue={setYears} min={1} max={30} step={1} unit="yrs" />
          <SliderField label="Inflation rate" value={inflation} setValue={setInflation} min={0} max={15} step={0.5} unit="%" />

          {result && (
            <div className="grid grid-cols-2 gap-3 pt-2">
              <SummaryStat label="Present cost" value={formatCurrency(result.summary.presentCost, { compact: true })} />
              <SummaryStat label="Future cost" value={formatCurrency(result.summary.futureCost, { compact: true })} highlight />
              <SummaryStat label="Total increase" value={formatCurrency(result.summary.totalIncrease, { compact: true })} />
              <SummaryStat label="Growth" value={`+${result.summary.increasePercent}%`} />
            </div>
          )}
        </div>

        {/* Chart */}
        <div className="h-[320px] lg:col-span-2">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={result?.series ?? []} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="costStroke" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#8B5CF6" />
                  <stop offset="100%" stopColor="#22D3EE" />
                </linearGradient>
                <linearGradient id="costFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#8B5CF6" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="#22D3EE" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 6" stroke="rgba(255,255,255,0.06)" vertical={false} />
              <XAxis
                dataKey="label"
                tick={{ fill: '#94A3B8', fontSize: 11, fontFamily: 'var(--font-inter)' }}
                axisLine={{ stroke: 'rgba(255,255,255,0.08)' }}
                tickLine={false}
                interval="preserveStartEnd"
              />
              <YAxis
                tick={{ fill: '#94A3B8', fontSize: 11, fontFamily: 'var(--font-inter)' }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => formatCurrency(v, { compact: true })}
                width={64}
              />
              <Tooltip content={<CostTooltip />} />
              <Area
                type="monotone"
                dataKey="value"
                stroke="url(#costStroke)"
                strokeWidth={3}
                fill="url(#costFill)"
                animationDuration={900}
                animationEasing="ease-out"
                dot={false}
                activeDot={{ r: 5, fill: '#22D3EE', stroke: '#0A0D1C', strokeWidth: 2 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </GlassCard>
  );
}

function CostTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass-panel rounded-xl px-3.5 py-2.5 text-xs shadow-glass-card">
      <p className="font-medium text-ink-muted">{label}</p>
      <p className="mt-0.5 font-mono text-sm font-semibold text-ink">{formatCurrency(payload[0].value)}</p>
    </div>
  );
}

function SliderField({
  label,
  value,
  setValue,
  min,
  max,
  step,
  unit
}: {
  label: string;
  value: number;
  setValue: (v: number) => void;
  min: number;
  max: number;
  step: number;
  unit: string;
}) {
  const percent = ((value - min) / (max - min)) * 100;
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between">
        <label className="field-label !mb-0">{label}</label>
        <span className="font-mono text-xs font-semibold text-accent-cyan">
          {value}
          {unit}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => setValue(Number(e.target.value))}
        className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-base-700 accent-accent-purple"
        style={{
          background: `linear-gradient(to right, #8B5CF6 0%, #22D3EE ${percent}%, rgba(255,255,255,0.08) ${percent}%)`
        }}
      />
    </div>
  );
}

function SummaryStat({ label, value, highlight = false }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className={`rounded-xl border px-3.5 py-2.5 ${highlight ? 'border-accent-purple/30 bg-accent-purple/10' : 'border-glass-border bg-base-900/40'}`}>
      <p className="text-[10px] font-medium uppercase tracking-wider text-ink-faint">{label}</p>
      <p className={`mt-1 font-mono text-sm font-semibold ${highlight ? 'gradient-text' : 'text-ink'}`}>{value}</p>
    </div>
  );
}
