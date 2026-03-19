# Personal Finance Dashboard 360º - Specification

## 1. Project Overview

**Project Name:** FinanceFlow 360º - Sistema Pessoal de Gestão Financeira  
**Type:** Web Application (Next.js 16)  
**Core Functionality:** A comprehensive personal finance management dashboard that consolidates all financial data (accounts, investments, debts, expenses, income) with automatic price updates via Yahoo Finance API and Google Sheets integration.  
**Target Users:** Individual seeking complete control over personal finances with a premium dark-themed interface.

---

## 2. UI/UX Specification

### 2.1 Design Philosophy

**Theme:** Premium Dark Mode  
**Style:** Modern fintech aesthetic with glassmorphism effects, subtle gradients, and sophisticated color palette  
**Inspiration:** Bloomberg Terminal meets modern banking apps

### 2.2 Color Palette

```css
:root {
  /* Background Colors */
  --bg-primary: #0a0a0f;
  --bg-secondary: #12121a;
  --bg-tertiary: #1a1a24;
  --bg-card: #16161f;
  --bg-card-hover: #1c1c28;
  
  /* Accent Colors */
  --accent-primary: #6366f1;      /* Indigo */
  --accent-secondary: #8b5cf6;    /* Purple */
  --accent-success: #10b981;      /* Emerald - positive values */
  --accent-danger: #ef4444;        /* Red - negative values */
  --accent-warning: #f59e0b;      /* Amber */
  --accent-info: #06b6d4;         /* Cyan */
  
  /* Text Colors */
  --text-primary: #f8fafc;
  --text-secondary: #94a3b8;
  --text-muted: #64748b;
  
  /* Border Colors */
  --border-color: #2d2d3a;
  --border-glow: rgba(99, 102, 241, 0.3);
  
  /* Gradients */
  --gradient-primary: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
  --gradient-success: linear-gradient(135deg, #10b981 0%, #059669 100%);
  --gradient-danger: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  --gradient-card: linear-gradient(180deg, rgba(99, 102, 241, 0.1) 0%, transparent 100%);
}
```

### 2.3 Typography

**Font Family:**
- Headings: "Outfit", sans-serif (Google Fonts)
- Body: "DM Sans", sans-serif (Google Fonts)
- Monospace (numbers): "JetBrains Mono", monospace

**Font Sizes:**
- H1: 2.5rem (40px), font-weight: 700
- H2: 1.75rem (28px), font-weight: 600
- H3: 1.25rem (20px), font-weight: 600
- Body: 0.9375rem (15px), font-weight: 400
- Small: 0.8125rem (13px), font-weight: 400
- Caption: 0.75rem (12px), font-weight: 500

### 2.4 Spacing System

- xs: 4px
- sm: 8px
- md: 16px
- lg: 24px
- xl: 32px
- 2xl: 48px

### 2.5 Layout Structure

**Responsive Breakpoints:**
- Mobile: < 640px
- Tablet: 640px - 1024px
- Desktop: > 1024px

**Main Layout:**
- Fixed sidebar navigation (280px on desktop, collapsible on mobile)
- Main content area with max-width 1400px
- Floating action buttons for quick actions

### 2.6 Components

#### Navigation Sidebar
- Logo at top
- Navigation items with icons
- Active state: gradient background with glow effect
- Hover: subtle background change
- Collapse toggle for mobile

#### Cards
- Rounded corners: 16px
- Background: --bg-card
- Border: 1px solid --border-color
- Shadow: 0 4px 24px rgba(0, 0, 0, 0.3)
- Hover: subtle lift effect (transform: translateY(-2px))

#### Buttons
- Primary: Gradient background, white text
- Secondary: Transparent with border
- Danger: Red gradient
- Sizes: sm (32px), md (40px), lg (48px)

#### Charts
- Dark theme with accent colors
- Smooth animations on load
- Interactive tooltips
- Legend positioned appropriately

#### Tables
- Alternating row colors
- Hover highlight
- Sortable columns
- Pagination

#### Forms
- Dark input backgrounds
- Focus: accent border glow
- Labels above inputs
- Validation states

#### Calendar
- Grid layout for month view
- Color-coded events (income = green, expense = red)
- Today highlight

---

## 3. Functionality Specification

### 3.1 Pages & Routes

```
/                       → Dashboard (overview)
/accounts               → Bank accounts management
/investments            → Investments management
/investments/[platform] → Platform-specific details
/debts                  → Debts management
/expenses/fixed         → Fixed expenses
/expenses/variable      → Variable expenses
/income                 → Income sources
/calendar               → Financial calendar
/settings               → App settings
```

### 3.2 Core Features

#### Dashboard
- **Total Wealth Card:** Sum of all accounts + investments - debts
- **Investments Total Card:** Sum of all investment values
- **Debts Total Card:** Sum of all outstanding debts
- **Monthly Cashflow Card:** Income - (Fixed Expenses + Average Variable)
- **Wealth Evolution Chart:** Line chart showing 12-month trend
- **Expenses Distribution:** Pie chart by category
- **Income vs Expenses:** Bar chart comparison
- **Upcoming Payments:** Next 7 days list
- **Top Platforms:** Investment distribution pie chart

#### Accounts Management
- List all accounts with balance
- Add new account (name, type, balance, notes)
- Edit existing account
- Delete account
- Last update timestamp

#### Investments Management
- **Platforms:** XTB, Trading212, Revolut Stocks, Revolut Cripto, Revolut CFD, Robo Advisor
- Each platform has its own view
- Add/edit/delete assets manually
- Auto-update prices via Yahoo Finance API
- Calculate profitability (current value - invested value)
- Show allocation percentages
- Total by platform and overall

#### Debts Management
- List all debts with details
- Add/edit/delete debts
- Show monthly payment total
- Show total debt
- Calculate payoff projection

#### Fixed Expenses
- List all fixed expenses
- Group by frequency (monthly, quarterly, annual)
- Show next payment date
- Calendar view with payment dates
- Total monthly equivalent

#### Variable Expenses
- List all variable expenses
- Filter by category and date range
- Monthly totals by category
- Charts showing trends

#### Income Management
- List all income sources
- Frequency (monthly, bi-weekly, etc.)
- Project annual/monthly totals
- Upcoming income list

#### Financial Calendar
- Month view with events
- Color-coded: Income (green), Expenses (red), Debt payments (orange)
- List view option
- Filter by type

### 3.3 Data Structure

#### Accounts
```typescript
interface Account {
  id: string;
  nome: string;
  tipo: string;
  saldo: number;
  data_atualizacao: string;
  notas?: string;
}
```

#### Investments
```typescript
interface Investment {
  id: string;
  plataforma: 'XTB' | 'Trading212' | 'Revolut Stocks' | 'Revolut Cripto' | 'Revolut CFD' | 'Robo Advisor';
  carteira?: string; // For Trading212 pies
  ticker: string;
  nome: string;
  quantidade: number;
  preco_medio: number;
  preco_atual: number;
  valor_atual: number;
  data_atualizacao: string;
  posicao?: 'long' | 'short'; // For CFDs
  alocacao_alvo?: number; // For Robo Advisor
}
```

#### Debts
```typescript
interface Debt {
  id: string;
  nome: string;
  valor_total: number;
  prestacao_mensal: number;
  data_pagamento: number; // Day of month
  conta: string;
  categoria: string;
  taxa_juro?: number;
  data_fim?: string;
}
```

#### Fixed Expenses
```typescript
interface FixedExpense {
  id: string;
  nome: string;
  valor: number;
  frequencia: 'mensal' | 'trimestral' | 'anual';
  data_pagamento: number;
  conta: string;
  categoria: string;
}
```

#### Variable Expenses
```typescript
interface VariableExpense {
  id: string;
  nome: string;
  valor: number;
  data: string;
  conta: string;
  categoria: 'Supermercado' | 'Combustível' | 'Restaurantes' | 'Compras' | 'Diversos';
}
```

#### Income
```typescript
interface Income {
  id: string;
  nome: string;
  valor: number;
  frequencia: 'mensal' | 'quinzenal' | 'semanal' | 'anual';
  data: number;
  conta: string;
}
```

### 3.4 Yahoo Finance Integration

- Use Yahoo Finance API (free tier)
- Supported tickers for crypto: BTC-USD, ETH-USD, etc.
- Update prices on page load and manual refresh
- Fallback to manual entry if API fails

---

## 4. Initial Data

### Accounts
1. Montepio - €5,000
2. N26 - €2,500
3. Revolut Bank - €3,200

### Investments (Sample)
**XTB:**
- AAPL (Apple) - 50 shares @ €150 avg
- TSLA (Tesla) - 20 shares @ €200 avg
- NVDA (NVIDIA) - 10 shares @ €400 avg

**Trading212:**
- "Tech Growth" pie with multiple holdings
- "Dividends" pie with dividend stocks

**Revolut Stocks:**
- VOO (Vanguard S&P 500) - 25 shares @ €380 avg
- VWCE (Vanguard World) - 100 shares @ €95 avg

**Revolut Cripto:**
- BTC-USD - 0.05 @ €35,000 avg
- ETH-USD - 0.5 @ €2,000 avg

**Robo Advisor Revolut:**
- Various ETFs with target allocation

### Debts
1. Cartão Montepio - €1,500
2. Cartão Cetelem - €3,000
3. Crédito Automóvel - €15,000
4. Crédito Pessoal Cetelem - €8,000
5. Finanças - €500
6. Segurança Social - €200

### Fixed Expenses
1. Seguro automóvel - €300 (trimestral)
2. Pensão de alimentos - €500 (mensal)
3. IUC - €50 (anual)
4. ACP - €60 (anual)
5. ChatGPT - €20 (mensal)
6. Ginásio - €40 (mensal)
7. Canva - €15 (mensal)
8. Freepik - €15 (mensal)
9. Domínio + alojamento - €100 (anual)
10. Telemóveis - €50 (mensal)

### Variable Expenses (Sample - Last Month)
- Supermercado: €450
- Combustível: €120
- Restaurantes: €180
- Compras: €200
- Diversos: €100

### Income
1. Salary - €3,500 (mensal)
2. Freelance - €500 (mensal)

---

## 5. Acceptance Criteria

### Visual
- [ ] Dark theme applied consistently across all pages
- [ ] All colors match specification
- [ ] Typography is consistent with spec
- [ ] Cards have proper shadows and borders
- [ ] Responsive on mobile, tablet, desktop
- [ ] Smooth animations on interactions
- [ ] Charts render correctly with dark theme

### Functionality
- [ ] Can add, edit, delete accounts
- [ ] Can add, edit, delete investments
- [ ] Can add, edit, delete debts
- [ ] Can add, edit, delete fixed expenses
- [ ] Can add, edit, delete variable expenses
- [ ] Can add, edit, delete income
- [ ] Yahoo Finance prices update automatically
- [ ] Dashboard calculations are correct
- [ ] Calendar shows all financial events
- [ ] Charts display correct data
- [ ] Navigation works on all screen sizes

### Performance
- [ ] Page loads under 3 seconds
- [ ] Smooth scrolling and animations
- [ ] No console errors

---

## 6. Technical Stack

- **Framework:** Next.js 16
- **UI:** React 19, CSS Modules
- **Styling:** CSS with CSS Variables
- **Charts:** Recharts
- **Date Handling:** date-fns
- **Icons:** Lucide React
- **State:** React useState/useContext
- **API:** Yahoo Finance (via public API)
- **Data Storage:** LocalStorage (for demo) / Google Sheets ready
