# TANK — POS & Retail Inventory MVP

> **Simple sales. Clear records. Better control.**  
> A modern, cloud-based sales, point-of-sale (POS), inventory, and business-record management system designed specifically for supermarkets, retail shops, and service businesses.

---

## 🚀 Key Features

- **⚡ Fast Point of Sale (POS)**:
  - **Long Search Bar** with integrated **Camera QR/Barcode Scanner Button** on the left side.
  - Interactive product catalog grid with stock indicators and one-click add to cart.
  - Hardware USB / Bluetooth barcode scanner listener.
- **📷 Embedded QR & Barcode Scanner**:
  - Live device camera scanning for 1D barcodes and 2D QR codes with aiming reticle.
  - Embedded into **POS Item Search** and **Product Upload** modal to automatically populate SKUs.
  - 1-Click interactive barcode simulation pad for testing without physical goods.
- **🛒 Rapid Checkout & Calculations**:
  - Support for **Cash**, **POS / Card Terminal**, **Direct Bank Transfer**, and **Split** payments.
  - Fast cash denomination buttons (+₦500, +₦1,000, +₦2,000, +₦5,000, +₦10,000, Exact) with real-time **Change to Return** calculation.
  - Discounts in flat currency (₦) or percentage (%).
- **🖨️ Thermal Receipt Preview & Print**:
  - Photorealistic thermal receipt preview with **80mm (Standard POS)** and **58mm (Mobile POS)** toggle.
  - Automatic `window.print()` styles formatted for thermal receipt printers.
- **🛡️ Strict Cashier Profit Masking**:
  - **Admin / Owner View**: Full access to Today's Gross Profit (`Revenue - COGS`), Cost Prices, Margins, and Reports.
  - **Cashier View**: Cashiers can **never** see gross profit, cost prices, or profit margins on the dashboard or End-of-Day reports.
- **📊 End-of-Day Sales Reports**:
  - Filter by date (Today, Yesterday, 7 Days, 30 Days) and Cashier.
  - Revenue, COGS (Admin), Gross Profit (Admin), payment method distribution, top-selling goods, and receipt reprint log.
- **👥 Cashier Management**:
  - Create unique Cashier IDs (`CSH-101`), set login PINs, and manage account statuses.
- **💎 Subscription & Pricing**:
  - Free Starter Plan (up to 30 products).
  - Premium Plan (₦80,000 / 360 days, unlimited products, 10 cashiers, cloud sync).

---

## 🛠️ Tech Stack

- **Frontend**: React 19, Vite
- **Styling**: Vanilla CSS Design System with custom tokens, glassmorphism, responsive POS grid, and print media rules.
- **Icons**: Lucide React
- **Scanning**: `html5-qrcode`
- **FX**: Web Audio API Sound Synthesizer, Canvas Confetti

---

## 💻 Getting Started

### Prerequisites
- Node.js (v18+)
- npm

### Installation & Run

```bash
# Install dependencies
npm install

# Start local development server
npm run dev

# Build for production
npm run build
```

Open [http://localhost:5173](http://localhost:5173) in your browser.
