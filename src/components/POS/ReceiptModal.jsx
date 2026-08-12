import React, { useState, useRef } from 'react';
import { 
  Printer, 
  Check, 
  X, 
  Share2, 
  ArrowRight, 
  Store, 
  Clock, 
  User, 
  CheckCircle,
  FileText
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { formatCurrency, formatDateTime } from '../../utils/formatters';

export default function ReceiptModal() {
  const { 
    isReceiptModalOpen, 
    setIsReceiptModalOpen, 
    currentReceiptSale, 
    settings,
    setActiveTab
  } = useStore();

  const [paperWidth, setPaperWidth] = useState(settings.printerWidth || '80mm'); // '80mm' | '58mm'
  const receiptRef = useRef(null);

  if (!isReceiptModalOpen || !currentReceiptSale) return null;

  const sale = currentReceiptSale;

  const handlePrint = () => {
    window.print();
  };

  const handleNextSale = () => {
    setIsReceiptModalOpen(false);
    setActiveTab('pos');
  };

  return (
    <div className="modal-backdrop receipt-modal-wrapper">
      <div className="modal-card receipt-dialog animate-scale-in">
        {/* Modal Top Bar */}
        <div className="modal-header print:hidden">
          <div className="modal-title-with-icon">
            <div className="icon-badge primary">
              <Printer size={20} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Receipt Preview</h2>
              <p className="text-xs text-muted">Ready to print to connected thermal or standard printer</p>
            </div>
          </div>

          {/* Paper format switcher */}
          <div className="flex items-center gap-2">
            <div className="paper-size-switch bg-slate-800 p-0.5 rounded-lg border border-slate-700 flex text-xs">
              <button
                type="button"
                onClick={() => setPaperWidth('80mm')}
                className={`px-2.5 py-1 rounded font-semibold transition-colors ${paperWidth === '80mm' ? 'bg-emerald-600 text-white' : 'text-slate-400'}`}
              >
                80mm Thermal
              </button>
              <button
                type="button"
                onClick={() => setPaperWidth('58mm')}
                className={`px-2.5 py-1 rounded font-semibold transition-colors ${paperWidth === '58mm' ? 'bg-emerald-600 text-white' : 'text-slate-400'}`}
              >
                58mm Mini
              </button>
            </div>

            <button 
              onClick={() => setIsReceiptModalOpen(false)}
              className="btn-icon text-muted hover:text-white"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Printable Thermal Receipt Slip */}
        <div className="receipt-scroll-area">
          <div 
            ref={receiptRef}
            id="printable-receipt"
            className={`thermal-receipt-slip ${paperWidth === '58mm' ? 'width-58mm' : 'width-80mm'}`}
          >
            {/* Serrated top edge decor */}
            <div className="receipt-tear-edge top print:hidden"></div>

            {/* Business Header */}
            <div className="receipt-header text-center">
              <div className="receipt-store-logo">TANK</div>
              <h3 className="receipt-business-name font-bold text-black uppercase">{settings.businessName}</h3>
              <p className="receipt-meta-line text-xs">{settings.address}</p>
              <p className="receipt-meta-line text-xs">Tel: {settings.phone}</p>
              {settings.email && <p className="receipt-meta-line text-xs">{settings.email}</p>}
            </div>

            <div className="receipt-divider dashed"></div>

            {/* Transaction Meta */}
            <div className="receipt-meta-grid text-xs">
              <div className="flex justify-between">
                <span className="font-semibold">Receipt No:</span>
                <span className="font-mono">{sale.receiptNo}</span>
              </div>
              <div className="flex justify-between">
                <span>Date & Time:</span>
                <span>{formatDateTime(sale.createdAt)}</span>
              </div>
              <div className="flex justify-between">
                <span>Cashier:</span>
                <span>{sale.cashierName}</span>
              </div>
              {sale.customerName && sale.customerName !== 'Walk-in Customer' && (
                <div className="flex justify-between">
                  <span>Customer:</span>
                  <span>{sale.customerName}</span>
                </div>
              )}
            </div>

            <div className="receipt-divider dashed"></div>

            {/* Items Table */}
            <table className="receipt-items-table w-full text-xs">
              <thead>
                <tr className="border-b border-black text-left">
                  <th className="py-1">Item</th>
                  <th className="py-1 text-center">Qty</th>
                  <th className="py-1 text-right">Price</th>
                  <th className="py-1 text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                {sale.items.map((item, idx) => (
                  <tr key={idx} className="border-b border-dashed border-gray-300">
                    <td className="py-1 pr-1 font-medium">{item.name}</td>
                    <td className="py-1 text-center font-mono">{item.quantity}</td>
                    <td className="py-1 text-right font-mono">{formatCurrency(item.sellingPriceSnapshot, settings.currency)}</td>
                    <td className="py-1 text-right font-mono font-semibold">{formatCurrency(item.lineTotal, settings.currency)}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="receipt-divider dashed"></div>

            {/* Totals Section */}
            <div className="receipt-totals-section text-xs space-y-1">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span className="font-mono">{formatCurrency(sale.subtotal, settings.currency)}</span>
              </div>
              {sale.discount > 0 && (
                <div className="flex justify-between">
                  <span>Discount:</span>
                  <span className="font-mono">-{formatCurrency(sale.discount, settings.currency)}</span>
                </div>
              )}
              <div className="receipt-divider solid"></div>
              <div className="flex justify-between font-bold text-sm">
                <span>TOTAL:</span>
                <span className="font-mono text-base">{formatCurrency(sale.total, settings.currency)}</span>
              </div>
              <div className="receipt-divider solid"></div>
              <div className="flex justify-between pt-1">
                <span>Payment Method:</span>
                <span className="font-semibold uppercase">{sale.paymentMethod}</span>
              </div>
              {sale.paymentMethod === 'Cash' && (
                <>
                  <div className="flex justify-between">
                    <span>Amount Paid:</span>
                    <span className="font-mono">{formatCurrency(sale.amountTendered, settings.currency)}</span>
                  </div>
                  <div className="flex justify-between font-semibold">
                    <span>Change Returned:</span>
                    <span className="font-mono">{formatCurrency(sale.changeReturned, settings.currency)}</span>
                  </div>
                </>
              )}
            </div>

            <div className="receipt-divider dashed"></div>

            {/* Store Greeting & Barcode */}
            <div className="receipt-footer text-center space-y-2">
              <p className="receipt-greeting text-xs italic font-serif">
                "{settings.receiptGreeting || 'Thank you for your business!'}"
              </p>
              
              {/* Simulated Thermal Barcode Graphic */}
              <div className="thermal-barcode-box py-1">
                <div className="barcode-lines">
                  || | ||| || |||| | || ||| || |||| ||| || ||| |
                </div>
                <div className="text-[10px] font-mono tracking-widest mt-0.5">{sale.receiptNo}</div>
              </div>

              <div className="text-[10px] text-gray-500">
                Powered by TANK — Simple Sales Cloud
              </div>
            </div>

            {/* Serrated bottom edge decor */}
            <div className="receipt-tear-edge bottom print:hidden"></div>
          </div>
        </div>

        {/* Modal Footer Controls */}
        <div className="modal-footer justify-between print:hidden">
          <button
            type="button"
            onClick={handleNextSale}
            className="btn btn-secondary flex items-center gap-2"
          >
            <CheckCircle size={17} />
            <span>New Sale / Next Customer</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="btn btn-primary px-6 flex items-center gap-2"
            >
              <Printer size={18} />
              <span>Print Receipt</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
