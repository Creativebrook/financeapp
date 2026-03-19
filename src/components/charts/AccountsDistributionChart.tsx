"use client";

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
  if (active && payload && payload.length) {
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
          <span style={{ color: CHART_COLORS.text, fontSize: '12px', fontWeight: 500 }}>{name}</span>
        </div>
        <div style={{ color: CHART_COLORS.text, fontSize: '13px', fontWeight: 600, paddingLeft: '20px' }}>
          {formatCurrency(Number(value) || 0)} ({percent}%)
        </div>
      </div>
    );
  }
  return null;
};

export default function AccountsDistributionChart({ data }: AccountsDistributionChartProps) {
  return (
    <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={40}
          outerRadius={60}
          paddingAngle={2}
          dataKey="value"
          cornerRadius={4}
        >
          {data.map((entry, index) => (
            <Cell 
              key={`cell-${index}`} 
              fill={entry.color}
              stroke="transparent"
              style={{ filter: 'none', outline: 'none' }}
            />
          ))}
        </Pie>
        <Tooltip content={<AccountsPieTooltip />} />
      </PieChart>
    </ResponsiveContainer>
  );
}
