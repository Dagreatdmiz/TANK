# TANK — Cloud-Based POS, Sales & Inventory System

> **Simple sales. Clear records. Better control.**  
> A complete, modern cloud-based sales, point-of-sale (POS), inventory, and business-record management system designed specifically for supermarkets, retail shops, and service businesses.

---

## 🚀 Key Features

### 💻 Frontend (React + Vite + POS System)
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

### ⚙️ Backend (Fastify + Prisma + PostgreSQL)
- **Database Models**: Business, User, Cashier, Product, Sale, SaleItem, Subscription, Payment, AuditLog, Settings.
- **Auth & Roles**: JWT Bearer auth, bcrypt password hashing, Role-based permissions (`OWNER`, `MANAGER`, `CASHIER`).
- **REST Endpoints**:
  - `POST /auth/register`, `POST /auth/login`
  - `GET /products`, `POST /products`, `PATCH /products/:id`, `DELETE /products/:id` (Free 30-product enforcement)
  - `POST /sales`, `GET /sales`, `GET /sales/:id/receipt`
  - `GET /reports/summary`, `GET /dashboard` (Gross profit calculations)
  - `POST /subscription/activate` (360 days premium activation)

---

## 🛠️ Tech Stack

- **Frontend**: React 19, Vite, Lucide Icons, html5-qrcode, Web Audio API, Canvas Confetti
- **Backend**: Fastify, TypeScript, Prisma ORM, PostgreSQL, Zod, JWT
- **Design System**: Vanilla CSS Design System with glassmorphism, responsive grid, and `@media print` rules.

---

## 💻 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Frontend Development Server
```bash
npm run dev
# or npm run dev:frontend
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

### 3. Backend Server (Optional / Local API)
```bash
# Set up database & generate Prisma client
npm run prisma:generate
npm run prisma:migrate

# Start backend server
npm run dev:backend
```

### 4. Build for Production
```bash
npm run build
```
