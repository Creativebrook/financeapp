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

// Custom tooltip for pie chart
const IncomePieTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0];
    const name = data.name;
    const value = data.value;
    const color = data.payload.fill;
    
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
          <span style={{ color: '#94a3b8', fontSize: '11px', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{name}</span>
        </div>
        <div style={{ color: '#f8fafc', fontSize: '14px', fontWeight: 600, paddingLeft: '18px' }}>
          {value.toFixed(1)}%
        </div>
      </div>
    );
  }
  return null;
};

export default function IncomeSourcesPieChart({ data, tooltipStyle }: IncomeSourcesPieChartProps) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={50}
          outerRadius={80}
          paddingAngle={5}
          dataKey="value"
          stroke="none"
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={getPieChartColor(index)} />
          ))}
        </Pie>
        <Tooltip content={<IncomePieTooltip />} />
      </PieChart>
    </ResponsiveContainer>
  );
}
