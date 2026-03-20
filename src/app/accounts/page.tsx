"use client";

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { FinanceProvider, useFinance } from '@/context/FinanceContext';
import { useSidebar } from '@/context/SidebarContext';
import Sidebar from '@/components/Sidebar';
import { Plus, Edit2, Trash2, Wallet, X, ArrowUpRight, PiggyBank } from 'lucide-react';
import PremiumHeader from '@/components/PremiumHeader';
import { formatCurrency, formatDate, formatPercentVariation } from '@/lib/utils';
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
  const { accounts, income, fixedExpenses, variableExpenses, addAccount, updateAccount, deleteAccount } = useFinance();
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
  const monthlyIncome = income.reduce((sum, inc) => {
    switch (inc.frequencia) {
      case 'mensal':
        return sum + inc.valor;
      case 'quinzenal':
        return sum + inc.valor * 2;
      case 'semanal':
        return sum + inc.valor * 4;
      case 'trimestral':
        return sum + inc.valor / 3;
      case 'anual':
        return sum + inc.valor / 12;
      default:
        return sum + inc.valor;
    }
  }, 0);

  // Calculate monthly fixed expenses
  const monthlyFixedExpenses = fixedExpenses.reduce((sum, exp) => {
    switch (exp.frequencia) {
      case 'mensal':
        return sum + exp.valor;
      case 'quinzenal':
        return sum + exp.valor * 2;
      case 'semanal':
        return sum + exp.valor * 4;
      case 'trimestral':
        return sum + exp.valor / 3;
      case 'anual':
        return sum + exp.valor / 12;
      default:
        return sum + exp.valor;
    }
  }, 0);

  // Calculate average variable expenses (last 3 months)
  const calculateMonthlyVariableExpenses = () => {
    // Use a fixed date for SSR to avoid hydration mismatches
    const now = new Date('2026-03-20T00:00:00Z');
    const threeMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 2, 1);
    
    const filteredExpenses = variableExpenses.filter(exp => {
      if (!exp || !exp.data) return false;
      const expDate = new Date(exp.data);
      return expDate >= threeMonthsAgo && expDate <= now;
    });
    
    if (filteredExpenses.length === 0) return 0;
    
    // Group by month
    const monthlyTotals: { [key: string]: number } = {};
    filteredExpenses.forEach(exp => {
      if (!exp.data) return;
      const monthKey = exp.data.substring(0, 7); // YYYY-MM
      monthlyTotals[monthKey] = (monthlyTotals[monthKey] || 0) + exp.valor;
    });
    
    const months = Object.keys(monthlyTotals).length;
    return months > 0 ? Object.values(monthlyTotals).reduce((a, b) => a + b, 0) / months : 0;
  };

  const monthlyVariableExpenses = calculateMonthlyVariableExpenses();
  const totalMonthlyExpenses = monthlyFixedExpenses + monthlyVariableExpenses;
  
  // Current balance = income - expenses (cashflow)
  const currentBalance = monthlyIncome - totalMonthlyExpenses;
  const totalBalance = accounts.reduce((sum, a) => sum + a.saldo, 0);
  
  // Calculate percentages
  const currentPercentage = monthlyIncome > 0 ? Math.round((currentBalance / monthlyIncome) * 100) : 0;
  // Previous month - simulate with slightly different values (deterministic based on currentPercentage)
  const previousPercentage = Math.max(0, currentPercentage - (currentPercentage > 50 ? 8 : currentPercentage > 20 ? 12 : 10));
  
  // Calculate balance by bank (grouping accounts by name)
  const balanceByBank = accounts.reduce((acc, account) => {
    const existing = acc.find(b => b.name === account.nome);
    if (existing) {
      existing.value += account.saldo;
    } else {
      acc.push({ name: account.nome, value: account.saldo });
    }
    return acc;
  }, [] as { name: string; value: number }[]);

  // Add percentage to each bank
  const pieData = balanceByBank.map(bank => ({
    ...bank,
    percent: totalBalance > 0 ? Math.round((bank.value / totalBalance) * 100) : 0,
    color: getCardAccent(balanceByBank.indexOf(bank)),
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
                <h4 className="text-2xl font-bold text-white tracking-tight" style={{ fontFamily: 'Inter, sans-serif' }}>{formatCurrency(currentBalance)}</h4>
                <span className="kpi-delta" style={{ 
                  color: getPercentageColor(currentPercentage), 
                  background: getPercentageColor(currentPercentage) ? `color-mix(in srgb, ${getPercentageColor(currentPercentage)} 14%, transparent)` : 'transparent' 
                }}>{currentPercentage}%</span>
                <span className="ml-auto text-[10px] text-slate-600 uppercase tracking-tighter">total: {formatCurrency(monthlyIncome)}</span>
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
                <div style={{ width: '50%', height: '100%', minWidth: 0, minHeight: 0 }}>
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
                  <th>Nome</th>
                  <th>Tipo</th>
                  <th>Income</th>
                  <th>Saldo</th>
                  <th>Últ. Mov.</th>
                  <th className="hidden md:table-cell">Notas</th>
                  <th style={{ textAlign: 'right' }}>Ações</th>
                </tr>
              </thead>
              <tbody>
                {accounts.map((account) => {
                  // Calculate percentage of monthly income for this account's saldo
                  const accountPercent = monthlyIncome > 0 ? Math.round((account.saldo / monthlyIncome) * 100) : 0;
                  const percentColor = getPercentageColor(accountPercent);
                  
                  return (
                    <tr key={account.id}>
                      <td>
                        <div style={{ fontWeight: 600 }}>{account.nome}</div>
                        {account.iban && (
                          <div style={{ fontWeight: 300, fontSize: '0.7rem', color: 'var(--text-muted)' }}>{account.iban}</div>
                        )}
                      </td>
                      <td>
                        <span className="badge badge-info">{account.tipo}</span>
                      </td>
                      <td>
                        <span style={{ 
                          fontFamily: 'Inter, sans-serif', 
                          fontWeight: 500, 
                          color: 'var(--text-secondary)' 
                        }}>
                          {formatCurrency(monthlyIncome)}
                        </span>
                      </td>
                      <td>
                        <span style={{ 
                          fontFamily: 'Inter, sans-serif', 
                          fontWeight: 600, 
                          color: percentColor 
                        }}>
                          {formatCurrency(account.saldo)}
                        </span>
                      </td>
                      <td>
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.8125rem' }}>
                          {formatDate(account.data_atualizacao)}
                        </span>
                      </td>
                      <td className="hidden md:table-cell">
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
                  const accountPercent = monthlyIncome > 0 ? Math.round((account.saldo / monthlyIncome) * 100) : 0;
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
