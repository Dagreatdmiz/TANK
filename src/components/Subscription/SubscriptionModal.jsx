import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { 
  Crown, 
  Check, 
  Sparkles, 
  X, 
  ShieldCheck, 
  Infinity, 
  Users, 
  Cloud, 
  CreditCard, 
  ArrowRight,
  Clock,
  CheckCircle2,
  Lock
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { formatCurrency, formatDateOnly } from '../../utils/formatters';

export default function SubscriptionModal() {
  const { 
    isUpgradeModalOpen, 
    setIsUpgradeModalOpen, 
    subscription, 
    upgradeSubscription, 
    settings,
    products 
  } = useStore();

  const [paymentStep, setPaymentStep] = useState('plan'); // 'plan' | 'processing' | 'success'
  const [selectedCurrency, setSelectedCurrency] = useState('NGN'); // 'NGN' | 'USD'

  const handleStartUpgrade = () => {
    setPaymentStep('processing');
    setTimeout(() => {
      upgradeSubscription();
      setPaymentStep('success');
      try {
        confetti({
          particleCount: 80,
          spread: 80,
          origin: { y: 0.6 },
          colors: ['#f59e0b', '#10b981', '#6366f1'],
        });
      } catch (e) {}
    }, 1400);
  };

  const handleClose = () => {
    setIsUpgradeModalOpen(false);
    setPaymentStep('plan');
  };

  if (!isUpgradeModalOpen) return null;

  return (
    <div className="modal-backdrop">
      <div className="modal-card subscription-modal animate-scale-in max-w-2xl">
        {/* Header */}
        <div className="modal-header border-b border-slate-800">
          <div className="modal-title-with-icon">
            <div className="icon-badge bg-amber-500/20 text-amber-400">
              <Crown size={22} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">TANK Subscription Plans</h2>
              <p className="text-xs text-slate-400">Scale your supermarket without product limits</p>
            </div>
          </div>
          <button onClick={handleClose} className="btn-icon text-muted hover:text-white">
            <X size={20} />
          </button>
        </div>

        {paymentStep === 'plan' && (
          <div className="modal-body space-y-6">
            {/* Currency selector toggle */}
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-300">Display Price in:</span>
              <div className="flex bg-slate-800 p-0.5 rounded-lg border border-slate-700 text-xs">
                <button
                  type="button"
                  onClick={() => setSelectedCurrency('NGN')}
                  className={`px-3 py-1 rounded font-bold transition-colors ${selectedCurrency === 'NGN' ? 'bg-emerald-600 text-white' : 'text-slate-400'}`}
                >
                  ₦ NGN (Nigerian Naira)
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedCurrency('USD')}
                  className={`px-3 py-1 rounded font-bold transition-colors ${selectedCurrency === 'USD' ? 'bg-emerald-600 text-white' : 'text-slate-400'}`}
                >
                  $ USD (US Dollar)
                </button>
              </div>
            </div>

            {/* Plans Comparison Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Free Plan */}
              <div className={`plan-card p-5 rounded-2xl border flex flex-col justify-between ${subscription.plan === 'free' ? 'border-slate-700 bg-slate-900/60' : 'border-slate-800 bg-slate-950/40 opacity-70'}`}>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-bold text-base text-white">Free Starter</h3>
                    {subscription.plan === 'free' && (
                      <span className="text-[10px] uppercase font-bold bg-slate-800 text-slate-300 px-2 py-0.5 rounded-full">
                        Current Plan
                      </span>
                    )}
                  </div>
                  <div className="text-2xl font-black font-mono text-white mb-3">
                    {selectedCurrency === 'NGN' ? '₦0' : '$0'}
                    <span className="text-xs text-slate-400 font-normal"> / forever</span>
                  </div>

                  <ul className="space-y-2.5 text-xs text-slate-300">
                    <li className="flex items-center gap-2">
                      <Check size={15} className="text-emerald-400 shrink-0" />
                      <span><strong>Up to 30 products</strong> catalog limit</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check size={15} className="text-emerald-400 shrink-0" />
                      <span>1 Cashier account</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check size={15} className="text-emerald-400 shrink-0" />
                      <span>Standard POS & Receipt printing</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check size={15} className="text-emerald-400 shrink-0" />
                      <span>Basic daily sales reporting</span>
                    </li>
                  </ul>
                </div>

                <div className="mt-6 pt-3 border-t border-slate-800/80 text-[11px] text-slate-500 text-center">
                  {products.length} of 30 products registered
                </div>
              </div>

              {/* Premium Plan */}
              <div className="plan-card premium-card p-5 rounded-2xl border-2 border-amber-500/50 bg-gradient-to-b from-amber-950/20 to-slate-900 flex flex-col justify-between relative shadow-xl shadow-amber-950/20">
                <div className="absolute -top-3 right-4 bg-gradient-to-r from-amber-500 to-amber-600 text-black text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full shadow">
                  Recommended for Supermarkets
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-bold text-base text-amber-400 flex items-center gap-1.5">
                      <Crown size={18} /> TANK Premium
                    </h3>
                  </div>
                  <div className="text-3xl font-black font-mono text-white mb-1">
                    {selectedCurrency === 'NGN' ? '₦80,000' : '$65'}
                    <span className="text-xs text-slate-400 font-normal"> / 360 days</span>
                  </div>
                  <p className="text-[11px] text-amber-400/80 mb-3">Full year access (₦222 / day)</p>

                  <ul className="space-y-2.5 text-xs text-slate-200">
                    <li className="flex items-center gap-2">
                      <Check size={15} className="text-amber-400 shrink-0" />
                      <span><strong>Unlimited products</strong> (No limits)</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check size={15} className="text-amber-400 shrink-0" />
                      <span><strong>Up to 10 Cashier</strong> accounts</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check size={15} className="text-amber-400 shrink-0" />
                      <span><strong>Continuous Cloud Sync</strong> & automated backups</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check size={15} className="text-amber-400 shrink-0" />
                      <span><strong>Advanced Gross Profit</strong> analytics & audits</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check size={15} className="text-amber-400 shrink-0" />
                      <span>Custom thermal printer branding</span>
                    </li>
                  </ul>
                </div>

                <button
                  type="button"
                  onClick={handleStartUpgrade}
                  className="btn btn-amber-upgrade w-full mt-6 py-2.5 font-bold flex items-center justify-center gap-2 shadow-lg"
                >
                  <Sparkles size={16} />
                  <span>Activate Premium (₦80,000)</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {paymentStep === 'processing' && (
          <div className="modal-body py-12 text-center space-y-4">
            <div className="w-16 h-16 rounded-full border-4 border-amber-500 border-t-transparent animate-spin mx-auto"></div>
            <h3 className="text-lg font-bold text-white">Connecting to Secure Payment Gateway...</h3>
            <p className="text-xs text-slate-400 max-w-xs mx-auto">
              Simulating payment verification for ₦80,000 (360 Days Premium Access)...
            </p>
          </div>
        )}

        {paymentStep === 'success' && (
          <div className="modal-body py-8 text-center space-y-4 animate-scale-in">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500 text-emerald-400 flex items-center justify-center mx-auto">
              <CheckCircle2 size={36} />
            </div>
            <h3 className="text-2xl font-black text-white">TANK Premium Activated!</h3>
            <p className="text-xs text-slate-300 max-w-sm mx-auto">
              Your subscription is now active for <strong>360 days</strong> (Valid until {formatDateOnly(subscription.expiresAt)}). You can now upload unlimited products and add up to 10 cashiers.
            </p>

            <button
              onClick={handleClose}
              className="btn btn-primary px-8 py-2 font-bold mx-auto mt-4"
            >
              Continue to Dashboard
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// Standalone View when navigating from menu
export function SubscriptionView() {
  const { subscription, setIsUpgradeModalOpen, settings, products } = useStore();

  const isPremium = subscription.plan === 'premium';
  const remainingDays = isPremium 
    ? Math.max(0, Math.ceil((new Date(subscription.expiresAt) - new Date()) / (1000 * 60 * 60 * 24)))
    : 0;

  return (
    <div className="page-container animate-fade-in max-w-4xl mx-auto">
      <div className="page-header-row mb-6">
        <div>
          <h1 className="page-title text-2xl font-black text-white flex items-center gap-2.5">
            <Crown size={28} className="text-amber-400" />
            Subscription & Cloud License
          </h1>
          <p className="page-subtitle text-xs text-slate-400 mt-0.5">
            Manage your store license, product capacity, and renewal cycle
          </p>
        </div>

        <button
          onClick={() => setIsUpgradeModalOpen(true)}
          className="btn btn-amber-upgrade font-bold px-5 py-2.5 flex items-center gap-2"
        >
          <Sparkles size={17} />
          <span>{isPremium ? 'Renew License (₦80,000)' : 'Upgrade to Premium'}</span>
        </button>
      </div>

      {/* Status Card */}
      <div className={`p-6 rounded-2xl border mb-6 ${isPremium ? 'border-amber-500/40 bg-gradient-to-r from-amber-950/20 via-slate-900 to-slate-900' : 'border-slate-800 bg-slate-900/80'}`}>
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${isPremium ? 'bg-amber-500/20 text-amber-400' : 'bg-slate-800 text-slate-400'}`}>
              <Crown size={32} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-white">
                  {isPremium ? 'TANK Premium Active' : 'TANK Free Starter Plan'}
                </h2>
                <span className={`status-pill ${isPremium ? 'active' : 'inactive'}`}>
                  {isPremium ? 'Active License' : 'Free Tier'}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                {isPremium 
                  ? `Access expires on ${formatDateOnly(subscription.expiresAt)} (${remainingDays} days remaining)`
                  : 'Limited to 30 products. Upgrade to unlock unlimited products and 10 cashiers.'
                }
              </p>
            </div>
          </div>

          <div className="text-right">
            <div className="text-xs text-slate-400">License Reference</div>
            <div className="font-mono text-sm font-bold text-white">{subscription.reference || 'TANK-FREE-001'}</div>
          </div>
        </div>
      </div>

      {/* Feature Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
          <div className="text-xs font-semibold text-slate-400 mb-1">Product Catalog Limit</div>
          <div className="text-xl font-bold text-white font-mono">
            {isPremium ? 'Unlimited' : `${products.length} / 30 items`}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            {isPremium ? 'Add infinite items without caps' : `${30 - products.length} slots remaining`}
          </p>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
          <div className="text-xs font-semibold text-slate-400 mb-1">Cashier Terminals</div>
          <div className="text-xl font-bold text-white font-mono">
            Up to 10 Cashiers
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Unique login credentials & PINs</p>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
          <div className="text-xs font-semibold text-slate-400 mb-1">Cloud Synchronization</div>
          <div className="text-xl font-bold text-emerald-400 font-mono flex items-center gap-1.5">
            <Cloud size={20} /> Included
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Automated transaction backups</p>
        </div>
      </div>
    </div>
  );
}
