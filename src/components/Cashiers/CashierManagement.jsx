import React, { useState } from 'react';
import { 
  Users, 
  UserPlus, 
  UserCheck, 
  UserX, 
  KeyRound, 
  Phone, 
  Check, 
  X, 
  ShieldAlert, 
  Calendar,
  Lock,
  Edit2
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { formatCurrency, formatDateTime } from '../../utils/formatters';

export default function CashierManagement() {
  const { 
    cashiers, 
    addCashier, 
    updateCashier, 
    toggleCashierStatus, 
    sales, 
    settings, 
    subscription 
  } = useStore();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    cashierCode: '',
    pin: '',
    phone: '',
  });
  const [errors, setErrors] = useState({});

  const handleOpenAdd = () => {
    const nextNum = 100 + cashiers.length + 1;
    setFormData({
      name: '',
      cashierCode: `CSH-${nextNum}`,
      pin: '1234',
      phone: '',
    });
    setErrors({});
    setIsAddModalOpen(true);
  };

  const validate = () => {
    const errs = {};
    if (!formData.name.trim()) errs.name = 'Cashier name is required';
    if (!formData.cashierCode.trim()) errs.cashierCode = 'Cashier code is required';
    if (!formData.pin.trim() || formData.pin.length < 4) errs.pin = 'PIN must be at least 4 digits';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (!validate()) return;

    const res = addCashier({
      name: formData.name.trim(),
      cashierCode: formData.cashierCode.trim().toUpperCase(),
      pin: formData.pin.trim(),
      phone: formData.phone.trim(),
    });

    if (res.success) {
      setIsAddModalOpen(false);
    } else {
      alert(res.message);
    }
  };

  return (
    <div className="page-container animate-fade-in">
      {/* Header */}
      <div className="page-header-row text-center flex flex-col items-center justify-center">
        <div className="text-center">
          <div className="text-[10px] uppercase font-mono font-bold tracking-widest text-emerald-400 mb-1">
            TANK Software • {settings.businessName || 'TANK Store'}
          </div>
          <h1 className="page-title text-2xl font-black text-white flex items-center justify-center gap-2.5">
            <Users size={28} className="text-emerald-400" />
            Cashier Management & Access Control
          </h1>
          <p className="page-subtitle text-xs text-slate-400 mt-1 text-center">
            Create cashier logins, set PIN codes, and control POS point-of-sale access
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          disabled={cashiers.length >= subscription.maxCashiers}
          className="btn btn-primary px-5 py-2.5 font-bold shadow-lg shadow-emerald-950/40 mt-3"
        >
          <UserPlus size={18} />
          <span>Add New Cashier</span>
        </button>
      </div>

      {/* Cashier Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {cashiers.map(cashier => {
          // Calculate lifetime cashier sales
          const cashierSales = sales.filter(s => s.cashierId === cashier.id);
          const totalEarned = cashierSales.reduce((acc, s) => acc + s.total, 0);
          const totalTx = cashierSales.length;

          return (
            <div key={cashier.id} className="cashier-card p-5 rounded-xl bg-slate-900/70 border border-slate-800 flex flex-col items-center justify-between text-center">
              <div className="w-full">
                <div className="flex flex-col items-center justify-center text-center gap-2">
                  <div className="w-12 h-12 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-sky-400 text-lg mx-auto">
                    {cashier.name.charAt(0)}
                  </div>
                  <div className="text-center">
                    <h3 className="font-bold text-white text-base text-center">{cashier.name}</h3>
                    <div className="text-xs font-mono text-emerald-400 font-semibold text-center mt-0.5">
                      {cashier.cashierCode}
                    </div>
                  </div>

                  <span className={`status-pill ${cashier.status === 'active' ? 'active' : 'inactive'} mt-1`}>
                    {cashier.status === 'active' ? 'Active Cashier' : 'Deactivated'}
                  </span>
                </div>

                <div className="cashier-info-grid mt-4 space-y-1.5 text-xs text-slate-300 w-full text-center">
                  <div className="flex justify-between items-center py-0.5">
                    <span className="text-slate-400">Login PIN:</span>
                    <span className="font-mono text-slate-200 font-bold">•••• ({cashier.pin})</span>
                  </div>
                  {cashier.phone && (
                    <div className="flex justify-between items-center py-0.5">
                      <span className="text-slate-400">Phone:</span>
                      <span className="font-mono text-slate-200">{cashier.phone}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center pt-2 border-t border-slate-800">
                    <span className="text-slate-400">Sales Completed:</span>
                    <span className="font-mono font-bold text-white">{totalTx} sales</span>
                  </div>
                  <div className="flex justify-between items-center py-0.5">
                    <span className="text-slate-400">Total Sales Volume:</span>
                    <span className="font-mono font-bold text-emerald-400">
                      {formatCurrency(totalEarned, settings.currency)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="cashier-card-footer mt-4 pt-3 border-t border-slate-800 flex items-center justify-center w-full">
                <button
                  onClick={() => toggleCashierStatus(cashier.id)}
                  className={`btn-xs rounded px-3 py-1.5 font-semibold text-xs transition-colors w-full ${
                    cashier.status === 'active' 
                      ? 'bg-rose-950/60 text-rose-300 border border-rose-800 hover:bg-rose-900' 
                      : 'bg-emerald-950/60 text-emerald-300 border border-emerald-800 hover:bg-emerald-900'
                  }`}
                >
                  {cashier.status === 'active' ? 'Deactivate Account' : 'Reactivate Account'}
                </button>
              </div>
            </div>
          );

        })}
      </div>

      {/* Add Cashier Modal */}
      {isAddModalOpen && (
        <div className="modal-backdrop">
          <div className="modal-card cashier-modal animate-scale-in">
            <div className="modal-header">
              <div className="modal-title-with-icon">
                <div className="icon-badge primary">
                  <UserPlus size={20} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Create New Cashier</h2>
                  <p className="text-xs text-muted">Assign unique cashier ID and access PIN</p>
                </div>
              </div>
              <button onClick={() => setIsAddModalOpen(false)} className="btn-icon text-muted hover:text-white">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSave}>
              <div className="modal-body space-y-4">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Cashier Full Name *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. John Doe"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className={`input-field text-sm w-full ${errors.name ? 'border-rose-500' : ''}`}
                    autoFocus
                  />
                  {errors.name && <p className="text-[11px] text-rose-400 mt-1">{errors.name}</p>}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">
                      Cashier Code / ID *
                    </label>
                    <input
                      type="text"
                      value={formData.cashierCode}
                      onChange={(e) => setFormData({ ...formData, cashierCode: e.target.value })}
                      className={`input-field font-mono text-sm w-full ${errors.cashierCode ? 'border-rose-500' : ''}`}
                    />
                    {errors.cashierCode && <p className="text-[11px] text-rose-400 mt-1">{errors.cashierCode}</p>}
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">
                      Initial PIN / Password *
                    </label>
                    <input
                      type="text"
                      placeholder="1234"
                      value={formData.pin}
                      onChange={(e) => setFormData({ ...formData, pin: e.target.value })}
                      className={`input-field font-mono text-sm w-full ${errors.pin ? 'border-rose-500' : ''}`}
                    />
                    {errors.pin && <p className="text-[11px] text-rose-400 mt-1">{errors.pin}</p>}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Phone Number (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="+234 800 000 0000"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="input-field text-sm w-full"
                  />
                </div>
              </div>

              <div className="modal-footer justify-between">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary px-6"
                >
                  <Check size={18} />
                  <span>Create Cashier Account</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
