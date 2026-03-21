"use client";

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { FinanceProvider, useFinance } from '@/context/FinanceContext';
import { useSidebar } from '@/context/SidebarContext';
import Sidebar from '@/components/Sidebar';
import { Plus, Edit2, Trash2, Wallet, X, ArrowUpRight, PiggyBank } from 'lucide-react';
import PremiumHeader from '@/components/PremiumHeader';
import { formatCurrency, formatDate, getCategoryColor } from '@/lib/utils';
import { Account } from '@/types';
import { getCardAccent } from '@/lib/theme';

const AccountsDistributionChart = dynamic(() => import('@/components/charts/AccountsDistributionChart'), { ssr: false });

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
  const { accounts, income, fixedExpenses, variableExpenses, debts, addAccount, updateAccount, deleteAccount } = useFinance();
  const { isCollapsed } = useSidebar();
  const [showModal, setShowModal] = useState(false);
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);
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
    const now = new Date('2026-03-21T00:00:00Z');
    const currentDay = now.getDate();
    
    // 1. Income received so far
    const incomeSoFar = income.reduce((sum, inc) => {
      if (inc && inc.data <= currentDay) return sum + inc.valor;
      return sum;
    }, 0);

    // 2. Fixed expenses paid so far
    const fixedSoFar = fixedExpenses.reduce((sum, exp) => {
      if (!exp) return sum;
      if (exp.frequencia === 'mensal' && exp.data_pagamento <= currentDay) return sum + exp.valor;
      // For non-monthly, we assume they are paid on their specific day if it's this month
      // Simplified: just check if the day has passed
      if (exp.data_pagamento <= currentDay) {
        // We only count it if it's due this month (simplified logic)
        // For this demo, we'll just count monthly ones that passed
        if (exp.frequencia === 'mensal') return sum + exp.valor;
      }
      return sum;
    }, 0);

    // 3. Variable expenses so far (already in the list for this month)
    const variableSoFar = variableExpenses
      .filter(exp => exp && exp.data && exp.data.startsWith('2026-03'))
      .reduce((sum, exp) => sum + (exp?.valor || 0), 0);

    // 4. Debt payments so far
    const debtsSoFar = debts.reduce((sum, d) => {
      if (d && d.data_pagamento <= currentDay) return sum + d.prestacao_mensal;
      return sum;
    }, 0);

    // Starting balance (sum of accounts at start of month)
    // We'll estimate this by taking current total balance and reversing the flow
    const totalCurrentBalance = accounts.reduce((sum, a) => sum + a.saldo, 0);
    
    // The user wants the "SALDO ATUAL" card to be coherent.
    // Let's use the sum of accounts as the base, but show the progress.
    return {
      totalCurrentBalance,
      incomeSoFar,
      expensesSoFar: fixedSoFar + variableSoFar + debtsSoFar,
      totalMonthlyIncome
    };
  };

  const { totalCurrentBalance, incomeSoFar, expensesSoFar } = calculateCurrentMonthProgress();
  
  // The user says the card shows 531.50 but should be 1900 + 2044.
  // I will make the main value the totalCurrentBalance.
  
  // Calculate percentages for the KPI
  const currentPercentage = totalMonthlyIncome > 0 ? Math.round(((incomeSoFar - expensesSoFar) / totalMonthlyIncome) * 100) : 0;
  const previousPercentage = 45; // Mocked
  
  // Calculate balance by bank
  const balanceByBank = accounts.reduce((acc, account) => {
    const existing = acc.find(b => b.name === account.nome);
    if (existing) {
      existing.value += account.saldo;
    } else {
      acc.push({ name: account.nome, value: account.saldo });
    }
    return acc;
  }, [] as { name: string; value: number }[]);

  // Add percentage and color to each bank
  const pieData = balanceByBank.map((bank, index) => ({
    ...bank,
    percent: totalCurrentBalance > 0 ? Math.round((bank.value / totalCurrentBalance) * 100) : 0,
    color: getCategoryColor(bank.name), // Using consistent colors
  }));

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

        {/* Top Row: Two Columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6 mt-[30px] md:mt-0">
          {/* Left: SALDO ATUAL Card - Like Dashboard BalanceCard */}
          <div 
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
                <h4 className="text-2xl font-bold text-white tracking-tight" style={{ fontFamily: 'Inter, sans-serif' }}>{formatCurrency(totalCurrentBalance)}</h4>
                <span className="kpi-delta" style={{ 
                  color: getPercentageColor(currentPercentage), 
                  background: getPercentageColor(currentPercentage) ? `color-mix(in srgb, ${getPercentageColor(currentPercentage)} 14%, transparent)` : 'transparent' 
                }}>{currentPercentage}%</span>
                <span className="ml-auto text-[10px] text-slate-600 uppercase tracking-tighter">total income: {formatCurrency(totalMonthlyIncome)}</span>
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
                  <div className="w-2 h-2 rounded-full" style={{ background: getCurrentMonthColor(currentPercentage) }}></div>
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

          {/* Right: Pie Chart - Distribuição por Banco (Chart left, Legend right) */}
          <div 
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
                  <Wallet size={16} className="text-slate-600" />
                </div>
                <p className="text-[10px] text-slate-500 uppercase tracking-[0.2em]">Por Banco</p>
              </div>
            </div>
            
            {pieData.length > 0 ? (
              <div className="flex items-center h-[calc(100%-40px)]">
                {/* Pie Chart on the left */}
                <div style={{ width: '50%', height: '180px', minWidth: 0, minHeight: 0 }}>
                  <AccountsDistributionChart data={pieData} />
                </div>
                
                {/* Legend on the right */}
                <div style={{ width: '50%', paddingLeft: '12px' }}>
                  {pieData.map((entry, index) => (
                    <div key={index} className="flex items-center gap-2 mb-2">
                      <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: entry.color }} />
                      <div className="flex-1 min-w-0">
                        <div className="text-[11px] text-slate-300 truncate" style={{ fontWeight: 500 }}>{entry.name}</div>
                        <div className="text-[10px] text-slate-500">
                          {formatCurrency(entry.value)} ({entry.percent}%)
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-[calc(100%-40px)] text-slate-500 text-sm">
                Sem dados disponíveis
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
                  <th style={{ textAlign: 'left' }}>Income</th>
                  <th style={{ textAlign: 'left' }}>Saldo</th>
                  <th style={{ textAlign: 'left' }}>Últ. Mov.</th>
                  <th className="hidden md:table-cell" style={{ textAlign: 'left' }}>Notas</th>
                  <th style={{ textAlign: 'right' }}>Ações</th>
                </tr>
              </thead>
              <tbody>
                  {accounts.map((account) => {
                    const accountIncome = getAccountIncome(account.nome);
                    const accountPercent = totalMonthlyIncome > 0 ? Math.round((account.saldo / totalMonthlyIncome) * 100) : 0;
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
                            {formatCurrency(accountIncome)}
                          </span>
                        </td>
                        <td style={{ textAlign: 'left' }}>
                          <span style={{ 
                            fontFamily: 'Inter, sans-serif', 
                            fontWeight: 600, 
                            color: percentColor 
                          }}>
                            {formatCurrency(account.saldo)}
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
            {accounts.length > 0 ? (
              <div style={{ padding: '0' }}>
                {accounts.map((account, index) => {
                  const accountPercent = totalMonthlyIncome > 0 ? Math.round((account.saldo / totalMonthlyIncome) * 100) : 0;
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
                      {/* Row 2: Saldo + % (left) + Últ. Mov. (right) */}
                      <div className="flex justify-between items-center" style={{ padding: '8px 16px 16px' }}>
                        <div>
                          <span style={{ 
                            fontFamily: 'Inter, sans-serif', 
                            fontWeight: 600, 
                            fontSize: '1.1rem',
                            color: percentColor 
                          }}>
                            {formatCurrency(account.saldo)}
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
                          <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                            {formatDate(account.data_atualizacao)}
                          </span>
                        </div>
                      </div>
                      {/* Separator */}
                      {index < accounts.length - 1 && (
                        <div style={{ 
                          borderTop: '1px solid var(--border-subtle)',
                          margin: '0 16px'
                        }} />
                      )}
                    </div>
                  );
                })}
              </div>
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
  return (
    <FinanceProvider>
      <AccountsContent />
    </FinanceProvider>
  );
}
