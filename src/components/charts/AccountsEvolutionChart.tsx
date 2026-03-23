"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { formatCurrency } from '@/lib/utils';
import { CHART_COLORS } from '@/lib/theme';

interface AccountsEvolutionChartProps {
  data: any[];
  accountNames: string[];
  colors: string[];
}

const EvolutionTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div style={{
        background: 'rgba(15, 17, 24, 0.95)',
        backdropFilter: 'blur(12px)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: '10px',
        padding: '10px 12px',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
      }}>
        <div style={{ color: CHART_COLORS.text, fontSize: '11px', fontWeight: 500, marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          {label}
        </div>
        <div className="space-y-2">
          {payload.map((entry: any, index: number) => (
            <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
              <span style={{ color: CHART_COLORS.textMuted, fontSize: '11px' }}>{entry.name}:</span>
              <span style={{ color: CHART_COLORS.text, fontSize: '12px', fontWeight: 600 }}>
                {formatCurrency(entry.value)}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return null;
};

export default function AccountsEvolutionChart({ data, accountNames, colors }: AccountsEvolutionChartProps) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        data={data}
        margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
        barGap={4}
      >
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.03)" />
        <XAxis 
          dataKey="month" 
          axisLine={false}
          tickLine={false}
          tick={{ fill: CHART_COLORS.textMuted, fontSize: 10 }}
          dy={10}
        />
        <YAxis 
          axisLine={false}
          tickLine={false}
          tick={{ fill: CHART_COLORS.textMuted, fontSize: 10 }}
        />
        <Tooltip content={<EvolutionTooltip />} cursor={{ fill: 'rgba(255,255,255,0.02)' }} />
        
        {accountNames.map((name, index) => (
          <Bar 
            key={name} 
            dataKey={name} 
            name={name}
            fill={colors[index % colors.length]}
            radius={[2, 2, 0, 0]}
            barSize={12}
          />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
}
