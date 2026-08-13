import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { initialProducts, initialCashiers, initialSales, initialSettings, initialSubscription } from '../data/mockData';
import { generateReceiptNo } from '../utils/formatters';
import { sound } from '../utils/audio';

const StoreContext = createContext(null);

export function StoreProvider({ children }) {
  // 1. Settings State
  const [settings, setSettings] = useState(() => {
    const saved = localStorage.getItem('tank_settings');
    return saved ? JSON.parse(saved) : initialSettings;
  });

  // 2. Subscription State
  const [subscription, setSubscription] = useState(() => {
    const saved = localStorage.getItem('tank_subscription');
    return saved ? JSON.parse(saved) : initialSubscription;
  });

  // 3. Cashiers State
  const [cashiers, setCashiers] = useState(() => {
    const saved = localStorage.getItem('tank_cashiers');
    return saved ? JSON.parse(saved) : initialCashiers;
  });

  // 4. Role & Current User State: 'admin' | 'cashier'
  const [activeRole, setActiveRole] = useState(() => {
    const saved = localStorage.getItem('tank_active_role');
    return saved || 'admin';
  });

  const [activeCashierId, setActiveCashierId] = useState(() => {
    const saved = localStorage.getItem('tank_active_cashier_id');
    return saved || (initialCashiers[0]?.id ?? '');
  });

  // Active cashier object
  const activeCashier = useMemo(() => {
    return cashiers.find(c => c.id === activeCashierId) || cashiers[0] || {
      id: 'csh_default',
      cashierCode: 'CSH-101',
      name: 'Default Cashier',
      role: 'cashier',
    };
  }, [cashiers, activeCashierId]);

  // 5. Products State
  const [products, setProducts] = useState(() => {
    const saved = localStorage.getItem('tank_products');
    return saved ? JSON.parse(saved) : initialProducts;
  });

  // 6. Sales History State
  const [sales, setSales] = useState(() => {
    const saved = localStorage.getItem('tank_sales');
    return saved ? JSON.parse(saved) : initialSales;
  });

  // 7. Navigation Tab State
  const [activeTab, setActiveTab] = useState('pos'); // 'pos' | 'products' | 'reports' | 'cashiers' | 'settings' | 'subscription'

  // 8. Active Cart State
  const [cart, setCart] = useState([]);
  const [discountType, setDiscountType] = useState('fixed'); // 'fixed' | 'percent'
  const [discountValue, setDiscountValue] = useState(0);

  // 9. Modals State
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  const [currentReceiptSale, setCurrentReceiptSale] = useState(null);
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
  const [isQRScannerOpen, setIsQRScannerOpen] = useState(false);
  const [scannerTargetMode, setScannerTargetMode] = useState('pos'); // 'pos' (add to cart/find) or 'upload' (populate sku)
  const [onScanCallback, setOnScanCallback] = useState(null);
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);

  // 10. Sync simulation
  const [syncStatus, setSyncStatus] = useState('synced'); // 'synced' | 'syncing'

  // Persistent storage hooks
  useEffect(() => {
    localStorage.setItem('tank_settings', JSON.stringify(settings));
    if (settings?.theme === 'dark') {
      document.body.classList.add('theme-dark');
      document.body.classList.remove('theme-light');
    } else {
      document.body.classList.add('theme-light');
      document.body.classList.remove('theme-dark');
    }
  }, [settings]);


  const toggleTheme = () => {
    setSettings(prev => ({
      ...prev,
      theme: prev.theme === 'light' ? 'dark' : 'light'
    }));
  };


  useEffect(() => {
    localStorage.setItem('tank_subscription', JSON.stringify(subscription));
  }, [subscription]);

  useEffect(() => {
    localStorage.setItem('tank_cashiers', JSON.stringify(cashiers));
  }, [cashiers]);

  useEffect(() => {
    localStorage.setItem('tank_products', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem('tank_sales', JSON.stringify(sales));
  }, [sales]);

  useEffect(() => {
    localStorage.setItem('tank_active_role', activeRole);
  }, [activeRole]);

  useEffect(() => {
    localStorage.setItem('tank_active_cashier_id', activeCashierId);
  }, [activeCashierId]);

  // Role switching
  const switchRole = (newRole, cashierId = null) => {
    setActiveRole(newRole);
    if (cashierId) {
      setActiveCashierId(cashierId);
    }
    // If cashier switches and was on admin-only tab, send to POS
    if (newRole === 'cashier' && ['cashiers', 'settings', 'subscription'].includes(activeTab)) {
      setActiveTab('pos');
    }
  };

  // Cart calculations
  const cartTotals = useMemo(() => {
    const subtotal = cart.reduce((acc, item) => acc + (item.product.sellingPrice * item.quantity), 0);
    const totalUnits = cart.reduce((acc, item) => acc + item.quantity, 0);
    
    let discountAmount = 0;
    if (discountType === 'percent') {
      discountAmount = (subtotal * (Number(discountValue) || 0)) / 100;
    } else {
      discountAmount = Number(discountValue) || 0;
    }
    discountAmount = Math.min(discountAmount, subtotal);

    const total = Math.max(0, subtotal - discountAmount);

    return {
      subtotal,
      discountAmount,
      total,
      itemCount: cart.length,
      totalUnits,
    };
  }, [cart, discountType, discountValue]);

  // Cart Operations
  const addToCart = (product, quantity = 1) => {
    if (!product || product.stockQty <= 0) return false;

    setCart(prev => {
      const existingIndex = prev.findIndex(item => item.product.id === product.id);
      if (existingIndex >= 0) {
        const updated = [...prev];
        const newQty = updated[existingIndex].quantity + quantity;
        if (newQty > product.stockQty) {
          alert(`Cannot add more than available stock (${product.stockQty}) for ${product.name}`);
          return prev;
        }
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: newQty,
          lineTotal: newQty * product.sellingPrice,
        };
        return updated;
      } else {
        return [
          ...prev,
          {
            product,
            quantity: Math.min(quantity, product.stockQty),
            lineTotal: Math.min(quantity, product.stockQty) * product.sellingPrice,
          },
        ];
      }
    });

    sound.playAddPop();
    return true;
  };

  const updateCartQty = (productId, newQty) => {
    if (newQty <= 0) {
      removeFromCart(productId);
      return;
    }

    setCart(prev => {
      return prev.map(item => {
        if (item.product.id === productId) {
          if (newQty > item.product.stockQty) {
            alert(`Only ${item.product.stockQty} items available in stock!`);
            return item;
          }
          return {
            ...item,
            quantity: newQty,
            lineTotal: newQty * item.product.sellingPrice,
          };
        }
        return item;
      });
    });
  };

  const removeFromCart = (productId) => {
    setCart(prev => prev.filter(item => item.product.id !== productId));
    sound.playRemoveTone();
  };

  const clearCart = () => {
    setCart([]);
    setDiscountValue(0);
  };

  // Product Operations
  const addProduct = (productData) => {
    // Check free plan limits
    if (subscription.plan === 'free' && products.length >= subscription.productLimit) {
      setIsUpgradeModalOpen(true);
      return {
        success: false,
        reason: 'LIMIT_REACHED',
        message: `Free plan is limited to ${subscription.productLimit} products. Please upgrade to Premium for unlimited products!`,
      };
    }

    const newProduct = {
      id: `prod_${Date.now()}`,
      status: 'active',
      image: '📦',
      lowStockThreshold: 10,
      ...productData,
      costPrice: Number(productData.costPrice) || 0,
      sellingPrice: Number(productData.sellingPrice) || 0,
      stockQty: Number(productData.stockQty) || 0,
    };

    setProducts(prev => [newProduct, ...prev]);
    simulateCloudSync();
    return { success: true, product: newProduct };
  };

  const updateProduct = (id, updatedFields) => {
    setProducts(prev => prev.map(p => {
      if (p.id === id) {
        return {
          ...p,
          ...updatedFields,
          costPrice: Number(updatedFields.costPrice ?? p.costPrice),
          sellingPrice: Number(updatedFields.sellingPrice ?? p.sellingPrice),
          stockQty: Number(updatedFields.stockQty ?? p.stockQty),
        };
      }
      return p;
    }));
    simulateCloudSync();
    return { success: true };
  };

  const deleteProduct = (id) => {
    setProducts(prev => prev.filter(p => p.id !== id));
    simulateCloudSync();
  };

  // Cashier Operations
  const addCashier = (cashierData) => {
    if (cashiers.length >= subscription.maxCashiers) {
      return {
        success: false,
        message: `Maximum allowed cashiers (${subscription.maxCashiers}) reached.`,
      };
    }

    const newCashier = {
      id: `csh_${Date.now()}`,
      status: 'active',
      role: 'cashier',
      createdAt: new Date().toISOString(),
      ...cashierData,
    };

    setCashiers(prev => [...prev, newCashier]);
    simulateCloudSync();
    return { success: true, cashier: newCashier };
  };

  const updateCashier = (id, data) => {
    setCashiers(prev => prev.map(c => c.id === id ? { ...c, ...data } : c));
    simulateCloudSync();
  };

  const toggleCashierStatus = (id) => {
    setCashiers(prev => prev.map(c => {
      if (c.id === id) {
        const newStatus = c.status === 'active' ? 'inactive' : 'active';
        return { ...c, status: newStatus };
      }
      return c;
    }));
    simulateCloudSync();
  };

  // Complete Sale transaction
  const completeSale = ({ paymentMethod, amountTendered, customerName = 'Walk-in Customer' }) => {
    if (cart.length === 0) return null;

    const receiptNo = generateReceiptNo();
    const now = new Date().toISOString();

    // Line items with historical price snapshots
    let saleCostTotal = 0;
    const saleItems = cart.map(item => {
      const lineCost = item.product.costPrice * item.quantity;
      saleCostTotal += lineCost;
      return {
        productId: item.product.id,
        name: item.product.name,
        sku: item.product.sku,
        quantity: item.quantity,
        costPriceSnapshot: item.product.costPrice,
        sellingPriceSnapshot: item.product.sellingPrice,
        lineTotal: item.lineTotal,
      };
    });

    const subtotal = cartTotals.subtotal;
    const discount = cartTotals.discountAmount;
    const total = cartTotals.total;
    const grossProfit = total - saleCostTotal; // Crucial Gross Profit equation: Total Selling Revenue - Total COGS

    const tendered = Number(amountTendered) || total;
    const change = Math.max(0, tendered - total);

    const cashierInfo = activeRole === 'admin' 
      ? { id: 'admin_owner', name: settings.ownerName || 'Owner (Admin)' }
      : { id: activeCashier.id, name: activeCashier.name };

    const newSale = {
      id: `sale_${Date.now()}`,
      receiptNo,
      cashierId: cashierInfo.id,
      cashierName: cashierInfo.name,
      createdAt: now,
      items: saleItems,
      subtotal,
      discount,
      total,
      costTotal: saleCostTotal,
      grossProfit,
      paymentMethod,
      amountTendered: tendered,
      changeReturned: change,
      customerName,
    };

    // Deduct stock
    setProducts(prevProducts => {
      return prevProducts.map(prod => {
        const cartItem = cart.find(c => c.product.id === prod.id);
        if (cartItem) {
          const remainingStock = Math.max(0, prod.stockQty - cartItem.quantity);
          return { ...prod, stockQty: remainingStock };
        }
        return prod;
      });
    });

    // Save sale
    setSales(prev => [newSale, ...prev]);

    // Clear cart
    clearCart();

    // Sound effect
    sound.playSuccessChime();

    // Simulate Cloud sync
    simulateCloudSync();

    // Open receipt modal
    setCurrentReceiptSale(newSale);
    setIsCheckoutModalOpen(false);
    setIsReceiptModalOpen(true);

    return newSale;
  };

  // Subscription upgrade
  const upgradeSubscription = () => {
    const updated = {
      plan: 'premium',
      productLimit: 999999,
      maxCashiers: 10,
      priceNGN: 80000,
      priceUSD: 65,
      durationDays: 360,
      activatedAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 360 * 86400000).toISOString(),
      status: 'active',
      reference: `TANK-PREM-${Math.floor(100000 + Math.random() * 900000)}`,
    };
    setSubscription(updated);
    setIsUpgradeModalOpen(false);
    simulateCloudSync();
  };

  // Cloud Sync simulation
  const simulateCloudSync = () => {
    setSyncStatus('syncing');
    setTimeout(() => {
      setSyncStatus('synced');
    }, 600);
  };

  // QR Scanner opener helper
  const openQRScanner = (mode = 'pos', callback = null) => {
    setScannerTargetMode(mode);
    setOnScanCallback(() => callback);
    setIsQRScannerOpen(true);
  };

  const handleScanSuccess = (decodedText) => {
    sound.playScanBeep();
    setIsQRScannerOpen(false);

    if (scannerTargetMode === 'pos') {
      // Find product by SKU or name
      const matched = products.find(p => p.sku === decodedText || p.name.toLowerCase().includes(decodedText.toLowerCase()));
      if (matched) {
        addToCart(matched, 1);
      } else {
        alert(`Product with barcode "${decodedText}" not found in inventory.`);
      }
    } else if (onScanCallback) {
      onScanCallback(decodedText);
    }
  };

  const value = {
    settings,
    setSettings,
    toggleTheme,
    subscription,
    cashiers,
    activeRole,
    activeCashierId,
    activeCashier,
    switchRole,
    products,
    addProduct,
    updateProduct,
    deleteProduct,
    cart,
    addToCart,
    updateCartQty,
    removeFromCart,
    clearCart,
    discountType,
    setDiscountType,
    discountValue,
    setDiscountValue,
    cartTotals,
    sales,
    completeSale,
    addCashier,
    updateCashier,
    toggleCashierStatus,
    upgradeSubscription,
    syncStatus,
    activeTab,
    setActiveTab,
    isReceiptModalOpen,
    setIsReceiptModalOpen,
    currentReceiptSale,
    setCurrentReceiptSale,
    isCheckoutModalOpen,
    setIsCheckoutModalOpen,
    isQRScannerOpen,
    setIsQRScannerOpen,
    openQRScanner,
    handleScanSuccess,
    isUpgradeModalOpen,
    setIsUpgradeModalOpen,
  };

  return (
    <StoreContext.Provider value={value}>
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
}
