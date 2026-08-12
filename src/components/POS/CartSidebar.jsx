import React, { useState } from 'react';
import { 
  Trash2, 
  Plus, 
  Minus, 
  Tag, 
  ArrowRight, 
  ShoppingBag, 
  X,
  CreditCard,
  Percent
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { formatCurrency } from '../../utils/formatters';

export default function CartSidebar() {
  const { 
    cart, 
    updateCartQty, 
    removeFromCart, 
    clearCart, 
    cartTotals, 
    discountType, 
    setDiscountType, 
    discountValue, 
    setDiscountValue,
    setIsCheckoutModalOpen,
    settings
  } = useStore();

  const [showDiscountInput, setShowDiscountInput] = useState(false);

  return (
    <aside className="pos-cart-panel">
      {/* Cart Header */}
      <div className="cart-header">
        <div className="flex items-center gap-2">
          <ShoppingBag size={20} className="text-emerald-400" />
          <h2 className="font-bold text-base text-white">Current Sale</h2>
          <span className="cart-count-pill">{cartTotals.totalUnits} items</span>
        </div>
        {cart.length > 0 && (
          <button 
            onClick={clearCart}
            className="clear-cart-btn text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1"
            title="Clear all items in cart"
          >
            <Trash2 size={14} /> Clear
          </button>
        )}
      </div>

      {/* Cart Items List */}
      <div className="cart-items-container">
        {cart.length === 0 ? (
          <div className="empty-cart-state">
            <div className="empty-cart-icon">🛒</div>
            <p className="text-sm font-semibold text-slate-300">Cart is empty</p>
            <p className="text-xs text-slate-500 mt-1 max-w-[200px]">
              Tap products from the catalog or scan barcodes to add items
            </p>
          </div>
        ) : (
          <div className="cart-items-list">
            {cart.map((item) => (
              <div key={item.product.id} className="cart-item-row animate-fade-in">
                <div className="item-icon-small">{item.product.image || '📦'}</div>
                
                <div className="item-details flex-1 min-w-0">
                  <div className="item-title truncate font-medium text-sm text-white">
                    {item.product.name}
                  </div>
                  <div className="item-price-meta text-xs text-slate-400">
                    {formatCurrency(item.product.sellingPrice, settings.currency)} each
                  </div>
                </div>

                {/* Qty Controls */}
                <div className="qty-controls">
                  <button
                    onClick={() => updateCartQty(item.product.id, item.quantity - 1)}
                    className="qty-btn"
                    title="Decrease quantity"
                  >
                    <Minus size={13} />
                  </button>
                  <span className="qty-value font-mono font-bold text-xs text-white">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => updateCartQty(item.product.id, item.quantity + 1)}
                    className="qty-btn"
                    title="Increase quantity"
                  >
                    <Plus size={13} />
                  </button>
                </div>

                {/* Line Total */}
                <div className="item-line-total font-mono font-semibold text-sm text-emerald-400">
                  {formatCurrency(item.lineTotal, settings.currency)}
                </div>

                {/* Remove button */}
                <button
                  onClick={() => removeFromCart(item.product.id)}
                  className="item-remove-btn"
                  title="Remove from cart"
                >
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Cart Summary & Checkout Actions */}
      <div className="cart-footer">
        {/* Discount Toggle / Bar */}
        <div className="discount-wrapper mb-3">
          {!showDiscountInput ? (
            <button
              onClick={() => setShowDiscountInput(true)}
              className="add-discount-trigger text-xs flex items-center justify-between w-full py-1.5 px-3 rounded-lg border border-dashed border-slate-700 hover:border-emerald-500/50 text-slate-400 hover:text-white transition-colors"
            >
              <span className="flex items-center gap-1.5">
                <Tag size={13} className="text-emerald-400" />
                {cartTotals.discountAmount > 0 
                  ? `Discount Applied: -${formatCurrency(cartTotals.discountAmount, settings.currency)}`
                  : 'Add discount / promo code'
                }
              </span>
              <span className="text-[11px] text-emerald-400 font-semibold">
                {cartTotals.discountAmount > 0 ? 'Edit' : '+ Add'}
              </span>
            </button>
          ) : (
            <div className="discount-input-box p-2.5 rounded-lg bg-slate-900 border border-slate-700 animate-scale-in">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-semibold text-slate-300 flex items-center gap-1">
                  <Tag size={12} /> Apply Discount
                </span>
                <button
                  onClick={() => setShowDiscountInput(false)}
                  className="text-xs text-slate-400 hover:text-white"
                >
                  <X size={13} />
                </button>
              </div>
              <div className="flex gap-1.5">
                <div className="flex bg-slate-800 rounded p-0.5 border border-slate-700">
                  <button
                    type="button"
                    onClick={() => setDiscountType('fixed')}
                    className={`px-2 py-1 text-xs rounded font-semibold ${discountType === 'fixed' ? 'bg-emerald-600 text-white' : 'text-slate-400'}`}
                  >
                    {settings.currency || '₦'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setDiscountType('percent')}
                    className={`px-2 py-1 text-xs rounded font-semibold ${discountType === 'percent' ? 'bg-emerald-600 text-white' : 'text-slate-400'}`}
                  >
                    %
                  </button>
                </div>
                <input
                  type="number"
                  min="0"
                  placeholder="0"
                  value={discountValue || ''}
                  onChange={(e) => setDiscountValue(Math.max(0, Number(e.target.value)))}
                  className="input-field py-1 px-2 text-xs flex-1 font-mono"
                  autoFocus
                />
                {discountValue > 0 && (
                  <button
                    type="button"
                    onClick={() => setDiscountValue(0)}
                    className="btn btn-secondary btn-sm text-xs px-2"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Calculation Lines */}
        <div className="space-y-1.5 text-xs text-slate-300 pb-3 border-b border-slate-800">
          <div className="flex justify-between">
            <span className="text-slate-400">Subtotal:</span>
            <span className="font-mono font-medium">{formatCurrency(cartTotals.subtotal, settings.currency)}</span>
          </div>
          {cartTotals.discountAmount > 0 && (
            <div className="flex justify-between text-emerald-400">
              <span>Discount:</span>
              <span className="font-mono font-semibold">-{formatCurrency(cartTotals.discountAmount, settings.currency)}</span>
            </div>
          )}
        </div>

        {/* Grand Total */}
        <div className="flex items-baseline justify-between pt-3 pb-3">
          <span className="text-sm font-bold text-slate-200">Grand Total:</span>
          <span className="text-2xl font-black font-mono text-emerald-400">
            {formatCurrency(cartTotals.total, settings.currency)}
          </span>
        </div>

        {/* Checkout Button */}
        <button
          onClick={() => setIsCheckoutModalOpen(true)}
          disabled={cart.length === 0}
          className="btn-checkout-primary w-full"
        >
          <span>Pay & Complete Sale</span>
          <ArrowRight size={18} />
        </button>
      </div>
    </aside>
  );
}
