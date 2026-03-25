"use client";

import { useState } from 'react';
import { FinanceProvider, useFinance } from '@/context/FinanceContext';
import { useSidebar } from '@/context/SidebarContext';
import Sidebar from '@/components/Sidebar';
import PremiumHeader from '@/components/PremiumHeader';
import { Plus, Edit2, Trash2, DollarSign, X, TrendingUp, CalendarRange, ChevronLeft, ChevronRight } from 'lucide-react';
import { formatCurrency, formatCurrencyNoDecimals, getNextPaymentDate, formatDate } from '@/lib/utils';
import { Income, Frequencia } from '@/types';
import dynamic from 'next/dynamic';

const AnnualIncomeProjectionChart = dynamic(() => import('@/components/charts/AnnualIncomeProjectionChart'), { ssr: false });
const IncomeSourcesPieChart = dynamic(() => import('@/components/charts/IncomeSourcesPieChart'), { ssr: false });

function IncomeContent() {
  const { selectedMonth, income, addIncomeEntry, updateIncome, deleteIncome, accounts, fixedExpenses, variableExpenses, debts } = useFinance();
  const { isCollapsed } = useSidebar();
  const [showModal, setShowModal] = useState(false);
  const [editingIncome, setEditingIncome] = useState<Income | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const getOnlyMonthName = (monthStr: string) => {
    const [year, month] = monthStr.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1, 1);
    return date.toLocaleString('pt-PT', { month: 'long' }).toUpperCase();
  };

  const getPrevMonthName = (monthStr: string) => {
    const [year, month] = monthStr.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 2, 1);
    return date.toLocaleString('pt-PT', { month: 'long' }).toUpperCase();
  };

  const [formData, setFormData] = useState({
    nome: '',
    valor: 0,
    frequencia: 'mensal' as Frequencia,
    data: 1,
    data_especifica: '',
    data_inicio: '',
    data_fim: '',
    conta: 'Montepio',
    isExtra: false,
  });

  const calculateMonthlyEquivalent = (incomeItem: Income): number => {
    switch (incomeItem.frequencia) {
      case 'semanal': return incomeItem.valor * 4.33;
      case 'quinzenal': return incomeItem.valor * 2;
      case 'mensal': return incomeItem.valor;
      case 'trimestral': return incomeItem.valor / 3;
      case 'anual': return incomeItem.valor / 12;
      case 'unico': return incomeItem.valor / 12; // Normalized for annual planning
      default: return incomeItem.valor;
    }
  };

  const calculateAnnualEquivalent = (incomeItem: Income): number => {
    switch (incomeItem.frequencia) {
      case 'semanal': return incomeItem.valor * 52;
      case 'quinzenal': return incomeItem.valor * 24;
      case 'mensal': return incomeItem.valor * 12;
      case 'trimestral': return incomeItem.valor * 4;
      case 'anual': return incomeItem.valor;
      case 'unico': return incomeItem.valor;
      default: return incomeItem.valor;
    }
  };

  const totalMonthly = income.filter(i => i && !i.isExtra).reduce((sum, i) => sum + calculateMonthlyEquivalent(i), 0);
  const totalAnnual = income.filter(i => i).reduce((sum, i) => sum + calculateAnnualEquivalent(i), 0);

  // Annual projection data (mock for now based on monthly income)
  const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
  const annualProjectionData = months.map((month, i) => {
    const base = totalMonthly;
    const currentYearVal = base * (1 + (Math.sin(i) * 0.1));
    const prevYearVal = base * 0.9 * (1 + (Math.cos(i) * 0.1));
    return { month, currentYear: currentYearVal, prevYear: prevYearVal };
  });

  // Calculate monthly income received so far this month
  const today = new Date();
  const currentMonthStr = today.toISOString().substring(0, 7);
  
  let effectiveDay = today.getDate();
  if (selectedMonth < currentMonthStr) {
    effectiveDay = 32; // All days in past months
  } else if (selectedMonth > currentMonthStr) {
    effectiveDay = -1; // No days in future months
  }

  // Filter income entries for the selected month
  const monthIncomeEntries = income.filter(i => {
    if (!i) return false;
    
    // Single entries
    if (i.frequencia === 'unico' && i.data_especifica) {
      return i.data_especifica.startsWith(selectedMonth);
    }
    
    // Recurring entries
    if (i.frequencia === 'mensal') {
      // Check start date
      if (i.data_inicio) {
        if (i.data_inicio > `${selectedMonth}-31`) return false;
      }
      // Check end date
      if (i.data_fim) {
        if (i.data_fim < `${selectedMonth}-01`) return false;
      }
      return true;
    }
    
    return false;
  });

  const expectedIncomeTotal = monthIncomeEntries.reduce((sum, i) => sum + i.valor, 0);
  
  const monthIncomeNoCarry = monthIncomeEntries.filter(i => !i.nome.toLowerCase().includes('valor transportado'));
  const expectedIncomeNoCarry = monthIncomeNoCarry.reduce((sum, i) => sum + i.valor, 0);

  const receivedIncomeNoCarry = monthIncomeNoCarry.filter(i => {
    if (i.frequencia === 'unico' && i.data_especifica) {
      const day = parseInt(i.data_especifica.split('-')[2]);
      return day <= effectiveDay;
    }
    return i.data <= effectiveDay;
  }).reduce((sum, i) => sum + i.valor, 0);

  const pendingIncome = expectedIncomeNoCarry - receivedIncomeNoCarry;

  const carriedOverEntry = monthIncomeEntries.find(i => i.nome.toLowerCase().includes('valor transportado'));
  const carriedOverValue = carriedOverEntry ? carriedOverEntry.valor : 0;

  const accumulatedValue = receivedIncomeNoCarry + carriedOverValue;

  const currentMonthName = getOnlyMonthName(selectedMonth);
  const prevMonthName = getPrevMonthName(selectedMonth);

  // Filter only received income (date <= today) and exclude carry over from the table
  const receivedIncome = income.filter(i => {
    if (!i) return false;
    if (i.nome.toLowerCase().includes('valor transportado')) return false;
    
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth();

    if (i.frequencia === 'unico' && i.data_especifica) {
      const date = new Date(i.data_especifica);
      return date <= today;
    }
    
    if (i.frequencia === 'mensal') {
      // Check if it has started
      if (i.data_inicio) {
        const startDate = new Date(i.data_inicio);
        if (startDate > today) return false;
      }
      // For recurring, if it's before or on current day of this month
      return i.data <= today.getDate();
    }
    
    // For others, assume they are received if they are before today
    const nextDate = getNextPaymentDate(i.data);
    return nextDate <= today;
  });

  // Sort by date descending
  const sortedReceivedIncome = [...monthIncomeEntries.filter(i => !i.nome.toLowerCase().includes('valor transportado'))].sort((a, b) => {
    const getDate = (item: Income) => {
      if (!item) return 0;
      if (item.frequencia === 'unico' && item.data_especifica) {
        return new Date(item.data_especifica).getTime();
      }
      // For recurring, get the date in the selected month
      const [year, month] = selectedMonth.split('-');
      const date = new Date(parseInt(year), parseInt(month) - 1, item.data);
      return date.getTime();
    };
    return getDate(b) - getDate(a);
  });

  // Pagination
  const totalPages = Math.ceil(sortedReceivedIncome.length / itemsPerPage);
  const paginatedIncome = sortedReceivedIncome.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  // Calculate expenses paid in selected month
  const selectedMonthFixedPaid = fixedExpenses.filter(e => {
    if (!e) return false;
    const isPaid = variableExpenses.some(v => 
      v && v.categoria === 'Fixa' && 
      v.data && v.data.startsWith(selectedMonth) && 
      (v.nome.includes(e.nome) || e.nome.includes(v.nome))
    );
    return isPaid;
  }).reduce((sum, e) => sum + (e?.valor || 0), 0);

  const selectedMonthVariablePaid = variableExpenses.filter(v => v && v.data && v.data.startsWith(selectedMonth) && v.categoria !== 'Fixa' && v.categoria !== 'Dívida').reduce((sum, v) => sum + (v?.valor || 0), 0);
  
  const selectedMonthDebtsPaid = debts.filter(d => {
    if (!d) return false;
    const isPaid = variableExpenses.some(v => 
      v && v.categoria === 'Dívida' && 
      v.data && v.data.startsWith(selectedMonth) && 
      (v.nome.includes(d.nome) || d.nome.includes(v.nome))
    );
    return isPaid;
  }).reduce((sum, d) => sum + (d?.prestacao_mensal || 0), 0);

  const totalExpensesPaid = selectedMonthFixedPaid + selectedMonthVariablePaid + selectedMonthDebtsPaid;

  // Income sources for pie chart (all selected month sources including carry over)
  const incomeSourcesData = monthIncomeEntries.map(i => ({
    name: i.nome,
    value: expectedIncomeTotal > 0 ? (i.valor / expectedIncomeTotal) * 100 : 0
  })).sort((a, b) => b.value - a.value);

  const handleOpenModal = (incomeItem?: Income) => {
    if (incomeItem) {
      setEditingIncome(incomeItem);
      setFormData({
        nome: incomeItem.nome,
        valor: incomeItem.valor,
        frequencia: incomeItem.frequencia,
        data: incomeItem.data,
        data_especifica: incomeItem.data_especifica || '',
        data_inicio: incomeItem.data_inicio || '',
        data_fim: incomeItem.data_fim || '',
        conta: incomeItem.conta,
        isExtra: incomeItem.isExtra || false,
      });
    } else {
      setEditingIncome(null);
      setFormData({
        nome: '',
        valor: 0,
        frequencia: 'mensal',
        data: 1,
        data_especifica: '',
        data_inicio: '',
        data_fim: '',
        conta: accounts[0]?.nome || 'Montepio',
        isExtra: false,
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingIncome(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingIncome) {
      updateIncome(editingIncome.id, formData);
    } else {
      addIncomeEntry(formData);
    }
    handleCloseModal();
  };

  const handleDelete = (id: string) => {
    if (confirm('Tem certeza que deseja eliminar esta fonte de rendimento?')) {
      deleteIncome(id);
    }
  };

  const getFrequencyLabel = (freq: Frequencia) => {
    switch (freq) {
      case 'semanal': return 'Semanal';
      case 'quinzenal': return 'Quinzenal';
      case 'mensal': return 'Mensal';
      case 'trimestral': return 'Trimestral';
      case 'anual': return 'Anual';
      case 'unico': return 'Único';
      default: return freq;
    }
  };

  const getFrequencyBadge = (freq: Frequencia) => {
    switch (freq) {
      case 'mensal': return 'badge-success';
      case 'quinzenal': return 'badge-info';
      case 'semanal': return 'badge-primary';
      case 'trimestral': return 'badge-warning';
      case 'anual': return 'badge-danger';
      case 'unico': return 'badge-secondary';
      default: return '';
    }
  };

  const tooltipStyle = {
    backgroundColor: '#0f172a',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '8px',
    fontSize: '12px',
    color: '#fff',
  };

  return (
    <div className="app-container font-inter">
      <Sidebar />
      
      <main className={`main-content ${isCollapsed ? 'sidebar-collapsed' : ''}`}>
        <PremiumHeader pageName="Rendimentos" />
        
        <div className="page-header animate-fadeIn" style={{ paddingBottom: '20px' }}>
          <div style={{ float: 'left' }}>
            <h1 className="page-title" style={{ fontSize: '1.5rem', lineHeight: 0.5 }}>Rendimentos</h1>
            <p className="page-subtitle">Gerencie as suas fontes de rendimento</p>
          </div>
          <button className="btn btn-primary" style={{ float: 'right', marginTop: '-8px' }} onClick={() => handleOpenModal()}>
            <Plus size={18} />
            Novo Rendimento
          </button>
        </div>

        {/* Summary Cards */}
        <div className="stats-grid mt-[30px] md:mt-0" style={{ marginBottom: '24px' }}>
          {/* Card 1: Monthly Income */}
          <div className="card animate-slideUp" style={{ background: 'linear-gradient(180deg, rgba(16, 185, 129, 0.15) 0%, transparent 100%)' }}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 rounded-full bg-white/[0.03] border border-white/[0.05] flex items-center justify-center">
                <CalendarRange size={16} className="text-slate-400" />
              </div>
              <p className="text-[10px] text-slate-500 uppercase tracking-[0.2em]">Rendimento Mensal</p>
            </div>
            <div className="card-value" style={{ color: 'var(--accent-success)', fontSize: '1.75rem', fontWeight: 700, fontFamily: 'Inter, sans-serif' }}>
              {formatCurrency(receivedIncomeNoCarry)}
            </div>
            <div className="mt-4 space-y-4">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-[10px] text-slate-500 uppercase">Rendimento expectável: {formatCurrency(expectedIncomeNoCarry)}</span>
                  <span className={`text-[10px] font-bold ${receivedIncomeNoCarry > expectedIncomeNoCarry ? 'text-orange-400' : 'text-slate-400'}`}>
                    {expectedIncomeNoCarry > 0 ? ((receivedIncomeNoCarry / expectedIncomeNoCarry) * 100).toFixed(0) : 0}%
                  </span>
                </div>
                <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all duration-1000 ${
                      receivedIncomeNoCarry > expectedIncomeNoCarry 
                        ? 'bg-gradient-to-r from-orange-500 to-red-600' 
                        : 'bg-emerald-500'
                    }`} 
                    style={{ width: `${Math.min(expectedIncomeNoCarry > 0 ? (receivedIncomeNoCarry / expectedIncomeNoCarry) * 100 : 0, 100)}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-[10px] text-slate-500 uppercase">Valor em Falta: {formatCurrency(pendingIncome)}</span>
                  <span className="text-[10px] text-indigo-400 font-bold">{expectedIncomeNoCarry > 0 ? ((pendingIncome / expectedIncomeNoCarry) * 100).toFixed(0) : 0}%</span>
                </div>
                <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-indigo-500 rounded-full transition-all duration-1000" 
                    style={{ width: `${Math.min(expectedIncomeNoCarry > 0 ? (pendingIncome / expectedIncomeNoCarry) * 100 : 0, 100)}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Card 2: Accumulated Value */}
          <div className="card animate-slideUp" style={{ background: 'linear-gradient(180deg, rgba(99, 102, 241, 0.15) 0%, transparent 100%)' }}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 rounded-full bg-white/[0.03] border border-white/[0.05] flex items-center justify-center">
                <TrendingUp size={16} className="text-slate-400" />
              </div>
              <p className="text-[10px] text-slate-500 uppercase tracking-[0.2em]">VALOR ACUMULADO</p>
            </div>
            <div className="card-value" style={{ fontSize: '1.75rem', fontWeight: 700, fontFamily: 'Inter, sans-serif' }}>
              {formatCurrency(accumulatedValue)}
            </div>
            <div className="mt-4 space-y-4">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-[10px] text-slate-500 uppercase">Rendimento atual: {formatCurrency(receivedIncomeNoCarry)}</span>
                  <span className="text-[10px] text-emerald-400 font-bold">
                    {accumulatedValue > 0 ? ((receivedIncomeNoCarry / accumulatedValue) * 100).toFixed(0) : 0}%
                  </span>
                </div>
                <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-emerald-500 rounded-full transition-all duration-1000" 
                    style={{ width: `${Math.min(accumulatedValue > 0 ? (receivedIncomeNoCarry / accumulatedValue) * 100 : 0, 100)}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-[10px] text-slate-500 uppercase">VALOR DE {prevMonthName}: {formatCurrency(carriedOverValue)}</span>
                  <span className="text-[10px] text-indigo-400 font-bold">{accumulatedValue > 0 ? ((carriedOverValue / accumulatedValue) * 100).toFixed(0) : 0}%</span>
                </div>
                <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-indigo-500 rounded-full transition-all duration-1000" 
                    style={{ width: `${Math.min(accumulatedValue > 0 ? (carriedOverValue / accumulatedValue) * 100 : 0, 100)}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Card 3: Income Sources */}
          <div className="card animate-slideUp">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 rounded-full bg-white/[0.03] border border-white/[0.05] flex items-center justify-center">
                <DollarSign size={16} className="text-slate-400" />
              </div>
              <p className="text-[10px] text-slate-500 uppercase tracking-[0.2em]">Fontes de Rendimento</p>
            </div>
            <div className="grid grid-cols-2 gap-4 items-center">
              <div style={{ height: '180px', width: '100%' }}>
                <IncomeSourcesPieChart data={incomeSourcesData} tooltipStyle={tooltipStyle} />
              </div>
              <div className="space-y-2">
                {incomeSourcesData.slice(0, 5).map((source, idx) => (
                  <div key={idx} className="flex justify-between items-center">
                    <span className="text-[10px] text-slate-400 truncate max-w-[80px]">{source.name}</span>
                    <span className="text-[10px] text-slate-500 font-bold">{source.value.toFixed(1)}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Income Table (Desktop) */}
        <div className="card animate-slideUp hidden md:block">
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Nome</th>
                  <th>Frequência</th>
                  <th style={{ textAlign: 'right' }}>Valor</th>
                  <th style={{ textAlign: 'right' }}>Peso</th>
                  <th>Conta</th>
                  <th style={{ textAlign: 'right' }}>Data</th>
                  <th style={{ textAlign: 'right' }}>Ações</th>
                </tr>
              </thead>
              <tbody>
                {paginatedIncome.map((incomeItem) => {
                  const [year, month] = selectedMonth.split('-');
                  const itemDate = incomeItem.frequencia === 'unico' && incomeItem.data_especifica 
                    ? new Date(incomeItem.data_especifica)
                    : new Date(parseInt(year), parseInt(month) - 1, incomeItem.data);
                  
                  // Calculate total income for the month of this item
                  const itemMonthStr = itemDate.toISOString().substring(0, 7);
                  const totalForMonth = income.filter(i => {
                    if (!i) return false;
                    if (i.frequencia === 'unico' && i.data_especifica) {
                      return i.data_especifica.startsWith(itemMonthStr);
                    }
                    if (i.frequencia === 'mensal') {
                      if (i.data_inicio) {
                        if (i.data_inicio > `${itemMonthStr}-31`) return false;
                      }
                      return true;
                    }
                    return false;
                  }).reduce((sum, i) => sum + i.valor, 0);

                  const peso = totalForMonth > 0 ? (incomeItem.valor / totalForMonth) * 100 : 0;
                  
                  return (
                    <tr key={incomeItem.id}>
                      <td>
                        <div style={{ fontWeight: 400, fontSize: '0.9rem' }}>{incomeItem.nome}</div>
                      </td>
                      <td>
                        <span className={`badge ${getFrequencyBadge(incomeItem.frequencia)}`}>
                          {getFrequencyLabel(incomeItem.frequencia)}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <span style={{ fontWeight: 600, fontSize: '0.9rem', color: 'white', fontFamily: 'Inter, sans-serif' }}>
                          +{formatCurrencyNoDecimals(incomeItem.valor)}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          {peso.toFixed(1)}%
                        </span>
                      </td>
                      <td>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{incomeItem.conta}</span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                          {formatDate(itemDate.toISOString())}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                          <button 
                            className="btn btn-icon btn-secondary"
                            onClick={() => handleOpenModal(incomeItem)}
                          >
                            <Edit2 size={16} />
                          </button>
                          <button 
                            className="btn btn-icon btn-danger"
                            onClick={() => handleDelete(incomeItem.id)}
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
            
            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-4 py-3 border-t border-white/5">
                <div className="text-xs text-slate-500">
                  Mostrando <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span> a <span className="font-medium">{Math.min(currentPage * itemsPerPage, sortedReceivedIncome.length)}</span> de <span className="font-medium">{sortedReceivedIncome.length}</span> rendimentos
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="p-1 rounded hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronLeft size={18} />
                  </button>
                  <div className="flex items-center gap-1">
                    {[...Array(totalPages)].map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setCurrentPage(i + 1)}
                        className={`w-7 h-7 flex items-center justify-center rounded text-xs transition-colors ${
                          currentPage === i + 1 ? 'bg-indigo-600 text-white' : 'hover:bg-white/5 text-slate-400'
                        }`}
                      >
                        {i + 1}
                      </button>
                    ))}
                  </div>
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="p-1 rounded hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronRight size={18} />
                  </button>
                </div>
              </div>
            )}
            
            {income.length === 0 && (
              <div className="empty-state">
                <DollarSign size={48} style={{ opacity: 0.3, marginBottom: '16px' }} />
                <p>Nenhum rendimento adicionado</p>
                <button className="btn btn-primary" style={{ marginTop: '16px' }} onClick={() => handleOpenModal()}>
                  <Plus size={18} />
                  Adicionar Rendimento
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Mobile List */}
        <div className="md:hidden space-y-3">
          {paginatedIncome.map((incomeItem) => {
            const [year, month] = selectedMonth.split('-');
            const itemDate = incomeItem.frequencia === 'unico' && incomeItem.data_especifica 
              ? new Date(incomeItem.data_especifica)
              : new Date(parseInt(year), parseInt(month) - 1, incomeItem.data);
            
            // Calculate total income for the month of this item
            const itemMonthStr = itemDate.toISOString().substring(0, 7);
            const totalForMonth = income.filter(i => {
              if (i.frequencia === 'unico' && i.data_especifica) {
                return i.data_especifica.startsWith(itemMonthStr);
              }
              return i.frequencia === 'mensal'; // Simplification for recurring
            }).reduce((sum, i) => sum + i.valor, 0);

            const peso = totalForMonth > 0 ? (incomeItem.valor / totalForMonth) * 100 : 0;

            return (
              <div key={incomeItem.id} className="card space-y-3" style={{ padding: '16px' }}>
                {/* Line 1: Name and Value */}
                <div className="flex justify-between items-start mb-0">
                  <h3 className="font-normal !text-[1rem] text-white">{incomeItem.nome}</h3>
                  <p className="font-semibold text-[0.9rem] text-white" style={{ fontFamily: 'Inter, sans-serif' }}>
                    +{formatCurrencyNoDecimals(incomeItem.valor)}
                  </p>
                </div>

                {/* Line 2: Date and Frequency */}
                <div className="flex justify-between items-center">
                  <p className="text-[10px] text-slate-500 uppercase tracking-wider">
                    {formatDate(itemDate.toISOString())}
                  </p>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', padding: 0, background: 'none' }}>
                    {getFrequencyLabel(incomeItem.frequencia)}
                  </span>
                </div>

                {/* Line 3: Weight and Progress Bar */}
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] text-slate-500 uppercase">Peso no Rendimento</span>
                    <span className="text-[10px] text-slate-400 font-bold">{peso.toFixed(1)}%</span>
                  </div>
                  <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-emerald-500 rounded-full" 
                      style={{ width: `${Math.min(peso, 100)}%` }}
                    />
                  </div>
                </div>

                {/* Line 4: Actions */}
                <div className="pt-1">
                  <div className="flex items-center justify-center rounded-xl border border-slate-800 bg-slate-900/30 overflow-hidden" style={{ height: '40px' }}>
                    <button 
                      className="flex-1 h-full flex items-center justify-center hover:bg-white/5 transition-colors"
                      onClick={() => handleOpenModal(incomeItem)}
                    >
                      <Edit2 size={18} className="text-blue-400/80" />
                    </button>
                    <div className="w-[1px] h-6 bg-slate-800/50"></div>
                    <button 
                      className="flex-1 h-full flex items-center justify-center hover:bg-white/5 transition-colors"
                      onClick={() => handleDelete(incomeItem.id)}
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

          {income.length === 0 && (
            <div className="empty-state card">
              <DollarSign size={48} style={{ opacity: 0.3, marginBottom: '16px' }} />
              <p>Nenhum rendimento adicionado</p>
              <button className="btn btn-primary w-full mt-4" onClick={() => handleOpenModal()}>
                <Plus size={18} />
                Adicionar Rendimento
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
                {editingIncome ? 'Editar Rendimento' : 'Novo Rendimento'}
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
                  placeholder="Ex: Salário, Freelance..."
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

                <div className="form-group">
                  <label className="form-label">Frequência</label>
                  <select
                    className="form-select"
                    value={formData.frequencia}
                    onChange={(e) => setFormData({ ...formData, frequencia: e.target.value as Frequencia })}
                  >
                    <option value="semanal">Semanal</option>
                    <option value="quinzenal">Quinzenal</option>
                    <option value="mensal">Mensal</option>
                    <option value="trimestral">Trimestral</option>
                    <option value="anual">Anual</option>
                    <option value="unico">Único</option>
                  </select>
                </div>
              </div>

              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">
                    {formData.frequencia === 'unico' ? 'Data' : 'Dia de Recepção'}
                  </label>
                  {formData.frequencia === 'unico' ? (
                    <input
                      type="date"
                      className="form-input"
                      value={formData.data_especifica}
                      onChange={(e) => setFormData({ ...formData, data_especifica: e.target.value })}
                      required
                    />
                  ) : (
                    <input
                      type="number"
                      className="form-input"
                      value={formData.data}
                      onChange={(e) => setFormData({ ...formData, data: parseInt(e.target.value) || 1 })}
                      min="1"
                      max="31"
                      required
                    />
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
              </div>

              {formData.frequencia !== 'unico' && (
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

              <div className="form-group">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    className="w-4 h-4 rounded border-slate-700 bg-slate-800 text-indigo-600 focus:ring-indigo-500 focus:ring-offset-slate-900"
                    checked={formData.isExtra}
                    onChange={(e) => setFormData({ ...formData, isExtra: e.target.checked })}
                  />
                  <span className="text-sm text-slate-300">Este rendimento é extra (não expectável)</span>
                </label>
              </div>

              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={handleCloseModal}>
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingIncome ? 'Guardar' : 'Criar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default function IncomePage() {
  return (
    <FinanceProvider>
      <IncomeContent />
    </FinanceProvider>
  );
}
