"use client";

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { TrendingUp, Bell, Menu, X, Calendar, ChevronDown } from 'lucide-react';
import Image from 'next/image';
import { useSidebar } from '@/context/SidebarContext';
import { useFinance } from '@/context/FinanceContext';

interface PremiumHeaderProps {
  pageName?: string;
  style?: React.CSSProperties;
}

export default function PremiumHeader({ pageName, style }: PremiumHeaderProps) {
  const { isMobileOpen, setIsMobileOpen } = useSidebar();
  const { selectedMonth, setSelectedMonth, variableExpenses, user, signOut } = useFinance();
  const [isMonthDropdownOpen, setIsMonthDropdownOpen] = useState(false);
  const [isMobileMonthDropdownOpen, setIsMobileMonthDropdownOpen] = useState(false);

  const isSimpleAuth = typeof window !== 'undefined' && localStorage.getItem("finance_app_auth") === "true";
  const isUserLoggedIn = !!user || isSimpleAuth;

  const availableMonths = useMemo(() => {
    const months = new Set<string>();
    variableExpenses.forEach(e => {
      if (e && e.data) {
        months.add(e.data.substring(0, 7));
      }
    });
    // Ensure current month is there
    months.add('2026-03');
    return Array.from(months).sort().reverse();
  }, [variableExpenses]);

  const getMonthName = (monthYear: string) => {
    const [y, m] = monthYear.split('-');
    const date = new Date(parseInt(y), parseInt(m) - 1, 1);
    return date.toLocaleString('pt-PT', { month: 'long', year: 'numeric' }).toUpperCase();
  };

  return (
    <>
      {/* Premium Header - Desktop */}
      <header className="premium-header" style={style}>
        <div className="premium-header-left">
          <Link href="/" className="premium-header-logo-link">
            <div className="premium-header-logo">
              <TrendingUp size={20} strokeWidth={2.5} />
            </div>
          </Link>
          <div className="premium-header-info">
            <h1 className="premium-header-title">Finance 360º</h1>
            <p className="premium-header-subtitle">
              <span className="subtitle-label">Finance and portfolio overview</span>
            </p>
          </div>
        </div>
        <div className="premium-header-right">
          {/* Month Filter Dropdown */}
          <div className="relative">
            <button 
              className={`premium-header-btn flex items-center justify-between gap-3 px-4 min-w-[160px] ${isMonthDropdownOpen ? 'bg-white/[0.08] text-white border-white/[0.15]' : 'border-white/[0.05]'} border transition-all duration-200`}
              onClick={() => setIsMonthDropdownOpen(!isMonthDropdownOpen)}
              title="Filtrar por mês"
            >
              <div className="flex items-center gap-2">
                <Calendar size={16} className="text-accent-primary" />
                <span className="text-[10px] font-bold uppercase tracking-widest hidden md:inline whitespace-nowrap">
                  {getMonthName(selectedMonth)}
                </span>
              </div>
              <ChevronDown size={14} className={`opacity-50 transition-transform duration-300 ${isMonthDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {isMonthDropdownOpen && (
              <>
                <div 
                  className="fixed inset-0 z-40" 
                  onClick={() => setIsMonthDropdownOpen(false)}
                />
                <div className="absolute right-0 mt-2 w-56 bg-[#1a1c23] border border-white/[0.08] rounded-xl shadow-2xl z-50 py-2 animate-fadeIn overflow-hidden">
                  <div className="px-4 py-2 border-bottom border-white/[0.04] mb-1">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Selecionar Mês</span>
                  </div>
                  <div className="max-h-[300px] overflow-y-auto custom-scrollbar">
                    {availableMonths.map(month => (
                      <button
                        key={month}
                        className={`w-full text-left px-4 py-2.5 text-sm transition-colors flex items-center justify-between ${
                          selectedMonth === month 
                            ? 'bg-accent-primary/10 text-accent-primary font-medium' 
                            : 'text-slate-400 hover:bg-white/[0.04] hover:text-white'
                        }`}
                        onClick={() => {
                          setSelectedMonth(month);
                          setIsMonthDropdownOpen(false);
                        }}
                      >
                        <span>{getMonthName(month)}</span>
                        {selectedMonth === month && <div className="w-1.5 h-1.5 rounded-full bg-accent-primary" />}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>

          <button 
            className="premium-header-btn"
            title="Notificações"
          >
            <Bell size={16} />
          </button>

          {isUserLoggedIn && (
            <div className="flex items-center gap-4 ml-2 pl-4 border-l border-white/[0.05]">
              <div className="flex flex-col items-end hidden lg:flex">
                <span className="text-[11px] font-bold text-white tracking-tight leading-none">
                  {user ? (user.user_metadata.full_name || user.email) : 'Acesso Local'}
                </span>
                <button 
                  onClick={signOut}
                  className="text-[9px] text-slate-500 hover:text-danger-400 transition-colors uppercase tracking-widest mt-1 font-bold"
                >
                  Sair
                </button>
              </div>
              <div className="w-9 h-9 rounded-full border border-white/[0.1] overflow-hidden bg-white/[0.03] relative">
                {user?.user_metadata.avatar_url ? (
                  <Image 
                    src={user.user_metadata.avatar_url} 
                    alt="Profile" 
                    fill
                    className="object-cover" 
                    referrerPolicy="no-referrer" 
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-400 text-xs font-bold">
                    {user ? user.email?.charAt(0).toUpperCase() : 'L'}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </header>
      
      {/* Mobile Header */}
      <header className="mobile-header">
        <div className="mobile-header-left">
          <Link href="/" className="mobile-header-logo-link" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div className="mobile-header-logo">
              <TrendingUp size={18} strokeWidth={2.5} />
            </div>
            <div className="mobile-header-info">
              <h1 className="mobile-header-title">Finance 360º</h1>
              {pageName && (
                <p className="mobile-header-subtitle">
                  <span className="subtitle-label">{pageName}</span>
                </p>
              )}
            </div>
          </Link>
        </div>
        <div className="mobile-header-right">
          <div className="relative">
            <button 
              className={`mobile-header-btn flex items-center gap-1.5 px-2 ${isMobileMonthDropdownOpen ? 'bg-white/[0.08] text-white' : ''}`}
              onClick={() => setIsMobileMonthDropdownOpen(!isMobileMonthDropdownOpen)}
              title="Filtrar por mês"
            >
              <Calendar size={14} className="text-accent-primary" />
              <span className="text-[9px] font-bold uppercase tracking-tight">
                {getMonthName(selectedMonth).split(' ')[0]}
              </span>
              <ChevronDown size={10} className="opacity-50" />
            </button>

            {isMobileMonthDropdownOpen && (
              <>
                <div 
                  className="fixed inset-0 z-40" 
                  onClick={() => setIsMobileMonthDropdownOpen(false)}
                />
                <div className="absolute right-0 mt-2 w-48 bg-[#1a1c23] border border-white/[0.08] rounded-xl shadow-2xl z-50 py-1 animate-fadeIn overflow-hidden">
                  <div className="max-h-[250px] overflow-y-auto custom-scrollbar">
                    {availableMonths.map(month => (
                      <button
                        key={month}
                        className={`w-full text-left px-4 py-2 text-xs transition-colors flex items-center justify-between ${
                          selectedMonth === month 
                            ? 'bg-accent-primary/10 text-accent-primary font-medium' 
                            : 'text-slate-400 hover:bg-white/[0.04] hover:text-white'
                        }`}
                        onClick={() => {
                          setSelectedMonth(month);
                          setIsMobileMonthDropdownOpen(false);
                        }}
                      >
                        <span>{getMonthName(month)}</span>
                        {selectedMonth === month && <div className="w-1 h-1 rounded-full bg-accent-primary" />}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
          <button 
            className="mobile-header-btn"
            title="Notificações"
          >
            <Bell size={14} />
          </button>

          {isUserLoggedIn && (
            <button 
              className="mobile-header-btn ml-1"
              onClick={signOut}
              title="Sair"
            >
              <div className="w-6 h-6 rounded-full border border-white/[0.1] overflow-hidden bg-white/[0.03] relative">
                {user?.user_metadata.avatar_url ? (
                  <Image 
                    src={user.user_metadata.avatar_url} 
                    alt="Profile" 
                    fill
                    className="object-cover" 
                    referrerPolicy="no-referrer" 
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-400 text-[8px] font-bold">
                    {user ? user.email?.charAt(0).toUpperCase() : 'L'}
                  </div>
                )}
              </div>
            </button>
          )}

          <button 
            className="mobile-header-btn" 
            onClick={() => setIsMobileOpen(!isMobileOpen)}
            style={{ marginLeft: '4px' }}
          >
            {isMobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </header>
    </>
  );
}
