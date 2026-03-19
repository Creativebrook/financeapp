"use client";

import { useState } from 'react';
import { FinanceProvider, useFinance } from '@/context/FinanceContext';
import { useSidebar } from '@/context/SidebarContext';
import Sidebar from '@/components/Sidebar';
import PremiumHeader from '@/components/PremiumHeader';
import { ChevronLeft, ChevronRight, Calendar, ArrowUpCircle, ArrowDownCircle, CreditCard } from 'lucide-react';
import { formatCurrency, getNextPaymentDate } from '@/lib/utils';

function CalendarContent() {
  const { fixedExpenses, debts, income } = useFinance();
  const { isCollapsed } = useSidebar();
  const [currentDate, setCurrentDate] = useState(new Date(2026, 2, 1)); // March 2026

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  
  const monthNames = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 
                      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
  const dayNames = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const isToday = (day: number) => {
    const today = new Date();
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

  // Upcoming events (next 30 days)
  const getUpcomingEvents = () => {
    const events: { date: Date; type: string; name: string; amount: number }[] = [];
    const today = new Date();

    // Generate events for next 30 days
    for (let i = 0; i < 30; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() + i);
      const day = date.getDate();

      fixedExpenses.forEach(expense => {
        if (expense.data_pagamento === day) {
          events.push({
            date,
            type: 'expense',
            name: expense.nome,
            amount: expense.valor,
          });
        }
      });

      debts.forEach(debt => {
        if (debt.data_pagamento === day) {
          events.push({
            date,
            type: 'debt',
            name: debt.nome,
            amount: debt.prestacao_mensal,
          });
        }
      });

      income.forEach(inc => {
        if (inc.data === day) {
          events.push({
            date,
            type: 'income',
            name: inc.nome,
            amount: inc.valor,
          });
        }
      });
    }

    return events.sort((a, b) => a.date.getTime() - b.date.getTime());
  };

  const upcomingEvents = getUpcomingEvents();

  const formatDateShort = (date: Date) => {
    return `${date.getDate()}/${date.getMonth() + 1}`;
  };

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'income': return <ArrowUpCircle size={14} style={{ color: 'var(--accent-success)' }} />;
      case 'debt': return <CreditCard size={14} style={{ color: 'var(--accent-warning)' }} />;
      default: return <ArrowDownCircle size={14} style={{ color: 'var(--accent-danger)' }} />;
    }
  };

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

        <div className="grid-2" style={{ gap: '24px' }}>
          {/* Calendar */}
          <div className="card animate-slideUp">
            <div className="card-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <button className="btn btn-icon btn-secondary" onClick={prevMonth}>
                  <ChevronLeft size={18} />
                </button>
                <h3 style={{ margin: 0, minWidth: '150px', textAlign: 'center' }}>
                  {monthNames[month]} {year}
                </h3>
                <button className="btn btn-icon btn-secondary" onClick={nextMonth}>
                  <ChevronRight size={18} />
                </button>
              </div>
              <Calendar size={20} style={{ color: 'var(--text-muted)' }} />
            </div>

            <div className="calendar-grid">
              {dayNames.map(day => (
                <div key={day} className="calendar-header">{day}</div>
              ))}
              
              {calendarDays.map((day, index) => (
                <div 
                  key={index} 
                  className={`calendar-day ${day && isToday(day) ? 'today' : ''}`}
                >
                  {day && (
                    <>
                      <div className="calendar-day-number">{day}</div>
                      {getEventsForDay(day).slice(0, 3).map((event, idx) => (
                        <div 
                          key={idx}
                          className={`calendar-event ${event.type}`}
                          title={`${event.name}: ${formatCurrency(event.amount)}`}
                        >
                          {event.name}
                        </div>
                      ))}
                      {getEventsForDay(day).length > 3 && (
                        <div style={{ fontSize: '0.625rem', color: 'var(--text-muted)' }}>
                          +{getEventsForDay(day).length - 3} mais
                        </div>
                      )}
                    </>
                  )}
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', gap: '16px', marginTop: '16px', justifyContent: 'center' }}>
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

          {/* Upcoming Events */}
          <div className="card animate-slideUp">
            <div className="card-header">
              <h3 className="card-title">Próximos 30 Dias</h3>
              <Calendar size={20} style={{ color: 'var(--text-muted)' }} />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '500px', overflowY: 'auto' }}>
              {upcomingEvents.slice(0, 15).map((event, index) => (
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
                    <div style={{ fontWeight: 500 }}>{event.name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {formatDateShort(event.date)}
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

              {upcomingEvents.length === 0 && (
                <div className="empty-state">
                  <Calendar size={32} style={{ opacity: 0.3, marginBottom: '8px' }} />
                  <p style={{ fontSize: '0.875rem' }}>Sem eventos próximos</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function CalendarPage() {
  return <CalendarContent />;
}
