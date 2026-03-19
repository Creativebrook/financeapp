"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import { CHART_COLORS } from '@/lib/theme';

interface IncomeVsExpensesBarChartProps {
  data: any[];
  isMobile: boolean;
}

export default function IncomeVsExpensesBarChart({ data, isMobile }: IncomeVsExpensesBarChartProps) {
  return (
    <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
      <BarChart data={data} barGap={4}>
        <defs>
          <linearGradient id="barReceitasGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#14b8a6" stopOpacity={1}/>
            <stop offset="100%" stopColor="#14b8a6" stopOpacity={0.7}/>
          </linearGradient>
          <linearGradient id="barDespesasGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#ef4444" stopOpacity={1}/>
            <stop offset="100%" stopColor="#ef4444" stopOpacity={0.7}/>
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="1 1" stroke={CHART_COLORS.grid} vertical={false} />
        <XAxis dataKey="month" stroke={CHART_COLORS.textMuted} fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => v.split(' ')[0]} />
        <YAxis stroke={CHART_COLORS.textMuted} fontSize={11} tickFormatter={(v) => `${(v/1000).toFixed(0)}k`} tickLine={false} axisLine={false} width={55} />
        <Tooltip 
          cursor={false}
          content={({ active, payload, label }) => {
            if (!active || !payload || payload.length === 0) return null;
            const receitas = payload.find(p => p.dataKey === 'income')?.value as number | undefined;
            const despesas = payload.find(p => p.dataKey === 'expenses')?.value as number | undefined;
            const saldo = receitas !== undefined && despesas !== undefined ? receitas - despesas : 0;
            const saldoColor = saldo >= 0 ? 'var(--success-400)' : 'var(--danger-400)';
            const saldoPrefix = saldo >= 0 ? '+' : '';
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
                  <div style={{ fontSize: 11, fontWeight: 500, color: '#14b8a6' }}>
                    Receita: +{Number(receitas).toFixed(0)} €
                  </div>
                )}
                {despesas !== undefined && (
                  <div style={{ fontSize: 11, fontWeight: 500, color: '#ef4444' }}>
                    Despesa: -{Number(despesas).toFixed(0)} €
                  </div>
                )}
                <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', marginTop: 6, paddingTop: 6 }} />
                <div style={{ fontSize: 11, fontWeight: 600, color: saldoColor, marginTop: 4 }}>
                  Saldo: {saldoPrefix}{Number(saldo).toFixed(0)} €
                </div>
              </div>
            );
          }}
        />
        <Bar 
          dataKey="income" 
          name="income"
          fill="url(#barReceitasGradient)" 
          barSize={isMobile ? 2 : undefined}
          radius={isMobile ? [1, 1, 0, 0] : [4, 4, 0, 0]}
          maxBarSize={32}
          activeBar={{ fill: '#14b8a6', fillOpacity: 0.9 }}
        />
        <Bar 
          dataKey="expenses" 
          name="expenses"
          fill="url(#barDespesasGradient)" 
          barSize={isMobile ? 2 : undefined}
          radius={isMobile ? [1, 1, 0, 0] : [4, 4, 0, 0]}
          maxBarSize={32}
          activeBar={{ fill: '#ef4444', fillOpacity: 0.9 }}
        />
        <ReferenceLine
          y={3750}
          stroke="var(--chart-trend-secondary)"
          strokeDasharray="10 8"
          label={(props) => {
            const { viewBox } = props;
            const media = 3750;
            const label = `${media.toLocaleString("pt-PT")} €`;
            const textWidth = label.length * 5.5;
            const paddingX = 4;
            const paddingY = 3;
            const x = viewBox.x + viewBox.width - 6;
            const y = viewBox.y;
            const boxHeight = 10 + paddingY * 2;

            return (
              <g>
                <rect
                  x={x - textWidth - paddingX * 2}
                  y={y - boxHeight / 2}
                  width={textWidth + paddingX * 2}
                  height={boxHeight}
                  rx={4}
                  fill="rgba(0,0,0,0.7)"
                  stroke="var(--border-strong)"
                />
                <text
                  x={x - paddingX}
                  y={y}
                  textAnchor="end"
                  fill="var(--warning-400)"
                  fontSize={10}
                  fontWeight={500}
                  dominantBaseline="middle"
                >
                  {label}
                </text>
              </g>
            );
          }}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}
