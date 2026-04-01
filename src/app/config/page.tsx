"use client";

import { useState } from 'react';
import PremiumHeader from '@/components/PremiumHeader';
import Sidebar from '@/components/Sidebar';
import { useFinance } from '@/context/FinanceContext';
import { RecurringMovement, Frequencia } from '@/types';
import { Plus, Trash2, Edit2, Save, X, Settings, ArrowUpRight, ArrowDownRight, Calendar } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function ConfigPage() {
  const { recurringMovements, addRecurringMovement, updateRecurringMovement, deleteRecurringMovement, accounts } = useFinance();
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState<Partial<RecurringMovement>>({
    nome: '',
    valor: 0,
    tipo: 'despesa',
    frequencia: 'mensal',
    dia: 1,
    conta: accounts[0]?.nome || '',
    categoria: 'Diversos',
    ativa: true
  });

  const handleSave = () => {
    if (!formData.nome || formData.valor === undefined) return;

    if (editingId) {
      updateRecurringMovement({ ...formData, id: editingId } as RecurringMovement);
      setEditingId(null);
    } else {
      addRecurringMovement(formData as Omit<RecurringMovement, 'id'>);
      setIsAdding(false);
    }
    
    setFormData({
      nome: '',
      valor: 0,
      tipo: 'despesa',
      frequencia: 'mensal',
      dia: 1,
      conta: accounts[0]?.nome || '',
      categoria: 'Diversos',
      ativa: true
    });
  };

  const startEdit = (m: RecurringMovement) => {
    setEditingId(m.id);
    setFormData(m);
    setIsAdding(false);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setIsAdding(false);
    setFormData({
      nome: '',
      valor: 0,
      tipo: 'despesa',
      frequencia: 'mensal',
      dia: 1,
      conta: accounts[0]?.nome || '',
      categoria: 'Diversos',
      ativa: true
    });
  };

  return (
    <div className="flex min-h-screen bg-[#0a0b0f]">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <PremiumHeader pageName="Configurações" />
        
        <main className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar">
          <div className="max-w-5xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-3">
                  <Settings className="text-accent-primary" size={24} />
                  Movimentos Recorrentes
                </h2>
                <p className="text-slate-500 text-sm mt-1">Configure as suas receitas e despesas automáticas</p>
              </div>
              
              {!isAdding && !editingId && (
                <button 
                  onClick={() => setIsAdding(true)}
                  className="flex items-center gap-2 bg-accent-primary hover:bg-accent-primary/90 text-white px-4 py-2 rounded-lg text-sm font-bold transition-all shadow-lg shadow-accent-primary/20"
                >
                  <Plus size={18} />
                  Novo Movimento
                </button>
              )}
            </div>

            {/* Form for Adding/Editing */}
            <AnimatePresence>
              {(isAdding || editingId) && (
                <motion.div 
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="bg-[#151619] border border-white/[0.08] rounded-2xl p-6 mb-8 shadow-xl"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Nome</label>
                      <input 
                        type="text" 
                        value={formData.nome}
                        onChange={e => setFormData({...formData, nome: e.target.value})}
                        className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-accent-primary/50 transition-colors"
                        placeholder="Ex: Semanada"
                      />
                    </div>
                    
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Valor (€)</label>
                      <input 
                        type="number" 
                        value={formData.valor}
                        onChange={e => setFormData({...formData, valor: parseFloat(e.target.value)})}
                        className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-accent-primary/50 transition-colors"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Tipo</label>
                      <select 
                        value={formData.tipo}
                        onChange={e => setFormData({...formData, tipo: e.target.value as 'receita' | 'despesa'})}
                        className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-accent-primary/50 transition-colors"
                      >
                        <option value="despesa">Despesa</option>
                        <option value="receita">Receita</option>
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Frequência</label>
                      <select 
                        value={formData.frequencia}
                        onChange={e => setFormData({...formData, frequencia: e.target.value as Frequencia})}
                        className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-accent-primary/50 transition-colors"
                      >
                        <option value="mensal">Mensal</option>
                        <option value="semanal">Semanal</option>
                        <option value="quinzenal">Quinzenal</option>
                        <option value="trimestral">Trimestral</option>
                        <option value="anual">Anual</option>
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Dia / Dia Semana</label>
                      <input 
                        type="number" 
                        value={formData.dia}
                        onChange={e => setFormData({...formData, dia: parseInt(e.target.value)})}
                        className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-accent-primary/50 transition-colors"
                        min={0}
                        max={31}
                      />
                      <p className="text-[9px] text-slate-500 mt-1">0=Dom, 1=Seg... ou dia do mês</p>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Conta</label>
                      <select 
                        value={formData.conta}
                        onChange={e => setFormData({...formData, conta: e.target.value})}
                        className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-accent-primary/50 transition-colors"
                      >
                        {accounts.map(acc => (
                          <option key={acc.id} value={acc.nome}>{acc.nome}</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Categoria</label>
                      <input 
                        type="text" 
                        value={formData.categoria}
                        onChange={e => setFormData({...formData, categoria: e.target.value})}
                        className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-accent-primary/50 transition-colors"
                        placeholder="Ex: Lazer"
                      />
                    </div>

                    <div className="flex items-end gap-2">
                      <button 
                        onClick={handleSave}
                        className="flex-1 bg-accent-primary hover:bg-accent-primary/90 text-white h-[42px] rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2"
                      >
                        <Save size={18} />
                        Guardar
                      </button>
                      <button 
                        onClick={cancelEdit}
                        className="w-[42px] h-[42px] bg-white/[0.05] hover:bg-white/[0.1] text-slate-400 rounded-xl transition-all flex items-center justify-center"
                      >
                        <X size={18} />
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* List of Recurring Movements */}
            <div className="bg-[#151619] border border-white/[0.08] rounded-2xl overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-white/[0.04] bg-white/[0.02]">
                      <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Movimento</th>
                      <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Valor</th>
                      <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Frequência</th>
                      <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Dia</th>
                      <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Conta</th>
                      <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-right">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recurringMovements.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-6 py-12 text-center text-slate-500 italic">
                          Nenhum movimento recorrente configurado.
                        </td>
                      </tr>
                    ) : (
                      recurringMovements.map((m) => (
                        <tr key={m.id} className="border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors group">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${m.tipo === 'receita' ? 'bg-success-500/10 text-success-500' : 'bg-danger-500/10 text-danger-500'}`}>
                                {m.tipo === 'receita' ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
                              </div>
                              <div>
                                <div className="text-sm font-medium text-white">{m.nome}</div>
                                <div className="text-[10px] text-slate-500 uppercase tracking-wider">{m.categoria}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`text-sm font-bold ${m.tipo === 'receita' ? 'text-success-500' : 'text-danger-500'}`}>
                              {m.tipo === 'receita' ? '+' : '-'}{m.valor.toLocaleString('pt-PT', { style: 'currency', currency: 'EUR' })}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-xs text-slate-400 capitalize">{m.frequencia}</span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2 text-slate-400">
                              <Calendar size={12} />
                              <span className="text-xs">{m.dia}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-xs text-slate-400">{m.conta}</span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button 
                                onClick={() => startEdit(m)}
                                className="p-2 text-slate-400 hover:text-accent-primary hover:bg-accent-primary/10 rounded-lg transition-all"
                              >
                                <Edit2 size={16} />
                              </button>
                              <button 
                                onClick={() => deleteRecurringMovement(m.id)}
                                className="p-2 text-slate-400 hover:text-danger-500 hover:bg-danger-500/10 rounded-lg transition-all"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
