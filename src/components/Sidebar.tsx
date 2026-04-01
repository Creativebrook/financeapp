"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { 
  LayoutDashboard, 
  Wallet, 
  TrendingUp, 
  CreditCard, 
  Receipt,
  ReceiptEuro,
  DollarSign,
  Calendar,
  CalendarClock,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  PiggyBank,
  ChartCandlestick,
  BanknoteArrowDown,
  Coins,
  HandCoins,
  CheckSquare,
  Clock,
  ShoppingBag,
  WalletCards,
  Settings,
  LogOut,
  KeyRound,
  Lock
} from 'lucide-react';
import { useSidebar } from '@/context/SidebarContext';
import { useFinance } from '@/context/FinanceContext';

const navItems = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/accounts', label: 'Contas', icon: CreditCard },
  { href: '/investments', label: 'Investimentos', icon: ChartCandlestick },
  { href: '/debts', label: 'Dívidas', icon: BanknoteArrowDown },
];

const expenseItems = [
  { href: '/expenses/fixed', label: 'Fixas', icon: WalletCards },
  { href: '/expenses/variable', label: 'Variáveis', icon: ShoppingBag },
];

const otherItems = [
  { href: '/income', label: 'Rendimentos', icon: Coins },
  { href: '/calendar', label: 'Calendário', icon: CalendarClock },
  { href: '/config', label: 'Configurações', icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { isCollapsed, toggleCollapsed, isMobileOpen, setIsMobileOpen } = useSidebar();
  const { signOut, user, updatePassword } = useFinance();
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  
  const isOpen = isMobileOpen;
  const setIsOpen = setIsMobileOpen;

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage({ type: '', text: '' });
    
    try {
      const { error } = await updatePassword(newPassword);
      if (error) {
        setMessage({ type: 'error', text: error.message });
      } else {
        setMessage({ type: 'success', text: 'Senha alterada com sucesso!' });
        setNewPassword("");
        setTimeout(() => {
          setShowPasswordModal(false);
          setMessage({ type: '', text: '' });
        }, 2000);
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: 'Erro ao alterar senha.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {/* Password Change Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-[#1a1c23] border border-white/10 rounded-2xl w-full max-w-md p-6 shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <KeyRound size={20} className="text-[#6f6af8]" /> Alterar Senha
              </h3>
              <button onClick={() => setShowPasswordModal(false)} className="text-slate-400 hover:text-white">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handlePasswordChange} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1.5">Nova Senha</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Mínimo 6 caracteres"
                    required
                    minLength={6}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#0f1118] border border-white/10 text-white focus:outline-none focus:border-[#6f6af8] transition-all"
                  />
                </div>
              </div>
              
              {message.text && (
                <p className={`text-sm font-medium ${message.type === 'success' ? 'text-green-500' : 'text-red-500'}`}>
                  {message.text}
                </p>
              )}
              
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowPasswordModal(false)}
                  className="flex-1 py-2.5 rounded-xl bg-white/5 text-white font-medium hover:bg-white/10 transition-all"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-2.5 rounded-xl bg-[#6f6af8] text-white font-bold hover:bg-[#5b56e0] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isSubmitting ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : 'Confirmar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Mobile Menu Button - Only visible on mobile (< 1024px) */}
      <button 
        className="mobile-menu-btn"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Toggle menu"
      >
        {isOpen ? <X size={22} /> : <Menu size={22} />}
      </button>

      {/* Mobile Overlay */}
      <div className={`mobile-overlay ${isOpen ? 'open' : ''}`} onClick={() => setIsOpen(false)} />

      <aside className={`sidebar ${isOpen ? 'mobile-open' : ''} ${isCollapsed ? 'collapsed' : ''}`} style={{ 
        background: 'rgba(13, 15, 20, 0.85)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
      }}>
        <div className={`sidebar-logo ${isCollapsed ? 'collapsed' : ''}`}>
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, #5b5fc7 0%, #7c6eb8 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}>
            <TrendingUp size={20} color="white" />
          </div>
          {!isCollapsed && <h1 style={{ fontSize: '1.125rem', fontWeight: 600 }}>Finance 360º</h1>}
        </div>

        <nav>
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`nav-item ${isActive(item.href) ? 'active' : ''} ${isCollapsed ? 'collapsed' : ''}`}
              onClick={() => setIsOpen(false)}
              style={{
                borderRadius: '10px',
                padding: isCollapsed ? '10px' : '10px 14px',
                marginBottom: '4px',
                fontWeight: 450,
                fontSize: '0.9375rem',
                justifyContent: isCollapsed ? 'center' : 'flex-start',
              }}
            >
              <item.icon size={19} />
              {!isCollapsed && <span>{item.label}</span>}
            </Link>
          ))}

          <div className="nav-section" style={{ marginTop: '28px', paddingTop: '24px' }}>
            {!isCollapsed && <div className="nav-section-title" style={{ paddingLeft: '14px', marginBottom: '8px' }}>Despesas</div>}
            {expenseItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`nav-item ${isActive(item.href) ? 'active' : ''} ${isCollapsed ? 'collapsed' : ''}`}
                onClick={() => setIsOpen(false)}
                style={{
                  borderRadius: '10px',
                  padding: isCollapsed ? '10px' : '10px 14px',
                  marginBottom: '4px',
                  fontWeight: 450,
                  fontSize: '0.9375rem',
                  justifyContent: isCollapsed ? 'center' : 'flex-start',
                }}
              >
                <item.icon size={19} />
                {!isCollapsed && <span>{item.label}</span>}
              </Link>
            ))}
          </div>

          <div className="nav-section" style={{ marginTop: '20px', paddingTop: '20px' }}>
            {otherItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`nav-item ${isActive(item.href) ? 'active' : ''} ${isCollapsed ? 'collapsed' : ''}`}
                onClick={() => setIsOpen(false)}
                style={{
                  borderRadius: '10px',
                  padding: isCollapsed ? '10px' : '10px 14px',
                  marginBottom: '4px',
                  fontWeight: 450,
                  fontSize: '0.9375rem',
                  justifyContent: isCollapsed ? 'center' : 'flex-start',
                }}
              >
                <item.icon size={19} />
                {!isCollapsed && <span>{item.label}</span>}
              </Link>
            ))}
          </div>

          <div className="nav-section" style={{ marginTop: '20px', paddingTop: '20px', borderTop: '1px solid rgba(255, 255, 255, 0.04)' }}>
            {!isCollapsed && <div className="nav-section-title" style={{ paddingLeft: '14px', marginBottom: '8px' }}>Conta</div>}
            
            <button
              onClick={() => setShowPasswordModal(true)}
              className={`nav-item ${isCollapsed ? 'collapsed' : ''}`}
              style={{
                width: '100%',
                borderRadius: '10px',
                padding: isCollapsed ? '10px' : '10px 14px',
                marginBottom: '4px',
                fontWeight: 450,
                fontSize: '0.9375rem',
                justifyContent: isCollapsed ? 'center' : 'flex-start',
                color: '#9aa0a9',
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
              }}
            >
              <KeyRound size={19} />
              {!isCollapsed && <span>Alterar Senha</span>}
            </button>

            <button
              onClick={() => signOut()}
              className={`nav-item ${isCollapsed ? 'collapsed' : ''}`}
              style={{
                width: '100%',
                borderRadius: '10px',
                padding: isCollapsed ? '10px' : '10px 14px',
                marginBottom: '4px',
                fontWeight: 450,
                fontSize: '0.9375rem',
                justifyContent: isCollapsed ? 'center' : 'flex-start',
                color: '#ef4444',
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
              }}
            >
              <LogOut size={19} />
              {!isCollapsed && <span>Sair</span>}
            </button>
          </div>
        </nav>

        {/* Collapse Toggle - Bottom right inside sidebar */}
        <button
          onClick={toggleCollapsed}
          className="collapse-toggle"
          style={{
            marginTop: 'auto',
            padding: '12px',
            background: 'rgba(255, 255, 255, 0.04)',
            border: '1px solid rgba(255, 255, 255, 0.06)',
            borderRadius: '10px',
            color: '#9aa0a9',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            fontSize: '0.8125rem',
          }}
          title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          {!isCollapsed && <span>Collapse</span>}
        </button>

        {!isCollapsed && (
          <div style={{ paddingTop: '16px', borderTop: '1px solid rgba(255, 255, 255, 0.04)' }}>
            <div style={{ fontSize: '0.6875rem', color: '#5f656d', textAlign: 'center', letterSpacing: '0.05em' }}>
              Finance 360º
              <br />
              <span style={{ opacity: 0.6 }}>v1.0.0</span>
            </div>
          </div>
        )}
      </aside>
    </>
  );
}
