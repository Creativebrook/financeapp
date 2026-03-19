"use client";

import { useState } from 'react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import { CHART_COLORS, getPieChartColor } from '@/lib/theme';
import { formatCurrency } from '@/lib/utils';

// Custom tooltip for Top Expenses pie chart
const TopExpensesPieTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0];
    const name = data.name;
    const value = data.value;
    const index = data.payload.index;
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

interface VariableExpensesTopExpensesChartProps {
  data: any[];
  total: number;
}

export default function VariableExpensesTopExpensesChart({ data, total }: VariableExpensesTopExpensesChartProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  // Add index to data for color mapping
  const chartData = data.map((entry, index) => ({ ...entry, index }));

  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <defs>
          {chartData.map((entry, index) => (
            <linearGradient key={index} id={`top-exp-gradient-${index}`} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor={getPieChartColor(index)} stopOpacity={0.9} />
              <stop offset="100%" stopColor={getPieChartColor(index)} stopOpacity={0.6} />
            </linearGradient>
          ))}
        </defs>
        <Pie
          data={chartData}
          cx="50%"
          cy="50%"
          innerRadius={50}
          outerRadius={80}
          paddingAngle={2}
          cornerRadius={4}
          stroke="transparent"
          dataKey="value"
          onMouseEnter={(_, index) => setHoveredIndex(index)}
          onMouseLeave={() => setHoveredIndex(null)}
        >
          {chartData.map((entry, index) => (
            <Cell 
              key={`cell-${index}`} 
              fill={`url(#top-exp-gradient-${index})`}
              style={{ 
                opacity: hoveredIndex === null ? 1 : hoveredIndex === index ? 1 : 0.1, 
                transition: 'opacity 0.3s ease',
                cursor: 'pointer'
              }}
            />
          ))}
        </Pie>
        {/* Central label with total */}
        <text
          x="50%"
          y="50%"
          textAnchor="middle"
          dominantBaseline="central"
          fill={CHART_COLORS.text}
        >
          <tspan x="50%" dy="-8" style={{ fontSize: '11px', fontWeight: 400, fill: CHART_COLORS.textMuted }}>Total</tspan>
          <tspan x="50%" dy="20" style={{ fontSize: '16px', fontWeight: 600 }}>{formatCurrency(total)}</tspan>
        </text>
        <Tooltip content={<TopExpensesPieTooltip />} />
      </PieChart>
    </ResponsiveContainer>
  );
}
