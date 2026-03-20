"use client";

import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import { getPieChartColor } from '@/lib/theme';

interface IncomeSourcesPieChartProps {
  data: any[];
  tooltipStyle: any;
}

export default function IncomeSourcesPieChart({ data, tooltipStyle }: IncomeSourcesPieChartProps) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={25}
          outerRadius={40}
          paddingAngle={5}
          dataKey="value"
          stroke="none"
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={getPieChartColor(index)} />
          ))}
        </Pie>
        <Tooltip 
          contentStyle={tooltipStyle}
          formatter={(value: number, name: string) => [`${value.toFixed(1)}%`, name]}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
