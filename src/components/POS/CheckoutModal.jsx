import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { 
  X, 
  Banknote, 
  CreditCard, 
  ArrowRightLeft, 
  CheckCircle2, 
  Coins, 
  User, 
  Receipt,
  Printer
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { formatCurrency } from '../../utils/formatters';

export default function CheckoutModal() {
  const { 
    isCheckoutModalOpen, 
    setIsCheckoutModalOpen, 
    cartTotals, 
    cart, 
    completeSale, 
    settings 
  } = useStore();

  const [paymentMethod, setPaymentMethod] = useState('Cash'); // 'Cash' | 'POS/Card' | 'Transfer' | 'Split'
  const [amountTendered, setAmountTendered] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [notes, setNotes] = useState('');

  const totalDue = cartTotals.total;
  const tenderedNum = Number(amountTendered) || (paymentMethod !== 'Cash' ? totalDue : 0);
  const changeDue = Math.max(0, tenderedNum - totalDue);
  const isTenderSufficient = paymentMethod !== 'Cash' || tenderedNum >= totalDue;

  // Set default tendered amount when modal opens or total changes
  useEffect(() => {
    if (isCheckoutModalOpen) {
      setAmountTendered(totalDue.toString());
      setCustomerName('Walk-in Customer');
    }
  }, [isCheckoutModalOpen, totalDue]);

  const triggerConfetti = () => {
    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 },
        colors: ['#10b981', '#34d399', '#6ee7b7', '#3b82f6', '#f59e0b'],
      });
    } catch (e) {
      // ignore
    }
  };

  const handleSubmitSale = (e) => {
    e.preventDefault();
    if (!isTenderSufficient) {
      alert(`Amount tendered (${formatCurrency(tenderedNum, settings.currency)}) is less than total due (${formatCurrency(totalDue, settings.currency)})!`);
      return;
    }

    triggerConfetti();

    completeSale({
      paymentMethod,
      amountTendered: paymentMethod === 'Cash' ? tenderedNum : totalDue,
      customerName: customerName.trim() || 'Walk-in Customer',
    });
  };

  const handleAddPresetTender = (addAmount) => {
    const current = Number(amountTendered) || 0;
    setAmountTendered((current + addAmount).toString());
  };

  const handleSetExactTender = () => {
    setAmountTendered(totalDue.toString());
  };

  if (!isCheckoutModalOpen) return null;

  return (
    <div className="modal-backdrop">
      <div className="modal-card checkout-modal animate-scale-in max-w-lg mx-auto">
        {/* Header */}
        <div className="modal-header">
          <div className="modal-title-with-icon">
            <div className="icon-badge primary">
              <Receipt size={20} />
            </div>
            <div className="text-left">
              <h2 className="text-xl font-bold text-white">Complete Transaction</h2>
              <p className="text-xs text-slate-400">Software: <strong>TANK POS</strong> • Store: <strong>{settings.businessName}</strong></p>
            </div>
          </div>
          <button 
            onClick={() => setIsCheckoutModalOpen(false)}
            className="btn-icon text-slate-400 hover:text-white"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmitSale}>
          <div className="modal-body space-y-4">
            {/* Amount Due Big Banner */}
            <div className="amount-due-card text-center flex flex-col items-center justify-center py-4">
              <span className="text-xs uppercase tracking-wider text-slate-300 font-bold">Total Amount Due</span>
              <div className="text-3xl sm:text-4xl font-black font-mono text-emerald-400 mt-1">
                {formatCurrency(totalDue, settings.currency)}
              </div>
              <div className="text-xs text-slate-400 mt-1 font-medium">
                {cartTotals.totalUnits} items in cart • {cart.length} unique products
              </div>
            </div>

            {/* Payment Method Selector */}
            <div className="text-center">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-2 text-center">
                Select Payment Method
              </label>
              <div className="payment-method-grid">
                <button
                  type="button"
                  onClick={() => {
                    setPaymentMethod('Cash');
                    setAmountTendered(totalDue.toString());
                  }}
                  className={`payment-method-btn ${paymentMethod === 'Cash' ? 'active' : ''}`}
                >
                  <Banknote size={20} />
                  <span className="text-xs font-semibold">Cash</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setPaymentMethod('POS/Card');
                    setAmountTendered(totalDue.toString());
                  }}
                  className={`payment-method-btn ${paymentMethod === 'POS/Card' ? 'active' : ''}`}
                >
                  <CreditCard size={20} />
                  <span className="text-xs font-semibold">POS / Card</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setPaymentMethod('Transfer');
                    setAmountTendered(totalDue.toString());
                  }}
                  className={`payment-method-btn ${paymentMethod === 'Transfer' ? 'active' : ''}`}
                >
                  <ArrowRightLeft size={20} />
                  <span className="text-xs font-semibold">Bank Transfer</span>
                </button>
              </div>
            </div>

            {/* Cash Tender Calculation Section */}
            {paymentMethod === 'Cash' && (
              <div className="cash-tender-section p-3 rounded-xl bg-slate-900 border border-slate-700 animate-fade-in text-center">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-semibold text-slate-300">Amount Tendered by Customer</label>
                  <button
                    type="button"
                    onClick={handleSetExactTender}
                    className="text-[11px] font-semibold text-emerald-400 hover:text-emerald-300 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800"
                  >
                    Exact ({formatCurrency(totalDue, settings.currency)})
                  </button>
                </div>

                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold font-mono text-emerald-400 text-lg">
                    {settings.currency || '₦'}
                  </span>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    value={amountTendered}
                    onChange={(e) => setAmountTendered(e.target.value)}
                    className="input-field pl-9 py-2.5 font-mono text-lg font-bold text-white text-center w-full"
                    autoFocus
                  />
                </div>

                {/* Quick denomination pills */}
                <div className="quick-denominations mt-2 flex flex-wrap justify-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleAddPresetTender(500)}
                    className="denom-pill"
                  >
                    +500
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAddPresetTender(1000)}
                    className="denom-pill"
                  >
                    +1,000
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAddPresetTender(2000)}
                    className="denom-pill"
                  >
                    +2,000
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAddPresetTender(5000)}
                    className="denom-pill"
                  >
                    +5,000
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAddPresetTender(10000)}
                    className="denom-pill"
                  >
                    +10,000
                  </button>
                </div>

                {/* Change Calculated */}
                <div className="change-calculated-box mt-3 p-2.5 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Coins size={16} className="text-amber-400" />
                    <span className="text-xs font-semibold text-slate-300">Change to Return:</span>
                  </div>
                  <div className={`text-lg font-mono font-black ${changeDue > 0 ? 'text-amber-400' : 'text-slate-400'}`}>
                    {formatCurrency(changeDue, settings.currency)}
                  </div>
                </div>
              </div>
            )}

            {/* Customer Name */}
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1 text-center">
                Customer Name / Note (Optional)
              </label>
              <div className="relative">
                <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Walk-in Customer"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="input-field pl-9 py-2 text-xs text-center w-full"
                />
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="modal-footer justify-between">
            <button
              type="button"
              onClick={() => setIsCheckoutModalOpen(false)}
              className="btn btn-secondary text-xs"
            >
              Back to POS
            </button>
            <button
              type="submit"
              disabled={!isTenderSufficient}
              className="btn btn-primary px-6 text-xs font-bold"
            >
              <CheckCircle2 size={18} />
              <span>Complete Sale & Print</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
