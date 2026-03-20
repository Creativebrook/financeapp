"use client";

import { useState } from 'react';
import { FinanceProvider, useFinance } from '@/context/FinanceContext';
import { useSidebar } from '@/context/SidebarContext';
import Sidebar from '@/components/Sidebar';
import PremiumHeader from '@/components/PremiumHeader';
import { Plus, Edit2, Trash2, CreditCard, X, AlertCircle, Calendar, Banknote, CalendarCheck } from 'lucide-react';
import { formatCurrency, getNextPaymentDate, formatDate } from '@/lib/utils';
import { Debt } from '@/types';

function DebtsContent() {
  const { debts, addDebt, updateDebt, deleteDebt, accounts, getDashboardSummary } = useFinance();
  const { isCollapsed } = useSidebar();
  const summary = getDashboardSummary();
  const monthlyIncome = summary.monthlyIncome;

  const calculateMonthsRemaining = (debt: Debt): number => {
    if (debt.prestacao_mensal === 0) return 0;
    return Math.ceil(debt.valor_total / debt.prestacao_mensal);
  };

  const calculatePayoffDate = (debt: Debt): string => {
    const months = calculateMonthsRemaining(debt);
    // Use a fixed date for SSR to avoid hydration mismatches
    const payoffDate = new Date('2026-03-20T00:00:00Z');
    payoffDate.setMonth(payoffDate.getMonth() + months);
    return formatDate(payoffDate.toISOString());
  };
  
  const [showModal, setShowModal] = useState(false);
  const [editingDebt, setEditingDebt] = useState<Debt | null>(null);
  const [formData, setFormData] = useState({
    nome: '',
    valor_total: 0,
    valor_inicial: 0,
    prestacao_mensal: 0,
    data_pagamento: 1,
    conta: 'Montepio',
    categoria: 'Cartão de Crédito',
    taxa_juro: 0,
    data_fim: '',
  });

  const totalDebt = debts.reduce((sum, d) => sum + d.valor_total, 0);
  const totalMonthly = debts.reduce((sum, d) => sum + d.prestacao_mensal, 0);
  const taxaEsforco = monthlyIncome > 0 ? (totalMonthly / monthlyIncome) * 100 : 0;
  
  const sortedDebts = [...debts].sort((a, b) => {
    const dateA = getNextPaymentDate(a.data_pagamento).getTime();
    const dateB = getNextPaymentDate(b.data_pagamento).getTime();
    return dateA - dateB;
  });

  const maxMonths = debts.length > 0 ? Math.max(...debts.map(d => calculateMonthsRemaining(d))) : 0;
  // Use a fixed date for SSR to avoid hydration mismatches
  const latestPayoffDate = new Date('2026-03-20T00:00:00Z');
  latestPayoffDate.setMonth(latestPayoffDate.getMonth() + maxMonths);
  const formattedPayoffDate = formatDate(latestPayoffDate.toISOString());

  const getEffortColor = (percent: number) => {
    if (percent > 75) return '#ef4444'; // Red
    if (percent > 40) return '#f59e0b'; // Yellow
    return '#10b981'; // Green
  };

  const handleOpenModal = (debt?: Debt) => {
    if (debt) {
      setEditingDebt(debt);
      setFormData({
        nome: debt.nome,
        valor_total: debt.valor_total,
        valor_inicial: debt.valor_inicial || debt.valor_total,
        prestacao_mensal: debt.prestacao_mensal,
        data_pagamento: debt.data_pagamento,
        conta: debt.conta,
        categoria: debt.categoria,
        taxa_juro: debt.taxa_juro || 0,
        data_fim: debt.data_fim || '',
      });
    } else {
      setEditingDebt(null);
      setFormData({
        nome: '',
        valor_total: 0,
        valor_inicial: 0,
        prestacao_mensal: 0,
        data_pagamento: 1,
        conta: accounts[0]?.nome || 'Montepio',
        categoria: 'Cartão de Crédito',
        taxa_juro: 0,
        data_fim: '',
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingDebt(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const debtData = {
      nome: formData.nome,
      valor_total: formData.valor_total,
      valor_inicial: formData.valor_inicial,
      prestacao_mensal: formData.prestacao_mensal,
      data_pagamento: formData.data_pagamento,
      conta: formData.conta,
      categoria: formData.categoria,
      taxa_juro: formData.taxa_juro || undefined,
      data_fim: formData.data_fim || undefined,
    };
    
    if (editingDebt) {
      updateDebt(editingDebt.id, debtData);
    } else {
      addDebt(debtData);
    }
    handleCloseModal();
  };

  const handleDelete = (id: string) => {
    if (confirm('Tem certeza que deseja eliminar esta dívida?')) {
      deleteDebt(id);
    }
  };

  return (
    <div className="app-container">
      <Sidebar />
      
      <main className={`main-content ${isCollapsed ? 'sidebar-collapsed' : ''}`}>
        <PremiumHeader pageName="Dividas Pendentes" />
        
        <div className="page-header animate-fadeIn" style={{ paddingBottom: '20px' }}>
          <div style={{ float: 'left' }}>
            <h1 className="page-title" style={{ fontSize: '1.5rem', lineHeight: 0.5 }}>Dívidas</h1>
            <p className="page-subtitle">Gerencie as suas dívidas e préstamos</p>
          </div>
          <button className="btn btn-primary" style={{ float: 'right', marginTop: '-8px' }} onClick={() => handleOpenModal()}>
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M5 12h14"></path>
              <path d="M12 5v14"></path>
            </svg>
            Nova Dívida
          </button>
        </div>

        {/* Summary Cards */}
        <div className="stats-grid" style={{ marginBottom: '24px' }}>
          <div className="card animate-slideUp" style={{ 
            background: 'linear-gradient(to right, var(--card-hero-bg-start) 0%, var(--card-hero-bg-mid) 55%, var(--card-hero-bg-end) 100%)', 
            borderRadius: '8px', 
            border: '1px solid var(--card-border)', 
            padding: '24px' 
          }}>
            <div className="card-header" style={{ borderBottom: 'none', paddingBottom: '0', marginBottom: '20px' }}>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-white/[0.03] border border-white/[0.05] flex items-center justify-center">
                  <Banknote size={16} className="text-slate-400" />
                </div>
                <p className="text-[10px] text-slate-500 uppercase tracking-[0.2em]">TOTAL DE DÍVIDAS</p>
              </div>
            </div>
            
            <div className="flex items-end justify-between mb-2">
              <div className="flex items-center gap-3">
                <h2 style={{ fontSize: '2rem', fontWeight: 700, color: 'white', margin: 0, fontFamily: 'Inter, sans-serif' }}>
                  {formatCurrency(totalDebt)}
                </h2>
                <div style={{ backgroundColor: 'rgba(111, 106, 248, 0.1)', border: '1px solid rgba(111, 106, 248, 0.2)', borderRadius: '4px', padding: '2px 8px', fontSize: '0.7rem', color: '#6f6af8', fontWeight: 600 }}>
                  100%
                </div>
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 500 }}>
                TOTAL: {formatCurrency(totalDebt)}
              </div>
            </div>

            <div style={{ width: '100%', height: '6px', backgroundColor: 'rgba(255, 255, 255, 0.05)', borderRadius: '3px', overflow: 'hidden', marginBottom: '16px' }}>
              <div style={{ width: '100%', height: '100%', backgroundColor: '#6f6af8', borderRadius: '3px' }}></div>
            </div>

            <div className="text-[0.6rem] md:text-[0.75rem]" style={{ color: 'var(--text-secondary)', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              PREVISÃO DE FINALIZAÇÃO: <span style={{ color: 'rgb(111, 106, 248)' }}>{formattedPayoffDate} ({maxMonths} meses)</span>
            </div>
          </div>

          <div className="card animate-slideUp" style={{ 
            background: 'linear-gradient(to right, var(--card-hero-bg-start) 0%, var(--card-hero-bg-mid) 55%, var(--card-hero-bg-end) 100%)', 
            borderRadius: '8px', 
            border: '1px solid var(--card-border)', 
            padding: '24px' 
          }}>
            <div className="card-header" style={{ borderBottom: 'none', paddingBottom: '0', marginBottom: '20px' }}>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-white/[0.03] border border-white/[0.05] flex items-center justify-center">
                  <CalendarCheck size={16} className="text-slate-400" />
                </div>
                <p className="text-[10px] text-slate-500 uppercase tracking-[0.2em]">PRESTAÇÕES MENSAIS</p>
              </div>
            </div>

            <div className="flex items-end justify-between mb-2">
              <h2 style={{ fontSize: '2rem', fontWeight: 700, color: 'white', margin: 0, fontFamily: 'Inter, sans-serif' }}>
                {formatCurrency(totalMonthly)}
              </h2>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 500 }}>
                INCOME: {formatCurrency(monthlyIncome)}
              </div>
            </div>

            <div style={{ width: '100%', height: '6px', backgroundColor: 'rgba(255, 255, 255, 0.05)', borderRadius: '3px', overflow: 'hidden', marginBottom: '16px' }}>
              <div style={{ width: `${Math.min(taxaEsforco, 100)}%`, height: '100%', backgroundColor: getEffortColor(taxaEsforco), borderRadius: '3px' }}></div>
            </div>

            <div className="text-[0.6rem] md:text-[0.75rem]" style={{ color: 'var(--text-secondary)', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              TAXA DE ESFORÇO: <span style={{ color: getEffortColor(taxaEsforco) }}>{taxaEsforco.toFixed(1)}%</span>
            </div>
          </div>
        </div>

        {/* Debts List */}
        <div className="animate-slideUp">
          {/* Desktop Table */}
          <div className="card hidden md:block">
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>NOME</th>
                    <th>CATEGORIA</th>
                    <th style={{ textAlign: 'right' }}>TOTAL</th>
                    <th style={{ textAlign: 'right' }}>PRESTAÇÃO</th>
                    <th>DATA</th>
                    <th>CONTA</th>
                    <th style={{ textAlign: 'right' }}>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedDebts.map((debt) => (
                    <tr key={debt.id}>
                      <td>
                        <div style={{ fontSize: '0.9rem', fontWeight: 400 }}>{debt.nome}</div>
                        {debt.taxa_juro && (
                          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                            {debt.taxa_juro}% TAEG
                          </div>
                        )}
                      </td>
                      <td>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{debt.categoria}</span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--accent-danger)' }}>
                          {formatCurrency(debt.valor_total)}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <span style={{ fontSize: '0.9rem' }}>{formatCurrency(debt.prestacao_mensal)}</span>
                      </td>
                      <td>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '-5px' }}>
                          {formatDate(getNextPaymentDate(debt.data_pagamento).toISOString())}
                        </div>
                      </td>
                      <td>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{debt.conta}</span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                          <button 
                            className="btn btn-icon btn-secondary"
                            onClick={() => handleOpenModal(debt)}
                          >
                            <Edit2 size={16} />
                          </button>
                          <button 
                            className="btn btn-icon btn-danger"
                            onClick={() => handleDelete(debt.id)}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile List */}
          <div className="md:hidden space-y-4">
            {sortedDebts.map((debt) => {
              const progress = debt.valor_inicial > 0 
                ? Math.min(100, Math.max(0, ((debt.valor_inicial - debt.valor_total) / debt.valor_inicial) * 100))
                : 0;
              
              return (
                <div key={debt.id} className="card p-4 space-y-4" style={{ backgroundColor: 'var(--card-bg)', borderRadius: '16px', border: '1px solid var(--card-border)' }}>
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-bold text-[1.25rem] text-white">{debt.nome}</h3>
                      <p className="text-[10px] text-slate-500 uppercase tracking-wider">
                        DATA: {formatDate(getNextPaymentDate(debt.data_pagamento).toISOString())}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-lg text-white">{formatCurrency(debt.valor_total)}</p>
                      <p className="text-xs text-red-500 font-medium">-{formatCurrency(debt.prestacao_mensal)}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <p className="text-[10px] text-slate-500 uppercase tracking-wider whitespace-nowrap">
                      PROGRESSO: {progress.toFixed(0)}%
                    </p>
                    <div className="flex-1 h-2 bg-slate-800 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-green-500 rounded-full" 
                        style={{ 
                          width: `${progress}%`,
                          boxShadow: '0 0 10px rgba(34, 197, 94, 0.5)'
                        }}
                      ></div>
                    </div>
                  </div>

                  <div className="flex items-center justify-center rounded-full border border-slate-800 bg-slate-900/50 overflow-hidden" style={{ height: 'calc(var(--spacing) * 10)' }}>
                    <button 
                      className="flex-1 h-full flex items-center justify-center hover:bg-white/5 transition-colors"
                      onClick={() => handleOpenModal(debt)}
                    >
                      <Edit2 size={18} className="text-blue-400" />
                    </button>
                    <div className="w-[1px] h-6 bg-slate-800"></div>
                    <button 
                      className="flex-1 h-full flex items-center justify-center hover:bg-white/5 transition-colors"
                      onClick={() => handleDelete(debt.id)}
                    >
                      <Trash2 size={18} className="text-red-400" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
          
          {debts.length === 0 && (
            <div className="card">
              <div className="empty-state">
                <CreditCard size={48} style={{ opacity: 0.3, marginBottom: '16px' }} />
                <p>Nenhuma dívida adicionada</p>
                <button className="btn btn-primary" style={{ marginTop: '16px' }} onClick={() => handleOpenModal()}>
                  <Plus size={18} />
                  Adicionar Dívida
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal animate-slideUp" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">
                {editingDebt ? 'Editar Dívida' : 'Nova Dívida'}
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
                  placeholder="Ex: Cartão Montepio..."
                  required
                />
              </div>

              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Valor Inicial (€)</label>
                  <input
                    type="number"
                    className="form-input"
                    value={formData.valor_inicial}
                    onChange={(e) => setFormData({ ...formData, valor_inicial: parseFloat(e.target.value) || 0 })}
                    step="0.01"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Valor Atual (€)</label>
                  <input
                    type="number"
                    className="form-input"
                    value={formData.valor_total}
                    onChange={(e) => setFormData({ ...formData, valor_total: parseFloat(e.target.value) || 0 })}
                    step="0.01"
                    required
                  />
                </div>
              </div>

              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Prestação Mensal (€)</label>
                  <input
                    type="number"
                    className="form-input"
                    value={formData.prestacao_mensal}
                    onChange={(e) => setFormData({ ...formData, prestacao_mensal: parseFloat(e.target.value) || 0 })}
                    step="0.01"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Data de Pagamento (dia do mês)</label>
                  <input
                    type="number"
                    className="form-input"
                    value={formData.data_pagamento}
                    onChange={(e) => setFormData({ ...formData, data_pagamento: parseInt(e.target.value) || 1 })}
                    min="1"
                    max="31"
                    required
                  />
                </div>
              </div>

              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Categoria</label>
                  <select
                    className="form-select"
                    value={formData.categoria}
                    onChange={(e) => setFormData({ ...formData, categoria: e.target.value })}
                  >
                    <option value="Cartão de Crédito">Cartão de Crédito</option>
                    <option value="Empréstimo">Empréstimo</option>
                    <option value="Impostos">Impostos</option>
                    <option value="Outro">Outro</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Conta</label>
                  <select
                    className="form-select"
                    value={formData.conta}
                    onChange={(e) => setFormData({ ...formData, conta: e.target.value })}
                  >
                    {accounts.map((acc) => (
                      <option key={acc.id} value={acc.nome}>{acc.nome}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Taxa de Juro (%)</label>
                  <input
                    type="number"
                    className="form-input"
                    value={formData.taxa_juro}
                    onChange={(e) => setFormData({ ...formData, taxa_juro: parseFloat(e.target.value) || 0 })}
                    step="0.1"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Data de Fim (opcional)</label>
                  <input
                    type="date"
                    className="form-input"
                    value={formData.data_fim}
                    onChange={(e) => setFormData({ ...formData, data_fim: e.target.value })}
                  />
                </div>
              </div>

              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={handleCloseModal}>
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingDebt ? 'Guardar' : 'Criar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default function DebtsPage() {
  return (
    <FinanceProvider>
      <DebtsContent />
    </FinanceProvider>
  );
}
