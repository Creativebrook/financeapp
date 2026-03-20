export function formatCurrency(value: number): string {
  // Smart formatting: big values (>=1000) without decimals, small values with decimals
  // Uses space as thousand separator per design requirements
  if (Math.abs(value) >= 1000) {
    const formatted = new Intl.NumberFormat('pt-PT', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
    // pt-PT doesn't add separators for 4-digit numbers, so we need to add space manually
    const withSeparator = formatted.replace(/(\d{1,3})(?=(\d{3})+(?!\d))/g, '$1 ');
    return withSeparator + ' €';
  }
  // Small values: with 2 decimal places
  const formatted = new Intl.NumberFormat('pt-PT', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
  const withSeparator = formatted.replace(/(\d{1,3})(?=(\d{3})+(?!\d))/g, '$1 ');
  return withSeparator + ' €';
}

export function formatCurrencyDetailed(value: number): string {
  const formatted = new Intl.NumberFormat('pt-PT', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
  const withSeparator = formatted.replace(/(\d{1,3})(?=(\d{3})+(?!\d))/g, '$1 ');
  return withSeparator + ' €';
}

export function formatPercentVariation(value: number): string {
  // Standard format: + 17,3% or - 8,5%
  const sign = value >= 0 ? '+' : '-';
  const absValue = Math.abs(value).toFixed(1).replace('.', ',');
  return `${sign} ${absValue}%`;
}

export function formatNumber(value: number): string {
  return new Intl.NumberFormat('pt-PT').format(value);
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('pt-PT', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date);
}

export function formatDateShort(dateString: string): string {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('pt-PT', {
    day: '2-digit',
    month: 'short',
  }).format(date);
}

export function getDayOfMonth(day: number): string {
  const days = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
  // Use a fixed date for SSR to avoid hydration mismatches
  const date = new Date('2026-03-20T00:00:00Z');
  date.setDate(day);
  return days[date.getDay()];
}

export function getNextPaymentDate(dataPagamento: number): Date {
  // Use a fixed date for SSR to avoid hydration mismatches
  const today = new Date('2026-03-20T00:00:00Z');
  const currentDay = today.getDate();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();
  
  if (currentDay <= dataPagamento) {
    return new Date(currentYear, currentMonth, dataPagamento);
  } else {
    return new Date(currentYear, currentMonth + 1, dataPagamento);
  }
}

export function calculateProfitability(valorAtual: number, precoMedio: number, quantidade: number): number {
  const invested = precoMedio * quantidade;
  return valorAtual - invested;
}

export function calculateProfitabilityPercent(valorAtual: number, precoMedio: number, quantidade: number): number {
  const invested = precoMedio * quantidade;
  if (invested === 0) return 0;
  return ((valorAtual - invested) / invested) * 100;
}

export function getPlatformColor(plataforma: string): string {
  // Using fixed palette for consistent platform colors
  const platformIndex: Record<string, number> = {
    'XTB': 0,
    'Trading212': 1,
    'Revolut Stocks': 2,
    'Revolut Cripto': 3,
    'Revolut CFD': 4,
    'Robo Advisor': 5,
  };
  const index = platformIndex[plataforma] ?? 0;
  const palette = [
    'var(--chart-cat-4)',  // XTB - Red
    'var(--chart-cat-5)',  // Trading212 - Cyan
    'var(--chart-cat-1)',  // Revolut Stocks - Green
    'var(--chart-cat-3)',  // Revolut Cripto - Amber
    'rgb(148, 163, 184)', // Revolut CFD - Gray
    'var(--chart-cat-6)',  // Robo Advisor - Violet
  ];
  return palette[index];
}

export function getCategoryColor(categoria: string): string {
  // Using fixed palette for consistent category colors
  const categoryIndex: Record<string, number> = {
    'Supermercado': 0,
    'Combustível': 1,
    'Restaurantes': 2,
    'Compras': 3,
    'Diversos': 4,
    'Outros': 5,
  };
  const index = categoryIndex[categoria] ?? 0;
  const palette = [
    'var(--chart-cat-1)',  // Supermercado - Green
    'var(--chart-cat-3)',  // Combustível - Amber
    'var(--chart-cat-4)',  // Restaurantes - Red
    'var(--chart-cat-6)',  // Compras - Violet
    'var(--chart-cat-5)',  // Diversos - Cyan
    'var(--chart-cat-2)',  // Outros - Purple
  ];
  return palette[index];
}
