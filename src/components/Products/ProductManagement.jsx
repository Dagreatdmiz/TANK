import React, { useState, useMemo } from 'react';
import { 
  Package, 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  AlertTriangle, 
  CheckCircle, 
  Sparkles, 
  Crown, 
  ArrowUpDown,
  Filter,
  Layers,
  Camera,
  Eye,
  EyeOff
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { formatCurrency } from '../../utils/formatters';
import AddEditProductModal from './AddEditProductModal';

export default function ProductManagement() {
  const { 
    products, 
    deleteProduct, 
    settings, 
    subscription, 
    activeRole, 
    setIsUpgradeModalOpen 
  } = useStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [stockFilter, setStockFilter] = useState('all'); // 'all' | 'low' | 'out'
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  const categories = useMemo(() => {
    const set = new Set(products.map(p => p.category).filter(Boolean));
    return ['All', ...Array.from(set)];
  }, [products]);

  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchesSearch = 
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.category && p.category.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesCat = selectedCategory === 'All' || p.category === selectedCategory;

      let matchesStock = true;
      if (stockFilter === 'low') {
        matchesStock = p.stockQty <= (p.lowStockThreshold || 10) && p.stockQty > 0;
      } else if (stockFilter === 'out') {
        matchesStock = p.stockQty <= 0;
      }

      return matchesSearch && matchesCat && matchesStock;
    });
  }, [products, searchQuery, selectedCategory, stockFilter]);

  const handleEdit = (prod) => {
    setEditingProduct(prod);
    setIsAddModalOpen(true);
  };

  const handleDelete = (id, name) => {
    if (confirm(`Are you sure you want to delete "${name}" from inventory?`)) {
      deleteProduct(id);
    }
  };

  const handleOpenAdd = () => {
    setEditingProduct(null);
    setIsAddModalOpen(true);
  };

  const isFreePlan = subscription.plan === 'free';
  const productCount = products.length;
  const limit = subscription.productLimit;
  const usagePercentage = isFreePlan ? Math.min(100, Math.round((productCount / limit) * 100)) : 10;

  return (
    <div className="page-container animate-fade-in">
      {/* Header & Upload Action */}
      <div className="page-header-row">
        <div>
          <h1 className="page-title text-2xl font-black text-white flex items-center gap-2.5">
            <Package size={28} className="text-emerald-400" />
            Product Management & Inventory
          </h1>
          <p className="page-subtitle text-xs text-slate-400 mt-0.5">
            Manage your store catalog, upload new goods, and monitor live stock levels
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="btn btn-primary px-5 py-2.5 font-bold shadow-lg shadow-emerald-950/40"
        >
          <Plus size={18} />
          <span>Upload / Add New Goods</span>
        </button>
      </div>

      {/* Free Plan Limit Indicator Banner */}
      {isFreePlan && (
        <div className="plan-usage-card p-4 rounded-xl bg-slate-900/90 border border-slate-800 mb-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-2">
                <Sparkles size={16} className="text-amber-400" />
                <span className="text-sm font-bold text-white">Free Plan Product Usage</span>
              </div>
              <span className="text-xs font-mono font-bold text-emerald-400">
                {productCount} / {limit} products used
              </span>
            </div>
            <div className="progress-bar-bg h-2 w-full rounded-full bg-slate-800 overflow-hidden">
              <div 
                className={`progress-bar-fill h-full rounded-full transition-all duration-500 ${usagePercentage >= 90 ? 'bg-rose-500' : usagePercentage >= 70 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                style={{ width: `${usagePercentage}%` }}
              ></div>
            </div>
          </div>

          <button
            onClick={() => setIsUpgradeModalOpen(true)}
            className="btn btn-amber-upgrade text-xs font-bold px-4 py-2 flex items-center gap-1.5 whitespace-nowrap"
          >
            <Crown size={15} />
            <span>Upgrade to Premium (Unlimited)</span>
          </button>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="products-filter-bar mb-6 p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex flex-col md:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by product name, SKU, or barcode..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input-field pl-9 py-2 text-xs w-full"
          />
        </div>

        {/* Category Filter */}
        <div className="flex gap-2">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="input-select text-xs py-2 px-3 min-w-[150px]"
          >
            {categories.map(c => (
              <option key={c} value={c}>{c === 'All' ? 'All Categories' : c}</option>
            ))}
          </select>

          {/* Stock Filter */}
          <select
            value={stockFilter}
            onChange={(e) => setStockFilter(e.target.value)}
            className="input-select text-xs py-2 px-3 min-w-[140px]"
          >
            <option value="all">All Stock Status</option>
            <option value="low">⚠️ Low Stock Alerts</option>
            <option value="out">❌ Out of Stock</option>
          </select>
        </div>
      </div>

      {/* Products Table */}
      <div className="products-table-wrapper rounded-xl border border-slate-800 overflow-hidden bg-slate-900/40">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-800 bg-slate-900/80 text-xs font-bold uppercase tracking-wider text-slate-400">
              <th className="py-3 px-4">Product / Item</th>
              <th className="py-3 px-4">SKU / Barcode</th>
              <th className="py-3 px-4">Category</th>
              
              {/* Cost Price Column: Strictly Visible ONLY for Admin */}
              {activeRole === 'admin' && (
                <th className="py-3 px-4 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <span>Cost Price</span>
                    <span className="text-[9px] bg-slate-800 text-emerald-400 px-1 rounded">Admin</span>
                  </div>
                </th>
              )}

              <th className="py-3 px-4 text-right">Selling Price</th>
              
              {/* Gross Margin %: Admin Only */}
              {activeRole === 'admin' && (
                <th className="py-3 px-4 text-right">Gross Margin</th>
              )}

              <th className="py-3 px-4 text-center">Stock Qty</th>
              <th className="py-3 px-4 text-center">Status</th>
              {activeRole === 'admin' && <th className="py-3 px-4 text-right">Actions</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 text-xs text-slate-300">
            {filteredProducts.length === 0 ? (
              <tr>
                <td colSpan={activeRole === 'admin' ? 9 : 6} className="py-12 text-center text-slate-500">
                  <Package size={36} className="mx-auto mb-2 opacity-50" />
                  <p className="font-semibold text-slate-400">No products found</p>
                  <p className="text-[11px] text-slate-600 mt-0.5">Try adjusting your search or filters</p>
                </td>
              </tr>
            ) : (
              filteredProducts.map(product => {
                const isOutOfStock = product.stockQty <= 0;
                const isLowStock = product.stockQty <= (product.lowStockThreshold || 10) && !isOutOfStock;
                
                // Margin calculation
                const margin = product.sellingPrice > 0 
                  ? Math.round(((product.sellingPrice - product.costPrice) / product.sellingPrice) * 100)
                  : 0;

                return (
                  <tr key={product.id} className="hover:bg-slate-800/30 transition-colors">
                    {/* Item Name */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <span className="text-xl p-1 bg-slate-800 rounded">{product.image || '📦'}</span>
                        <div>
                          <div className="font-bold text-white text-sm">{product.name}</div>
                          <div className="text-[11px] text-slate-500">{product.category}</div>
                        </div>
                      </div>
                    </td>

                    {/* Barcode */}
                    <td className="py-3 px-4 font-mono text-slate-400">
                      {product.sku}
                    </td>

                    {/* Category */}
                    <td className="py-3 px-4">
                      <span className="category-pill-sm">{product.category || 'General'}</span>
                    </td>

                    {/* Cost Price (Admin Only) */}
                    {activeRole === 'admin' && (
                      <td className="py-3 px-4 text-right font-mono text-slate-400">
                        {formatCurrency(product.costPrice, settings.currency)}
                      </td>
                    )}

                    {/* Selling Price */}
                    <td className="py-3 px-4 text-right font-mono font-bold text-emerald-400 text-sm">
                      {formatCurrency(product.sellingPrice, settings.currency)}
                    </td>

                    {/* Margin (Admin Only) */}
                    {activeRole === 'admin' && (
                      <td className="py-3 px-4 text-right font-mono font-semibold text-slate-300">
                        <span className={`px-1.5 py-0.5 rounded ${margin >= 30 ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'bg-slate-800 text-slate-300'}`}>
                          {margin}%
                        </span>
                      </td>
                    )}

                    {/* Stock Qty */}
                    <td className="py-3 px-4 text-center">
                      {isOutOfStock ? (
                        <span className="stock-pill out">Out of stock (0)</span>
                      ) : isLowStock ? (
                        <span className="stock-pill low">Low stock ({product.stockQty})</span>
                      ) : (
                        <span className="stock-pill in">{product.stockQty} in stock</span>
                      )}
                    </td>

                    {/* Status */}
                    <td className="py-3 px-4 text-center">
                      <span className={`status-pill ${product.status === 'active' ? 'active' : 'inactive'}`}>
                        {product.status === 'active' ? 'Active' : 'Inactive'}
                      </span>
                    </td>

                    {/* Actions (Admin Only) */}
                    {activeRole === 'admin' && (
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleEdit(product)}
                            className="btn-icon-sm text-slate-400 hover:text-emerald-400"
                            title="Edit product"
                          >
                            <Edit size={15} />
                          </button>
                          <button
                            onClick={() => handleDelete(product.id, product.name)}
                            className="btn-icon-sm text-slate-400 hover:text-rose-400"
                            title="Delete product"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Add / Edit Product Modal */}
      <AddEditProductModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        editingProduct={editingProduct}
      />
    </div>
  );
}
