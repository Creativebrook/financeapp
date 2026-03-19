"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { CHART_COLORS } from '@/lib/theme';
import { getCategoryColor } from '@/lib/utils';

interface VariableExpensesCategoryChartProps {
  data: any[];
}

export default function VariableExpensesCategoryChart({ data }: VariableExpensesCategoryChartProps) {
  return (
    <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
      <BarChart data={data} layout="vertical" margin={{ left: 40, right: 20 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={CHART_COLORS.grid} horizontal={true} vertical={false} />
        <XAxis type="number" hide />
        <YAxis 
          dataKey="name" 
          type="category" 
          axisLine={false} 
          tickLine={false} 
          tick={{ fill: CHART_COLORS.textMuted, fontSize: 12 }}
          width={100}
        />
        <Tooltip 
          cursor={{ fill: 'rgba(255,255,255,0.05)' }}
          contentStyle={{ 
            background: '#1a1a24', 
            border: '1px solid #2d2d3a',
            borderRadius: '8px',
            color: '#f8fafc'
          }}
          formatter={(value: any) => [`${Number(value).toFixed(2)}€`, 'Total']}
        />
        <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={20}>
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={getCategoryColor(entry.name)} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
