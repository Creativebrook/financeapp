"use client";

import { useState } from 'react';
import Link from 'next/link';
import { TrendingUp, RefreshCw, Bell, Menu, X } from 'lucide-react';
import { useSidebar } from '@/context/SidebarContext';

interface PremiumHeaderProps {
  pageName?: string;
  onRefresh?: () => void;
}

export default function PremiumHeader({ pageName, onRefresh }: PremiumHeaderProps) {
  const [refreshing, setRefreshing] = useState(false);
  const { isMobileOpen, setIsMobileOpen } = useSidebar();

  const handleRefresh = async () => {
    if (onRefresh) {
      setRefreshing(true);
      await onRefresh();
      setRefreshing(false);
    }
  };

  return (
    <>
      {/* Premium Header - Desktop */}
      <header className="premium-header">
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
          <button 
            className="premium-header-btn"
            onClick={handleRefresh}
            disabled={refreshing}
            title="Atualizar dados"
          >
            <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} />
          </button>
          <button 
            className="premium-header-btn"
            title="Notificações"
          >
            <Bell size={16} />
          </button>
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
          <button 
            className="mobile-header-btn"
            onClick={handleRefresh}
            disabled={refreshing}
            title="Atualizar dados"
          >
            <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
          </button>
          <button 
            className="mobile-header-btn"
            title="Notificações"
          >
            <Bell size={14} />
          </button>
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
