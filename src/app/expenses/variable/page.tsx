"use client";

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { FinanceProvider, useFinance } from '@/context/FinanceContext';
import { useSidebar } from '@/context/SidebarContext';
import Sidebar from '@/components/Sidebar';
import PremiumHeader from '@/components/PremiumHeader';
import { Plus, Edit2, Trash2, PiggyBank, X, BarChart3, ReceiptEuro, CalendarRange, Layers2 } from 'lucide-react';
import { formatCurrency, formatDate, getCategoryColor } from '@/lib/utils';
import { VariableExpense, CategoriaDespesa } from '@/types';
import { getPieChartColor } from '@/lib/theme';

const VariableExpensesCategoryPieChart = dynamic(() => import('@/components/charts/VariableExpensesCategoryPieChart'), { ssr: false });
const VariableExpensesTopExpensesChart = dynamic(() => import('@/components/charts/VariableExpensesTopExpensesChart'), { ssr: false });
const VariableExpensesDailyChart = dynamic(() => import('@/components/charts/VariableExpensesDailyChart'), { ssr: false });

function VariableExpensesContent() {
  const { variableExpenses, addVariableExpense, updateVariableExpense, deleteVariableExpense, accounts, income } = useFinance();
  const { isCollapsed } = useSidebar();
  const [showModal, setShowModal] = useState(false);
  const [editingExpense, setEditingExpense] = useState<VariableExpense | null>(null);
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [formData, setFormData] = useState({
    nome: '',
    valor: 0,
    data: new Date().toISOString().split('T')[0],
    conta: 'Montepio',
    categoria: 'Supermercado' as CategoriaDespesa,
  });

  const categories: CategoriaDespesa[] = ['Supermercado', 'Combustível', 'Restaurantes', 'Compras', 'Diversos'];

  const filteredExpenses = filterCategory === 'all' 
    ? variableExpenses 
    : variableExpenses.filter(e => e.categoria === filterCategory);

  const totalExpenses = filteredExpenses.reduce((sum, e) => sum + e.valor, 0);

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

  const variablePercentage = monthlyIncome > 0 ? (totalExpenses / monthlyIncome) * 100 : 0;

  // Calculate daily expenses for the current and previous month
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  
  // Previous month logic
  const prevMonthDate = new Date(currentYear, currentMonth - 1, 1);
  const prevMonth = prevMonthDate.getMonth();
  const prevYear = prevMonthDate.getFullYear();
  
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  
  const dailyExpensesData = Array.from({ length: daysInMonth }, (_, i) => {
    const day = i + 1;
    
    const currentValue = variableExpenses.filter(e => {
      const expenseDate = new Date(e.data);
      return expenseDate.getDate() === day && 
             expenseDate.getMonth() === currentMonth && 
             expenseDate.getFullYear() === currentYear;
    }).reduce((sum, e) => sum + e.valor, 0);
    
    const previousValue = variableExpenses.filter(e => {
      const expenseDate = new Date(e.data);
      return expenseDate.getDate() === day && 
             expenseDate.getMonth() === prevMonth && 
             expenseDate.getFullYear() === prevYear;
    }).reduce((sum, e) => sum + e.valor, 0);
    
    return { day, currentValue, previousValue };
  });

  const categoryData = categories.map(cat => {
    const value = variableExpenses.filter(e => e.categoria === cat).reduce((sum, e) => sum + e.valor, 0);
    return {
      name: cat,
      value: value,
      percent: totalExpenses > 0 ? ((value / totalExpenses) * 100).toFixed(1) : 0
    };
  }).sort((a, b) => b.value - a.value);

  const topExpensesData = [...variableExpenses]
    .sort((a, b) => b.valor - a.valor)
    .slice(0, 6)
    .map(e => ({
      name: e.nome,
      value: e.valor,
      percent: totalExpenses > 0 ? ((e.valor / totalExpenses) * 100).toFixed(1) : 0
    }));

  const handleOpenModal = (expense?: VariableExpense) => {
    if (expense) {
      setEditingExpense(expense);
      setFormData({
        nome: expense.nome,
        valor: expense.valor,
        data: expense.data,
        conta: expense.conta,
        categoria: expense.categoria,
      });
    } else {
      setEditingExpense(null);
      setFormData({
        nome: '',
        valor: 0,
        data: new Date().toISOString().split('T')[0],
        conta: accounts[0]?.nome || 'Montepio',
        categoria: 'Supermercado',
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
      updateVariableExpense(editingExpense.id, formData);
    } else {
      addVariableExpense(formData);
    }
    handleCloseModal();
  };

  const handleDelete = (id: string) => {
    if (confirm('Tem certeza que deseja eliminar esta despesa?')) {
      deleteVariableExpense(id);
    }
  };

  return (
    <div className="app-container">
      <Sidebar />
      
      <main className={`main-content ${isCollapsed ? 'sidebar-collapsed' : ''}`}>
        <PremiumHeader pageName="Despesas Variaveis" />
        
        <div className="page-header animate-fadeIn" style={{ paddingBottom: '20px' }}>
          <div style={{ float: 'left' }}>
            <h1 className="page-title" style={{ fontSize: '1.5rem', lineHeight: 0.5 }}>Despesas Variáveis</h1>
            <p className="page-subtitle">Gerencie as suas despesas variáveis</p>
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
        <div className="stats-grid grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          {/* Card 1: Total Expenses This Month */}
          <div className="card animate-slideUp" style={{ padding: '24px', display: 'flex', flexDirection: 'column' }}>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-9 h-9 rounded-full bg-white/[0.03] border border-white/[0.05] flex items-center justify-center">
                <ReceiptEuro size={16} className="text-slate-400" />
              </div>
              <p className="text-[10px] text-slate-500 uppercase tracking-[0.2em]">DESPESAS ESTE MÊS</p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0px', flex: 1, justifyContent: 'space-between' }}>
              <div style={{ marginTop: '-12px' }}>
                <div className="text-3xl font-bold text-white mb-3" style={{ fontFamily: 'Inter, sans-serif' }}>
                  {formatCurrency(totalExpenses)}
                </div>
                <div className="w-full h-1.5 bg-white/[0.03] rounded-full overflow-hidden border border-white/[0.02] mb-2">
                  <div className="h-full rounded-full" style={{ 
                    width: `${Math.min(100, variablePercentage)}%`,
                    background: 'linear-gradient(to right, var(--danger-500), var(--danger-400))'
                  }}></div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[9px] text-slate-600 uppercase tracking-wider">vs Income Mensal</span>
                  <span className="text-[10px] font-semibold" style={{ color: 'var(--danger-400)' }}>{variablePercentage.toFixed(1)}%</span>
                </div>
              </div>

              {/* Daily Expenses Chart - Expands to fill bottom space */}
              <div style={{ height: '210px', width: '100%', marginTop: 'auto' }}>
                <VariableExpensesDailyChart data={dailyExpensesData} />
              </div>
            </div>
          </div>

          {/* Card 2: Category Pie Chart */}
          <div className="card animate-slideUp flex flex-col" style={{ padding: '24px' }}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 rounded-full bg-white/[0.03] border border-white/[0.05] flex items-center justify-center">
                <Layers2 size={16} className="text-slate-400" />
              </div>
              <p className="text-[10px] text-slate-500 uppercase tracking-[0.2em]">Por Categoria</p>
            </div>
            
            <div style={{ height: '180px', width: '100%', position: 'relative' }}>
              <VariableExpensesCategoryPieChart data={categoryData} total={totalExpenses} />
            </div>

            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: '1fr', 
              gap: '8px', 
              marginTop: '16px' 
            }}>
              {categoryData.slice(0, 8).map((entry, index) => (
                <div key={index} className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: getPieChartColor(index) }} />
                  <div className="flex justify-between items-center flex-1 min-w-0">
                    <span className="text-[10px] text-slate-400 truncate mr-2">{entry.name}</span>
                    <span className="text-[10px] text-slate-500 font-medium">{entry.percent}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Card 3: Top Expenses Pie Chart */}
          <div className="card animate-slideUp flex flex-col" style={{ padding: '24px' }}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 rounded-full bg-white/[0.03] border border-white/[0.05] flex items-center justify-center">
                <CalendarRange size={16} className="text-slate-400" />
              </div>
              <p className="text-[10px] text-slate-500 uppercase tracking-[0.2em]">Por Valor</p>
            </div>
            
            <div style={{ height: '180px', width: '100%', position: 'relative' }}>
              <VariableExpensesTopExpensesChart data={topExpensesData} total={totalExpenses} />
            </div>

            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: '1fr', 
              gap: '8px', 
              marginTop: '16px' 
            }}>
              {topExpensesData.map((entry, index) => (
                <div key={index} className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: getPieChartColor(index) }} />
                  <div className="flex justify-between items-center flex-1 min-w-0">
                    <span className="text-[10px] text-slate-400 truncate mr-2">{entry.name}</span>
                    <span className="text-[10px] text-slate-500 font-medium">{formatCurrency(entry.value)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Filter */}
        <div className="tabs animate-slideUp" style={{ marginBottom: '24px' }}>
          <div 
            className={`tab ${filterCategory === 'all' ? 'active' : ''}`}
            onClick={() => setFilterCategory('all')}
          >
            Todos
          </div>
          {categories.map((cat) => (
            <div 
              key={cat}
              className={`tab ${filterCategory === cat ? 'active' : ''}`}
              onClick={() => setFilterCategory(cat)}
              style={{ color: filterCategory === cat ? getCategoryColor(cat) : undefined }}
            >
              {cat}
            </div>
          ))}
        </div>

        {/* Expenses Table */}
        <div className="card animate-slideUp">
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Data</th>
                  <th>Nome</th>
                  <th>Categoria</th>
                  <th>Conta</th>
                  <th style={{ textAlign: 'right' }}>Valor</th>
                  <th style={{ textAlign: 'right' }}>Ações</th>
                </tr>
              </thead>
              <tbody>
                {filteredExpenses.sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime()).map((expense) => (
                  <tr key={expense.id}>
                    <td>
                      <span style={{ color: 'var(--text-secondary)' }}>
                        {formatDate(expense.data)}
                      </span>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{expense.nome}</div>
                    </td>
                    <td>
                      <span 
                        className="badge"
                        style={{ 
                          background: `${getCategoryColor(expense.categoria)}20`,
                          color: getCategoryColor(expense.categoria)
                        }}
                      >
                        {expense.categoria}
                      </span>
                    </td>
                    <td>
                      <span style={{ color: 'var(--text-secondary)' }}>{expense.conta}</span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <span  style={{ fontWeight: 600, color: 'var(--accent-danger)' }}>
                        -{formatCurrency(expense.valor)}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
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
            
            {filteredExpenses.length === 0 && (
              <div className="empty-state">
                <PiggyBank size={48} style={{ opacity: 0.3, marginBottom: '16px' }} />
                <p>Nenhuma despesa variável adicionada</p>
                <button className="btn btn-primary" style={{ marginTop: '16px' }} onClick={() => handleOpenModal()}>
                  <Plus size={18} />
                  Adicionar Despesa
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
                {editingExpense ? 'Editar Despesa' : 'Nova Despesa Variável'}
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
                  placeholder="Ex: Supermercado Continente..."
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
                  <label className="form-label">Data</label>
                  <input
                    type="date"
                    className="form-input"
                    value={formData.data}
                    onChange={(e) => setFormData({ ...formData, data: e.target.value })}
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
                    onChange={(e) => setFormData({ ...formData, categoria: e.target.value as CategoriaDespesa })}
                  >
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
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

export default function VariableExpensesPage() {
  return <VariableExpensesContent />;
}
