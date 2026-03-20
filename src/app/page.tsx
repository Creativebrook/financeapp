"use client";

import { useState, useEffect, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { FinanceProvider, useFinance } from '@/context/FinanceContext';
import Sidebar from '@/components/Sidebar';
import { 
  Wallet, 
  TrendingUp, 
  CreditCard, 
  ArrowUpRight, 
  ArrowDownRight,
  RefreshCw,
  Calendar,
  PieChart as PieChartIcon,
  BarChart3,
  ArrowRight,
  ChevronDown,
  TrendingUp as TrendingUpIcon,
  Bell,
  Menu,
  X,
  Receipt,
  DollarSign,
  ArrowLeftRight,
  MoreHorizontal,
  Target,
  ChevronLeft,
  ChevronRight,
  ShoppingCart,
  Fuel,
  ShoppingBag,
  Banknote,
  Eye,
  HandCoins,
  PiggyBank,
  BanknoteArrowDown,
  ChartCandlestick,
  ReceiptEuro,
  Coins,
  ChartColumn
} from 'lucide-react';
import Link from 'next/link';
import { useSidebar } from '@/context/SidebarContext';
import { formatCurrency, formatPercentVariation, getPlatformColor, getCategoryColor, getNextPaymentDate, formatDate } from '@/lib/utils';
import { 
  CHART_COLORS as THEME_CHART,
  SEMANTIC_COLORS,
  PIE_CHART_PALETTE,
  CARD_ACCENTS,
  CHART_CONFIG,
  getPieChartColor,
  getCardAccent,
  FOUNDATION,
  BRAND
} from '@/lib/theme';

// Dynamic chart components
const CashflowAnalysisChart = dynamic(() => import('@/components/charts/CashflowAnalysisChart'), { ssr: false });
const WealthEvolutionChart = dynamic(() => import('@/components/charts/WealthEvolutionChart'), { ssr: false });
const IncomeVsExpensesBarChart = dynamic(() => import('@/components/charts/IncomeVsExpensesBarChart'), { ssr: false });
const DashboardExpensesDonutChart = dynamic(() => import('@/components/charts/DashboardExpensesDonutChart'), { ssr: false });
const InvestmentsDistributionPieChart = dynamic(() => import('@/components/charts/InvestmentsDistributionPieChart'), { ssr: false });

// Re-export theme chart colors for backward compatibility
const CHART_COLORS = {
  primary: 'var(--accent-primary)',
  primaryLight: 'rgba(111, 106, 248, 0.2)',
  primaryFade: 'rgba(111, 106, 248, 0.02)',
  success: 'var(--success-500)',
  successLight: 'rgba(34, 197, 139, 0.15)',
  danger: 'var(--danger-500)',
  dangerLight: 'rgba(224, 90, 111, 0.15)',
  warning: 'var(--warning-500)',
  warningLight: 'rgba(242, 184, 75, 0.15)',
  info: 'var(--info-500)',
  infoLight: 'rgba(91, 120, 199, 0.15)',
  grid: 'var(--border-subtle)',
  text: 'var(--text-secondary)',
  textMuted: 'var(--text-muted)',
};

const wealthEvolutionData = [
  { month: 'Abr 2025', wealth: 42000, wealthPct: 0, sp500: 4100, sp500Pct: 0 },
  { month: 'Mai 2025', wealth: 44500, wealthPct: 5.95, sp500: 4200, sp500Pct: 2.44 },
  { month: 'Jun 2025', wealth: 43200, wealthPct: 2.86, sp500: 4450, sp500Pct: 8.54 },
  { month: 'Jul 2025', wealth: 45800, wealthPct: 9.05, sp500: 4520, sp500Pct: 10.24 },
  { month: 'Ago 2025', wealth: 47200, wealthPct: 12.38, sp500: 4380, sp500Pct: 6.83 },
  { month: 'Set 2025', wealth: 46500, wealthPct: 10.71, sp500: 4280, sp500Pct: 4.39 },
  { month: 'Out 2025', wealth: 48900, wealthPct: 16.43, sp500: 4650, sp500Pct: 13.41 },
  { month: 'Nov 2025', wealth: 50200, wealthPct: 19.52, sp500: 4780, sp500Pct: 16.59 },
  { month: 'Dez 2025', wealth: 52800, wealthPct: 25.71, sp500: 4950, sp500Pct: 20.73 },
  { month: 'Jan 2026', wealth: 51500, wealthPct: 22.62, sp500: 5100, sp500Pct: 24.39 },
  { month: 'Fev 2026', wealth: 54100, wealthPct: 28.81, sp500: 5250, sp500Pct: 28.05 },
  { month: 'Mar 2026', wealth: 56800, wealthPct: 35.24, sp500: 5400, sp500Pct: 31.71 },
];

// Deterministic data generation using seeded values (no Math.random)
// Using Math.sin with index creates deterministic "pseudo-random" values
const deterministicSin = (x: number) => Math.abs(Math.sin(x * 9999) * 10000) % 1;
const deterministicCos = (x: number) => Math.abs(Math.cos(x * 9999) * 10000) % 1;

const incomeVsExpensesData = [
  { month: 'Abr', income: 4000, expenses: 3200, average: (4000 + 3200) / 2 },
  { month: 'Mai', income: 4000, expenses: 3400, average: (4000 + 3400) / 2 },
  { month: 'Jun', income: 4200, expenses: 3100, average: (4200 + 3100) / 2 },
  { month: 'Jul', income: 4000, expenses: 3500, average: (4000 + 3500) / 2 },
  { month: 'Ago', income: 4000, expenses: 3300, average: (4000 + 3300) / 2 },
  { month: 'Set', income: 4000, expenses: 3600, average: (4000 + 3600) / 2 },
  { month: 'Out', income: 4200, expenses: 3400, average: (4200 + 3400) / 2 },
  { month: 'Nov', income: 4000, expenses: 3800, average: (4000 + 3800) / 2 },
  { month: 'Dez', income: 4500, expenses: 4200, average: (4500 + 4200) / 2 },
  { month: 'Jan', income: 4000, expenses: 3300, average: (4000 + 3300) / 2 },
  { month: 'Fev', income: 4000, expenses: 3500, average: (4000 + 3500) / 2 },
  { month: 'Mar', income: 4000, expenses: 3400, average: (4000 + 3400) / 2 },
];

// Cashflow chart data with Portuguese naming
const cashflowChartData = incomeVsExpensesData.map(item => ({
  month: item.month,
  receitas: item.income,
  despesas: item.expenses,
}));

const tooltipStyle = {
  background: 'rgba(15, 17, 24, 0.95)',
  backdropFilter: 'blur(8px)',
  border: '1px solid rgba(255, 255, 255, 0.06)',
  borderRadius: '12px',
  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
  color: '#e8eaed',
};

// Time range options for wealth and cashflow charts
const TIME_RANGES = [
  { value: 'this_month', label: 'This month' },
  { value: 'last_month', label: 'Last month' },
  { value: 'this_year', label: 'This year' },
  { value: 'last_year', label: 'Last year' },
  { value: 'all', label: 'All time' },
];

/**
 * COMPONENTE: ActionButton (Botões de ação rápida no Hero Card)
 */
const ActionButton = ({ label, icon: Icon, onClick }: { label: string; icon: React.ElementType; onClick?: () => void }) => (
  <div className="group flex flex-col items-start gap-2" onClick={onClick}>
    <button 
      className="w-14 h-14 rounded-2xl bg-white/[0.03] border border-white/[0.08] flex items-center justify-center text-slate-400 transition-all duration-300 group-hover:bg-white/[0.1] group-hover:text-white group-hover:border-white/[0.2] shadow-sm cursor-pointer"
    >
      <Icon size={24} strokeWidth={0.7} />
    </button>
    <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest transition-colors group-hover:text-slate-300 ml-1">
      {label}
    </span>
  </div>
);

/**
 * COMPONENTE: BalanceCard (Visualização de saldo atual e comparação com mês anterior)
 */
const BalanceCard = ({ title, current, total, percentage, previousPercentage, onClick }: { title: string; current: number; total: number; percentage: number; previousPercentage: number; onClick?: () => void }) => {
  // Determine percentage color based on value (per user requirements)
  const getPercentageColor = (value: number) => {
    if (value >= 50) return 'var(--success-400)';
    if (value >= 20) return 'var(--warning-400)';
    return 'var(--danger-400)';
  };

  // Get the gradient color for progress bar (same as percentage color)
  const getBarGradient = (value: number) => {
    if (value >= 50) return 'linear-gradient(to right, var(--success-500), var(--success-400))'; // Green
    if (value >= 20) return 'linear-gradient(to right, var(--warning-500), var(--warning-400))'; // Yellow
    return 'linear-gradient(to right, var(--danger-500), var(--danger-400))'; // Red
  };

  // Get color for ESTE MÊS circle (based on percentage value)
  const getCurrentMonthColor = (value: number) => {
    if (value >= 50) return 'var(--success-400)';
    if (value >= 20) return 'var(--warning-400)';
    return 'var(--danger-400)';
  };

  const percentageColor = getPercentageColor(percentage);

  return (
    <div 
      onClick={onClick}
      style={{
        backgroundColor: 'var(--card-bg)',
        borderRadius: '8px',
        border: '1px solid var(--card-border)',
        padding: '24px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        height: '100%',
        cursor: onClick ? 'pointer' : 'default'
      }}
      className="group"
    >
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-white/[0.03] border border-white/[0.05] flex items-center justify-center">
            <PiggyBank size={16} className="text-slate-600" />
          </div>
          <p className="text-[10px] text-slate-500 uppercase tracking-[0.2em]">{title}</p>
        </div>
        <ArrowUpRight size={14} className="text-slate-700 group-hover:text-white" />
      </div>
      
      <div className="mt-2">
        <div className="flex items-baseline gap-2">
          <h4 className="text-2xl font-bold text-white tracking-tight">{formatCurrency(current)}</h4>
          <span className="kpi-delta" style={{ color: percentageColor, background: percentageColor ? `color-mix(in srgb, ${percentageColor} 14%, transparent)` : 'transparent' }}>{percentage}%</span>
          <span className="ml-auto text-[10px] text-slate-600 uppercase tracking-tighter">total: {formatCurrency(total)}</span>
        </div>
        <div className="w-full h-2 bg-white/[0.03] rounded-full mt-4 overflow-hidden border border-white/[0.02]">
          <div className="h-full rounded-full" style={{ 
            width: `${percentage}%`,
            background: getBarGradient(percentage)
          }}></div>
        </div>
        <div className="w-full h-1 bg-white/[0.03] rounded-full mt-2 overflow-hidden border border-white/[0.02]">
          <div className="h-full rounded-full" style={{ width: `${previousPercentage}%`, background: 'var(--slate-400)' }}></div>
        </div>
        <div className="flex justify-between items-center mt-2">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full" style={{ background: getCurrentMonthColor(percentage) }}></div>
            <span className="text-[9px] text-slate-400 uppercase tracking-wide">ESTE MÊS</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full" style={{ background: 'var(--slate-400)' }}></div>
            <span className="text-[9px] text-slate-400 uppercase tracking-wide">MÊS ANTERIOR</span>
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * COMPONENTE: AssetCard (Cartão de ativos com linha de tendência e gradiente)
 */
const AssetCard = ({ title, value, trend, color, icon: Icon, chartData, customChart, mobileChart }: {
  title: string;
  value: number;
  trend: number;
  color: 'emerald' | 'rose' | 'indigo';
  icon: React.ElementType;
  chartData: number[];
  customChart?: React.ReactNode;
  mobileChart?: React.ReactNode;
}) => {
  const isPositive = trend >= 0;
  const accentColor = color === 'emerald' ? 'var(--success-500)' : color === 'rose' ? 'var(--danger-500)' : 'var(--accent-primary)';
  const gradientId = `grad-${title.replace(/\s+/g, '-').toLowerCase()}`;

  // Generate smooth curved SVG path from chart data
  const generateChartPath = (data: number[]) => {
    if (data.length < 2) return '';
    
    const maxValue = Math.max(...data);
    const minValue = Math.min(...data);
    const valueRange = maxValue - minValue || 1;
    
    // Calculate points
    const points = data.map((value, index) => ({
      x: (index / (data.length - 1)) * 400,
      y: 100 - ((value - minValue) / valueRange) * 90 - 5
    }));
    
    // Generate smooth curve using cubic bezier
    let path = `M ${points[0].x} ${points[0].y}`;
    
    for (let i = 1; i < points.length; i++) {
      const prev = points[i - 1];
      const curr = points[i];
      const tension = 0.3;
      
      const cp1x = prev.x + (curr.x - prev.x) * tension;
      const cp1y = prev.y;
      const cp2x = curr.x - (curr.x - prev.x) * tension;
      const cp2y = curr.y;
      
      path += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${curr.x} ${curr.y}`;
    }
    
    return path;
  };

  // Get percentage color based on value (green for positive, red for negative)
  const getPercentageColor = (trendValue: number) => {
    if (trendValue >= 0) return 'var(--success-500)'; // Green for positive
    return 'var(--danger-500)'; // Red for negative
  };

  const chartPath = generateChartPath(chartData);

  return (
    <div style={{
      backgroundColor: 'var(--card-bg)',
      borderRadius: '8px',
      border: '1px solid var(--card-border)',
      padding: '24px',
      position: 'relative',
      overflow: 'hidden',
      transition: 'all 0.3s ease',
    }} className="group flex flex-col justify-between h-full">
      <div className="flex justify-between items-start mb-4 relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-white/[0.03] border border-white/[0.05] flex items-center justify-center">
            <Icon size={16} className="text-slate-600" />
          </div>
          <p className="text-[10px] text-slate-500 uppercase tracking-[0.2em]">{title}</p>
        </div>
        <ArrowUpRight size={14} className="text-slate-700 group-hover:text-white" />
      </div>

      <div className="mt-2 relative z-10" style={{ height: '56%' }}>
        <div className="flex items-baseline gap-2">
          <h4 className="text-2xl font-bold text-white tracking-tight">{formatCurrency(value)}</h4>
          <span className="kpi-delta" style={{ color: getPercentageColor(trend), background: `color-mix(in srgb, ${getPercentageColor(trend)} 14%, transparent)` }}>{formatPercentVariation(trend)}</span>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-24 pointer-events-none">
        {/* Mobile chart - shown only on mobile (hidden on md and above) */}
        {mobileChart && (
          <div className="md:hidden">
            {mobileChart}
          </div>
        )}
        {/* Desktop chart - shown on md and above, hidden on mobile */}
        <div className="hidden md:block">
          {customChart ? (
            customChart
          ) : (
            <svg viewBox="0 0 400 100" className="w-full h-full" preserveAspectRatio="none">
              <defs>
                <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={accentColor} stopOpacity="0.4" />
                  <stop offset="100%" stopColor={accentColor} stopOpacity="0" />
                </linearGradient>
              </defs>
              <path d={`${chartPath} L 400 100 L 0 100 Z`} fill={`url(#${gradientId})`} />
              <path d={chartPath} fill="none" stroke={accentColor} strokeWidth="3" strokeLinecap="round" />
            </svg>
          )}
        </div>
      </div>
    </div>
  );
};

const formatTooltipValue = (value: number | undefined, name: string) => {
  if (value === undefined) return ['', ''];
  return [formatCurrency(value), name === 'income' ? 'Rendimento' : name === 'expenses' ? 'Despesas' : name];
};

function DashboardContent() {
  const [timeRange, setTimeRange] = useState('this_year');
  const [cashflowTimeRange, setCashflowTimeRange] = useState('this_month');
  const [expensesTimeRange, setExpensesTimeRange] = useState('all_time');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isCashflowDropdownOpen, setIsCashflowDropdownOpen] = useState(false);
  const [isExpensesDropdownOpen, setIsExpensesDropdownOpen] = useState(false);
  const [expensesHoveredIndex, setExpensesHoveredIndex] = useState<number | null>(null);
  const [investmentsHoveredIndex, setInvestmentsHoveredIndex] = useState<number | null>(null);
  const { isCollapsed } = useSidebar();
  
  const { 
    accounts, 
    investments, 
    debts, 
    fixedExpenses, 
    variableExpenses, 
    income,
    getDashboardSummary,
    getPlatformSummaries,
    getExpensesByCategory,
    refreshPrices,
    transferFunds
  } = useFinance();
  
  const [refreshing, setRefreshing] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const { isMobileOpen, setIsMobileOpen } = useSidebar();
  const [activeCardIndex, setActiveCardIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  // Deterministic daily wealth data using useMemo
  const wealthEvolutionDailyData = useMemo(() => {
    const data = [];
    const baseWealthStart = 56800;
    const baseSp500Start = 5400;
    
    for (let i = 29; i >= 0; i--) {
      const day = 16 - i; // Fixed base date (Mar 16, 2026)
      const month = 'Mar';
      const year = 2026;
      // Use deterministic math (no random)
      const wealthValue = baseWealthStart + (29 - i) * 25 + deterministicSin(i) * 150;
      const sp500Value = baseSp500Start + (29 - i) * 8 + deterministicCos(i) * 50;
      const wealthPct = ((wealthValue - baseWealthStart) / baseWealthStart) * 100;
      const sp500Pct = ((sp500Value - baseSp500Start) / baseSp500Start) * 100;
      data.push({ 
        day: `${day} ${month} ${year}`,
        wealth: Math.round(wealthValue),
        wealthPct: Math.round(wealthPct * 100) / 100,
        sp500: Math.round(sp500Value),
        sp500Pct: Math.round(sp500Pct * 100) / 100
      });
    }
    return data;
  }, []);

  // Deterministic daily cashflow data using useMemo
  const cashflowDailyDataThisMonth = useMemo(() => {
    const data = [];
    const daysInMonth = 16; // Fixed for deterministic data
    
    for (let i = 0; i < daysInMonth; i++) {
      const day = i + 1;
      const month = 'Mar';
      // Use deterministic math (no random)
      const income = 4000 / daysInMonth * (0.9 + deterministicSin(i) * 0.2);
      const expenses = (3200 + deterministicCos(i) * 300 + deterministicSin(i + 100) * 200) / daysInMonth * (0.8 + deterministicCos(i + 100) * 0.4);
      data.push({
        day: `${day} ${month}`,
        receitas: Math.round(income),
        despesas: Math.round(expenses),
      });
    }
    return data;
  }, []);

  const cashflowDailyDataLastMonth = useMemo(() => {
    const data = [];
    const daysInMonth = 28; // February
    
    for (let i = 0; i < daysInMonth; i++) {
      const day = i + 1;
      const month = 'Fev';
      // Use deterministic math (no random)
      const income = 4000 / daysInMonth * (0.9 + deterministicSin(i + 50) * 0.2);
      const expenses = (3200 + deterministicCos(i + 50) * 300 + deterministicSin(i + 150) * 200) / daysInMonth * (0.8 + deterministicCos(i + 150) * 0.4);
      data.push({
        day: `${day} ${month}`,
        receitas: Math.round(income),
        despesas: Math.round(expenses),
      });
    }
    return data;
  }, []);

  // Detect mobile screen
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Filter data based on time range - using deterministic date
  const filterDataByRange = (data: { month: string; wealth: number; wealthPct: number; sp500?: number; sp500Pct?: number }[], range: string) => {
    const fixedDay = 16; // Fixed for deterministic SSR
    
    switch (range) {
      case 'this_month':
        return wealthEvolutionDailyData.slice(-fixedDay);
      case 'last_month':
        return wealthEvolutionDailyData.slice(-28 - fixedDay, -fixedDay);
      case 'this_year':
        return data;
      case 'last_year':
        return data.slice(0, 12);
      case 'all':
      default:
        return data;
    }
  };

  // Dynamic cards data based on accounts from context
  const cardsData = useMemo(() => {
    return accounts.map((account, index) => {
      // Find hardcoded transactions for these accounts if they match by name
      // This is a bit of a hack to keep the nice UI while making balances dynamic
      const hardcodedAccount = [
        { name: "Montepio", number: "1024 0606 1502 1979", transactions: [
          { name: 'Continente', date: '04 Mar 2026', amount: '-42,50', icon: 'ShoppingCart', type: 'Supermercado' },
          { name: 'Galp Telheiras', date: '03 Mar 2026', amount: '-65,00', icon: 'Fuel', type: 'Combustível' },
          { name: 'Zara Home', date: '01 Mar 2026', amount: '-129,99', icon: 'ShoppingBag', type: 'Vestuário' },
          { name: 'Levantamento ATM', date: '28 Fev 2026', amount: '-20,00', icon: 'Banknote', type: 'Dinheiro' },
        ]},
        { name: "Revolut", number: "5542 0012 9982 4431", transactions: [
          { name: 'Apple Store', date: '04 Mar 2026', amount: '-2.499,00', icon: 'ShoppingBag', type: 'Tecnologia' },
          { name: 'Amazon Prime', date: '02 Mar 2026', amount: '-4,99', icon: 'ShoppingCart', type: 'Serviços' },
          { name: 'Almoço Executivo', date: '01 Mar 2026', amount: '-35,50', icon: 'Banknote', type: 'Restauração' },
        ]},
        { name: "N26", number: "9876 5432 1098 7654", transactions: [
          { name: 'Netflix', date: '03 Mar 2026', amount: '-15,99', icon: 'ShoppingCart', type: 'Entretenimento' },
          { name: 'Spotify', date: '02 Mar 2026', amount: '-9,99', icon: 'ShoppingCart', type: 'Música' },
          { name: 'Uber', date: '01 Mar 2026', amount: '-12,50', icon: 'Banknote', type: 'Transporte' },
        ]},
        { name: "Montepio Crédito", number: "4111 1111 1111 1111", transactions: [
          { name: 'IKEA', date: '04 Mar 2026', amount: '-189,00', icon: 'ShoppingBag', type: 'Casa' },
          { name: 'CP - Comboios', date: '02 Mar 2026', amount: '-22,50', icon: 'Banknote', type: 'Transporte' },
          { name: 'Worten', date: '01 Mar 2026', amount: '-79,99', icon: 'ShoppingCart', type: 'Eletrónica' },
        ]},
        { name: "Cetelem Crédito", number: "5500 1234 5678 9010", transactions: [
          { name: 'Worten', date: '04 Mar 2026', amount: '-299,00', icon: 'ShoppingCart', type: 'Eletrónica' },
          { name: 'Fnac', date: '02 Mar 2026', amount: '-45,90', icon: 'ShoppingBag', type: 'Cultura' },
          { name: 'MediaMarkt', date: '01 Mar 2026', amount: '-159,00', icon: 'ShoppingCart', type: 'Eletrónica' },
        ]},
        { name: "Oney Crédito", number: "6011 1111 1111 1117", transactions: [
          { name: 'Leroy Merlin', date: '04 Mar 2026', amount: '-89,90', icon: 'ShoppingBag', type: 'Casa' },
          { name: 'Jumbo', date: '03 Mar 2026', amount: '-56,30', icon: 'ShoppingCart', type: 'Supermercado' },
          { name: 'Restaurante', date: '01 Mar 2026', amount: '-42,00', icon: 'Banknote', type: 'Restauração' },
        ]}
      ].find(h => account.nome.includes(h.name));

      return {
        id: account.id,
        name: account.nome,
        balance: account.saldo,
        number: hardcodedAccount?.number || account.iban || "**** **** **** " + account.id.slice(-4),
        cardAccent: getCardAccent(index),
        transactions: hardcodedAccount?.transactions || []
      };
    });
  }, [accounts]);

  const summary = getDashboardSummary();
  const platformSummaries = getPlatformSummaries();
  const expensesByCategory = getExpensesByCategory();

  // Filter data based on selected time range
  const filteredWealthData = filterDataByRange(wealthEvolutionData, timeRange);
  
  // Filter cashflow data based on selected time range (daily data for this/last month)
  const getFilteredCashflowData = () => {
    switch (cashflowTimeRange) {
      case 'this_month':
        return cashflowDailyDataThisMonth;
      case 'last_month':
        return cashflowDailyDataLastMonth;
      case 'this_year':
      case 'last_year':
      case 'all':
      default:
        return cashflowChartData;
    }
  };
  const filteredCashflowData = getFilteredCashflowData();
  
  // Calculate cashflow based on the selected time range
  const getCashflowForRange = () => {
    const data = filteredCashflowData;
    const totalReceitas = data.reduce((sum, item) => sum + item.receitas, 0);
    const totalDespesas = data.reduce((sum, item) => sum + item.despesas, 0);
    return totalReceitas - totalDespesas;
  };
  
  const cashflowValue = getCashflowForRange();
  
  // Calculate percentage change based on time range
  const getCashflowPercentage = () => {
    const data = filteredCashflowData;
    const totalReceitas = data.reduce((sum, item) => sum + item.receitas, 0);
    if (totalReceitas === 0) return 0;
    return Math.round((cashflowValue / totalReceitas) * 100);
  };
  
  const cashflowPercentage = getCashflowPercentage();
  
  const selectedRangeLabel = TIME_RANGES.find(r => r.value === timeRange)?.label || 'All time';
  const selectedExpensesRangeLabel = TIME_RANGES.find(r => r.value === expensesTimeRange)?.label || 'All time';

  // Filter variable expenses by time range
  const getFilteredExpensesByCategory = () => {
    // Use a fixed date for SSR to avoid hydration mismatch
    // In a real app, you'd update this in useEffect if needed
    const now = new Date('2026-03-20T00:00:00Z'); 
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();
    
    // Determine which time range to use based on data availability
    let effectiveTimeRange = expensesTimeRange;
    
    // If 'this_month' is selected, check if there's data - if not, fallback to 'last_month'
    if (expensesTimeRange === 'this_month') {
      const thisMonthData = variableExpenses.filter(expense => {
        if (!expense || !expense.data) return false;
        const expenseDate = new Date(expense.data);
        return expenseDate.getFullYear() === currentYear && expenseDate.getMonth() === currentMonth;
      });
      if (thisMonthData.length === 0) {
        effectiveTimeRange = 'last_month';
      }
    }
    
    const filtered = variableExpenses.filter(expense => {
      if (!expense || !expense.data) return false;
      const expenseDate = new Date(expense.data);
      
      switch (effectiveTimeRange) {
        case 'this_month':
          return expenseDate.getFullYear() === currentYear && expenseDate.getMonth() === currentMonth;
        case 'last_month':
          const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
          const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;
          return expenseDate.getFullYear() === lastMonthYear && expenseDate.getMonth() === lastMonth;
        case 'this_year':
          return expenseDate.getFullYear() === currentYear;
        case 'last_year':
          return expenseDate.getFullYear() === currentYear - 1;
        case 'all_time':
        default:
          return true;
      }
    });
    
    const categories: Record<string, number> = {};
    filtered.forEach(e => {
      categories[e.categoria] = (categories[e.categoria] || 0) + e.valor;
    });
    return categories;
  };

  const filteredExpensesByCategory = getFilteredExpensesByCategory();

  // Calculate total for percentage-based aggregation
  const totalExpenses = Object.values(filteredExpensesByCategory).reduce((sum, val) => sum + val, 0);
  const threshold = totalExpenses * 0.03; // 3% threshold

  // Sort entries by value descending and aggregate small categories
  const sortedEntries = Object.entries(filteredExpensesByCategory)
    .sort(([, a], [, b]) => b - a);

  const mainCategories: [string, number][] = [];
  let othersTotal = 0;

  sortedEntries.forEach(([name, value]) => {
    if (value >= threshold || mainCategories.length < 3) {
      mainCategories.push([name, value]);
    } else {
      othersTotal += value;
    }
  });

  // Add "Others" category if there are aggregated items
  const expensesPieData = mainCategories.map(([name, value]) => ({
    name,
    value,
  }));

  if (othersTotal > 0) {
    expensesPieData.push({ name: 'Outros', value: othersTotal });
  }

  const expensesTotal = expensesPieData.reduce((sum, item) => sum + item.value, 0);

  const platformPieData = platformSummaries.map(p => ({
    name: p.plataforma,
    value: p.totalValue,
  }));

  const handleRefresh = async () => {
    setRefreshing(true);
    await refreshPrices();
    setRefreshing(false);
  };

  const upcomingPayments = [
    ...fixedExpenses.map(e => ({
      type: 'fixed' as const,
      name: e.nome,
      amount: e.valor,
      date: getNextPaymentDate(e.data_pagamento),
    })),
    ...debts.map(d => ({
      type: 'debt' as const,
      name: d.nome,
      amount: d.prestacao_mensal,
      date: getNextPaymentDate(d.data_pagamento),
    })),
    ...income.map(i => ({
      type: 'income' as const,
      name: i.nome,
      amount: i.valor,
      date: getNextPaymentDate(i.data),
    })),
  ].sort((a, b) => a.date.getTime() - b.date.getTime()).slice(0, 5);

  return (
    <div className="app-container">
      <Sidebar />
      
      <main className={`main-content ${isCollapsed ? 'sidebar-collapsed' : ''}`}>
        {/* Premium Header - Desktop */}
        <header className="premium-header">
          <div className="premium-header-left">
            <Link href="/" className="premium-header-logo-link">
              <div className="premium-header-logo">
                <TrendingUpIcon size={20} strokeWidth={2.5} />
              </div>
            </Link>
            <div className="premium-header-info">
              <h1 className="premium-header-title">Finance 360º</h1>
              <p className="premium-header-subtitle">
                <span className="subtitle-label">Finance and portfolio overview</span>
              </p>
            </div>
          </div>
          <div className="premium-header-right">
            <button 
              className="premium-header-btn"
              onClick={handleRefresh}
              disabled={refreshing}
              title="Atualizar dados"
            >
              <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} />
            </button>
            <button 
              className="premium-header-btn"
              onClick={() => setShowNotifications(!showNotifications)}
              title="Notificações"
            >
              <Bell size={16} />
            </button>
          </div>
        </header>
        
        {/* Mobile Header */}
        <header className="mobile-header">
          <div className="mobile-header-left">
            <Link href="/" className="mobile-header-logo-link" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div className="mobile-header-logo">
                <TrendingUpIcon size={18} strokeWidth={2.5} />
              </div>
              <div className="mobile-header-info">
                <h1 className="mobile-header-title">Finance 360º</h1>
                <p className="mobile-header-subtitle">
                  <span className="subtitle-label">Finance and portfolio overview</span>
                </p>
              </div>
            </Link>
          </div>
          <div className="mobile-header-right">
            <button 
              className="mobile-header-btn"
              onClick={handleRefresh}
              disabled={refreshing}
              title="Atualizar dados"
            >
              <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
            </button>
            <button 
              className="mobile-header-btn"
              onClick={() => setShowNotifications(!showNotifications)}
              title="Notificações"
            >
              <Bell size={14} />
            </button>
            <button 
              className="mobile-header-btn"
              onClick={() => setIsMobileOpen(!isMobileOpen)}
              aria-label="Toggle menu"
            >
              {isMobileOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </header>
        


        {/* NOVO DASHBOARD LAYOUT - 2 COLUNAS */}
        <div className="flex flex-col xl:flex-row gap-8 items-stretch mt-[5%] xl:mt-0">
          
          {/* COLUNA ESQUERDA: HERO + GRID DE ATIVOS */}
          <div className="flex-[3] flex flex-col gap-8">
            
            <div className="grid grid-cols-12 gap-8 items-stretch">
              
              {/* HERO CARD */}
              <section 
                className="col-span-12 lg:col-span-4 rounded-md p-10 relative overflow-hidden flex flex-col justify-between shadow-2xl min-h-[480px]"
                style={{
                  background: `
                    radial-gradient(circle at top left, rgba(111,106,248,0.10), transparent 35%),
                    radial-gradient(circle at bottom right, rgba(83,167,167,0.12), transparent 40%),
                    linear-gradient(135deg, var(--card-hero-bg-start) 0%, var(--card-hero-bg-mid) 55%, var(--card-hero-bg-end) 100%)
                  `,
                  border: '1px solid var(--card-hero-border)',
                  boxShadow: '0 10px 30px rgba(0,0,0,0.28), 0 0 32px var(--card-hero-glow)'
                }}
              >

                
                {/* Bloco de Boas-vindas e Património */}
                <div>
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-white/[0.03] border border-white/[0.05] flex items-center justify-center">
                      <HandCoins size={16} className="text-slate-600" />
                    </div>
                    <p className="text-[10px] text-slate-500 uppercase tracking-[0.2em]">BALANÇO</p>
                  </div>
                  <div className="mt-8">
                    <h1 className="text-[3.25rem] font-medium text-white tracking-tighter leading-none">
                      {formatCurrency(summary.totalWealth)}
                    </h1>
                    <div className="flex items-center gap-3 mt-4">
                      <span className="kpi-delta kpi-delta-positive">+ 1,8%</span>
                      <p className="text-[10px] text-slate-600 font-bold tracking-tight uppercase">Últimos 30 dias</p>
                    </div>
                  </div>
                </div>

                {/* Ações Rápidas - Alinhamento Flex justify para margens iguais */}
                <div className="mt-12 pt-8 border-t border-white/[0.03] w-full">
                  <div className="flex flex-col gap-y-8">
                    {/* Linha 1 */}
                    <div className="flex justify-between items-start w-full">
                      <ActionButton label="CONTA" icon={Wallet} onClick={() => window.location.href = '/accounts'} />
                      <ActionButton label="INVEST." icon={ChartCandlestick} onClick={() => window.location.href = '/investments'} />
                      <ActionButton label="DÍVIDA" icon={BanknoteArrowDown} onClick={() => window.location.href = '/debts'} />
                    </div>
                    {/* Linha 2 */}
                    <div className="flex justify-between items-start w-full">
                      <ActionButton label="DESPESA" icon={ReceiptEuro} onClick={() => window.location.href = '/expenses/fixed'} />
                      <ActionButton label="RENDA" icon={Coins} onClick={() => window.location.href = '/income'} />
                      <ActionButton label="TRANSF." icon={ArrowLeftRight} onClick={() => setShowTransferModal(true)} />
                    </div>
                  </div>
                </div>
              </section>

              {/* CASHFLOW CARD */}
              <section 
                className="col-span-12 lg:col-span-8 rounded-md p-8 relative overflow-hidden flex flex-col shadow-xl min-h-[480px]"
                style={{
                  backgroundColor: 'var(--card-bg)',
                  borderRadius: '8px',
                  border: '1px solid var(--card-border)'
                }}
              >
                {/* Header with Title and Dropdown */}
                <div className="flex justify-between items-start mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-white/[0.03] border border-white/[0.05] flex items-center justify-center">
                      <Wallet size={16} className="text-slate-600" />
                    </div>
                    <p className="text-[10px] text-slate-500 uppercase tracking-[0.2em]">CASHFLOW</p>
                  </div>
                  {/* Time Range Dropdown */}
                  <div style={{ position: 'relative' }}>
                    <button
                      onClick={() => setIsCashflowDropdownOpen(!isCashflowDropdownOpen)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '6px 12px',
                        background: 'rgba(255, 255, 255, 0.04)',
                        border: '1px solid rgba(255, 255, 255, 0.08)',
                        borderRadius: '8px',
                        color: CHART_COLORS.text,
                        fontSize: '0.8125rem',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                      }}
                    >
                      {TIME_RANGES.find(r => r.value === cashflowTimeRange)?.label || 'This month'}
                      <ChevronDown size={14} />
                    </button>
                    {isCashflowDropdownOpen && (
                      <div
                        style={{
                          position: 'absolute',
                          top: '100%',
                          right: 0,
                          marginTop: '4px',
                          background: 'rgba(15, 17, 24, 0.95)',
                          backdropFilter: 'blur(12px)',
                          border: '1px solid rgba(255, 255, 255, 0.08)',
                          borderRadius: '10px',
                          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
                          overflow: 'hidden',
                          zIndex: 50,
                          minWidth: '160px',
                        }}
                      >
                        {TIME_RANGES.map((range) => (
                          <button
                            key={range.value}
                            onClick={() => {
                              setCashflowTimeRange(range.value);
                              setIsCashflowDropdownOpen(false);
                            }}
                            style={{
                              display: 'block',
                              width: '100%',
                              padding: '10px 14px',
                              background: cashflowTimeRange === range.value ? 'rgba(91, 95, 199, 0.12)' : 'transparent',
                              border: 'none',
                              color: cashflowTimeRange === range.value ? '#8186d4' : CHART_COLORS.text,
                              fontSize: '0.8125rem',
                              textAlign: 'left',
                              cursor: 'pointer',
                              transition: 'all 0.15s ease',
                            }}
                            onMouseEnter={(e) => {
                              if (cashflowTimeRange !== range.value) {
                                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.04)';
                              }
                            }}
                            onMouseLeave={(e) => {
                              if (cashflowTimeRange !== range.value) {
                                e.currentTarget.style.background = 'transparent';
                              }
                            }}
                          >
                            {range.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Value and Legend Row - Legend above chart */}
                <div className="flex justify-between items-end mb-4">
                  {/* Left: Value and Percentage */}
                  <div>
                    <span className="text-2xl font-bold text-white">{cashflowValue >= 0 ? '+' : ''}{formatCurrency(cashflowValue)}</span>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="kpi-delta kpi-delta-positive">{formatPercentVariation(cashflowPercentage)}</span>
                    </div>
                  </div>
                </div>

                {/* Legend above chart, aligned right */}
                <div className="flex justify-end gap-6 mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-[var(--chart-income)]"></div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Receitas</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-slate-600"></div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Despesas</span>
                  </div>
                </div>

                {/* Gráfico Linear Customizado */}
                <div className="flex-1 min-h-[200px]" style={{ minWidth: 0, minHeight: 0 }}>
                  <CashflowAnalysisChart data={filteredCashflowData as any[]} timeRange={cashflowTimeRange} />
                </div>
              </section>
            </div>

            {/* SECÇÃO INFERIOR: SALDO E ASSETS */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <BalanceCard 
                title="SALDO ATUAL"
                current={summary.monthlyCashflow}
                total={summary.monthlyIncome}
                percentage={Math.round((summary.monthlyCashflow / summary.monthlyIncome) * 100)}
                previousPercentage={Math.round((summary.monthlyCashflow / summary.monthlyIncome) * 100 * 0.85)}
                onClick={() => window.location.href = '/accounts'}
              />
              <div onClick={() => window.location.href = '/investments'} className="cursor-pointer">
                <AssetCard 
                  title="INVESTIMENTOS" 
                  value={summary.totalInvestments} 
                  trend={5.10} 
                  color="emerald" 
                  icon={ChartCandlestick} 
                  chartData={[80, 60, 70, 40, 50, 20]}
                  customChart={
                    <div className="absolute bottom-0 left-0 right-0 h-24 pointer-events-none">
                      <svg viewBox="0 0 400 100" className="w-full h-full" preserveAspectRatio="none">
                        <defs>
                          <linearGradient id="grad-investimentos" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="var(--success-500)" stopOpacity="0.4" />
                            <stop offset="100%" stopColor="var(--success-500)" stopOpacity="0" />
                          </linearGradient>
                        </defs>
                        <path d="M 0 75
                          C 24 75, 56 70, 80 70
                          C 104 70, 136 78, 160 78
                          C 184 78, 216 40, 240 40
                          C 264 40, 296 52, 320 52
                          C 344 52, 376 15, 400 18
                          L 400 100 L 0 100 Z" fill="url(#grad-investimentos)" />
                        <path d="M 0 75
                          C 24 75, 56 70, 80 70
                          C 104 70, 136 78, 160 78
                          C 184 78, 216 40, 240 40
                          C 264 40, 296 52, 320 52
                          C 344 52, 376 15, 400 18" fill="none" stroke="var(--success-500)" strokeWidth="1" strokeLinecap="round" />
                      </svg>
                    </div>
                  }
                  mobileChart={
                    <div className="absolute bottom-0 right-0 pointer-events-none">
                      <div className="absolute bottom-0 right-0 opacity-40 pointer-events-none">
                        <svg width="60" height="24" viewBox="0 0 64 24" fill="none" style={{
                          marginBottom: '25px',
                          marginRight: '25px',
                        }}>
                          <rect x="0" y="16" width="2" height="8" rx="1" fill="var(--success-500)"></rect>
                          <rect x="4" y="12" width="2" height="12" rx="1" fill="var(--success-500)"></rect>
                          <rect x="8" y="18" width="2" height="6" rx="1" fill="var(--success-500)"></rect>
                          <rect x="12" y="10" width="2" height="14" rx="1" fill="var(--success-500)"></rect>
                          <rect x="16" y="6" width="2" height="18" rx="1" fill="var(--success-500)"></rect>
                          <rect x="20" y="14" width="2" height="10" rx="1" fill="var(--success-500)"></rect>
                          <rect x="24" y="8" width="2" height="16" rx="1" fill="var(--success-500)"></rect>
                          <rect x="28" y="4" width="2" height="20" rx="1" fill="var(--success-500)"></rect>
                          <rect x="32" y="10" width="2" height="14" rx="1" fill="var(--success-500)"></rect>
                          <rect x="36" y="6" width="2" height="18" rx="1" fill="var(--success-500)"></rect>
                          <rect x="40" y="12" width="2" height="12" rx="1" fill="var(--success-500)"></rect>
                          <rect x="44" y="16" width="2" height="8" rx="1" fill="var(--success-500)"></rect>
                          <rect x="48" y="14" width="2" height="10" rx="1" fill="var(--success-500)"></rect>
                          <rect x="52" y="8" width="2" height="16" rx="1" fill="var(--success-500)"></rect>
                          <rect x="56" y="18" width="2" height="6" rx="1" fill="var(--success-500)"></rect>
                          <rect x="60" y="10" width="2" height="14" rx="1" fill="var(--success-500)"></rect>
                        </svg>
                      </div>
                    </div>
                  }
                />
              </div>
              <div onClick={() => window.location.href = '/debts'} className="cursor-pointer">
                <AssetCard 
                  title="DÍVIDAS TOTAIS" 
                  value={summary.totalDebts} 
                  trend={-2.01} 
                  color="rose" 
                  icon={BanknoteArrowDown} 
                  chartData={[20, 40, 60, 50, 80, 90]}
                  customChart={
                    <div className="hidden md:block">
                      <div className="absolute bottom-0 left-0 right-0 h-24 pointer-events-none">
                        <svg viewBox="0 0 400 100" className="w-full h-full" preserveAspectRatio="none">
                          <defs>
                            <linearGradient id="grad-dívidas-totais" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="var(--danger-500)" stopOpacity="0.35" />
                              <stop offset="100%" stopColor="var(--danger-500)" stopOpacity="0" />
                            </linearGradient>
                          </defs>

                          {/* Área */}
                          <path
                            d="M 0 25
                               C 40 35, 80 20, 120 40
                               C 160 60, 200 30, 240 55
                               C 280 80, 320 50, 360 85
                               C 380 95, 400 98, 400 98
                               L 400 100
                               L 0 100
                               Z"
                            fill="url(#grad-dívidas-totais)"
                          />

                          {/* Linha */}
                          <path
                            d="M 0 25
                               C 40 35, 80 20, 120 40
                               C 160 60, 200 30, 240 55
                               C 280 80, 320 50, 360 85
                               C 380 95, 400 98, 400 98"
                            fill="none"
                            stroke="var(--danger-500)"
                            strokeWidth="1"
                            strokeLinecap="round"
                          />
                        </svg>
                      </div>
                    </div>
                  }
                  mobileChart={
                    <div className="absolute bottom-0 right-0 pointer-events-none">
                      <div className="absolute bottom-0 right-0 opacity-40 pointer-events-none">
                        <svg width="60" height="24" viewBox="0 0 64 24" fill="none" style={{
                          marginBottom: '25px',
                          marginRight: '25px',
                        }}>
                          <rect x="0" y="16" width="2" height="8" rx="1" fill="var(--danger-500)"></rect>
                          <rect x="4" y="12" width="2" height="12" rx="1" fill="var(--danger-500)"></rect>
                          <rect x="8" y="18" width="2" height="6" rx="1" fill="var(--danger-500)"></rect>
                          <rect x="12" y="10" width="2" height="14" rx="1" fill="var(--danger-500)"></rect>
                          <rect x="16" y="6" width="2" height="18" rx="1" fill="var(--danger-500)"></rect>
                          <rect x="20" y="14" width="2" height="10" rx="1" fill="var(--danger-500)"></rect>
                          <rect x="24" y="8" width="2" height="16" rx="1" fill="var(--danger-500)"></rect>
                          <rect x="28" y="4" width="2" height="20" rx="1" fill="var(--danger-500)"></rect>
                          <rect x="32" y="10" width="2" height="14" rx="1" fill="var(--danger-500)"></rect>
                          <rect x="36" y="6" width="2" height="18" rx="1" fill="var(--danger-500)"></rect>
                          <rect x="40" y="12" width="2" height="12" rx="1" fill="var(--danger-500)"></rect>
                          <rect x="44" y="16" width="2" height="8" rx="1" fill="var(--danger-500)"></rect>
                          <rect x="48" y="14" width="2" height="10" rx="1" fill="var(--danger-500)"></rect>
                          <rect x="52" y="8" width="2" height="16" rx="1" fill="var(--danger-500)"></rect>
                          <rect x="56" y="18" width="2" height="6" rx="1" fill="var(--danger-500)"></rect>
                          <rect x="60" y="10" width="2" height="14" rx="1" fill="var(--danger-500)"></rect>
                        </svg>
                      </div>
                    </div>
                  }
                />
              </div>
            </div>
          </div>

          {/* COLUNA DIREITA: CARTOES E TRANSACÇÕES */}
          <div className="flex-1 min-w-full sm:min-w-[380px]">
            <div 
              className="rounded-md p-8 h-full flex flex-col shadow-2xl relative"
              style={{
                backgroundColor: 'var(--card-bg)',
                borderRadius: '8px',
                border: '1px solid var(--card-border)'
              }}
            >
              
              {/* Navegação de Cartões */}
              <div className="flex justify-between items-center mb-8">
                <div className="flex items-center gap-3"><div className="w-9 h-9 rounded-full bg-white/[0.03] border border-white/[0.05] flex items-center justify-center"><CreditCard size={16} className="text-slate-600" /></div><p className="text-[10px] text-slate-500 uppercase tracking-[0.2em]">OS MEUS CARTÕES</p></div>
                <div className="flex gap-2">
                   <button 
                    onClick={() => setActiveCardIndex(activeCardIndex === 0 ? cardsData.length - 1 : activeCardIndex - 1)}
                    className="w-8 h-8 rounded-full bg-white/[0.03] border border-white/[0.08] flex items-center justify-center text-slate-600 hover:text-white hover:bg-white/[0.1] transition-all"
                   >
                     <ChevronLeft size={16} />
                   </button>
                   <button 
                    onClick={() => setActiveCardIndex(activeCardIndex === cardsData.length - 1 ? 0 : activeCardIndex + 1)}
                    className="w-8 h-8 rounded-full bg-white/[0.03] border border-white/[0.08] flex items-center justify-center text-slate-600 hover:text-white hover:bg-white/[0.1] transition-all"
                   >
                     <ChevronRight size={16} />
                   </button>
                </div>
              </div>

              {/* Visual do Cartão Físico */}
              <div
                className="w-full aspect-[1.58/1] rounded-md p-7 pt-4 lg:pt-7 relative overflow-hidden mb-10 border-l-[3px] transition-all duration-500"
                style={{
                  backgroundColor: 'var(--bg-surface-2)',
                  borderLeftColor: `var(${cardsData[activeCardIndex].cardAccent})`,
                  backgroundImage: `linear-gradient(90deg, color-mix(in srgb, var(${cardsData[activeCardIndex].cardAccent}) 8%, transparent), transparent 40%)`,
                  boxShadow: `0 0 18px color-mix(in srgb, var(${cardsData[activeCardIndex].cardAccent}) 25%, transparent)`
                }}
              >
                <div className="flex justify-between items-start relative z-10">
                  <span className="text-white font-black italic text-2xl tracking-tighter opacity-90">{cardsData[activeCardIndex].name.split(' ')[0]}</span>
                </div>
                <div className="mt-4 relative z-10">
                  <p className="text-[10px] text-white/50 font-bold uppercase tracking-[0.2em]">{cardsData[activeCardIndex].name}</p>
                  <div className="flex items-center gap-3 mt-2">
                    <h4 className="text-3xl font-bold text-white tracking-tight">{formatCurrency(cardsData[activeCardIndex].balance)}</h4>
                    <Eye size={16} className="text-white/40 cursor-pointer hover:text-white/80 transition-colors" />
                  </div>
                </div>
                <div className="mt-auto pt-8 relative z-10">
                  <p className="text-base text-white/90 font-mono tracking-[0.3em]">{cardsData[activeCardIndex].number}</p>
                </div>
              </div>

              {/* Lista de Transacções */}
              <div className="flex-1 flex flex-col min-h-0">
                <div className="flex justify-between items-center mb-6">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Transações recentes</span>
                  <ArrowUpRight size={14} className="text-slate-700" />
                </div>

                <div className="flex-1 space-y-1 overflow-y-auto pr-0 custom-scrollbar">

                  {cardsData[activeCardIndex].transactions.map((tx, i) => (
                    <div 
                      key={i} 
                      onClick={() => window.location.href = '/expenses/variable'}
                      className="grid grid-cols-12 items-center py-4 px-0 border-b border-white/[0.03] last:border-0 group gradient-center rounded-2xl transition-all cursor-pointer"
                    >
                      <div className="col-span-8 flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-white/[0.03] border border-white/[0.05] flex items-center justify-center text-slate-600 group-hover:text-white group-hover:bg-white/[0.08] transition-all">
                          {tx.icon === 'ShoppingCart' && <ShoppingCart size={16} />}
                          {tx.icon === 'Fuel' && <Fuel size={16} />}
                          {tx.icon === 'ShoppingBag' && <ShoppingBag size={16} />}
                          {tx.icon === 'Banknote' && <Banknote size={16} />}
                        </div>
                        <div>
                          <p className="text-[13px] font-bold text-slate-300 group-hover:text-white transition-colors">{tx.name}</p>
                          <p className="text-[10px] text-slate-600 font-medium mt-0.5">{tx.type} • {tx.date}</p>
                        </div>
                      </div>
                      <span className="col-span-4 text-[13px] font-bold text-white text-right">{tx.amount} €</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Custom Scrollbar Styles */}
        <style dangerouslySetInnerHTML={{ __html: `
          .custom-scrollbar::-webkit-scrollbar { width: 4px; }
          .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
          .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.05); border-radius: 10px; }
        ` }} />

        {/* Charts Row */}
        <div style={{ marginTop: '32px' }}>
          {/* Wealth Evolution Chart - Elegant gradient */}
          <div className="card animate-fade-in" style={{ marginBottom: '32px' }}>
            <div className="card-header">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-white/[0.03] border border-white/[0.05] flex items-center justify-center">
                  <ChartColumn size={16} className="text-slate-600" />
                </div>
                <p className="text-[10px] text-slate-500 uppercase tracking-[0.2em]">EVOLUÇÃO</p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {/* Time Range Dropdown */}
                <div style={{ position: 'relative' }}>
                  <button
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '6px 12px',
                      background: 'rgba(255, 255, 255, 0.04)',
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                      borderRadius: '8px',
                      color: CHART_COLORS.text,
                      fontSize: '0.8125rem',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    {selectedRangeLabel}
                    <ChevronDown size={14} />
                  </button>
                  {isDropdownOpen && (
                    <div
                      style={{
                        position: 'absolute',
                        top: '100%',
                        right: 0,
                        marginTop: '4px',
                        background: 'rgba(15, 17, 24, 0.95)',
                        backdropFilter: 'blur(12px)',
                        border: '1px solid rgba(255, 255, 255, 0.08)',
                        borderRadius: '10px',
                        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
                        overflow: 'hidden',
                        zIndex: 50,
                        minWidth: '160px',
                      }}
                    >
                      {TIME_RANGES.map((range) => (
                        <button
                          key={range.value}
                          onClick={() => {
                            setTimeRange(range.value);
                            setIsDropdownOpen(false);
                          }}
                          style={{
                            display: 'block',
                            width: '100%',
                            padding: '10px 14px',
                            background: timeRange === range.value ? 'rgba(91, 95, 199, 0.12)' : 'transparent',
                            border: 'none',
                            color: timeRange === range.value ? '#8186d4' : CHART_COLORS.text,
                            fontSize: '0.8125rem',
                            textAlign: 'left',
                            cursor: 'pointer',
                            transition: 'all 0.15s ease',
                          }}
                          onMouseEnter={(e) => {
                            if (timeRange !== range.value) {
                              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.04)';
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (timeRange !== range.value) {
                              e.currentTarget.style.background = 'transparent';
                            }
                          }}
                        >
                          {range.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="chart-container" style={{ minWidth: 0, minHeight: 0 }}>
              <WealthEvolutionChart data={filteredWealthData as any[]} timeRange={timeRange} tooltipStyle={tooltipStyle} />
            </div>
          </div>
        </div>

        <div className="grid-2" style={{ marginTop: '32px' }}>
          {/* Income vs Expenses - Soft colors */}
          <div className="card animate-fade-in">
            <div className="card-header">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-white/[0.03] border border-white/[0.05] flex items-center justify-center">
                  <HandCoins size={16} className="text-slate-600" />
                </div>
                <p className="text-[10px] text-slate-500 uppercase tracking-[0.2em]">INCOME VS DESPESAS</p>
              </div>
            </div>
            <div className="flex justify-end mb-4">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: '#ef4444' }} />
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider">DESPESAS</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: '#14b8a6' }} />
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider">RECEITAS</span>
                </div>
              </div>
            </div>
            <div className="chart-container" style={{ minWidth: 0, minHeight: 0 }}>
              <IncomeVsExpensesBarChart data={incomeVsExpensesData} isMobile={isMobile} />
            </div>
          </div>

          {/* Expenses by Category - Elegant pie */}
          <div className="card animate-fade-in">
            <div className="card-header" style={{ justifyContent: 'space-between' }}>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-white/[0.03] border border-white/[0.05] flex items-center justify-center">
                  <ShoppingBag size={16} className="text-slate-600" />
                </div>
                <p className="text-[10px] text-slate-500 uppercase tracking-[0.2em]">DESPESAS</p>
              </div>
              <div style={{ position: 'relative' }}>
                <button
                  onClick={() => setIsExpensesDropdownOpen(!isExpensesDropdownOpen)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '6px 12px',
                    background: 'rgba(255, 255, 255, 0.04)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: '8px',
                    color: CHART_COLORS.text,
                    fontSize: '0.75rem',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {selectedExpensesRangeLabel}
                  <ChevronDown size={14} />
                </button>
                {isExpensesDropdownOpen && (
                  <div
                    style={{
                      position: 'absolute',
                      top: '100%',
                      right: 0,
                      marginTop: '4px',
                      background: 'rgba(15, 17, 24, 0.95)',
                      backdropFilter: 'blur(12px)',
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                      borderRadius: '10px',
                      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
                      overflow: 'hidden',
                      zIndex: 50,
                      minWidth: '160px',
                    }}
                  >
                    {TIME_RANGES.map((range) => (
                      <button
                        key={range.value}
                        onClick={() => {
                          setExpensesTimeRange(range.value);
                          setIsExpensesDropdownOpen(false);
                        }}
                        style={{
                          display: 'block',
                          width: '100%',
                          padding: '10px 14px',
                          background: expensesTimeRange === range.value ? 'rgba(91, 95, 199, 0.12)' : 'transparent',
                          border: 'none',
                          color: expensesTimeRange === range.value ? '#8186d4' : CHART_COLORS.text,
                          fontSize: '0.8125rem',
                          textAlign: 'left',
                          cursor: 'pointer',
                          transition: 'all 0.15s ease',
                        }}
                        onMouseEnter={(e) => {
                          if (expensesTimeRange !== range.value) {
                            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.04)';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (expensesTimeRange !== range.value) {
                            e.currentTarget.style.background = 'transparent';
                          }
                        }}
                      >
                        {range.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
            {/* Flex layout: chart left, legend right on desktop; stacked on mobile */}
            <div className="flex flex-col lg:flex-row items-center lg:items-center justify-center lg:justify-start gap-6 lg:gap-8 py-4 lg:py-8" style={{ minHeight: '280px', display: 'flex', alignItems: 'center' }}>
              {/* Donut Chart */}
              <div className="w-full" style={{ maxWidth: '360px', minHeight: '280px' }}>
                <DashboardExpensesDonutChart 
                  data={expensesPieData} 
                  total={expensesTotal} 
                  hoveredIndex={expensesHoveredIndex} 
                  setHoveredIndex={setExpensesHoveredIndex} 
                />
              </div>
              
              {/* Legend - below chart on mobile, right side on desktop */}
              <div className="flex-1 w-full">
                {/* Mobile: 2-column grid, Desktop: vertical list */}
                <div className="grid grid-cols-2 lg:flex lg:flex-col gap-2 lg:gap-3" style={{ paddingLeft: '8px' }}>
                  {expensesPieData.map((entry, index) => {
                    const percentage = expensesTotal > 0 ? ((entry.value / expensesTotal) * 100).toFixed(1) : '0';
                    const color = getCategoryColor(entry.name);
                    return (
                      <div key={index} className="flex items-center gap-2 lg:gap-3">
                        <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: color }}></span>
                        <span style={{ color: CHART_COLORS.text, fontSize: '12px', flex: 1 }}>{entry.name}</span>
                        <span style={{ color: CHART_COLORS.textMuted, fontSize: '11px', fontWeight: 500 }}>{percentage}%</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid-2" style={{ marginTop: '32px' }}>
          {/* Investment Distribution - Elegant pie */}
          <div className="card animate-fade-in">
            <div className="card-header">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-white/[0.03] border border-white/[0.05] flex items-center justify-center">
                  <ChartCandlestick size={18} className="text-slate-600" />
                </div>
                <p className="text-[10px] text-slate-500 uppercase tracking-[0.2em]">INVESTIMENTOS</p>
              </div>
            </div>
            {/* Flex layout: chart left, legend right on desktop; stacked on mobile - centered */}
            <div className="flex flex-col lg:flex-row items-center lg:items-center justify-center lg:justify-center gap-6 lg:gap-8 py-4 lg:py-8" style={{ minHeight: '280px', display: 'flex', alignItems: 'center' }}>
              {/* Donut Chart */}
              <div className="w-full" style={{ maxWidth: '360px', minHeight: '280px' }}>
                <InvestmentsDistributionPieChart 
                  data={platformPieData} 
                  total={summary.totalInvestments} 
                  hoveredIndex={investmentsHoveredIndex} 
                  setHoveredIndex={setInvestmentsHoveredIndex} 
                />
              </div>
              
              {/* Legend - below chart on mobile, right side on desktop */}
              <div className="flex-1 w-full">
                {/* Mobile: 2-column grid, Desktop: vertical list */}
                <div className="grid grid-cols-2 lg:flex lg:flex-col gap-2 lg:gap-3" style={{ paddingLeft: '8px' }}>
                  {platformPieData.map((entry, index) => {
                    const percentage = summary.totalInvestments > 0 ? ((entry.value / summary.totalInvestments) * 100).toFixed(1) : '0';
                    const color = getPlatformColor(entry.name);
                    return (
                      <div key={index} className="flex items-center gap-2 lg:gap-3">
                        <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: color }}></span>
                        <span style={{ color: CHART_COLORS.text, fontSize: '12px', flex: 1 }}>{entry.name}</span>
                        <span style={{ color: CHART_COLORS.textMuted, fontSize: '11px', fontWeight: 500 }}>{percentage}%</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Upcoming Payments - Subtle design */}
          <div className="card animate-fade-in">
            <div className="card-header">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-white/[0.03] border border-white/[0.05] flex items-center justify-center">
                  <Calendar size={16} className="text-slate-600" />
                </div>
                <p className="text-[10px] text-slate-500 uppercase tracking-[0.2em]">PRÓXIMOS PAGAMENTOS</p>
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {upcomingPayments.map((payment, index) => (
                <Link
                  key={index}
                  href={payment.type === 'income' ? '/income' : payment.type === 'debt' ? '/debts' : '/expenses/fixed'}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '14px 16px',
                    background: 'rgba(255, 255, 255, 0.02)',
                    borderRadius: '12px',
                    border: '1px solid rgba(255, 255, 255, 0.03)',
                    transition: 'all 0.2s ease',
                    cursor: 'pointer',
                    textDecoration: 'none',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.02)';
                    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.03)';
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 500, fontSize: '0.9375rem' }}>{payment.name}</div>
                    <div style={{ fontSize: '0.75rem', color: CHART_COLORS.textMuted }}>
                      {formatDate(payment.date.toISOString())}
                    </div>
                  </div>
                  <div style={{ 
                    fontWeight: 500,
                    fontSize: '0.9375rem',
                    color: payment.type === 'income' ? CHART_COLORS.success : 
                           payment.type === 'debt' ? CHART_COLORS.danger : CHART_COLORS.warning
                  }}>
                    {payment.type === 'income' ? '+' : '-'}{formatCurrency(payment.amount)}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Quick Links - Clean cards */}
        <div style={{ marginTop: '32px' }}>
          <h3 style={{ marginBottom: '20px', color: CHART_COLORS.text, fontWeight: 500 }}>Acesso Rápido</h3>
          <div className="stats-grid">
            <Link href="/accounts" className="card" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontWeight: 600, marginBottom: '4px', fontSize: '1rem' }}>Contas Bancárias</div>
                <div style={{ fontSize: '0.8125rem', color: CHART_COLORS.textMuted }}>{accounts.length} contas</div>
              </div>
              <ArrowRight size={18} style={{ color: CHART_COLORS.primary }} />
            </Link>
            
            <Link href="/investments" className="card" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontWeight: 600, marginBottom: '4px', fontSize: '1rem' }}>Investimentos</div>
                <div style={{ fontSize: '0.8125rem', color: CHART_COLORS.textMuted }}>{investments.length} ativos</div>
              </div>
              <ArrowRight size={18} style={{ color: CHART_COLORS.primary }} />
            </Link>
            
            <Link href="/debts" className="card" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontWeight: 600, marginBottom: '4px', fontSize: '1rem' }}>Dívidas</div>
                <div style={{ fontSize: '0.8125rem', color: CHART_COLORS.textMuted }}>{debts.length} ativas</div>
              </div>
              <ArrowRight size={18} style={{ color: CHART_COLORS.primary }} />
            </Link>
            
            <Link href="/calendar" className="card" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontWeight: 600, marginBottom: '4px', fontSize: '1rem' }}>Calendário Financeiro</div>
                <div style={{ fontSize: '0.8125rem', color: CHART_COLORS.textMuted }}>Ver agenda completa</div>
              </div>
              <ArrowRight size={18} style={{ color: CHART_COLORS.primary }} />
            </Link>
          </div>
        </div>
      </main>

      {/* Transfer Modal */}
      {showTransferModal && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
          }}
          onClick={() => setShowTransferModal(false)}
        >
          <div 
            style={{
              backgroundColor: 'var(--card-bg)',
              borderRadius: '12px',
              border: '1px solid var(--card-border)',
              padding: '24px',
              width: '90%',
              maxWidth: '400px',
              boxShadow: '0 16px 48px rgba(0,0,0,0.5)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-6">
              <h3 style={{ color: 'var(--text-primary)', fontSize: '1.125rem', fontWeight: 600 }}>Transferência</h3>
              <button 
                onClick={() => setShowTransferModal(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}
              >
                <X size={20} style={{ color: 'var(--text-muted)' }} />
              </button>
            </div>
            
            <div className="flex flex-col gap-4">
              <div>
                <label style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>De</label>
                <select 
                  id="fromAccount"
                  style={{
                    width: '100%',
                    marginTop: '8px',
                    padding: '12px',
                    backgroundColor: 'var(--bg-surface-2)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: '8px',
                    color: 'var(--text-primary)',
                    fontSize: '0.875rem',
                  }}
                >
                  <option value="">Selecionar conta origem</option>
                  {accounts.map((account) => (
                    <option key={account.id} value={account.id}>
                      {account.nome} - {formatCurrency(account.saldo)}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="flex justify-center">
                <ArrowDownRight size={20} style={{ color: 'var(--text-muted)' }} />
              </div>
              
              <div>
                <label style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Para</label>
                <select 
                  id="toAccount"
                  style={{
                    width: '100%',
                    marginTop: '8px',
                    padding: '12px',
                    backgroundColor: 'var(--bg-surface-2)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: '8px',
                    color: 'var(--text-primary)',
                    fontSize: '0.875rem',
                  }}
                >
                  <option value="">Selecionar conta destino</option>
                  {accounts.map((account) => (
                    <option key={account.id} value={account.id}>
                      {account.nome} - {formatCurrency(account.saldo)}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Valor</label>
                <input 
                  type="number"
                  id="transferAmount"
                  placeholder="0,00 €"
                  style={{
                    width: '100%',
                    marginTop: '8px',
                    padding: '12px',
                    backgroundColor: 'var(--bg-surface-2)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: '8px',
                    color: 'var(--text-primary)',
                    fontSize: '0.875rem',
                  }}
                />
              </div>
              
              <button 
                onClick={() => {
                  const fromAccountId = (document.getElementById('fromAccount') as HTMLSelectElement).value;
                  const toAccountId = (document.getElementById('toAccount') as HTMLSelectElement).value;
                  const amount = parseFloat((document.getElementById('transferAmount') as HTMLInputElement).value);
                  
                  if (!fromAccountId || !toAccountId || !amount || amount <= 0) {
                    // Using a simple alert for now as it's a quick action, 
                    // but in a real app we'd use a toast or inline error
                    return;
                  }
                  
                  if (fromAccountId === toAccountId) {
                    return;
                  }
                  
                  transferFunds(fromAccountId, toAccountId, amount);
                  setShowTransferModal(false);
                }}
                style={{
                  marginTop: '16px',
                  padding: '14px',
                  backgroundColor: 'var(--accent-primary)',
                  border: 'none',
                  borderRadius: '8px',
                  color: 'white',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'background-color 0.2s',
                }}
                onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'var(--accent-primary-hover)'}
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'var(--accent-primary)'}
              >
                Transferir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function Home() {
  return (
    <FinanceProvider>
      <DashboardContent />
    </FinanceProvider>
  );
}
