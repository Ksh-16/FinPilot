'use client';

import Navbar from '@/components/Navbar';
import React, { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { authApi } from '@/lib/api';
import { evaluateInvestments } from '@/lib/investmentEngine';
import {
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
  BarChart3,
  BriefcaseBusiness,
  Calculator,
  Clock3,
  LineChart as LineChartIcon,
  PieChart as PieIcon,
  Plus,
  RefreshCw,
  Search,
  Sparkles,
  Trash2,
  TrendingDown,
  TrendingUp,
  Wallet,
} from 'lucide-react';
import {
  Bar,
  BarChart,
  Line,
  LineChart as PriceLineChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  LineChart,
} from 'recharts';

interface Holding {
  _id: string;
  symbol: string;
  name: string;
  assetType: string;
  quantity: number;
  buyPrice: number;
  currentPrice: number;
}

interface MarketItem {
  value: number;
  change: number;
  percentChange: number;
  state: 'up' | 'down';
}

type MarketData = Record<string, MarketItem>;

interface StockSearchResult {
  symbol: string;
  displaySymbol: string;
  name: string;
  exchange: string;
  quoteType: string;
}

const allocationClasses = [
  'bg-emerald-500',
  'bg-blue-500',
  'bg-amber-500',
  'bg-violet-500',
  'bg-pink-500',
];

const API_BASE_URL = '/api';

export default function InvestmentsPage() {
  const router = useRouter();

  const [holdings, setHoldings] = useState<Holding[]>([]);
  const [marketData, setMarketData] = useState<MarketData | null>(null);
  const [marketError, setMarketError] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [priceLoading, setPriceLoading] = useState(false);
  const [reliancePrice, setReliancePrice] = useState<number | null>(null);
  const [priceError, setPriceError] = useState('');
  const [stockChartSymbol, setStockChartSymbol] = useState('RELIANCE');
  const [stockRange, setStockRange] = useState('1M');
  const [stockHistory, setStockHistory] = useState<
    { date: string; price: number }[]
  >([]);
  const [stockHistoryLoading, setStockHistoryLoading] = useState(false);
  const [stockHistoryError, setStockHistoryError] = useState('');
  const [stockSearchQuery, setStockSearchQuery] = useState('');
  const [stockSearchResults, setStockSearchResults] = useState<StockSearchResult[]>([]);
  const [stockSearchLoading, setStockSearchLoading] = useState(false);
  const [stockSearchOpen, setStockSearchOpen] = useState(false);

  // Add investment form
  const [symbol, setSymbol] = useState('RELIANCE');
  const [name, setName] = useState('Reliance Industries');
  const [assetType, setAssetType] = useState('Equity');
  const [quantity, setQuantity] = useState('');
  const [buyPrice, setBuyPrice] = useState('');

  // Discovery / simulator inputs
  const [availableAmount, setAvailableAmount] = useState(50000);
  const [monthlyInvestment, setMonthlyInvestment] = useState(10000);
  const [riskTolerance, setRiskTolerance] =
    useState<'Low' | 'Moderate' | 'High'>('Moderate');
  const [expectedReturn, setExpectedReturn] = useState(12);
  const [horizon, setHorizon] = useState(10);
  const [initInv, setInitInv] = useState(100000);

  const fetchPortfolio = async () => {
    try {
      const token = authApi.getToken();
      const res = await fetch(`${API_BASE_URL}/portfolio`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();

      if (!data.success) return;

      const portfolio = data.data || [];

      // Fetch current Yahoo Finance prices for every equity holding.
      const equitySymbols = [
        'RELIANCE',
        ...portfolio
          .filter((h: Holding) => h.assetType === 'Equity' && h.symbol)
          .map((h: Holding) => h.symbol.trim().toUpperCase()),
      ];

      if (equitySymbols.length === 0) {
        setHoldings(portfolio);
        return;
      }

      setPriceLoading(true);
      setPriceError('');

      try {
        const symbols = [...new Set(equitySymbols)].join(',');
        const priceRes = await fetch(
          `${API_BASE_URL}/market/prices?symbols=${encodeURIComponent(symbols)}`
        );
        const priceData = await priceRes.json();

        if (!priceData.success) {
          throw new Error(priceData.error || 'Unable to fetch stock prices');
        }

        const prices = priceData.data || {};

        const updatedPortfolio = portfolio.map((holding: Holding) => {
          const key = holding.symbol.trim().toUpperCase();
          const live = prices[key];

          return live
            ? { ...holding, currentPrice: Number(live.value) }
            : holding;
        });

        setHoldings(updatedPortfolio);

        const reliance = prices['RELIANCE'];
        if (reliance) {
          setReliancePrice(Number(reliance.value));
        }
      } catch (priceErr) {
        console.error('Stock price fetch error:', priceErr);
        setPriceError('Current stock prices are temporarily unavailable.');
        setHoldings(portfolio);
      } finally {
        setPriceLoading(false);
      }
    } catch (err) {
      console.error('Portfolio fetch error:', err);
    }
  };

  const fetchStockHistory = async (symbolValue = stockChartSymbol, range = stockRange) => {
    try {
      setStockHistoryLoading(true);
      setStockHistoryError('');

      const res = await fetch(
        `${API_BASE_URL}/market/history?symbol=${encodeURIComponent(
          symbolValue
        )}&range=${encodeURIComponent(range)}`
      );
      const data = await res.json();

      if (!data.success) {
        throw new Error(data.error || 'Unable to fetch stock history');
      }

      setStockHistory(data.data || []);
    } catch (err) {
      console.error('Stock history fetch error:', err);
      setStockHistoryError(`Unable to load ${symbolValue} price history.`);
      setStockHistory([]);
    } finally {
      setStockHistoryLoading(false);
    }
  };

  const fetchMarket = async () => {
    try {
      setRefreshing(true);

      const res = await fetch(`${API_BASE_URL}/market/overview`);
      const data = await res.json();

      if (data.success) {
        setMarketData(data.data);
        setMarketError(false);
      } else {
        setMarketError(true);
      }
    } catch (err) {
      console.error('Market fetch error:', err);
      setMarketError(true);
    } finally {
      setRefreshing(false);
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = authApi.getToken();

    if (!token) {
      setIsAuthenticated(false);
      setLoading(false);
      return;
    }

    setIsAuthenticated(true);

    fetchPortfolio();
    fetchMarket();

    // Keep polling, but only once per minute.
    const interval = setInterval(fetchMarket, 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      fetchStockHistory(stockChartSymbol, stockRange);
    }
  }, [stockChartSymbol, stockRange, isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated || stockSearchQuery.trim().length < 2) {
      setStockSearchResults([]);
      setStockSearchLoading(false);
      return;
    }

    const controller = new AbortController();
    const timer = setTimeout(async () => {
      try {
        setStockSearchLoading(true);
        const res = await fetch(
          `${API_BASE_URL}/market/search?q=${encodeURIComponent(stockSearchQuery.trim())}`,
          { signal: controller.signal }
        );
        const data = await res.json();

        if (!data.success) {
          throw new Error(data.error || 'Unable to search stocks');
        }

        setStockSearchResults(data.data || []);
        setStockSearchOpen(true);
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          console.error('Stock search error:', err);
          setStockSearchResults([]);
        }
      } finally {
        if (!controller.signal.aborted) {
          setStockSearchLoading(false);
        }
      }
    }, 350);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [stockSearchQuery, isAuthenticated]);

  const selectStock = (result: StockSearchResult) => {
    const selected = result.displaySymbol || result.symbol;
    setStockChartSymbol(selected);
    setStockSearchQuery('');
    setStockSearchResults([]);
    setStockSearchOpen(false);
  };

  const handleRefresh = async () => {
    await fetchPortfolio();
    await fetchMarket();
    await fetchStockHistory(stockChartSymbol, stockRange);
  };

  const handleAddHolding = async (e: React.FormEvent) => {
    e.preventDefault();

    const token = authApi.getToken();

    try {
      const res = await fetch(`${API_BASE_URL}/portfolio`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          symbol: symbol.trim().toUpperCase(),
          name,
          assetType,
          quantity: Number(quantity),
          buyPrice: Number(buyPrice),
        }),
      });

      const data = await res.json();

      if (data.success) {
        setSymbol('RELIANCE');
        setName('Reliance Industries');
        setQuantity('');
        setBuyPrice('');
        await fetchPortfolio();
      }
    } catch (err) {
      console.error('Add holding error:', err);
    }
  };

  const handleDeleteHolding = async (id: string) => {
    const token = authApi.getToken();

    try {
      await fetch(`${API_BASE_URL}/portfolio/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      await fetchPortfolio();
    } catch (err) {
      console.error('Delete holding error:', err);
    }
  };

  const totalInvested = useMemo(
    () =>
      holdings.reduce(
        (sum, h) => sum + Number(h.quantity || 0) * Number(h.buyPrice || 0),
        0
      ),
    [holdings]
  );

  const currentValue = useMemo(
    () =>
      holdings.reduce(
        (sum, h) =>
          sum +
          Number(h.quantity || 0) *
            Number(h.currentPrice || h.buyPrice || 0),
        0
      ),
    [holdings]
  );

  const totalGain = currentValue - totalInvested;
  const gainPercent =
    totalInvested > 0 ? (totalGain / totalInvested) * 100 : 0;

  const assetAlloc = useMemo(
    () =>
      holdings.reduce((acc: Record<string, number>, h) => {
        const value =
          Number(h.quantity || 0) *
          Number(h.currentPrice || h.buyPrice || 0);

        acc[h.assetType] = (acc[h.assetType] || 0) + value;
        return acc;
      }, {}),
    [holdings]
  );

  const assetAllocArray = Object.keys(assetAlloc).map((key) => ({
    name: key,
    value: assetAlloc[key],
    percentage:
      currentValue > 0 ? (assetAlloc[key] / currentValue) * 100 : 0,
  }));

  const rawAssetAlloc = holdings.reduce(
    (acc: Record<string, number>, h) => {
      acc[h.assetType] =
        (acc[h.assetType] || 0) +
        Number(h.quantity || 0) * Number(h.buyPrice || 0);
      return acc;
    },
    {}
  );

  const recommendations = evaluateInvestments({
    availableAmount,
    monthlyInvestment,
    riskTolerance,
    horizonYears: horizon,
    healthScore: 80,
    currentAllocation: rawAssetAlloc,
  });

  const calculateFV = (rate: number) => {
    const r = rate / 12 / 100;
    const n = horizon * 12;

    if (r === 0) return Math.round(initInv + monthlyInvestment * n);

    const fvInit = initInv * Math.pow(1 + r, n);
    const fvMonthly =
      monthlyInvestment * ((Math.pow(1 + r, n) - 1) / r);

    return Math.round(fvInit + fvMonthly);
  };

  const chartData = useMemo(() => {
    const r = expectedReturn / 12 / 100;
    const points = [];

    for (let year = 0; year <= horizon; year += horizon > 15 ? 5 : 1) {
      const months = year * 12;

      const corpus =
        r === 0
          ? initInv + monthlyInvestment * months
          : initInv * Math.pow(1 + r, months) +
            monthlyInvestment *
              ((Math.pow(1 + r, months) - 1) / r);

      points.push({
        year: `Yr ${year}`,
        corpus: Math.round(corpus),
      });
    }

    return points;
  }, [expectedReturn, horizon, initInv, monthlyInvestment]);

  const marketCards = [
    { key: 'nifty50', label: 'NIFTY 50', exchange: 'NSE' },
    { key: 'sensex', label: 'SENSEX', exchange: 'BSE' },
    { key: 'bankNifty', label: 'NIFTY BANK', exchange: 'NSE' },
  ];

  

  return (
    <div className="min-h-screen bg-[#070b12] text-white">
      <Navbar />

      <main className="mx-auto max-w-7xl space-y-8 px-4 py-6 md:px-6 lg:py-8">
        {/* Header */}
        <section className="flex flex-col justify-between gap-4 border-b border-slate-800 pb-6 md:flex-row md:items-end">
          <div>
            <div className="mb-2 flex items-center gap-2 text-sm text-emerald-400">
              <BriefcaseBusiness className="h-4 w-4" />
              Personal Investment Center
            </div>
            <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
              Investments
            </h1>
            <p className="mt-2 text-slate-400">
              Track your portfolio, understand the market and make
              data-driven investment decisions.
            </p>
          </div>

          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center justify-center gap-2 rounded-lg border border-slate-700 bg-slate-900 px-4 py-2.5 text-sm font-semibold hover:bg-slate-800 disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh Data
          </button>
        </section>

        {/* Market Overview */}
        <section className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-bold">Market Overview</h2>
              <p className="text-sm text-slate-500">
                Indian market indices
              </p>
            </div>

            <div className="flex items-center gap-2 text-xs text-slate-400">
              <span
                className={`h-2 w-2 rounded-full ${
                  marketError ? 'bg-amber-400' : 'bg-emerald-400'
                }`}
              />
              {marketError ? 'Data unavailable' : 'Live / provider data'}
            </div>
          </div>

          {marketError ? (
            <div className="flex items-center gap-3 rounded-xl border border-amber-500/20 bg-amber-500/10 p-4 text-sm text-amber-300">
              <AlertTriangle className="h-5 w-5 shrink-0" />
              Market provider is temporarily unavailable or rate-limited.
              Your portfolio remains available.
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-3">
              {marketCards.map((market) => {
                const item = marketData?.[market.key];

                return (
                  <div
                    key={market.key}
                    className="glass-card rounded-2xl border border-slate-800/80 p-5"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-sm font-medium text-slate-400">
                          {market.label}
                        </p>
                        <p className="mt-2 text-2xl font-bold">
                          {item
                            ? `₹${Number(item.value).toLocaleString('en-IN', {
                                maximumFractionDigits: 2,
                              })}`
                            : '—'}
                        </p>
                      </div>

                      {item && (
                        <div
                          className={`flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold ${
                            item.state === 'up'
                              ? 'bg-emerald-500/10 text-emerald-400'
                              : 'bg-red-500/10 text-red-400'
                          }`}
                        >
                          {item.state === 'up' ? (
                            <ArrowUpRight className="h-3.5 w-3.5" />
                          ) : (
                            <ArrowDownRight className="h-3.5 w-3.5" />
                          )}
                          {Number(item.percentChange).toFixed(2)}%
                        </div>
                      )}
                    </div>

                    <div className="mt-4 flex items-center justify-between border-t border-slate-800 pt-3 text-xs">
                      <span className="text-slate-500">{market.exchange}</span>
                      <span
                        className={
                          item?.state === 'up'
                            ? 'text-emerald-400'
                            : 'text-red-400'
                        }
                      >
                        {item
                          ? `${item.change >= 0 ? '+' : ''}${Number(
                              item.change
                            ).toFixed(2)}`
                          : 'Waiting for data'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* Dynamic Stock Chart */}
        <section className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <LineChartIcon className="h-5 w-5 text-emerald-400" />
                <h2 className="text-xl font-bold">
                  {stockChartSymbol} Price Chart
                </h2>
              </div>
              <p className="text-sm text-slate-500">
                Historical {stockChartSymbol} price movement from Yahoo Finance
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="relative w-full sm:w-[340px]">
                <div className="relative">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                  <input
                    value={stockSearchQuery}
                    onChange={(e) => setStockSearchQuery(e.target.value)}
                    onFocus={() => {
                      if (stockSearchResults.length > 0) setStockSearchOpen(true);
                    }}
                    placeholder="Search any Indian stock..."
                    className="input-field w-full pl-9 pr-9"
                  />
                  {stockSearchQuery && (
                    <button
                      type="button"
                      onClick={() => {
                        setStockSearchQuery('');
                        setStockSearchResults([]);
                        setStockSearchOpen(false);
                      }}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
                    >
                      ×
                    </button>
                  )}
                </div>

                {stockSearchOpen && stockSearchQuery.trim().length >= 2 && (
                  <div className="absolute z-30 mt-2 max-h-72 w-full overflow-y-auto rounded-2xl border border-slate-800 bg-slate-950 shadow-2xl">
                    {stockSearchLoading ? (
                      <div className="px-4 py-4 text-sm text-slate-400">
                        Searching stocks...
                      </div>
                    ) : stockSearchResults.length > 0 ? (
                      stockSearchResults.map((result) => (
                        <button
                          key={result.symbol}
                          type="button"
                          onClick={() => selectStock(result)}
                          className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left hover:bg-slate-900"
                        >
                          <div className="min-w-0">
                            <p className="font-semibold text-white">
                              {result.displaySymbol}
                            </p>
                            <p className="truncate text-xs text-slate-500">
                              {result.name}
                            </p>
                          </div>
                          <span className="shrink-0 text-xs text-emerald-400">
                            {result.exchange}
                          </span>
                        </button>
                      ))
                    ) : (
                      <div className="px-4 py-4 text-sm text-slate-400">
                        No supported Indian stock found. Try a ticker like TCS, INFY or HDFCBANK.
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-950/60 px-3 py-2 text-sm">
                <span className="text-slate-500">Viewing</span>
                <span className="font-bold text-white">{stockChartSymbol}</span>
              </div>

              <div className="flex items-center gap-1 rounded-xl border border-slate-800 bg-slate-950/60 p-1">
                {['1D', '1W', '1M', '6M', '1Y'].map((range) => (
                  <button
                    key={range}
                    onClick={() => setStockRange(range)}
                    className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                      stockRange === range
                        ? 'bg-emerald-500 text-slate-950'
                        : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                    }`}
                  >
                    {range}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="glass-card rounded-2xl p-5">
            {stockHistoryLoading ? (
              <div className="flex h-80 items-center justify-center text-sm text-slate-400">
                Loading {stockChartSymbol} price history...
              </div>
            ) : stockHistoryError ? (
              <div className="flex h-80 items-center justify-center text-sm text-amber-300">
                {stockHistoryError}
              </div>
            ) : stockHistory.length === 0 ? (
              <div className="flex h-80 items-center justify-center text-sm text-slate-400">
                No historical price data available for {stockChartSymbol}.
              </div>
            ) : (
              <div className="h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PriceLineChart data={stockHistory}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="rgba(148,163,184,0.12)"
                    />
                    <XAxis
                      dataKey="date"
                      tick={{ fontSize: 11, fill: '#94a3b8' }}
                      minTickGap={35}
                    />
                    <YAxis
                      tick={{ fontSize: 11, fill: '#94a3b8' }}
                      tickFormatter={(value) =>
                        `₹${Number(value).toLocaleString('en-IN')}`
                      }
                      width={75}
                      domain={['auto', 'auto']}
                    />
                    <Tooltip
                      formatter={(value: number) => [
                        `₹${Number(value).toLocaleString('en-IN', {
                          maximumFractionDigits: 2,
                        })}`,
                        stockChartSymbol,
                      ]}
                    />
                    <Line
                      type="monotone"
                      dataKey="price"
                      stroke="#34d399"
                      strokeWidth={2.5}
                      dot={false}
                      activeDot={{ r: 5 }}
                    />
                  </PriceLineChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          <p className="text-xs text-slate-500">
            Historical market data is provided through Yahoo Finance/yfinance
            and may be delayed. This chart is for informational purposes only.
          </p>
        </section>

        {/* Portfolio Snapshot */}
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <Wallet className="h-5 w-5 text-emerald-400" />
            <h2 className="text-xl font-bold">Portfolio Snapshot</h2>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="glass-card rounded-2xl p-5">
              <p className="text-sm text-slate-400">Total Invested</p>
              <p className="mt-2 text-2xl font-bold">
                ₹{totalInvested.toLocaleString('en-IN')}
              </p>
            </div>

            <div className="glass-card rounded-2xl p-5">
              <p className="text-sm text-slate-400">Current Value</p>
              <p className="mt-2 text-2xl font-bold">
                ₹{currentValue.toLocaleString('en-IN')}
              </p>
            </div>

            <div className="glass-card rounded-2xl p-5">
              <p className="text-sm text-slate-400">Total Gain / Loss</p>
              <p
                className={`mt-2 text-2xl font-bold ${
                  totalGain >= 0 ? 'text-emerald-400' : 'text-red-400'
                }`}
              >
                {totalGain >= 0 ? '+' : '-'}₹
                {Math.abs(totalGain).toLocaleString('en-IN')}
              </p>
            </div>

            <div className="glass-card rounded-2xl p-5">
              <p className="text-sm text-slate-400">Overall Return</p>
              <p
                className={`mt-2 text-2xl font-bold ${
                  gainPercent >= 0 ? 'text-emerald-400' : 'text-red-400'
                }`}
              >
                {gainPercent >= 0 ? '+' : ''}
                {gainPercent.toFixed(2)}%
              </p>
            </div>
          </div>
        </section>

        {/* Allocation + Holdings */}
        <section className="grid gap-6 lg:grid-cols-[0.9fr_1.6fr]">
          <div className="glass-panel rounded-2xl p-5">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="font-bold">Portfolio Allocation</h2>
                <p className="mt-1 text-xs text-slate-500">
                  Where your money is currently invested
                </p>
              </div>
              <PieIcon className="h-5 w-5 text-blue-400" />
            </div>

            {assetAllocArray.length === 0 ? (
              <div className="py-10 text-center text-sm text-slate-500">
                Add your first investment to see allocation.
              </div>
            ) : (
              <>
                <div className="flex h-4 overflow-hidden rounded-full bg-slate-800">
                  {assetAllocArray.map((item, index) => (
                    <div
                      key={item.name}
                      className={`${allocationClasses[index % allocationClasses.length]} transition-all`}
                      style={{ width: `${item.percentage}%` }}
                      title={`${item.name}: ${item.percentage.toFixed(1)}%`}
                    />
                  ))}
                </div>

                <div className="mt-5 space-y-3">
                  {assetAllocArray.map((item, index) => (
                    <div
                      key={item.name}
                      className="flex items-center justify-between text-sm"
                    >
                      <div className="flex items-center gap-2">
                        <span
                          className={`h-2.5 w-2.5 rounded-full ${
                            allocationClasses[index % allocationClasses.length]
                          }`}
                        />
                        <span className="text-slate-300">{item.name}</span>
                      </div>
                      <span className="font-semibold">
                        {item.percentage.toFixed(1)}%
                      </span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>

          <div className="glass-panel overflow-hidden rounded-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 p-5">
              <div>
                <h2 className="font-bold">My Holdings</h2>
                <p className="mt-1 text-xs text-slate-500">
                  Track your investments and current value
                </p>
              </div>
              <span className="rounded-full bg-slate-800 px-3 py-1 text-xs text-slate-400">
                {holdings.length} assets
              </span>
            </div>

            {holdings.length === 0 ? (
              <div className="p-10 text-center text-sm text-slate-500">
                No holdings yet. Add an investment below.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-900/70 text-xs uppercase text-slate-500">
                    <tr>
                      <th className="p-4">Asset</th>
                      <th className="p-4">Qty</th>
                      <th className="p-4">Buy Price</th>
                      <th className="p-4">Current</th>
                      <th className="p-4">P/L</th>
                      <th className="p-4"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {holdings.map((h) => {
                      const invested =
                        Number(h.quantity) * Number(h.buyPrice);
                      const value =
                        Number(h.quantity) *
                        Number(h.currentPrice || h.buyPrice);
                      const pnl = value - invested;

                      return (
                        <tr
                          key={h._id}
                          className="border-t border-slate-800/80"
                        >
                          <td className="p-4">
                            <div className="font-semibold text-white">
                              {h.symbol}
                            </div>
                            <div className="text-xs text-slate-500">
                              {h.name}
                            </div>
                          </td>
                          <td className="p-4 text-slate-300">{h.quantity}</td>
                          <td className="p-4">
                            ₹{Number(h.buyPrice).toLocaleString('en-IN')}
                          </td>
                          <td className="p-4">
                            ₹
                            {Number(
                              h.currentPrice || h.buyPrice
                            ).toLocaleString('en-IN')}
                          </td>
                          <td
                            className={`p-4 font-semibold ${
                              pnl >= 0
                                ? 'text-emerald-400'
                                : 'text-red-400'
                            }`}
                          >
                            {pnl >= 0 ? '+' : '-'}₹
                            {Math.abs(pnl).toLocaleString('en-IN')}
                          </td>
                          <td className="p-4">
                            <button
                              onClick={() => handleDeleteHolding(h._id)}
                              className="rounded-lg p-2 text-red-400 hover:bg-red-500/10"
                              title="Delete holding"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </section>

        {/* RELIANCE Quick Add / Live Price */}
        <section className="glass-panel rounded-2xl border border-blue-500/20 p-5">
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
            <div>
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-blue-400" />
                <h2 className="text-lg font-bold">RELIANCE Live Price</h2>
              </div>
              <p className="mt-1 text-sm text-slate-500">
                Yahoo Finance price is used to calculate your current portfolio value.
              </p>
            </div>

            <div className="text-left md:text-right">
              <p className="text-xs uppercase tracking-wider text-slate-500">RELIANCE</p>
              <p className="mt-1 text-2xl font-bold">
                {priceLoading
                  ? 'Updating...'
                  : reliancePrice !== null
                    ? `₹${reliancePrice.toLocaleString('en-IN', {
                        maximumFractionDigits: 2,
                      })}`
                    : '—'}
              </p>
              {priceError && (
                <p className="mt-1 text-xs text-amber-400">{priceError}</p>
              )}
            </div>
          </div>
        </section>

        {/* Add Investment */}
        <section className="glass-panel rounded-2xl p-5">
          <div className="mb-5 flex items-center gap-2">
            <Plus className="h-5 w-5 text-emerald-400" />
            <div>
              <h2 className="font-bold">Add Investment</h2>
              <p className="text-xs text-slate-500">
                Add stocks, mutual funds, ETFs or other assets to your portfolio.
              </p>
            </div>
          </div>

          <form
            onSubmit={handleAddHolding}
            className="grid gap-3 md:grid-cols-2 lg:grid-cols-6"
          >
            <input
              className="input-field"
              placeholder="Symbol"
              value={symbol}
              onChange={(e) => setSymbol(e.target.value)}
              required
            />
            <input
              className="input-field"
              placeholder="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
            <select
              className="input-field"
              value={assetType}
              onChange={(e) => setAssetType(e.target.value)}
            >
              <option value="Equity">Equity</option>
              <option value="Mutual Funds">Mutual Funds</option>
              <option value="ETFs">ETFs</option>
              <option value="Index Funds">Index Funds</option>
              <option value="Debt / Fixed Income">Debt / Fixed Income</option>
            </select>
            <input
              className="input-field"
              type="number"
              min="0"
              placeholder="Quantity"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              required
            />
            <div>
              <input
                className="input-field"
                type="number"
                min="0"
                placeholder="Buy Price"
                value={buyPrice}
                onChange={(e) => setBuyPrice(e.target.value)}
                required
              />
              {symbol.trim().toUpperCase() === 'RELIANCE' && reliancePrice !== null && (
                <p className="mt-1 text-[11px] text-slate-500">
                  Current: ₹{reliancePrice.toLocaleString('en-IN', {
                    maximumFractionDigits: 2,
                  })}
                </p>
              )}
            </div>
            <button
              type="submit"
              className="btn-primary flex items-center justify-center gap-2 rounded-lg font-semibold"
            >
              <Plus className="h-4 w-4" />
              Add
            </button>
          </form>
        </section>

        {/* Investment Discovery */}
        <section className="space-y-5">
          <div>
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-emerald-400" />
              <h2 className="text-xl font-bold">Investment Discovery</h2>
            </div>
            <p className="mt-1 text-sm text-slate-500">
              Recommendations are matched against your current allocation,
              risk profile and investment horizon.
            </p>
          </div>

          <div className="glass-panel grid gap-4 rounded-2xl p-5 md:grid-cols-3">
            <div>
              <label className="mb-2 block text-xs text-slate-400">
                Available Amount (₹)
              </label>
              <input
                className="input-field"
                type="number"
                value={availableAmount}
                onChange={(e) => setAvailableAmount(Number(e.target.value))}
              />
            </div>

            <div>
              <label className="mb-2 block text-xs text-slate-400">
                Monthly Investment / SIP (₹)
              </label>
              <input
                className="input-field"
                type="number"
                value={monthlyInvestment}
                onChange={(e) => setMonthlyInvestment(Number(e.target.value))}
              />
            </div>

            <div>
              <label className="mb-2 block text-xs text-slate-400">
                Risk Profile
              </label>
              <select
                className="input-field"
                value={riskTolerance}
                onChange={(e) =>
                  setRiskTolerance(e.target.value as 'Low' | 'Moderate' | 'High')
                }
              >
                <option value="Low">Low</option>
                <option value="Moderate">Moderate</option>
                <option value="High">High</option>
              </select>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {recommendations.map((rec) => (
              <div
                key={rec.assetCategory}
                className="glass-card rounded-2xl border border-slate-800 p-5"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-lg font-bold">
                      {rec.assetCategory}
                    </h3>
                    <p className="mt-1 text-xs text-slate-500">
                      Based on your current portfolio
                    </p>
                  </div>

                  <span className="rounded-lg bg-emerald-500/10 px-2.5 py-1 text-xs font-semibold text-emerald-400">
                    {rec.matchScore}/100 match
                  </span>
                </div>

                <div className="mt-4 inline-flex rounded-lg bg-blue-500/10 px-3 py-1.5 text-xs font-semibold text-blue-300">
                  {rec.recommendationLabel}
                </div>

                <ul className="mt-4 space-y-2 text-sm text-slate-400">
                  {rec.reasons.map((reason, index) => (
                    <li key={index} className="flex gap-2">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-400" />
                      {reason}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        {/* Future Value Simulator */}
        <section className="glass-panel rounded-2xl p-5 md:p-6">
          <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
            <div>
              <div className="flex items-center gap-2">
                <Calculator className="h-5 w-5 text-blue-400" />
                <h2 className="text-xl font-bold">
                  Future Investment Simulator
                </h2>
              </div>
              <p className="mt-1 text-sm text-slate-500">
                Compare possible future corpus under different return scenarios.
              </p>
            </div>

            <div className="flex items-center gap-2 text-xs text-blue-300">
              <LineChart className="h-4 w-4" />
              Projection only
            </div>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-4">
            <div>
              <label className="mb-2 block text-xs text-slate-400">
                Initial Amount
              </label>
              <input
                className="input-field"
                type="number"
                value={initInv}
                onChange={(e) => setInitInv(Number(e.target.value))}
              />
            </div>

            <div>
              <label className="mb-2 block text-xs text-slate-400">
                Monthly SIP
              </label>
              <input
                className="input-field"
                type="number"
                value={monthlyInvestment}
                onChange={(e) => setMonthlyInvestment(Number(e.target.value))}
              />
            </div>

            <div>
              <label className="mb-2 block text-xs text-slate-400">
                Expected Return %
              </label>
              <input
                className="input-field"
                type="number"
                value={expectedReturn}
                onChange={(e) => setExpectedReturn(Number(e.target.value))}
              />
            </div>

            <div>
              <label className="mb-2 block text-xs text-slate-400">
                Horizon (Years)
              </label>
              <input
                className="input-field"
                type="number"
                min="1"
                value={horizon}
                onChange={(e) => setHorizon(Number(e.target.value))}
              />
            </div>
          </div>

          <div className="mt-5 grid gap-4 md:grid-cols-3">
            {[
              { label: 'Conservative', rate: 8 },
              { label: 'Moderate', rate: expectedReturn },
              { label: 'Optimistic', rate: 15 },
            ].map((scenario, index) => (
              <div
                key={`${scenario.label}-${scenario.rate}`}
                className={`rounded-xl border p-5 ${
                  index === 1
                    ? 'border-blue-500/30 bg-blue-500/5'
                    : 'border-slate-800 bg-slate-900/50'
                }`}
              >
                <p className="text-xs text-slate-400">
                  {scenario.label} · {scenario.rate}%
                </p>
                <p className="mt-2 text-xl font-bold">
                  ₹{calculateFV(scenario.rate).toLocaleString('en-IN')}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-6 h-72 w-full rounded-xl border border-slate-800 bg-slate-950/40 p-3">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="year" stroke="#64748b" fontSize={12} />
                <YAxis
                  stroke="#64748b"
                  fontSize={12}
                  tickFormatter={(value) =>
                    value >= 100000
                      ? `₹${(value / 100000).toFixed(0)}L`
                      : `₹${Math.round(value / 1000)}K`
                  }
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: 10,
                    color: '#fff',
                  }}
                  formatter={(value: any) => [
                    `₹${Number(value).toLocaleString('en-IN')}`,
                    'Projected Corpus',
                  ]}
                />
                <Bar dataKey="corpus" radius={[5, 5, 0, 0]}>
                  {chartData.map((_, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={index % 2 === 0 ? '#10b981' : '#3b82f6'}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>

        {/* Market insights / feature status */}
        <section className="grid gap-5 md:grid-cols-3">
          <div className="glass-card rounded-2xl p-5">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-emerald-500/10 p-2.5">
                <TrendingUp className="h-5 w-5 text-emerald-400" />
              </div>
              <div>
                <h3 className="font-semibold">Market Updates</h3>
                <p className="text-xs text-slate-500">
                  Refreshes automatically every 60 seconds.
                </p>
              </div>
            </div>
          </div>

          <div className="glass-card rounded-2xl p-5">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-blue-500/10 p-2.5">
                <BarChart3 className="h-5 w-5 text-blue-400" />
              </div>
              <div>
                <h3 className="font-semibold">Portfolio Analytics</h3>
                <p className="text-xs text-slate-500">
                  Allocation, P/L and projected growth in one place.
                </p>
              </div>
            </div>
          </div>

          <div className="glass-card rounded-2xl p-5">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-violet-500/10 p-2.5">
                <Clock3 className="h-5 w-5 text-violet-400" />
              </div>
              <div>
                <h3 className="font-semibold">Long-Term Planning</h3>
                <p className="text-xs text-slate-500">
                  Compare conservative, moderate and optimistic outcomes.
                </p>
              </div>
            </div>
          </div>
        </section>

        <p className="pb-4 text-center text-xs italic text-slate-600">
          Investment projections are illustrative only. Market returns are not
          guaranteed and investing involves market risk.
        </p>
      </main>
    </div>
  );
}
