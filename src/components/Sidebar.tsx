"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
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
  WalletCards
} from 'lucide-react';
import { useSidebar } from '@/context/SidebarContext';

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
];

export default function Sidebar() {
  const pathname = usePathname();
  const { isCollapsed, toggleCollapsed, isMobileOpen, setIsMobileOpen } = useSidebar();
  
  const isOpen = isMobileOpen;
  const setIsOpen = setIsMobileOpen;

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  return (
    <>
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
