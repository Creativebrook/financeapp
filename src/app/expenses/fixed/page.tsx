"use client";

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { FinanceProvider, useFinance } from '@/context/FinanceContext';
import { useSidebar } from '@/context/SidebarContext';
import Sidebar from '@/components/Sidebar';
import PremiumHeader from '@/components/PremiumHeader';
import { Plus, Edit2, Trash2, Receipt, X, Calendar, ReceiptEuro, CalendarRange, Layers2 } from 'lucide-react';
import { formatCurrency, getNextPaymentDate, formatDate, getPlatformColor, getCategoryColor, getFrequencyColor } from '@/lib/utils';
import { getPieChartColor } from '@/lib/theme';
import { FixedExpense, Frequencia } from '@/types';

const FixedExpensesFrequencyChart = dynamic(() => import('@/components/charts/FixedExpensesFrequencyChart'), { ssr: false });
const FixedExpensesCategoryBarChart = dynamic(() => import('@/components/charts/FixedExpensesCategoryBarChart'), { ssr: false });

function FixedExpensesContent() {
  const { fixedExpenses, addFixedExpense, updateFixedExpense, deleteFixedExpense, accounts, income } = useFinance();
  const { isCollapsed } = useSidebar();
  const [showModal, setShowModal] = useState(false);
  const [editingExpense, setEditingExpense] = useState<FixedExpense | null>(null);
  const [formData, setFormData] = useState({
    nome: '',
    valor: 0,
    frequencia: 'mensal' as Frequencia,
    data_pagamento: 1,
    conta: 'Montepio',
    categoria: 'Subscrição',
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

  const totalMonthly = fixedExpenses.reduce((sum, e) => sum + calculateMonthlyEquivalent(e), 0);
  
  // Calculate annual expenses up to current date
  const calculateAnnualSoFar = () => {
    const today = new Date('2026-03-20T00:00:00Z');
    const currentMonth = today.getMonth(); // 0-indexed
    const currentDay = today.getDate();
    
    return fixedExpenses.reduce((sum, e) => {
      let occurrences = 0;
      switch (e.frequencia) {
        case 'mensal':
          // Paid every month. If current day >= payment day, it's paid this month too.
          occurrences = currentMonth + (currentDay >= e.data_pagamento ? 1 : 0);
          break;
        case 'quinzenal':
          // Paid twice a month.
          occurrences = (currentMonth * 2) + (currentDay >= e.data_pagamento ? 1 : 0) + (currentDay >= e.data_pagamento + 15 ? 1 : 0);
          break;
        case 'semanal':
          // Paid 4 times a month roughly.
          occurrences = (currentMonth * 4) + Math.floor(currentDay / 7);
          break;
        case 'trimestral':
          // Paid every 3 months. Assuming Jan, Apr, Jul, Oct.
          const quarters = [0, 3, 6, 9];
          occurrences = quarters.filter(m => m < currentMonth || (m === currentMonth && currentDay >= e.data_pagamento)).length;
          break;
        case 'semestral':
          // Paid every 6 months. Assuming Jan, Jul.
          const semesters = [0, 6];
          occurrences = semesters.filter(m => m < currentMonth || (m === currentMonth && currentDay >= e.data_pagamento)).length;
          break;
        case 'anual':
          // Paid once a year. Assuming Jan.
          occurrences = (0 < currentMonth || (0 === currentMonth && currentDay >= e.data_pagamento)) ? 1 : 0;
          break;
      }
      return sum + (e.valor * occurrences);
    }, 0);
  };

  const totalAnnualSoFar = calculateAnnualSoFar();
  const totalAnnualValue = totalMonthly * 12;

  // Calculate monthly income
  const monthlyIncome = income.reduce((sum, inc) => {
    switch (inc.frequencia) {
      case 'mensal': return sum + inc.valor;
      case 'quinzenal': return sum + inc.valor * 2;
      case 'semanal': return sum + inc.valor * 4;
      case 'trimestral': return sum + inc.valor / 3;
      case 'semestral': return sum + inc.valor / 6;
      case 'anual': return sum + inc.valor / 12;
      default: return sum + inc.valor;
    }
  }, 0);

  const annualIncome = monthlyIncome * 12;
  const monthlyPercentage = monthlyIncome > 0 ? (totalMonthly / monthlyIncome) * 100 : 0;
  const annualPercentage = annualIncome > 0 ? (totalAnnualSoFar / annualIncome) * 100 : 0;

  const sortedExpenses = [...fixedExpenses].sort((a, b) => {
    const dateA = getNextPaymentDate(a.data_pagamento).getTime();
    const dateB = getNextPaymentDate(b.data_pagamento).getTime();
    return dateA - dateB;
  });

  const expensesByCategory = fixedExpenses.reduce((acc, e) => {
    acc[e.categoria] = (acc[e.categoria] || 0) + calculateMonthlyEquivalent(e);
    return acc;
  }, {} as Record<string, number>);

  const categoryData = Object.entries(expensesByCategory).map(([name, value]) => ({
    name,
    value,
    percent: totalMonthly > 0 ? Math.round((value / totalMonthly) * 100) : 0
  })).sort((a, b) => b.value - a.value);

  const frequencyGroups = fixedExpenses.reduce((acc, e) => {
    acc[e.frequencia] = (acc[e.frequencia] || 0) + calculateMonthlyEquivalent(e);
    return acc;
  }, {} as Record<string, number>);

  const frequencyData = [
    { name: 'Mensal', value: (frequencyGroups['mensal'] || 0) + (frequencyGroups['quinzenal'] || 0) + (frequencyGroups['semanal'] || 0) },
    { name: 'Trimestral', value: frequencyGroups['trimestral'] || 0 },
    { name: 'Semestral', value: frequencyGroups['semestral'] || 0 },
    { name: 'Anual', value: frequencyGroups['anual'] || 0 },
  ].filter(item => item.value > 0).map(item => ({
    ...item,
    percent: totalMonthly > 0 ? Math.round((item.value / totalMonthly) * 100) : 0
  }));

  const handleOpenModal = (expense?: FixedExpense) => {
    if (expense) {
      setEditingExpense(expense);
      setFormData({
        nome: expense.nome,
        valor: expense.valor,
        frequencia: expense.frequencia,
        data_pagamento: expense.data_pagamento,
        conta: expense.conta,
        categoria: expense.categoria,
      });
    } else {
      setEditingExpense(null);
      setFormData({
        nome: '',
        valor: 0,
        frequencia: 'mensal',
        data_pagamento: 1,
        conta: accounts[0]?.nome || 'Montepio',
        categoria: 'Subscrição',
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingExpense(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingExpense) {
      updateFixedExpense(editingExpense.id, formData);
    } else {
      addFixedExpense(formData);
    }
    handleCloseModal();
  };

  const handleDelete = (id: string) => {
    if (confirm('Tem certeza que deseja eliminar esta despesa?')) {
      deleteFixedExpense(id);
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
              <p className="text-[10px] text-slate-500 uppercase tracking-[0.2em]">Total Despesas</p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', flex: 1, justifyContent: 'center' }}>
              {/* Monthly Section */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-[10px] text-slate-500 uppercase tracking-[0.1em]">Despesa Mensal</span>
                </div>
                <div className="text-2xl font-bold text-white mb-3" style={{ fontFamily: 'Inter, sans-serif' }}>
                  {formatCurrency(totalMonthly)}
                </div>
                <div className="w-full h-1.5 bg-white/[0.03] rounded-full overflow-hidden border border-white/[0.02] mb-2">
                  <div className="h-full rounded-full" style={{ 
                    width: `${Math.min(100, monthlyPercentage)}%`,
                    background: 'linear-gradient(to right, var(--danger-500), var(--danger-400))'
                  }}></div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[9px] text-slate-600 uppercase tracking-wider">vs Income Mensal</span>
                  <span className="text-[10px] font-semibold" style={{ color: 'var(--danger-400)' }}>{monthlyPercentage.toFixed(1)}%</span>
                </div>
              </div>

              <div style={{ height: '1px', background: 'var(--border-subtle)', width: '100%' }}></div>

              {/* Annual Section */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-[10px] text-slate-500 uppercase tracking-[0.1em]">Despesa Anual (YTD)</span>
                </div>
                <div className="text-2xl font-bold text-white mb-3" style={{ fontFamily: 'Inter, sans-serif' }}>
                  {formatCurrency(totalAnnualSoFar)}
                </div>
                <div className="w-full h-1.5 bg-white/[0.03] rounded-full overflow-hidden border border-white/[0.02] mb-2">
                  <div className="h-full rounded-full" style={{ 
                    width: `${Math.min(100, annualPercentage)}%`,
                    background: 'linear-gradient(to right, var(--warning-500), var(--warning-400))'
                  }}></div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[9px] text-slate-600 uppercase tracking-wider">vs Income Anual Esperado</span>
                  <span className="text-[10px] font-semibold" style={{ color: 'var(--warning-400)' }}>{annualPercentage.toFixed(1)}%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Card 2: Frequency Pie Chart */}
          <div className="card animate-slideUp flex flex-col" style={{ padding: '24px' }}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 rounded-full bg-white/[0.03] border border-white/[0.05] flex items-center justify-center">
                <CalendarRange size={16} className="text-slate-400" />
              </div>
              <p className="text-[10px] text-slate-500 uppercase tracking-[0.2em]">Por Frequência</p>
            </div>
            
            <div style={{ height: '180px', width: '100%', position: 'relative' }}>
              <FixedExpensesFrequencyChart data={frequencyData} total={totalMonthly} />
            </div>

            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: '1fr', 
              gap: '8px', 
              marginTop: '16px' 
            }}>
              {frequencyData.map((entry, index) => (
                <div key={index} className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: getFrequencyColor(entry.name) }} />
                  <div className="flex justify-between items-center flex-1 min-w-0">
                    <span className="text-[10px] text-slate-400 truncate mr-2">{entry.name}</span>
                    <span className="text-[10px] text-slate-500 font-medium">{entry.percent}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Card 3: Category Bar Chart */}
          <div className="card animate-slideUp flex flex-col" style={{ padding: '24px' }}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 rounded-full bg-white/[0.03] border border-white/[0.05] flex items-center justify-center">
                <Layers2 size={16} className="text-slate-400" />
              </div>
              <p className="text-[10px] text-slate-500 uppercase tracking-[0.2em]">Por Categoria</p>
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
        </div>

        {/* Expenses Table */}
        <div className="card animate-slideUp hidden md:block">
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th style={{ textAlign: 'left' }}>Nome</th>
                  <th style={{ textAlign: 'left' }}>Frequência</th>
                  <th style={{ textAlign: 'left' }}>Valor</th>
                  <th style={{ textAlign: 'left' }}>Data</th>
                  <th style={{ textAlign: 'left' }}>Conta</th>
                  <th style={{ textAlign: 'left' }}>Categoria</th>
                  <th style={{ textAlign: 'left' }}>Ações</th>
                </tr>
              </thead>
              <tbody>
                {sortedExpenses.map((expense) => (
                  <tr key={expense.id}>
                    <td style={{ textAlign: 'left' }}>
                      <div style={{ fontWeight: 400, fontSize: '0.9rem' }}>{expense.nome}</div>
                    </td>
                    <td style={{ textAlign: 'left' }}>
                      <span className={`badge ${getFrequencyBadge(expense.frequencia)}`}>
                        {expense.frequencia}
                      </span>
                    </td>
                    <td style={{ textAlign: 'left' }}>
                      <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>
                        {formatCurrency(expense.valor)}
                      </span>
                    </td>
                    <td style={{ textAlign: 'left' }}>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                        {formatDate(getNextPaymentDate(expense.data_pagamento).toISOString())}
                      </span>
                    </td>
                    <td style={{ textAlign: 'left' }}>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{expense.conta}</span>
                    </td>
                    <td style={{ textAlign: 'left' }}>
                      <span 
                        style={{ 
                          background: `${getCategoryColor(expense.categoria)}20`,
                          color: getCategoryColor(expense.categoria),
                          fontSize: '0.75rem',
                          borderRadius: '4px',
                          padding: '2px 8px'
                        }}
                      >
                        {expense.categoria}
                      </span>
                    </td>
                    <td style={{ textAlign: 'left' }}>
                      <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-start' }}>
                        <button 
                          className="btn btn-icon btn-secondary"
                          onClick={() => handleOpenModal(expense)}
                        >
                          <Edit2 size={16} />
                        </button>
                        <button 
                          className="btn btn-icon btn-danger"
                          onClick={() => handleDelete(expense.id)}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {fixedExpenses.length === 0 && (
              <div className="empty-state">
                <Receipt size={48} style={{ opacity: 0.3, marginBottom: '16px' }} />
                <p>Nenhuma despesa fixa adicionada</p>
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
          {sortedExpenses.map((expense) => {
            const weight = totalMonthly > 0 ? (calculateMonthlyEquivalent(expense) / totalMonthly) * 100 : 0;

            return (
              <div key={expense.id} className="card p-4 space-y-2" style={{ backgroundColor: 'var(--card-bg)', borderRadius: '16px', border: '1px solid var(--card-border)' }}>
                {/* Line 1: Name and Value */}
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold !text-[1rem] text-white leading-tight">{expense.nome}</h3>
                    <p className="text-[10px] text-slate-500 uppercase tracking-wider mt-0.5">
                      DATA: {formatDate(getNextPaymentDate(expense.data_pagamento).toISOString())}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold !text-[1rem] text-white leading-tight">{formatCurrency(expense.valor)}</p>
                    <p className="text-[10px] text-slate-500 uppercase tracking-wider mt-0.5">
                      {expense.frequencia}
                    </p>
                  </div>
                </div>

                {/* Line 3: Progress Bar (Weight) - Closer to top */}
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
                      onClick={() => handleOpenModal(expense)}
                    >
                      <Edit2 size={18} className="text-blue-400/80" />
                    </button>
                    <div className="w-[1px] h-6 bg-slate-800/50"></div>
                    <button 
                      className="flex-1 h-full flex items-center justify-center hover:bg-white/5 transition-colors"
                      onClick={() => handleDelete(expense.id)}
                    >
                      <Trash2 size={18} className="text-red-400/80" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
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
              </div>

              <div className="grid-2">
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
                    <option value="Serviços">Serviços</option>
                    <option value="Subscrição">Subscrição</option>
                    <option value="Tecnologia">Tecnologia</option>
                    <option value="Transportes">Transportes</option>
                    <option value="Outros">Outros</option>
                  </select>
                </div>
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

              <div className="modal-actions">
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
  return (
    <FinanceProvider>
      <FixedExpensesContent />
    </FinanceProvider>
  );
}
