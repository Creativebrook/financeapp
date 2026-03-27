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

interface WealthEvolutionChartProps {
  data: any[];
  timeRange: string;
  tooltipStyle: any;
}

export default function WealthEvolutionChart({ data, timeRange, tooltipStyle }: WealthEvolutionChartProps) {
  return (
    <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
      <AreaChart data={data}>
        <defs>
          <linearGradient id="wealthGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={CHART_COLORS.trendPrimary} stopOpacity={0.25}/>
            <stop offset="45%" stopColor={CHART_COLORS.trendPrimary} stopOpacity={0.08}/>
            <stop offset="95%" stopColor={CHART_COLORS.trendPrimary} stopOpacity={0}/>
          </linearGradient>
          <linearGradient id="sp500Gradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="var(--chart-trend-secondary)" stopOpacity={0.2}/>
            <stop offset="45%" stopColor="var(--chart-trend-secondary)" stopOpacity={0.06}/>
            <stop offset="95%" stopColor="var(--chart-trend-secondary)" stopOpacity={0}/>
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="1 1" stroke={CHART_COLORS.grid} vertical={false} />
        <XAxis 
          dataKey={timeRange === 'this_month' || timeRange === 'last_month' ? 'day' : 'month'} 
          stroke={CHART_COLORS.textMuted} 
          fontSize={11} 
          tickLine={false} 
          axisLine={false} 
          tickFormatter={(v) => typeof v === 'string' ? v.split(' ')[0] : v}
        />
        <YAxis 
          stroke={CHART_COLORS.textMuted} 
          fontSize={11} 
          tickFormatter={(v) => `${v}%`} 
          tickLine={false} 
          axisLine={false}
          domain={['auto', 'auto']}
        />
        <Tooltip 
          contentStyle={tooltipStyle}
          formatter={(value, name, props) => {
            const payload = props?.payload;
            // Helper to format percentage with comma decimal separator
            const formatPct = (v: number) => {
              const formatted = new Intl.NumberFormat('pt-PT', {
                minimumFractionDigits: 1,
                maximumFractionDigits: 1,
              }).format(Math.abs(v));
              return (v >= 0 ? '+' : '-') + formatted;
            };
            if (name === 'sp500Pct') {
              const absValue = payload?.sp500 || 4100;
              return [`${formatCurrency(absValue)} (${formatPct(value as number)}%)`, 'S&P 500'];
            }
            if (name === 'wealthPct') {
              const absValue = payload?.wealth || 42000;
              return [`${formatCurrency(absValue)} (${formatPct(value as number)}%)`, 'Património'];
            }
            return [value, name];
          }}
          labelStyle={{ color: CHART_COLORS.text, marginBottom: '4px', textTransform: 'uppercase' }}
        />
        <Area 
          type="monotone" 
          dataKey="wealthPct" 
          stroke={CHART_COLORS.trendPrimary} 
          strokeWidth={1.5}
          fill="url(#wealthGradient)" 
        />
        <Area 
          type="monotone" 
          dataKey="sp500Pct" 
          stroke="var(--chart-trend-secondary)" 
          strokeWidth={1}
          strokeDasharray="5 5"
          strokeOpacity={0.6}
          fill="url(#sp500Gradient)" 
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
