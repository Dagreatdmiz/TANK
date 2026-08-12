import React, { useState, useMemo, useEffect } from 'react';
import { 
  Search, 
  QrCode, 
  X, 
  TrendingUp, 
  DollarSign, 
  ShoppingBag, 
  AlertTriangle, 
  Plus, 
  Check, 
  Sparkles,
  Package,
  Layers,
  Filter,
  UserCheck
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { formatCurrency, formatDateOnly } from '../../utils/formatters';
import CartSidebar from './CartSidebar';

export default function POSDashboard() {
  const { 
    products, 
    addToCart, 
    cart, 
    openQRScanner, 
    activeRole, 
    activeCashier, 
    sales, 
    settings,
    setActiveTab,
    subscription,
    setIsUpgradeModalOpen
  } = useStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [addedAnimationId, setAddedAnimationId] = useState(null);

  // Extract distinct categories
  const categories = useMemo(() => {
    const set = new Set(products.map(p => p.category).filter(Boolean));
    return ['All', ...Array.from(set)];
  }, [products]);

  // Filter products by search and category
  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchesSearch = 
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.category && p.category.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;

      return matchesSearch && matchesCategory && p.status === 'active';
    });
  }, [products, searchQuery, selectedCategory]);

  // Today's Sales Metrics
  const todayMetrics = useMemo(() => {
    const todayStr = new Date().toISOString().slice(0, 10);
    
    // Filter sales from today
    const todaysSales = sales.filter(s => s.createdAt && s.createdAt.slice(0, 10) === todayStr);
    
    // For cashier: only their sales
    const mySales = activeRole === 'cashier' 
      ? todaysSales.filter(s => s.cashierId === activeCashier.id)
      : todaysSales;

    const totalRevenue = mySales.reduce((acc, s) => acc + (s.total || 0), 0);
    const totalCOGS = mySales.reduce((acc, s) => acc + (s.costTotal || 0), 0);
    const totalGrossProfit = totalRevenue - totalCOGS; // Only for admin
    const txCount = mySales.length;
    const unitsSold = mySales.reduce((acc, s) => {
      return acc + s.items.reduce((iAcc, item) => iAcc + item.quantity, 0);
    }, 0);

    const lowStockCount = products.filter(p => p.stockQty <= (p.lowStockThreshold || 10)).length;

    return {
      totalRevenue,
      totalGrossProfit,
      txCount,
      unitsSold,
      lowStockCount,
    };
  }, [sales, activeRole, activeCashier, products]);

  const handleProductClick = (product) => {
    if (product.stockQty <= 0) return;
    const added = addToCart(product, 1);
    if (added) {
      setAddedAnimationId(product.id);
      setTimeout(() => setAddedAnimationId(null), 400);
    }
  };

  // Hardware barcode scanner listener: rapid keypresses ending in Enter
  useEffect(() => {
    let buffer = '';
    let lastKeyTime = Date.now();

    const handleKeyDown = (e) => {
      // Ignore if user is focused inside a text input
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement?.tagName)) {
        return;
      }

      const currentTime = Date.now();
      if (currentTime - lastKeyTime > 100) {
        buffer = ''; // timeout reset
      }
      lastKeyTime = currentTime;

      if (e.key === 'Enter') {
        if (buffer.length >= 3) {
          e.preventDefault();
          const code = buffer.trim();
          buffer = '';
          const matched = products.find(p => p.sku === code || p.name.toLowerCase().includes(code.toLowerCase()));
          if (matched) {
            addToCart(matched, 1);
          }
        }
      } else if (e.key.length === 1) {
        buffer += e.key;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [products, addToCart]);

  return (
    <div className="pos-layout-container">
      {/* Main POS Left Content */}
      <div className="pos-main-content">
        {/* Metric Summary Cards */}
        <div className="pos-metrics-grid">
          {/* Revenue Metric */}
          <div className="metric-card">
            <div className="metric-icon-box bg-emerald-500/10 text-emerald-400">
              <TrendingUp size={20} />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                {activeRole === 'admin' ? "Today's Total Sales" : "My Sales Today"}
              </p>
              <h3 className="text-xl font-bold font-mono text-white">
                {formatCurrency(todayMetrics.totalRevenue, settings.currency)}
              </h3>
            </div>
          </div>

          {/* GROSS PROFIT METRIC — STRICTLY ONLY SHOWN FOR ADMIN / OWNER */}
          {activeRole === 'admin' ? (
            <div className="metric-card gross-profit-card">
              <div className="metric-icon-box bg-emerald-500/20 text-emerald-300">
                <DollarSign size={20} />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <p className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">
                    Today's Gross Profit
                  </p>
                  <span className="text-[10px] bg-emerald-950 text-emerald-300 px-1.5 py-0.2 rounded border border-emerald-800 font-bold">
                    Admin Only
                  </span>
                </div>
                <h3 className="text-xl font-bold font-mono text-emerald-400">
                  {formatCurrency(todayMetrics.totalGrossProfit, settings.currency)}
                </h3>
              </div>
            </div>
          ) : (
            /* Cashier replacement card (Units Sold) so cashier never sees profit */
            <div className="metric-card">
              <div className="metric-icon-box bg-sky-500/10 text-sky-400">
                <Package size={20} />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Units Sold Today
                </p>
                <h3 className="text-xl font-bold font-mono text-white">
                  {todayMetrics.unitsSold} units
                </h3>
              </div>
            </div>
          )}

          {/* Transactions Count */}
          <div className="metric-card">
            <div className="metric-icon-box bg-blue-500/10 text-blue-400">
              <ShoppingBag size={20} />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                {activeRole === 'admin' ? 'Total Transactions' : 'My Transactions'}
              </p>
              <h3 className="text-xl font-bold font-mono text-white">
                {todayMetrics.txCount}
              </h3>
            </div>
          </div>

          {/* Low Stock Alerts (or Cashier Code badge) */}
          {activeRole === 'admin' ? (
            <div className="metric-card cursor-pointer hover:border-slate-700" onClick={() => setActiveTab('products')}>
              <div className={`metric-icon-box ${todayMetrics.lowStockCount > 0 ? 'bg-amber-500/10 text-amber-400' : 'bg-slate-800 text-slate-400'}`}>
                <AlertTriangle size={20} />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Low Stock Alerts</p>
                <h3 className={`text-xl font-bold font-mono ${todayMetrics.lowStockCount > 0 ? 'text-amber-400' : 'text-slate-300'}`}>
                  {todayMetrics.lowStockCount} items
                </h3>
              </div>
            </div>
          ) : (
            <div className="metric-card">
              <div className="metric-icon-box bg-purple-500/10 text-purple-400">
                <UserCheck size={20} />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Cashier Terminal</p>
                <h3 className="text-sm font-bold text-white truncate">
                  {activeCashier.cashierCode} • {activeCashier.name}
                </h3>
              </div>
            </div>
          )}
        </div>

        {/* LONG SEARCH BAR WITH QR SCANNER ICON ON THE LEFT SIDE */}
        <div className="pos-search-wrapper">
          <div className="pos-search-bar">
            {/* QR SCANNER BUTTON ON THE LEFT SIDE OF THE SEARCH BAR */}
            <button
              type="button"
              onClick={() => openQRScanner('pos')}
              className="scanner-left-btn group"
              title="Open Device Camera QR / Barcode Scanner"
            >
              <div className="scanner-icon-pulse">
                <QrCode size={22} className="text-emerald-400 group-hover:scale-110 transition-transform" />
              </div>
              <span className="scanner-left-label hidden md:inline text-xs font-bold text-emerald-400">
                Scan QR / Barcode
              </span>
            </button>

            <div className="search-divider-vertical"></div>

            {/* SEARCH INPUT */}
            <div className="flex-1 relative flex items-center">
              <Search size={18} className="search-inner-icon text-slate-400 ml-3" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products by name, SKU, or barcode (e.g. Coca-Cola, 890123...)"
                className="pos-search-input pl-10 pr-10 py-3.5 text-sm w-full bg-transparent text-white focus:outline-none"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="search-clear-btn mr-3 text-slate-400 hover:text-white"
                >
                  <X size={16} />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Category Pills Filter */}
        <div className="pos-category-bar">
          <div className="category-pills-scroll">
            {categories.map(cat => {
              const count = cat === 'All' 
                ? products.filter(p => p.status === 'active').length 
                : products.filter(p => p.category === cat && p.status === 'active').length;

              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`category-pill ${selectedCategory === cat ? 'active' : ''}`}
                >
                  <span>{cat}</span>
                  <span className="category-count-badge">{count}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Free plan usage banner if applicable */}
        {subscription.plan === 'free' && (
          <div className="free-limit-alert-banner">
            <div className="flex items-center gap-2">
              <Sparkles size={16} className="text-amber-400" />
              <span className="text-xs font-semibold text-slate-200">
                Free Plan: {products.length} / {subscription.productLimit} products loaded
              </span>
            </div>
            {products.length >= subscription.productLimit && (
              <button
                onClick={() => setIsUpgradeModalOpen(true)}
                className="upgrade-btn-sm"
              >
                Upgrade to Premium
              </button>
            )}
          </div>
        )}

        {/* Interactive Products Grid */}
        <div className="pos-product-section">
          {filteredProducts.length === 0 ? (
            <div className="empty-search-state py-12 text-center">
              <Package size={48} className="mx-auto text-slate-600 mb-3" />
              <h4 className="text-base font-bold text-slate-300">No products found</h4>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                {searchQuery 
                  ? `No items match "${searchQuery}". Try scanning the barcode or check spelling.`
                  : 'No items in this category. Click "Products & Upload" to add new goods.'}
              </p>
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="btn btn-secondary btn-sm mt-3"
                >
                  Clear Search
                </button>
              )}
            </div>
          ) : (
            <div className="product-grid">
              {filteredProducts.map(product => {
                const inCartItem = cart.find(c => c.product.id === product.id);
                const isOutOfStock = product.stockQty <= 0;
                const isLowStock = product.stockQty <= (product.lowStockThreshold || 10) && !isOutOfStock;
                const isRecentlyAdded = addedAnimationId === product.id;

                return (
                  <div
                    key={product.id}
                    onClick={() => handleProductClick(product)}
                    className={`product-card ${isOutOfStock ? 'out-of-stock' : ''} ${isRecentlyAdded ? 'pop-added' : ''}`}
                    role="button"
                    tabIndex={0}
                  >
                    {/* Top Badges */}
                    <div className="product-card-top">
                      <span className="product-category-tag">{product.category || 'General'}</span>
                      {isOutOfStock ? (
                        <span className="stock-badge out">Out of Stock</span>
                      ) : isLowStock ? (
                        <span className="stock-badge low">{product.stockQty} left</span>
                      ) : (
                        <span className="stock-badge in">{product.stockQty} in stock</span>
                      )}
                    </div>

                    {/* Product Icon & Visual */}
                    <div className="product-image-container">
                      <span className="product-emoji-icon">{product.image || '📦'}</span>
                      {inCartItem && (
                        <div className="in-cart-indicator-badge animate-scale-in">
                          {inCartItem.quantity} in cart
                        </div>
                      )}
                    </div>

                    {/* Product Details */}
                    <div className="product-card-info">
                      <h4 className="product-card-title" title={product.name}>
                        {product.name}
                      </h4>
                      <div className="product-card-sku font-mono text-[11px] text-slate-400">
                        {product.sku}
                      </div>

                      <div className="product-card-bottom">
                        <div className="product-price-tag font-mono">
                          {formatCurrency(product.sellingPrice, settings.currency)}
                        </div>
                        <button
                          type="button"
                          disabled={isOutOfStock}
                          className="quick-add-btn"
                          title="Add to cart"
                        >
                          <Plus size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* POS Cart Sidebar Panel */}
      <CartSidebar />
    </div>
  );
}
