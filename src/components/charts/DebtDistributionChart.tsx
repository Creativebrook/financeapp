'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { getPieChartColor } from '@/lib/theme';
import { formatCurrency } from '@/lib/utils';

interface DebtDistributionChartProps {
  data: {
    name: string;
    value: number;
  }[];
  tooltipStyle?: any;
}

export default function DebtDistributionChart({ data, tooltipStyle }: DebtDistributionChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-slate-500 text-sm">
        Nenhuma dívida para exibir
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={80}
          paddingAngle={5}
          dataKey="value"
          stroke="none"
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={getPieChartColor(index)} />
          ))}
        </Pie>
        <Tooltip
          contentStyle={tooltipStyle || {
            backgroundColor: 'rgba(15, 23, 42, 0.9)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '8px',
            color: '#fff',
            fontSize: '12px'
          }}
          itemStyle={{ color: '#fff' }}
          formatter={(value: number) => [formatCurrency(value), 'Valor']}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
