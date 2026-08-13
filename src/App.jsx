import React from 'react';
import { StoreProvider, useStore } from './context/StoreContext';
import Header from './components/Header';
import POSDashboard from './components/POS/POSDashboard';
import ProductManagement from './components/Products/ProductManagement';
import SalesReport from './components/Reports/SalesReport';
import CashierManagement from './components/Cashiers/CashierManagement';
import StoreSettings from './components/Settings/StoreSettings';
import { SubscriptionView } from './components/Subscription/SubscriptionModal';
import QRScannerModal from './components/Scanner/QRScannerModal';
import CheckoutModal from './components/POS/CheckoutModal';
import ReceiptModal from './components/POS/ReceiptModal';
import SubscriptionModal from './components/Subscription/SubscriptionModal';

function MainAppContent() {
  const { activeTab, activeRole } = useStore();

  return (
    <div className="app-layout min-h-screen flex flex-col font-sans antialiased selection:bg-emerald-500 selection:text-white">

      {/* Header Bar */}
      <Header />

      {/* Main Page Content Body */}
      <main className="flex-1 overflow-y-auto">
        {activeTab === 'pos' && <POSDashboard />}
        {activeTab === 'products' && <ProductManagement />}
        {activeTab === 'reports' && <SalesReport />}
        
        {/* Admin only views */}
        {activeRole === 'admin' && activeTab === 'cashiers' && <CashierManagement />}
        {activeRole === 'admin' && activeTab === 'settings' && <StoreSettings />}
        {activeRole === 'admin' && activeTab === 'subscription' && <SubscriptionView />}
      </main>

      {/* Global Modals */}
      <QRScannerModal />
      <CheckoutModal />
      <ReceiptModal />
      <SubscriptionModal />
    </div>
  );
}

export default function App() {
  return (
    <StoreProvider>
      <MainAppContent />
    </StoreProvider>
  );
}
