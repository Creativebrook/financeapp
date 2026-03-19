import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const ticker = searchParams.get('ticker');

  if (!ticker) {
    return NextResponse.json({ error: 'Ticker is required' }, { status: 400 });
  }

  try {
    const response = await fetch(
      `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(ticker)}?interval=1d&range=1d`,
      {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        },
      }
    );

    if (!response.ok) {
      return NextResponse.json({ error: 'Failed to fetch price' }, { status: response.status });
    }

    const data = await response.json();
    const price = data.chart?.result?.[0]?.meta?.regularMarketPrice;

    if (!price) {
      return NextResponse.json({ error: 'Price not found' }, { status: 404 });
    }

    return NextResponse.json({ price });
  } catch (error) {
    console.error('Error fetching price:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
