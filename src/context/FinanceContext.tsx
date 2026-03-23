"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Account, Investment, Debt, FixedExpense, VariableExpense, Income, DashboardSummary, PlatformSummary, Plataforma } from '@/types';

// Initial data
const initialAccounts: Account[] = [
  { id: '1', nome: 'Montepio', tipo: 'Conta à ordem', saldo: 100.00, data_atualizacao: '2026-03-01', notas: 'Conta principal' },
  { id: '2', nome: 'N26', tipo: 'Conta à ordem', saldo: 0.00, data_atualizacao: '2026-03-01', notas: 'Conta digital' },
  { id: '3', nome: 'Revolut', tipo: 'Conta à ordem', saldo: 2044.00, data_atualizacao: '2026-03-01', notas: 'Conta internacional' },
];

const initialInvestments: Investment[] = [
  // XTB
  { id: '1', plataforma: 'XTB', ticker: 'AAPL', nome: 'Apple Inc.', quantidade: 50, preco_medio: 150, preco_atual: 178, valor_atual: 8900, data_atualizacao: '2026-03-04' },
  { id: '2', plataforma: 'XTB', ticker: 'TSLA', nome: 'Tesla Inc.', quantidade: 20, preco_medio: 200, preco_atual: 245, valor_atual: 4900, data_atualizacao: '2026-03-04' },
  { id: '3', plataforma: 'XTB', ticker: 'NVDA', nome: 'NVIDIA Corp.', quantidade: 10, preco_medio: 400, preco_atual: 875, valor_atual: 8750, data_atualizacao: '2026-03-04' },
  // Trading212
  { id: '4', plataforma: 'Trading212', carteira: 'Tech Europe 2030', ticker: 'MSFT', nome: 'Microsoft', quantidade: 15, preco_medio: 320, preco_atual: 415, valor_atual: 6225, data_atualizacao: '2026-03-04' },
  { id: '5', plataforma: 'Trading212', carteira: 'Tech Europe 2030', ticker: 'GOOGL', nome: 'Alphabet', quantidade: 10, preco_medio: 140, preco_atual: 175, valor_atual: 1750, data_atualizacao: '2026-03-04' },
  // Revolut Stocks
  { id: '7', plataforma: 'Revolut Stocks', ticker: 'VOO', nome: 'Vanguard S&P 500', quantidade: 25, preco_medio: 380, preco_atual: 520, valor_atual: 13000, data_atualizacao: '2026-03-04' },
  { id: '8', plataforma: 'Revolut Stocks', ticker: 'VWCE', nome: 'Vanguard World', quantidade: 100, preco_medio: 95, preco_atual: 108, valor_atual: 10800, data_atualizacao: '2026-03-04' },
  // Revolut Cripto
  { id: '9', plataforma: 'Revolut Cripto', ticker: 'BTC-USD', nome: 'Bitcoin', quantidade: 0.05, preco_medio: 35000, preco_atual: 83500, valor_atual: 4175, data_atualizacao: '2026-03-04' },
  { id: '10', plataforma: 'Revolut Cripto', ticker: 'ETH-USD', nome: 'Ethereum', quantidade: 0.5, preco_medio: 2000, preco_atual: 2950, valor_atual: 1475, data_atualizacao: '2026-03-04' },
  { id: '11', plataforma: 'Revolut Cripto', ticker: 'SOL-USD', nome: 'Solana', quantidade: 5, preco_medio: 80, preco_atual: 145, valor_atual: 725, data_atualizacao: '2026-03-04' },
  // Robo Advisor
  { id: '12', plataforma: 'Robo Advisor', ticker: 'IWDA', nome: 'iShares Core MSCI World', quantidade: 50, preco_medio: 72, preco_atual: 78, valor_atual: 3900, data_atualizacao: '2026-03-04', alocacao_alvo: 40 },
  { id: '13', plataforma: 'Robo Advisor', ticker: 'EFA', nome: 'iShares MSCI EAFE', quantidade: 30, preco_medio: 68, preco_atual: 74, valor_atual: 2220, data_atualizacao: '2026-03-04', alocacao_alvo: 30 },
  { id: '14', plataforma: 'Robo Advisor', ticker: 'EMIM', nome: 'iShares MSCI EM', quantidade: 40, preco_medio: 28, preco_atual: 32, valor_atual: 1280, data_atualizacao: '2026-03-04', alocacao_alvo: 20 },
  { id: '15', plataforma: 'Robo Advisor', ticker: 'IGLA', nome: 'iShares Global Green Bond', quantidade: 20, preco_medio: 52, preco_atual: 50, valor_atual: 1000, data_atualizacao: '2026-03-04', alocacao_alvo: 10 },
];

const initialDebts: Debt[] = [
  { id: '1', nome: 'Cartão Montepio', valor_total: 1500, valor_inicial: 5000, prestacao_mensal: 75, data_pagamento: 15, conta: 'Montepio', categoria: 'Cartão de Crédito' },
  { id: '2', nome: 'Cartão Cetelem', valor_total: 3000, valor_inicial: 4500, prestacao_mensal: 125, data_pagamento: 20, conta: 'N26', categoria: 'Cartão de Crédito' },
  { id: '3', nome: 'Cartão Oney', valor_total: 850, valor_inicial: 1500, prestacao_mensal: 50, data_pagamento: 10, conta: 'Montepio', categoria: 'Cartão de Crédito' },
  { id: '4', nome: 'Crédito Automóvel', valor_total: 15000, valor_inicial: 25000, prestacao_mensal: 350, data_pagamento: 5, conta: 'Montepio', categoria: 'Empréstimo' },
  { id: '5', nome: 'Crédito Pessoal Cetelem', valor_total: 8000, valor_inicial: 12000, prestacao_mensal: 200, data_pagamento: 25, conta: 'N26', categoria: 'Empréstimo' },
  { id: '6', nome: 'Finanças', valor_total: 500, valor_inicial: 1000, prestacao_mensal: 50, data_pagamento: 10, conta: 'Revolut', categoria: 'Impostos' },
  { id: '7', nome: 'Segurança Social', valor_total: 200, valor_inicial: 200, prestacao_mensal: 200, data_pagamento: 1, conta: 'Montepio', categoria: 'Impostos' },
];

const initialFixedExpenses: FixedExpense[] = [
  { id: '1', nome: 'Seguro automóvel', valor: 300, frequencia: 'trimestral', data_pagamento: 15, conta: 'Montepio', categoria: 'Seguros' },
  { id: '2', nome: 'Pensão de alimentos', valor: 500, frequencia: 'mensal', data_pagamento: 1, conta: 'Montepio', categoria: 'Família' },
  { id: '3', nome: 'IUC', valor: 50, frequencia: 'anual', data_pagamento: 1, conta: 'N26', categoria: 'Impostos' },
  { id: '4', nome: 'ACP', valor: 60, frequencia: 'anual', data_pagamento: 1, conta: 'N26', categoria: 'Outros' },
  { id: '5', nome: 'ChatGPT', valor: 20, frequencia: 'mensal', data_pagamento: 10, conta: 'Revolut', categoria: 'Subscrição' },
  { id: '6', nome: 'Ginásio', valor: 40, frequencia: 'mensal', data_pagamento: 3, conta: 'N26', categoria: 'Saúde' },
  { id: '7', nome: 'Canva', valor: 15, frequencia: 'mensal', data_pagamento: 18, conta: 'Revolut', categoria: 'Subscrição' },
  { id: '8', nome: 'Freepik', valor: 15, frequencia: 'mensal', data_pagamento: 18, conta: 'Revolut', categoria: 'Subscrição' },
  { id: '9', nome: 'Domínio + alojamento', valor: 100, frequencia: 'anual', data_pagamento: 1, conta: 'N26', categoria: 'Tecnologia' },
  { id: '10', nome: 'Telemóveis', valor: 50, frequencia: 'mensal', data_pagamento: 24, conta: 'Montepio', categoria: 'Serviços' },
];

const initialVariableExpenses: VariableExpense[] = [
  // Fevereiro 2026
  { id: '1', nome: 'Supermercado Continente', valor: 180, data: '2026-02-05', conta: 'Montepio', categoria: 'Supermercado' },
  { id: '2', nome: 'Supermercado Auchan', valor: 120, data: '2026-02-12', conta: 'N26', categoria: 'Supermercado' },
  { id: '3', nome: 'Supermercado Lidl', valor: 85, data: '2026-02-20', conta: 'N26', categoria: 'Supermercado' },
  { id: '4', nome: 'Combustível Galp', valor: 60, data: '2026-02-03', conta: 'Montepio', categoria: 'Combustível' },
  { id: '5', nome: 'Combustível BP', valor: 55, data: '2026-02-15', conta: 'N26', categoria: 'Combustível' },
  { id: '6', nome: 'Restaurante Sushi', valor: 45, data: '2026-02-08', conta: 'Revolut', categoria: 'Restaurantes' },
  { id: '7', nome: 'Restaurante Italiano', valor: 35, data: '2026-02-14', conta: 'N26', categoria: 'Restaurantes' },
  { id: '8', nome: 'Restaurante Hambúrguer', valor: 25, data: '2026-02-22', conta: 'Revolut', categoria: 'Restaurantes' },
  { id: '9', nome: 'Roupa Zara', valor: 85, data: '2026-02-10', conta: 'N26', categoria: 'Compras' },
  { id: '10', nome: 'Eletrónica Amazon', valor: 120, data: '2026-02-18', conta: 'Revolut', categoria: 'Compras' },
  { id: '11', nome: 'Cabeleireiro', valor: 35, data: '2026-02-25', conta: 'Montepio', categoria: 'Diversos' },
  { id: '12', nome: 'Farmácia', valor: 25, data: '2026-02-28', conta: 'N26', categoria: 'Diversos' },
  
  // Março 2026 (Mês atual)
  { id: '13', nome: 'Supermercado Pingo Doce', valor: 95, data: '2026-03-02', conta: 'Montepio', categoria: 'Supermercado' },
  { id: '14', nome: 'Combustível Repsol', valor: 70, data: '2026-03-05', conta: 'N26', categoria: 'Combustível' },
  { id: '15', nome: 'Jantar Amigos', valor: 40, data: '2026-03-08', conta: 'Revolut', categoria: 'Restaurantes' },
  { id: '16', nome: 'Farmácia Wells', valor: 15, data: '2026-03-12', conta: 'Montepio', categoria: 'Diversos' },
  { id: '17', nome: 'Uber Eats', valor: 22, data: '2026-03-15', conta: 'Revolut', categoria: 'Restaurantes' },
  { id: '18', nome: 'Supermercado Mercadona', valor: 110, data: '2026-03-17', conta: 'N26', categoria: 'Supermercado' },
];

const initialIncome: Income[] = [
  { id: '1', nome: 'Clínica [CSA]', valor: 1000, frequencia: 'mensal', data: 8, conta: 'Montepio' },
  { id: '2', nome: 'amo.CLINICS', valor: 300, frequencia: 'mensal', data: 10, conta: 'Montepio' },
  { id: '3', nome: 'Las Muns', valor: 600, frequencia: 'mensal', data: 20, conta: 'Montepio' },
];

// Initial data loader function
function getInitialData() {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('financeflow_data');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return {
          accounts: Array.isArray(parsed.accounts) ? parsed.accounts.filter((a: any) => a && a.id) : initialAccounts,
          investments: Array.isArray(parsed.investments) ? parsed.investments.filter((i: any) => i && i.id) : initialInvestments,
          debts: Array.isArray(parsed.debts) ? parsed.debts.filter((d: any) => d && d.id) : initialDebts,
          fixedExpenses: Array.isArray(parsed.fixedExpenses) ? parsed.fixedExpenses.filter((e: any) => e && e.id) : initialFixedExpenses,
          variableExpenses: Array.isArray(parsed.variableExpenses) ? parsed.variableExpenses.filter((e: any) => e && e.id) : initialVariableExpenses,
          income: Array.isArray(parsed.income) ? parsed.income.filter((i: any) => i && i.id) : initialIncome,
          customWallets: Array.isArray(parsed.customWallets) ? parsed.customWallets : [],
        };
      } catch (e) {
        console.error('Error parsing saved finance data:', e);
      }
    }
  }
  
  return {
    accounts: initialAccounts,
    investments: initialInvestments,
    debts: initialDebts,
    fixedExpenses: initialFixedExpenses,
    variableExpenses: initialVariableExpenses,
    income: initialIncome,
    customWallets: [],
  };
}

// Context type
interface FinanceContextType {
  accounts: Account[];
  investments: Investment[];
  debts: Debt[];
  fixedExpenses: FixedExpense[];
  variableExpenses: VariableExpense[];
  income: Income[];
  customWallets: string[];
  
  addAccount: (account: Omit<Account, 'id' | 'data_atualizacao'>) => void;
  updateAccount: (id: string, account: Partial<Account>) => void;
  deleteAccount: (id: string) => void;
  
  addInvestment: (investment: Omit<Investment, 'id' | 'data_atualizacao' | 'valor_atual'>, accountId?: string) => void;
  updateInvestment: (id: string, investment: Partial<Investment>) => void;
  deleteInvestment: (id: string) => void;
  refreshPrices: () => Promise<{ failedTickers: string[] }>;
  
  addCustomWallet: (name: string) => void;
  deleteCustomWallet: (name: string) => void;
  
  addDebt: (debt: Omit<Debt, 'id'>) => void;
  updateDebt: (id: string, debt: Partial<Debt>) => void;
  deleteDebt: (id: string) => void;
  
  addFixedExpense: (expense: Omit<FixedExpense, 'id'>) => void;
  updateFixedExpense: (id: string, expense: Partial<FixedExpense>) => void;
  deleteFixedExpense: (id: string) => void;
  
  addVariableExpense: (expense: Omit<VariableExpense, 'id'>) => void;
  updateVariableExpense: (id: string, expense: Partial<VariableExpense>) => void;
  deleteVariableExpense: (id: string) => void;
  
  transferFunds: (fromAccountId: string, toAccountId: string, amount: number) => void;
  
  addIncomeEntry: (incomeEntry: Omit<Income, 'id'>) => void;
  updateIncome: (id: string, incomeEntry: Partial<Income>) => void;
  deleteIncome: (id: string) => void;
  
  getDashboardSummary: () => DashboardSummary;
  getPlatformSummaries: () => PlatformSummary[];
  getExpensesByCategory: () => Record<string, number>;
}

const FinanceContext = createContext<FinanceContextType | undefined>(undefined);

export function FinanceProvider({ children }: { children: ReactNode }) {
  const initialData = getInitialData();
  
  const [accounts, setAccounts] = useState<Account[]>(() => initialData.accounts);
  const [investments, setInvestments] = useState<Investment[]>(() => initialData.investments);
  const [debts, setDebts] = useState<Debt[]>(() => initialData.debts);
  const [fixedExpenses, setFixedExpenses] = useState<FixedExpense[]>(() => initialData.fixedExpenses);
  const [variableExpenses, setVariableExpenses] = useState<VariableExpense[]>(() => initialData.variableExpenses);
  const [income, setIncome] = useState<Income[]>(() => initialData.income);
  const [customWallets, setCustomWallets] = useState<string[]>(() => initialData.customWallets || []);

  // Save to localStorage on change
  useEffect(() => {
    const data = { accounts, investments, debts, fixedExpenses, variableExpenses, income, customWallets };
    localStorage.setItem('financeflow_data', JSON.stringify(data));
  }, [accounts, investments, debts, fixedExpenses, variableExpenses, income, customWallets]);

  // Account actions
  const addAccount = (account: Omit<Account, 'id' | 'data_atualizacao'>) => {
    const newAccount: Account = {
      ...account,
      id: Date.now().toString(),
      data_atualizacao: new Date().toISOString().split('T')[0],
    };
    setAccounts(prev => [...prev, newAccount]);
  };

  const updateAccount = (id: string, account: Partial<Account>) => {
    setAccounts(prev => prev.map(a => 
      a.id === id ? { ...a, ...account, data_atualizacao: new Date().toISOString().split('T')[0] } : a
    ));
  };

  const deleteAccount = (id: string) => {
    setAccounts(prev => prev.filter(a => a.id !== id));
  };

  // Investment actions
  const addInvestment = (investment: Omit<Investment, 'id' | 'data_atualizacao' | 'valor_atual'>, accountId?: string) => {
    const newInvestment: Investment = {
      ...investment,
      id: Date.now().toString(),
      valor_atual: investment.quantidade * investment.preco_atual,
      data_atualizacao: new Date().toISOString().split('T')[0],
    };
    
    setInvestments(prev => [...prev, newInvestment]);

    // Deduct from account if specified
    if (accountId) {
      const amount = investment.quantidade * investment.preco_medio;
      setAccounts(prev => prev.map(a => 
        a.id === accountId ? { ...a, saldo: a.saldo - amount, data_atualizacao: new Date().toISOString().split('T')[0] } : a
      ));
    }
  };

  const updateInvestment = (id: string, investment: Partial<Investment>) => {
    setInvestments(prev => prev.map(i => {
      if (i.id !== id) return i;
      const updated = { ...i, ...investment };
      if (investment.quantidade !== undefined || investment.preco_atual !== undefined) {
        updated.valor_atual = updated.quantidade * updated.preco_atual;
      }
      updated.data_atualizacao = new Date().toISOString().split('T')[0];
      return updated;
    }));
  };

  const deleteInvestment = (id: string) => {
    setInvestments(prev => prev.filter(i => i.id !== id));
  };

  // Custom Wallet actions
  const addCustomWallet = (name: string) => {
    if (!name.trim()) return;
    setCustomWallets(prev => [...new Set([...prev, name.trim()])]);
  };

  const deleteCustomWallet = (name: string) => {
    setCustomWallets(prev => prev.filter(w => w !== name));
  };

  // Server API - Fetch current price via Next.js API route
  const fetchCurrentPrice = async (ticker: string): Promise<number | null> => {
    try {
      const response = await fetch(`/api/price?ticker=${encodeURIComponent(ticker)}`);
      if (!response.ok) {
        return null;
      }
      const data = await response.json();
      return data.price ?? null;
    } catch (error) {
      console.error(`Error fetching price for ${ticker}:`, error);
      return null;
    }
  };

  const refreshPrices = async (): Promise<{ failedTickers: string[] }> => {
    const updatedInvestments = [...investments];
    const uniqueTickers = [...new Set(investments.filter(i => i.isAutoPrice).map(i => i.ticker))];
    
    const priceMap: Record<string, number> = {};
    const failedTickers: string[] = [];
    
    for (const ticker of uniqueTickers) {
      const price = await fetchCurrentPrice(ticker);
      if (price) {
        priceMap[ticker] = price;
      } else {
        failedTickers.push(ticker);
      }
    }
    
    for (const inv of updatedInvestments) {
      if (inv.isAutoPrice && priceMap[inv.ticker]) {
        inv.preco_atual = priceMap[inv.ticker];
        inv.valor_atual = inv.quantidade * inv.preco_atual;
        inv.data_atualizacao = new Date().toISOString().split('T')[0];
      }
    }
    
    setInvestments(updatedInvestments);
    return { failedTickers };
  };

  // Debt actions
  const addDebt = (debt: Omit<Debt, 'id'>) => {
    const newDebt: Debt = { ...debt, id: Date.now().toString() };
    setDebts(prev => [...prev, newDebt]);
  };

  const updateDebt = (id: string, debt: Partial<Debt>) => {
    setDebts(prev => prev.map(d => d.id === id ? { ...d, ...debt } : d));
  };

  const deleteDebt = (id: string) => {
    setDebts(prev => prev.filter(d => d.id !== id));
  };

  // Fixed expense actions
  const addFixedExpense = (expense: Omit<FixedExpense, 'id'>) => {
    const newExpense: FixedExpense = { ...expense, id: Date.now().toString() };
    setFixedExpenses(prev => [...prev, newExpense]);
  };

  const updateFixedExpense = (id: string, expense: Partial<FixedExpense>) => {
    setFixedExpenses(prev => prev.map(e => e.id === id ? { ...e, ...expense } : e));
  };

  const deleteFixedExpense = (id: string) => {
    setFixedExpenses(prev => prev.filter(e => e.id !== id));
  };

  // Variable expense actions
  const addVariableExpense = (expense: Omit<VariableExpense, 'id'>) => {
    const newExpense: VariableExpense = { ...expense, id: Date.now().toString() };
    setVariableExpenses(prev => [...prev, newExpense]);
  };

  const updateVariableExpense = (id: string, expense: Partial<VariableExpense>) => {
    setVariableExpenses(prev => prev.map(e => e.id === id ? { ...e, ...expense } : e));
  };

  const deleteVariableExpense = (id: string) => {
    setVariableExpenses(prev => prev.filter(e => e.id !== id));
  };

  const transferFunds = (fromAccountId: string, toAccountId: string, amount: number) => {
    const fromAccount = accounts.find(a => a.id === fromAccountId);
    const toAccount = accounts.find(a => a.id === toAccountId);
    
    if (!fromAccount || !toAccount) return;

    setAccounts(prev => prev.map(a => {
      if (a.id === fromAccountId) {
        return { ...a, saldo: a.saldo - amount, data_atualizacao: new Date().toISOString().split('T')[0] };
      }
      if (a.id === toAccountId) {
        return { ...a, saldo: a.saldo + amount, data_atualizacao: new Date().toISOString().split('T')[0] };
      }
      return a;
    }));

    // Create variable expense for the source account
    const today = new Date().toISOString().split('T')[0];
    addVariableExpense({
      nome: `Transferência para ${toAccount.nome}`,
      valor: amount,
      data: today,
      conta: fromAccount.nome,
      categoria: 'Transferência'
    });

    // Create income entry for the destination account
    addIncomeEntry({
      nome: 'Transferência',
      valor: amount,
      frequencia: 'unico',
      data: new Date().getDate(),
      data_especifica: today,
      conta: toAccount.nome
    });
  };

  // Income actions
  const addIncomeEntry = (incomeEntry: Omit<Income, 'id'>) => {
    const newIncome: Income = { ...incomeEntry, id: Date.now().toString() };
    setIncome(prev => [...prev, newIncome]);
  };

  const updateIncome = (id: string, incomeEntry: Partial<Income>) => {
    setIncome(prev => prev.map(i => i.id === id ? { ...i, ...incomeEntry } : i));
  };

  const deleteIncome = (id: string) => {
    setIncome(prev => prev.filter(i => i.id !== id));
  };

  // Computed values
  const getDashboardSummary = (): DashboardSummary => {
    // Calculate "Real-time" current balance based on day of month (matching /accounts page)
    const now = new Date('2026-03-20T00:00:00Z');
    const currentDay = now.getDate();
    
    const totalBase = accounts.reduce((sum, account) => {
      const accIncomeSoFar = income
        .filter(inc => inc.conta === account.nome && inc.data <= currentDay)
        .reduce((sum, inc) => sum + inc.valor, 0);
      return sum + account.saldo + accIncomeSoFar;
    }, 0);

    const totalAccounts = accounts.reduce((sum, account) => {
      const accIncomeSoFar = income
        .filter(inc => inc.conta === account.nome && inc.data <= currentDay)
        .reduce((sum, inc) => sum + inc.valor, 0);

      const accFixed = fixedExpenses
        .filter(exp => exp.conta === account.nome && exp.frequencia === 'mensal' && exp.data_pagamento <= currentDay)
        .reduce((sum, exp) => sum + exp.valor, 0);
        
      const accVariable = variableExpenses
        .filter(exp => exp.conta === account.nome && exp.data && exp.data.startsWith('2026-03'))
        .reduce((sum, exp) => sum + exp.valor, 0);
        
      const accDebts = debts
        .filter(d => d.conta === account.nome && d.data_pagamento <= currentDay)
        .reduce((sum, d) => sum + d.prestacao_mensal, 0);
        
      return sum + (account.saldo + accIncomeSoFar) - (accFixed + accVariable + accDebts);
    }, 0);

    const totalInvestments = investments.reduce((sum, i) => sum + i.valor_atual, 0);
    const totalDebts = debts.reduce((sum, d) => sum + d.valor_total, 0);
    
    const monthlyIncome = income.reduce((sum, i) => {
      switch (i.frequencia) {
        case 'mensal': return sum + i.valor;
        case 'trimestral': return sum + i.valor / 3;
        case 'anual': return sum + i.valor / 12;
        default: return sum;
      }
    }, 0);
    
    const monthlyFixedExpenses = fixedExpenses.reduce((sum, e) => {
      switch (e.frequencia) {
        case 'mensal': return sum + e.valor;
        case 'trimestral': return sum + e.valor / 3;
        case 'anual': return sum + e.valor / 12;
        default: return sum;
      }
    }, 0);
    
    const monthlyDebts = debts.reduce((sum, d) => sum + d.prestacao_mensal, 0);
    
    // Average variable expenses
    const averageVariableExpenses = variableExpenses.reduce((sum, e) => sum + e.valor, 0);
    
    const totalExpenses = monthlyFixedExpenses + monthlyDebts + averageVariableExpenses;
    
    return {
      totalWealth: totalAccounts + totalInvestments - totalDebts,
      totalAccounts,
      totalBase,
      totalInvestments,
      totalDebts,
      monthlyCashflow: monthlyIncome - totalExpenses,
      monthlyIncome,
      monthlyFixedExpenses,
      averageVariableExpenses,
    };
  };

  const getPlatformSummaries = (): PlatformSummary[] => {
    const platforms: Plataforma[] = ['XTB', 'Trading212', 'Revolut Stocks', 'Revolut Cripto', 'Revolut Metals', 'Robo Advisor'];
    
    return platforms.map(plataforma => {
      const platformInvestments = investments.filter(i => i.plataforma === plataforma);
      const totalValue = platformInvestments.reduce((sum, i) => sum + i.valor_atual, 0);
      const totalInvested = platformInvestments.reduce((sum, i) => sum + (i.quantidade * i.preco_medio), 0);
      const profitability = totalValue - totalInvested;
      const profitabilityPercent = totalInvested > 0 ? (profitability / totalInvested) * 100 : 0;
      
      return {
        plataforma,
        totalValue,
        totalInvested,
        profitability,
        profitabilityPercent,
      };
    }).filter(p => p.totalValue > 0);
  };

  const getExpensesByCategory = (): Record<string, number> => {
    const categories: Record<string, number> = {};
    variableExpenses.forEach(e => {
      categories[e.categoria] = (categories[e.categoria] || 0) + e.valor;
    });
    return categories;
  };

  return (
    <FinanceContext.Provider value={{
      accounts,
      investments,
      debts,
      fixedExpenses,
      variableExpenses,
      income,
      addAccount,
      updateAccount,
      deleteAccount,
      addInvestment,
      updateInvestment,
      deleteInvestment,
      refreshPrices,
      addDebt,
      updateDebt,
      deleteDebt,
      addFixedExpense,
      updateFixedExpense,
      deleteFixedExpense,
      addVariableExpense,
      updateVariableExpense,
      deleteVariableExpense,
      transferFunds,
      addIncomeEntry,
      updateIncome,
      deleteIncome,
      getDashboardSummary,
      getPlatformSummaries,
      getExpensesByCategory,
      customWallets,
      addCustomWallet,
      deleteCustomWallet,
    }}>
      {children}
    </FinanceContext.Provider>
  );
}

export function useFinance() {
  const context = useContext(FinanceContext);
  if (!context) {
    throw new Error('useFinance must be used within a FinanceProvider');
  }
  return context;
}
