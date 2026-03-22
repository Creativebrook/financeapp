"use client";

import { useState, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import { FinanceProvider, useFinance } from '@/context/FinanceContext';
import { useSidebar } from '@/context/SidebarContext';
import Sidebar from '@/components/Sidebar';
import PremiumHeader from '@/components/PremiumHeader';
import { Plus, Edit2, Trash2, RefreshCw, X, TrendingUp, TrendingDown, Wallet, Bitcoin, BarChart3, User } from 'lucide-react';
import { formatCurrency, formatPercentVariation, formatNumber, getPlatformColor, calculateProfitability, calculateProfitabilityPercent } from '@/lib/utils';
import { Investment, Plataforma } from '@/types';

const InvestmentPlatformChart = dynamic(() => import('@/components/charts/InvestmentPlatformChart'), { ssr: false });

const plataformas: Plataforma[] = ['XTB', 'Trading212', 'Revolut Stocks', 'Revolut Cripto', 'Revolut Metals', 'Robo Advisor'];

const getProfitColor = (value: number) => {
  if (value > 0) return 'var(--success-400)';
  if (value < 0) return 'var(--danger-400)';
  return 'var(--text-muted)';
};

// Deterministic pseudo-random function for consistent SSR/client
const deterministicNoise = (index: number, seed: number) => {
  return Math.abs(Math.sin((index + 1) * seed * 9999) % 1 - 0.5) * 2;
};

const generateHistoricalData = (currentValue: number, investedValue: number) => {
  if (investedValue === 0 || currentValue === 0) {
    return Array.from({ length: 30 }, (_, i) => ({ value: 0 }));
  }
  
  const data = [];
  const days = 30;
  const dailyGrowth = (currentValue - investedValue) / days;
  const seed = investedValue % 1000 || 1;
  
  for (let i = 0; i < days; i++) {
    const noise = deterministicNoise(i, seed) * (currentValue * 0.02);
    const value = investedValue + (dailyGrowth * i) + noise;
    data.push({ value: Math.max(0, value) });
  }
  
  data[data.length - 1].value = currentValue;
  return data;
};

const getChartDomain = (currentValue: number, investedValue: number): [number, number] => {
  if (investedValue === 0) return [0, 100];
  
  const evolutionPercent = ((currentValue - investedValue) / investedValue) * 100;
  
  // Determine max percentage based on evolution
  let maxPercent: number;
  if (evolutionPercent >= 50) {
    maxPercent = 100;
  } else if (evolutionPercent >= 10) {
    maxPercent = 50;
  } else {
    maxPercent = 25;
  }
  
  // When positive: 0 at bottom, max at top
  // When negative: 0 at top, -max at bottom (inverted)
  if (evolutionPercent >= 0) {
    return [0, maxPercent];
  } else {
    return [-maxPercent, 0];
  }
};

function InvestmentsContent() {
  const { 
    accounts, 
    investments, 
    addInvestment, 
    updateInvestment, 
    deleteInvestment, 
    refreshPrices, 
    getPlatformSummaries,
    customWallets,
    addCustomWallet
  } = useFinance();
  const { isCollapsed } = useSidebar();
  const [activePlatform, setActivePlatform] = useState<Plataforma>('XTB');
  const [activeWallet, setActiveWallet] = useState<string>('');
  const [showWalletModal, setShowWalletModal] = useState(false);
  const [newWalletName, setNewWalletName] = useState('');
  const [walletToRemove, setWalletToRemove] = useState<string | null>(null);
  const [showRemoveWalletModal, setShowRemoveWalletModal] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [investmentToDelete, setInvestmentToDelete] = useState<string | null>(null);
  const [editingInvestment, setEditingInvestment] = useState<Investment | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [refreshMessage, setRefreshMessage] = useState<{ type: 'success' | 'warning'; text: string } | null>(null);
  const [activePlatformIndex, setActivePlatformIndex] = useState(0);
  const platformsGridRef = useRef<HTMLDivElement>(null);

  const handleScroll = () => {
    if (platformsGridRef.current && isMobile) {
      const container = platformsGridRef.current;
      const containerRect = container.getBoundingClientRect();
      const containerCenter = containerRect.left + containerRect.width / 2;
      
      let closestIndex = 0;
      let minDistance = Infinity;
      
      Array.from(container.children).forEach((child, index) => {
        const card = child as HTMLElement;
        const cardRect = card.getBoundingClientRect();
        const cardCenter = cardRect.left + cardRect.width / 2;
        const distance = Math.abs(containerCenter - cardCenter);
        
        if (distance < minDistance) {
          minDistance = distance;
          closestIndex = index;
        }
      });
      
      if (closestIndex !== activePlatformIndex) {
        setActivePlatformIndex(closestIndex);
      }
    }
  };

  const scrollToPlatform = (index: number) => {
    if (platformsGridRef.current && isMobile) {
      const card = platformsGridRef.current.children[index] as HTMLElement;
      if (card) {
        const container = platformsGridRef.current;
        const scrollLeft = card.offsetLeft - (container.offsetWidth / 2) + (card.offsetWidth / 2);
        container.scrollTo({
          left: scrollLeft,
          behavior: 'smooth'
        });
      }
      setActivePlatformIndex(index);
    }
  };
  const [formData, setFormData] = useState({
    plataforma: 'XTB' as Plataforma,
    carteira: '',
    ticker: '',
    nome: '',
    quantidade: 0,
    preco_medio: 0,
    preco_atual: 0,
    posicao: 'long' as 'long' | 'short',
    alocacao_alvo: 0,
    isAutoPrice: false,
    accountId: '',
  });

  const platformSummaries = getPlatformSummaries();
  
  const allPlatforms = [...platformSummaries];
  const hasRevolutMetals = allPlatforms.some(ps => ps.plataforma === 'Revolut Metals');
  
  if (!hasRevolutMetals) {
    allPlatforms.push({
      plataforma: 'Revolut Metals' as Plataforma,
      totalValue: 0,
      totalInvested: 0,
      profitability: 0,
      profitabilityPercent: 0,
    });
  }
  
  allPlatforms.sort((a, b) => b.profitabilityPercent - a.profitabilityPercent);
  
  let filteredInvestments = investments.filter(i => i.plataforma === activePlatform);
  
  // Get unique wallets for Trading212
  const wallets = [...new Set(investments.filter(i => i.plataforma === 'Trading212' && i.carteira).map(i => i.carteira as string))];
  const defaultWallets = ['Growth Predict', 'NextGen Leaders', 'Top Active Gainers', 'Best Dividend Yield', 'Diversified ETF Core', 'S&P500 Safe Stocks', 'Tech Europe 2030', 'Moonshot Profile'];
  const allWallets: string[] = [...new Set([...defaultWallets, ...wallets, ...customWallets])].sort();
  
  // Filter by wallet if Trading212 is selected and wallet is set
  if (activePlatform === 'Trading212' && activeWallet) {
    filteredInvestments = filteredInvestments.filter(i => i.carteira === activeWallet);
  }
  
  // Sort by profitability percentage descending
  filteredInvestments.sort((a, b) => {
    const profitA = calculateProfitabilityPercent(a.valor_atual, a.preco_medio, a.quantidade);
    const profitB = calculateProfitabilityPercent(b.valor_atual, b.preco_medio, b.quantidade);
    return profitB - profitA;
  });
  
  const platformTotal = filteredInvestments.reduce((sum, i) => sum + i.valor_atual, 0);
  const platformInvested = filteredInvestments.reduce((sum, i) => sum + (i.quantidade * i.preco_medio), 0);
  const platformProfitability = platformTotal - platformInvested;
  const platformProfitabilityPercent = platformInvested > 0 ? (platformProfitability / platformInvested) * 100 : 0;
  
  // Calculate total portfolio and percentage for active platform
  const totalPortfolioValue = platformSummaries.reduce((sum, ps) => sum + ps.totalValue, 0);
  const platformPortfolioPercent = totalPortfolioValue > 0 ? (platformTotal / totalPortfolioValue) * 100 : 0;

  // Use deterministic functions directly (no memoization needed - functions are pure)
  const historicalData = generateHistoricalData(platformTotal, platformInvested);
  const chartDomain = getChartDomain(platformTotal, platformInvested);

  // Detect mobile
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    setRefreshMessage(null);
    const result = await refreshPrices();
    setRefreshing(false);
    
    if (result.failedTickers.length > 0) {
      setRefreshMessage({
        type: 'warning',
        text: `Não foi possível obter preço para: ${result.failedTickers.join(', ')}. Por favor, insira manualmente.`
      });
    } else {
      setRefreshMessage({
        type: 'success',
        text: 'Preços atualizados com sucesso!'
      });
    }
    
    setTimeout(() => setRefreshMessage(null), 5000);
  };

  const handleOpenModal = (investment?: Investment) => {
    if (investment) {
      setEditingInvestment(investment);
      setFormData({
        plataforma: investment.plataforma,
        carteira: investment.carteira || '',
        ticker: investment.ticker,
        nome: investment.nome,
        quantidade: investment.quantidade,
        preco_medio: investment.preco_medio,
        preco_atual: investment.preco_atual,
        posicao: investment.posicao || 'long',
        alocacao_alvo: investment.alocacao_alvo || 0,
        isAutoPrice: investment.isAutoPrice || false,
        accountId: '',
      });
    } else {
      setEditingInvestment(null);
      setFormData({
        plataforma: activePlatform,
        carteira: '',
        ticker: '',
        nome: '',
        quantidade: 0,
        preco_medio: 0,
        preco_atual: 0,
        posicao: 'long',
        alocacao_alvo: 0,
        isAutoPrice: false,
        accountId: '',
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingInvestment(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const investmentData = {
      plataforma: formData.plataforma,
      carteira: formData.carteira || undefined,
      ticker: formData.ticker.toUpperCase(),
      nome: formData.nome,
      quantidade: formData.quantidade,
      preco_medio: formData.preco_medio,
      preco_atual: formData.preco_atual,
      posicao: formData.plataforma === 'Revolut Metals' ? undefined : formData.posicao,
      alocacao_alvo: formData.alocacao_alvo || undefined,
      isAutoPrice: formData.isAutoPrice,
    };
    
    if (editingInvestment) {
      updateInvestment(editingInvestment.id, investmentData);
    } else {
      addInvestment(investmentData, formData.accountId || undefined);
    }
    handleCloseModal();
  };

  const handleDelete = (id: string) => {
    setInvestmentToDelete(id);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = () => {
    if (investmentToDelete) {
      deleteInvestment(investmentToDelete);
      setInvestmentToDelete(null);
      setShowDeleteConfirm(false);
    }
  };

  const getPlatformIcon = (plataforma: Plataforma) => {
    switch (plataforma) {
      case 'XTB': return <BarChart3 size={16} />;
      case 'Trading212': return <PieChart size={16} />;
      case 'Revolut Stocks': return <TrendingUp size={16} />;
      case 'Revolut Cripto': return <Bitcoin size={16} />;
      case 'Revolut Metals': return <TrendingUp size={16} />;
      case 'Robo Advisor': return <Wallet size={16} />;
      default: return <TrendingUp size={16} />;
    }
  };

  return (
    <div className="app-container">
      <Sidebar />
      
      <main className={`main-content ${isCollapsed ? 'sidebar-collapsed' : ''}`}>
        <PremiumHeader 
          pageName="Investimentos" 
          style={{ marginBottom: 'var(--space-md)' }}
        />
        
        {refreshMessage && (
          <div 
            className="animate-slideUp" 
            style={{ 
              padding: '12px 16px', 
              borderRadius: '8px', 
              marginBottom: '16px',
              background: refreshMessage.type === 'success' ? 'rgba(34, 197, 94, 0.15)' : 'rgba(251, 191, 36, 0.15)',
              border: `1px solid ${refreshMessage.type === 'success' ? 'var(--accent-success)' : 'var(--chart-cat-3)'}`,
              color: refreshMessage.type === 'success' ? 'var(--accent-success)' : 'var(--chart-cat-3)',
              fontSize: '0.875rem'
            }}
          >
            {refreshMessage.text}
          </div>
        )}
        
        <div className="page-header animate-fadeIn" style={{ 
          paddingBottom: '20px', 
          display: isMobile ? 'none' : 'flex', 
          flexDirection: isMobile ? 'column' : 'row',
          justifyContent: 'space-between',
          alignItems: isMobile ? 'flex-start' : 'center',
          gap: isMobile ? '16px' : '0',
          marginBottom: '0'
        }}>
          <div>
            <h1 className="page-title" style={{ fontSize: '1.5rem', lineHeight: 1.2, marginBottom: '4px' }}>Investimentos</h1>
            <p className="page-subtitle">Acompanhe os seus investimentos e rentabilidades</p>
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button 
              className="btn btn-secondary" 
              onClick={handleRefresh}
              disabled={refreshing}
            >
              <RefreshCw size={18} className={refreshing ? 'animate-pulse' : ''} />
              {refreshing ? 'A atualizar...' : 'Atualizar Preços'}
            </button>
            <button className="btn btn-primary" onClick={() => handleOpenModal()}>
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M5 12h14"></path>
                <path d="M12 5v14"></path>
              </svg>
              Novo Ativo
            </button>
          </div>
        </div>

        {/* Platform Summary */}
        <div 
          ref={platformsGridRef}
          className="platforms-grid" 
          style={{ marginBottom: '30px', marginTop: isMobile ? '40px' : '0' }}
          onScroll={handleScroll}
        >
          {allPlatforms.map((ps) => {
            const isRevolutMetals = ps.plataforma === 'Revolut Metals';
            return (
              <div 
                key={ps.plataforma}
                className="card animate-slideUp"
                style={{ 
                  cursor: 'pointer',
                  borderColor: activePlatform === ps.plataforma 
                    ? (isRevolutMetals ? '#94a3b8' : getPlatformColor(ps.plataforma)) 
                    : 'var(--border-color)',
                  padding: 'var(--space-md)',
                  boxShadow: activePlatform === ps.plataforma ? `0 0 15px ${getPlatformColor(ps.plataforma)}60` : 'none',
                  borderWidth: activePlatform === ps.plataforma ? '2px' : '1px',
                  transition: 'all 0.3s ease'
                }}
                onClick={() => {
                  setActivePlatform(ps.plataforma);
                  const index = allPlatforms.findIndex(p => p.plataforma === ps.plataforma);
                  if (isMobile) scrollToPlatform(index);
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ fontWeight: 600, color: isRevolutMetals ? '#94a3b8' : getPlatformColor(ps.plataforma) }}>{ps.plataforma}</span>
                  {getPlatformIcon(ps.plataforma)}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                  <div  style={{ fontSize: '1.25rem', fontWeight: 700 }}>
                    {formatCurrency(ps.totalValue)}
                  </div>
                  <div style={{ fontSize: '0.8125rem' }}>
                    <span 
                      className="kpi-delta" 
                      style={{ 
                        color: getProfitColor(ps.profitabilityPercent), 
                        background: `color-mix(in srgb, ${getProfitColor(ps.profitabilityPercent)} 14%, transparent)` 
                      }}
                    >
                      {formatPercentVariation(ps.profitabilityPercent)}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Carousel Indicators (Dots) */}
        {isMobile && (
          <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginBottom: '24px' }}>
            {allPlatforms.map((_, index) => (
              <div 
                key={index}
                onClick={() => {
                  scrollToPlatform(index);
                  setActivePlatform(allPlatforms[index].plataforma);
                }}
                style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  background: index === activePlatformIndex ? 'white' : 'rgba(255, 255, 255, 0.2)',
                  transition: 'all 0.3s ease',
                  cursor: 'pointer'
                }}
              />
            ))}
          </div>
        )}

        {/* Active Platform Stats */}
        <div 
          className="card animate-slideUp" 
          style={{ 
            marginBottom: '24px', 
            padding: '0', 
            overflow: 'hidden', 
            position: 'relative',
            border: '1px solid var(--card-border)',
            boxShadow: `0 0 10px 1px ${getPlatformColor(activePlatform)}`
          }}
        >
          <div style={{ position: 'absolute', inset: 0, opacity: 0.3, minWidth: 0, minHeight: 0 }}>
            <InvestmentPlatformChart 
              data={historicalData} 
              chartDomain={chartDomain} 
              profitColor={getProfitColor(platformProfitability)} 
            />
            <div className="chart-edge-fade"></div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '24px', position: 'relative', zIndex: 1 }}>
            <div>
              <div className="card-title" style={{ color: getPlatformColor(activePlatform) }}>{activePlatform}</div>
              <div className="card-value">{formatCurrency(platformTotal)}</div>
              <div style={{ 
                fontSize: '0.8125rem', 
                marginTop: '4px'
              }}>
                <span style={{ color: getProfitColor(platformProfitability) }}>
                  {formatCurrency(platformProfitability)}
                </span>
                {' '}
                <span 
                  className="kpi-delta" 
                  style={{ 
                    color: getProfitColor(platformProfitabilityPercent), 
                    background: `color-mix(in srgb, ${getProfitColor(platformProfitabilityPercent)} 14%, transparent)` 
                  }}
                >
                  {formatPercentVariation(platformProfitabilityPercent)}
                </span>
              </div>
            </div>
            <div style={{ textAlign: 'right', color: 'var(--text-muted)' }}>
              <div style={{ fontSize: '0.8125rem' }}>Investido</div>
              <div  style={{ fontWeight: 600 }}>{formatCurrency(platformInvested)}</div>
              <div style={{ fontSize: '0.75rem', marginTop: '36px', color: 'var(--text-muted)' }}>
                {formatPercentVariation(platformPortfolioPercent)} do portfólio
              </div>
            </div>
          </div>
        </div>

        {/* Wallet Tabs for Trading212 */}
        {activePlatform === 'Trading212' && (
          <div className="card animate-slideUp" style={{ marginBottom: '16px', padding: '12px 16px' }}>
            {isMobile ? (
              <select 
                className="form-select"
                value={activeWallet}
                onChange={(e) => setActiveWallet(e.target.value)}
                style={{ width: '100%' }}
              >
                <option value="">Todas as Carteiras</option>
                {allWallets.map((wallet) => (
                  <option key={wallet} value={wallet}>{wallet}</option>
                ))}
              </select>
            ) : (
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
                {allWallets.map((wallet) => (
                  <button
                    key={wallet}
                    onClick={() => setActiveWallet(activeWallet === wallet ? '' : wallet)}
                    style={{
                      padding: '6px 12px',
                      borderRadius: '6px',
                      border: 'none',
                      fontSize: '0.8125rem',
                      fontWeight: 500,
                      cursor: 'pointer',
                      background: activeWallet === wallet || (!activeWallet && wallet === allWallets[0] && !allWallets.includes(activeWallet)) 
                        ? 'var(--accent-primary)' 
                        : 'rgba(255, 255, 255, 0.06)',
                      color: activeWallet === wallet || (!activeWallet && wallet === allWallets[0] && !allWallets.includes(activeWallet))
                        ? 'white' 
                        : 'var(--text-secondary)',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    {wallet}
                  </button>
                ))}
                <button
                  onClick={() => setShowWalletModal(true)}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '6px',
                    border: '1px dashed var(--text-muted)',
                    fontSize: '0.8125rem',
                    fontWeight: 500,
                    cursor: 'pointer',
                    background: 'transparent',
                    color: 'var(--text-muted)',
                    transition: 'all 0.2s ease',
                  }}
                >
                  + Nova Carteira
                </button>
              </div>
            )}
          </div>
        )}

{/* Investments Table */}
        <div className="card animate-slideUp" style={{ 
          padding: isMobile ? '0' : 'var(--space-xl)', 
          background: isMobile ? 'transparent' : 'var(--bg-card)', 
          border: isMobile ? 'none' : '1px solid var(--border-color)',
          boxShadow: isMobile ? 'none' : 'none' 
        }}>
          {isMobile ? (
            // Mobile card view
            <div style={{ padding: '0' }}>
              {filteredInvestments.map((investment) => {
                const profitability = calculateProfitability(investment.valor_atual, investment.preco_medio, investment.quantidade);
                const profitabilityPercent = calculateProfitabilityPercent(investment.valor_atual, investment.preco_medio, investment.quantidade);
                const weightPercent = platformTotal > 0 ? (investment.valor_atual / platformTotal) * 100 : 0;
                
                return (
                  <div key={investment.id} style={{ 
                    background: 'rgba(255, 255, 255, 0.03)',
                    borderRadius: '16px',
                    padding: '20px',
                    marginBottom: '16px',
                    border: '1px solid rgba(255, 255, 255, 0.06)'
                  }}>
                    {/* Top Section */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                          <span style={{ color: 'white', fontSize: '1.2rem', fontWeight: 700, letterSpacing: '-0.02em' }}>{investment.ticker}</span>
                          {investment.isAutoPrice ? (
                            <span title="Automático (yFinance)">
                              <RefreshCw size={14} className="text-accent-primary" />
                            </span>
                          ) : (
                            <span title="Manual">
                              <User size={14} className="text-text-muted" />
                            </span>
                          )}
                          <span style={{ 
                            background: 'rgba(255, 255, 255, 0.1)', 
                            color: 'rgba(255, 255, 255, 0.7)', 
                            fontSize: '0.6rem', 
                            padding: '2px 6px', 
                            borderRadius: '4px',
                            fontWeight: 400,
                            letterSpacing: '0',
                            textTransform: 'uppercase'
                          }}>
                            QTD: {formatNumber(investment.quantidade)}
                          </span>
                        </div>
                        <div style={{ color: 'rgba(255, 255, 255, 0.4)', fontSize: '0.9rem' }}>{investment.nome}</div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ color: 'white', fontSize: '1.2rem', fontWeight: 700, marginBottom: '4px' }}>{formatCurrency(investment.valor_atual)}</div>
                        <div style={{ color: getProfitColor(profitability), fontSize: '0.8rem', fontWeight: 600 }}>
                          {profitability >= 0 ? '+' : ''}{formatCurrency(profitability)} ({formatPercentVariation(profitabilityPercent)})
                        </div>
                      </div>
                    </div>

                    {/* Portfolio Weight & Progress Bar */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                      <div style={{ color: 'rgba(255, 255, 255, 0.4)', fontSize: '0.7rem', fontWeight: 400, textTransform: 'uppercase', whiteSpace: 'nowrap' }}>
                        {weightPercent.toFixed(1).replace('.', ',')}% DO PORTFÓLIO
                      </div>
                      <div style={{ flex: 1, height: '6px', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '99px', overflow: 'hidden' }}>
                        <div style={{ 
                          width: `${Math.min(weightPercent, 100)}%`, 
                          height: '100%', 
                          background: '#00e676', 
                          borderRadius: '99px',
                          boxShadow: '0 0 10px rgba(0, 230, 118, 0.3)'
                        }}></div>
                      </div>
                    </div>

                    {/* Action Bar */}
                    <div style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      border: '1px solid rgba(255, 255, 255, 0.1)', 
                      borderRadius: '999px',
                      height: '46px',
                      overflow: 'hidden'
                    }}>
                      <button 
                        style={{ 
                          flex: 1, 
                          height: '100%', 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'center',
                          background: 'transparent',
                          border: 'none',
                          cursor: 'pointer',
                          color: '#4da6c4',
                          transition: 'background 0.2s'
                        }}
                        onClick={() => handleOpenModal(investment)}
                        onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(77, 166, 196, 0.05)'}
                        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                      >
                        <Edit2 size={20} />
                      </button>
                      <div style={{ width: '1px', height: '24px', background: 'rgba(255, 255, 255, 0.1)' }}></div>
                      <button 
                        style={{ 
                          flex: 1, 
                          height: '100%', 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'center',
                          background: 'transparent',
                          border: 'none',
                          cursor: 'pointer',
                          color: '#e05a6f',
                          transition: 'background 0.2s'
                        }}
                        onClick={() => handleDelete(investment.id)}
                        onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(224, 90, 111, 0.05)'}
                        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>
                  </div>
                );
              })}
              {filteredInvestments.length === 0 && (
                <div className="empty-state">
                  <TrendingUp size={48} style={{ opacity: 0.3, marginBottom: '16px' }} />
                  <p>Nenhum investimento nesta plataforma</p>
                </div>
              )}
            </div>
          ) : (
            // Desktop table view
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>TICKER</th>
                    <th>NOME</th>
                    <th>QTD</th>
                    <th>P. MÉDIO</th>
                    <th>COTAÇÃO</th>
                    <th>TOTAL</th>
                    <th>RENT (%)</th>
                    <th>PESO (%)</th>
                    <th>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredInvestments.map((investment) => {
                    const profitability = calculateProfitability(investment.valor_atual, investment.preco_medio, investment.quantidade);
                    const profitabilityPercent = calculateProfitabilityPercent(investment.valor_atual, investment.preco_medio, investment.quantidade);
                    const weightPercent = platformTotal > 0 ? (investment.valor_atual / platformTotal) * 100 : 0;
                    
                    return (
                      <tr key={investment.id}>
                        <td>
                          <span style={{ fontWeight: 600, letterSpacing: 'normal' }}>{investment.ticker}</span>
                        </td>
                        <td>
                          <span style={{ fontWeight: 500, fontSize: '0.8rem', color: 'var(--text-muted)' }}>{investment.nome}</span>
                        </td>
                        <td>
                          <span style={{ fontWeight: 500, fontSize: '0.8rem', color: 'var(--text-muted)' }}>{formatNumber(investment.quantidade)}</span>
                        </td>
                        <td>
                          <span style={{ fontWeight: 500, fontSize: '0.8rem', color: 'var(--text-muted)' }}>{formatCurrency(investment.preco_medio)}</span>
                        </td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span style={{ fontWeight: 500, fontSize: '0.8rem', color: 'var(--text-muted)' }}>{formatCurrency(investment.preco_atual)}</span>
                            {investment.isAutoPrice ? (
                              <span title="Automático (yFinance)">
                                <RefreshCw size={12} className="text-accent-primary" />
                              </span>
                            ) : (
                              <span title="Manual">
                                <User size={12} className="text-text-muted" />
                              </span>
                            )}
                          </div>
                        </td>
                        <td>
                          <span style={{ fontWeight: 600, letterSpacing: 'normal' }}>{formatCurrency(investment.valor_atual)}</span>
                        </td>
                        <td>
                          <div>
                            <span style={{ fontWeight: 600, letterSpacing: 'normal', color: getProfitColor(profitability) }}>
                              {profitability >= 0 ? '+' : ''}{formatCurrency(profitability)}
                            </span>
                            <div style={{ marginTop: '2px' }}>
                              <span className="kpi-delta" style={{ color: getProfitColor(profitabilityPercent), background: `color-mix(in srgb, ${getProfitColor(profitabilityPercent)} 14%, transparent)` }}>
                                {formatPercentVariation(profitabilityPercent)}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td>
                          <span className="badge badge-info">
                            {activePlatform === 'Robo Advisor' 
                              ? `${investment.alocacao_alvo || 0}%` 
                              : `${weightPercent.toFixed(1).replace('.', ',')}%`}
                          </span>
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-start' }}>
                            <button className="btn btn-icon btn-secondary" onClick={() => handleOpenModal(investment)}>
                              <Edit2 size={16} />
                            </button>
                            <button className="btn btn-icon btn-danger" onClick={() => handleDelete(investment.id)}>
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {filteredInvestments.length === 0 && (
                <div className="empty-state">
                  <TrendingUp size={48} style={{ opacity: 0.3, marginBottom: '16px' }} />
                  <p>Nenhum investimento nesta plataforma</p>
                  <button className="btn btn-primary" style={{ marginTop: '16px' }} onClick={() => handleOpenModal()}>
                    <Plus size={18} />
                    Adicionar Ativo
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal animate-slideUp" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '600px' }}>
            <div className="modal-header">
              <h2 className="modal-title">
                {editingInvestment ? 'Editar Ativo' : 'Novo Ativo'}
              </h2>
              <button className="btn btn-icon btn-secondary" onClick={handleCloseModal}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Plataforma</label>
                  <select
                    className="form-select"
                    value={formData.plataforma}
                    onChange={(e) => setFormData({ ...formData, plataforma: e.target.value as Plataforma })}
                  >
                    {plataformas.map((p) => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </div>

                {formData.plataforma === 'Trading212' && (
                  <div className="form-group">
                    <label className="form-label">Carteira (Pie)</label>
                    <select
                      className="form-select"
                      value={formData.carteira}
                      onChange={(e) => setFormData({ ...formData, carteira: e.target.value })}
                    >
                      <option value="">Selecionar Carteira</option>
                      {allWallets.map(wallet => (
                        <option key={wallet} value={wallet}>{wallet}</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              {!editingInvestment && (
                <div className="form-group">
                  <label className="form-label">Conta de Origem</label>
                  <select
                    className="form-select"
                    value={formData.accountId}
                    onChange={(e) => setFormData({ ...formData, accountId: e.target.value })}
                    required
                  >
                    <option value="">Selecionar Conta</option>
                    {accounts.map(acc => (
                      <option key={acc.id} value={acc.id}>{acc.nome} ({formatCurrency(acc.saldo)})</option>
                    ))}
                  </select>
                </div>
              )}

              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Ticker</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.ticker}
                    onChange={(e) => setFormData({ ...formData, ticker: e.target.value.toUpperCase() })}
                    onBlur={async () => {
                      if (formData.ticker && !formData.preco_atual) {
                        try {
                          const response = await fetch(`/api/price?ticker=${formData.ticker}`);
                          if (response.ok) {
                            const data = await response.json();
                            if (data.price) {
                              setFormData(prev => ({ 
                                ...prev, 
                                preco_atual: data.price,
                                isAutoPrice: true 
                              }));
                            }
                          }
                        } catch (error) {
                          console.error('Error fetching ticker price:', error);
                        }
                      }
                    }}
                    placeholder="Ex: AAPL, BTC-USD"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Nome</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.nome}
                    onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                    placeholder="Ex: Apple Inc."
                    required
                  />
                </div>
              </div>

              <div className="grid-3">
                <div className="form-group">
                  <label className="form-label">Quantidade</label>
                  <input
                    type="number"
                    className="form-input"
                    value={formData.quantidade}
                    onChange={(e) => setFormData({ ...formData, quantidade: parseFloat(e.target.value) || 0 })}
                    step="0.000001"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Preço/Ação (€)</label>
                  <input
                    type="number"
                    className="form-input"
                    value={formData.preco_medio}
                    onChange={(e) => setFormData({ ...formData, preco_medio: parseFloat(e.target.value) || 0 })}
                    step="0.01"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    Preço Atual (€)
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.7rem', fontWeight: 400 }}>
                      {formData.isAutoPrice ? (
                        <>
                          <RefreshCw size={10} className="text-accent-primary" />
                          <span className="text-accent-primary">Automático</span>
                        </>
                      ) : (
                        <>
                          <User size={10} className="text-text-muted" />
                          <span className="text-text-muted">Manual</span>
                        </>
                      )}
                    </span>
                  </label>
                  <input
                    type="number"
                    className="form-input"
                    value={formData.preco_atual}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      preco_atual: parseFloat(e.target.value) || 0,
                      isAutoPrice: false 
                    })}
                    step="0.01"
                    required
                  />
                </div>
              </div>

              {/* Removed Posição field for Revolut Metals */}

              {formData.plataforma === 'Robo Advisor' && (
                <div className="form-group">
                  <label className="form-label">Alocação Alvo (%)</label>
                  <input
                    type="number"
                    className="form-input"
                    value={formData.alocacao_alvo}
                    onChange={(e) => setFormData({ ...formData, alocacao_alvo: parseFloat(e.target.value) || 0 })}
                    max="100"
                  />
                </div>
              )}

              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={handleCloseModal}>
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingInvestment ? 'Guardar' : 'Criar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* New Wallet Modal */}
      {showWalletModal && (
        <div className="modal-overlay" onClick={() => setShowWalletModal(false)}>
          <div className="modal animate-slideUp" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '400px' }}>
            <div className="modal-header">
              <h2 className="modal-title">Nova Carteira (Pie)</h2>
              <button className="btn btn-icon btn-secondary" onClick={() => setShowWalletModal(false)}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={(e) => {
              e.preventDefault();
              if (newWalletName.trim()) {
                const name = newWalletName.trim();
                addCustomWallet(name);
                setActiveWallet(name);
                setNewWalletName('');
                setShowWalletModal(false);
              }
            }}>
              <div className="form-group">
                <label className="form-label">Nome da Carteira</label>
                <input
                  type="text"
                  className="form-input"
                  value={newWalletName}
                  onChange={(e) => setNewWalletName(e.target.value)}
                  placeholder="Ex: Minha Carteira"
                  autoFocus
                />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowWalletModal(false)}>
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary">
                  Criar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="modal-overlay" onClick={() => setShowDeleteConfirm(false)}>
          <div className="modal animate-slideUp" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '400px' }}>
            <div className="modal-header">
              <h2 className="modal-title">Confirmar Remoção</h2>
              <button className="btn btn-icon btn-secondary" onClick={() => setShowDeleteConfirm(false)}>
                <X size={20} />
              </button>
            </div>
            <div style={{ padding: '20px 0' }}>
              <p style={{ color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                Tem a certeza que deseja remover este investimento? Esta ação não pode ser desfeita.
              </p>
            </div>
            <div className="modal-actions">
              <button type="button" className="btn btn-secondary" onClick={() => setShowDeleteConfirm(false)}>
                Cancelar
              </button>
              <button 
                type="button" 
                className="btn btn-danger" 
                onClick={confirmDelete}
              >
                Remover
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// PieChart icon workaround
function PieChart({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21.21 15.89A10 10 0 1 1 8 2.83" />
      <path d="M22 12A10 10 0 0 0 12 2v10z" />
    </svg>
  );
}

export default function InvestmentsPage() {
  return (
    <FinanceProvider>
      <InvestmentsContent />
    </FinanceProvider>
  );
}
