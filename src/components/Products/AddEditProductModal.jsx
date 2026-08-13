import React, { useState, useEffect } from 'react';
import { 
  X, 
  Package, 
  QrCode, 
  Sparkles, 
  Check, 
  Dices, 
  DollarSign, 
  Tag, 
  Layers, 
  Boxes,
  Camera
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { generateBarcode } from '../../utils/formatters';

const EMOJI_OPTIONS = ['📦', '🥤', '🥫', '🥛', '🍝', '🍜', '🧂', '🍾', '🍅', '🥣', '🍞', '🥔', '🍪', '💧', '🧃', '⚡', '🧴', '🪥', '🧼', '🧽', '🥩', '🍎', '🍫', '☕', '🍬', '🥑'];

const CATEGORY_PRESETS = [
  'Beverages',
  'Groceries',
  'Dairy & Breakfast',
  'Bakery & Snacks',
  'Household & Toiletries',
  'Frozen Foods',
  'Fresh Produce',
  'Cosmetics & Personal Care',
  'Other'
];

export default function AddEditProductModal({ isOpen, onClose, editingProduct = null }) {
  const { addProduct, updateProduct, openQRScanner, settings, subscription, products, setIsUpgradeModalOpen } = useStore();

  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    category: 'Groceries',
    costPrice: '',
    sellingPrice: '',
    stockQty: '',
    lowStockThreshold: '10',
    image: '📦',
    status: 'active',
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (editingProduct) {
      setFormData({
        name: editingProduct.name || '',
        sku: editingProduct.sku || '',
        category: editingProduct.category || 'Groceries',
        costPrice: editingProduct.costPrice?.toString() || '',
        sellingPrice: editingProduct.sellingPrice?.toString() || '',
        stockQty: editingProduct.stockQty?.toString() || '',
        lowStockThreshold: editingProduct.lowStockThreshold?.toString() || '10',
        image: editingProduct.image || '📦',
        status: editingProduct.status || 'active',
      });
    } else {
      setFormData({
        name: '',
        sku: generateBarcode(),
        category: 'Groceries',
        costPrice: '',
        sellingPrice: '',
        stockQty: '25',
        lowStockThreshold: '10',
        image: '📦',
        status: 'active',
      });
    }
    setErrors({});
  }, [editingProduct, isOpen]);

  // Handle embedded QR scan for auto-filling SKU
  const handleScanSKU = () => {
    openQRScanner('upload', (scannedCode) => {
      setFormData(prev => ({
        ...prev,
        sku: scannedCode,
      }));
    });
  };

  const handleGenerateSKU = () => {
    setFormData(prev => ({
      ...prev,
      sku: generateBarcode(),
    }));
  };

  const validate = () => {
    const errs = {};
    if (!formData.name.trim()) errs.name = 'Product name is required';
    if (!formData.sku.trim()) errs.sku = 'SKU / Barcode is required';
    if (!formData.sellingPrice || Number(formData.sellingPrice) <= 0) {
      errs.sellingPrice = 'Selling price must be greater than 0';
    }
    if (formData.costPrice && Number(formData.costPrice) < 0) {
      errs.costPrice = 'Cost price cannot be negative';
    }
    if (!formData.stockQty || Number(formData.stockQty) < 0) {
      errs.stockQty = 'Stock quantity cannot be negative';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    if (editingProduct) {
      updateProduct(editingProduct.id, {
        name: formData.name.trim(),
        sku: formData.sku.trim(),
        category: formData.category,
        costPrice: Number(formData.costPrice) || 0,
        sellingPrice: Number(formData.sellingPrice) || 0,
        stockQty: Number(formData.stockQty) || 0,
        lowStockThreshold: Number(formData.lowStockThreshold) || 10,
        image: formData.image,
        status: formData.status,
      });
      onClose();
    } else {
      // Check free plan
      if (subscription.plan === 'free' && products.length >= subscription.productLimit) {
        onClose();
        setIsUpgradeModalOpen(true);
        return;
      }

      const res = addProduct({
        name: formData.name.trim(),
        sku: formData.sku.trim(),
        category: formData.category,
        costPrice: Number(formData.costPrice) || 0,
        sellingPrice: Number(formData.sellingPrice) || 0,
        stockQty: Number(formData.stockQty) || 0,
        lowStockThreshold: Number(formData.lowStockThreshold) || 10,
        image: formData.image,
        status: formData.status,
      });

      if (res.success) {
        onClose();
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop">
      <div className="modal-card product-modal animate-scale-in max-w-lg mx-auto">
        {/* Modal Header */}
        <div className="modal-header text-left">
          <div className="modal-title-with-icon">
            <div className="icon-badge primary">
              <Package size={20} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">
                {editingProduct ? 'Edit Product Details' : 'Upload / Add New Goods'}
              </h2>
              <p className="text-xs text-slate-400">
                Software: <strong>TANK POS</strong> • {editingProduct ? 'Update product information and inventory' : 'Fill details or scan barcode to save item to catalog'}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="btn-icon text-slate-400 hover:text-white">
            <X size={20} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
          <div className="modal-body space-y-4 flex-1 overflow-y-auto">
            {/* Product Name */}
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1 text-left">
                Product Name *
              </label>
              <input
                type="text"
                placeholder="e.g. Coca-Cola 50cl Pet Bottle"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className={`input-field text-sm w-full font-medium ${errors.name ? 'border-rose-500' : ''}`}
                autoFocus
              />
              {errors.name && <p className="text-[11px] text-rose-400 mt-1 text-left">{errors.name}</p>}
            </div>

            {/* Barcode / SKU with Embed Camera Scanner Button */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-slate-300">
                  SKU / Barcode *
                </label>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleGenerateSKU}
                    className="text-[11px] text-slate-400 hover:text-emerald-400 flex items-center gap-1 font-semibold"
                    title="Generate standard random barcode"
                  >
                    <Dices size={12} /> Generate Barcode
                  </button>
                </div>
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="e.g. 890123456789"
                  value={formData.sku}
                  onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                  className={`input-field font-mono text-sm flex-1 ${errors.sku ? 'border-rose-500' : ''}`}
                />
                
                {/* EMBED CAMERA QR / BARCODE SCANNER BUTTON */}
                <button
                  type="button"
                  onClick={handleScanSKU}
                  className="btn btn-emerald-scan flex items-center gap-1.5 px-3 py-2 text-xs font-bold shrink-0"
                  title="Scan barcode with device camera to fill SKU automatically"
                >
                  <Camera size={16} />
                  <span>Scan Barcode</span>
                </button>
              </div>
              {errors.sku && <p className="text-[11px] text-rose-400 mt-1 text-left">{errors.sku}</p>}
            </div>

            {/* Category & Emoji Icon */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Product Category
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="input-select text-sm w-full"
                >
                  {CATEGORY_PRESETS.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Item Visual Emoji
                </label>
                <div className="flex items-center gap-2">
                  <span className="text-2xl p-1.5 bg-slate-900 rounded-lg border border-slate-700">{formData.image}</span>
                  <select
                    value={formData.image}
                    onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                    className="input-select text-sm flex-1"
                  >
                    {EMOJI_OPTIONS.map((em, idx) => (
                      <option key={idx} value={em}>{em} Icon</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Prices (Cost Price & Selling Price) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-left">
              {/* Cost Price */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-slate-300">
                    Cost Price (Store COGS)
                  </label>
                  <span className="text-[10px] text-emerald-400 bg-emerald-950 px-1.5 py-0.2 rounded border border-emerald-900 font-bold">
                    Admin Only
                  </span>
                </div>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 font-mono text-slate-400 text-sm">
                    {settings.currency || '₦'}
                  </span>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    placeholder="0.00"
                    value={formData.costPrice}
                    onChange={(e) => setFormData({ ...formData, costPrice: e.target.value })}
                    className="input-field pl-8 font-mono text-sm w-full"
                  />
                </div>
                <p className="text-[10px] text-slate-500 mt-1">Computes gross profit metrics</p>
              </div>

              {/* Selling Price */}
              <div>
                <label className="text-xs font-semibold text-emerald-400 block mb-1">
                  Selling Price (Customer Price) *
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 font-mono text-emerald-400 font-bold text-sm">
                    {settings.currency || '₦'}
                  </span>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    placeholder="0.00"
                    value={formData.sellingPrice}
                    onChange={(e) => setFormData({ ...formData, sellingPrice: e.target.value })}
                    className={`input-field pl-8 font-mono font-bold text-sm w-full text-white ${errors.sellingPrice ? 'border-rose-500' : ''}`}
                  />
                </div>
                {errors.sellingPrice && <p className="text-[11px] text-rose-400 mt-1">{errors.sellingPrice}</p>}
              </div>
            </div>

            {/* Stock Quantity & Low Stock Alert */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Initial Stock Qty *
                </label>
                <input
                  type="number"
                  min="0"
                  placeholder="0"
                  value={formData.stockQty}
                  onChange={(e) => setFormData({ ...formData, stockQty: e.target.value })}
                  className={`input-field font-mono text-sm w-full ${errors.stockQty ? 'border-rose-500' : ''}`}
                />
                {errors.stockQty && <p className="text-[11px] text-rose-400 mt-1">{errors.stockQty}</p>}
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Low Stock Threshold
                </label>
                <input
                  type="number"
                  min="1"
                  placeholder="10"
                  value={formData.lowStockThreshold}
                  onChange={(e) => setFormData({ ...formData, lowStockThreshold: e.target.value })}
                  className="input-field font-mono text-sm w-full"
                />
                <p className="text-[10px] text-slate-500 mt-1">Triggers low stock alert banner</p>
              </div>
            </div>
          </div>

          {/* Footer - PROMINENT SAVE & UPLOAD BUTTON */}
          <div className="modal-footer justify-between shrink-0 bg-slate-950 border-t border-slate-800 p-4">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-secondary text-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary px-7 py-2.5 font-extrabold text-sm flex items-center gap-2 shadow-lg shadow-emerald-950/50"
            >
              <Check size={18} />
              <span>{editingProduct ? 'Save Product Changes' : 'Upload & Save Product'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
