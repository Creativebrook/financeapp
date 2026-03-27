"use client";

import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import { CHART_COLORS } from '@/lib/theme';
import { formatCurrency, getCategoryColor } from '@/lib/utils';

// Custom tooltip for DESPESAS pie chart
const ExpensesPieTooltip = ({ active, payload, total }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const name = data.name;
    const value = data.value;
    const color = getCategoryColor(name);
    const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : '0';
    
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
        <div style={{ display: 'flex', flexDirection: 'column', paddingLeft: '20px' }}>
          <span style={{ color: CHART_COLORS.text, fontSize: '13px', fontWeight: 600 }}>
            {formatCurrency(Number(value) || 0)}
          </span>
          <span style={{ color: CHART_COLORS.textMuted, fontSize: '11px', fontWeight: 400, marginTop: '2px' }}>
            {percentage}% do total
          </span>
        </div>
      </div>
    );
  }
  return null;
};

interface DashboardExpensesDonutChartProps {
  data: any[];
  total: number;
  hoveredIndex: number | null;
  setHoveredIndex: (index: number | null) => void;
}

export default function DashboardExpensesDonutChart({ 
  data, 
  total, 
  hoveredIndex, 
  setHoveredIndex,
}: DashboardExpensesDonutChartProps) {
  const hoveredData = hoveredIndex !== null ? data[hoveredIndex] : null;
  const hoveredPercentage = hoveredData && total > 0 ? ((hoveredData.value / total) * 100).toFixed(1) : null;

  return (
    <ResponsiveContainer width="100%" height={280}>
      <PieChart>
        <defs>
          {data.map((entry, index) => (
            <linearGradient key={index} id={`gradient-${index}`} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor={getCategoryColor(entry.name)} stopOpacity={0.9} />
              <stop offset="100%" stopColor={getCategoryColor(entry.name)} stopOpacity={0.6} />
            </linearGradient>
          ))}
        </defs>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={55}
          outerRadius={110}
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
              fill={`url(#gradient-${index})`}
              style={{ opacity: hoveredIndex === null ? 1 : hoveredIndex === index ? 1 : 0.1, transition: 'opacity 0.3s ease' }}
            />
          ))}
        </Pie>
        {/* Central label with total expenses or hovered percentage */}
        <text
          x="50%"
          y="50%"
          textAnchor="middle"
          dominantBaseline="central"
          fill={CHART_COLORS.text}
        >
          {hoveredIndex !== null ? (
            <>
              <tspan x="50%" dy="-10" style={{ fontSize: '12px', fontWeight: 400, fill: CHART_COLORS.textMuted }}>{hoveredData.name}</tspan>
              <tspan x="50%" dy="24" style={{ fontSize: '20px', fontWeight: 700, fill: getCategoryColor(hoveredData.name) }}>{hoveredPercentage}%</tspan>
            </>
          ) : (
            <>
              <tspan x="50%" dy="-10" style={{ fontSize: '12px', fontWeight: 400, fill: CHART_COLORS.textMuted }}>Total</tspan>
              <tspan x="50%" dy="24" style={{ fontSize: '18px', fontWeight: 600 }}>{formatCurrency(total)}</tspan>
            </>
          )}
        </text>
        <Tooltip content={<ExpensesPieTooltip total={total} />} />
      </PieChart>
    </ResponsiveContainer>
  );
}
