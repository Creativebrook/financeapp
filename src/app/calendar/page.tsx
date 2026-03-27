"use client";

import { useState } from 'react';
import { FinanceProvider, useFinance } from '@/context/FinanceContext';
import { useSidebar } from '@/context/SidebarContext';
import Sidebar from '@/components/Sidebar';
import PremiumHeader from '@/components/PremiumHeader';
import { ChevronLeft, ChevronRight, Calendar, ArrowUpCircle, ArrowDownCircle, CreditCard, X } from 'lucide-react';
import { formatCurrency, getNextPaymentDate } from '@/lib/utils';

function CalendarContent() {
  const { fixedExpenses, debts, income } = useFinance();
  const { isCollapsed } = useSidebar();
  const [currentDate, setCurrentDate] = useState(new Date(2026, 2, 1)); // March 2026
  const [selectedDayEvents, setSelectedDayEvents] = useState<{ day: number, events: any[] } | null>(null);
  const [selectedDay, setSelectedDay] = useState<number | null>(24); // Default to today (24th)

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  
  const monthNames = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 
                      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
  const dayNames = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
    setSelectedDay(null);
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
    setSelectedDay(null);
  };

  const isToday = (day: number) => {
    // Use a fixed date for SSR to avoid hydration mismatches
    const today = new Date('2026-03-24T00:00:00Z');
    return day === today.getDate() && month === today.getMonth() && year === today.getFullYear();
  };

  // Generate calendar days
  const calendarDays = [];
  for (let i = 0; i < firstDayOfMonth; i++) {
    calendarDays.push(null);
  }
  for (let i = 1; i <= daysInMonth; i++) {
    calendarDays.push(i);
  }

  // Get events for a specific day
  const getEventsForDay = (day: number) => {
    const events: { type: string; name: string; amount: number }[] = [];
    const date = new Date(year, month, day);

    // Fixed expenses
    fixedExpenses.forEach(expense => {
      if (!expense) return;
      if (expense.data_pagamento === day) {
        events.push({
          type: 'expense',
          name: expense.nome,
          amount: expense.valor,
        });
      }
    });

    // Debts
    debts.forEach(debt => {
      if (!debt) return;
      if (debt.data_pagamento === day) {
        events.push({
          type: 'debt',
          name: debt.nome,
          amount: debt.prestacao_mensal,
        });
      }
    });

    // Income
    income.forEach(inc => {
      if (!inc) return;
      if (inc.data === day) {
        events.push({
          type: 'income',
          name: inc.nome,
          amount: inc.valor,
        });
      }
    });

    return events;
  };

  const handleDayClick = (day: number) => {
    const events = getEventsForDay(day);
    setSelectedDay(day);
    
    // Only show modal on desktop (md and up)
    if (window.innerWidth >= 768 && events.length > 0) {
      setSelectedDayEvents({ day, events });
    }
  };

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'income': return <ArrowUpCircle size={14} style={{ color: 'var(--accent-success)' }} />;
      case 'debt': return <CreditCard size={14} style={{ color: 'var(--accent-warning)' }} />;
      default: return <ArrowDownCircle size={14} style={{ color: 'var(--accent-danger)' }} />;
    }
  };

  const selectedDayEventsList = selectedDay ? getEventsForDay(selectedDay) : [];

  return (
    <div className="app-container">
      <Sidebar />
      
      <main className={`main-content ${isCollapsed ? 'sidebar-collapsed' : ''}`}>
        <PremiumHeader pageName="Calendario" />
        
        <div className="page-header animate-fadeIn" style={{ paddingBottom: '20px' }}>
          <div style={{ float: 'left' }}>
            <h1 className="page-title" style={{ fontSize: '1.5rem', lineHeight: 0.5 }}>Calendário Financeiro</h1>
            <p className="page-subtitle">Visão geral dos seus compromissos financeiros</p>
          </div>
        </div>

        <div className="animate-slideUp">
          {/* Calendar Card - Full Width on Mobile */}
          <div className="card calendar-card-mobile" style={{ padding: 'var(--space-sm)' }}>
            <div className="card-header" style={{ marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <button className="btn btn-icon btn-secondary" onClick={prevMonth}>
                  <ChevronLeft size={18} />
                </button>
                <h3 style={{ margin: 0, minWidth: '150px', textAlign: 'center', fontSize: '1.1rem' }}>
                  {monthNames[month]} {year}
                </h3>
                <button className="btn btn-icon btn-secondary" onClick={nextMonth}>
                  <ChevronRight size={18} />
                </button>
              </div>
              <Calendar size={20} style={{ color: 'var(--text-muted)' }} className="hidden md:block" />
            </div>

            <div className="calendar-grid">
              {dayNames.map(day => (
                <div key={day} className="calendar-day-header">{day}</div>
              ))}
              
              {calendarDays.map((day, index) => {
                const dayEvents = day ? getEventsForDay(day) : [];
                const hasIncome = dayEvents.some(e => e.type === 'income');
                const hasExpense = dayEvents.some(e => e.type === 'expense');
                const hasDebt = dayEvents.some(e => e.type === 'debt');

                return (
                  <div 
                    key={index} 
                    className={`calendar-day ${day && isToday(day) ? 'today' : ''} ${day === selectedDay ? 'selected' : ''}`}
                    onClick={() => day && handleDayClick(day)}
                  >
                    {day && (
                      <>
                        <div className="calendar-day-number">{day}</div>
                        
                        {/* Desktop: Event Names */}
                        {dayEvents.slice(0, 3).map((event, idx) => (
                          <div 
                            key={idx}
                            className={`calendar-event ${event.type}`}
                            title={`${event.name}: ${formatCurrency(event.amount)}`}
                          >
                            {event.name}
                          </div>
                        ))}
                        {dayEvents.length > 3 && (
                          <div className="calendar-event" style={{ fontSize: '0.625rem', color: 'var(--text-muted)', background: 'transparent' }}>
                            +{dayEvents.length - 3} mais
                          </div>
                        )}

                        {/* Mobile: Dots */}
                        <div className="calendar-dots-container md:hidden">
                          {hasIncome && <div className="calendar-event-dot" style={{ backgroundColor: 'var(--accent-success)' }} />}
                          {hasExpense && <div className="calendar-event-dot" style={{ backgroundColor: 'var(--accent-danger)' }} />}
                          {hasDebt && <div className="calendar-event-dot" style={{ backgroundColor: 'var(--accent-warning)' }} />}
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="hidden md:flex" style={{ gap: '16px', marginTop: '16px', justifyContent: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <div style={{ width: '12px', height: '12px', borderRadius: '2px', background: 'rgba(16, 185, 129, 0.3)' }} />
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Rendimento</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <div style={{ width: '12px', height: '12px', borderRadius: '2px', background: 'rgba(239, 68, 68, 0.3)' }} />
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Despesa</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <div style={{ width: '12px', height: '12px', borderRadius: '2px', background: 'rgba(245, 158, 11, 0.3)' }} />
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Dívida</span>
              </div>
            </div>
          </div>

          {/* Mobile: Selected Day Events List */}
          <div className="md:hidden mt-6 space-y-3">
            <h4 className="text-[0.8rem] text-slate-500 uppercase tracking-widest px-1">
              {selectedDay ? `Eventos de ${selectedDay} de ${monthNames[month]}` : 'Selecione um dia'}
            </h4>
            
            <div className="space-y-2">
              {selectedDayEventsList.map((event, index) => (
                <div 
                  key={index}
                  className="card"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '12px',
                    background: 'var(--bg-surface-2)',
                    borderRadius: '12px',
                    border: '1px solid var(--border-subtle)'
                  }}
                >
                  {getEventIcon(event.type)}
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 500, fontSize: '0.9rem', color: 'white' }}>{event.name}</div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'capitalize' }}>
                      {event.type === 'income' ? 'Rendimento' : event.type === 'debt' ? 'Dívida' : 'Despesa'}
                    </div>
                  </div>
                  <div style={{ 
                    fontFamily: 'JetBrains Mono, monospace',
                    fontWeight: 600,
                    fontSize: '0.9rem',
                    color: event.type === 'income' ? 'var(--accent-success)' : 
                           event.type === 'debt' ? 'var(--accent-warning)' : 'var(--accent-danger)'
                  }}>
                    {event.type === 'income' ? '+' : '-'}{formatCurrency(event.amount)}
                  </div>
                </div>
              ))}

              {selectedDay && selectedDayEventsList.length === 0 && (
                <div className="text-center py-8 opacity-40">
                  <Calendar size={32} className="mx-auto mb-2" />
                  <p className="text-xs">Nenhum evento para este dia</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Day Events Modal */}
        {selectedDayEvents && (
          <div className="modal-overlay" onClick={() => setSelectedDayEvents(null)}>
            <div className="modal animate-slideUp" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '400px' }}>
              <div className="modal-header">
                <h2 className="modal-title">
                  Eventos de {selectedDayEvents.day} de {monthNames[month]}
                </h2>
                <button className="btn btn-icon btn-secondary" onClick={() => setSelectedDayEvents(null)}>
                  <X size={20} />
                </button>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', padding: '20px 0' }}>
                {selectedDayEvents.events.map((event, index) => (
                  <div 
                    key={index}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '12px',
                      background: 'var(--bg-tertiary)',
                      borderRadius: '8px',
                    }}
                  >
                    {getEventIcon(event.type)}
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 500, fontSize: '0.9375rem' }}>{event.name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'capitalize' }}>
                        {event.type === 'income' ? 'Rendimento' : event.type === 'debt' ? 'Dívida' : 'Despesa'}
                      </div>
                    </div>
                    <div style={{ 
                      fontFamily: 'JetBrains Mono, monospace',
                      fontWeight: 600,
                      color: event.type === 'income' ? 'var(--accent-success)' : 
                             event.type === 'debt' ? 'var(--accent-warning)' : 'var(--accent-danger)'
                    }}>
                      {event.type === 'income' ? '+' : '-'}{formatCurrency(event.amount)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default function CalendarPage() {
  return <CalendarContent />;
}
