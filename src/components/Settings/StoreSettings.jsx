import React, { useState } from 'react';
import { 
  Settings, 
  Store, 
  Printer, 
  Save, 
  Check, 
  DollarSign, 
  FileText, 
  Mail, 
  Phone, 
  MapPin,
  Sparkles
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';

const CURRENCY_OPTIONS = [
  { symbol: '₦', label: '₦ Nigerian Naira (NGN)' },
  { symbol: '$', label: '$ US Dollar (USD)' },
  { symbol: '£', label: '£ British Pound (GBP)' },
  { symbol: '€', label: '€ Euro (EUR)' },
  { symbol: 'GH₵', label: 'GH₵ Ghanaian Cedi (GHS)' },
  { symbol: 'KSh', label: 'KSh Kenyan Shilling (KES)' },
  { symbol: 'R', label: 'R South African Rand (ZAR)' },
];

export default function StoreSettings() {
  const { settings, setSettings } = useStore();

  const [formData, setFormData] = useState({ ...settings });
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSettings(formData);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  return (
    <div className="page-container animate-fade-in max-w-4xl mx-auto">
      {/* Header */}
      <div className="page-header-row mb-6">
        <div>
          <h1 className="page-title text-2xl font-black text-white flex items-center gap-2.5">
            <Settings size={28} className="text-emerald-400" />
            Store & Receipt Configuration
          </h1>
          <p className="page-subtitle text-xs text-slate-400 mt-0.5">
            Configure your business details, thermal printer options, and customer receipt footer
          </p>
        </div>

        {savedSuccess && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-950/80 border border-emerald-700 text-emerald-300 text-xs font-bold animate-scale-in">
            <Check size={16} />
            <span>Settings Saved Successfully!</span>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Business Profile Card */}
        <div className="settings-card p-5 rounded-xl bg-slate-900/80 border border-slate-800">
          <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-800">
            <Store size={18} className="text-emerald-400" />
            <h2 className="text-base font-bold text-white">Business Profile</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Store / Supermarket Name *
              </label>
              <input
                type="text"
                value={formData.businessName || ''}
                onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                className="input-field text-sm w-full font-bold"
                required
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Owner / Manager Name *
              </label>
              <input
                type="text"
                value={formData.ownerName || ''}
                onChange={(e) => setFormData({ ...formData, ownerName: e.target.value })}
                className="input-field text-sm w-full"
                required
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Store Phone Number
              </label>
              <div className="relative">
                <Phone size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={formData.phone || ''}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="input-field pl-9 text-sm w-full"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Store Email Address
              </label>
              <div className="relative">
                <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  value={formData.email || ''}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="input-field pl-9 text-sm w-full"
                />
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Store Street Address (Printed on Receipts)
              </label>
              <div className="relative">
                <MapPin size={15} className="absolute left-3 top-3 text-slate-400" />
                <textarea
                  rows="2"
                  value={formData.address || ''}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="input-field pl-9 text-sm w-full"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Currency & Financials */}
        <div className="settings-card p-5 rounded-xl bg-slate-900/80 border border-slate-800">
          <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-800">
            <DollarSign size={18} className="text-emerald-400" />
            <h2 className="text-base font-bold text-white">Currency & Regional Settings</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Primary Currency Symbol
              </label>
              <select
                value={formData.currency || '₦'}
                onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                className="input-select text-sm w-full"
              >
                {CURRENCY_OPTIONS.map(opt => (
                  <option key={opt.symbol} value={opt.symbol}>{opt.label}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Thermal Printer & Receipt Layout */}
        <div className="settings-card p-5 rounded-xl bg-slate-900/80 border border-slate-800">
          <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-800">
            <Printer size={18} className="text-emerald-400" />
            <h2 className="text-base font-bold text-white">Thermal Printer & Receipt Customization</h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Default Thermal Paper Width
              </label>
              <div className="flex gap-4">
                <label className={`flex items-center gap-2 p-3 rounded-lg border cursor-pointer flex-1 ${formData.printerWidth === '80mm' ? 'border-emerald-500 bg-emerald-950/20' : 'border-slate-800 bg-slate-950'}`}>
                  <input
                    type="radio"
                    name="printerWidth"
                    value="80mm"
                    checked={formData.printerWidth === '80mm'}
                    onChange={() => setFormData({ ...formData, printerWidth: '80mm' })}
                    className="text-emerald-600 focus:ring-emerald-500"
                  />
                  <div>
                    <div className="text-xs font-bold text-white">80mm Standard POS Printer</div>
                    <div className="text-[11px] text-slate-400">Recommended for desktop POS and receipt rolls</div>
                  </div>
                </label>

                <label className={`flex items-center gap-2 p-3 rounded-lg border cursor-pointer flex-1 ${formData.printerWidth === '58mm' ? 'border-emerald-500 bg-emerald-950/20' : 'border-slate-800 bg-slate-950'}`}>
                  <input
                    type="radio"
                    name="printerWidth"
                    value="58mm"
                    checked={formData.printerWidth === '58mm'}
                    onChange={() => setFormData({ ...formData, printerWidth: '58mm' })}
                    className="text-emerald-600 focus:ring-emerald-500"
                  />
                  <div>
                    <div className="text-xs font-bold text-white">58mm Compact Mobile Printer</div>
                    <div className="text-[11px] text-slate-400">For portable bluetooth mini printers</div>
                  </div>
                </label>
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Receipt Footer Greeting Note
              </label>
              <textarea
                rows="2"
                value={formData.receiptGreeting || ''}
                onChange={(e) => setFormData({ ...formData, receiptGreeting: e.target.value })}
                placeholder="Thank you for shopping with us! Please come again."
                className="input-field text-sm w-full font-serif italic"
              />
              <p className="text-[10px] text-slate-500 mt-1">
                This custom thank-you greeting will appear at the bottom of every customer receipt.
              </p>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            className="btn btn-primary px-8 py-2.5 font-bold flex items-center gap-2"
          >
            <Save size={18} />
            <span>Save Configuration</span>
          </button>
        </div>
      </form>
    </div>
  );
}
