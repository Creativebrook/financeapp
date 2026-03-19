"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { CHART_COLORS } from '@/lib/theme';
import { formatCurrency } from '@/lib/utils';

interface VariableExpensesDailyChartProps {
  data: any[];
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div style={{
        background: 'rgba(15, 17, 24, 0.95)',
        backdropFilter: 'blur(12px)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: '10px',
        padding: '10px 12px',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
      }}>
        <p style={{ color: CHART_COLORS.textMuted, fontSize: '10px', marginBottom: '4px' }}>Dia {label}</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {payload.map((entry: any, index: number) => (
            <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: entry.color }} />
              <span style={{ color: CHART_COLORS.text, fontSize: '12px', fontWeight: 500 }}>
                {entry.name === 'current' ? 'Este Mês: ' : 'Mês Passado: '}
                {formatCurrency(entry.value)}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return null;
};

const CustomLegend = () => {
  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'flex-end', 
      gap: '16px', 
      marginTop: '-10px',
      paddingRight: '10px'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'rgba(255, 255, 255, 0.1)' }} />
        <span style={{ color: CHART_COLORS.textMuted, fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Mês passado</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'rgba(59, 130, 246, 0.6)' }} />
        <span style={{ color: CHART_COLORS.textMuted, fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Este mês</span>
      </div>
    </div>
  );
};

export default function VariableExpensesDailyChart({ data }: VariableExpensesDailyChartProps) {
  return (
    <ResponsiveContainer width="100%" height={210}>
      <BarChart
        data={data}
        margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
        barSize={6}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
        <XAxis 
          dataKey="day" 
          axisLine={false}
          tickLine={false}
          tick={{ fill: CHART_COLORS.textMuted, fontSize: 10 }}
          ticks={[1, 5, 10, 15, 20, 25, 30]}
        />
        <YAxis 
          axisLine={false}
          tickLine={false}
          tick={{ fill: CHART_COLORS.textMuted, fontSize: 10 }}
          hide
        />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
        
        {/* Previous Month Bar (Gray) */}
        <Bar 
          name="previous"
          dataKey="previousValue" 
          stackId="a"
          fill="rgba(255, 255, 255, 0.1)"
          radius={[0, 0, 0, 0]}
          animationDuration={1500}
        />
        
        {/* Current Month Bar (Color) */}
        <Bar 
          name="current"
          dataKey="currentValue" 
          stackId="a"
          fill="rgba(59, 130, 246, 0.6)"
          radius={[2, 2, 0, 0]}
          animationDuration={1500}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}
