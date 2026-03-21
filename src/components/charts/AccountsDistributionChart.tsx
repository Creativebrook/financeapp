"use client";

import { useState } from 'react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import { formatCurrency } from '@/lib/utils';
import { CHART_COLORS } from '@/lib/theme';

interface AccountsDistributionChartProps {
  data: any[];
}

// Custom tooltip for pie chart
const AccountsPieTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length && payload[0].payload) {
    const data = payload[0];
    const name = data.name;
    const value = data.value;
    const percent = data.payload.percent;
    const color = data.payload.color;
    
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
          <span style={{ color: CHART_COLORS.text, fontSize: '11px', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{name}</span>
        </div>
        <div style={{ color: CHART_COLORS.text, fontSize: '14px', fontWeight: 600, paddingLeft: '18px' }}>
          {formatCurrency(Number(value) || 0)} <span style={{ fontSize: '11px', color: CHART_COLORS.textMuted, fontWeight: 400, marginLeft: '4px' }}>({percent}%)</span>
        </div>
      </div>
    );
  }
  return null;
};

export default function AccountsDistributionChart({ data }: AccountsDistributionChartProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  return (
    <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
      <PieChart>
        <defs>
          {data.map((entry, index) => (
            <linearGradient key={index} id={`acc-pie-gradient-${index}`} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor={entry.color} stopOpacity={0.9} />
              <stop offset="100%" stopColor={entry.color} stopOpacity={0.6} />
            </linearGradient>
          ))}
        </defs>
        <Pie
          data={data}
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
          {data.map((entry, index) => (
            <Cell 
              key={`cell-${index}`} 
              fill={`url(#acc-pie-gradient-${index})`}
              style={{ 
                opacity: hoveredIndex === null ? 1 : hoveredIndex === index ? 1 : 0.1, 
                transition: 'opacity 0.3s ease',
                cursor: 'pointer'
              }}
            />
          ))}
        </Pie>
        <Tooltip content={<AccountsPieTooltip />} />
      </PieChart>
    </ResponsiveContainer>
  );
}
