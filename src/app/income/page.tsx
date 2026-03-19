"use client";

import { useState } from 'react';
import { FinanceProvider, useFinance } from '@/context/FinanceContext';
import { useSidebar } from '@/context/SidebarContext';
import Sidebar from '@/components/Sidebar';
import PremiumHeader from '@/components/PremiumHeader';
import { Plus, Edit2, Trash2, DollarSign, X, TrendingUp } from 'lucide-react';
import { formatCurrency, getNextPaymentDate, formatDate } from '@/lib/utils';
import { Income, Frequencia } from '@/types';

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

  return (
    <div className="app-container">
      <Sidebar />
      
      <main className={`main-content ${isCollapsed ? 'sidebar-collapsed' : ''}`}>
        <PremiumHeader pageName="Rendimentos" />
        
        <div className="page-header animate-fadeIn" style={{ paddingBottom: '20px' }}>
          <div style={{ float: 'left' }}>
            <h1 className="page-title" style={{ fontSize: '1.5rem', lineHeight: 0.5 }}>Rendimentos</h1>
            <p className="page-subtitle">Gerencie as suas fontes de rendimento</p>
          </div>
          <button className="btn btn-primary" style={{ float: 'right', marginTop: '-8px' }} onClick={() => handleOpenModal()}>
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M5 12h14"></path>
              <path d="M12 5v14"></path>
            </svg>
            Novo Rendimento
          </button>
        </div>

        {/* Summary Cards */}
        <div className="stats-grid" style={{ marginBottom: '24px' }}>
          <div className="card animate-slideUp" style={{ background: 'linear-gradient(180deg, rgba(16, 185, 129, 0.15) 0%, transparent 100%)' }}>
            <div className="card-header">
              <span className="card-title">Rendimento Mensal</span>
              <DollarSign size={20} style={{ color: 'var(--accent-success)' }} />
            </div>
            <div className="card-value" style={{ color: 'var(--accent-success)' }}>
              {formatCurrency(totalMonthly)}
            </div>
            <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginTop: '8px' }}>
              Equivalent mensal
            </div>
          </div>

          <div className="card animate-slideUp" style={{ background: 'linear-gradient(180deg, rgba(99, 102, 241, 0.15) 0%, transparent 100%)' }}>
            <div className="card-header">
              <span className="card-title">Rendimento Anual</span>
              <TrendingUp size={20} style={{ color: 'var(--accent-primary)' }} />
            </div>
            <div className="card-value">
              {formatCurrency(totalAnnual)}
            </div>
            <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginTop: '8px' }}>
              Projeção anual
            </div>
          </div>

          <div className="card animate-slideUp">
            <div className="card-header">
              <span className="card-title">Fontes de Rendimento</span>
              <DollarSign size={20} style={{ color: 'var(--text-muted)' }} />
            </div>
            <div className="card-value">
              {income.length}
            </div>
            <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginTop: '8px' }}>
              Ativas
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
                  <th style={{ textAlign: 'right' }}>Equiv. Mensal</th>
                  <th>Data Recebimento</th>
                  <th>Conta</th>
                  <th style={{ textAlign: 'right' }}>Próximo</th>
                  <th style={{ textAlign: 'right' }}>Ações</th>
                </tr>
              </thead>
              <tbody>
                {income.map((incomeItem) => (
                  <tr key={incomeItem.id}>
                    <td>
                      <div style={{ fontWeight: 600 }}>{incomeItem.nome}</div>
                    </td>
                    <td>
                      <span className={`badge ${getFrequencyBadge(incomeItem.frequencia)}`}>
                        {getFrequencyLabel(incomeItem.frequencia)}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <span  style={{ fontWeight: 600, color: 'var(--accent-success)' }}>
                        +{formatCurrency(incomeItem.valor)}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <span  style={{ color: 'var(--text-muted)' }}>
                        {formatCurrency(calculateMonthlyEquivalent(incomeItem))}
                      </span>
                    </td>
                    <td>
                      <span style={{ color: 'var(--text-secondary)' }}>
                        Dia {incomeItem.data}
                      </span>
                    </td>
                    <td>
                      <span style={{ color: 'var(--text-secondary)' }}>{incomeItem.conta}</span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <span style={{ fontSize: '0.8125rem' }}>
                        {formatDate(getNextPaymentDate(incomeItem.data).toISOString())}
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
                ))}
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
  return <IncomeContent />;
}
