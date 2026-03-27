"use client";

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { FinanceProvider, useFinance } from '@/context/FinanceContext';
import { useSidebar } from '@/context/SidebarContext';
import Sidebar from '@/components/Sidebar';
import { Plus, Edit2, Trash2, Wallet, X, ArrowUpRight, PiggyBank, ChevronLeft, ChevronRight, CreditCard, Eye } from 'lucide-react';
import PremiumHeader from '@/components/PremiumHeader';
import { formatCurrency, formatDate, getCategoryColor } from '@/lib/utils';
import { Account } from '@/types';
import { getCardAccent } from '@/lib/theme';

const AccountsDistributionChart = dynamic(() => import('@/components/charts/AccountsDistributionChart'), { ssr: false });
const AccountsEvolutionChart = dynamic(() => import('@/components/charts/AccountsEvolutionChart'), { ssr: false });

// Helper function to get color based on percentage
const getPercentageColor = (value: number) => {
  if (value >= 50) return 'var(--success-400)';
  if (value >= 20) return 'var(--warning-400)';
  return 'var(--danger-400)';
};

// Get gradient for progress bar
const getBarGradient = (value: number) => {
  if (value >= 50) return 'linear-gradient(to right, var(--success-500), var(--success-400))';
  if (value >= 20) return 'linear-gradient(to right, var(--warning-500), var(--warning-400))';
  return 'linear-gradient(to right, var(--danger-500), var(--danger-400))';
};

function AccountsContent() {
  const { accounts, income, fixedExpenses, variableExpenses, debts, addAccount, updateAccount, deleteAccount, selectedMonth } = useFinance();
  const { isCollapsed } = useSidebar();
  const [showModal, setShowModal] = useState(false);
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);
  const [activeDebitCardIndex, setActiveDebitCardIndex] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [formData, setFormData] = useState({
    nome: '',
    tipo: 'Conta à Ordem',
    saldo: 0,
    iban: '',
    notas: '',
  });

  // Calculate monthly income
  const totalMonthlyIncome = income.reduce((sum, inc) => {
    switch (inc.frequencia) {
      case 'mensal': return sum + inc.valor;
      case 'trimestral': return sum + inc.valor / 3;
      case 'anual': return sum + inc.valor / 12;
      default: return sum + inc.valor;
    }
  }, 0);

  // Helper to get income for a specific account
  const getAccountIncome = (accountName: string) => {
    return income
      .filter(inc => inc.conta === accountName)
      .reduce((sum, inc) => {
        switch (inc.frequencia) {
          case 'mensal': return sum + inc.valor;
          case 'trimestral': return sum + inc.valor / 3;
          case 'anual': return sum + inc.valor / 12;
          default: return sum + inc.valor;
        }
      }, 0);
  };

  // Calculate "Real-time" current balance based on day of month
  const calculateCurrentMonthProgress = () => {
    const now = new Date('2026-03-26T00:00:00Z');
    const currentMonthStr = now.toISOString().substring(0, 7);
    
    let currentDay = now.getDate();
    if (selectedMonth < currentMonthStr) {
      // Past month: show full month
      const [y, m] = selectedMonth.split('-');
      currentDay = new Date(parseInt(y), parseInt(m), 0).getDate();
    } else if (selectedMonth > currentMonthStr) {
      // Future month: show start of month
      currentDay = 0;
    }
    
    // Calculate per-account balances
    const accountBalances = accounts.map(account => {
      // Income for this account in selected month (excluding carryover for balance calculation from saldo)
      const accIncome = income
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

      // Variable expenses for this account in selected month
      const accVariableSpent = variableExpenses
        .filter(exp => exp && exp.conta === account.nome && exp.data && exp.data.startsWith(selectedMonth))
        .filter(exp => {
          const day = parseInt(exp.data.split('-')[2]);
          return day <= currentDay;
        })
        .reduce((sum, exp) => sum + exp.valor, 0);

      // The real-time balance is based on the initial saldo + income - expenses
      const realTimeBalance = account.saldo + accIncome - accVariableSpent;

      return {
        ...account,
        accountBase: account.saldo + accIncome,
        realTimeBalance
      };
    });

    const saldoInicialSoFar = accountBalances.reduce((sum, a) => sum + a.accountBase, 0);
    
    const totalVariableSoFar = variableExpenses
      .filter(exp => exp && exp.data && exp.data.startsWith(selectedMonth))
      .filter(exp => {
        const day = parseInt(exp.data.split('-')[2]);
        return day <= currentDay;
      })
      .reduce((sum, exp) => sum + (exp?.valor || 0), 0);

    const totalFixedSoFar = fixedExpenses
      .filter(exp => exp.frequencia === 'mensal' && exp.data_pagamento <= currentDay)
      .reduce((sum, exp) => sum + exp.valor, 0);

    const totalDebtsSoFar = debts
      .filter(d => d.data_pagamento <= currentDay)
      .reduce((sum, d) => sum + d.prestacao_mensal, 0);

    const totalExpensesSoFar = totalVariableSoFar + totalFixedSoFar + totalDebtsSoFar;
    const saldoAtual = saldoInicialSoFar - totalExpensesSoFar;

    return {
      saldoInicialSoFar,
      saldoAtual,
      incomeSoFar: saldoInicialSoFar,
      expensesSoFar: totalExpensesSoFar,
      accountBalances
    };
  };

  const { saldoInicialSoFar, saldoAtual, incomeSoFar, expensesSoFar, accountBalances } = calculateCurrentMonthProgress();
  
  // Pagination logic
  const totalPages = Math.ceil(accountBalances.length / itemsPerPage);
  const paginatedAccounts = accountBalances.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const debitCards = accountBalances.filter(acc => acc.tipo.toLowerCase() === 'conta à ordem');
  
  // Ensure active index is within bounds
  const safeActiveIndex = activeDebitCardIndex >= debitCards.length ? 0 : activeDebitCardIndex;
  
  // Calculate percentages for the KPI
  const currentPercentage = saldoInicialSoFar > 0 ? Math.round((saldoAtual / saldoInicialSoFar) * 100) : 0;
  const previousPercentage = 45; // Mocked
  
  // Calculate balance by bank for the chart
  const balanceByBank = accountBalances.reduce((acc, account) => {
    const existing = acc.find(b => b.name === account.nome);
    if (existing) {
      existing.value += account.realTimeBalance;
    } else {
      acc.push({ name: account.nome, value: account.realTimeBalance });
    }
    return acc;
  }, [] as { name: string; value: number }[]);

  // Add percentage and color to each bank
  const pieData = balanceByBank.map((bank, index) => ({
    ...bank,
    percent: saldoAtual > 0 ? Math.round((bank.value / saldoAtual) * 100) : 0,
    color: getCategoryColor(bank.name), // Using consistent colors
  }));

  // Prepare data for Evolution Chart (Last 3 months)
  const months = ['Jan', 'Fev', 'Mar'];
  const evolutionData = months.map((month, idx) => {
    const dataObj: any = { month };
    accountBalances.forEach((acc) => {
      if (idx === 2) { // Current month (March)
        dataObj[acc.nome] = acc.realTimeBalance;
      } else {
        // Mock historical data (idx 0 = Jan, idx 1 = Feb)
        // Let's make it slightly different from current balance
        const factor = idx === 0 ? 0.85 : 0.92;
        dataObj[acc.nome] = acc.saldo * factor;
      }
    });
    return dataObj;
  });

  const accountNames = accountBalances.map(acc => acc.nome);
  const accountColors = accountNames.map(name => getCategoryColor(name));

  const handleOpenModal = (account?: Account) => {
    if (account) {
      setEditingAccount(account);
      setFormData({
        nome: account.nome,
        tipo: account.tipo,
        saldo: account.saldo,
        iban: account.iban || '',
        notas: account.notas || '',
      });
    } else {
      setEditingAccount(null);
      setFormData({
        nome: '',
        tipo: 'Conta à Ordem',
        saldo: 0,
        iban: '',
        notas: '',
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingAccount(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingAccount) {
      updateAccount(editingAccount.id, formData);
    } else {
      addAccount(formData);
    }
    handleCloseModal();
  };

  const handleDelete = (id: string) => {
    if (confirm('Tem certeza que deseja eliminar esta conta?')) {
      deleteAccount(id);
    }
  };

  // Get color for current month indicator
  const getCurrentMonthColor = (value: number) => {
    if (value >= 50) return 'var(--success-400)';
    if (value >= 20) return 'var(--warning-400)';
    return 'var(--danger-400)';
  };

  return (
    <div className="app-container">
      <Sidebar />
      
      <main className={`main-content ${isCollapsed ? 'sidebar-collapsed' : ''}`}>
        <PremiumHeader pageName="Contas Bancarias" />
        
        <div className="page-header animate-fadeIn" style={{ paddingBottom: '20px' }}>
          <div style={{ float: 'left' }}>
            <h1 className="page-title" style={{ fontSize: '1.5rem', lineHeight: 0.5 }}>Contas Bancárias</h1>
            <p className="page-subtitle">Gerencie as suas contas e acompanhe o seu saldo</p>
          </div>
          <button className="btn btn-primary" style={{ float: 'right', marginTop: '-8px' }} onClick={() => handleOpenModal()}>
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M5 12h14"></path>
              <path d="M12 5v14"></path>
            </svg>
            Nova Conta
          </button>
        </div>

        {/* Top Row: Four Columns with Spans */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6 mt-[30px] md:mt-0">
          {/* Left: SALDO ATUAL Card - Like Dashboard BalanceCard (1 column) */}
          <div 
            className="lg:col-span-1"
            style={{
              backgroundColor: 'var(--card-bg)',
              borderRadius: '8px',
              border: '1px solid var(--card-border)',
              padding: '24px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              height: '100%',
            }}
          >
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-white/[0.03] border border-white/[0.05] flex items-center justify-center">
                  <PiggyBank size={16} className="text-slate-600" />
                </div>
                <p className="text-[10px] text-slate-500 uppercase tracking-[0.2em]">Saldo Atual</p>
              </div>
              <ArrowUpRight size={14} className="text-slate-700" />
            </div>
            
            <div className="mt-2">
              <div className="flex items-baseline gap-2">
                <h4 className="text-2xl font-bold text-white tracking-tight" style={{ fontFamily: 'Inter, sans-serif' }}>{formatCurrency(saldoAtual)}</h4>
                <span className="kpi-delta" style={{ 
                  color: getPercentageColor(currentPercentage), 
                  background: getPercentageColor(currentPercentage) ? `color-mix(in srgb, ${getPercentageColor(currentPercentage)} 14%, transparent)` : 'transparent' 
                }}>{currentPercentage}%</span>
                <span className="ml-auto text-[10px] text-slate-600 uppercase tracking-tighter">saldo inicial: {formatCurrency(saldoInicialSoFar)}</span>
              </div>
              {/* Current month bar */}
              <div className="w-full h-2 bg-white/[0.03] rounded-full mt-4 overflow-hidden border border-white/[0.02]">
                <div className="h-full rounded-full" style={{ 
                  width: `${Math.min(100, currentPercentage)}%`,
                  background: getBarGradient(currentPercentage)
                }}></div>
              </div>
              {/* Previous month bar */}
              <div className="w-full h-1 bg-white/[0.03] rounded-full mt-2 overflow-hidden border border-white/[0.02]">
                <div className="h-full rounded-full" style={{ width: `${Math.min(100, previousPercentage)}%`, background: 'var(--slate-400)' }}></div>
              </div>
              <div className="flex justify-between items-center mt-2">
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full" style={{ background: getPercentageColor(currentPercentage) }}></div>
                  <span className="text-[9px] text-slate-400 uppercase tracking-wide">ESTE MÊS</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full" style={{ background: 'var(--slate-400)' }}></div>
                  <span className="text-[9px] text-slate-400 uppercase tracking-wide">MÊS ANTERIOR</span>
                </div>
              </div>
              <div className="flex justify-between items-center mt-3">
                <span className="text-[10px] text-slate-600">{accounts.length} contas</span>
              </div>
            </div>
          </div>

          {/* Middle: Evolution Chart - Evolução de Saldos (Last 3 months) (2 columns) */}
          <div 
            className="lg:col-span-2"
            style={{
              backgroundColor: 'var(--card-bg)',
              borderRadius: '8px',
              border: '1px solid var(--card-border)',
              padding: '24px',
              height: '100%',
              minHeight: '180px',
            }}
          >
            <div className="flex justify-between items-start mb-2">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-white/[0.03] border border-white/[0.05] flex items-center justify-center">
                  <ArrowUpRight size={16} className="text-slate-600" />
                </div>
                <p className="text-[10px] text-slate-500 uppercase tracking-[0.2em]">EVOLUÇÃO</p>
              </div>
            </div>
            
            {evolutionData.length > 0 ? (
              <div className="h-[180px] mt-2">
                <AccountsEvolutionChart 
                  data={evolutionData} 
                  accountNames={accountNames} 
                  colors={accountColors}
                />
              </div>
            ) : (
              <div className="flex items-center justify-center h-[180px] text-slate-500 text-sm">
                Sem dados disponíveis
              </div>
            )}
          </div>

          {/* Right: CARTÕES DE DÉBITO Card - Similar to Dashboard "OS MEUS CARTÕES" (1 column) */}
          <div 
            className="lg:col-span-1"
            style={{
              backgroundColor: 'var(--card-bg)',
              borderRadius: '8px',
              border: '1px solid var(--card-border)',
              padding: '24px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              height: '100%',
            }}
          >
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-white/[0.03] border border-white/[0.05] flex items-center justify-center">
                  <CreditCard size={16} className="text-slate-600" />
                </div>
                <p className="text-[10px] text-slate-500 uppercase tracking-[0.2em]">CARTÕES DE DÉBITO</p>
              </div>
              {debitCards.length > 1 && (
                <div className="flex gap-2">
                  <button 
                    onClick={() => setActiveDebitCardIndex(activeDebitCardIndex === 0 ? debitCards.length - 1 : activeDebitCardIndex - 1)}
                    className="w-7 h-7 rounded-full bg-white/[0.03] border border-white/[0.08] flex items-center justify-center text-slate-600 hover:text-white hover:bg-white/[0.1] transition-all"
                  >
                    <ChevronLeft size={14} />
                  </button>
                  <button 
                    onClick={() => setActiveDebitCardIndex(activeDebitCardIndex === debitCards.length - 1 ? 0 : activeDebitCardIndex + 1)}
                    className="w-7 h-7 rounded-full bg-white/[0.03] border border-white/[0.08] flex items-center justify-center text-slate-600 hover:text-white hover:bg-white/[0.1] transition-all"
                  >
                    <ChevronRight size={14} />
                  </button>
                </div>
              )}
            </div>

            {debitCards.length > 0 ? (
              <div className="flex-1 flex flex-col justify-center">
                {(() => {
                  const card = debitCards[safeActiveIndex];
                  const originalIndex = accountBalances.findIndex(acc => acc.id === card.id);
                  const accent = getCardAccent(originalIndex !== -1 ? originalIndex : 0);
                  const accountMonthlyIncome = getAccountIncome(card.nome);
                  const totalResources = accountMonthlyIncome + card.saldo;
                  const percentage = totalResources > 0 ? Math.round((card.realTimeBalance / totalResources) * 100) : 0;
                  
                  return (
                    <div
                      className="w-full aspect-[1.58/1] rounded-md p-6 pt-4 relative overflow-hidden border-l-[3px] transition-all duration-500"
                      style={{
                        backgroundColor: 'var(--bg-surface-2)',
                        borderLeftColor: `var(${accent})`,
                        backgroundImage: `linear-gradient(90deg, color-mix(in srgb, var(${accent}) 8%, transparent), transparent 40%)`,
                        boxShadow: `0 0 18px color-mix(in srgb, var(${accent}) 25%, transparent)`
                      }}
                    >
                      <div className="flex justify-between items-start relative z-10">
                        <span className="text-white font-black italic text-xl tracking-tighter opacity-90">
                          {card.nome.split(' ')[0]}
                        </span>
                      </div>
                      <div className="mt-3 relative z-10">
                        <p className="text-[9px] text-white/50 font-bold uppercase tracking-[0.2em]">
                          {card.nome} (Débito)
                        </p>
                        <div className="flex items-center gap-3 mt-1.5">
                          <h4 className="text-2xl font-bold text-white tracking-tight">
                            {formatCurrency(card.realTimeBalance)}
                          </h4>
                          <Eye size={14} className="text-white/40 cursor-pointer hover:text-white/80 transition-colors" />
                          <div className="flex items-center gap-1.5 ml-auto">
                            <span className="kpi-delta" style={{ 
                              fontSize: '10px',
                              padding: '2px 6px',
                              color: getPercentageColor(percentage), 
                              background: `color-mix(in srgb, ${getPercentageColor(percentage)} 14%, transparent)`
                            }}>
                              {percentage}%
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="mt-auto pt-6 relative z-10">
                        <p className="text-sm text-white/90 font-mono tracking-[0.3em]">
                          {card.iban ? `**** **** **** ${card.iban.slice(-4)}` : '**** **** **** ****'}
                        </p>
                      </div>
                    </div>
                  );
                })()}
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center text-slate-500 text-sm border border-dashed border-white/[0.05] rounded-lg">
                Nenhum cartão de débito
              </div>
            )}
          </div>
        </div>

        {/* Bottom Row: Accounts List - Responsive */}
        <div className="card animate-slideUp">
          {/* Desktop Table View */}
          <div className="table-container hidden md:block">
            <table className="table">
              <thead>
                <tr>
                  <th style={{ textAlign: 'left' }}>Nome</th>
                  <th style={{ textAlign: 'left' }}>Tipo</th>
                  <th style={{ textAlign: 'left' }}>Base</th>
                  <th style={{ textAlign: 'left' }}>Saldo</th>
                  <th style={{ textAlign: 'left' }}>Últ. Mov.</th>
                  <th className="hidden md:table-cell" style={{ textAlign: 'left' }}>Notas</th>
                  <th style={{ textAlign: 'right' }}>Ações</th>
                </tr>
              </thead>
              <tbody>
                  {paginatedAccounts.map((account) => {
                    const accountPercent = saldoInicialSoFar > 0 ? Math.round((account.realTimeBalance / saldoInicialSoFar) * 100) : 0;
                    const percentColor = getPercentageColor(accountPercent);
                    
                    return (
                      <tr key={account.id}>
                        <td style={{ textAlign: 'left' }}>
                          <div style={{ fontWeight: 600 }}>{account.nome}</div>
                          {account.iban && (
                            <div style={{ fontWeight: 300, fontSize: '0.7rem', color: 'var(--text-muted)' }}>{account.iban}</div>
                          )}
                        </td>
                        <td style={{ textAlign: 'left' }}>
                          <span className="badge badge-info">{account.tipo}</span>
                        </td>
                        <td style={{ textAlign: 'left' }}>
                          <span style={{ 
                            fontFamily: 'Inter, sans-serif', 
                            fontWeight: 500, 
                            color: 'var(--text-secondary)' 
                          }}>
                            {formatCurrency(account.accountBase)}
                          </span>
                        </td>
                        <td style={{ textAlign: 'left' }}>
                          <span style={{ 
                            fontFamily: 'Inter, sans-serif', 
                            fontWeight: 600, 
                            color: percentColor 
                          }}>
                            {formatCurrency(account.realTimeBalance)}
                          </span>
                        </td>
                        <td style={{ textAlign: 'left' }}>
                          <span style={{ color: 'var(--text-muted)', fontSize: '0.8125rem' }}>
                            {formatDate(account.data_atualizacao)}
                          </span>
                        </td>
                        <td className="hidden md:table-cell" style={{ textAlign: 'left' }}>
                          <span style={{ color: 'var(--text-secondary)', fontSize: '0.8125rem' }}>
                            {account.notas || '-'}
                          </span>
                        </td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                          <button 
                            className="btn btn-icon btn-secondary"
                            onClick={() => handleOpenModal(account)}
                          >
                            <Edit2 size={16} />
                          </button>
                          <button 
                            className="btn btn-icon btn-danger"
                            onClick={() => handleDelete(account.id)}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div style={{ 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center', 
                gap: '8px', 
                marginTop: '24px',
                padding: '0 16px 16px'
              }}>
                <button 
                  className="btn btn-secondary"
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  style={{ padding: '4px 12px', fontSize: '0.8rem' }}
                >
                  Anterior
                </button>
                <div style={{ display: 'flex', gap: '4px' }}>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '6px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.8rem',
                        cursor: 'pointer',
                        border: '1px solid var(--border-color)',
                        background: currentPage === page ? 'var(--accent-primary)' : 'transparent',
                        color: currentPage === page ? 'white' : 'var(--text-secondary)',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      {page}
                    </button>
                  ))}
                </div>
                <button 
                  className="btn btn-secondary"
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  style={{ padding: '4px 12px', fontSize: '0.8rem' }}
                >
                  Próximo
                </button>
              </div>
            )}
            
            {accounts.length === 0 && (
              <div className="empty-state">
                <Wallet size={48} style={{ opacity: 0.3, marginBottom: '16px' }} />
                <p>Nenhuma conta adicionada</p>
                <button className="btn btn-primary" style={{ marginTop: '16px' }} onClick={() => handleOpenModal()}>
                  <Plus size={18} />
                  Adicionar Conta
                </button>
              </div>
            )}
          </div>

          {/* Mobile Card View */}
          <div className="md:hidden">
            {paginatedAccounts.length > 0 ? (
              <>
                <div style={{ padding: '0' }}>
                  {paginatedAccounts.map((account, index) => {
                  const accountPercent = saldoInicialSoFar > 0 ? Math.round((account.realTimeBalance / saldoInicialSoFar) * 100) : 0;
                  const percentColor = getPercentageColor(accountPercent);
                  // Simulate previous month percentage (deterministic)
                  const prevMonthPercent = Math.max(0, accountPercent - (accountPercent > 50 ? 8 : accountPercent > 20 ? 12 : 10));
                  
                  return (
                    <div key={account.id}>
                      {/* Row 1: Nome + Tipo (left) + Ações (right) */}
                      <div className="flex justify-between items-start" style={{ padding: '16px 16px 8px' }}>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>{account.nome}</div>
                          <div style={{ fontWeight: 400, fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                            {account.tipo}
                          </div>
                          {account.iban && (
                            <div style={{ fontWeight: 300, fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                              {account.iban}
                            </div>
                          )}
                        </div>
                        <div style={{ display: 'flex', gap: '6px' }}>
                          <button 
                            className="btn btn-icon btn-secondary"
                            onClick={() => handleOpenModal(account)}
                            style={{ padding: '6px' }}
                          >
                            <Edit2 size={14} />
                          </button>
                          <button 
                            className="btn btn-icon btn-danger"
                            onClick={() => handleDelete(account.id)}
                            style={{ padding: '6px' }}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                      {/* Row 2: Saldo + % (left) + Base (right) */}
                      <div className="flex justify-between items-center" style={{ padding: '8px 16px 16px' }}>
                        <div>
                          <span style={{ 
                            fontFamily: 'Inter, sans-serif', 
                            fontWeight: 600, 
                            fontSize: '1.1rem',
                            color: percentColor 
                          }}>
                            {formatCurrency(account.realTimeBalance)}
                          </span>
                          <span style={{ 
                            marginLeft: '8px',
                            fontSize: '0.7rem',
                            color: percentColor,
                            background: `color-mix(in srgb, ${percentColor} 14%, transparent)`,
                            padding: '2px 6px',
                            borderRadius: '4px'
                          }}>
                            {accountPercent}%
                          </span>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '2px' }}>Base</div>
                          <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                            {formatCurrency(account.accountBase)}
                          </div>
                        </div>
                      </div>
                      {/* Separator */}
                      {index < accountBalances.length - 1 && (
                        <div style={{ 
                          borderTop: '1px solid var(--border-subtle)',
                          margin: '0 16px'
                        }} />
                      )}
                    </div>
                  );
                })}
                </div>

                {/* Mobile Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 py-4">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      className="p-2 rounded bg-slate-900 border border-white/5 disabled:opacity-30"
                    >
                      <ChevronLeft size={18} />
                    </button>
                    <span className="text-xs text-slate-400">
                      Página {currentPage} de {totalPages}
                    </span>
                    <button
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      className="p-2 rounded bg-slate-900 border border-white/5 disabled:opacity-30"
                    >
                      <ChevronRight size={18} />
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="empty-state">
                <Wallet size={48} style={{ opacity: 0.3, marginBottom: '16px' }} />
                <p>Nenhuma conta adicionada</p>
                <button className="btn btn-primary" style={{ marginTop: '16px' }} onClick={() => handleOpenModal()}>
                  <Plus size={18} />
                  Adicionar Conta
                </button>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal animate-slideUp" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">
                {editingAccount ? 'Editar Conta' : 'Nova Conta'}
              </h2>
              <button className="btn btn-icon btn-secondary" onClick={handleCloseModal}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Nome</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.nome}
                  onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                  placeholder="Ex: Montepio, N26..."
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Tipo</label>
                  <select
                    className="form-select"
                    value={formData.tipo}
                    onChange={(e) => setFormData({ ...formData, tipo: e.target.value })}
                  >
                    <option value="Conta à Ordem">Conta à Ordem</option>
                    <option value="Conta Conjunta">Conta Conjunta</option>
                    <option value="Conta Digital">Conta Digital</option>
                    <option value="Conta Poupança">Conta Poupança</option>
                    <option value="Depósito a Prazo">Depósito a Prazo</option>
                  </select>
              </div>

              <div className="form-group">
                <label className="form-label">Saldo (€)</label>
                <input
                  type="number"
                  className="form-input"
                  value={formData.saldo}
                  onChange={(e) => setFormData({ ...formData, saldo: parseFloat(e.target.value) || 0 })}
                  step="0.01"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">IBAN</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.iban}
                  onChange={(e) => setFormData({ ...formData, iban: e.target.value })}
                  placeholder="Ex: PT50 0031 0000 1234 5678 4356"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Notas</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.notas}
                  onChange={(e) => setFormData({ ...formData, notas: e.target.value })}
                  placeholder="Ex: Conta principal, Inclui poupança..."
                />
              </div>

              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={handleCloseModal}>
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingAccount ? 'Guardar' : 'Criar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AccountsPage() {
  return <AccountsContent />;
}
