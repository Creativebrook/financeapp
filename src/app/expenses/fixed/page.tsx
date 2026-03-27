"use client";

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { FinanceProvider, useFinance } from '@/context/FinanceContext';
import { useSidebar } from '@/context/SidebarContext';
import Sidebar from '@/components/Sidebar';
import PremiumHeader from '@/components/PremiumHeader';
import { Plus, Edit2, Trash2, Receipt, X, Calendar, ReceiptEuro, Layers2, ChevronLeft, ChevronRight } from 'lucide-react';
import { formatCurrency, getNextPaymentDate, formatDate, getPlatformColor, getCategoryColor } from '@/lib/utils';
import { getPieChartColor } from '@/lib/theme';
import { FixedExpense, Frequencia } from '@/types';

const FixedExpensesCategoryBarChart = dynamic(() => import('@/components/charts/FixedExpensesCategoryBarChart'), { ssr: false });

function FixedExpensesContent() {
  const { fixedExpenses, addFixedExpense, updateFixedExpense, deleteFixedExpense, variableExpenses, updateVariableExpense, deleteVariableExpense, accounts, income, selectedMonth } = useFinance();
  const { isCollapsed } = useSidebar();
  const today = new Date('2026-03-25T00:00:00Z');
  
  const getMonthName = (monthYear: string) => {
    const [y, m] = monthYear.split('-');
    const date = new Date(parseInt(y), parseInt(m) - 1, 1);
    return date.toLocaleString('pt-PT', { month: 'long', year: 'numeric' }).toUpperCase();
  };

  const getOnlyMonthName = (monthYear: string) => {
    const [y, m] = monthYear.split('-');
    const date = new Date(parseInt(y), parseInt(m) - 1, 1);
    return date.toLocaleString('pt-PT', { month: 'long' }).toUpperCase();
  };

  const [showModal, setShowModal] = useState(false);
  const [editingExpense, setEditingExpense] = useState<any>(null);
  const [isEditingHistory, setIsEditingHistory] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [prevMonth, setPrevMonth] = useState(selectedMonth);

  if (selectedMonth !== prevMonth) {
    setPrevMonth(selectedMonth);
    setCurrentPage(1);
  }

  const itemsPerPage = 10;
  const [formData, setFormData] = useState({
    nome: '',
    valor: 0,
    frequencia: 'mensal' as Frequencia,
    data_pagamento: 1,
    data: '', // for history items
    conta: 'Montepio',
    categoria: 'Subscrição',
    data_inicio: '',
    data_fim: '',
  });

  const calculateMonthlyEquivalent = (expense: FixedExpense): number => {
    switch (expense.frequencia) {
      case 'mensal': return expense.valor;
      case 'quinzenal': return expense.valor * 2;
      case 'semanal': return expense.valor * 4;
      case 'trimestral': return expense.valor / 3;
      case 'semestral': return expense.valor / 6;
      case 'anual': return expense.valor / 12;
      default: return expense.valor;
    }
  };

  // Filter history by selected month and exclude future/incorrect items
  const filteredHistory = variableExpenses
    .filter(v => v && v.categoria === 'Fixa' && v.data && v.data.startsWith(selectedMonth))
    .filter(v => {
      if (!v) return false;
      // Remove "Pensão Alimentos" on 2026-03-28 specifically as requested
      if (v.nome === 'Pensão Alimentos' && v.data === '2026-03-28') return false;
      // Also ensure we don't show future expenses in the history table
      return v.data <= today.toISOString().split('T')[0];
    })
    .sort((a, b) => {
      if (!a || !b || !a.data || !b.data) return 0;
      return new Date(b.data).getTime() - new Date(a.data).getTime();
    });

  // Pagination logic
  const totalPages = Math.ceil(filteredHistory.length / itemsPerPage);
  const paginatedExpenses = filteredHistory.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  // Summary calculations for the selected month
  const totalMonthly = filteredHistory.reduce((sum, e) => sum + e.valor, 0);

  // Montepio specific calculations
  const montepioFixedExpenses = filteredHistory
    .filter(e => e.conta === 'Montepio')
    .reduce((sum, e) => sum + e.valor, 0);

  // Use the same logic as Income page for received so far
  const currentMonthStr = today.toISOString().substring(0, 7);
  
  let effectiveDay = today.getDate();
  if (selectedMonth < currentMonthStr) {
    effectiveDay = 32;
  } else if (selectedMonth > currentMonthStr) {
    effectiveDay = -1;
  }

  const montepioIncomeReceived = income
    .filter(inc => inc.conta === 'Montepio' && !inc.nome.toLowerCase().includes('valor transportado'))
    .filter(i => {
      if (!i) return false;
      if (i.frequencia === 'unico' && i.data_especifica) {
        if (!i.data_especifica.startsWith(selectedMonth)) return false;
        const day = parseInt(i.data_especifica.split('-')[2]);
        return day <= effectiveDay;
      }
      if (i.frequencia === 'mensal') {
        if (i.data_inicio && i.data_inicio > `${selectedMonth}-31`) return false;
        if (i.data_fim && i.data_fim < `${selectedMonth}-01`) return false;
        return i.data <= effectiveDay;
      }
      return false;
    })
    .reduce((sum, i) => sum + i.valor, 0);

  const montepioPercentage = montepioIncomeReceived > 0 ? (montepioFixedExpenses / montepioIncomeReceived) * 100 : 0;

  // Total available calculations
  const totalAvailable = accounts.reduce((sum, acc) => sum + acc.saldo, 0);
  const totalPercentage = totalAvailable > 0 ? (totalMonthly / totalAvailable) * 100 : 0;
  
  const getOriginalCategory = (name: string) => {
    const original = fixedExpenses.find(f => f.nome === name);
    return original ? original.categoria : 'Subscrição';
  };

  // Filter fixed expenses by selected month
  const filteredFixedExpenses = fixedExpenses.filter(e => {
    if (!e) return false;
    if (e.data_inicio && e.data_inicio > `${selectedMonth}-31`) return false;
    if (e.data_fim && e.data_fim < `${selectedMonth}-01`) return false;
    return true;
  });

  // Upcoming expenses (next 4, even if next month) - User said NOT TO CHANGE LOGIC
  const upcomingFixedExpenses = filteredFixedExpenses
    .map(e => ({ ...e, nextDate: getNextPaymentDate(e.data_pagamento) }))
    .sort((a, b) => a.nextDate.getTime() - b.nextDate.getTime())
    .slice(0, 4);

  const categoryData = Object.entries(
    filteredHistory.reduce((acc, e) => {
      const cat = getOriginalCategory(e.nome);
      acc[cat] = (acc[cat] || 0) + e.valor;
      return acc;
    }, {} as Record<string, number>)
  ).map(([name, value]) => ({
    name,
    value,
    percent: totalMonthly > 0 ? Math.round((value / totalMonthly) * 100) : 0
  })).sort((a, b) => b.value - a.value);

  const handleOpenModal = (expense?: any, isHistory: boolean = false) => {
    setIsEditingHistory(isHistory);
    if (expense) {
      setEditingExpense(expense);
      if (isHistory) {
        setFormData({
          nome: expense.nome,
          valor: expense.valor,
          frequencia: 'mensal', // Default for history
          data_pagamento: new Date(expense.data).getDate(),
          data: expense.data,
          conta: expense.conta,
          categoria: 'Fixa',
          data_inicio: '',
          data_fim: '',
        });
      } else {
        setFormData({
          nome: expense.nome,
          valor: expense.valor,
          frequencia: expense.frequencia,
          data_pagamento: expense.data_pagamento,
          data: '',
          conta: expense.conta,
          categoria: expense.categoria,
          data_inicio: expense.data_inicio || '',
          data_fim: expense.data_fim || '',
        });
      }
    } else {
      setEditingExpense(null);
      setFormData({
        nome: '',
        valor: 0,
        frequencia: 'mensal',
        data_pagamento: 1,
        data: new Date().toISOString().split('T')[0],
        conta: accounts[0]?.nome || 'Montepio',
        categoria: 'Subscrição',
        data_inicio: '',
        data_fim: '',
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingExpense(null);
    setIsEditingHistory(false);
  };

  const handleEndRecurring = () => {
    if (editingExpense && !isEditingHistory) {
      const todayStr = new Date().toISOString().split('T')[0];
      updateFixedExpense(editingExpense.id, { ...formData, data_fim: todayStr });
      handleCloseModal();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingExpense) {
      if (isEditingHistory) {
        updateVariableExpense(editingExpense.id, {
          nome: formData.nome,
          valor: formData.valor,
          data: formData.data,
          conta: formData.conta,
          categoria: 'Fixa'
        });
      } else {
        updateFixedExpense(editingExpense.id, {
          nome: formData.nome,
          valor: formData.valor,
          frequencia: formData.frequencia,
          data_pagamento: formData.data_pagamento,
          conta: formData.conta,
          categoria: formData.categoria,
          data_inicio: formData.data_inicio,
          data_fim: formData.data_fim
        });
      }
    } else {
      addFixedExpense({
        nome: formData.nome,
        valor: formData.valor,
        frequencia: formData.frequencia,
        data_pagamento: formData.data_pagamento,
        conta: formData.conta,
        categoria: formData.categoria,
        data_inicio: formData.data_inicio,
        data_fim: formData.data_fim
      });
    }
    handleCloseModal();
  };

  const handleDelete = (id: string, isHistory: boolean = false) => {
    if (confirm('Tem certeza que deseja eliminar esta despesa?')) {
      if (isHistory) {
        deleteVariableExpense(id);
      } else {
        deleteFixedExpense(id);
      }
    }
  };

  const getFrequencyBadge = (freq: Frequencia) => {
    switch (freq) {
      case 'mensal': return 'badge-primary';
      case 'quinzenal': return 'badge-secondary';
      case 'semanal': return 'badge-secondary';
      case 'trimestral': return 'badge-warning';
      case 'semestral': return 'badge-info';
      case 'anual': return 'badge-success';
      default: return '';
    }
  };

  return (
    <div className="app-container">
      <Sidebar />
      
      <main className={`main-content ${isCollapsed ? 'sidebar-collapsed' : ''}`}>
        <PremiumHeader pageName="Despesas Fixas" />
        
        <div className="page-header animate-fadeIn" style={{ paddingBottom: '20px' }}>
          <div style={{ float: 'left' }}>
            <h1 className="page-title" style={{ fontSize: '1.5rem', lineHeight: 0.5 }}>Despesas Fixas</h1>
            <p className="page-subtitle">Gerencie as suas despesas fixas e subscrições</p>
          </div>
          <button className="btn btn-primary" style={{ float: 'right', marginTop: '-8px' }} onClick={() => handleOpenModal()}>
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M5 12h14"></path>
              <path d="M12 5v14"></path>
            </svg>
            Nova Despesa
          </button>
        </div>

        {/* Summary Cards */}
        <div className="stats-grid grid grid-cols-1 md:grid-cols-3 gap-6 mb-6 mt-[30px] md:mt-0">
          {/* Card 1: Total Expenses */}
          <div className="card animate-slideUp" style={{ padding: '24px', display: 'flex', flexDirection: 'column' }}>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-9 h-9 rounded-full bg-white/[0.03] border border-white/[0.05] flex items-center justify-center">
                <ReceiptEuro size={16} className="text-slate-400" />
              </div>
              <p className="text-[10px] text-slate-500 uppercase tracking-[0.2em]">DESPESAS DE {getOnlyMonthName(selectedMonth)}</p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', flex: 1, justifyContent: 'center' }}>
              {/* Montepio Section */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-[10px] text-slate-500 uppercase tracking-[0.1em]">CONTA ORDENADO</span>
                </div>
                <div className="text-2xl font-bold text-white mb-3" style={{ fontFamily: 'Inter, sans-serif' }}>
                  {formatCurrency(montepioFixedExpenses)}
                </div>
                <div className="w-full h-1.5 bg-white/[0.03] rounded-full overflow-hidden border border-white/[0.02] mb-2">
                  <div className="h-full rounded-full" style={{ 
                    width: `${Math.min(100, montepioPercentage)}%`,
                    background: 'linear-gradient(to right, var(--danger-500), var(--danger-400))'
                  }}></div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[9px] text-slate-600 uppercase tracking-wider">VS INCOME CONTA ORDENADO</span>
                  <span className="text-[10px] font-semibold" style={{ color: 'var(--danger-400)' }}>{montepioPercentage.toFixed(1)}%</span>
                </div>
              </div>

              <div style={{ height: '1px', background: 'var(--border-subtle)', width: '100%' }}></div>

              {/* All Accounts Section */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-[10px] text-slate-500 uppercase tracking-[0.1em]">TODAS AS CONTAS</span>
                </div>
                <div className="text-2xl font-bold text-white mb-3" style={{ fontFamily: 'Inter, sans-serif' }}>
                  {formatCurrency(totalMonthly)}
                </div>
                <div className="w-full h-1.5 bg-white/[0.03] rounded-full overflow-hidden border border-white/[0.02] mb-2">
                  <div className="h-full rounded-full" style={{ 
                    width: `${Math.min(100, totalPercentage)}%`,
                    background: 'linear-gradient(to right, var(--warning-500), var(--warning-400))'
                  }}></div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[9px] text-slate-600 uppercase tracking-wider">VS TOTAL DO MÊS</span>
                  <span className="text-[10px] font-semibold" style={{ color: 'var(--warning-400)' }}>{totalPercentage.toFixed(1)}%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Card 2: Category Bar Chart */}
          <div className="card animate-slideUp flex flex-col" style={{ padding: '24px' }}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 rounded-full bg-white/[0.03] border border-white/[0.05] flex items-center justify-center">
                <Layers2 size={16} className="text-slate-400" />
              </div>
              <p className="text-[10px] text-slate-500 uppercase tracking-[0.2em]">DESPESAS POR CATEGORIA</p>
            </div>
            
            <div style={{ height: '220px', width: '100%', position: 'relative' }}>
              <FixedExpensesCategoryBarChart data={categoryData} />
            </div>

            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: '1fr 1fr', 
              gap: '8px 16px', 
              marginTop: '16px' 
            }}>
              {categoryData.slice(0, 8).map((entry, index) => (
                <div key={index} className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: getCategoryColor(entry.name) }} />
                  <div className="flex justify-between items-center flex-1 min-w-0">
                    <span className="text-[10px] text-slate-400 truncate mr-2">{entry.name}</span>
                    <span className="text-[10px] text-slate-500 font-medium">{entry.percent}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Card 3: Upcoming Expenses */}
          <div className="card animate-slideUp">
            <div className="card-header">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-white/[0.03] border border-white/[0.05] flex items-center justify-center">
                  <Calendar size={16} className="text-slate-400" />
                </div>
                <p className="text-[10px] text-slate-500 uppercase tracking-[0.2em]">PROXIMAS DESPESAS</p>
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {upcomingFixedExpenses.map((expense, index) => (
                <div
                  key={index}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '14px 16px',
                    background: 'rgba(255, 255, 255, 0.02)',
                    borderRadius: '12px',
                    border: '1px solid rgba(255, 255, 255, 0.03)',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 500, fontSize: '0.9375rem', color: 'white' }}>{expense.nome}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {formatDate(expense.nextDate.toISOString())}
                    </div>
                  </div>
                  <div style={{ 
                    fontWeight: 500,
                    fontSize: '0.9375rem',
                    color: 'var(--warning-400)'
                  }}>
                    -{formatCurrency(expense.valor)}
                  </div>
                </div>
              ))}
              {upcomingFixedExpenses.length === 0 && (
                <p className="text-center text-slate-500 text-sm py-4">Não há despesas próximas</p>
              )}
            </div>
          </div>
        </div>

        {/* Expenses Table */}
        <div className="card animate-slideUp hidden md:block">
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th style={{ textAlign: 'left' }}>Nome</th>
                  <th style={{ textAlign: 'left' }}>Valor</th>
                  <th style={{ textAlign: 'left' }}>Frequência</th>
                  <th style={{ textAlign: 'left' }}>Data</th>
                  <th style={{ textAlign: 'left' }}>Peso</th>
                  <th style={{ textAlign: 'left' }}>Conta</th>
                  <th style={{ textAlign: 'left' }}>Categoria</th>
                  <th style={{ textAlign: 'left' }}>Ações</th>
                </tr>
              </thead>
              <tbody>
                {paginatedExpenses.map((expense) => {
                  const expenseDate = new Date(expense.data);
                  const month = expenseDate.getMonth();
                  const year = expenseDate.getFullYear();
                  
                  // Calculate total fixed expenses for that specific month
                  const monthTotal = variableExpenses
                    .filter(v => v && v.categoria === 'Fixa' && new Date(v.data).getMonth() === month && new Date(v.data).getFullYear() === year)
                    .reduce((sum, v) => sum + v.valor, 0);
                  
                  const peso = monthTotal > 0 ? (expense.valor / monthTotal) * 100 : 0;
                  const originalExpense = fixedExpenses.find(f => f.nome === expense.nome);
                  const frequencia = originalExpense ? originalExpense.frequencia : 'mensal';
                  const categoria = originalExpense ? originalExpense.categoria : 'Subscrição';

                  return (
                    <tr key={expense.id}>
                      <td style={{ textAlign: 'left' }}>
                        <div style={{ fontWeight: 400, fontSize: '0.9rem' }}>{expense.nome}</div>
                      </td>
                      <td style={{ textAlign: 'left' }}>
                        <span style={{ fontWeight: 600, fontSize: '0.9rem', color: 'white' }}>
                          -{formatCurrency(expense.valor)}
                        </span>
                      </td>
                      <td style={{ textAlign: 'left' }}>
                        <span className={`badge ${getFrequencyBadge(frequencia as Frequencia)}`} style={{ fontSize: '0.65rem' }}>
                          {frequencia}
                        </span>
                      </td>
                      <td style={{ textAlign: 'left' }}>
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                          {formatDate(expense.data)}
                        </span>
                      </td>
                      <td style={{ textAlign: 'left' }}>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          {peso.toFixed(1)}%
                        </span>
                      </td>
                      <td style={{ textAlign: 'left' }}>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{expense.conta}</span>
                      </td>
                      <td style={{ textAlign: 'left' }}>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{categoria}</span>
                      </td>
                      <td style={{ textAlign: 'left' }}>
                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-start' }}>
                          <button 
                            className="btn btn-icon btn-secondary"
                            onClick={() => handleOpenModal(expense, true)}
                          >
                            <Edit2 size={16} />
                          </button>
                          <button 
                            className="btn btn-icon btn-danger"
                            onClick={() => handleDelete(expense.id, true)}
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
            
            {filteredHistory.length === 0 && (
              <div className="empty-state">
                <Receipt size={48} style={{ opacity: 0.3, marginBottom: '16px' }} />
                <p>Nenhuma despesa fixa encontrada para este mês</p>
                <button className="btn btn-primary" style={{ marginTop: '16px' }} onClick={() => handleOpenModal()}>
                  <Plus size={18} />
                  Adicionar Despesa
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Mobile List */}
        <div className="md:hidden space-y-3">
          {paginatedExpenses.map((expense) => {
            const expenseDate = new Date(expense.data);
            const month = expenseDate.getMonth();
            const year = expenseDate.getFullYear();
            
            const monthTotal = variableExpenses
              .filter(v => v && v.categoria === 'Fixa' && new Date(v.data).getMonth() === month && new Date(v.data).getFullYear() === year)
              .reduce((sum, v) => sum + v.valor, 0);
            
            const weight = monthTotal > 0 ? (expense.valor / monthTotal) * 100 : 0;
            const originalExpense = fixedExpenses.find(f => f.nome === expense.nome);
            const frequencia = originalExpense ? originalExpense.frequencia : 'mensal';
            const categoria = originalExpense ? originalExpense.categoria : 'Subscrição';

            return (
              <div key={expense.id} className="card p-4 space-y-3" style={{ backgroundColor: 'var(--card-bg)', borderRadius: '16px', border: '1px solid var(--card-border)' }}>
                {/* Line 1: Name and Value */}
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold !text-[1rem] text-white leading-tight">{expense.nome}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`badge ${getFrequencyBadge(frequencia as Frequencia)}`} style={{ fontSize: '0.6rem', padding: '1px 6px' }}>
                        {frequencia}
                      </span>
                      <span className="text-[10px] text-slate-500 uppercase tracking-wider">
                        {categoria}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold !text-[1rem] text-white leading-tight">-{formatCurrency(expense.valor)}</p>
                    <p className="text-[10px] text-slate-500 uppercase tracking-wider mt-0.5">
                      {formatDate(expense.data)}
                    </p>
                  </div>
                </div>

                {/* Line 3: Progress Bar (Weight) */}
                <div className="flex items-center gap-3">
                  <p className="text-[10px] text-slate-500 uppercase tracking-wider whitespace-nowrap">
                    PESO: {weight.toFixed(1)}%
                  </p>
                  <div className="flex-1 h-1.5 bg-slate-800/50 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-blue-500 rounded-full" 
                      style={{ 
                        width: `${weight}%`,
                        boxShadow: '0 0 8px rgba(59, 130, 246, 0.4)'
                      }}
                    ></div>
                  </div>
                </div>

                {/* Line 4: Actions */}
                <div className="pt-1">
                  <div className="flex items-center justify-center rounded-xl border border-slate-800 bg-slate-900/30 overflow-hidden" style={{ height: '40px' }}>
                    <button 
                      className="flex-1 h-full flex items-center justify-center hover:bg-white/5 transition-colors"
                      onClick={() => handleOpenModal(expense, true)}
                    >
                      <Edit2 size={18} className="text-blue-400/80" />
                    </button>
                    <div className="w-[1px] h-6 bg-slate-800/50"></div>
                    <button 
                      className="flex-1 h-full flex items-center justify-center hover:bg-white/5 transition-colors"
                      onClick={() => handleDelete(expense.id, true)}
                    >
                      <Trash2 size={18} className="text-red-400/80" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}

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
        </div>
      </main>

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal animate-slideUp" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">
                {editingExpense ? 'Editar Despesa' : 'Nova Despesa Fixa'}
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
                  placeholder="Ex: ChatGPT, Ginásio..."
                  required
                />
              </div>

              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Valor (€)</label>
                  <input
                    type="number"
                    className="form-input"
                    value={formData.valor}
                    onChange={(e) => setFormData({ ...formData, valor: parseFloat(e.target.value) || 0 })}
                    step="0.01"
                    required
                  />
                </div>

                {!isEditingHistory && (
                  <div className="form-group">
                    <label className="form-label">Frequência</label>
                    <select
                      className="form-select"
                      value={formData.frequencia}
                      onChange={(e) => setFormData({ ...formData, frequencia: e.target.value as Frequencia })}
                    >
                      <option value="mensal">Mensal</option>
                      <option value="trimestral">Trimestral</option>
                      <option value="semestral">Semestral</option>
                      <option value="anual">Anual</option>
                    </select>
                  </div>
                )}
                {isEditingHistory && (
                  <div className="form-group">
                    <label className="form-label">Data</label>
                    <input
                      type="date"
                      className="form-input"
                      value={formData.data}
                      onChange={(e) => setFormData({ ...formData, data: e.target.value })}
                      required
                    />
                  </div>
                )}
              </div>

              <div className="grid-2">
                {!isEditingHistory && (
                  <div className="form-group">
                    <label className="form-label">Data de Pagamento (dia)</label>
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
                )}

                {!isEditingHistory && (
                  <div className="form-group">
                    <label className="form-label">Categoria</label>
                    <select
                      className="form-select"
                      value={formData.categoria}
                      onChange={(e) => setFormData({ ...formData, categoria: e.target.value })}
                    >
                      <option value="Desporto">Desporto</option>
                      <option value="Educação">Educação</option>
                      <option value="Família">Família</option>
                      <option value="Habitação">Habitação</option>
                      <option value="Impostos">Impostos</option>
                      <option value="Saúde">Saúde</option>
                      <option value="Seguros">Seguros</option>
                      <option value="Telemóveis">Telemóveis</option>
                      <option value="Subscrição">Subscrição</option>
                      <option value="Tecnologia">Tecnologia</option>
                      <option value="Transportes">Transportes</option>
                      <option value="Outros">Outros</option>
                    </select>
                  </div>
                )}
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

              {!isEditingHistory && (
                <div className="grid-2">
                  <div className="form-group">
                    <label className="form-label">Data de Início (Opcional)</label>
                    <input
                      type="date"
                      className="form-input"
                      value={formData.data_inicio}
                      onChange={(e) => setFormData({ ...formData, data_inicio: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Data de Fim (Opcional)</label>
                    <input
                      type="date"
                      className="form-input"
                      value={formData.data_fim}
                      onChange={(e) => setFormData({ ...formData, data_fim: e.target.value })}
                    />
                  </div>
                </div>
              )}

              <div className="modal-actions">
                {editingExpense && !isEditingHistory && (
                  <button 
                    type="button" 
                    className="btn btn-danger" 
                    style={{ marginRight: 'auto' }}
                    onClick={handleEndRecurring}
                  >
                    Terminar despesa automática
                  </button>
                )}
                <button type="button" className="btn btn-secondary" onClick={handleCloseModal}>
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingExpense ? 'Guardar' : 'Criar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default function FixedExpensesPage() {
  return <FixedExpensesContent />;
}
