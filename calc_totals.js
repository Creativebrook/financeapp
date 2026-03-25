
const fs = require('fs');
const content = fs.readFileSync('/src/context/FinanceContext.tsx', 'utf8');

const investmentsMatch = content.match(/const initialInvestments: Investment\[\] = \[([\s\S]*?)\];/);
if (investmentsMatch) {
  const investmentsStr = investmentsMatch[1];
  const t212Investments = [];
  const regex = /\{ id: 't212-[\s\S]*?valor_atual: ([\d.]+),[\s\S]*?quantidade: ([\d.]+), preco_medio: ([\d.]+),[\s\S]*?\}/g;
  let match;
  let totalValue = 0;
  let totalInvested = 0;
  while ((match = regex.exec(investmentsStr)) !== null) {
    const value = parseFloat(match[1]);
    const qty = parseFloat(match[2]);
    const avgPrice = parseFloat(match[3]);
    totalValue += value;
    totalInvested += qty * avgPrice;
  }
  console.log('Total Value:', totalValue);
  console.log('Total Invested:', totalInvested);
}
