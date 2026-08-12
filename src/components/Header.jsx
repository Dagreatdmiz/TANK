import React, { useState } from 'react';
import { 
  ShoppingCart, 
  Package, 
  BarChart3, 
  Users, 
  Settings, 
  Crown, 
  Cloud, 
  Check, 
  ShieldCheck, 
  UserCheck, 
  ChevronDown, 
  LogOut,
  Sparkles,
  Wifi
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { formatCurrency } from '../utils/formatters';

export default function Header() {
  const { 
    settings, 
    subscription, 
    activeTab, 
    setActiveTab, 
    activeRole, 
    activeCashier, 
    cashiers, 
    switchRole, 
    cartTotals, 
    syncStatus,
    setIsUpgradeModalOpen
  } = useStore();

  const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false);

  return (
    <header className="app-header">
      <div className="header-container">
        {/* Brand & Store Name */}
        <div className="header-left">
          <div className="brand-badge" onClick={() => setActiveTab('pos')} role="button" tabIndex={0}>
            <div className="brand-logo-icon">
              <span className="font-extrabold text-white tracking-tighter text-lg">TANK</span>
            </div>
            <div className="brand-info">
              <div className="flex items-center gap-2">
                <h1 className="brand-name font-bold text-base text-white">{settings.businessName || 'TANK POS'}</h1>
                {subscription.plan === 'premium' ? (
                  <span className="plan-pill premium">
                    <Sparkles size={11} /> Premium
                  </span>
                ) : (
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsUpgradeModalOpen(true);
                    }}
                    className="plan-pill free hover:scale-105 transition-transform"
                    title="Click to upgrade"
                  >
                    Free Plan (30 Limit)
                  </button>
                )}
              </div>
              <p className="brand-subtitle text-xs text-slate-400">
                {activeRole === 'admin' ? '👑 Owner / Administrator Mode' : `💳 Cashier: ${activeCashier.name}`}
              </p>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="header-nav">
          <button
            onClick={() => setActiveTab('pos')}
            className={`nav-link ${activeTab === 'pos' ? 'active' : ''}`}
          >
            <ShoppingCart size={17} />
            <span>POS / Checkout</span>
            {cartTotals.totalUnits > 0 && (
              <span className="cart-badge-counter">{cartTotals.totalUnits}</span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('products')}
            className={`nav-link ${activeTab === 'products' ? 'active' : ''}`}
          >
            <Package size={17} />
            <span>Products & Upload</span>
          </button>

          <button
            onClick={() => setActiveTab('reports')}
            className={`nav-link ${activeTab === 'reports' ? 'active' : ''}`}
          >
            <BarChart3 size={17} />
            <span>Sales & Reports</span>
          </button>

          {/* Admin-only navigation options */}
          {activeRole === 'admin' && (
            <>
              <button
                onClick={() => setActiveTab('cashiers')}
                className={`nav-link ${activeTab === 'cashiers' ? 'active' : ''}`}
              >
                <Users size={17} />
                <span>Cashiers</span>
              </button>

              <button
                onClick={() => setActiveTab('settings')}
                className={`nav-link ${activeTab === 'settings' ? 'active' : ''}`}
              >
                <Settings size={17} />
                <span>Settings</span>
              </button>

              <button
                onClick={() => setActiveTab('subscription')}
                className={`nav-link ${activeTab === 'subscription' ? 'active' : ''}`}
              >
                <Crown size={17} className="text-amber-400" />
                <span>Subscription</span>
              </button>
            </>
          )}
        </nav>

        {/* Header Right Controls */}
        <div className="header-right">
          {/* Cloud Sync Status */}
          <div className="sync-status-indicator" title="Transactions synchronized with secure cloud backup">
            <span className={`status-dot ${syncStatus === 'synced' ? 'online' : 'syncing'}`}></span>
            <span className="text-xs font-medium text-slate-300 hidden sm:inline">
              {syncStatus === 'synced' ? 'Cloud Synced' : 'Syncing...'}
            </span>
          </div>

          {/* Role / Cashier Switcher */}
          <div className="relative">
            <button
              onClick={() => setIsRoleDropdownOpen(!isRoleDropdownOpen)}
              className={`role-switcher-btn ${activeRole === 'admin' ? 'admin-role' : 'cashier-role'}`}
            >
              {activeRole === 'admin' ? (
                <>
                  <ShieldCheck size={16} className="text-emerald-400" />
                  <span className="role-text font-semibold text-xs text-white">Owner / Admin</span>
                </>
              ) : (
                <>
                  <UserCheck size={16} className="text-sky-400" />
                  <span className="role-text font-semibold text-xs text-white">{activeCashier.name}</span>
                </>
              )}
              <ChevronDown size={14} className="text-slate-400" />
            </button>

            {/* Dropdown Menu */}
            {isRoleDropdownOpen && (
              <div className="role-dropdown-menu animate-scale-in">
                <div className="dropdown-section-title">Switch Active Role</div>
                
                {/* Admin Role */}
                <button
                  onClick={() => {
                    switchRole('admin');
                    setIsRoleDropdownOpen(false);
                  }}
                  className={`dropdown-item ${activeRole === 'admin' ? 'active' : ''}`}
                >
                  <div className="flex items-center gap-2">
                    <ShieldCheck size={16} className="text-emerald-400" />
                    <div className="text-left">
                      <div className="text-sm font-semibold text-white">Owner / Admin</div>
                      <div className="text-[11px] text-slate-400">View Gross Profit, Reports & Settings</div>
                    </div>
                  </div>
                  {activeRole === 'admin' && <Check size={16} className="text-emerald-400" />}
                </button>

                <div className="dropdown-divider"></div>
                <div className="dropdown-section-title">Cashier Accounts (Profits Hidden)</div>

                {cashiers.map(csh => (
                  <button
                    key={csh.id}
                    onClick={() => {
                      switchRole('cashier', csh.id);
                      setIsRoleDropdownOpen(false);
                    }}
                    className={`dropdown-item ${activeRole === 'cashier' && activeCashier.id === csh.id ? 'active' : ''}`}
                  >
                    <div className="flex items-center gap-2">
                      <UserCheck size={16} className="text-sky-400" />
                      <div className="text-left">
                        <div className="text-sm font-semibold text-white">{csh.name}</div>
                        <div className="text-[11px] text-slate-400">{csh.cashierCode} • Selling POS Only</div>
                      </div>
                    </div>
                    {activeRole === 'cashier' && activeCashier.id === csh.id && (
                      <Check size={16} className="text-sky-400" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
