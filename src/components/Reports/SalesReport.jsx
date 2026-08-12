import React, { useState, useMemo } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  DollarSign, 
  ShoppingBag, 
  Printer, 
  Calendar, 
  User, 
  CreditCard, 
  Banknote, 
  ArrowRightLeft, 
  Award, 
  Eye, 
  Layers, 
  Clock,
  Lock,
  ChevronRight
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { formatCurrency, formatDateTime, formatDateOnly } from '../../utils/formatters';

export default function SalesReport() {
  const { 
    sales, 
    activeRole, 
    activeCashier, 
    cashiers, 
    settings, 
    setCurrentReceiptSale, 
    setIsReceiptModalOpen 
  } = useStore();

  const [dateFilter, setDateFilter] = useState('today'); // 'today' | 'yesterday' | '7days' | '30days' | 'all'
  const [selectedCashierFilter, setSelectedCashierFilter] = useState('all');

  // Filter sales
  const filteredSales = useMemo(() => {
    const now = new Date();
    const todayStr = now.toISOString().slice(0, 10);
    
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().slice(0, 10);

    const sevenDaysAgo = new Date(now);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const thirtyDaysAgo = new Date(now);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    return sales.filter(sale => {
      const saleDateStr = sale.createdAt ? sale.createdAt.slice(0, 10) : '';
      const saleDate = new Date(sale.createdAt);

      // Date match
      let dateMatch = true;
      if (dateFilter === 'today') {
        dateMatch = saleDateStr === todayStr;
      } else if (dateFilter === 'yesterday') {
        dateMatch = saleDateStr === yesterdayStr;
      } else if (dateFilter === '7days') {
        dateMatch = saleDate >= sevenDaysAgo;
      } else if (dateFilter === '30days') {
        dateMatch = saleDate >= thirtyDaysAgo;
      }

      // Cashier match
      let cashierMatch = true;
      if (activeRole === 'cashier') {
        // Cashiers can ONLY see their own sales
        cashierMatch = sale.cashierId === activeCashier.id;
      } else if (selectedCashierFilter !== 'all') {
        cashierMatch = sale.cashierId === selectedCashierFilter;
      }

      return dateMatch && cashierMatch;
    });
  }, [sales, dateFilter, selectedCashierFilter, activeRole, activeCashier]);

  // Aggregated Report Metrics
  const metrics = useMemo(() => {
    const totalRevenue = filteredSales.reduce((acc, s) => acc + (s.total || 0), 0);
    const totalCOGS = filteredSales.reduce((acc, s) => acc + (s.costTotal || 0), 0);
    const totalGrossProfit = totalRevenue - totalCOGS;
    const totalDiscounts = filteredSales.reduce((acc, s) => acc + (s.discount || 0), 0);
    const txCount = filteredSales.length;

    let unitsSold = 0;
    const paymentBreakdown = { Cash: 0, 'POS/Card': 0, Transfer: 0, Other: 0 };
    const productFrequency = {};
    const cashierPerformance = {};

    filteredSales.forEach(s => {
      // Payment breakdown
      const method = s.paymentMethod || 'Cash';
      if (paymentBreakdown[method] !== undefined) {
        paymentBreakdown[method] += s.total;
      } else {
        paymentBreakdown.Other = (paymentBreakdown.Other || 0) + s.total;
      }

      // Cashier breakdown
      const cName = s.cashierName || 'Admin';
      if (!cashierPerformance[cName]) {
        cashierPerformance[cName] = { revenue: 0, count: 0, profit: 0 };
      }
      cashierPerformance[cName].revenue += s.total;
      cashierPerformance[cName].count += 1;
      cashierPerformance[cName].profit += s.grossProfit;

      // Item frequencies & units
      if (s.items && Array.isArray(s.items)) {
        s.items.forEach(it => {
          unitsSold += it.quantity;
          if (!productFrequency[it.name]) {
            productFrequency[it.name] = { name: it.name, qty: 0, totalSales: 0 };
          }
          productFrequency[it.name].qty += it.quantity;
          productFrequency[it.name].totalSales += it.lineTotal;
        });
      }
    });

    const topSellingProducts = Object.values(productFrequency)
      .sort((a, b) => b.qty - a.qty)
      .slice(0, 5);

    const profitMargin = totalRevenue > 0 ? Math.round((totalGrossProfit / totalRevenue) * 100) : 0;

    return {
      totalRevenue,
      totalCOGS,
      totalGrossProfit,
      profitMargin,
      totalDiscounts,
      txCount,
      unitsSold,
      paymentBreakdown,
      cashierPerformance,
      topSellingProducts,
    };
  }, [filteredSales]);

  const handleReprintReceipt = (sale) => {
    setCurrentReceiptSale(sale);
    setIsReceiptModalOpen(true);
  };

  return (
    <div className="page-container animate-fade-in">
      {/* Report Header */}
      <div className="page-header-row">
        <div>
          <h1 className="page-title text-2xl font-black text-white flex items-center gap-2.5">
            <BarChart3 size={28} className="text-emerald-400" />
            {activeRole === 'admin' ? 'End-of-Day Sales & Profit Report' : 'End-of-Day Cashier Sales Report'}
          </h1>
          <p className="page-subtitle text-xs text-slate-400 mt-0.5">
            {activeRole === 'admin' 
              ? 'Complete financial breakdown: Revenue, Cost of Goods Sold, and Gross Profit'
              : 'Your daily sales performance, completed transactions, and payment summary'}
          </p>
        </div>

        {/* Date Filter Buttons */}
        <div className="flex items-center gap-1.5 bg-slate-900 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => setDateFilter('today')}
            className={`filter-btn-pill ${dateFilter === 'today' ? 'active' : ''}`}
          >
            Today
          </button>
          <button
            onClick={() => setDateFilter('yesterday')}
            className={`filter-btn-pill ${dateFilter === 'yesterday' ? 'active' : ''}`}
          >
            Yesterday
          </button>
          <button
            onClick={() => setDateFilter('7days')}
            className={`filter-btn-pill ${dateFilter === '7days' ? 'active' : ''}`}
          >
            Last 7 Days
          </button>
          <button
            onClick={() => setDateFilter('30days')}
            className={`filter-btn-pill ${dateFilter === '30days' ? 'active' : ''}`}
          >
            Last 30 Days
          </button>
          <button
            onClick={() => setDateFilter('all')}
            className={`filter-btn-pill ${dateFilter === 'all' ? 'active' : ''}`}
          >
            All Time
          </button>
        </div>
      </div>

      {/* Cashier Filter Dropdown (Admin Only) */}
      {activeRole === 'admin' && (
        <div className="flex items-center justify-between mb-6 p-3 rounded-xl bg-slate-900/60 border border-slate-800">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
            <User size={15} className="text-emerald-400" />
            <span>Filter by Cashier:</span>
          </div>
          <select
            value={selectedCashierFilter}
            onChange={(e) => setSelectedCashierFilter(e.target.value)}
            className="input-select text-xs py-1.5 px-3 min-w-[200px]"
          >
            <option value="all">All Cashiers (Combined Store Total)</option>
            {cashiers.map(c => (
              <option key={c.id} value={c.id}>{c.name} ({c.cashierCode})</option>
            ))}
          </select>
        </div>
      )}

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {/* Revenue */}
        <div className="metric-card">
          <div className="metric-icon-box bg-emerald-500/10 text-emerald-400">
            <TrendingUp size={22} />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Sales Revenue</p>
            <h3 className="text-2xl font-black font-mono text-white mt-0.5">
              {formatCurrency(metrics.totalRevenue, settings.currency)}
            </h3>
            <p className="text-[11px] text-slate-500 mt-0.5">{metrics.txCount} transactions completed</p>
          </div>
        </div>

        {/* GROSS PROFIT CARD — STRICTLY FOR ADMIN / OWNER ONLY */}
        {activeRole === 'admin' ? (
          <div className="metric-card gross-profit-card">
            <div className="metric-icon-box bg-emerald-500/20 text-emerald-300">
              <DollarSign size={22} />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <p className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">Total Gross Profit</p>
                <span className="text-[9px] bg-emerald-950 text-emerald-300 px-1 py-0.2 rounded border border-emerald-800 font-bold">
                  Owner Only
                </span>
              </div>
              <h3 className="text-2xl font-black font-mono text-emerald-400 mt-0.5">
                {formatCurrency(metrics.totalGrossProfit, settings.currency)}
              </h3>
              <p className="text-[11px] text-emerald-500/80 mt-0.5">
                Gross Margin: <span className="font-bold font-mono">{metrics.profitMargin}%</span>
              </p>
            </div>
          </div>
        ) : (
          /* Locked card informing cashier that profit is restricted */
          <div className="metric-card border-slate-800 bg-slate-900/40">
            <div className="metric-icon-box bg-slate-800 text-slate-400">
              <Lock size={20} />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Profit Calculations</p>
              <h3 className="text-sm font-bold text-slate-400 mt-1">Restricted to Store Owner</h3>
              <p className="text-[10px] text-slate-500 mt-0.5">Cashier view excludes margin data</p>
            </div>
          </div>
        )}

        {/* Cost of Goods Sold (Admin) or Total Units Sold (Cashier) */}
        {activeRole === 'admin' ? (
          <div className="metric-card">
            <div className="metric-icon-box bg-slate-800 text-slate-300">
              <Layers size={22} />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Cost of Goods Sold (COGS)</p>
              <h3 className="text-2xl font-black font-mono text-slate-200 mt-0.5">
                {formatCurrency(metrics.totalCOGS, settings.currency)}
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5">Discounts given: {formatCurrency(metrics.totalDiscounts, settings.currency)}</p>
            </div>
          </div>
        ) : (
          <div className="metric-card">
            <div className="metric-icon-box bg-sky-500/10 text-sky-400">
              <ShoppingBag size={22} />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Units Sold</p>
              <h3 className="text-2xl font-black font-mono text-white mt-0.5">
                {metrics.unitsSold} units
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5">Across {metrics.txCount} sales</p>
            </div>
          </div>
        )}

        {/* Average Transaction Value */}
        <div className="metric-card">
          <div className="metric-icon-box bg-purple-500/10 text-purple-400">
            <ShoppingBag size={22} />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Average Sale Basket</p>
            <h3 className="text-2xl font-black font-mono text-white mt-0.5">
              {metrics.txCount > 0 
                ? formatCurrency(metrics.totalRevenue / metrics.txCount, settings.currency)
                : formatCurrency(0, settings.currency)
              }
            </h3>
            <p className="text-[11px] text-slate-500 mt-0.5">{metrics.unitsSold} total items</p>
          </div>
        </div>
      </div>

      {/* Payment Method Breakdown & Top Selling Items Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Payment Methods */}
        <div className="report-box p-4 rounded-xl bg-slate-900/60 border border-slate-800">
          <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
            <CreditCard size={17} className="text-emerald-400" />
            <span>Sales by Payment Method</span>
          </h3>

          <div className="space-y-3">
            {/* Cash */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-300 flex items-center gap-1.5">
                  <Banknote size={14} className="text-emerald-400" /> Cash
                </span>
                <span className="font-mono font-bold text-white">
                  {formatCurrency(metrics.paymentBreakdown.Cash, settings.currency)}
                </span>
              </div>
              <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-emerald-500 rounded-full" 
                  style={{ width: `${metrics.totalRevenue > 0 ? (metrics.paymentBreakdown.Cash / metrics.totalRevenue) * 100 : 0}%` }}
                ></div>
              </div>
            </div>

            {/* POS / Card */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-300 flex items-center gap-1.5">
                  <CreditCard size={14} className="text-sky-400" /> POS / Card Terminal
                </span>
                <span className="font-mono font-bold text-white">
                  {formatCurrency(metrics.paymentBreakdown['POS/Card'], settings.currency)}
                </span>
              </div>
              <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-sky-500 rounded-full" 
                  style={{ width: `${metrics.totalRevenue > 0 ? (metrics.paymentBreakdown['POS/Card'] / metrics.totalRevenue) * 100 : 0}%` }}
                ></div>
              </div>
            </div>

            {/* Bank Transfer */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-300 flex items-center gap-1.5">
                  <ArrowRightLeft size={14} className="text-amber-400" /> Direct Bank Transfer
                </span>
                <span className="font-mono font-bold text-white">
                  {formatCurrency(metrics.paymentBreakdown.Transfer, settings.currency)}
                </span>
              </div>
              <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-amber-500 rounded-full" 
                  style={{ width: `${metrics.totalRevenue > 0 ? (metrics.paymentBreakdown.Transfer / metrics.totalRevenue) * 100 : 0}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        {/* Top Selling Items */}
        <div className="report-box p-4 rounded-xl bg-slate-900/60 border border-slate-800">
          <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
            <Award size={17} className="text-amber-400" />
            <span>Top-Selling Products</span>
          </h3>

          {metrics.topSellingProducts.length === 0 ? (
            <p className="text-xs text-slate-500 py-4 text-center">No sales recorded for this period.</p>
          ) : (
            <div className="space-y-2">
              {metrics.topSellingProducts.map((prod, idx) => (
                <div key={idx} className="flex items-center justify-between p-2 rounded-lg bg-slate-950/60 border border-slate-800/80">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-xs font-bold text-slate-400 w-4">#{idx + 1}</span>
                    <span className="text-xs font-medium text-white truncate">{prod.name}</span>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-mono font-bold text-emerald-400">
                      {formatCurrency(prod.totalSales, settings.currency)}
                    </div>
                    <div className="text-[10px] text-slate-500">{prod.qty} units sold</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Cashier Performance Table (Admin Only) */}
      {activeRole === 'admin' && Object.keys(metrics.cashierPerformance).length > 0 && (
        <div className="mb-6 p-4 rounded-xl bg-slate-900/60 border border-slate-800">
          <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
            <User size={17} className="text-purple-400" />
            <span>Cashier Performance Breakdown</span>
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 uppercase font-semibold">
                  <th className="py-2 px-3">Cashier</th>
                  <th className="py-2 px-3 text-center">Sales Completed</th>
                  <th className="py-2 px-3 text-right">Revenue Generated</th>
                  <th className="py-2 px-3 text-right">Gross Profit Generated</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {Object.entries(metrics.cashierPerformance).map(([cName, perf], i) => (
                  <tr key={i} className="hover:bg-slate-800/30">
                    <td className="py-2.5 px-3 font-semibold text-white">{cName}</td>
                    <td className="py-2.5 px-3 text-center font-mono text-slate-300">{perf.count}</td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-emerald-400">
                      {formatCurrency(perf.revenue, settings.currency)}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-semibold text-emerald-300">
                      {formatCurrency(perf.profit, settings.currency)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Transaction History Log */}
      <div className="sales-history-section rounded-xl border border-slate-800 overflow-hidden bg-slate-900/40">
        <div className="p-4 bg-slate-900/80 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock size={17} className="text-emerald-400" />
            <h3 className="font-bold text-sm text-white">Recent Transactions Log</h3>
          </div>
          <span className="text-xs font-mono text-slate-400">{filteredSales.length} records</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-900/40 uppercase font-semibold text-slate-400">
                <th className="py-3 px-4">Receipt No</th>
                <th className="py-3 px-4">Date & Time</th>
                <th className="py-3 px-4">Cashier</th>
                <th className="py-3 px-4">Payment</th>
                <th className="py-3 px-4 text-center">Items</th>
                <th className="py-3 px-4 text-right">Total</th>
                {activeRole === 'admin' && <th className="py-3 px-4 text-right">Gross Profit</th>}
                <th className="py-3 px-4 text-right">Receipt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {filteredSales.length === 0 ? (
                <tr>
                  <td colSpan={activeRole === 'admin' ? 8 : 7} className="py-8 text-center text-slate-500">
                    No transactions match this filter.
                  </td>
                </tr>
              ) : (
                filteredSales.map(sale => (
                  <tr key={sale.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-3 px-4 font-mono font-semibold text-white">
                      {sale.receiptNo}
                    </td>
                    <td className="py-3 px-4 text-slate-400">
                      {formatDateTime(sale.createdAt)}
                    </td>
                    <td className="py-3 px-4">
                      {sale.cashierName}
                    </td>
                    <td className="py-3 px-4">
                      <span className="payment-method-pill">{sale.paymentMethod}</span>
                    </td>
                    <td className="py-3 px-4 text-center font-mono">
                      {sale.items?.reduce((a, b) => a + b.quantity, 0) || 0}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-emerald-400">
                      {formatCurrency(sale.total, settings.currency)}
                    </td>
                    {activeRole === 'admin' && (
                      <td className="py-3 px-4 text-right font-mono font-semibold text-emerald-300">
                        {formatCurrency(sale.grossProfit, settings.currency)}
                      </td>
                    )}
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => handleReprintReceipt(sale)}
                        className="btn btn-secondary btn-xs inline-flex items-center gap-1"
                        title="View and reprint thermal receipt"
                      >
                        <Printer size={13} />
                        <span>Print</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
