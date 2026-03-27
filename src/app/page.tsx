"use client";

import { useState, useEffect, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { FinanceProvider, useFinance } from '@/context/FinanceContext';
import Sidebar from '@/components/Sidebar';
import PremiumHeader from '@/components/PremiumHeader';
import { 
  Wallet, 
  TrendingUp, 
  CreditCard, 
  ArrowUpRight, 
  ArrowDownRight,
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

// Deterministic data generation using seeded values (no Math.random)
// Using Math.sin with index creates deterministic "pseudo-random" values
const deterministicSin = (x: number) => Math.abs(Math.sin(x * 9999) * 10000) % 1;
const deterministicCos = (x: number) => Math.abs(Math.cos(x * 9999) * 10000) % 1;

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
    transferFunds,
    selectedMonth
  } = useFinance();
  
  const [refreshing, setRefreshing] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const { isMobileOpen, setIsMobileOpen } = useSidebar();
  const [activeCardIndex, setActiveCardIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  // Real daily wealth data based on selectedMonth
  const wealthEvolutionDailyData = useMemo(() => {
    const [year, month] = selectedMonth.split('-').map(Number);
    const daysInMonth = new Date(year, month, 0).getDate();
    const data = [];
    
    const monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    const monthName = monthNames[month - 1];

    const initialTotalSaldo = accounts.reduce((sum, acc) => sum + acc.saldo, 0);
    const totalInvestments = investments.reduce((sum, inv) => sum + inv.valor_atual, 0);
    const baseWealth = initialTotalSaldo + totalInvestments;

    let cumulativeIncome = 0;
    let cumulativeExpenses = 0;

    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
      
      const dayIncome = income
        .filter(inc => {
          if (inc.frequencia === 'mensal') return inc.data === day && (!inc.data_inicio || inc.data_inicio <= dateStr);
          if (inc.frequencia === 'unico') return inc.data_especifica === dateStr;
          return false;
        })
        .reduce((sum, inc) => sum + inc.valor, 0);

      const dayExpenses = variableExpenses
        .filter(exp => exp.data === dateStr && exp.categoria !== 'Investimento' && exp.categoria !== 'Transferência')
        .reduce((sum, exp) => sum + exp.valor, 0);

      cumulativeIncome += dayIncome;
      cumulativeExpenses += dayExpenses;

      const currentWealth = baseWealth + cumulativeIncome - cumulativeExpenses;
      const wealthPct = ((currentWealth - baseWealth) / baseWealth) * 100;

      // Mock S&P 500 for comparison
      const sp500Value = 5400 + (day * 5) + deterministicCos(day) * 30;
      const sp500Pct = ((sp500Value - 5400) / 5400) * 100;

      data.push({
        day: `${day} ${monthName}`,
        wealth: Math.round(currentWealth),
        wealthPct: Math.round(wealthPct * 100) / 100,
        sp500: Math.round(sp500Value),
        sp500Pct: Math.round(sp500Pct * 100) / 100,
      });
    }
    return data;
  }, [selectedMonth, accounts, investments, income, variableExpenses]);

  // Real daily cashflow data based on selectedMonth
  const cashflowDailyData = useMemo(() => {
    const [year, month] = selectedMonth.split('-').map(Number);
    const daysInMonth = new Date(year, month, 0).getDate();
    const data = [];
    
    const monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    const monthName = monthNames[month - 1];

    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
      
      const dayIncome = income
        .filter(inc => {
          if (inc.frequencia === 'mensal') return inc.data === day && (!inc.data_inicio || inc.data_inicio <= dateStr);
          if (inc.frequencia === 'unico') return inc.data_especifica === dateStr;
          return false;
        })
        .reduce((sum, inc) => sum + inc.valor, 0);

      const dayExpenses = variableExpenses
        .filter(exp => exp.data === dateStr && exp.categoria !== 'Investimento' && exp.categoria !== 'Transferência')
        .reduce((sum, exp) => sum + exp.valor, 0);

      data.push({
        day: `${day} ${monthName}`,
        receitas: dayIncome,
        despesas: dayExpenses,
      });
    }
    return data;
  }, [selectedMonth, income, variableExpenses]);

  // Detect mobile screen
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Calculate real-time balances for accounts (matching the logic in /accounts page)
  const accountBalances = useMemo(() => {
    const now = new Date('2026-03-26T00:00:00Z');
    const currentDay = now.getDate();
    const selectedMonth = '2026-03';
    
    return accounts.map(account => {
      const accIncomeSoFar = income
        .filter(inc => inc.conta === account.nome)
        .filter(i => {
          if (i.frequencia === 'mensal') {
            if (i.data_inicio && i.data_inicio > `${selectedMonth}-31`) return false;
            return i.data <= currentDay;
          }
          if (i.frequencia === 'unico' && i.data_especifica && i.data_especifica.startsWith(selectedMonth)) {
            if (i.nome.toLowerCase().includes('transportado')) return false;
            const day = parseInt(i.data_especifica.split('-')[2]);
            return day <= currentDay;
          }
          return false;
        })
        .reduce((sum, inc) => sum + inc.valor, 0);

      const accVariable = variableExpenses
        .filter(exp => exp && exp.conta === account.nome && exp.data && exp.data.startsWith(selectedMonth))
        .filter(exp => {
          const day = parseInt(exp.data.split('-')[2]);
          return day <= currentDay;
        })
        .reduce((sum, exp) => sum + exp.valor, 0);
        
      const realTimeBalance = account.saldo + accIncomeSoFar - accVariable;

      return {
        ...account,
        realTimeBalance
      };
    });
  }, [accounts, income, variableExpenses]);

  // Dynamic cards data based on accounts and credit cards from debts
  const cardsData = useMemo(() => {
    const accountCards = accountBalances.map((account, index) => {
      // Get real transactions for this account (including income)
      const accountTransactions = [
        ...variableExpenses.filter(exp => exp.conta === account.nome).map(e => ({ ...e, type: 'expense' })),
        ...income.filter(inc => inc.conta === account.nome && inc.data_especifica).map(i => ({ ...i, data: i.data_especifica as string, type: 'income', categoria: 'Rendimento' }))
      ]
        .sort((a, b) => new Date(b.data as string).getTime() - new Date(a.data as string).getTime())
        .slice(0, 4)
        .map(tx => ({
          name: tx.nome,
          date: new Date(tx.data as string).toLocaleDateString('pt-PT', { day: '2-digit', month: 'short' }),
          amount: (tx.type === 'income' ? '+' : '-') + tx.valor.toLocaleString('pt-PT', { minimumFractionDigits: 2 }),
          icon: tx.categoria === 'Supermercado' ? 'ShoppingCart' : 
                tx.categoria === 'Combustivel' ? 'Fuel' : 
                tx.categoria === 'Shopping' ? 'ShoppingBag' : 'Banknote',
          type: tx.categoria
        }));

      const hardcodedNumbers: Record<string, string> = {
        "Montepio": "1024 0606 1502 1979",
        "Revolut": "5542 0012 9982 4431",
        "N26": "9876 5432 1098 7654"
      };

      return {
        id: account.id,
        name: account.nome,
        balance: account.realTimeBalance,
        number: hardcodedNumbers[account.nome] || account.iban || "**** **** **** " + account.id.slice(-4),
        cardAccent: getCardAccent(index),
        transactions: accountTransactions
      };
    });

    const creditCards = debts
      .filter(debt => debt.categoria === 'Cartão de Crédito')
      .map((debt, index) => {
        // Get real transactions for this credit card (if any in variableExpenses)
        const cardTransactions = variableExpenses
          .filter(exp => exp.conta === debt.nome)
          .sort((a, b) => new Date(b.data as string).getTime() - new Date(a.data as string).getTime())
          .slice(0, 4)
          .map(tx => ({
            name: tx.nome,
            date: new Date(tx.data as string).toLocaleDateString('pt-PT', { day: '2-digit', month: 'short' }),
            amount: '-' + tx.valor.toLocaleString('pt-PT', { minimumFractionDigits: 2 }),
            icon: tx.categoria === 'Supermercado' ? 'ShoppingCart' : 
                  tx.categoria === 'Combustivel' ? 'Fuel' : 
                  tx.categoria === 'Shopping' ? 'ShoppingBag' : 'Banknote',
            type: tx.categoria
          }));

        const hardcodedNumbers: Record<string, string> = {
          "Cartão de Crédito Montepio": "4111 1111 1111 1111",
          "Cartão de Crédito Cetelem": "5500 1234 5678 9010",
          "Cartão Oney": "6011 1111 1111 1117"
        };

        const cardBalance = debt.valor_total;

        return {
          id: debt.id,
          name: debt.nome,
          balance: cardBalance,
          number: hardcodedNumbers[debt.nome] || "**** **** **** " + debt.id.slice(-4),
          cardAccent: getCardAccent(accounts.length + index),
          transactions: cardTransactions
        };
      });

    return [...accountCards, ...creditCards];
  }, [accountBalances, debts, accounts.length, variableExpenses, income]);

  const summary = getDashboardSummary();
  const platformSummaries = getPlatformSummaries();
  const expensesByCategory = getExpensesByCategory();

  // Filter data based on selected month
  const filteredCashflowData = cashflowDailyData;
  const mappedIncomeVsExpensesData = cashflowDailyData.map(item => ({
    month: item.day,
    income: item.receitas,
    expenses: item.despesas,
  }));
  const cashflowValue = summary.monthlyCashflow;
  const cashflowPercentage = summary.monthlyIncome > 0 ? Math.round((summary.monthlyCashflow / summary.monthlyIncome) * 100) : 0;

  // Filter variable expenses by selected month
  const getFilteredExpensesByCategory = () => {
    // Use the selected month from context
    const [selectedYear, selectedMonthIdx] = selectedMonth.split('-').map(Number);
    const currentYear = selectedYear;
    const currentMonth = selectedMonthIdx - 1;
    
    const filtered = variableExpenses.filter(expense => {
      if (!expense || !expense.data) return false;
      const expenseDate = new Date(expense.data);
      return expenseDate.getFullYear() === currentYear && expenseDate.getMonth() === currentMonth;
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
    ...fixedExpenses.filter(e => e && e.nome).map(e => ({
      type: 'fixed' as const,
      name: e.nome,
      amount: e.valor,
      date: getNextPaymentDate(e.data_pagamento),
    })),
    ...debts.filter(d => d && d.nome).map(d => ({
      type: 'debt' as const,
      name: d.nome,
      amount: d.prestacao_mensal,
      date: getNextPaymentDate(d.data_pagamento),
    })),
    ...income.filter(i => i && i.nome).map(i => ({
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
        <PremiumHeader />
        
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
                    <p className="text-[10px] text-slate-500 uppercase tracking-[0.2em]">PATRIMÓNIO</p>
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
                {/* Header with Title */}
                <div className="flex justify-between items-start mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-white/[0.03] border border-white/[0.05] flex items-center justify-center">
                      <Wallet size={16} className="text-slate-600" />
                    </div>
                    <p className="text-[10px] text-slate-500 uppercase tracking-[0.2em]">CASHFLOW</p>
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
                  <CashflowAnalysisChart data={filteredCashflowData as any[]} timeRange="this_month" />
                </div>
              </section>
            </div>

            {/* SECÇÃO INFERIOR: SALDO E ASSETS */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <BalanceCard 
                title="SALDO TOTAL"
                current={summary.totalAccounts}
                total={summary.totalBase}
                percentage={summary.totalBase > 0 ? Math.round((summary.totalAccounts / summary.totalBase) * 100) : 0}
                previousPercentage={45}
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

                  {cardsData[activeCardIndex].transactions.length > 0 ? (
                    cardsData[activeCardIndex].transactions.map((tx, i) => (
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
                    ))
                  ) : (
                    <div className="flex flex-col items-center justify-center py-12 px-4 text-center bg-white/[0.02] border border-dashed border-white/[0.05] rounded-3xl">
                      <div className="w-12 h-12 rounded-full bg-white/[0.03] flex items-center justify-center mb-4">
                        <Banknote size={20} className="text-slate-600" />
                      </div>
                      <p className="text-[13px] font-bold text-slate-400">Sem movimentos registados</p>
                      <p className="text-[10px] text-slate-600 mt-1 max-w-[180px]">Não existem transações recentes para este cartão.</p>
                    </div>
                  )}
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
            </div>
            <div className="chart-container" style={{ minWidth: 0 }}>
              <WealthEvolutionChart data={wealthEvolutionDailyData as any[]} timeRange="this_month" tooltipStyle={tooltipStyle} />
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
              <IncomeVsExpensesBarChart data={mappedIncomeVsExpensesData} isMobile={isMobile} />
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
                <p className="text-[10px] text-slate-500 uppercase tracking-[0.2em]">PRÓXIMOS MOVIMENTOS</p>
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
  return <DashboardContent />;
}
