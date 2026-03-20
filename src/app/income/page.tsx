"use client";

import { useState } from 'react';
import { FinanceProvider, useFinance } from '@/context/FinanceContext';
import { useSidebar } from '@/context/SidebarContext';
import Sidebar from '@/components/Sidebar';
import PremiumHeader from '@/components/PremiumHeader';
import { Plus, Edit2, Trash2, DollarSign, X, TrendingUp, CalendarRange } from 'lucide-react';
import { formatCurrency, getNextPaymentDate, formatDate } from '@/lib/utils';
import { Income, Frequencia } from '@/types';
import dynamic from 'next/dynamic';

const AnnualIncomeProjectionChart = dynamic(() => import('@/components/charts/AnnualIncomeProjectionChart'), { ssr: false });
const IncomeSourcesPieChart = dynamic(() => import('@/components/charts/IncomeSourcesPieChart'), { ssr: false });

function IncomeContent() {
  const { income, addIncomeEntry, updateIncome, deleteIncome, accounts } = useFinance();
  const { isCollapsed } = useSidebar();
  const [showModal, setShowModal] = useState(false);
  const [editingIncome, setEditingIncome] = useState<Income | null>(null);
  const [formData, setFormData] = useState({
    nome: '',
    valor: 0,
    frequencia: 'mensal' as Frequencia,
    data: 1,
    conta: 'Montepio',
  });

  const calculateMonthlyEquivalent = (incomeItem: Income): number => {
    switch (incomeItem.frequencia) {
      case 'semanal': return incomeItem.valor * 4.33;
      case 'quinzenal': return incomeItem.valor * 2;
      case 'mensal': return incomeItem.valor;
      case 'trimestral': return incomeItem.valor / 3;
      case 'anual': return incomeItem.valor / 12;
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
      default: return incomeItem.valor;
    }
  };

  const totalMonthly = income.reduce((sum, i) => sum + calculateMonthlyEquivalent(i), 0);
  const totalAnnual = income.reduce((sum, i) => sum + calculateAnnualEquivalent(i), 0);

  // Calculate monthly income received so far this month
  const today = new Date();
  const currentDay = today.getDate();
  const incomeReceivedSoFar = income
    .filter(i => i.frequencia === 'mensal' && i.data <= currentDay)
    .reduce((sum, i) => sum + i.valor, 0);
  
  const monthlyProgress = totalMonthly > 0 ? (incomeReceivedSoFar / totalMonthly) * 100 : 0;

  // Annual projection data (mock for now based on monthly income)
  const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
  const annualProjectionData = months.map((month, i) => {
    // Mocking some variation
    const base = totalMonthly;
    const currentYear = base * (1 + (Math.sin(i) * 0.1));
    const prevYear = base * 0.9 * (1 + (Math.cos(i) * 0.1));
    return { month, currentYear, prevYear };
  });

  // Income sources data for pie chart
  const incomeSourcesData = income.map(i => ({
    name: i.nome,
    value: totalMonthly > 0 ? (calculateMonthlyEquivalent(i) / totalMonthly) * 100 : 0
  }));

  // Sort income by next payment date
  const sortedIncome = [...income].sort((a, b) => {
    const dateA = getNextPaymentDate(a.data).getTime();
    const dateB = getNextPaymentDate(b.data).getTime();
    return dateA - dateB;
  });

  const handleOpenModal = (incomeItem?: Income) => {
    if (incomeItem) {
      setEditingIncome(incomeItem);
      setFormData({
        nome: incomeItem.nome,
        valor: incomeItem.valor,
        frequencia: incomeItem.frequencia,
        data: incomeItem.data,
        conta: incomeItem.conta,
      });
    } else {
      setEditingIncome(null);
      setFormData({
        nome: '',
        valor: 0,
        frequencia: 'mensal',
        data: 1,
        conta: accounts[0]?.nome || 'Montepio',
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
        <div className="stats-grid" style={{ marginBottom: '24px' }}>
          {/* Card 1: Monthly Income */}
          <div className="card animate-slideUp" style={{ background: 'linear-gradient(180deg, rgba(16, 185, 129, 0.15) 0%, transparent 100%)' }}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 rounded-full bg-white/[0.03] border border-white/[0.05] flex items-center justify-center">
                <CalendarRange size={16} className="text-slate-400" />
              </div>
              <p className="text-[10px] text-slate-500 uppercase tracking-[0.2em]">Rendimento Mensal</p>
            </div>
            <div className="card-value" style={{ color: 'var(--accent-success)', fontSize: '1.75rem', fontWeight: 700 }}>
              {formatCurrency(incomeReceivedSoFar)}
            </div>
            <div className="mt-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-[10px] text-slate-500 uppercase">Expectável: {formatCurrency(totalMonthly)}</span>
                <span className="text-[10px] text-slate-400 font-bold">{monthlyProgress.toFixed(0)}%</span>
              </div>
              <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-emerald-500 rounded-full transition-all duration-1000" 
                  style={{ width: `${Math.min(monthlyProgress, 100)}%` }}
                />
              </div>
            </div>
          </div>

          {/* Card 2: Annual Projection */}
          <div className="card animate-slideUp" style={{ background: 'linear-gradient(180deg, rgba(99, 102, 241, 0.15) 0%, transparent 100%)' }}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 rounded-full bg-white/[0.03] border border-white/[0.05] flex items-center justify-center">
                <TrendingUp size={16} className="text-slate-400" />
              </div>
              <p className="text-[10px] text-slate-500 uppercase tracking-[0.2em]">Projeção Anual</p>
            </div>
            <div className="flex items-baseline gap-2 mb-4">
              <span className="card-value" style={{ fontSize: '1.5rem', fontWeight: 700 }}>{formatCurrency(totalAnnual)}</span>
            </div>
            <div style={{ height: '80px', width: '100%' }}>
              <AnnualIncomeProjectionChart data={annualProjectionData} tooltipStyle={tooltipStyle} />
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
            <div className="flex items-center gap-4">
              <div style={{ height: '80px', width: '80px', flexShrink: 0 }}>
                <IncomeSourcesPieChart data={incomeSourcesData} tooltipStyle={tooltipStyle} />
              </div>
              <div className="flex-1 space-y-2">
                {incomeSourcesData.slice(0, 3).map((source, idx) => (
                  <div key={idx} className="flex justify-between items-center">
                    <span className="text-[10px] text-slate-400 truncate max-w-[80px]">{source.name}</span>
                    <span className="text-[10px] text-slate-500 font-bold">{source.value.toFixed(0)}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Income Table */}
        <div className="card animate-slideUp">
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
                {sortedIncome.map((incomeItem) => {
                  const peso = totalMonthly > 0 ? (calculateMonthlyEquivalent(incomeItem) / totalMonthly) * 100 : 0;
                  const nextDate = getNextPaymentDate(incomeItem.data);
                  
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
                        <span style={{ fontWeight: 600, fontSize: '0.9rem', color: 'white' }}>
                          +{formatCurrency(incomeItem.valor)}
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
                          {formatDate(nextDate.toISOString())}
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
                  </select>
                </div>
              </div>

              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Data de Recebimento (dia)</label>
                  <input
                    type="number"
                    className="form-input"
                    value={formData.data}
                    onChange={(e) => setFormData({ ...formData, data: parseInt(e.target.value) || 1 })}
                    min="1"
                    max="31"
                    required
                  />
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
