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
import { formatCurrency } from '@/lib/utils';

interface AnnualIncomeProjectionChartProps {
  data: any[];
  tooltipStyle: any;
}

export default function AnnualIncomeProjectionChart({ data, tooltipStyle }: AnnualIncomeProjectionChartProps) {
  return (
    <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
      <AreaChart data={data}>
        <defs>
          <linearGradient id="currentYearGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={CHART_COLORS.trendPrimary} stopOpacity={0.25}/>
            <stop offset="45%" stopColor={CHART_COLORS.trendPrimary} stopOpacity={0.08}/>
            <stop offset="95%" stopColor={CHART_COLORS.trendPrimary} stopOpacity={0}/>
          </linearGradient>
          <linearGradient id="prevYearGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="var(--chart-trend-secondary)" stopOpacity={0.2}/>
            <stop offset="45%" stopColor="var(--chart-trend-secondary)" stopOpacity={0.06}/>
            <stop offset="95%" stopColor="var(--chart-trend-secondary)" stopOpacity={0}/>
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="1 1" stroke={CHART_COLORS.grid} vertical={false} />
        <XAxis 
          dataKey="month" 
          stroke={CHART_COLORS.textMuted} 
          fontSize={10} 
          tickLine={false} 
          axisLine={false} 
        />
        <YAxis 
          stroke={CHART_COLORS.textMuted} 
          fontSize={10} 
          tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} 
          tickLine={false} 
          axisLine={false}
          width={25}
        />
        <Tooltip 
          contentStyle={tooltipStyle}
          formatter={(value, name) => {
            if (name === 'currentYear') {
              return [formatCurrency(value as number), 'Ano Atual'];
            }
            if (name === 'prevYear') {
              return [formatCurrency(value as number), 'Ano Anterior'];
            }
            return [value, name];
          }}
          labelStyle={{ color: CHART_COLORS.text, marginBottom: '4px', textTransform: 'uppercase', fontSize: '10px' }}
        />
        <Area 
          type="monotone" 
          dataKey="currentYear" 
          stroke={CHART_COLORS.trendPrimary} 
          strokeWidth={1.5}
          fill="url(#currentYearGradient)" 
        />
        <Area 
          type="monotone" 
          dataKey="prevYear" 
          stroke="var(--chart-trend-secondary)" 
          strokeWidth={1}
          strokeDasharray="5 5"
          strokeOpacity={0.6}
          fill="url(#prevYearGradient)" 
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
