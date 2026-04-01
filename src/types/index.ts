// Account Types
export interface Account {
  id: string;
  user_id?: string;
  nome: string;
  tipo: string;
  saldo: number;
  iban?: string;
  data_atualizacao: string;
  notas?: string;
}

// Investment Types
export type Plataforma = 'XTB' | 'Trading212' | 'Revolut Stocks' | 'Revolut Cripto' | 'Robo Advisor';

export interface Investment {
  id: string;
  user_id?: string;
  plataforma: Plataforma;
  carteira?: string; // For Trading212 pies
  ticker: string;
  nome: string;
  quantidade: number;
  preco_medio: number;
  preco_atual: number;
  valor_atual: number;
  data_atualizacao: string;
  posicao?: 'long' | 'short'; // For CFDs
  alocacao_alvo?: number; // For Robo Advisor
  isAutoPrice?: boolean;
  dividendos_ganhos?: number;
  dividendos_cash?: number;
  dividendos_reinvestidos?: number;
}

// Debt Types
export interface Debt {
  id: string;
  user_id?: string;
  nome: string;
  valor_total: number;
  valor_inicial: number;
  prestacao_mensal: number;
  data_pagamento: number;
  conta: string;
  categoria: string;
  taxa_juro?: number;
  data_fim?: string;
}

// Fixed Expense Types
export type Frequencia = 'mensal' | 'quinzenal' | 'semanal' | 'trimestral' | 'semestral' | 'anual' | 'unico';

export interface FixedExpense {
  id: string;
  user_id?: string;
  nome: string;
  valor: number;
  frequencia: Frequencia;
  data_pagamento: number;
  conta: string;
  categoria: string;
  data_inicio?: string;
  data_fim?: string;
}

// Variable Expense Types
export type CategoriaDespesa = 'Supermercado' | 'Combustível' | 'Restaurantes' | 'Compras' | 'Diversos' | 'Transferência' | 'Investimento' | 'Lazer' | 'Pessoal';

export interface VariableExpense {
  id: string;
  user_id?: string;
  nome: string;
  valor: number;
  data: string;
  conta: string;
  categoria: string;
}

// Income Types
export interface Income {
  id: string;
  user_id?: string;
  nome: string;
  valor: number;
  frequencia: Frequencia;
  data: number; // Day of month for recurring
  data_especifica?: string; // Full date for 'unico'
  data_inicio?: string;
  data_fim?: string;
  conta: string;
}

// Recurring Movement Type (Unified view for config)
export interface RecurringMovement {
  id: string;
  user_id?: string;
  nome: string;
  valor: number;
  tipo: 'receita' | 'despesa';
  frequencia: Frequencia;
  dia: number;
  conta: string;
  categoria: string;
  data_inicio?: string;
  data_fim?: string;
  ativa: boolean;
}

// Calendar Event Types
export interface CalendarEvent {
  id: string;
  date: string;
  type: 'income' | 'expense' | 'debt' | 'fixed_expense';
  name: string;
  amount: number;
  category?: string;
}

// Dashboard Summary Types
export interface DashboardSummary {
  totalWealth: number;
  totalAccounts: number;
  totalBase: number;
  totalInvestments: number;
  totalDebts: number;
  monthlyCashflow: number;
  monthlyIncome: number;
  totalExpenses: number;
  savingsRate: number;
  monthlyFixedExpenses: number;
  averageVariableExpenses: number;
  totalDividends: number;
  accountBalances: any[];
}

// Platform Summary
export interface PlatformSummary {
  plataforma: Plataforma;
  totalValue: number;
  totalInvested: number;
  profitability: number;
  profitabilityPercent: number;
  totalDividends?: number;
}

// Telegram Settings
export interface TelegramSettings {
  chatId: string;
  enabledAlerts: {
    rendimentos: boolean;
    dividas: boolean;
    despesasFixas: boolean;
  };
}
