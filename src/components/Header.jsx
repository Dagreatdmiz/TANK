import React, { useState } from 'react';
import { 
  ShoppingCart, 
  Package, 
  BarChart3, 
  Users, 
  Settings, 
  Crown, 
  Check, 
  ShieldCheck, 
  UserCheck, 
  ChevronDown, 
  Sparkles,
  Edit2,
  X,
  Store,
  Sun,
  Moon
} from 'lucide-react';
import { useStore } from '../context/StoreContext';

export default function Header() {
  const { 
    settings, 
    setSettings,
    toggleTheme,
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
  const [isEditNameModalOpen, setIsEditNameModalOpen] = useState(false);
  const [tempBusinessName, setTempBusinessName] = useState(settings.businessName || '');

  const handleSaveBusinessName = (e) => {
    e.preventDefault();
    if (!tempBusinessName.trim()) return;
    setSettings(prev => ({
      ...prev,
      businessName: tempBusinessName.trim()
    }));
    setIsEditNameModalOpen(false);
  };

  return (
    <header className="app-header">
      <div className="header-container">
        {/* Brand & Store Name */}
        <div className="header-left flex-1 justify-center md:justify-start">
          <div className="brand-badge flex items-center justify-center gap-3 flex-wrap">
            <div 
              className="brand-logo-icon cursor-pointer hover:scale-105 transition-transform shrink-0" 
              onClick={() => setActiveTab('pos')} 
              role="button" 
              tabIndex={0}
              title="TANK Software Logo - Click to return home"
            >
              <span className="font-black text-white tracking-tighter text-lg">TANK</span>
            </div>
            <div className="brand-info text-center md:text-left flex flex-col items-center md:items-start justify-center">
              <div className="flex items-center justify-center md:justify-start gap-2 flex-wrap">
                <h1 className="brand-name font-black text-base tracking-tight text-center">
                  {settings.businessName || 'My Business'}
                </h1>
                <button
                  onClick={() => {
                    setTempBusinessName(settings.businessName || '');
                    setIsEditNameModalOpen(true);
                  }}
                  className="brand-edit-badge-btn"
                  title="Rename your business"
                >
                  <Edit2 size={11} /> Rename Business
                </button>
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
              <p className="brand-subtitle text-[11px] text-slate-400 font-medium text-center md:text-left">
                Software: <strong className="text-emerald-400">TANK POS</strong> • {activeRole === 'admin' ? '👑 Owner / Admin' : `💳 Cashier: ${activeCashier.name}`}
              </p>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="header-nav justify-center">

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
          {/* Background Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="btn-icon p-2 rounded-lg border border-slate-700 bg-slate-800/80 hover:bg-slate-700 text-amber-400"
            title={`Switch to ${settings.theme === 'light' ? 'Clear Dark' : 'Clear Light'} Background Mode`}
          >
            {settings.theme === 'light' ? <Moon size={16} className="text-slate-300" /> : <Sun size={16} className="text-amber-400" />}
          </button>

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
                <div className="dropdown-section-title text-center">Switch Active Role</div>
                
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
                <div className="dropdown-section-title text-center">Cashier Accounts (Profits Hidden)</div>

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

      {/* QUICK EDIT BUSINESS NAME MODAL */}
      {isEditNameModalOpen && (
        <div className="modal-backdrop">
          <div className="modal-card animate-scale-in max-w-md mx-auto">
            <div className="modal-header">
              <div className="modal-title-with-icon">
                <div className="icon-badge primary">
                  <Store size={20} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Customize Business Name</h2>
                  <p className="text-xs text-slate-400">Name your store whatever you like in TANK</p>
                </div>
              </div>
              <button 
                onClick={() => setIsEditNameModalOpen(false)}
                className="btn-icon text-slate-400 hover:text-white"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveBusinessName}>
              <div className="modal-body space-y-4 text-center">
                <div className="text-left">
                  <label className="text-xs font-bold text-slate-300 block mb-1">
                    Store / Business Name *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Ade's Supermarket & Stores"
                    value={tempBusinessName}
                    onChange={(e) => setTempBusinessName(e.target.value)}
                    className="input-field text-sm font-bold w-full"
                    autoFocus
                    required
                  />
                  <p className="text-[11px] text-slate-400 mt-1.5">
                    This name will display across the TANK POS header, thermal receipts, and sales reports.
                  </p>
                </div>
              </div>

              <div className="modal-footer justify-between">
                <button
                  type="button"
                  onClick={() => setIsEditNameModalOpen(false)}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary px-6"
                >
                  <Check size={18} />
                  <span>Save Business Name</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </header>
  );
}

