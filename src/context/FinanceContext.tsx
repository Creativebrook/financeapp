"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { Account, Investment, Debt, FixedExpense, VariableExpense, Income, DashboardSummary, PlatformSummary, Plataforma, RecurringMovement, TelegramSettings } from '@/types';
import { supabase } from '@/lib/supabase';
import { User } from '@supabase/supabase-js';

console.log('FinanceContext: Module loaded');

// Initial data
const initialAccounts: Account[] = [
  { id: '1', nome: 'Montepio', tipo: 'Conta à ordem', saldo: 832.29, data_atualizacao: '2026-03-01', notas: 'Conta principal' },
  { id: '2', nome: 'N26', tipo: 'Conta à ordem', saldo: 0.00, data_atualizacao: '2026-03-01', notas: 'Conta digital' },
  { id: '3', nome: 'Revolut', tipo: 'Conta à ordem', saldo: 2554.04, data_atualizacao: '2026-03-01', notas: 'Conta internacional' },
];

const initialInvestments: Investment[] = [
  // XTB
  { id: 'xtb-1', plataforma: 'XTB', ticker: 'BNK.FR', nome: 'Lyxor Stoxx European 600 Banks', quantidade: 1, preco_medio: 111.25, preco_atual: 120.54, valor_atual: 120.54, data_atualizacao: '2026-03-24', alocacao_alvo: 5 },
  { id: 'xtb-2', plataforma: 'XTB', ticker: 'XDNF.DE', nome: 'Xtrackers MSCI World Financials', quantidade: 1, preco_medio: 113.60, preco_atual: 112.60, valor_atual: 112.60, data_atualizacao: '2026-03-24', alocacao_alvo: 5 },
  { id: 'xtb-3', plataforma: 'XTB', ticker: 'SXRV.DE', nome: 'iShares NASDAQ 100', quantidade: 1, preco_medio: 431.89, preco_atual: 451.14, valor_atual: 451.14, data_atualizacao: '2026-03-24', alocacao_alvo: 20 },
  { id: 'xtb-4', plataforma: 'XTB', ticker: 'SXR8.DE', nome: 'iShares Core S&P 500', quantidade: 1, preco_medio: 331.70, preco_atual: 341.48, valor_atual: 341.48, data_atualizacao: '2026-03-24', alocacao_alvo: 15 },
  { id: 'xtb-5', plataforma: 'XTB', ticker: 'IWDA.AS', nome: 'iShares Core MSCI World', quantidade: 1, preco_medio: 331.63, preco_atual: 343.59, valor_atual: 343.59, data_atualizacao: '2026-03-24', alocacao_alvo: 15 },
  { id: 'xtb-6', plataforma: 'XTB', ticker: 'XDWT.DE', nome: 'Xtrackers MSCI World Information Tech', quantidade: 1, preco_medio: 430.46, preco_atual: 438.28, valor_atual: 438.28, data_atualizacao: '2026-03-24', alocacao_alvo: 20 },
  { id: 'xtb-7', plataforma: 'XTB', ticker: 'VVSM.DE', nome: 'VanEck Semiconductor', quantidade: 1, preco_medio: 414.64, preco_atual: 527.22, valor_atual: 527.22, data_atualizacao: '2026-03-24', alocacao_alvo: 20 },
  // Trading212
  // Pie: Growth Predict
  { id: 't212-gp-1', plataforma: 'Trading212', carteira: 'Growth Predict', ticker: 'MU', nome: 'Micron Technology', quantidade: 0.46007211, preco_medio: 120.76, preco_atual: 344.16, valor_atual: 158.62, data_atualizacao: '2026-03-24', dividendos_ganhos: 3.33, dividendos_reinvestidos: 3.33 },
  { id: 't212-gp-2', plataforma: 'Trading212', carteira: 'Growth Predict', ticker: 'GS', nome: 'Goldman Sachs', quantidade: 0.16723897, preco_medio: 659.36, preco_atual: 725.01, valor_atual: 121.25, data_atualizacao: '2026-03-24' },
  { id: 't212-gp-3', plataforma: 'Trading212', carteira: 'Growth Predict', ticker: 'NVDA', nome: 'Nvidia', quantidade: 0.60426697, preco_medio: 149.27, preco_atual: 152.35, valor_atual: 92.06, data_atualizacao: '2026-03-24' },
  { id: 't212-gp-4', plataforma: 'Trading212', carteira: 'Growth Predict', ticker: 'JPM', nome: 'JPMorgan Chase & Co', quantidade: 0.26921536, preco_medio: 252.25, preco_atual: 254.03, valor_atual: 68.39, data_atualizacao: '2026-03-24' },
  { id: 't212-gp-5', plataforma: 'Trading212', carteira: 'Growth Predict', ticker: 'BAC', nome: 'Bank of America', quantidade: 1.62828302, preco_medio: 42.30, preco_atual: 41.72, valor_atual: 67.93, data_atualizacao: '2026-03-24' },
  { id: 't212-gp-6', plataforma: 'Trading212', carteira: 'Growth Predict', ticker: 'UAL', nome: 'United Airlines', quantidade: 0.75093276, preco_medio: 82.03, preco_atual: 81.63, valor_atual: 61.3, data_atualizacao: '2026-03-24' },
  { id: 't212-gp-7', plataforma: 'Trading212', carteira: 'Growth Predict', ticker: 'SLB', nome: 'SLB', quantidade: 1.30811643, preco_medio: 35.09, preco_atual: 43.64, valor_atual: 57.08, data_atualizacao: '2026-03-24' },
  { id: 't212-gp-8', plataforma: 'Trading212', carteira: 'Growth Predict', ticker: 'PLD', nome: 'Prologis', quantidade: 0.26152874, preco_medio: 101.17, preco_atual: 112.23, valor_atual: 29.35, data_atualizacao: '2026-03-24' },
  { id: 't212-gp-9', plataforma: 'Trading212', carteira: 'Growth Predict', ticker: 'BX', nome: 'Blackstone', quantidade: 0.18092547, preco_medio: 136.69, preco_atual: 93.69, valor_atual: 16.95, data_atualizacao: '2026-03-24' },
  { id: 't212-gp-10', plataforma: 'Trading212', carteira: 'Growth Predict', ticker: 'AMZN', nome: 'Amazon', quantidade: 0.11946878, preco_medio: 194.61, preco_atual: 179.30, valor_atual: 21.42, data_atualizacao: '2026-03-24' },

  // Pie: NextGen Leaders
  { id: 't212-nl-1', plataforma: 'Trading212', carteira: 'NextGen Leaders', ticker: 'AXSM', nome: 'Axsome Therapeutics', quantidade: 0.69022277, preco_medio: 112.56, preco_atual: 136.68, valor_atual: 94.34, data_atualizacao: '2026-03-24', dividendos_ganhos: 0.17, dividendos_reinvestidos: 0.17 },
  { id: 't212-nl-2', plataforma: 'Trading212', carteira: 'NextGen Leaders', ticker: 'ORCL', nome: 'Oracle', quantidade: 0.46950386, preco_medio: 187.45, preco_atual: 127.37, valor_atual: 59.8, data_atualizacao: '2026-03-24' },
  { id: 't212-nl-3', plataforma: 'Trading212', carteira: 'NextGen Leaders', ticker: 'CRSP', nome: 'CRISPR Therapeutics', quantidade: 1.40645634, preco_medio: 43.83, preco_atual: 40.06, valor_atual: 56.34, data_atualizacao: '2026-03-24' },
  { id: 't212-nl-4', plataforma: 'Trading212', carteira: 'NextGen Leaders', ticker: 'APP', nome: 'AppLovin', quantidade: 0.1234908, preco_medio: 432.18, preco_atual: 377.11, valor_atual: 46.57, data_atualizacao: '2026-03-24' },
  { id: 't212-nl-5', plataforma: 'Trading212', carteira: 'NextGen Leaders', ticker: 'LMT', nome: 'Lockheed Martin', quantidade: 0.08096875, preco_medio: 412.50, preco_atual: 524.40, valor_atual: 42.46, data_atualizacao: '2026-03-24' },
  { id: 't212-nl-6', plataforma: 'Trading212', carteira: 'NextGen Leaders', ticker: 'UNH', nome: 'UnitedHealth', quantidade: 0.1597113, preco_medio: 252.39, preco_atual: 234.42, valor_atual: 37.44, data_atualizacao: '2026-03-24' },
  { id: 't212-nl-7', plataforma: 'Trading212', carteira: 'NextGen Leaders', ticker: 'FSLR', nome: 'First Solar', quantidade: 0.22927531, preco_medio: 168.27, preco_atual: 167.83, valor_atual: 38.48, data_atualizacao: '2026-03-24' },
  { id: 't212-nl-8', plataforma: 'Trading212', carteira: 'NextGen Leaders', ticker: 'XOM', nome: 'Exxon Mobil', quantidade: 0.21176222, preco_medio: 103.13, preco_atual: 141.38, valor_atual: 29.94, data_atualizacao: '2026-03-24' },
  { id: 't212-nl-9', plataforma: 'Trading212', carteira: 'NextGen Leaders', ticker: 'RTX', nome: 'RTX Corp', quantidade: 0.10944615, preco_medio: 143.08, preco_atual: 166.84, valor_atual: 18.26, data_atualizacao: '2026-03-24' },
  { id: 't212-nl-10', plataforma: 'Trading212', carteira: 'NextGen Leaders', ticker: 'CVX', nome: 'Chevron', quantidade: 0.12693715, preco_medio: 133.69, preco_atual: 177.65, valor_atual: 22.55, data_atualizacao: '2026-03-24' },
  { id: 't212-nl-11', plataforma: 'Trading212', carteira: 'NextGen Leaders', ticker: 'CVS', nome: 'CVS Health', quantidade: 0.29334027, preco_medio: 61.67, preco_atual: 63.03, valor_atual: 18.49, data_atualizacao: '2026-03-24' },
  { id: 't212-nl-12', plataforma: 'Trading212', carteira: 'NextGen Leaders', ticker: 'SHOP', nome: 'Shopify', quantidade: 0.09319548, preco_medio: 126.29, preco_atual: 101.19, valor_atual: 9.43, data_atualizacao: '2026-03-24' },
  { id: 't212-nl-13', plataforma: 'Trading212', carteira: 'NextGen Leaders', ticker: 'SPOT', nome: 'Spotify Technology', quantidade: 0.03886728, preco_medio: 539.01, preco_atual: 419.63, valor_atual: 16.31, data_atualizacao: '2026-03-24' },

  // Pie: Top Active Gainers
  { id: 't212-tag-1', plataforma: 'Trading212', carteira: 'Top Active Gainers', ticker: 'IQ', nome: 'iQIYI', quantidade: 30.30447795, preco_medio: 1.53, preco_atual: 1.07, valor_atual: 32.36, data_atualizacao: '2026-03-24' },
  { id: 't212-tag-2', plataforma: 'Trading212', carteira: 'Top Active Gainers', ticker: 'GOOG', nome: 'Alphabet (Class C)', quantidade: 0.10718148, preco_medio: 193.78, preco_atual: 251.16, valor_atual: 26.92, data_atualizacao: '2026-03-24' },
  { id: 't212-tag-3', plataforma: 'Trading212', carteira: 'Top Active Gainers', ticker: 'MSFT', nome: 'Microsoft', quantidade: 0.06845857, preco_medio: 399.37, preco_atual: 322.38, valor_atual: 22.07, data_atualizacao: '2026-03-24' },
  { id: 't212-tag-4', plataforma: 'Trading212', carteira: 'Top Active Gainers', ticker: 'JPM', nome: 'JPMorgan Chase & Co', quantidade: 0.09507967, preco_medio: 252.21, preco_atual: 254.00, valor_atual: 24.15, data_atualizacao: '2026-03-24' },
  { id: 't212-tag-5', plataforma: 'Trading212', carteira: 'Top Active Gainers', ticker: 'CAT', nome: 'Caterpillar', quantidade: 0.03743064, preco_medio: 340.89, preco_atual: 622.49, valor_atual: 23.3, data_atualizacao: '2026-03-24' },
  { id: 't212-tag-6', plataforma: 'Trading212', carteira: 'Top Active Gainers', ticker: 'NFLX', nome: 'Netflix', quantidade: 0.32273258, preco_medio: 88.87, preco_atual: 78.67, valor_atual: 25.39, data_atualizacao: '2026-03-24' },
  { id: 't212-tag-7', plataforma: 'Trading212', carteira: 'Top Active Gainers', ticker: 'BAC', nome: 'Bank of America', quantidade: 0.57534117, preco_medio: 42.29, preco_atual: 41.80, valor_atual: 24.05, data_atualizacao: '2026-03-24' },
  { id: 't212-tag-8', plataforma: 'Trading212', carteira: 'Top Active Gainers', ticker: 'MLM', nome: 'Martin Marietta Materials', quantidade: 0.04677319, preco_medio: 519.53, preco_atual: 496.22, valor_atual: 23.21, data_atualizacao: '2026-03-24' },
  { id: 't212-tag-9', plataforma: 'Trading212', carteira: 'Top Active Gainers', ticker: 'AXSM', nome: 'Axsome Therapeutics', quantidade: 0.17043523, preco_medio: 112.59, preco_atual: 136.71, valor_atual: 23.3, data_atualizacao: '2026-03-24' },
  { id: 't212-tag-10', plataforma: 'Trading212', carteira: 'Top Active Gainers', ticker: 'DASH', nome: 'DoorDash', quantidade: 0.16036068, preco_medio: 179.16, preco_atual: 135.20, valor_atual: 21.68, data_atualizacao: '2026-03-24' },
  { id: 't212-tag-11', plataforma: 'Trading212', carteira: 'Top Active Gainers', ticker: 'AAPL', nome: 'Apple', quantidade: 0.08557461, preco_medio: 213.15, preco_atual: 218.41, valor_atual: 18.69, data_atualizacao: '2026-03-24' },
  { id: 't212-tag-12', plataforma: 'Trading212', carteira: 'Top Active Gainers', ticker: 'AXP', nome: 'American Express', quantidade: 0.072244, preco_medio: 275.60, preco_atual: 260.51, valor_atual: 18.82, data_atualizacao: '2026-03-24' },
  { id: 't212-tag-13', plataforma: 'Trading212', carteira: 'Top Active Gainers', ticker: 'ECL', nome: 'Ecolab', quantidade: 0.08018929, preco_medio: 233.19, preco_atual: 227.59, valor_atual: 18.25, data_atualizacao: '2026-03-24' },
  { id: 't212-tag-14', plataforma: 'Trading212', carteira: 'Top Active Gainers', ticker: 'CVX', nome: 'Chevron', quantidade: 0.11448203, preco_medio: 133.73, preco_atual: 177.58, valor_atual: 20.33, data_atualizacao: '2026-03-24' },
  { id: 't212-tag-15', plataforma: 'Trading212', carteira: 'Top Active Gainers', ticker: 'C', nome: 'Citigroup', quantidade: 0.20177253, preco_medio: 81.13, preco_atual: 98.58, valor_atual: 19.89, data_atualizacao: '2026-03-24' },
  { id: 't212-tag-16', plataforma: 'Trading212', carteira: 'Top Active Gainers', ticker: 'MA', nome: 'Mastercard', quantidade: 0.02949173, preco_medio: 484.54, preco_atual: 429.61, valor_atual: 12.67, data_atualizacao: '2026-03-24' },
  { id: 't212-tag-17', plataforma: 'Trading212', carteira: 'Top Active Gainers', ticker: 'AMD', nome: 'Advanced Micro Devices', quantidade: 0.082822, preco_medio: 156.00, preco_atual: 177.85, valor_atual: 14.73, data_atualizacao: '2026-03-24' },
  { id: 't212-tag-18', plataforma: 'Trading212', carteira: 'Top Active Gainers', ticker: 'BRK.B', nome: 'Berkshire Hathaway (Class B)', quantidade: 0.03172795, preco_medio: 428.33, preco_atual: 413.83, valor_atual: 13.13, data_atualizacao: '2026-03-24' },
  { id: 't212-tag-19', plataforma: 'Trading212', carteira: 'Top Active Gainers', ticker: 'PM', nome: 'Philip Morris International', quantidade: 0.09212239, preco_medio: 143.29, preco_atual: 141.44, valor_atual: 13.03, data_atualizacao: '2026-03-24' },
  { id: 't212-tag-20', plataforma: 'Trading212', carteira: 'Top Active Gainers', ticker: 'WMT', nome: 'Walmart', quantidade: 0.1287051, preco_medio: 89.97, preco_atual: 105.59, valor_atual: 13.59, data_atualizacao: '2026-03-24' },
  { id: 't212-tag-21', plataforma: 'Trading212', carteira: 'Top Active Gainers', ticker: 'MCO', nome: 'Moody\'s', quantidade: 0.03575062, preco_medio: 406.15, preco_atual: 369.22, valor_atual: 13.2, data_atualizacao: '2026-03-24' },
  { id: 't212-tag-22', plataforma: 'Trading212', carteira: 'Top Active Gainers', ticker: 'DE', nome: 'Deere & Co', quantidade: 0.02796188, preco_medio: 428.08, preco_atual: 507.12, valor_atual: 14.18, data_atualizacao: '2026-03-24' },
  { id: 't212-tag-23', plataforma: 'Trading212', carteira: 'Top Active Gainers', ticker: 'WM', nome: 'Waste Management', quantidade: 0.04325202, preco_medio: 196.52, preco_atual: 193.75, valor_atual: 8.38, data_atualizacao: '2026-03-24' },
  { id: 't212-tag-24', plataforma: 'Trading212', carteira: 'Top Active Gainers', ticker: 'SPOT', nome: 'Spotify Technology', quantidade: 0.0225033, preco_medio: 539.03, preco_atual: 419.94, valor_atual: 9.45, data_atualizacao: '2026-03-24' },
  { id: 't212-tag-25', plataforma: 'Trading212', carteira: 'Top Active Gainers', ticker: 'PLTR', nome: 'Palantir', quantidade: 0.07245666, preco_medio: 146.57, preco_atual: 134.29, valor_atual: 9.73, data_atualizacao: '2026-03-24' },

  // Pie: Best Dividend Yield
  { id: 't212-bdy-1', plataforma: 'Trading212', carteira: 'Best Dividend Yield', ticker: 'MO', nome: 'Altria', quantidade: 0.86819587, preco_medio: 55.55, preco_atual: 55.59, valor_atual: 48.26, data_atualizacao: '2026-03-24', dividendos_ganhos: 0.05, dividendos_reinvestidos: 0.05 },
  { id: 't212-bdy-2', plataforma: 'Trading212', carteira: 'Best Dividend Yield', ticker: 'UVE', nome: 'Universal Insurance', quantidade: 1.65759647, preco_medio: 21.71, preco_atual: 30.05, valor_atual: 49.81, data_atualizacao: '2026-03-24' },
  { id: 't212-bdy-3', plataforma: 'Trading212', carteira: 'Best Dividend Yield', ticker: 'PEBO', nome: 'Peoples Bancorp', quantidade: 1.48625601, preco_medio: 26.20, preco_atual: 27.68, valor_atual: 41.14, data_atualizacao: '2026-03-24' },
  { id: 't212-bdy-4', plataforma: 'Trading212', carteira: 'Best Dividend Yield', ticker: 'EFC', nome: 'Ellington Financial', quantidade: 3.2421483, preco_medio: 11.45, preco_atual: 10.05, valor_atual: 32.58, data_atualizacao: '2026-03-24' },
  { id: 't212-bdy-5', plataforma: 'Trading212', carteira: 'Best Dividend Yield', ticker: 'T', nome: 'AT&T', quantidade: 1.2613225, preco_medio: 22.33, preco_atual: 24.91, valor_atual: 31.42, data_atualizacao: '2026-03-24' },
  { id: 't212-bdy-6', plataforma: 'Trading212', carteira: 'Best Dividend Yield', ticker: 'AM', nome: 'Antero Midstream', quantidade: 1.66155989, preco_medio: 15.77, preco_atual: 20.06, valor_atual: 33.33, data_atualizacao: '2026-03-24' },
  { id: 't212-bdy-7', plataforma: 'Trading212', carteira: 'Best Dividend Yield', ticker: 'LPG', nome: 'Dorian LPG', quantidade: 1.11051329, preco_medio: 24.86, preco_atual: 29.80, valor_atual: 33.09, data_atualizacao: '2026-03-24' },
  { id: 't212-bdy-8', plataforma: 'Trading212', carteira: 'Best Dividend Yield', ticker: 'OMF', nome: 'OneMain', quantidade: 0.69461173, preco_medio: 48.60, preco_atual: 45.65, valor_atual: 31.71, data_atualizacao: '2026-03-24' },
  { id: 't212-bdy-9', plataforma: 'Trading212', carteira: 'Best Dividend Yield', ticker: 'MFA', nome: 'MFA Financial', quantidade: 2.98190107, preco_medio: 8.30, preco_atual: 8.38, valor_atual: 24.98, data_atualizacao: '2026-03-24' },
  { id: 't212-bdy-10', plataforma: 'Trading212', carteira: 'Best Dividend Yield', ticker: 'VZ', nome: 'Verizon Communications', quantidade: 0.28394472, preco_medio: 38.92, preco_atual: 43.88, valor_atual: 12.46, data_atualizacao: '2026-03-24' },

  // Pie: Diversified ETF Core
  { id: 't212-dec-1', plataforma: 'Trading212', carteira: 'Diversified ETF Core', ticker: 'WSML', nome: 'iShares Msci World Small Cap (Acc)', quantidade: 6.1161663, preco_medio: 7.62, preco_atual: 7.93, valor_atual: 48.52, data_atualizacao: '2026-03-24', dividendos_ganhos: 0.02, dividendos_reinvestidos: 0.02 },
  { id: 't212-dec-2', plataforma: 'Trading212', carteira: 'Diversified ETF Core', ticker: 'IWDA', nome: 'iShares Core MSCI World (Acc)', quantidade: 0.41517512, preco_medio: 108.68, preco_atual: 108.97, valor_atual: 45.24, data_atualizacao: '2026-03-24' },
  { id: 't212-dec-3', plataforma: 'Trading212', carteira: 'Diversified ETF Core', ticker: 'R1GB', nome: 'iShares Russell 1000 Growth (Acc)', quantidade: 1.05368992, preco_medio: 36.78, preco_atual: 34.73, valor_atual: 36.6, data_atualizacao: '2026-03-24' },
  { id: 't212-dec-4', plataforma: 'Trading212', carteira: 'Diversified ETF Core', ticker: 'WGLD', nome: 'WisdomTree Core Physical Gold', quantidade: 0.07462689, preco_medio: 336.61, preco_atual: 378.15, valor_atual: 28.22, data_atualizacao: '2026-03-24' },
  { id: 't212-dec-5', plataforma: 'Trading212', carteira: 'Diversified ETF Core', ticker: 'SMH', nome: 'VanEck Semiconductor (Acc)', quantidade: 0.5320067, preco_medio: 48.08, preco_atual: 59.85, valor_atual: 31.84, data_atualizacao: '2026-03-24' },
  { id: 't212-dec-6', plataforma: 'Trading212', carteira: 'Diversified ETF Core', ticker: 'DAGB', nome: 'VanEck Crypto and Blockchain Innovators (Acc)', quantidade: 2.789092, preco_medio: 11.19, preco_atual: 9.77, valor_atual: 27.26, data_atualizacao: '2026-03-24' },
  { id: 't212-dec-7', plataforma: 'Trading212', carteira: 'Diversified ETF Core', ticker: 'DGRA', nome: 'WisdomTree US Quality Dividend Growth (Acc)', quantidade: 0.62942063, preco_medio: 45.31, preco_atual: 45.18, valor_atual: 28.44, data_atualizacao: '2026-03-24' },
  { id: 't212-dec-8', plataforma: 'Trading212', carteira: 'Diversified ETF Core', ticker: 'ARR', nome: 'ARMOUR Residential REIT', quantidade: 1.36146219, preco_medio: 14.85, preco_atual: 13.85, valor_atual: 18.85, data_atualizacao: '2026-03-24' },
  { id: 't212-dec-9', plataforma: 'Trading212', carteira: 'Diversified ETF Core', ticker: '4OQ1', nome: 'AGNC Investment Corp', quantidade: 1.607411, preco_medio: 9.61, preco_atual: 8.61, valor_atual: 13.84, data_atualizacao: '2026-03-24' },

  // Pie: S&P500 Safe Stocks
  { id: 't212-sss-1', plataforma: 'Trading212', carteira: 'S&P500 Safe Stocks', ticker: 'META', nome: 'Meta Platforms', quantidade: 0.0406481, preco_medio: 567.80, preco_atual: 513.68, valor_atual: 20.88, data_atualizacao: '2026-03-24', dividendos_ganhos: 0.01, dividendos_reinvestidos: 0.01 },
  { id: 't212-sss-2', plataforma: 'Trading212', carteira: 'S&P500 Safe Stocks', ticker: 'MSFT', nome: 'Microsoft', quantidade: 0.05671814, preco_medio: 399.52, preco_atual: 322.47, valor_atual: 18.29, data_atualizacao: '2026-03-24' },
  { id: 't212-sss-3', plataforma: 'Trading212', carteira: 'S&P500 Safe Stocks', ticker: 'AMZN', nome: 'Amazon', quantidade: 0.10059689, preco_medio: 191.46, preco_atual: 179.73, valor_atual: 18.08, data_atualizacao: '2026-03-24' },
  { id: 't212-sss-4', plataforma: 'Trading212', carteira: 'S&P500 Safe Stocks', ticker: 'AAPL', nome: 'Apple', quantidade: 0.08888752, preco_medio: 213.08, preco_atual: 218.37, valor_atual: 19.41, data_atualizacao: '2026-03-24' },
  { id: 't212-sss-5', plataforma: 'Trading212', carteira: 'S&P500 Safe Stocks', ticker: 'TSLA', nome: 'Tesla', quantidade: 0.05698938, preco_medio: 357.08, preco_atual: 332.17, valor_atual: 18.93, data_atualizacao: '2026-03-24' },
  { id: 't212-sss-6', plataforma: 'Trading212', carteira: 'S&P500 Safe Stocks', ticker: 'PG', nome: 'Procter & Gamble', quantidade: 0.1473644, preco_medio: 127.91, preco_atual: 123.91, valor_atual: 18.26, data_atualizacao: '2026-03-24' },
  { id: 't212-sss-7', plataforma: 'Trading212', carteira: 'S&P500 Safe Stocks', ticker: 'MCD', nome: 'McDonald\'s', quantidade: 0.0684803, preco_medio: 264.75, preco_atual: 266.06, valor_atual: 18.22, data_atualizacao: '2026-03-24' },
  { id: 't212-sss-8', plataforma: 'Trading212', carteira: 'S&P500 Safe Stocks', ticker: 'APP', nome: 'AppLovin', quantidade: 0.04733388, preco_medio: 432.04, preco_atual: 377.10, valor_atual: 17.85, data_atualizacao: '2026-03-24' },
  { id: 't212-sss-9', plataforma: 'Trading212', carteira: 'S&P500 Safe Stocks', ticker: 'HOOD', nome: 'Robinhood Markets', quantidade: 0.29478331, preco_medio: 90.64, preco_atual: 60.45, valor_atual: 17.82, data_atualizacao: '2026-03-24' },
  { id: 't212-sss-10', plataforma: 'Trading212', carteira: 'S&P500 Safe Stocks', ticker: 'V', nome: 'Visa', quantidade: 0.05453495, preco_medio: 285.12, preco_atual: 262.40, valor_atual: 14.31, data_atualizacao: '2026-03-24' },
  { id: 't212-sss-11', plataforma: 'Trading212', carteira: 'S&P500 Safe Stocks', ticker: 'NVDA', nome: 'Nvidia', quantidade: 0.07749962, preco_medio: 149.29, preco_atual: 152.39, valor_atual: 11.81, data_atualizacao: '2026-03-24' },
  { id: 't212-sss-12', plataforma: 'Trading212', carteira: 'S&P500 Safe Stocks', ticker: 'JNJ', nome: 'Johnson & Johnson', quantidade: 0.04350818, preco_medio: 168.70, preco_atual: 202.95, valor_atual: 8.83, data_atualizacao: '2026-03-24' },
  { id: 't212-sss-13', plataforma: 'Trading212', carteira: 'S&P500 Safe Stocks', ticker: 'KO', nome: 'Coca-Cola', quantidade: 0.13089862, preco_medio: 59.97, preco_atual: 64.55, valor_atual: 8.45, data_atualizacao: '2026-03-24' },
  { id: 't212-sss-14', plataforma: 'Trading212', carteira: 'S&P500 Safe Stocks', ticker: 'PEP', nome: 'PepsiCo', quantidade: 0.06499957, preco_medio: 123.54, preco_atual: 130.46, valor_atual: 8.48, data_atualizacao: '2026-03-24' },
  { id: 't212-sss-15', plataforma: 'Trading212', carteira: 'S&P500 Safe Stocks', ticker: 'JCI', nome: 'Johnson Controls International', quantidade: 0.08271264, preco_medio: 96.96, preco_atual: 119.69, valor_atual: 9.9, data_atualizacao: '2026-03-24' },

  // Pie: Tech Europe 2030
  { id: 't212-te-1', plataforma: 'Trading212', carteira: 'Tech Europe 2030', ticker: 'ASML', nome: 'ASML', quantidade: 0.01684061, preco_medio: 1157.32, preco_atual: 1217.89, valor_atual: 20.51, data_atualizacao: '2026-03-24' },
  { id: 't212-te-2', plataforma: 'Trading212', carteira: 'Tech Europe 2030', ticker: 'SU', nome: 'Schneider Electric', quantidade: 0.03982982, preco_medio: 238.26, preco_atual: 241.78, valor_atual: 9.63, data_atualizacao: '2026-03-24' },
  { id: 't212-te-3', plataforma: 'Trading212', carteira: 'Tech Europe 2030', ticker: 'IFX', nome: 'Infineon Technologies', quantidade: 0.25461427, preco_medio: 40.06, preco_atual: 38.33, valor_atual: 9.76, data_atualizacao: '2026-03-24' },
  { id: 't212-te-4', plataforma: 'Trading212', carteira: 'Tech Europe 2030', ticker: 'STM', nome: 'STMicroelectronics', quantidade: 0.34414278, preco_medio: 26.82, preco_atual: 27.66, valor_atual: 9.52, data_atualizacao: '2026-03-24' },
  { id: 't212-te-5', plataforma: 'Trading212', carteira: 'Tech Europe 2030', ticker: 'BESI', nome: 'BE Semiconductor Industries', quantidade: 0.05396269, preco_medio: 172.16, preco_atual: 184.02, valor_atual: 9.93, data_atualizacao: '2026-03-24' },
  { id: 't212-te-6', plataforma: 'Trading212', carteira: 'Tech Europe 2030', ticker: 'SAP', nome: 'SAP', quantidade: 0.06018341, preco_medio: 177.79, preco_atual: 148.21, valor_atual: 8.92, data_atualizacao: '2026-03-24' },
  { id: 't212-te-7', plataforma: 'Trading212', carteira: 'Tech Europe 2030', ticker: 'EXV3', nome: 'iShares STOXX Europe 600 Technology DE (Dist)', quantidade: 0.1227374, preco_medio: 82.94, preco_atual: 77.56, valor_atual: 9.52, data_atualizacao: '2026-03-24' },
  { id: 't212-te-8', plataforma: 'Trading212', carteira: 'Tech Europe 2030', ticker: 'ADYEN', nome: 'Adyen', quantidade: 0.00550892, preco_medio: 1074.62, preco_atual: 887.65, valor_atual: 4.89, data_atualizacao: '2026-03-24' },
  { id: 't212-te-9', plataforma: 'Trading212', carteira: 'Tech Europe 2030', ticker: 'SIE', nome: 'Siemens', quantidade: 0.0227347, preco_medio: 236.64, preco_atual: 209.37, valor_atual: 4.76, data_atualizacao: '2026-03-24' },
  { id: 't212-te-10', plataforma: 'Trading212', carteira: 'Tech Europe 2030', ticker: 'WIX', nome: 'Wix.com', quantidade: 0.06412686, preco_medio: 67.68, preco_atual: 75.32, valor_atual: 4.83, data_atualizacao: '2026-03-24' },
  { id: 't212-te-11', plataforma: 'Trading212', carteira: 'Tech Europe 2030', ticker: 'PATH', nome: 'UiPath', quantidade: 0.48787908, preco_medio: 11.19, preco_atual: 9.61, valor_atual: 4.69, data_atualizacao: '2026-03-24' },

  // Pie: Moonshot Profile
  { id: 't212-mp-1', plataforma: 'Trading212', carteira: 'Moonshot Profile', ticker: 'IBRX', nome: 'ImmunityBio', quantidade: 2.00519831, preco_medio: 3.33, preco_atual: 6.43, valor_atual: 12.9, data_atualizacao: '2026-03-24' },
  { id: 't212-mp-2', plataforma: 'Trading212', carteira: 'Moonshot Profile', ticker: 'ENPH', nome: 'Enphase Energy', quantidade: 0.23669009, preco_medio: 35.28, preco_atual: 35.62, valor_atual: 8.43, data_atualizacao: '2026-03-24' },
  { id: 't212-mp-3', plataforma: 'Trading212', carteira: 'Moonshot Profile', ticker: 'IMMP', nome: 'Immutep', quantidade: 26.11967962, preco_medio: 0.54, preco_atual: 0.32, valor_atual: 8.28, data_atualizacao: '2026-03-24' },
  { id: 't212-mp-4', plataforma: 'Trading212', carteira: 'Moonshot Profile', ticker: 'HIVE', nome: 'Hive Digital Technologies Ltd', quantidade: 4.77966643, preco_medio: 2.07, preco_atual: 1.80, valor_atual: 8.6, data_atualizacao: '2026-03-24' },
  { id: 't212-mp-5', plataforma: 'Trading212', carteira: 'Moonshot Profile', ticker: 'OSCR', nome: 'Oscar Health', quantidade: 0.78457249, preco_medio: 11.32, preco_atual: 10.45, valor_atual: 8.2, data_atualizacao: '2026-03-24' },
  { id: 't212-mp-6', plataforma: 'Trading212', carteira: 'Moonshot Profile', ticker: 'CLSK', nome: 'Cleanspark', quantidade: 0.71807725, preco_medio: 8.98, preco_atual: 8.36, valor_atual: 6, data_atualizacao: '2026-03-24' },
  { id: 't212-mp-7', plataforma: 'Trading212', carteira: 'Moonshot Profile', ticker: 'MNPR', nome: 'Monopar Therapeutics', quantidade: 0.11173222, preco_medio: 56.21, preco_atual: 47.61, valor_atual: 5.32, data_atualizacao: '2026-03-24' },
  { id: 't212-mp-8', plataforma: 'Trading212', carteira: 'Moonshot Profile', ticker: 'DAVE', nome: 'Dave', quantidade: 0.03287768, preco_medio: 168.20, preco_atual: 179.15, valor_atual: 5.89, data_atualizacao: '2026-03-24' },
  { id: 't212-mp-9', plataforma: 'Trading212', carteira: 'Moonshot Profile', ticker: 'OKLO', nome: 'Oklo', quantidade: 0.11763905, preco_medio: 59.68, preco_atual: 47.86, valor_atual: 5.63, data_atualizacao: '2026-03-24' },
  { id: 't212-cash', plataforma: 'Trading212', ticker: 'CASH', nome: 'Numerário / Dividendos', quantidade: 1, preco_medio: 14.42, preco_atual: 2.89, valor_atual: 2.89, data_atualizacao: '2026-03-24' },
  // Revolut Stocks
  { id: '7', plataforma: 'Revolut Stocks', ticker: 'NVDA', nome: 'NVIDIA Corp.', quantidade: 9.81210175, preco_medio: 129.63, preco_atual: 151.66, valor_atual: 1488.12, data_atualizacao: '2026-03-24' },
  { id: '8', plataforma: 'Revolut Stocks', ticker: 'TSM', nome: 'Taiwan Semiconductor', quantidade: 0.81378769, preco_medio: 280.74, preco_atual: 292.53, valor_atual: 238.06, data_atualizacao: '2026-03-24' },
  { id: '16', plataforma: 'Revolut Stocks', ticker: 'AVGO', nome: 'Broadcom Inc.', quantidade: 0.65040905, preco_medio: 351.48, preco_atual: 276.36, valor_atual: 179.75, data_atualizacao: '2026-03-24' },
  { id: '17', plataforma: 'Revolut Stocks', ticker: 'UDMY', nome: 'Udemy Inc.', quantidade: 6.98712446, preco_medio: 6.43, preco_atual: 4.18, valor_atual: 29.21, data_atualizacao: '2026-03-24' },
  // Revolut Cripto
  { id: '9', plataforma: 'Revolut Cripto', ticker: 'BTC', nome: 'Bitcoin', quantidade: 0.01742, preco_medio: 62343.86, preco_atual: 61851.32, valor_atual: 1077.45, data_atualizacao: '2026-03-24' },
  { id: '10', plataforma: 'Revolut Cripto', ticker: 'ETH', nome: 'Ethereum', quantidade: 0.1515, preco_medio: 3433.33, preco_atual: 1608.18, valor_atual: 243.64, data_atualizacao: '2026-03-24' },
  // Robo Advisor
  { id: 'ra-cash', plataforma: 'Robo Advisor', ticker: 'CASH', nome: 'Numerário', quantidade: 1, preco_medio: 341.56, preco_atual: 341.56, valor_atual: 341.56, data_atualizacao: '2026-03-24', alocacao_alvo: 11 },
  { id: 'ra-1', plataforma: 'Robo Advisor', ticker: 'LYPS', nome: 'Lyxor MSCI Pacific', quantidade: 1, preco_medio: 518.14, preco_atual: 503.64, valor_atual: 503.64, data_atualizacao: '2026-03-24', alocacao_alvo: 16.22 },
  { id: 'ra-2', plataforma: 'Robo Advisor', ticker: 'LYMS', nome: 'Lyxor MSCI Emerging Markets', quantidade: 1, preco_medio: 517.19, preco_atual: 502.71, valor_atual: 502.71, data_atualizacao: '2026-03-24', alocacao_alvo: 16.19 },
  { id: 'ra-3', plataforma: 'Robo Advisor', ticker: 'LEMA', nome: 'Lyxor MSCI Emerging Markets (LUX)', quantidade: 1, preco_medio: 407.93, preco_atual: 396.51, valor_atual: 396.51, data_atualizacao: '2026-03-24', alocacao_alvo: 12.77 },
  { id: 'ra-4', plataforma: 'Robo Advisor', ticker: '79U0', nome: 'Amundi Index MSCI World SRI', quantidade: 1, preco_medio: 398.03, preco_atual: 386.89, valor_atual: 386.89, data_atualizacao: '2026-03-24', alocacao_alvo: 12.46 },
  { id: 'ra-5', plataforma: 'Robo Advisor', ticker: 'LYP6', nome: 'Lyxor Core MSCI World', quantidade: 1, preco_medio: 266.10, preco_atual: 258.65, valor_atual: 258.65, data_atualizacao: '2026-03-24', alocacao_alvo: 8.33 },
  { id: 'ra-6', plataforma: 'Robo Advisor', ticker: 'WELK', nome: 'Amundi Index MSCI World', quantidade: 1, preco_medio: 129.37, preco_atual: 125.75, valor_atual: 125.75, data_atualizacao: '2026-03-24', alocacao_alvo: 4.05 },
  { id: 'ra-7', plataforma: 'Robo Advisor', ticker: 'XDWI', nome: 'Xtrackers MSCI World Info Tech', quantidade: 1, preco_medio: 125.54, preco_atual: 122.03, valor_atual: 122.03, data_atualizacao: '2026-03-24', alocacao_alvo: 3.93 },
  { id: 'ra-8', plataforma: 'Robo Advisor', ticker: '2B72', nome: 'iShares MSCI World Info Tech', quantidade: 1, preco_medio: 122.34, preco_atual: 118.92, valor_atual: 118.92, data_atualizacao: '2026-03-24', alocacao_alvo: 3.83 },
  { id: 'ra-9', plataforma: 'Robo Advisor', ticker: 'EBUY', nome: 'Amundi MSCI Digital Economy', quantidade: 1, preco_medio: 119.79, preco_atual: 116.44, valor_atual: 116.44, data_atualizacao: '2026-03-24', alocacao_alvo: 3.75 },
  { id: 'ra-10', plataforma: 'Robo Advisor', ticker: 'PRAJ', nome: 'Amundi MSCI Robotics & AI', quantidade: 1, preco_medio: 94.87, preco_atual: 92.22, valor_atual: 92.22, data_atualizacao: '2026-03-24', alocacao_alvo: 2.97 },
  { id: 'ra-11', plataforma: 'Robo Advisor', ticker: 'UBUD', nome: 'Amundi MSCI Semiconductors', quantidade: 1, preco_medio: 63.89, preco_atual: 62.10, valor_atual: 62.10, data_atualizacao: '2026-03-24', alocacao_alvo: 2.00 },
  { id: 'ra-12', plataforma: 'Robo Advisor', ticker: 'AMEL', nome: 'Amundi MSCI New Energy', quantidade: 1, preco_medio: 61.66, preco_atual: 59.93, valor_atual: 59.93, data_atualizacao: '2026-03-24', alocacao_alvo: 1.93 },
  { id: 'ra-13', plataforma: 'Robo Advisor', ticker: 'LGQK', nome: 'L&G Cyber Security', quantidade: 1, preco_medio: 24.60, preco_atual: 23.91, valor_atual: 23.91, data_atualizacao: '2026-03-24', alocacao_alvo: 0.77 },
];

const initialDebts: Debt[] = [
  { id: '1', nome: 'Cartão de Crédito Cetelem', valor_total: 550.57, valor_inicial: 1250, prestacao_mensal: 62.50, data_pagamento: 2, conta: 'Montepio', categoria: 'Cartão de Crédito', taxa_juro: 12.53 },
  { id: '2', nome: 'Crédito Cetelem', valor_total: 1548.40, valor_inicial: 1548.40, prestacao_mensal: 40.44, data_pagamento: 2, conta: 'Montepio', categoria: 'Empréstimo', taxa_juro: 12.75 },
  { id: '3', nome: 'Cartão de Crédito Montepio', valor_total: 714.31, valor_inicial: 1000, prestacao_mensal: 42.78, data_pagamento: 7, conta: 'Montepio', categoria: 'Cartão de Crédito', taxa_juro: 8.00 },
  { id: '4', nome: 'Dívida Seg. Social', valor_total: 1669.24, valor_inicial: 1669.24, prestacao_mensal: 26.76, data_pagamento: 20, conta: 'Montepio', categoria: 'Impostos' },
  { id: '5', nome: 'Crédito Automóvel', valor_total: 15029.38, valor_inicial: 16897.30, prestacao_mensal: 224.99, data_pagamento: 24, conta: 'Montepio', categoria: 'Empréstimo' },
  { id: '6', nome: 'Dívida Finanças', valor_total: 1258.24, valor_inicial: 1258.24, prestacao_mensal: 59.58, data_pagamento: 2, conta: 'Montepio', categoria: 'Impostos' },
];

const initialFixedExpenses: FixedExpense[] = [
  { id: '1', nome: 'Telemóvel Gonçalo', valor: 10, frequencia: 'mensal', data_pagamento: 1, conta: 'Montepio', categoria: 'Serviços' },
  { id: '2', nome: 'Telemóvel', valor: 13, frequencia: 'mensal', data_pagamento: 5, conta: 'Montepio', categoria: 'Serviços' },
  { id: '3', nome: 'Seguro Auto', valor: 215.15, frequencia: 'trimestral', data_pagamento: 8, conta: 'Montepio', categoria: 'Seguros' },
  { id: '4', nome: 'Clube ACP', valor: 9.80, frequencia: 'mensal', data_pagamento: 9, conta: 'Montepio', categoria: 'Subscrição' },
  { id: '5', nome: 'Subs. ChatGPT', valor: 23, frequencia: 'mensal', data_pagamento: 14, conta: 'Montepio', categoria: 'Subscrição' },
  { id: '6', nome: 'Crossfit Valverde', valor: 59, frequencia: 'mensal', data_pagamento: 18, conta: 'Revolut', categoria: 'Lazer' },
  { id: '7', nome: 'Pensão de Alimentos', valor: 180.06, frequencia: 'mensal', data_pagamento: 27, conta: 'Montepio', categoria: 'Familia' },
  { id: '8', nome: 'Semanada Gonçalo', valor: 5, frequencia: 'semanal', data_pagamento: 1, conta: 'Revolut', categoria: 'Pessoal' },
  { id: '9', nome: 'Robo Advisor', valor: 100, frequencia: 'mensal', data_pagamento: 2, conta: 'Revolut', categoria: 'Investimento' },
  { id: '10', nome: 'IUC', valor: 158.29, frequencia: 'unico', data_pagamento: 25, conta: 'Montepio', categoria: 'Impostos' },
];

const initialVariableExpenses: VariableExpense[] = [
  // Montepio Variable Expenses - Março 2026
  { id: 'mv-mar-1', nome: 'Auchan Energy', valor: 25.00, data: '2026-03-01', conta: 'Montepio', categoria: 'Combustivel' },
  { id: 'mv-mar-2', nome: 'Via Verde', valor: 2.35, data: '2026-03-02', conta: 'Montepio', categoria: 'Transporte' },
  { id: 'mv-mar-3', nome: 'Compra Mercadona', valor: 12.99, data: '2026-03-02', conta: 'Montepio', categoria: 'Supermercado' },
  { id: 'mv-mar-4', nome: 'Água SMEAS', valor: 35.38, data: '2026-03-03', conta: 'Montepio', categoria: 'Casa' },
  { id: 'mv-mar-5', nome: 'Compra Mercadona', valor: 12.85, data: '2026-03-04', conta: 'Montepio', categoria: 'Supermercado' },
  { id: 'mv-mar-6', nome: 'Resultados com Charme', valor: 7.10, data: '2026-03-05', conta: 'Montepio', categoria: 'Restaurantes' },
  { id: 'mv-mar-7', nome: 'Via Verde', valor: 2.20, data: '2026-03-06', conta: 'Montepio', categoria: 'Transporte' },
  { id: 'mv-mar-8', nome: 'Jogos Santa Casa', valor: 10.00, data: '2026-03-06', conta: 'Montepio', categoria: 'Diversos' },
  { id: 'mv-mar-9', nome: 'Compra Mercadona', valor: 49.04, data: '2026-03-06', conta: 'Montepio', categoria: 'Supermercado' },
  { id: 'mv-mar-10', nome: 'Solução MS', valor: 3.00, data: '2026-03-07', conta: 'Montepio', categoria: 'Taxas' },
  { id: 'mv-mar-11', nome: 'Comissão Manutenção', valor: 0.12, data: '2026-03-07', conta: 'Montepio', categoria: 'Taxas' },
  { id: 'mv-mar-12', nome: 'Compra Aldi', valor: 33.53, data: '2026-03-07', conta: 'Montepio', categoria: 'Supermercado' },
  { id: 'mv-mar-13', nome: 'Via Verde', valor: 1.20, data: '2026-03-09', conta: 'Montepio', categoria: 'Transporte' },
  { id: 'mv-mar-14', nome: 'Compra Zumub', valor: 31.64, data: '2026-03-09', conta: 'Montepio', categoria: 'Diversos' },
  { id: 'mv-mar-15', nome: 'Compra Repsol', valor: 25.00, data: '2026-03-09', conta: 'Montepio', categoria: 'Combustivel' },
  { id: 'mv-mar-16', nome: 'Compra Wells', valor: 7.54, data: '2026-03-09', conta: 'Montepio', categoria: 'Shopping' },
  { id: 'mv-mar-17', nome: 'Compra Continente', valor: 12.64, data: '2026-03-09', conta: 'Montepio', categoria: 'Supermercado' },
  { id: 'mv-mar-18', nome: 'Levantamento', valor: 20.00, data: '2026-03-10', conta: 'Montepio', categoria: 'Diversos' },
  { id: 'mv-mar-19', nome: 'Compra Mercadona', valor: 32.81, data: '2026-03-11', conta: 'Montepio', categoria: 'Supermercado' },
  { id: 'mv-mar-20', nome: 'Compra Continente', valor: 4.85, data: '2026-03-12', conta: 'Montepio', categoria: 'Supermercado' },
  { id: 'mv-mar-21', nome: 'Compra Continente', valor: 6.54, data: '2026-03-12', conta: 'Montepio', categoria: 'Supermercado' },
  { id: 'mv-mar-22', nome: 'SU Eletricidade', valor: 56.07, data: '2026-03-14', conta: 'Montepio', categoria: 'Casa' },
  { id: 'mv-mar-23', nome: 'Auchan Energy', valor: 25.00, data: '2026-03-14', conta: 'Montepio', categoria: 'Combustivel' },
  { id: 'mv-mar-24', nome: 'Loja Chinês', valor: 6.78, data: '2026-03-15', conta: 'Montepio', categoria: 'Shopping' },
  { id: 'mv-mar-25', nome: 'Via Verde', valor: 1.20, data: '2026-03-16', conta: 'Montepio', categoria: 'Transporte' },
  { id: 'mv-mar-26', nome: 'Transferência', valor: 300.00, data: '2026-03-16', conta: 'Montepio', categoria: 'Transferência' },
  { id: 'mv-mar-27', nome: 'Resultados com Charme', valor: 21.90, data: '2026-03-17', conta: 'Montepio', categoria: 'Restaurantes' },
  { id: 'mv-mar-28', nome: 'Compra Repsol', valor: 12.00, data: '2026-03-17', conta: 'Montepio', categoria: 'Combustivel' },
  { id: 'mv-mar-29', nome: 'Compra Continente', valor: 28.92, data: '2026-03-17', conta: 'Montepio', categoria: 'Supermercado' },
  { id: 'mv-mar-30', nome: 'Levantamento', valor: 50.00, data: '2026-03-18', conta: 'Montepio', categoria: 'Diversos' },
  { id: 'mv-mar-31', nome: 'Compra Mercadona', valor: 41.92, data: '2026-03-18', conta: 'Montepio', categoria: 'Supermercado' },
  { id: 'mv-mar-32', nome: 'Compra Aliexpress', valor: 9.15, data: '2026-03-18', conta: 'Montepio', categoria: 'Shopping' },
  { id: 'mv-mar-33', nome: 'Compra Mercadona', valor: 10.02, data: '2026-03-19', conta: 'Montepio', categoria: 'Supermercado' },
  { id: 'mv-mar-34', nome: 'Canva Software', valor: 1.89, data: '2026-03-21', conta: 'Montepio', categoria: 'Diversos' },
  { id: 'mv-mar-35', nome: 'Comissão', valor: 0.07, data: '2026-03-21', conta: 'Montepio', categoria: 'Taxas' },
  { id: 'mv-mar-36', nome: 'Compra Aliexpress', valor: 22.23, data: '2026-03-21', conta: 'Montepio', categoria: 'Shopping' },
  { id: 'mv-mar-37', nome: 'AS Parque Real', valor: 10.14, data: '2026-03-21', conta: 'Montepio', categoria: 'Transporte' },
  { id: 'mv-mar-38', nome: 'Auchan Energy', valor: 35.00, data: '2026-03-21', conta: 'Montepio', categoria: 'Combustivel' },
  { id: 'mv-mar-39', nome: 'Compra Continente', valor: 12.97, data: '2026-03-21', conta: 'Montepio', categoria: 'Supermercado' },
  { id: 'mv-mar-40', nome: 'Água SMEAS', valor: 36.86, data: '2026-03-22', conta: 'Montepio', categoria: 'Casa' },
  { id: 'mv-mar-41', nome: 'Compra lanche', valor: 4.00, data: '2026-03-22', conta: 'Montepio', categoria: 'Diversos' },
  { id: 'mv-mar-42', nome: 'Compra Auchan', valor: 34.06, data: '2026-03-22', conta: 'Montepio', categoria: 'Supermercado' },
  { id: 'mv-mar-43', nome: 'Via Verde', valor: 2.65, data: '2026-03-23', conta: 'Montepio', categoria: 'Transporte' },
  { id: 'mv-mar-44', nome: 'Compra Mercadona', valor: 18.40, data: '2026-03-23', conta: 'Montepio', categoria: 'Supermercado' },
  { id: 'mv-mar-45', nome: 'Estacionamento', valor: 0.20, data: '2026-03-24', conta: 'Montepio', categoria: 'Transporte' },
  { id: 'mv-mar-46', nome: 'Estacionamento', valor: 0.80, data: '2026-03-24', conta: 'Montepio', categoria: 'Transporte' },
  { id: 'mv-mar-47', nome: 'Lanche', valor: 4.80, data: '2026-03-24', conta: 'Montepio', categoria: 'Diversos' },
  { id: 'mv-mar-48', nome: 'Compra Mercadona', valor: 36.16, data: '2026-03-25', conta: 'Montepio', categoria: 'Supermercado' },
  { id: 'mv-mar-49', nome: 'Auchan Energy', valor: 25.00, data: '2026-03-25', conta: 'Montepio', categoria: 'Combustivel' },
  { id: 'mv-mar-50', nome: 'Compra online', valor: 7.50, data: '2026-03-26', conta: 'Montepio', categoria: 'Shopping' },
  { id: 'mv-mar-51', nome: 'Compra Mercadona', valor: 13.19, data: '2026-03-26', conta: 'Montepio', categoria: 'Supermercado' },
  { id: 'mv-mar-52', nome: 'Compra AMRAP', valor: 5.00, data: '2026-03-28', conta: 'Montepio', categoria: 'Diversos' },
  { id: 'mv-mar-53', nome: 'Café', valor: 1.00, data: '2026-03-28', conta: 'Montepio', categoria: 'Diversos' },
  { id: 'mv-mar-54', nome: 'Resultados com Charme', valor: 12.50, data: '2026-03-28', conta: 'Montepio', categoria: 'Restaurantes' },
  { id: 'mv-mar-55', nome: 'Resultados com Charme', valor: 10.00, data: '2026-03-28', conta: 'Montepio', categoria: 'Restaurantes' },
  { id: 'mv-mar-56', nome: 'Compra Continente', valor: 86.47, data: '2026-03-29', conta: 'Montepio', categoria: 'Supermercado' },
  { id: 'mv-mar-57', nome: 'Pagamento Liliana', valor: 35.00, data: '2026-03-30', conta: 'Montepio', categoria: 'Pessoal' },
  { id: 'mv-mar-58', nome: 'Taxas', valor: 0.07, data: '2026-03-30', conta: 'Montepio', categoria: 'Taxas' },
  { id: 'mv-mar-59', nome: 'Compra Café', valor: 12.49, data: '2026-03-30', conta: 'Montepio', categoria: 'Supermercado' },
  { id: 'mv-mar-60', nome: 'Estacionamento', valor: 5.00, data: '2026-03-30', conta: 'Montepio', categoria: 'Transporte' },
  { id: 'mv-mar-61', nome: 'Repsol', valor: 25.00, data: '2026-03-31', conta: 'Montepio', categoria: 'Combustivel' },
  { id: 'mv-mar-62', nome: 'Lanche', valor: 4.10, data: '2026-03-31', conta: 'Montepio', categoria: 'Diversos' },

  // Revolut Variable Expenses - Março 2026
  { id: 'rv-mar-1', nome: 'Semanada Gonçalo', valor: 5, data: '2026-03-29', conta: 'Revolut', categoria: 'Pessoal' },
  { id: 'rv-mar-2', nome: 'Sorteio Valverde', valor: 12, data: '2026-03-25', conta: 'Revolut', categoria: 'Pessoal' },
  { id: 'rv-mar-3', nome: 'Semanada Gonçalo', valor: 5, data: '2026-03-22', conta: 'Revolut', categoria: 'Pessoal' },
  { id: 'rv-mar-4', nome: 'Crossfit Valverde', valor: 59, data: '2026-03-18', conta: 'Revolut', categoria: 'Lazer' },
  { id: 'rv-mar-5', nome: 'Transferência', valor: -300, data: '2026-03-16', conta: 'Revolut', categoria: 'Transferência' },
  { id: 'rv-mar-6', nome: 'Trading212', valor: 200, data: '2026-03-16', conta: 'Revolut', categoria: 'Investimento' },
  { id: 'rv-mar-7', nome: 'Semanada Gonçalo', valor: 5, data: '2026-03-15', conta: 'Revolut', categoria: 'Pessoal' },
  { id: 'rv-mar-8', nome: 'Semanada Gonçalo', valor: 5, data: '2026-03-08', conta: 'Revolut', categoria: 'Pessoal' },
  { id: 'rv-mar-9', nome: 'Investimento', valor: 43.40, data: '2026-03-03', conta: 'Revolut', categoria: 'Investimento' },
  { id: 'rv-mar-10', nome: 'Robo Advisor', valor: 100, data: '2026-03-02', conta: 'Revolut', categoria: 'Investimento' },
  { id: 'rv-mar-11', nome: 'Semanada Gonçalo', valor: 5, data: '2026-03-01', conta: 'Revolut', categoria: 'Pessoal' },

  // Montepio Transactions - Fevereiro 2026
  { id: 'm-feb-1', nome: 'Dívida Finanças', valor: 58.92, data: '2026-02-02', conta: 'Montepio', categoria: 'Dívida' },
  { id: 'm-feb-2', nome: 'CC Cetelem', valor: 62.50, data: '2026-02-02', conta: 'Montepio', categoria: 'Dívida' },
  { id: 'm-feb-3', nome: 'Crédito Cetelem', valor: 40.44, data: '2026-02-02', conta: 'Montepio', categoria: 'Dívida' },
  { id: 'm-feb-4', nome: 'Crédito Lentes', valor: 59.33, data: '2026-02-06', conta: 'Montepio', categoria: 'Dívida' },
  { id: 'm-feb-5', nome: 'CC Montepio', valor: 40.48, data: '2026-02-07', conta: 'Montepio', categoria: 'Dívida' },
  { id: 'm-feb-6', nome: 'Dívida Seg. Social', valor: 26.68, data: '2026-02-20', conta: 'Montepio', categoria: 'Dívida' },
  { id: 'm-feb-7', nome: 'Credito Automóvel', valor: 224.99, data: '2026-02-24', conta: 'Montepio', categoria: 'Dívida' },

  // Montepio Variable Expenses - Fevereiro 2026
  { id: 'v-feb-1', nome: 'Pastelaria', valor: 6.29, data: '2026-02-01', conta: 'Montepio', categoria: 'Diversos' },
  { id: 'v-feb-2', nome: 'Pastelaria', valor: 20.60, data: '2026-02-01', conta: 'Montepio', categoria: 'Diversos' },
  { id: 'v-feb-3', nome: 'Via Verde', valor: 1.20, data: '2026-02-02', conta: 'Montepio', categoria: 'Transporte' },
  { id: 'v-feb-4', nome: 'UCI Cinemas', valor: 19.32, data: '2026-02-02', conta: 'Montepio', categoria: 'Lazer' },
  { id: 'v-feb-5', nome: 'SMEAS Água', valor: 37.09, data: '2026-02-02', conta: 'Montepio', categoria: 'Casa' },
  { id: 'v-feb-6', nome: 'Auchan Energy', valor: 25.00, data: '2026-02-03', conta: 'Montepio', categoria: 'Combustivel' },
  { id: 'v-feb-7', nome: 'Compra Mercadona', valor: 49.18, data: '2026-02-03', conta: 'Montepio', categoria: 'Supermercado' },
  { id: 'v-feb-8', nome: 'Transf. Montepio > Revolut', valor: 500.00, data: '2026-02-04', conta: 'Montepio', categoria: 'Transferência' },
  { id: 'v-feb-9', nome: 'Transf. Montepio > Revolut', valor: 500.00, data: '2026-02-04', conta: 'Montepio', categoria: 'Transferência' },
  { id: 'v-feb-10', nome: 'Transf. Montepio > Revolut', valor: 500.00, data: '2026-02-04', conta: 'Montepio', categoria: 'Transferência' },
  { id: 'v-feb-11', nome: 'Ebay', valor: 0.01, data: '2026-02-05', conta: 'Montepio', categoria: 'Taxas' },
  { id: 'v-feb-12', nome: 'Pastelaria', valor: 1.70, data: '2026-02-06', conta: 'Montepio', categoria: 'Diversos' },
  { id: 'v-feb-13', nome: 'Crossfit Open', valor: 12.95, data: '2026-02-07', conta: 'Montepio', categoria: 'Lazer' },
  { id: 'v-feb-14', nome: 'Comissão', valor: 0.49, data: '2026-02-07', conta: 'Montepio', categoria: 'Taxas' },
  { id: 'v-feb-15', nome: 'Imposto Selo', valor: 0.02, data: '2026-02-07', conta: 'Montepio', categoria: 'Taxas' },
  { id: 'v-feb-16', nome: 'Padel Lovers', valor: 6.00, data: '2026-02-07', conta: 'Montepio', categoria: 'Lazer' },
  { id: 'v-feb-17', nome: 'Solução MS', valor: 3.00, data: '2026-02-07', conta: 'Montepio', categoria: 'Taxas' },
  { id: 'v-feb-18', nome: 'Comissão Manutenção', valor: 0.12, data: '2026-02-07', conta: 'Montepio', categoria: 'Taxas' },
  { id: 'v-feb-19', nome: 'Lavagem Carro', valor: 4.80, data: '2026-02-08', conta: 'Montepio', categoria: 'Transporte' },
  { id: 'v-feb-20', nome: 'Via Verde', valor: 4.75, data: '2026-02-09', conta: 'Montepio', categoria: 'Transporte' },
  { id: 'v-feb-21', nome: 'Compra Paypayue', valor: 0.20, data: '2026-02-09', conta: 'Montepio', categoria: 'Taxas' },
  { id: 'v-feb-22', nome: 'Confeitaria Duquesa', valor: 5.75, data: '2026-02-09', conta: 'Montepio', categoria: 'Diversos' },
  { id: 'v-feb-23', nome: 'Compra Mercadona', valor: 63.67, data: '2026-02-09', conta: 'Montepio', categoria: 'Supermercado' },
  { id: 'v-feb-24', nome: 'SU eletricidade', valor: 59.27, data: '2026-02-10', conta: 'Montepio', categoria: 'Casa' },
  { id: 'v-feb-25', nome: 'Transferência', valor: 120.00, data: '2026-02-10', conta: 'Montepio', categoria: 'Diversos' },
  { id: 'v-feb-26', nome: 'Comissão', valor: 0.24, data: '2026-02-10', conta: 'Montepio', categoria: 'Taxas' },
  { id: 'v-feb-27', nome: 'Imposto Selo', valor: 0.01, data: '2026-02-10', conta: 'Montepio', categoria: 'Taxas' },
  { id: 'v-feb-28', nome: 'Compra Mercadona', valor: 13.21, data: '2026-02-10', conta: 'Montepio', categoria: 'Supermercado' },
  { id: 'v-feb-29', nome: 'Auchan Energy', valor: 25.00, data: '2026-02-12', conta: 'Montepio', categoria: 'Combustivel' },
  { id: 'v-feb-30', nome: 'Compra Betclic', valor: 10.00, data: '2026-02-13', conta: 'Montepio', categoria: 'Lazer' },
  { id: 'v-feb-31', nome: 'Compra Mercadona', valor: 49.23, data: '2026-02-13', conta: 'Montepio', categoria: 'Supermercado' },
  { id: 'v-feb-32', nome: 'AS Parque Real', valor: 4.95, data: '2026-02-14', conta: 'Montepio', categoria: 'Transporte' },
  { id: 'v-feb-33', nome: 'Compra Continente', valor: 34.69, data: '2026-02-14', conta: 'Montepio', categoria: 'Supermercado' },
  { id: 'v-feb-34', nome: 'Via Verde', valor: 1.05, data: '2026-02-16', conta: 'Montepio', categoria: 'Transporte' },
  { id: 'v-feb-35', nome: 'Canva Software', valor: 6.00, data: '2026-02-16', conta: 'Montepio', categoria: 'Pessoal' },
  { id: 'v-feb-36', nome: 'Comissão', valor: 0.23, data: '2026-02-16', conta: 'Montepio', categoria: 'Taxas' },
  { id: 'v-feb-37', nome: 'Imposto Selo', valor: 0.01, data: '2026-02-16', conta: 'Montepio', categoria: 'Taxas' },
  { id: 'v-feb-38', nome: 'City Wok 2', valor: 34.10, data: '2026-02-16', conta: 'Montepio', categoria: 'Restaurantes' },
  { id: 'v-feb-39', nome: 'Worten', valor: 25.99, data: '2026-02-16', conta: 'Montepio', categoria: 'Shopping' },
  { id: 'v-feb-40', nome: 'Playstation', valor: 8.99, data: '2026-02-17', conta: 'Montepio', categoria: 'Lazer' },
  { id: 'v-feb-41', nome: 'Espelho Gaúcho', valor: 20.96, data: '2026-02-17', conta: 'Montepio', categoria: 'Restaurantes' },
  { id: 'v-feb-42', nome: 'Compra Continente', valor: 13.26, data: '2026-02-17', conta: 'Montepio', categoria: 'Supermercado' },
  { id: 'v-feb-43', nome: 'Compra Wells', valor: 11.30, data: '2026-02-17', conta: 'Montepio', categoria: 'Saúde' },
  { id: 'v-feb-44', nome: 'Auchan Energy', valor: 20.00, data: '2026-02-17', conta: 'Montepio', categoria: 'Combustivel' },
  { id: 'v-feb-45', nome: 'Compra Mercadona', valor: 21.25, data: '2026-02-18', conta: 'Montepio', categoria: 'Supermercado' },
  { id: 'v-feb-46', nome: 'Via Verde', valor: 0.15, data: '2026-02-19', conta: 'Montepio', categoria: 'Transporte' },
  { id: 'v-feb-47', nome: 'Compra Mercadona', valor: 42.21, data: '2026-02-20', conta: 'Montepio', categoria: 'Supermercado' },
  { id: 'v-feb-48', nome: 'Mix Pão', valor: 11.20, data: '2026-02-21', conta: 'Montepio', categoria: 'Diversos' },
  { id: 'v-feb-49', nome: 'Maia Vivaci', valor: 7.19, data: '2026-02-21', conta: 'Montepio', categoria: 'Diversos' },
  { id: 'v-feb-50', nome: 'Compra Mercadona', valor: 49.61, data: '2026-02-22', conta: 'Montepio', categoria: 'Supermercado' },
  { id: 'v-feb-51', nome: 'Auchan Energy', valor: 20.00, data: '2026-02-22', conta: 'Montepio', categoria: 'Combustivel' },
  { id: 'v-feb-52', nome: 'Via Verde', valor: 3.10, data: '2026-02-23', conta: 'Montepio', categoria: 'Transporte' },
  { id: 'v-feb-53', nome: 'ULS Gaia Espinho', valor: 1.50, data: '2026-02-23', conta: 'Montepio', categoria: 'Transporte' },
  { id: 'v-feb-54', nome: 'CTT', valor: 7.80, data: '2026-02-23', conta: 'Montepio', categoria: 'Diversos' },
  { id: 'v-feb-55', nome: 'Jogos Santa Casa', valor: 10.00, data: '2026-02-24', conta: 'Montepio', categoria: 'Lazer' },
  { id: 'v-feb-56', nome: 'Compra Mercadona', valor: 29.95, data: '2026-02-25', conta: 'Montepio', categoria: 'Supermercado' },
  { id: 'v-feb-57', nome: 'Transf. Montepio > Revolut', valor: 1000.00, data: '2026-02-27', conta: 'Montepio', categoria: 'Transferência' },
  { id: 'v-feb-58', nome: 'Transf. Montepio > Revolut', valor: 1000.00, data: '2026-02-27', conta: 'Montepio', categoria: 'Transferência' },
  { id: 'v-feb-59', nome: 'Compra Mercadona', valor: 49.63, data: '2026-02-27', conta: 'Montepio', categoria: 'Supermercado' },

  // Montepio Transactions - Janeiro 2026
  { id: 'm-jan-1', nome: 'CC Cetelem', valor: 62.50, data: '2026-01-02', conta: 'Montepio', categoria: 'Dívida' },
  { id: 'm-jan-2', nome: 'Crédito Cetelem', valor: 40.44, data: '2026-01-02', conta: 'Montepio', categoria: 'Dívida' },
  { id: 'm-jan-3', nome: 'Crédito Lentes', valor: 59.33, data: '2026-01-06', conta: 'Montepio', categoria: 'Dívida' },
  { id: 'm-jan-4', nome: 'CC Montepio', valor: 42.49, data: '2026-01-07', conta: 'Montepio', categoria: 'Dívida' },
  { id: 'm-jan-5', nome: 'Dívida Seg. Social', valor: 26.60, data: '2026-01-20', conta: 'Montepio', categoria: 'Dívida' },
  { id: 'm-jan-6', nome: 'Credito Automóvel', valor: 224.99, data: '2026-01-26', conta: 'Montepio', categoria: 'Dívida' },

  // Montepio Variable Expenses - Janeiro 2026
  { id: 'v-jan-1', nome: 'Via Verde', valor: 24.25, data: '2026-01-02', conta: 'Montepio', categoria: 'Transporte' },
  { id: 'v-jan-2', nome: 'Transf. Montepio > Revolut', valor: 120.00, data: '2026-01-02', conta: 'Montepio', categoria: 'Transferência' },
  { id: 'v-jan-3', nome: 'Compra Preço Louco', valor: 12.49, data: '2026-01-03', conta: 'Montepio', categoria: 'Supermercado' },
  { id: 'v-jan-4', nome: 'Compra Repsol', valor: 24.26, data: '2026-01-03', conta: 'Montepio', categoria: 'Combustivel' },
  { id: 'v-jan-5', nome: 'Compra Aldi', valor: 13.93, data: '2026-01-03', conta: 'Montepio', categoria: 'Supermercado' },
  { id: 'v-jan-6', nome: 'McDonald\'s', valor: 15.00, data: '2026-01-03', conta: 'Montepio', categoria: 'Restaurantes' },
  { id: 'v-jan-7', nome: 'UCI Cinemas', valor: 22.20, data: '2026-01-05', conta: 'Montepio', categoria: 'Lazer' },
  { id: 'v-jan-8', nome: 'Taxa Moderadora', valor: 1.25, data: '2026-01-05', conta: 'Montepio', categoria: 'Saúde' },
  { id: 'v-jan-9', nome: 'Compra Mercadona', valor: 49.46, data: '2026-01-06', conta: 'Montepio', categoria: 'Supermercado' },
  { id: 'v-jan-10', nome: 'Solução MS', valor: 3.00, data: '2026-01-07', conta: 'Montepio', categoria: 'Taxas' },
  { id: 'v-jan-11', nome: 'Comissão Manutenção', valor: 0.12, data: '2026-01-07', conta: 'Montepio', categoria: 'Taxas' },
  { id: 'v-jan-12', nome: 'Via Verde', valor: 5.65, data: '2026-01-08', conta: 'Montepio', categoria: 'Transporte' },
  { id: 'v-jan-13', nome: 'Auchan Energy', valor: 34.18, data: '2026-01-08', conta: 'Montepio', categoria: 'Combustivel' },
  { id: 'v-jan-14', nome: 'Compra Nata Lisboa', valor: 2.50, data: '2026-01-08', conta: 'Montepio', categoria: 'Diversos' },
  { id: 'v-jan-15', nome: 'Compra Aldi', valor: 14.17, data: '2026-01-09', conta: 'Montepio', categoria: 'Supermercado' },
  { id: 'v-jan-16', nome: 'AS Parque Real', valor: 3.19, data: '2026-01-10', conta: 'Montepio', categoria: 'Transporte' },
  { id: 'v-jan-17', nome: 'McDonald\'s', valor: 20.55, data: '2026-01-11', conta: 'Montepio', categoria: 'Restaurantes' },
  { id: 'v-jan-18', nome: 'Taxa Moderadora', valor: 0.50, data: '2026-01-12', conta: 'Montepio', categoria: 'Saúde' },
  { id: 'v-jan-19', nome: 'Compra Mercadona', valor: 54.36, data: '2026-01-12', conta: 'Montepio', categoria: 'Supermercado' },
  { id: 'v-jan-20', nome: 'Jogos Santa Casa', valor: 10.00, data: '2026-01-14', conta: 'Montepio', categoria: 'Lazer' },
  { id: 'v-jan-21', nome: 'Compra Mercadona', valor: 38.97, data: '2026-01-14', conta: 'Montepio', categoria: 'Supermercado' },
  { id: 'v-jan-22', nome: 'Compra Mercadona', valor: 18.10, data: '2026-01-15', conta: 'Montepio', categoria: 'Supermercado' },
  { id: 'v-jan-23', nome: 'Transferência', valor: 16.70, data: '2026-01-15', conta: 'Montepio', categoria: 'Diversos' },
  { id: 'v-jan-24', nome: 'Via Verde', valor: 0.90, data: '2026-01-16', conta: 'Montepio', categoria: 'Transporte' },
  { id: 'v-jan-25', nome: 'Trading 212', valor: 150.00, data: '2026-01-16', conta: 'Montepio', categoria: 'Investimento' },
  { id: 'v-jan-26', nome: 'Compra Aldi', valor: 32.75, data: '2026-01-16', conta: 'Montepio', categoria: 'Supermercado' },
  { id: 'v-jan-27', nome: 'Canva Software', valor: 6.00, data: '2026-01-17', conta: 'Montepio', categoria: 'Diversos' },
  { id: 'v-jan-28', nome: 'Comissão', valor: 0.23, data: '2026-01-17', conta: 'Montepio', categoria: 'Taxas' },
  { id: 'v-jan-29', nome: 'Imposto Selo', valor: 0.01, data: '2026-01-17', conta: 'Montepio', categoria: 'Taxas' },
  { id: 'v-jan-30', nome: 'Auchan Energy', valor: 25.00, data: '2026-01-18', conta: 'Montepio', categoria: 'Combustivel' },
  { id: 'v-jan-31', nome: 'Restaurante', valor: 52.00, data: '2026-01-18', conta: 'Montepio', categoria: 'Restaurantes' },
  { id: 'v-jan-32', nome: 'Klarna', valor: 25.33, data: '2026-01-19', conta: 'Montepio', categoria: 'Shopping' },
  { id: 'v-jan-33', nome: 'Compra Ikea', valor: 3.29, data: '2026-01-19', conta: 'Montepio', categoria: 'Restaurantes' },
  { id: 'v-jan-34', nome: 'Taxa Moderadora', valor: 0.50, data: '2026-01-19', conta: 'Montepio', categoria: 'Saúde' },
  { id: 'v-jan-35', nome: 'Comissão', valor: 0.12, data: '2026-01-19', conta: 'Montepio', categoria: 'Taxas' },
  { id: 'v-jan-36', nome: 'Levantamento', valor: 20.00, data: '2026-01-20', conta: 'Montepio', categoria: 'Diversos' },
  { id: 'v-jan-37', nome: 'Auchan Energy', valor: 25.00, data: '2026-01-20', conta: 'Montepio', categoria: 'Combustivel' },
  { id: 'v-jan-38', nome: 'Compra Aldi', valor: 11.72, data: '2026-01-20', conta: 'Montepio', categoria: 'Supermercado' },
  { id: 'v-jan-39', nome: 'Padel Lovers', valor: 6.00, data: '2026-01-21', conta: 'Montepio', categoria: 'Lazer' },
  { id: 'v-jan-40', nome: 'Transferência', valor: 29.80, data: '2026-01-21', conta: 'Montepio', categoria: 'Diversos' },
  { id: 'v-jan-41', nome: 'Trading 212', valor: 50.00, data: '2026-01-22', conta: 'Montepio', categoria: 'Investimento' },
  { id: 'v-jan-42', nome: 'Compra Mercadona', valor: 43.38, data: '2026-01-22', conta: 'Montepio', categoria: 'Supermercado' },
  { id: 'v-jan-43', nome: 'Via Verde', valor: 6.15, data: '2026-01-23', conta: 'Montepio', categoria: 'Transporte' },
  { id: 'v-jan-44', nome: 'Compra Mercadona', valor: 9.92, data: '2026-01-24', conta: 'Montepio', categoria: 'Supermercado' },
  { id: 'v-jan-45', nome: 'Compra Preço Louco', valor: 12.49, data: '2026-01-24', conta: 'Montepio', categoria: 'Supermercado' },
  { id: 'v-jan-46', nome: 'Via Verde', valor: 9.70, data: '2026-01-25', conta: 'Montepio', categoria: 'Transporte' },
  { id: 'v-jan-47', nome: 'Compra Zumub', valor: 11.58, data: '2026-01-27', conta: 'Montepio', categoria: 'Shopping' },
  { id: 'v-jan-48', nome: 'Compra Mercadona', valor: 26.59, data: '2026-01-27', conta: 'Montepio', categoria: 'Supermercado' },
  { id: 'v-jan-49', nome: 'Compra Aldi', valor: 20.60, data: '2026-01-27', conta: 'Montepio', categoria: 'Supermercado' },
  { id: 'v-jan-50', nome: 'Padel Lovers', valor: 6.00, data: '2026-01-28', conta: 'Montepio', categoria: 'Lazer' },
  { id: 'v-jan-51', nome: 'UBER', valor: 4.94, data: '2026-01-29', conta: 'Montepio', categoria: 'Transporte' },
  { id: 'v-jan-52', nome: 'Compra Temu', valor: 32.50, data: '2026-01-29', conta: 'Montepio', categoria: 'Shopping' },
  { id: 'v-jan-53', nome: 'Auchan Energy', valor: 25.00, data: '2026-01-29', conta: 'Montepio', categoria: 'Combustivel' },
  { id: 'v-jan-54', nome: 'McDonald\'s', valor: 9.70, data: '2026-01-29', conta: 'Montepio', categoria: 'Restaurantes' },
  { id: 'v-jan-55', nome: 'McDonald\'s', valor: 12.65, data: '2026-01-30', conta: 'Montepio', categoria: 'Restaurantes' },
  { id: 'v-jan-56', nome: 'Compra Aldi', valor: 16.38, data: '2026-01-30', conta: 'Montepio', categoria: 'Supermercado' },
  { id: 'v-jan-57', nome: 'UBER', valor: 3.95, data: '2026-01-31', conta: 'Montepio', categoria: 'Transporte' },
  { id: 'v-jan-58', nome: 'Trofa Saúde', valor: 27.08, data: '2026-01-31', conta: 'Montepio', categoria: 'Saúde' },
  { id: 'v-jan-59', nome: 'Confeitaria', valor: 6.60, data: '2026-01-31', conta: 'Montepio', categoria: 'Diversos' },
  { id: 'v-jan-60', nome: 'FNAC', valor: 132.00, data: '2026-01-31', conta: 'Montepio', categoria: 'Lazer' },

  // Revolut Transactions - Março 2026
  { id: '101', nome: 'Crossfit Valverde', valor: 59, data: '2026-03-22', conta: 'Revolut', categoria: 'Lazer' },
  { id: 'f-rev-mar-1', nome: 'Semanada Gonçalo', valor: 5, data: '2026-03-22', conta: 'Revolut', categoria: 'Fixa' },
  { id: 'f-rev-mar-2', nome: 'Semanada Gonçalo', valor: 5, data: '2026-03-15', conta: 'Revolut', categoria: 'Fixa' },
  { id: 'f-rev-mar-3', nome: 'Semanada Gonçalo', valor: 5, data: '2026-03-08', conta: 'Revolut', categoria: 'Fixa' },
  
  // Revolut Transactions - Fevereiro 2026
  { id: '111', nome: 'Semanada Gonçalo', valor: 5, data: '2026-02-22', conta: 'Revolut', categoria: 'Pessoal' },
  { id: '112', nome: 'Crossfit Valverde', valor: 59, data: '2026-02-19', conta: 'Revolut', categoria: 'Lazer' },
  { id: '113', nome: 'Semanada Gonçalo', valor: 5, data: '2026-02-15', conta: 'Revolut', categoria: 'Pessoal' },
  { id: '114', nome: 'Trading212', valor: 100, data: '2026-02-10', conta: 'Revolut', categoria: 'Investimento' },
  { id: '115', nome: 'Trading212', valor: 100, data: '2026-02-09', conta: 'Revolut', categoria: 'Investimento' },
  { id: '116', nome: 'Trading212', valor: 100, data: '2026-02-08', conta: 'Revolut', categoria: 'Investimento' },
  { id: '117', nome: 'XTB', valor: 200, data: '2026-02-08', conta: 'Revolut', categoria: 'Investimento' },
  { id: '118', nome: 'Semanada Gonçalo', valor: 5, data: '2026-02-08', conta: 'Revolut', categoria: 'Pessoal' },
  { id: '119', nome: 'XTB', valor: 200, data: '2026-02-04', conta: 'Revolut', categoria: 'Investimento' },
  { id: '120', nome: 'XTB', valor: 100, data: '2026-02-04', conta: 'Revolut', categoria: 'Investimento' },
  { id: '124', nome: 'Trading212', valor: 100, data: '2026-02-04', conta: 'Revolut', categoria: 'Investimento' },
  { id: '125', nome: 'Semanada Gonçalo', valor: 5, data: '2026-02-01', conta: 'Revolut', categoria: 'Pessoal' },

  // Revolut Transactions - Janeiro 2026
  { id: '126', nome: 'Semanada Gonçalo', valor: 5, data: '2026-01-25', conta: 'Revolut', categoria: 'Pessoal' },
  { id: '127', nome: 'Semanada Gonçalo', valor: 5, data: '2026-01-18', conta: 'Revolut', categoria: 'Pessoal' },
  { id: '128', nome: 'Semanada Gonçalo', valor: 5, data: '2026-01-11', conta: 'Revolut', categoria: 'Pessoal' },
  { id: '129', nome: 'Semanada Gonçalo', valor: 5, data: '2026-01-04', conta: 'Revolut', categoria: 'Pessoal' },
  { id: '130', nome: 'Robo Advisor', valor: 100, data: '2026-01-02', conta: 'Revolut', categoria: 'Investimento' },
];

const initialIncome: Income[] = [
  // Valor Transportado
  { id: 'inc-0', nome: 'Valor transportado Dez 2025', valor: 1104.54, frequencia: 'unico', data: 1, data_especifica: '2026-01-01', conta: 'Montepio' },
  
  // Janeiro 2026
  { id: 'inc-jan-1', nome: 'Clinica [CSA]', valor: 700, frequencia: 'unico', data: 7, data_especifica: '2026-01-07', conta: 'Montepio' },
  { id: 'inc-jan-2', nome: 'amo.CLINICS', valor: 300, frequencia: 'unico', data: 13, data_especifica: '2026-01-13', conta: 'Montepio' },
  { id: 'inc-jan-3', nome: 'Subsidio Desemprego', valor: 1173.51, frequencia: 'unico', data: 28, data_especifica: '2026-01-28', conta: 'Montepio' },
  { id: 'inc-jan-4', nome: 'Depósito Cheque', valor: 2115.72, frequencia: 'unico', data: 30, data_especifica: '2026-01-30', conta: 'Montepio' },
  { id: 'inc-jan-5', nome: 'Venda CEX', valor: 78.42, frequencia: 'unico', data: 30, data_especifica: '2026-01-30', conta: 'Montepio' },
  { id: 'inc-jan-6', nome: 'Venda CEX', valor: 72.11, frequencia: 'unico', data: 30, data_especifica: '2026-01-30', conta: 'Montepio' },

  // Fevereiro 2026
  { id: 'inc-feb-1', nome: 'Venda CEX', valor: 38.00, frequencia: 'unico', data: 1, data_especifica: '2026-02-01', conta: 'Montepio' },
  { id: 'inc-feb-2', nome: 'Ebay', valor: 0.01, frequencia: 'unico', data: 2, data_especifica: '2026-02-02', conta: 'Montepio' },
  { id: 'inc-feb-3', nome: 'Clínica [CSA]', valor: 700, frequencia: 'unico', data: 4, data_especifica: '2026-02-04', conta: 'Montepio' },
  { id: 'inc-feb-4', nome: 'Depósito Cash', valor: 90, frequencia: 'unico', data: 5, data_especifica: '2026-02-05', conta: 'Montepio' },
  { id: 'inc-feb-5', nome: 'amo.CLINICS', valor: 300, frequencia: 'unico', data: 9, data_especifica: '2026-02-09', conta: 'Montepio' },
  { id: 'inc-feb-6', nome: 'Venda CEX', valor: 57, frequencia: 'unico', data: 21, data_especifica: '2026-02-21', conta: 'Montepio' },
  { id: 'inc-feb-7', nome: 'Las Muns', valor: 600, frequencia: 'unico', data: 23, data_especifica: '2026-02-23', conta: 'Montepio' },
  { id: 'inc-feb-8', nome: 'Subsidio Desemprego', valor: 1173.51, frequencia: 'unico', data: 27, data_especifica: '2026-02-27', conta: 'Montepio' },

  // Março 2026
  { id: 'inc-mar-0', nome: 'Valor transportado Fev 2026', valor: 832.29, frequencia: 'unico', data: 1, data_especifica: '2026-03-01', conta: 'Montepio' },
  { id: 'inc-mar-0-rev', nome: 'Valor transportado Fev 2026', valor: 2554.04, frequencia: 'unico', data: 1, data_especifica: '2026-03-01', conta: 'Revolut' },
  { id: 'inc-mar-1', nome: 'Clínica [CSA]', valor: 700, frequencia: 'unico', data: 4, data_especifica: '2026-03-04', conta: 'Montepio' },
  { id: 'inc-mar-2', nome: 'Transferência', valor: 10, frequencia: 'unico', data: 5, data_especifica: '2026-03-05', conta: 'Montepio' },
  { id: 'inc-mar-3', nome: 'amo.CLINICS', valor: 300, frequencia: 'unico', data: 7, data_especifica: '2026-03-07', conta: 'Montepio' },
  { id: 'inc-mar-4', nome: 'Las Muns', valor: 500, frequencia: 'unico', data: 24, data_especifica: '2026-03-24', conta: 'Montepio' },
  { id: 'inc-mar-5', nome: 'Pagamento Sérgio [Hoodie]', valor: 30, frequencia: 'unico', data: 26, data_especifica: '2026-03-26', conta: 'Montepio' },
  { id: 'inc-mar-6', nome: 'Subsidio Desemprego', valor: 1173.51, frequencia: 'unico', data: 27, data_especifica: '2026-03-27', conta: 'Montepio' },
  { id: 'inc-mar-7-rev', nome: 'Transferência', valor: 300, frequencia: 'unico', data: 16, data_especifica: '2026-03-16', conta: 'Revolut' },

  // Abril 2026 (Transportado de Março)
  { id: 'inc-apr-0', nome: 'Valor transportado Mar 2026', valor: 1274.07, frequencia: 'unico', data: 1, data_especifica: '2026-04-01', conta: 'Montepio' },
  { id: 'inc-apr-0-rev', nome: 'Valor transportado Mar 2026', valor: 2414.64, frequencia: 'unico', data: 1, data_especifica: '2026-04-01', conta: 'Revolut' },

  // Recurring (for future)
  { id: 'rec-1', nome: 'Clínica [CSA]', valor: 700, frequencia: 'mensal', data: 4, conta: 'Montepio', data_inicio: '2026-04-01' },
  { id: 'rec-2', nome: 'amo.CLINICS', valor: 300, frequencia: 'mensal', data: 10, conta: 'Montepio', data_inicio: '2026-04-01' },
  { id: 'rec-3', nome: 'Las Muns', valor: 500, frequencia: 'mensal', data: 23, conta: 'Montepio', data_inicio: '2026-04-01' },
  { id: 'rec-4', nome: 'Subsídio Desemprego', valor: 1173.51, frequencia: 'mensal', data: 27, conta: 'Montepio', data_inicio: '2026-04-01' },
];

const initialRecurringMovements: RecurringMovement[] = [
  { id: 'rec-1', nome: 'Semanada Gonçalo', valor: 5, tipo: 'despesa', frequencia: 'semanal', dia: 0, conta: 'Revolut', categoria: 'Pessoal', ativa: true },
  { id: 'rec-2', nome: 'Crossfit Valverde', valor: 59, tipo: 'despesa', frequencia: 'mensal', dia: 18, conta: 'Revolut', categoria: 'Lazer', ativa: true },
  { id: 'rec-3', nome: 'Sorteio Valverde', valor: 12, tipo: 'despesa', frequencia: 'mensal', dia: 25, conta: 'Revolut', categoria: 'Pessoal', ativa: true },
  { id: 'rec-4', nome: 'Robo Advisor', valor: 100, tipo: 'despesa', frequencia: 'mensal', dia: 2, conta: 'Revolut', categoria: 'Investimento', ativa: true },
  { id: 'rec-5', nome: 'Trading212', valor: 200, tipo: 'despesa', frequencia: 'mensal', dia: 16, conta: 'Revolut', categoria: 'Investimento', ativa: true },
  { id: 'rec-6', nome: 'Transferência Revolut', valor: 300, tipo: 'receita', frequencia: 'mensal', dia: 16, conta: 'Revolut', categoria: 'Transferência', ativa: true },
];

// Initial data loader function
function getInitialData() {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('financeflow_data');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return {
          accounts: Array.isArray(parsed.accounts) ? parsed.accounts.filter((a: any) => a && a.id) : initialAccounts,
          investments: Array.isArray(parsed.investments) ? parsed.investments.filter((i: any) => i && i.id) : initialInvestments,
          debts: Array.isArray(parsed.debts) ? parsed.debts.filter((d: any) => d && d.id) : initialDebts,
          fixedExpenses: Array.isArray(parsed.fixedExpenses) ? parsed.fixedExpenses.filter((e: any) => e && e.id) : initialFixedExpenses,
          variableExpenses: Array.isArray(parsed.variableExpenses) ? parsed.variableExpenses.filter((e: any) => e && e.id) : initialVariableExpenses,
          income: Array.isArray(parsed.income) 
            ? (() => {
                const incomeList = [...parsed.income];
                
                // Ensure April carry-over entries exist
                const hasMontepioApr = incomeList.some(i => i && i.nome && i.nome.includes('Valor transportado Mar 2026') && i.conta === 'Montepio');
                const hasRevolutApr = incomeList.some(i => i && i.nome && i.nome.includes('Valor transportado Mar 2026') && i.conta === 'Revolut');
                
                if (!hasMontepioApr) {
                  incomeList.push({ id: 'inc-apr-0', nome: 'Valor transportado Mar 2026', valor: 1274.07, frequencia: 'unico', data: 1, data_especifica: '2026-04-01', conta: 'Montepio' });
                }
                if (!hasRevolutApr) {
                  incomeList.push({ id: 'inc-apr-0-rev', nome: 'Valor transportado Mar 2026', valor: 2414.64, frequencia: 'unico', data: 1, data_especifica: '2026-04-01', conta: 'Revolut' });
                }

                return incomeList.map((i: any) => {
                  // Aggressive patch for the incorrect February carry-over value
                  // The user reports 3681€ but the real value is 832.29€
                  if (i && i.nome && i.nome.includes('Valor transportado Fev 2026')) {
                    return { ...i, valor: 832.29 };
                  }
                  // Aggressive patch for April carry-over values as requested by user
                  if (i && i.nome && i.nome.includes('Valor transportado Mar 2026')) {
                    if (i.conta === 'Montepio') return { ...i, valor: 1274.07 };
                    if (i.conta === 'Revolut') return { ...i, valor: 2414.64 };
                  }
                  return i;
                }).filter((i: any) => i && i.id);
              })()
            : initialIncome,
          customWallets: Array.isArray(parsed.customWallets) ? parsed.customWallets : [],
          recurringMovements: Array.isArray(parsed.recurringMovements) ? parsed.recurringMovements : initialRecurringMovements,
        };
      } catch (e) {
        console.error('Error parsing saved finance data:', e);
      }
    }
  }
  
  return {
    accounts: initialAccounts,
    investments: initialInvestments,
    debts: initialDebts,
    fixedExpenses: initialFixedExpenses,
    variableExpenses: initialVariableExpenses,
    income: initialIncome,
    customWallets: [],
    recurringMovements: initialRecurringMovements,
  };
}

// Context type
interface FinanceContextType {
  accounts: Account[];
  investments: Investment[];
  debts: Debt[];
  fixedExpenses: FixedExpense[];
  variableExpenses: VariableExpense[];
  income: Income[];
  customWallets: string[];
  recurringMovements: RecurringMovement[];
  
  addAccount: (account: Omit<Account, 'id' | 'data_atualizacao'>) => void;
  updateAccount: (id: string, account: Partial<Account>) => void;
  deleteAccount: (id: string) => void;
  
  addInvestment: (investment: Omit<Investment, 'id' | 'data_atualizacao' | 'valor_atual'>, accountId?: string) => void;
  updateInvestment: (id: string, investment: Partial<Investment>) => void;
  deleteInvestment: (id: string) => void;
  refreshPrices: () => Promise<{ failedTickers: string[] }>;
  
  addCustomWallet: (name: string) => void;
  deleteCustomWallet: (name: string) => void;
  
  addDebt: (debt: Omit<Debt, 'id'>) => void;
  updateDebt: (id: string, debt: Partial<Debt>) => void;
  deleteDebt: (id: string) => void;
  
  addFixedExpense: (expense: Omit<FixedExpense, 'id'>) => void;
  updateFixedExpense: (id: string, expense: Partial<FixedExpense>) => void;
  deleteFixedExpense: (id: string) => void;
  
  addVariableExpense: (expense: Omit<VariableExpense, 'id'>) => void;
  updateVariableExpense: (id: string, expense: Partial<VariableExpense>) => void;
  deleteVariableExpense: (id: string) => void;
  
  transferFunds: (fromAccountId: string, toAccountId: string, amount: number) => void;
  
  addIncomeEntry: (incomeEntry: Omit<Income, 'id'>) => void;
  updateIncome: (id: string, incomeEntry: Partial<Income>) => void;
  deleteIncome: (id: string) => void;
  
  getDashboardSummary: () => DashboardSummary;
  getPlatformSummaries: () => PlatformSummary[];
  getExpensesByCategory: () => Record<string, number>;
  
  telegramSettings: TelegramSettings;
  updateTelegramSettings: (settings: Partial<TelegramSettings>) => void;
  
  selectedMonth: string;
  setSelectedMonth: (month: string) => void;
  user: User | null;
  loading: boolean;
  dataLoading: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<{ error: any }>;
  signUpWithEmail: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  updatePassword: (password: string) => Promise<{ error: any }>;
  seedDatabase: () => Promise<void>;
  
  addRecurringMovement: (movement: Omit<RecurringMovement, 'id'>) => void;
  updateRecurringMovement: (movement: RecurringMovement) => void;
  deleteRecurringMovement: (id: string) => void;
}

const FinanceContext = createContext<FinanceContextType | undefined>(undefined);

export function FinanceProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [dataLoading, setDataLoading] = useState(false);
  
  // Initialize with empty arrays to avoid hydration mismatch
  const [accounts, setAccounts] = useState<Account[]>(initialAccounts);
  const [investments, setInvestments] = useState<Investment[]>(initialInvestments);
  const [debts, setDebts] = useState<Debt[]>(initialDebts);
  const [fixedExpenses, setFixedExpenses] = useState<FixedExpense[]>(initialFixedExpenses);
  const [variableExpenses, setVariableExpenses] = useState<VariableExpense[]>(initialVariableExpenses);
  const [income, setIncome] = useState<Income[]>(initialIncome);
  const [customWallets, setCustomWallets] = useState<string[]>([]);
  const [recurringMovements, setRecurringMovements] = useState<RecurringMovement[]>(initialRecurringMovements);
  const [telegramSettings, setTelegramSettings] = useState<TelegramSettings>({
    chatId: '',
    enabledAlerts: {
      rendimentos: true,
      dividas: true,
      despesasFixas: true
    }
  });

  // Load from localStorage on mount
  useEffect(() => {
    console.log('FinanceProvider: Loading initial data from localStorage');
    const initial = getInitialData();
    setAccounts(initial.accounts);
    setInvestments(initial.investments);
    setDebts(initial.debts);
    setFixedExpenses(initial.fixedExpenses);
    setVariableExpenses(initial.variableExpenses);
    setIncome(initial.income);
    setCustomWallets(initial.customWallets);
    setRecurringMovements(initial.recurringMovements);

    const savedTelegram = localStorage.getItem('telegram_settings');
    if (savedTelegram) {
      try {
        setTelegramSettings(JSON.parse(savedTelegram));
      } catch (e) {
        console.error('Error parsing telegram settings:', e);
      }
    }
  }, []);

  const updateTelegramSettings = (settings: Partial<TelegramSettings>) => {
    setTelegramSettings(prev => {
      const newValue = { ...prev, ...settings };
      if (typeof window !== 'undefined') {
        localStorage.setItem('telegram_settings', JSON.stringify(newValue));
      }
      return newValue;
    });
  };

  const sendTelegramNotification = async (message: string) => {
    if (!telegramSettings.chatId) return;
    
    try {
      await fetch('/api/telegram', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message,
          chatId: telegramSettings.chatId
        })
      });
    } catch (error) {
      console.error('Error sending Telegram notification:', error);
    }
  };
  
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return now.toISOString().substring(0, 7);
  });

  // Save to localStorage whenever data changes
  useEffect(() => {
    // Skip saving if we are in the initial mount phase where data might be empty
    // but we check if we have at least some data or if it's explicitly cleared
    const data = {
      accounts,
      investments,
      debts,
      fixedExpenses,
      variableExpenses,
      income,
      customWallets
    };
    
    // Only save if we are on the client
    if (typeof window !== 'undefined') {
      localStorage.setItem('financeflow_data', JSON.stringify(data));
    }
  }, [accounts, investments, debts, fixedExpenses, variableExpenses, income, customWallets]);

  // Auth listener
  useEffect(() => {
    let mounted = true;
    console.log('FinanceProvider: Initializing auth listener');

    // Check for simple auth first to prevent loading hang
    const isSimpleAuth = typeof window !== 'undefined' && localStorage.getItem("finance_app_auth") === "true";
    if (isSimpleAuth) {
      console.log('FinanceProvider: Simple auth detected, setting authLoading to false');
      setAuthLoading(false);
    }

    // Check active session immediately
    const checkSession = async () => {
      try {
        console.log('FinanceProvider: Checking session...');
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) {
          console.error('FinanceProvider: Supabase getSession error:', error);
          throw error;
        }
        
        if (mounted) {
          console.log('FinanceProvider: Session check complete. User:', session?.user?.email || 'None');
          const userEmail = session?.user?.email?.toLowerCase();
          const isAllowed = userEmail === 'peterdzign@gmail.com' || userEmail === 'peterdzign@hotmail.com';
          
          if (session?.user && !isAllowed) {
            console.warn('FinanceProvider: Unauthorized email detected in session:', userEmail);
            await supabase.auth.signOut();
            setUser(null);
            localStorage.removeItem("finance_app_auth");
          } else {
            setUser(session?.user ?? null);
          }
          console.log('FinanceProvider: Setting authLoading to false from checkSession');
          setAuthLoading(false);
        }
      } catch (error) {
        console.error('FinanceProvider: Error checking session:', error);
        if (mounted) {
          setAuthLoading(false);
        }
      }
    };

    checkSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('FinanceProvider: Auth state changed event:', event, 'User:', session?.user?.email || 'None');
      if (mounted) {
        const userEmail = session?.user?.email?.toLowerCase();
        const isAllowed = userEmail === 'peterdzign@gmail.com' || userEmail === 'peterdzign@hotmail.com';

        if (session?.user && !isAllowed) {
          console.warn('FinanceProvider: Unauthorized email detected on state change:', userEmail);
          await supabase.auth.signOut();
          setUser(null);
          localStorage.removeItem("finance_app_auth");
        } else {
          setUser(session?.user ?? null);
        }
        console.log('FinanceProvider: Setting authLoading to false from onAuthStateChange');
        setAuthLoading(false);
      }
    });

    // Safety timeout: ensure loading state is cleared after 5 seconds
    // This prevents the app from being stuck on the loading screen if Supabase hangs
    const timeout = setTimeout(() => {
      if (mounted) {
        console.warn('FinanceProvider: Auth initialization timed out, forcing loading to false');
        setAuthLoading(false);
      }
    }, 5000);

    return () => {
      console.log('FinanceProvider: Cleaning up auth listener');
      mounted = false;
      subscription.unsubscribe();
      clearTimeout(timeout);
    };
  }, []);

  // Fetch data from Supabase
  const fetchData = useCallback(async () => {
    const isSimpleAuth = typeof window !== 'undefined' && localStorage.getItem("finance_app_auth") === "true";
    
    if (!user && !isSimpleAuth) {
      console.log('FinanceProvider: No user and no simple auth, skipping fetchData');
      setAccounts([]);
      setInvestments([]);
      setDebts([]);
      setFixedExpenses([]);
      setVariableExpenses([]);
      setIncome([]);
      return;
    }

    console.log('FinanceProvider: Starting fetchData. Mode:', user ? `User ${user.email}` : 'Simple Auth (default-user)');
    
    // If not logged in and not simple auth, clear data
    if (!user && !isSimpleAuth) {
      console.log('FinanceProvider: No user and no simple auth, clearing data');
      setAccounts([]);
      setInvestments([]);
      setDebts([]);
      setFixedExpenses([]);
      setVariableExpenses([]);
      setIncome([]);
      return;
    }

    // If simple auth but we already have data in state, and we are not explicitly refreshing,
    // we might want to skip fetching to avoid overwriting with empty Supabase results (RLS issues)
    // However, for now let's try to fetch but be careful with the results.

    setDataLoading(true);

    // Safety timeout for data loading
    const dataTimeout = setTimeout(() => {
      console.warn('FinanceProvider: fetchData timed out, forcing dataLoading to false');
      setDataLoading(false);
    }, 15000);

    try {
      console.log('FinanceProvider: Fetching all tables from Supabase...');
      const [
        { data: accs, error: accsError },
        { data: invs, error: invsError },
        { data: dbt, error: dbtError },
        { data: fxd, error: fxdError },
        { data: vrb, error: vrbError },
        { data: inc, error: incError }
      ] = await Promise.all([
        supabase.from('accounts').select('*').order('nome'),
        supabase.from('investments').select('*').order('nome'),
        supabase.from('debts').select('*').order('nome'),
        supabase.from('fixed_expenses').select('*').order('nome'),
        supabase.from('variable_expenses').select('*').order('data', { ascending: false }),
        supabase.from('income').select('*').order('data', { ascending: false })
      ]);

      if (accsError) console.error('FinanceProvider: Error fetching accounts:', accsError);
      if (invsError) console.error('FinanceProvider: Error fetching investments:', invsError);
      if (dbtError) console.error('FinanceProvider: Error fetching debts:', dbtError);
      if (fxdError) console.error('FinanceProvider: Error fetching fixed_expenses:', fxdError);
      if (vrbError) console.error('FinanceProvider: Error fetching variable_expenses:', vrbError);
      if (incError) console.error('FinanceProvider: Error fetching income:', incError);

      // Only update state if we got data OR if we are logged in (where Supabase is the source of truth)
      // If in simple auth and Supabase returns nothing, we keep our local data
      const hasData = (accs && accs.length > 0) || (invs && invs.length > 0) || (dbt && dbt.length > 0);
      
      if (user || hasData) {
        if (accs) setAccounts(accs);
        if (invs) setInvestments(invs);
        if (dbt) setDebts(dbt);
        if (fxd) setFixedExpenses(fxd);
        if (vrb) setVariableExpenses(vrb);
        if (inc) {
          // Aggressive patch for the incorrect February carry-over value in Supabase data
          const patchedInc = inc.map((i: any) => {
            if (i && i.nome && i.nome.includes('Valor transportado Fev 2026')) {
              if (i.valor !== 832.29) {
                console.log('FinanceContext: Patching Valor transportado Fev 2026 in Supabase data from', i.valor, 'to 832.29');
              }
              return { ...i, valor: 832.29 };
            }
            return i;
          });
          setIncome(patchedInc);
        }
        console.log('FinanceProvider: State updated from Supabase');
      } else {
        console.log('FinanceProvider: Supabase returned no data, keeping local state');
      }
      
      console.log('FinanceProvider: fetchData complete');
    } catch (error) {
      console.error('FinanceProvider: Error fetching data from Supabase:', error);
    } finally {
      clearTimeout(dataTimeout);
      setDataLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Real-time subscriptions
  useEffect(() => {
    if (!user) return;

    const channels = [
      supabase.channel('accounts-changes').on('postgres_changes', { event: '*', schema: 'public', table: 'accounts' }, fetchData).subscribe(),
      supabase.channel('investments-changes').on('postgres_changes', { event: '*', schema: 'public', table: 'investments' }, fetchData).subscribe(),
      supabase.channel('debts-changes').on('postgres_changes', { event: '*', schema: 'public', table: 'debts' }, fetchData).subscribe(),
      supabase.channel('fixed-expenses-changes').on('postgres_changes', { event: '*', schema: 'public', table: 'fixed_expenses' }, fetchData).subscribe(),
      supabase.channel('variable-expenses-changes').on('postgres_changes', { event: '*', schema: 'public', table: 'variable_expenses' }, fetchData).subscribe(),
      supabase.channel('income-changes').on('postgres_changes', { event: '*', schema: 'public', table: 'income' }, fetchData).subscribe(),
    ];

    return () => {
      channels.forEach(channel => channel.unsubscribe());
    };
  }, [user, fetchData]);

  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/`
      }
    });
    if (error) console.error('Error signing in with Google:', error);
  };

  const signInWithEmail = async (email: string, password: string) => {
    const userEmail = email.toLowerCase();
    const isAllowed = userEmail === 'peterdzign@gmail.com' || userEmail === 'peterdzign@hotmail.com';
    
    if (!isAllowed) {
      return { error: { message: "Acesso restrito apenas ao proprietário." } };
    }
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) {
      console.error('Error signing in with email:', error);
      return { error };
    }
    setUser(data.user);
    localStorage.setItem("finance_app_auth", "true");
    return { error: null };
  };

  const signUpWithEmail = async (email: string, password: string) => {
    return { error: { message: "Novos registos estão desativados." } };
  };

  const updatePassword = async (password: string) => {
    const { error } = await supabase.auth.updateUser({
      password: password
    });
    return { error };
  };

  const signOut = async () => {
    localStorage.removeItem("finance_app_auth");
    await supabase.auth.signOut();
    window.location.reload();
  };

  const seedDatabase = async () => {
    const isSimpleAuth = typeof window !== 'undefined' && localStorage.getItem("finance_app_auth") === "true";
    if (!user && !isSimpleAuth) {
      console.error('FinanceProvider: Cannot seed database - not authenticated');
      return;
    }
    
    setDataLoading(true);
    let supabaseSuccess = true;
    try {
      // If we have a real user, try to push to Supabase
      if (user) {
        const userId = user.id;
        console.log('FinanceProvider: Iniciando povoamento das tabelas para o utilizador:', userId);

        // 1. Accounts
        const accountsToInsert = initialAccounts.map(({ id, ...rest }) => ({
          ...rest,
          user_id: userId,
          data_atualizacao: new Date().toISOString()
        }));
        const { error: accError } = await supabase.from('accounts').insert(accountsToInsert);
        if (accError) {
          console.error('FinanceProvider: Erro ao inserir contas no Supabase:', accError);
          // If it's an RLS error, we'll continue but warn the user
          if (accError.message.includes('row-level security policy')) {
            console.warn('FinanceProvider: RLS policy violation. Data will be local only.');
            supabaseSuccess = false;
          } else {
            throw new Error(`Erro ao inserir contas: ${accError.message}`);
          }
        }

        // 2. Investments
        const investmentsToInsert = initialInvestments.map(({ id, ...rest }) => ({
          ...rest,
          user_id: userId,
          valor_atual: rest.quantidade * rest.preco_atual,
          data_atualizacao: new Date().toISOString()
        }));
        const { error: invError } = await supabase.from('investments').insert(investmentsToInsert);
        if (invError) {
          if (invError.message.includes('row-level security policy')) {
            supabaseSuccess = false;
          } else {
            throw new Error(`Erro ao inserir investimentos: ${invError.message}`);
          }
        }

        // 3. Debts
        const debtsToInsert = initialDebts.map(({ id, ...rest }) => ({
          ...rest,
          user_id: userId
        }));
        const { error: debtError } = await supabase.from('debts').insert(debtsToInsert);
        if (debtError) {
          if (debtError.message.includes('row-level security policy')) {
            supabaseSuccess = false;
          } else {
            throw new Error(`Erro ao inserir dívidas: ${debtError.message}`);
          }
        }

        // 4. Fixed Expenses
        const fixedToInsert = initialFixedExpenses.map(({ id, ...rest }) => ({
          ...rest,
          user_id: userId
        }));
        const { error: fixedError } = await supabase.from('fixed_expenses').insert(fixedToInsert);
        if (fixedError) {
          if (fixedError.message.includes('row-level security policy')) {
            supabaseSuccess = false;
          } else {
            throw new Error(`Erro ao inserir despesas fixas: ${fixedError.message}`);
          }
        }

        // 5. Variable Expenses
        const variableToInsert = initialVariableExpenses.map(({ id, ...rest }) => ({
          ...rest,
          user_id: userId
        }));
        const { error: varError } = await supabase.from('variable_expenses').insert(variableToInsert);
        if (varError) {
          if (varError.message.includes('row-level security policy')) {
            supabaseSuccess = false;
          } else {
            throw new Error(`Erro ao inserir despesas variáveis: ${varError.message}`);
          }
        }

        // 6. Income
        const incomeToInsert = initialIncome.map(({ id, ...rest }) => ({
          ...rest,
          user_id: userId
        }));
        const { error: incError } = await supabase.from('income').insert(incomeToInsert);
        if (incError) {
          if (incError.message.includes('row-level security policy')) {
            supabaseSuccess = false;
          } else {
            throw new Error(`Erro ao inserir rendimentos: ${incError.message}`);
          }
        }

        if (supabaseSuccess) {
          console.log('FinanceProvider: Dados povoados no Supabase com sucesso!');
          await fetchData();
        } else {
          console.warn('FinanceProvider: Supabase seed partially failed due to RLS. Data is local only.');
        }
      } else {
        console.log('FinanceProvider: Simple Auth mode - seeding local data only');
      }
      
      // ALWAYS update local state to ensure UI reflects data immediately
      setAccounts(initialAccounts as Account[]);
      setInvestments(initialInvestments as Investment[]);
      setDebts(initialDebts as Debt[]);
      setFixedExpenses(initialFixedExpenses as FixedExpense[]);
      setVariableExpenses(initialVariableExpenses as VariableExpense[]);
      setIncome(initialIncome as Income[]);
    } catch (error: any) {
      console.error('FinanceProvider: Erro ao povoar dados:', error);
      alert(`Erro ao povoar dados: ${error.message || 'Erro desconhecido'}`);
    } finally {
      setDataLoading(false);
    }
  };

  // Account actions
  const addAccount = async (account: Omit<Account, 'id' | 'data_atualizacao'>) => {
    const userId = user?.id || 'default-user';
    const newId = Math.random().toString(36).substr(2, 9);
    const newAccount: Account = {
      ...account,
      id: newId,
      user_id: userId,
      data_atualizacao: new Date().toISOString()
    };

    // Optimistic update
    setAccounts(prev => [...prev, newAccount]);

    if (user) {
      const { error } = await supabase.from('accounts').insert([{
        ...account,
        user_id: userId,
        data_atualizacao: new Date().toISOString()
      }]);
      if (error) console.error('Error adding account to Supabase:', error);
    }
  };

  const updateAccount = async (id: string, account: Partial<Account>) => {
    // Optimistic update
    setAccounts(prev => prev.map(a => a.id === id ? { ...a, ...account, data_atualizacao: new Date().toISOString() } : a));

    if (user) {
      const { error } = await supabase.from('accounts').update({
        ...account,
        data_atualizacao: new Date().toISOString()
      }).eq('id', id);
      if (error) console.error('Error updating account in Supabase:', error);
    }
  };

  const deleteAccount = async (id: string) => {
    // Optimistic update
    setAccounts(prev => prev.filter(a => a.id !== id));

    if (user) {
      const { error } = await supabase.from('accounts').delete().eq('id', id);
      if (error) console.error('Error deleting account in Supabase:', error);
    }
  };

  // Investment actions
  const addInvestment = async (investment: Omit<Investment, 'id' | 'data_atualizacao' | 'valor_atual'>, accountId?: string) => {
    const userId = user?.id || 'default-user';
    const valor_atual = investment.quantidade * investment.preco_atual;
    const newId = Math.random().toString(36).substr(2, 9);
    const newInvestment: Investment = {
      ...investment,
      id: newId,
      user_id: userId,
      valor_atual,
      data_atualizacao: new Date().toISOString()
    };

    // Optimistic update
    setInvestments(prev => [...prev, newInvestment]);

    // Deduct from account if specified
    if (accountId) {
      const account = accounts.find(a => a.id === accountId);
      if (account) {
        const amount = investment.quantidade * investment.preco_medio;
        updateAccount(accountId, { saldo: account.saldo - amount });
      }
    }

    if (user) {
      const { error } = await supabase.from('investments').insert([{
        ...investment,
        user_id: userId,
        valor_atual,
        data_atualizacao: new Date().toISOString()
      }]);
      if (error) console.error('Error adding investment to Supabase:', error);
    }
  };

  const updateInvestment = async (id: string, investment: Partial<Investment>) => {
    // Calculate new valor_atual if needed
    const currentInv = investments.find(i => i.id === id);
    let valor_atual = currentInv?.valor_atual || 0;
    
    if (currentInv && (investment.quantidade !== undefined || investment.preco_atual !== undefined)) {
      const qty = investment.quantidade ?? currentInv.quantidade;
      const price = investment.preco_atual ?? currentInv.preco_atual;
      valor_atual = qty * price;
    }

    // Optimistic update
    setInvestments(prev => prev.map(i => i.id === id ? { 
      ...i, 
      ...investment, 
      valor_atual,
      data_atualizacao: new Date().toISOString() 
    } : i));

    if (user) {
      const { error } = await supabase.from('investments').update({
        ...investment,
        valor_atual,
        data_atualizacao: new Date().toISOString()
      }).eq('id', id);
      if (error) console.error('Error updating investment in Supabase:', error);
    }
  };

  const deleteInvestment = async (id: string) => {
    // Optimistic update
    setInvestments(prev => prev.filter(i => i.id !== id));

    if (user) {
      const { error } = await supabase.from('investments').delete().eq('id', id);
      if (error) console.error('Error deleting investment in Supabase:', error);
    }
  };

  // Custom Wallet actions (Local for now, or could be added to DB later)
  const addCustomWallet = (name: string) => {
    if (!name.trim()) return;
    setCustomWallets(prev => [...new Set([...prev, name.trim()])]);
  };

  const deleteCustomWallet = (name: string) => {
    setCustomWallets(prev => prev.filter(w => w !== name));
  };

  const addRecurringMovement = (movement: Omit<RecurringMovement, 'id'>) => {
    const newMovement = { ...movement, id: Math.random().toString(36).substr(2, 9) };
    setRecurringMovements(prev => [...prev, newMovement]);
  };

  const updateRecurringMovement = (movement: RecurringMovement) => {
    setRecurringMovements(prev => prev.map(m => m.id === movement.id ? movement : m));
  };

  const deleteRecurringMovement = (id: string) => {
    setRecurringMovements(prev => prev.filter(m => m.id !== id));
  };

  // Server API - Fetch current price via Next.js API route
  const fetchCurrentPrice = async (ticker: string): Promise<number | null> => {
    try {
      const response = await fetch(`/api/price?ticker=${encodeURIComponent(ticker)}`);
      if (!response.ok) return null;
      const data = await response.json();
      return data.price ?? null;
    } catch (error) {
      console.error(`Error fetching price for ${ticker}:`, error);
      return null;
    }
  };

  const refreshPrices = async (): Promise<{ failedTickers: string[] }> => {
    if (!user) return { failedTickers: [] };
    
    const uniqueTickers = [...new Set(investments.filter(i => i.isAutoPrice).map(i => i.ticker))];
    const priceMap: Record<string, number> = {};
    const failedTickers: string[] = [];
    
    for (const ticker of uniqueTickers) {
      const price = await fetchCurrentPrice(ticker);
      if (price) {
        priceMap[ticker] = price;
      } else {
        failedTickers.push(ticker);
      }
    }
    
    // Update all investments in Supabase
    for (const inv of investments) {
      if (inv.isAutoPrice && priceMap[inv.ticker]) {
        await updateInvestment(inv.id, {
          preco_atual: priceMap[inv.ticker]
        });
      }
    }
    
    return { failedTickers };
  };

  // Debt actions
  const addDebt = async (debt: Omit<Debt, 'id'>) => {
    const userId = user?.id || 'default-user';
    const newId = Math.random().toString(36).substr(2, 9);
    const newDebt: Debt = { ...debt, id: newId, user_id: userId };

    // Optimistic update
    setDebts(prev => [...prev, newDebt]);

    if (user) {
      const { error } = await supabase.from('debts').insert([{ ...debt, user_id: userId }]);
      if (error) console.error('Error adding debt to Supabase:', error);
    }

    if (telegramSettings.enabledAlerts.dividas) {
      sendTelegramNotification(`<b>⚠️ Nova Dívida Adicionada</b>\n\n<b>Nome:</b> ${debt.nome}\n<b>Prestação:</b> ${debt.prestacao_mensal.toLocaleString('pt-PT', { style: 'currency', currency: 'EUR' })}\n<b>Conta:</b> ${debt.conta}`);
    }
  };

  const updateDebt = async (id: string, debt: Partial<Debt>) => {
    // Optimistic update
    setDebts(prev => prev.map(d => d.id === id ? { ...d, ...debt } : d));

    if (user) {
      const { error } = await supabase.from('debts').update(debt).eq('id', id);
      if (error) console.error('Error updating debt in Supabase:', error);
    }
  };

  const deleteDebt = async (id: string) => {
    // Optimistic update
    setDebts(prev => prev.filter(d => d.id !== id));

    if (user) {
      const { error } = await supabase.from('debts').delete().eq('id', id);
      if (error) console.error('Error deleting debt in Supabase:', error);
    }
  };

  // Fixed expense actions
  const addFixedExpense = async (expense: Omit<FixedExpense, 'id'>) => {
    const userId = user?.id || 'default-user';
    const newId = Math.random().toString(36).substr(2, 9);
    const newExpense: FixedExpense = { ...expense, id: newId, user_id: userId };

    // Optimistic update
    setFixedExpenses(prev => [...prev, newExpense]);

    if (user) {
      const { error } = await supabase.from('fixed_expenses').insert([{ ...expense, user_id: userId }]);
      if (error) console.error('Error adding fixed expense to Supabase:', error);
    }

    if (telegramSettings.enabledAlerts.despesasFixas) {
      sendTelegramNotification(`<b>💸 Nova Despesa Fixa</b>\n\n<b>Nome:</b> ${expense.nome}\n<b>Valor:</b> ${expense.valor.toLocaleString('pt-PT', { style: 'currency', currency: 'EUR' })}\n<b>Conta:</b> ${expense.conta}`);
    }
  };

  const updateFixedExpense = async (id: string, expense: Partial<FixedExpense>) => {
    // Optimistic update
    setFixedExpenses(prev => prev.map(e => e.id === id ? { ...e, ...expense } : e));

    if (user) {
      const { error } = await supabase.from('fixed_expenses').update(expense).eq('id', id);
      if (error) console.error('Error updating fixed expense in Supabase:', error);
    }
  };

  const deleteFixedExpense = async (id: string) => {
    // Optimistic update
    setFixedExpenses(prev => prev.filter(e => e.id !== id));

    if (user) {
      const { error } = await supabase.from('fixed_expenses').delete().eq('id', id);
      if (error) console.error('Error deleting fixed expense in Supabase:', error);
    }
  };

  // Variable expense actions
  const addVariableExpense = async (expense: Omit<VariableExpense, 'id'>) => {
    const userId = user?.id || 'default-user';
    const newId = Math.random().toString(36).substr(2, 9);
    const newExpense: VariableExpense = { ...expense, id: newId, user_id: userId };

    // Optimistic update
    setVariableExpenses(prev => [...prev, newExpense]);

    if (user) {
      const { error } = await supabase.from('variable_expenses').insert([{ ...expense, user_id: userId }]);
      if (error) console.error('Error adding variable expense to Supabase:', error);
    }
  };

  const updateVariableExpense = async (id: string, expense: Partial<VariableExpense>) => {
    // Optimistic update
    setVariableExpenses(prev => prev.map(e => e.id === id ? { ...e, ...expense } : e));

    if (user) {
      const { error } = await supabase.from('variable_expenses').update(expense).eq('id', id);
      if (error) console.error('Error updating variable expense in Supabase:', error);
    }
  };

  const deleteVariableExpense = async (id: string) => {
    // Optimistic update
    setVariableExpenses(prev => prev.filter(e => e.id !== id));

    if (user) {
      const { error } = await supabase.from('variable_expenses').delete().eq('id', id);
      if (error) console.error('Error deleting variable expense in Supabase:', error);
    }
  };

  const transferFunds = async (fromAccountId: string, toAccountId: string, amount: number) => {
    const fromAccount = accounts.find(a => a.id === fromAccountId);
    const toAccount = accounts.find(a => a.id === toAccountId);
    
    if (!fromAccount || !toAccount) return;

    // Update balances (these are already optimistic)
    updateAccount(fromAccountId, { saldo: fromAccount.saldo - amount });
    updateAccount(toAccountId, { saldo: toAccount.saldo + amount });

    const today = new Date().toISOString().split('T')[0];
    
    // Create variable expense for the source account (optimistic)
    addVariableExpense({
      nome: `Transferência para ${toAccount.nome}`,
      valor: amount,
      data: today,
      conta: fromAccount.nome,
      categoria: 'Transferência'
    });

    // Create income entry for the destination account (optimistic)
    addIncomeEntry({
      nome: 'Transferência',
      valor: amount,
      frequencia: 'unico',
      data: new Date().getDate(),
      data_especifica: today,
      conta: toAccount.nome
    });
  };

  // Income actions
  const addIncomeEntry = async (incomeEntry: Omit<Income, 'id'>) => {
    const userId = user?.id || 'default-user';
    const newId = Math.random().toString(36).substr(2, 9);
    const newIncome: Income = { ...incomeEntry, id: newId, user_id: userId };

    // Optimistic update
    setIncome(prev => [...prev, newIncome]);

    if (user) {
      const { error } = await supabase.from('income').insert([{ ...incomeEntry, user_id: userId }]);
      if (error) console.error('Error adding income to Supabase:', error);
    }

    if (telegramSettings.enabledAlerts.rendimentos) {
      sendTelegramNotification(`<b>💰 Novo Rendimento</b>\n\n<b>Nome:</b> ${incomeEntry.nome}\n<b>Valor:</b> ${incomeEntry.valor.toLocaleString('pt-PT', { style: 'currency', currency: 'EUR' })}\n<b>Conta:</b> ${incomeEntry.conta}`);
    }
  };

  const updateIncome = async (id: string, incomeEntry: Partial<Income>) => {
    // Optimistic update
    setIncome(prev => prev.map(i => i.id === id ? { ...i, ...incomeEntry } : i));

    if (user) {
      const { error } = await supabase.from('income').update(incomeEntry).eq('id', id);
      if (error) console.error('Error updating income in Supabase:', error);
    }
  };

  const deleteIncome = async (id: string) => {
    // Optimistic update
    setIncome(prev => prev.filter(i => i.id !== id));

    if (user) {
      const { error } = await supabase.from('income').delete().eq('id', id);
      if (error) console.error('Error deleting income in Supabase:', error);
    }
  };

  // Computed values
  const getDashboardSummary = (): DashboardSummary => {
    try {
      const now = new Date();
      const currentMonthStr = now.toISOString().substring(0, 7);
      
      let currentDay = now.getDate();
      if (selectedMonth < currentMonthStr) {
        const [y, m] = selectedMonth.split('-');
        currentDay = new Date(parseInt(y), parseInt(m), 0).getDate();
      } else if (selectedMonth > currentMonthStr) {
        currentDay = 0;
      }
      
      const accountBalances = accounts.map(account => {
        // Find carry-over for this month
        const carryOver = income.find(i => 
          i && i.conta === account.nome && 
          i.nome && i.nome.toLowerCase().includes('transportado') && 
          i.data_especifica?.startsWith(selectedMonth)
        );

        // Starting balance is the carry-over value if it exists
        // If not, use account.saldo only if it's March 2026 (the base month for initial data)
        const startingBalance = carryOver ? carryOver.valor : (selectedMonth === '2026-03' ? account.saldo : 0);

        const accIncome = income
          .filter(i => i && i.conta === account.nome)
          .filter(i => {
            if (!i || !i.nome) return false;
            if (i.nome.toLowerCase().includes('transportado')) return false;
            if (i.frequencia === 'mensal') {
              if (i.data_inicio && i.data_inicio > `${selectedMonth}-31`) return false;
              return i.data <= currentDay;
            }
            if (i.frequencia === 'unico' && i.data_especifica && i.data_especifica.startsWith(selectedMonth)) {
              const day = parseInt(i.data_especifica.split('-')[2]);
              return day <= currentDay;
            }
            return false;
          })
          .reduce((sum, i) => sum + (i?.valor || 0), 0);

        const accVariableSpent = variableExpenses
          .filter(e => e && e.conta === account.nome && e.data && e.data.startsWith(selectedMonth))
          .filter(e => {
            const day = parseInt(e.data.split('-')[2]);
            return day <= currentDay;
          })
          .reduce((sum, e) => sum + (e?.valor || 0), 0);

        const accFixed = fixedExpenses
          .filter(e => e && e.conta === account.nome && e.data_pagamento <= currentDay)
          .reduce((sum, e) => sum + (e?.valor || 0), 0);

        const accDebts = debts
          .filter(d => d && d.conta === account.nome && d.data_pagamento <= currentDay)
          .reduce((sum, d) => sum + (d?.prestacao_mensal || 0), 0);

        return startingBalance + accIncome - accVariableSpent - accFixed - accDebts;
      });

      const totalAccounts = accountBalances.reduce((sum, b) => sum + b, 0);
      const totalInvestments = investments.reduce((sum, i) => sum + (i?.valor_atual || 0), 0);
      const totalDividends = investments.reduce((sum, i) => sum + (i?.dividendos_ganhos || 0), 0);
      const totalDebts = debts.reduce((sum, d) => sum + (d?.valor_total || 0), 0);
      
      const monthlyIncome = income.reduce((sum, i) => {
        if (!i || !i.nome) return sum;
        if (i.nome.toLowerCase().includes('transportado')) return sum;
        if (i.frequencia === 'mensal') {
          if (i.data_inicio && i.data_inicio > `${selectedMonth}-31`) return sum;
          if (i.data > currentDay) return sum;
          return sum + (i.valor || 0);
        }
        if (i.frequencia === 'unico' && i.data_especifica && i.data_especifica.startsWith(selectedMonth)) {
          const day = parseInt(i.data_especifica.split('-')[2]);
          if (day > currentDay) return sum;
          return sum + (i.valor || 0);
        }
        return sum;
      }, 0);

      const totalVariableExpenses = variableExpenses
        .filter(exp => exp && exp.data && exp.data.startsWith(selectedMonth))
        .filter(exp => {
          const day = parseInt(exp.data.split('-')[2]);
          return day <= currentDay;
        })
        .reduce((sum, exp) => sum + (exp?.valor || 0), 0);

      const totalFixedExpenses = fixedExpenses
        .filter(exp => exp && exp.frequencia === 'mensal' && exp.data_pagamento <= currentDay)
        .reduce((sum, exp) => sum + (exp?.valor || 0), 0);

      const totalDebtsExpenses = debts
        .filter(d => d && d.data_pagamento <= currentDay)
        .reduce((sum, d) => sum + (d?.prestacao_mensal || 0), 0);

      const totalExpenses = totalVariableExpenses + totalFixedExpenses + totalDebtsExpenses;
      
      const totalBase = accounts.reduce((sum, account) => {
        const carryOver = income.find(i => 
          i && i.conta === account.nome && 
          i.nome && i.nome.toLowerCase().includes('transportado') && 
          i.data_especifica?.startsWith(selectedMonth)
        );
        const startingBalance = carryOver ? carryOver.valor : (selectedMonth === '2026-03' ? account.saldo : 0);
        
        const accIncome = income
          .filter(i => i && i.conta === account.nome)
          .filter(i => {
            if (!i || !i.nome) return false;
            if (i.nome.toLowerCase().includes('transportado')) return false;
            if (i.frequencia === 'mensal') {
              if (i.data_inicio && i.data_inicio > `${selectedMonth}-31`) return false;
              return i.data <= currentDay;
            }
            if (i.frequencia === 'unico' && i.data_especifica && i.data_especifica.startsWith(selectedMonth)) {
              const day = parseInt(i.data_especifica.split('-')[2]);
              return day <= currentDay;
            }
            return false;
          })
          .reduce((sum, i) => sum + (i?.valor || 0), 0);
          
        return sum + startingBalance + accIncome;
      }, 0);
      
      const cashflow = monthlyIncome - totalExpenses;
      const savingsRate = monthlyIncome > 0 ? (cashflow / monthlyIncome) * 100 : 0;

      return {
        totalWealth: totalAccounts + totalInvestments,
        totalAccounts,
        totalBase,
        totalInvestments,
        totalDebts,
        monthlyCashflow: cashflow,
        monthlyIncome,
        totalExpenses,
        savingsRate,
        monthlyFixedExpenses: totalFixedExpenses,
        averageVariableExpenses: totalVariableExpenses,
        totalDividends,
        accountBalances
      };
    } catch (e) {
      console.error('Error in getDashboardSummary:', e);
      return {
        totalWealth: 0,
        totalAccounts: 0,
        totalBase: 0,
        totalInvestments: 0,
        totalDebts: 0,
        monthlyCashflow: 0,
        monthlyIncome: 0,
        totalExpenses: 0,
        savingsRate: 0,
        monthlyFixedExpenses: 0,
        averageVariableExpenses: 0,
        totalDividends: 0,
        accountBalances: accounts.map(() => 0)
      };
    }
  };

  const getPlatformSummaries = (): PlatformSummary[] => {
    try {
      const platforms: Plataforma[] = ['XTB', 'Trading212', 'Revolut Stocks', 'Revolut Cripto', 'Robo Advisor'];
      
      return platforms.map(plataforma => {
        const platformInvestments = investments.filter(i => i && i.plataforma === plataforma);
        const totalValue = platformInvestments.reduce((sum, i) => sum + (i?.valor_atual || 0), 0);
        const totalInvested = platformInvestments.reduce((sum, i) => sum + ((i?.quantidade || 0) * (i?.preco_medio || 0)), 0);
        const totalDividends = platformInvestments.reduce((sum, i) => sum + (i?.dividendos_ganhos || 0), 0);
        const profitability = totalValue - totalInvested;
        const profitabilityPercent = totalInvested > 0 ? (profitability / totalInvested) * 100 : 0;
        
        return {
          plataforma,
          totalValue,
          totalInvested,
          profitability,
          profitabilityPercent,
          totalDividends,
        };
      }).filter(p => p.totalValue > 0);
    } catch (e) {
      console.error('Error in getPlatformSummaries:', e);
      return [];
    }
  };

  const getExpensesByCategory = (): Record<string, number> => {
    try {
      const categories: Record<string, number> = {};
      variableExpenses
        .filter(e => e && e.data && e.data.startsWith(selectedMonth))
        .forEach(e => {
          if (e && e.categoria) {
            categories[e.categoria] = (categories[e.categoria] || 0) + (e.valor || 0);
          }
        });
      return categories;
    } catch (e) {
      console.error('Error in getExpensesByCategory:', e);
      return {};
    }
  };

  return (
    <FinanceContext.Provider value={{
      accounts,
      investments,
      debts,
      fixedExpenses,
      variableExpenses,
      income,
      addAccount,
      updateAccount,
      deleteAccount,
      addInvestment,
      updateInvestment,
      deleteInvestment,
      refreshPrices,
      addDebt,
      updateDebt,
      deleteDebt,
      addFixedExpense,
      updateFixedExpense,
      deleteFixedExpense,
      addVariableExpense,
      updateVariableExpense,
      deleteVariableExpense,
      transferFunds,
      addIncomeEntry,
      updateIncome,
      deleteIncome,
      getDashboardSummary,
      getPlatformSummaries,
      getExpensesByCategory,
      customWallets,
      addCustomWallet,
      deleteCustomWallet,
      recurringMovements,
      addRecurringMovement,
      updateRecurringMovement,
      deleteRecurringMovement,
      telegramSettings,
      updateTelegramSettings,
      selectedMonth,
      setSelectedMonth,
      user,
      loading: authLoading,
      dataLoading,
      signInWithGoogle,
      signInWithEmail,
      signUpWithEmail,
      signOut,
      updatePassword,
      seedDatabase,
    }}>
      {children}
    </FinanceContext.Provider>
  );
}

export function useFinance() {
  const context = useContext(FinanceContext);
  if (!context) {
    throw new Error('useFinance must be used within a FinanceProvider');
  }
  return context;
}
