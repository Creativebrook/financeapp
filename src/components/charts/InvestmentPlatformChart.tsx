"use client";

import {
  AreaChart,
  Area,
  ResponsiveContainer,
  YAxis,
} from 'recharts';

interface InvestmentPlatformChartProps {
  data: any[];
  chartDomain: [number, number];
  profitColor: string;
}

export default function InvestmentPlatformChart({ data, chartDomain, profitColor }: InvestmentPlatformChartProps) {
  return (
    <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
      <AreaChart data={data} margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
        <defs>
          <linearGradient id="platformGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={profitColor} stopOpacity={0.4} />
            <stop offset="100%" stopColor={profitColor} stopOpacity={0} />
          </linearGradient>
        </defs>
        <YAxis domain={chartDomain} hide />
        <Area 
          type="monotone" 
          dataKey="value" 
          stroke={profitColor} 
          strokeWidth={1}
          fill="url(#platformGradient)" 
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
