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
import { CHART_COLORS, getPieChartColor } from '@/lib/theme';
import { formatCurrency } from '@/lib/utils';

// Custom tooltip for Category bar chart
const CategoryBarTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const name = data.name;
    const value = data.value;
    const index = data.index;
    const color = getPieChartColor(index);
    
    return (
      <div style={{
        background: 'rgba(15, 17, 24, 0.95)',
        backdropFilter: 'blur(12px)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: '10px',
        padding: '10px 12px',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
          <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
          <span style={{ color: CHART_COLORS.text, fontSize: '12px', fontWeight: 500 }}>{name}</span>
        </div>
        <div style={{ color: CHART_COLORS.text, fontSize: '13px', fontWeight: 600, paddingLeft: '20px' }}>
          {formatCurrency(Number(value) || 0)}
        </div>
      </div>
    );
  }
  return null;
};

interface VariableExpensesCategoryBarChartProps {
  data: any[];
}

export default function VariableExpensesCategoryBarChart({ data }: VariableExpensesCategoryBarChartProps) {
  // Add index to data for color mapping and limit to top 6 to avoid clutter
  const chartData = data
    .sort((a, b) => b.value - a.value)
    .filter(item => item.value > 0)
    .slice(0, 6)
    .map((entry, index) => ({ ...entry, index }));

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        layout="vertical"
        data={chartData}
        margin={{ top: 5, right: 30, left: -20, bottom: 5 }}
        barSize={12}
      >
        <XAxis type="number" hide />
        <YAxis 
          dataKey="name" 
          type="category" 
          axisLine={false}
          tickLine={false}
          tick={{ fill: CHART_COLORS.textMuted, fontSize: 10 }}
          width={80}
        />
        <Tooltip content={<CategoryBarTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
        <Bar 
          dataKey="value" 
          radius={[0, 4, 4, 0]}
          animationDuration={1000}
        >
          {chartData.map((entry, index) => (
            <Cell 
              key={`cell-${index}`} 
              fill={getPieChartColor(entry.index)} 
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
