"use client";

import { useState, useEffect } from 'react';
import { X, Bell, Send, CheckCircle2, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useFinance } from '@/context/FinanceContext';

interface TelegramAlertModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function TelegramAlertModal({ isOpen, onClose }: TelegramAlertModalProps) {
  const { telegramSettings, updateTelegramSettings } = useFinance();
  const [telegramNumber, setTelegramNumber] = useState(telegramSettings.chatId);
  const [alerts, setAlerts] = useState(telegramSettings.enabledAlerts);
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setTelegramNumber(telegramSettings.chatId);
      setAlerts(telegramSettings.enabledAlerts);
      setError(null);
    }
  }, [isOpen, telegramSettings]);

  const handleSave = async () => {
    if (!telegramNumber) {
      setError('Por favor, insira o seu Chat ID do Telegram.');
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      // 1. Update settings in context
      updateTelegramSettings({
        chatId: telegramNumber,
        enabledAlerts: alerts
      });

      // 2. Send a test message to verify
      const response = await fetch('/api/telegram', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: '<b>✅ Configuração Concluída!</b>\n\nAs suas notificações do FinanceFlow foram ativadas com sucesso para este chat.',
          chatId: telegramNumber
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao enviar mensagem de teste.');
      }

      setIsSaved(true);
      setTimeout(() => {
        setIsSaved(false);
        onClose();
      }, 2000);
    } catch (err: any) {
      console.error('Telegram Save Error:', err);
      setError(err.message || 'Ocorreu um erro ao configurar o Telegram.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-md bg-[#1a1c23] border border-white/[0.08] rounded-2xl shadow-2xl overflow-hidden"
          >
            <div className="p-6 border-b border-white/[0.05] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-accent-primary/10 flex items-center justify-center text-accent-primary">
                  <Bell size={20} />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white tracking-tight">Alertas Telegram</h2>
                  <p className="text-xs text-slate-500">Configure suas notificações</p>
                </div>
              </div>
              <button 
                onClick={onClose}
                className="w-8 h-8 rounded-full hover:bg-white/5 flex items-center justify-center text-slate-400 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="space-y-4">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Ativar Alertas Para:</label>
                
                <div className="space-y-3">
                  <button 
                    onClick={() => setAlerts(prev => ({ ...prev, rendimentos: !prev.rendimentos }))}
                    className={`w-full p-4 rounded-xl border transition-all flex items-center justify-between ${
                      alerts.rendimentos ? 'bg-accent-primary/5 border-accent-primary/20 text-white' : 'bg-white/[0.02] border-white/[0.05] text-slate-400'
                    }`}
                  >
                    <span className="text-sm font-medium">Rendimentos</span>
                    <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${
                      alerts.rendimentos ? 'bg-accent-primary border-accent-primary text-white' : 'border-white/20'
                    }`}>
                      {alerts.rendimentos && <CheckCircle2 size={12} />}
                    </div>
                  </button>

                  <button 
                    onClick={() => setAlerts(prev => ({ ...prev, dividas: !prev.dividas }))}
                    className={`w-full p-4 rounded-xl border transition-all flex items-center justify-between ${
                      alerts.dividas ? 'bg-accent-primary/5 border-accent-primary/20 text-white' : 'bg-white/[0.02] border-white/[0.05] text-slate-400'
                    }`}
                  >
                    <span className="text-sm font-medium">Dívidas</span>
                    <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${
                      alerts.dividas ? 'bg-accent-primary border-accent-primary text-white' : 'border-white/20'
                    }`}>
                      {alerts.dividas && <CheckCircle2 size={12} />}
                    </div>
                  </button>

                  <button 
                    onClick={() => setAlerts(prev => ({ ...prev, despesasFixas: !prev.despesasFixas }))}
                    className={`w-full p-4 rounded-xl border transition-all flex items-center justify-between ${
                      alerts.despesasFixas ? 'bg-accent-primary/5 border-accent-primary/20 text-white' : 'bg-white/[0.02] border-white/[0.05] text-slate-400'
                    }`}
                  >
                    <span className="text-sm font-medium">Despesas Fixas</span>
                    <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${
                      alerts.despesasFixas ? 'bg-accent-primary border-accent-primary text-white' : 'border-white/20'
                    }`}>
                      {alerts.despesasFixas && <CheckCircle2 size={12} />}
                    </div>
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Chat ID Telegram:</label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">
                    <Send size={16} />
                  </div>
                  <input 
                    type="text"
                    placeholder="Ex: 123456789"
                    value={telegramNumber}
                    onChange={(e) => setTelegramNumber(e.target.value)}
                    className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl py-3 pl-12 pr-4 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-accent-primary/50 transition-colors"
                  />
                </div>
                <div className="mt-2 flex items-start gap-2 px-1">
                  <div className="w-4 h-4 rounded-full bg-accent-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-[10px] font-bold text-accent-primary">i</span>
                  </div>
                  <p className="text-[10px] text-slate-500 leading-relaxed">
                    Obtenha o seu Chat ID enviando uma mensagem para <a href="https://t.me/userinfobot" target="_blank" rel="noreferrer" className="text-accent-primary hover:underline font-medium">@userinfobot</a> no Telegram.
                  </p>
                </div>
              </div>

              {error && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl">
                  <p className="text-[11px] text-red-400 font-medium text-center">{error}</p>
                </div>
              )}
            </div>

            <div className="p-6 bg-white/[0.02] border-t border-white/[0.05]">
              <button 
                onClick={handleSave}
                disabled={isSaving || isSaved}
                className={`w-full py-4 rounded-xl font-bold text-sm uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${
                  isSaved ? 'bg-success-500 text-white' : 'bg-accent-primary hover:bg-accent-secondary text-white shadow-lg shadow-accent-primary/20'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {isSaving ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    A Configurar...
                  </>
                ) : isSaved ? (
                  <>
                    <CheckCircle2 size={18} />
                    Configurações Salvas
                  </>
                ) : (
                  'Salvar Configurações'
                )}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
