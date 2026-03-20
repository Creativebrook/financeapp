"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { CHART_COLORS } from '@/lib/theme';

interface CashflowAnalysisChartProps {
  data: any[];
  timeRange: string;
}

export default function CashflowAnalysisChart({ data, timeRange }: CashflowAnalysisChartProps) {
  return (
    <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
      <AreaChart
        data={data}
        margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
      >
        <defs>
          <linearGradient id="colorReceitas" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="var(--chart-income)" stopOpacity={0.3}/>
            <stop offset="95%" stopColor="var(--chart-income)" stopOpacity={0}/>
          </linearGradient>
          <linearGradient id="colorDespesas" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="var(--chart-expense-neutral)" stopOpacity={0.3}/>
            <stop offset="95%" stopColor="var(--chart-expense-neutral)" stopOpacity={0}/>
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke={CHART_COLORS.grid} vertical={false} />
        <XAxis 
          dataKey={timeRange === 'this_month' || timeRange === 'last_month' ? 'day' : 'month'} 
          axisLine={false} 
          tickLine={false} 
          tick={{ fill: CHART_COLORS.textMuted, fontSize: 10 }}
          dy={10}
        />
        <YAxis 
          axisLine={false} 
          tickLine={false} 
          tick={{ fill: CHART_COLORS.textMuted, fontSize: 10 }}
          tickFormatter={(value) => value >= 1000 ? `${(value / 1000).toFixed(1)}k` : `${value}€`}
          width={55}
        />
        <Tooltip
          content={({ active, payload, label }) => {
            if (!active || !payload || payload.length === 0) return null;
            const receitas = payload.find(p => p.dataKey === 'receitas')?.value as number | undefined;
            const despesas = payload.find(p => p.dataKey === 'despesas')?.value as number | undefined;
            return (
              <div style={{
                background: 'rgba(15, 17, 24, 0.95)',
                backdropFilter: 'blur(8px)',
                border: '1px solid rgba(255, 255, 255, 0.06)',
                borderRadius: '12px',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
                padding: '12px 16px',
                color: '#e8eaed',
              }}>
                <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 6 }}>{label}</div>
                {receitas !== undefined && (
                  <div style={{ fontSize: 11, fontWeight: 500, color: 'var(--chart-income)' }}>
                    R: {Number(receitas).toFixed(0)} €
                  </div>
                )}
                {despesas !== undefined && (
                  <div style={{ fontSize: 11, fontWeight: 500, color: '#94a3b8' }}>
                    D: {Number(despesas).toFixed(0)} €
                  </div>
                )}
              </div>
            );
          }}
        />
        <Area 
          type="monotone" 
          dataKey="receitas" 
          stroke="var(--chart-income)" 
          strokeWidth={2}
          fillOpacity={1} 
          fill="url(#colorReceitas)" 
          name="Receitas"
          dot={false}
          activeDot={{ r: 4, stroke: 'var(--chart-income)', strokeWidth: 2, fill: 'var(--bg-surface-2)' }}
        />
        <Area 
          type="monotone" 
          dataKey="despesas" 
          stroke="var(--chart-expense-neutral)" 
          strokeWidth={2}
          fillOpacity={1} 
          fill="url(#colorDespesas)" 
          name="Despesas"
          dot={false}
          activeDot={{ r: 4, stroke: 'var(--chart-expense-neutral)', strokeWidth: 2, fill: 'var(--bg-surface-2)' }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
