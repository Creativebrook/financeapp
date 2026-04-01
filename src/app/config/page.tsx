"use client";

import { useState } from 'react';
import PremiumHeader from '@/components/PremiumHeader';
import Sidebar from '@/components/Sidebar';
import { useFinance } from '@/context/FinanceContext';
import { Income, Debt, FixedExpense, Frequencia } from '@/types';
import { Plus, Trash2, Edit2, Settings, ArrowUpRight, ArrowDownRight, Calendar, CreditCard, Receipt } from 'lucide-react';
import { motion } from 'motion/react';

import { useSidebar } from '@/context/SidebarContext';

type ConfigTab = 'rendimentos' | 'dividas' | 'despesas';

export default function ConfigPage() {
  const { isCollapsed } = useSidebar();
  const { 
    income, addIncomeEntry, updateIncome, deleteIncome,
    debts, addDebt, updateDebt, deleteDebt,
    fixedExpenses, addFixedExpense, updateFixedExpense, deleteFixedExpense,
    accounts 
  } = useFinance();
  
  const [activeTab, setActiveTab] = useState<ConfigTab>('rendimentos');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [itemToDelete, setItemToDelete] = useState<{id: string, type: ConfigTab} | null>(null);
  
  const [formData, setFormData] = useState({
    nome: '',
    valor: '',
    dia: 1,
    conta: 'Montepio',
    categoria: 'Diversos',
    frequencia: 'mensal' as Frequencia
  });

  const categories = {
    dividas: ['Cartão de Crédito', 'Empréstimo', 'Impostos', 'Serviços', 'Outro'],
    despesas: ['Desporto', 'Educação', 'Família', 'Habitação', 'Impostos', 'Saúde', 'Seguros', 'Telemóveis', 'Subscrição', 'Tecnologia', 'Transportes', 'Outros']
  };

  const handleOpenAdd = () => {
    setEditingItem(null);
    setFormData({ nome: '', valor: '', dia: 1, conta: 'Montepio', categoria: 'Diversos', frequencia: 'mensal' });
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (item: any) => {
    setEditingItem(item);
    setFormData({
      nome: item.nome,
      valor: (item.valor || item.prestacao_mensal).toString(),
      dia: item.data || item.data_pagamento,
      conta: item.conta,
      categoria: item.categoria || 'Diversos',
      frequencia: item.frequencia || 'mensal'
    });
    setIsAddModalOpen(true);
  };

  const handleSave = () => {
    const valorNum = parseFloat(formData.valor);
    if (!formData.nome || isNaN(valorNum)) return;

    if (editingItem) {
      if (activeTab === 'rendimentos') {
        updateIncome(editingItem.id, {
          nome: formData.nome,
          valor: valorNum,
          frequencia: formData.frequencia,
          data: formData.dia,
          conta: formData.conta,
        });
      } else if (activeTab === 'dividas') {
        updateDebt(editingItem.id, {
          nome: formData.nome,
          prestacao_mensal: valorNum,
          data_pagamento: formData.dia,
          conta: formData.conta,
          categoria: formData.categoria,
          frequencia: formData.frequencia,
        });
      } else if (activeTab === 'despesas') {
        updateFixedExpense(editingItem.id, {
          nome: formData.nome,
          valor: valorNum,
          frequencia: formData.frequencia,
          data_pagamento: formData.dia,
          conta: formData.conta,
          categoria: formData.categoria,
        });
      }
    } else {
      if (activeTab === 'rendimentos') {
        addIncomeEntry({
          nome: formData.nome,
          valor: valorNum,
          frequencia: formData.frequencia,
          data: formData.dia,
          conta: formData.conta,
        });
      } else if (activeTab === 'dividas') {
        addDebt({
          nome: formData.nome,
          valor_total: valorNum * 12,
          valor_inicial: valorNum * 12,
          prestacao_mensal: valorNum,
          data_pagamento: formData.dia,
          conta: formData.conta,
          categoria: formData.categoria,
          frequencia: formData.frequencia,
        });
      } else if (activeTab === 'despesas') {
        addFixedExpense({
          nome: formData.nome,
          valor: valorNum,
          frequencia: formData.frequencia,
          data_pagamento: formData.dia,
          conta: formData.conta,
          categoria: formData.categoria,
        });
      }
    }

    setIsAddModalOpen(false);
    setEditingItem(null);
  };

  const confirmDelete = () => {
    if (!itemToDelete) return;
    
    if (itemToDelete.type === 'rendimentos') deleteIncome(itemToDelete.id);
    else if (itemToDelete.type === 'dividas') deleteDebt(itemToDelete.id);
    else if (itemToDelete.type === 'despesas') deleteFixedExpense(itemToDelete.id);
    
    setItemToDelete(null);
  };

  // Filter for recurring income
  const recurringIncome = income.filter(i => i.frequencia !== 'unico');

  return (
    <div className="app-container">
      <Sidebar />
      <main className={`main-content ${isCollapsed ? 'sidebar-collapsed' : ''}`}>
        <PremiumHeader pageName="Configurações" />
        
        <div className="p-4 md:p-8 animate-fadeIn">
          <div className="max-w-6xl mx-auto">
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-3">
                <Settings className="text-accent-primary" size={24} />
                Configurações de Movimentos
              </h2>
              <p className="text-slate-500 text-sm mt-1">Gerencie seus rendimentos, dívidas e despesas recorrentes</p>
            </div>

            {/* Tabs */}
            <div className="flex items-center gap-2 mb-8 bg-white/[0.02] p-1 rounded-xl border border-white/[0.05] w-fit">
              <button 
                onClick={() => setActiveTab('rendimentos')}
                className={`px-6 py-2.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
                  activeTab === 'rendimentos' ? 'bg-accent-primary text-white shadow-lg shadow-accent-primary/20' : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                <ArrowUpRight size={14} />
                Rendimentos
              </button>
              <button 
                onClick={() => setActiveTab('dividas')}
                className={`px-6 py-2.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
                  activeTab === 'dividas' ? 'bg-accent-primary text-white shadow-lg shadow-accent-primary/20' : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                <CreditCard size={14} />
                Dívidas
              </button>
              <button 
                onClick={() => setActiveTab('despesas')}
                className={`px-6 py-2.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
                  activeTab === 'despesas' ? 'bg-accent-primary text-white shadow-lg shadow-accent-primary/20' : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                <Receipt size={14} />
                Despesas Fixas
              </button>
            </div>

            {/* Content based on active tab */}
            <div className="space-y-6">
              {activeTab === 'rendimentos' && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                  <div className="bg-[#151619] border border-white/[0.08] rounded-2xl overflow-hidden shadow-xl">
                    <div className="p-6 border-b border-white/[0.05] flex items-center justify-between">
                      <h3 className="text-sm font-bold text-white uppercase tracking-widest">Rendimentos Recorrentes</h3>
                      <button 
                        onClick={handleOpenAdd}
                        className="bg-accent-primary/10 hover:bg-accent-primary/20 text-accent-primary px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 cursor-pointer"
                      >
                        <Plus size={14} />
                        Adicionar
                      </button>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="border-b border-white/[0.04] bg-white/[0.02]">
                            <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Nome</th>
                            <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Valor</th>
                            <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Frequência</th>
                            <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-center">Dia</th>
                            <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Conta</th>
                            <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-right">Ações</th>
                          </tr>
                        </thead>
                        <tbody>
                          {recurringIncome.map((m) => (
                            <tr key={m.id} className="border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors group">
                              <td className="px-6 py-4 text-sm font-medium text-white">{m.nome}</td>
                              <td className="px-6 py-4 text-sm font-bold text-success-500">
                                {m.valor.toLocaleString('pt-PT', { style: 'currency', currency: 'EUR' })}
                              </td>
                              <td className="px-6 py-4 text-xs text-slate-400 capitalize">{m.frequencia}</td>
                              <td className="px-6 py-4 text-xs text-slate-400 text-center">{m.data}</td>
                              <td className="px-6 py-4 text-xs text-slate-400">{m.conta}</td>
                              <td className="px-6 py-4 text-right flex items-center justify-end gap-2">
                                <button onClick={() => handleOpenEdit(m)} className="p-2 text-slate-500 hover:text-accent-primary transition-colors cursor-pointer">
                                  <Edit2 size={16} />
                                </button>
                                <button onClick={() => setItemToDelete({id: m.id, type: 'rendimentos'})} className="p-2 text-slate-500 hover:text-danger-500 transition-colors cursor-pointer">
                                  <Trash2 size={16} />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'dividas' && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                  <div className="bg-[#151619] border border-white/[0.08] rounded-2xl overflow-hidden shadow-xl">
                    <div className="p-6 border-b border-white/[0.05] flex items-center justify-between">
                      <h3 className="text-sm font-bold text-white uppercase tracking-widest">Dívidas e Empréstimos</h3>
                      <button 
                        onClick={handleOpenAdd}
                        className="bg-accent-primary/10 hover:bg-accent-primary/20 text-accent-primary px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 cursor-pointer"
                      >
                        <Plus size={14} />
                        Adicionar
                      </button>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="border-b border-white/[0.04] bg-white/[0.02]">
                            <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Nome</th>
                            <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Prestação</th>
                            <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-center">Dia</th>
                            <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Conta</th>
                            <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-right">Ações</th>
                          </tr>
                        </thead>
                        <tbody>
                          {debts.map((m) => (
                            <tr key={m.id} className="border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors group">
                              <td className="px-6 py-4 text-sm font-medium text-white">{m.nome}</td>
                              <td className="px-6 py-4 text-sm font-bold text-danger-500">
                                {m.prestacao_mensal.toLocaleString('pt-PT', { style: 'currency', currency: 'EUR' })}
                              </td>
                              <td className="px-6 py-4 text-xs text-slate-400 text-center">{m.data_pagamento}</td>
                              <td className="px-6 py-4 text-xs text-slate-400">{m.conta}</td>
                              <td className="px-6 py-4 text-right flex items-center justify-end gap-2">
                                <button onClick={() => handleOpenEdit(m)} className="p-2 text-slate-500 hover:text-accent-primary transition-colors cursor-pointer">
                                  <Edit2 size={16} />
                                </button>
                                <button onClick={() => setItemToDelete({id: m.id, type: 'dividas'})} className="p-2 text-slate-500 hover:text-danger-500 transition-colors cursor-pointer">
                                  <Trash2 size={16} />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'despesas' && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                  <div className="bg-[#151619] border border-white/[0.08] rounded-2xl overflow-hidden shadow-xl">
                    <div className="p-6 border-b border-white/[0.05] flex items-center justify-between">
                      <h3 className="text-sm font-bold text-white uppercase tracking-widest">Despesas Fixas</h3>
                      <button 
                        onClick={handleOpenAdd}
                        className="bg-accent-primary/10 hover:bg-accent-primary/20 text-accent-primary px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 cursor-pointer"
                      >
                        <Plus size={14} />
                        Adicionar
                      </button>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="border-b border-white/[0.04] bg-white/[0.02]">
                            <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Nome</th>
                            <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Valor</th>
                            <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Frequência</th>
                            <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-center">Dia</th>
                            <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Conta</th>
                            <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-right">Ações</th>
                          </tr>
                        </thead>
                        <tbody>
                          {fixedExpenses.map((m) => (
                            <tr key={m.id} className="border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors group">
                              <td className="px-6 py-4 text-sm font-medium text-white">{m.nome}</td>
                              <td className="px-6 py-4 text-sm font-bold text-danger-500">
                                {m.valor.toLocaleString('pt-PT', { style: 'currency', currency: 'EUR' })}
                              </td>
                              <td className="px-6 py-4 text-xs text-slate-400 capitalize">{m.frequencia}</td>
                              <td className="px-6 py-4 text-xs text-slate-400 text-center">{m.data_pagamento}</td>
                              <td className="px-6 py-4 text-xs text-slate-400">{m.conta}</td>
                              <td className="px-6 py-4 text-right flex items-center justify-end gap-2">
                                <button onClick={() => handleOpenEdit(m)} className="p-2 text-slate-500 hover:text-accent-primary transition-colors cursor-pointer">
                                  <Edit2 size={16} />
                                </button>
                                <button onClick={() => setItemToDelete({id: m.id, type: 'despesas'})} className="p-2 text-slate-500 hover:text-danger-500 transition-colors cursor-pointer">
                                  <Trash2 size={16} />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Add Modal */}
        {isAddModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-[#151619] border border-white/[0.1] rounded-2xl w-full max-w-md overflow-hidden shadow-2xl"
            >
              <div className="p-6 border-b border-white/[0.05] flex items-center justify-between">
                <h3 className="text-lg font-bold text-white">
                  {editingItem ? 'Editar' : 'Adicionar'} {activeTab === 'rendimentos' ? 'Rendimento' : activeTab === 'dividas' ? 'Dívida' : 'Despesa Fixa'}
                </h3>
                <button onClick={() => setIsAddModalOpen(false)} className="text-slate-500 hover:text-white transition-colors cursor-pointer">
                  <Plus size={20} className="rotate-45" />
                </button>
              </div>
              
              <div className="p-6 space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Nome</label>
                  <input 
                    type="text" 
                    value={formData.nome}
                    onChange={(e) => setFormData({...formData, nome: e.target.value})}
                    className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-accent-primary/50 transition-all"
                    placeholder="Ex: Salário, Renda, etc."
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Valor (€)</label>
                    <input 
                      type="number" 
                      value={formData.valor}
                      onChange={(e) => setFormData({...formData, valor: e.target.value})}
                      className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-accent-primary/50 transition-all"
                      placeholder="0.00"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Dia do Mês</label>
                    <input 
                      type="number" 
                      min="1" max="31"
                      value={formData.dia}
                      onChange={(e) => setFormData({...formData, dia: parseInt(e.target.value)})}
                      className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-accent-primary/50 transition-all"
                    />
                  </div>
                </div>
                
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Frequência</label>
                  <select 
                    value={formData.frequencia}
                    onChange={(e) => setFormData({...formData, frequencia: e.target.value as Frequencia})}
                    className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-accent-primary/50 transition-all appearance-none cursor-pointer"
                  >
                    {activeTab === 'rendimentos' ? (
                      <>
                        <option value="semanal" className="bg-[#1a1b1e] text-white">Semanal</option>
                        <option value="quinzenal" className="bg-[#1a1b1e] text-white">Quinzenal</option>
                        <option value="mensal" className="bg-[#1a1b1e] text-white">Mensal</option>
                        <option value="trimestral" className="bg-[#1a1b1e] text-white">Trimestral</option>
                        <option value="anual" className="bg-[#1a1b1e] text-white">Anual</option>
                        <option value="unico" className="bg-[#1a1b1e] text-white">Único</option>
                      </>
                    ) : activeTab === 'dividas' ? (
                      <>
                        <option value="mensal" className="bg-[#1a1b1e] text-white">Mensal</option>
                        <option value="trimestral" className="bg-[#1a1b1e] text-white">Trimestral</option>
                        <option value="semestral" className="bg-[#1a1b1e] text-white">Semestral</option>
                        <option value="anual" className="bg-[#1a1b1e] text-white">Anual</option>
                      </>
                    ) : (
                      <>
                        <option value="mensal" className="bg-[#1a1b1e] text-white">Mensal</option>
                        <option value="trimestral" className="bg-[#1a1b1e] text-white">Trimestral</option>
                        <option value="semestral" className="bg-[#1a1b1e] text-white">Semestral</option>
                        <option value="anual" className="bg-[#1a1b1e] text-white">Anual</option>
                      </>
                    )}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Conta</label>
                  <select 
                    value={formData.conta}
                    onChange={(e) => setFormData({...formData, conta: e.target.value})}
                    className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-accent-primary/50 transition-all appearance-none cursor-pointer"
                  >
                    {accounts.map(acc => (
                      <option key={acc.id} value={acc.nome} className="bg-[#1a1b1e] text-white">{acc.nome}</option>
                    ))}
                  </select>
                </div>

                {activeTab !== 'rendimentos' && (
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Categoria</label>
                    <select 
                      value={formData.categoria}
                      onChange={(e) => setFormData({...formData, categoria: e.target.value})}
                      className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-accent-primary/50 transition-all appearance-none cursor-pointer"
                    >
                      {(activeTab === 'dividas' ? categories.dividas : categories.despesas).map(cat => (
                        <option key={cat} value={cat} className="bg-[#1a1b1e] text-white">{cat}</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
              
              <div className="p-6 bg-white/[0.02] border-t border-white/[0.05] flex gap-3">
                <button 
                  onClick={() => setIsAddModalOpen(false)}
                  className="flex-1 px-4 py-3 rounded-xl border border-white/[0.08] text-slate-400 text-sm font-bold hover:bg-white/[0.05] transition-all cursor-pointer"
                >
                  Cancelar
                </button>
                <button 
                  onClick={handleSave}
                  className="flex-1 px-4 py-3 rounded-xl bg-accent-primary text-white text-sm font-bold hover:bg-accent-primary/90 transition-all shadow-lg shadow-accent-primary/20 cursor-pointer"
                >
                  {editingItem ? 'Guardar' : 'Confirmar'}
                </button>
              </div>
            </motion.div>
          </div>
        )}

      {/* Delete Confirmation Modal */}
      {itemToDelete && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-[#151619] border border-white/[0.1] rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl"
          >
            <div className="p-6 text-center">
              <div className="w-16 h-16 bg-danger-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trash2 className="text-danger-500" size={32} />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Confirmar Eliminação</h3>
              <p className="text-slate-400 text-sm">Tem a certeza que deseja eliminar este item? Esta ação não pode ser revertida.</p>
            </div>
            <div className="p-6 bg-white/[0.02] border-t border-white/[0.05] flex gap-3">
              <button 
                onClick={() => setItemToDelete(null)}
                className="flex-1 px-4 py-3 rounded-xl border border-white/[0.08] text-slate-400 text-sm font-bold hover:bg-white/[0.05] transition-all cursor-pointer"
              >
                Cancelar
              </button>
              <button 
                onClick={confirmDelete}
                className="flex-1 px-4 py-3 rounded-xl bg-danger-500 text-white text-sm font-bold hover:bg-danger-500/90 transition-all shadow-lg shadow-danger-500/20 cursor-pointer"
              >
                Eliminar
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
