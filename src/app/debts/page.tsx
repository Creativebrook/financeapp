"use client";

import { useState } from 'react';
import { FinanceProvider, useFinance } from '@/context/FinanceContext';
import { useSidebar } from '@/context/SidebarContext';
import Sidebar from '@/components/Sidebar';
import PremiumHeader from '@/components/PremiumHeader';
import { Plus, Edit2, Trash2, CreditCard, X, AlertCircle, Calendar, Banknote, CalendarCheck, ChevronLeft, ChevronRight, Eye, Trash } from 'lucide-react';
import { formatCurrency, getNextPaymentDate, formatDate } from '@/lib/utils';
import { getCardAccent } from '@/lib/theme';
import { Debt } from '@/types';

function DebtsContent() {
  const { debts, addDebt, updateDebt, deleteDebt, accounts, getDashboardSummary } = useFinance();
  const { isCollapsed } = useSidebar();
  const summary = getDashboardSummary();
  const monthlyIncome = summary.monthlyIncome;
  const [activeCardIndex, setActiveCardIndex] = useState(0);
  const [showCreditCardModal, setShowCreditCardModal] = useState(false);
  const [creditCardFormData, setCreditCardFormData] = useState({
    nome: '',
    valor_total: 0,
    valor_inicial: 0,
    taxa_juro: 0,
  });

  const creditCards = debts.filter(d => d.categoria === 'Cartão de Crédito');

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
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [debtToDelete, setDebtToDelete] = useState<string | null>(null);
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
  const totalInitialDebt = debts.reduce((sum, d) => sum + (d.valor_inicial || d.valor_total), 0);
  const debtPercentage = totalInitialDebt > 0 ? (totalDebt / totalInitialDebt) * 100 : 0;
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
      const defaultCategory = 'Cartão de Crédito';
      const firstCreditCard = creditCards[0];
      
      setFormData({
        nome: '',
        valor_total: 0,
        valor_inicial: 0,
        prestacao_mensal: 0,
        data_pagamento: 1,
        conta: firstCreditCard ? firstCreditCard.nome : (accounts[0]?.nome || 'Montepio'),
        categoria: defaultCategory,
        taxa_juro: firstCreditCard ? (firstCreditCard.taxa_juro || 0) : 0,
        data_fim: '',
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingDebt(null);
  };

  const handleOpenCreditCardModal = () => {
    setCreditCardFormData({
      nome: '',
      valor_total: 0,
      valor_inicial: 0,
      taxa_juro: 0,
    });
    setShowCreditCardModal(true);
  };

  const handleCloseCreditCardModal = () => {
    setShowCreditCardModal(false);
  };

  const handleCreditCardSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const debtData = {
      nome: creditCardFormData.nome,
      valor_total: creditCardFormData.valor_total,
      valor_inicial: creditCardFormData.valor_inicial,
      prestacao_mensal: 0, // Default for credit card added this way
      data_pagamento: 1, // Default for credit card added this way
      conta: accounts[0]?.nome || 'Montepio',
      categoria: 'Cartão de Crédito',
      taxa_juro: creditCardFormData.taxa_juro || undefined,
    };
    
    addDebt(debtData);
    handleCloseCreditCardModal();
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
    setDebtToDelete(id);
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    if (debtToDelete) {
      deleteDebt(debtToDelete);
      setShowDeleteModal(false);
      setDebtToDelete(null);
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
            <p className="page-subtitle">Gerencie as suas dívidas e empréstimos</p>
          </div>
          <button className="btn btn-primary" style={{ float: 'right', marginTop: '-8px' }} onClick={() => handleOpenModal()}>
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M5 12h14"></path>
              <path d="M12 5v14"></path>
            </svg>
            Nova Dívida
          </button>
        </div>

        {/* Summary Cards - Four Columns with Spans */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-[30px] md:mt-0" style={{ marginBottom: '24px' }}>
          <div className="card animate-slideUp lg:col-span-2" style={{ 
            background: 'linear-gradient(to bottom, var(--card-hero-bg-start) 0%, var(--card-hero-bg-mid) 55%, var(--card-hero-bg-end) 100%)', 
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
                  {debtPercentage.toFixed(1)}%
                </div>
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 500 }}>
                TOTAL INICIAL: {formatCurrency(totalInitialDebt)}
              </div>
            </div>

            <div style={{ width: '100%', height: '6px', backgroundColor: 'rgba(255, 255, 255, 0.05)', borderRadius: '3px', overflow: 'hidden', marginBottom: '16px' }}>
              <div style={{ width: `${debtPercentage}%`, height: '100%', backgroundColor: '#6f6af8', borderRadius: '3px' }}></div>
            </div>

            <div className="text-[0.6rem] md:text-[0.75rem]" style={{ color: 'var(--text-secondary)', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              PREVISÃO DE FINALIZAÇÃO: <span style={{ color: 'rgb(111, 106, 248)' }}>{formattedPayoffDate} ({maxMonths} meses)</span>
            </div>
          </div>

          <div className="card animate-slideUp lg:col-span-1" style={{ 
            background: 'linear-gradient(to bottom, var(--card-hero-bg-start) 0%, var(--card-hero-bg-mid) 55%, var(--card-hero-bg-end) 100%)', 
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

          {/* Card 3: Credit Cards (1 column) */}
          <div className="card animate-slideUp lg:col-span-1" style={{ 
            background: 'linear-gradient(to bottom, var(--card-hero-bg-start) 0%, var(--card-hero-bg-mid) 55%, var(--card-hero-bg-end) 100%)', 
            borderRadius: '8px', 
            border: '1px solid var(--card-border)', 
            padding: '24px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            minHeight: '240px'
          }}>
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-white/[0.03] border border-white/[0.05] flex items-center justify-center">
                  <CreditCard size={16} className="text-slate-400" />
                </div>
                <p className="text-[10px] text-slate-500 uppercase tracking-[0.2em]">CARTÕES DE CRÉDITO</p>
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={() => handleOpenCreditCardModal()}
                  className="w-8 h-8 rounded-full bg-white/[0.03] border border-white/[0.08] flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/[0.1] transition-all"
                >
                  <Plus size={16} />
                </button>
                {creditCards.length > 0 && (
                  <>
                    <button 
                      onClick={() => setActiveCardIndex(activeCardIndex === 0 ? creditCards.length - 1 : activeCardIndex - 1)}
                      className="w-8 h-8 rounded-full bg-white/[0.03] border border-white/[0.08] flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/[0.1] transition-all"
                    >
                      <ChevronLeft size={16} />
                    </button>
                    <button 
                      onClick={() => setActiveCardIndex(activeCardIndex === creditCards.length - 1 ? 0 : activeCardIndex + 1)}
                      className="w-8 h-8 rounded-full bg-white/[0.03] border border-white/[0.08] flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/[0.1] transition-all"
                    >
                      <ChevronRight size={16} />
                    </button>
                  </>
                )}
              </div>
            </div>

            {creditCards.length > 0 ? (
              <div
                className="w-full aspect-[1.58/1] rounded-md p-6 relative overflow-hidden border-l-[3px] transition-all duration-500"
                style={{
                  backgroundColor: 'var(--bg-surface-2)',
                  borderLeftColor: `var(${getCardAccent(accounts.length + activeCardIndex)})`,
                  backgroundImage: `linear-gradient(90deg, color-mix(in srgb, var(${getCardAccent(accounts.length + activeCardIndex)}) 8%, transparent), transparent 40%)`,
                  boxShadow: `0 0 18px color-mix(in srgb, var(${getCardAccent(accounts.length + activeCardIndex)}) 25%, transparent)`
                }}
              >
                <div className="flex justify-between items-start relative z-10">
                  <span className="text-white font-black italic text-xl tracking-tighter opacity-90">{creditCards[activeCardIndex].nome.split(' ')[0]}</span>
                  <button 
                    onClick={() => handleDelete(creditCards[activeCardIndex].id)}
                    className="text-white/40 hover:text-white/80 transition-colors"
                  >
                    <X size={16} />
                  </button>
                </div>
                <div className="mt-4 relative z-10">
                  <p className="text-[10px] text-white/50 font-bold uppercase tracking-[0.2em]">{creditCards[activeCardIndex].nome}</p>
                  <div className="flex items-center gap-3 mt-2">
                    <h4 className="text-2xl font-bold text-white tracking-tight">{formatCurrency(creditCards[activeCardIndex].valor_total)}</h4>
                    <div style={{ 
                      backgroundColor: 'rgba(255, 255, 255, 0.1)', 
                      borderRadius: '4px', 
                      padding: '2px 6px', 
                      fontSize: '0.7rem', 
                      color: 'white', 
                      fontWeight: 600 
                    }}>
                      {creditCards[activeCardIndex].valor_inicial > 0 
                        ? ((creditCards[activeCardIndex].valor_total / creditCards[activeCardIndex].valor_inicial) * 100).toFixed(1) 
                        : 0}%
                    </div>
                  </div>
                </div>
                <div className="mt-auto pt-4 relative z-10">
                  <p className="text-sm text-white/90 font-mono tracking-[0.3em]">**** **** **** {creditCards[activeCardIndex].id.slice(-4)}</p>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-slate-500">
                <CreditCard size={32} className="mb-2 opacity-20" />
                <p className="text-[10px] uppercase tracking-widest">Sem cartões registados</p>
              </div>
            )}
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
                    <th>TOTAL</th>
                    <th>PRESTAÇÃO</th>
                    <th>PESO</th>
                    <th>DATA</th>
                    <th>CONTA</th>
                    <th>Ações</th>
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
                      <td>
                        <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--accent-danger)' }}>
                          {formatCurrency(debt.valor_total)}
                        </span>
                      </td>
                      <td>
                        <span style={{ fontSize: '0.9rem' }}>{formatCurrency(debt.prestacao_mensal)}</span>
                      </td>
                      <td>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          {monthlyIncome > 0 ? ((debt.prestacao_mensal / monthlyIncome) * 100).toFixed(1) : 0}%
                        </span>
                      </td>
                      <td>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '-5px' }}>
                          {formatDate(getNextPaymentDate(debt.data_pagamento).toISOString())}
                        </div>
                      </td>
                      <td>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{debt.conta}</span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-start' }}>
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
        {/* Delete Confirmation Modal */}
        {showDeleteModal && (
          <div className="modal-overlay">
            <div className="modal-content animate-scaleIn" style={{ maxWidth: '400px' }}>
              <div className="modal-header">
                <h3 className="modal-title">Confirmar Eliminação</h3>
                <button className="modal-close" onClick={() => setShowDeleteModal(false)}>
                  <X size={20} />
                </button>
              </div>
              
              <div className="modal-body">
                <div className="flex flex-col items-center text-center py-4">
                  <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mb-4">
                    <AlertCircle size={32} className="text-red-500" />
                  </div>
                  <p className="text-white font-medium mb-2">Tem a certeza que deseja eliminar?</p>
                  <p className="text-slate-400 text-sm">Esta ação não pode ser desfeita e os dados serão removidos permanentemente.</p>
                </div>
              </div>
              
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowDeleteModal(false)}>
                  Cancelar
                </button>
                <button 
                  type="button" 
                  className="btn btn-danger" 
                  onClick={confirmDelete}
                >
                  Eliminar permanentemente
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Credit Card Modal */}
        {showCreditCardModal && (
          <div className="modal-overlay">
            <div className="modal-content animate-scaleIn" style={{ maxWidth: '450px' }}>
              <div className="modal-header">
                <h3 className="modal-title">Adicionar Cartão de Crédito</h3>
                <button className="modal-close" onClick={handleCloseCreditCardModal}>
                  <X size={20} />
                </button>
              </div>
              
              <form onSubmit={handleCreditCardSubmit}>
                <div className="modal-body">
                  <div className="form-group">
                    <label className="form-label">Nome do Cartão</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      value={creditCardFormData.nome}
                      onChange={(e) => setCreditCardFormData({...creditCardFormData, nome: e.target.value})}
                      placeholder="Ex: Cartão Visa Montepio"
                      required
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="form-group">
                      <label className="form-label">Montante Máximo (€)</label>
                      <input 
                        type="number" 
                        className="form-input" 
                        value={creditCardFormData.valor_inicial}
                        onChange={(e) => setCreditCardFormData({...creditCardFormData, valor_inicial: Number(e.target.value)})}
                        placeholder="Ex: 5000"
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Saldo Atual (Dívida) (€)</label>
                      <input 
                        type="number" 
                        className="form-input" 
                        value={creditCardFormData.valor_total}
                        onChange={(e) => setCreditCardFormData({...creditCardFormData, valor_total: Number(e.target.value)})}
                        placeholder="Ex: 1500"
                        required
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Taxa de Juro (% TAEG)</label>
                    <input 
                      type="number" 
                      step="0.01"
                      className="form-input" 
                      value={creditCardFormData.taxa_juro}
                      onChange={(e) => setCreditCardFormData({...creditCardFormData, taxa_juro: Number(e.target.value)})}
                      placeholder="Ex: 15.5"
                    />
                  </div>
                </div>
                
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={handleCloseCreditCardModal}>
                    Cancelar
                  </button>
                  <button type="submit" className="btn btn-primary">
                    Adicionar Cartão
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

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
                  <label className="form-label">Dia de Pagamento</label>
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
                    onChange={(e) => {
                      const newCategory = e.target.value;
                      let newTaxa = formData.taxa_juro;
                      let newConta = formData.conta;

                      if (newCategory === 'Cartão de Crédito' && creditCards.length > 0) {
                        const card = creditCards.find(c => c.nome === newConta) || creditCards[0];
                        newConta = card.nome;
                        newTaxa = card.taxa_juro || 0;
                      }

                      setFormData({ 
                        ...formData, 
                        categoria: newCategory,
                        conta: newConta,
                        taxa_juro: newTaxa
                      });
                    }}
                  >
                    <option value="Cartão de Crédito">Cartão de Crédito</option>
                    <option value="Empréstimo">Empréstimo</option>
                    <option value="Impostos">Impostos</option>
                    <option value="Serviços">Serviços</option>
                    <option value="Outro">Outro</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">{formData.categoria === 'Cartão de Crédito' ? 'Cartão' : 'Conta'}</label>
                  <select
                    className="form-select"
                    value={formData.conta}
                    onChange={(e) => {
                      const newConta = e.target.value;
                      let newTaxa = formData.taxa_juro;

                      if (formData.categoria === 'Cartão de Crédito') {
                        const card = creditCards.find(c => c.nome === newConta);
                        if (card) {
                          newTaxa = card.taxa_juro || 0;
                        }
                      }

                      setFormData({ ...formData, conta: newConta, taxa_juro: newTaxa });
                    }}
                  >
                    {formData.categoria === 'Cartão de Crédito' ? (
                      creditCards.map((card) => (
                        <option key={card.id} value={card.nome}>{card.nome}</option>
                      ))
                    ) : (
                      accounts.map((acc) => (
                        <option key={acc.id} value={acc.nome}>{acc.nome}</option>
                      ))
                    )}
                  </select>
                </div>
              </div>

              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Taxa de Juro (%)</label>
                  <input
                    type="number"
                    className={`form-input ${formData.categoria === 'Cartão de Crédito' ? 'bg-slate-800/50 cursor-not-allowed opacity-70' : ''}`}
                    value={formData.taxa_juro}
                    onChange={(e) => setFormData({ ...formData, taxa_juro: parseFloat(e.target.value) || 0 })}
                    step="0.1"
                    readOnly={formData.categoria === 'Cartão de Crédito'}
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
