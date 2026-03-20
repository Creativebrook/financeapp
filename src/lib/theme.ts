/**
 * FinanceFlow 360º - Design Tokens
 * 
 * This file exports all design tokens as TypeScript constants
 * for use in React components. All colors reference CSS custom properties.
 * 
 * Usage:
 * import { CHART_COLORS, SEMANTIC_COLORS, CARD_ACCENTS } from '@/lib/theme';
 */

// ============================================
// FOUNDATION / NEUTRALS
// ============================================

export const FOUNDATION = {
  bgApp: 'var(--bg-app)',
  bgSurface1: 'var(--bg-surface-1)',
  bgSurface2: 'var(--bg-surface-2)',
  bgSurface3: 'var(--bg-surface-3)',
  borderSubtle: 'var(--border-subtle)',
  borderStrong: 'var(--border-strong)',
  textPrimary: 'var(--text-primary)',
  textSecondary: 'var(--text-secondary)',
  textMuted: 'var(--text-muted)',
} as const;

// ============================================
// BRAND / ACCENT
// ============================================

export const BRAND = {
  primary: 'var(--accent-primary)',
  primaryHover: 'var(--accent-primary-hover)',
  primarySoft: 'var(--accent-primary-soft)',
  secondary: 'var(--accent-secondary)',
} as const;

// ============================================
// SEMANTIC COLORS
// ============================================

export const SEMANTIC_COLORS = {
  success: {
    500: 'var(--success-500)',
    400: 'var(--success-400)',
    300: 'var(--success-300)',
    soft: 'var(--success-soft)',
  },
  danger: {
    500: 'var(--danger-500)',
    400: 'var(--danger-400)',
    300: 'var(--danger-300)',
    soft: 'var(--danger-soft)',
  },
  warning: {
    500: 'var(--warning-500)',
    400: 'var(--warning-400)',
    300: 'var(--warning-300)',
    soft: 'var(--warning-soft)',
  },
  info: {
    500: 'var(--info-500)',
    400: 'var(--info-400)',
    soft: 'var(--info-soft)',
  },
} as const;

// Helper aliases for common use cases
export const SUCCESS_COLORS = SEMANTIC_COLORS.success;
export const DANGER_COLORS = SEMANTIC_COLORS.danger;
export const WARNING_COLORS = SEMANTIC_COLORS.warning;
export const INFO_COLORS = SEMANTIC_COLORS.info;

// ============================================
// CHART COLORS
// ============================================

export const CHART_COLORS = {
  // Cashflow - Teal/Slate
  income: 'var(--chart-income)',
  incomeLine: 'var(--chart-income-line)',
  incomeFill: 'var(--chart-income-fill)',
  expenseNeutral: 'var(--chart-expense-neutral)',
  expenseNeutralLine: 'var(--chart-expense-neutral-line)',
  expenseNeutralFill: 'var(--chart-expense-neutral-fill)',
  
  // Bar charts - Income vs Expenses
  incomeBar: 'var(--chart-income-bar)',
  incomeBarHover: 'var(--chart-income-bar-hover)',
  expenseBar: 'var(--chart-expense-bar)',
  expenseBarHover: 'var(--chart-expense-bar-hover)',
  
  // Trend/Area charts - Evolution
  trendPrimary: 'var(--chart-trend-primary)',
  trendPrimaryFill: 'var(--chart-trend-primary-fill)',
  trendSecondary: 'var(--chart-trend-secondary)',
  trendSecondaryFill: 'var(--chart-trend-secondary-fill)',
  
  // Text for charts
  text: 'var(--text-secondary)',
  textMuted: 'var(--text-muted)',
  
  // Grid
  grid: 'var(--border-subtle)',
} as const;

// ============================================
// PIE CHART CATEGORICAL PALETTE (Fixed)
// ============================================

export const PIE_CHART_PALETTE = [
  'var(--chart-cat-1)',  // #25c08a - Green
  'var(--chart-cat-2)',  // #6f6af8 - Purple
  'var(--chart-cat-3)',  // #f2b84b - Amber
  'var(--chart-cat-4)',  // #d85b6a - Red
  'var(--chart-cat-5)',  // #2ea8c9 - Cyan
  'var(--chart-cat-6)',  // #8b7cf6 - Violet
  'var(--chart-cat-7)',  // #6dd3a0 - Light green
  'var(--chart-cat-8)',  // #f6c86b - Light amber
  'var(--chart-cat-9)',  // #7aa2f7 - Light blue
  'var(--chart-cat-10)', // #b48cf2 - Light violet
] as const;

// Get color by index (wraps around)
export function getPieChartColor(index: number): string {
  return PIE_CHART_PALETTE[index % PIE_CHART_PALETTE.length];
}

// ============================================
// CARD ACCENTS (Bank Cards)
// ============================================

export const CARD_ACCENTS = [
  '--card-accent-1', // #f59e0b - Amber
  '--card-accent-2', // #6f6af8 - Purple
  '--card-accent-3', // #14b8a6 - Teal
  '--card-accent-4', // #94a3b8 - Slate
  '--card-accent-5', // #22c55e - Green
  '--card-accent-6', // #ef4444 - Red
] as const;

// Get accent by index (wraps around)
export function getCardAccent(index: number): string {
  return CARD_ACCENTS[index % CARD_ACCENTS.length];
}

// ============================================
// INVESTMENT PLATFORM COLORS (Fixed palette)
// ============================================

export const INVESTMENT_PLATFORMS = [
  'var(--chart-cat-1)',  // XTB - Green
  'var(--chart-cat-5)',  // Trading212 - Cyan
  'var(--chart-cat-2)',  // Revolut Stocks - Purple
  'var(--chart-cat-7)',  // Revolut Cripto - Light green
  'var(--chart-cat-9)',  // Revolut CFD - Light blue
  'var(--chart-cat-6)',  // Robo Advisor - Violet
] as const;

export function getInvestmentPlatformColor(index: number): string {
  return INVESTMENT_PLATFORMS[index % INVESTMENT_PLATFORMS.length];
}

// ============================================
// EXPENSE CATEGORY COLORS (Fixed palette)
// ============================================

export const EXPENSE_CATEGORIES = [
  'var(--chart-cat-1)',  // Supermercado - Green
  'var(--chart-cat-3)',  // Combustível - Amber
  'var(--chart-cat-2)',  // Restaurantes - Purple
  'var(--chart-cat-4)',  // Compras - Red
  'var(--chart-cat-5)',  // Diversos - Cyan
] as const;

export function getExpenseCategoryColor(index: number): string {
  return EXPENSE_CATEGORIES[index % EXPENSE_CATEGORIES.length];
}

// ============================================
// DEBT COLORS (Fixed palette)
// ============================================

export const DEBT_COLORS = [
  'var(--chart-cat-4)',  // Cartão Montepio - Red
  'var(--chart-cat-2)',  // Cartão Cetelem - Purple
  'var(--chart-cat-3)',  // Crédito Automóvel - Amber
  'var(--chart-cat-5)',  // Crédito Pessoal - Cyan
  'var(--chart-cat-6)',  // Finanças - Violet
  'var(--chart-cat-9)',  // Segurança Social - Light blue
] as const;

export function getDebtColor(index: number): string {
  return DEBT_COLORS[index % DEBT_COLORS.length];
}

// ============================================
// CSS CLASSES FOR COMMON PATTERNS
// ============================================

export const CARD_STYLES = {
  background: 'var(--bg-surface-2)',
  border: 'var(--border-subtle)',
  borderHover: 'var(--border-strong)',
} as const;

export const INPUT_STYLES = {
  background: 'var(--bg-surface-2)',
  border: 'var(--border-subtle)',
  borderFocus: 'var(--accent-primary)',
  text: 'var(--text-primary)',
  placeholder: 'var(--text-muted)',
} as const;

// ============================================
// REUSABLE CHART CONFIGURATIONS
// ============================================

export const CHART_CONFIG = {
  // Common tooltip styles
  tooltip: {
    contentStyle: {
      backgroundColor: 'var(--bg-surface-3)',
      border: '1px solid var(--border-strong)',
      borderRadius: '8px',
      boxShadow: 'var(--shadow-elevated)',
    },
    labelStyle: {
      color: 'var(--text-primary)',
    },
    itemStyle: {
      color: 'var(--text-secondary)',
    },
  },
  
  // Common legend styles
  legend: {
    wrapperStyle: {
      paddingTop: '12px',
    },
    textStyle: {
      color: 'var(--text-secondary)',
      fontSize: 11,
    },
  },
  
  // Common grid styles
  grid: {
    stroke: 'var(--border-subtle)',
    strokeDasharray: '4 4',
  },
  
  // Area chart default settings
  area: {
    strokeWidth: 2,
    dot: false,
    activeDot: {
      r: 4,
      strokeWidth: 2,
    },
  },
  
  // Bar chart default settings
  bar: {
    radius: [4, 4, 0, 0],
    maxBarSize: 32,
  },
  
  // Pie chart default settings
  pie: {
    cornerRadius: 4,
    paddingAngle: 2,
    innerRadius: 72,
    outerRadius: 110,
  },
} as const;

const themeExports = {
  FOUNDATION,
  BRAND,
  SEMANTIC_COLORS,
  CHART_COLORS,
  PIE_CHART_PALETTE,
  CARD_ACCENTS,
  CHART_CONFIG,
  getPieChartColor,
  getCardAccent,
  getInvestmentPlatformColor,
  getExpenseCategoryColor,
  getDebtColor,
};

export default themeExports;
