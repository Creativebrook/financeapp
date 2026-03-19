// Account Types
export interface Account {
  id: string;
  nome: string;
  tipo: string;
  saldo: number;
  iban?: string;
  data_atualizacao: string;
  notas?: string;
}

// Investment Types
export type Plataforma = 'XTB' | 'Trading212' | 'Revolut Stocks' | 'Revolut Cripto' | 'Revolut CFD' | 'Robo Advisor';

export interface Investment {
  id: string;
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
}

// Debt Types
export interface Debt {
  id: string;
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
export type Frequencia = 'mensal' | 'quinzenal' | 'semanal' | 'trimestral' | 'semestral' | 'anual';

export interface FixedExpense {
  id: string;
  nome: string;
  valor: number;
  frequencia: Frequencia;
  data_pagamento: number;
  conta: string;
  categoria: string;
}

// Variable Expense Types
export type CategoriaDespesa = 'Supermercado' | 'Combustível' | 'Restaurantes' | 'Compras' | 'Diversos';

export interface VariableExpense {
  id: string;
  nome: string;
  valor: number;
  data: string;
  conta: string;
  categoria: CategoriaDespesa;
}

// Income Types
export interface Income {
  id: string;
  nome: string;
  valor: number;
  frequencia: Frequencia;
  data: number;
  conta: string;
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
  totalInvestments: number;
  totalDebts: number;
  monthlyCashflow: number;
  monthlyIncome: number;
  monthlyFixedExpenses: number;
  averageVariableExpenses: number;
}

// Platform Summary
export interface PlatformSummary {
  plataforma: Plataforma;
  totalValue: number;
  totalInvested: number;
  profitability: number;
  profitabilityPercent: number;
}
